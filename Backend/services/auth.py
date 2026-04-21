import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Cookie, HTTPException, Request

from app_models import User

COOKIE_NAME = "soc_session"
PBKDF2_ITERATIONS = 100_000
WEAK_SECRET_VALUES = {"", "change-me-in-production", "secret", "password", "changeme"}


def _bool_env(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _secret_key() -> str:
    secret_key = os.getenv("SECRET_KEY", "").strip()
    if secret_key.lower() in WEAK_SECRET_VALUES or len(secret_key) < 32:
        raise RuntimeError("SECRET_KEY must be set and at least 32 characters long")
    return secret_key


def session_cookie_secure(request: Request) -> bool:
    configured = os.getenv("SESSION_COOKIE_SECURE")
    if configured is not None:
        return _bool_env("SESSION_COOKIE_SECURE", default=True)
    return request.url.scheme == "https"


def session_cookie_samesite() -> str:
    value = os.getenv("SESSION_COOKIE_SAMESITE", "lax").strip().lower()
    if value in {"lax", "strict", "none"}:
        return value
    return "lax"


def session_cookie_max_age() -> int:
    value = _int_env("SESSION_COOKIE_MAX_AGE_SECONDS", default=60 * 60 * 8)
    return max(300, min(value, 60 * 60 * 24 * 7))


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS,
    ).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, digest = stored_hash.split("$", 1)
    except ValueError:
        return False

    test_digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS,
    ).hex()
    return hmac.compare_digest(digest, test_digest)


def _sign(payload: str) -> str:
    return hmac.new(_secret_key().encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def create_session_token(user: User) -> str:
    payload = {
        "id": user.id,
        "username": user.username,
        "display_name": user.display_name,
        "role": user.role,
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=8)).timestamp()),
    }
    payload_json = json.dumps(payload, separators=(",", ":"))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode("utf-8")).decode("utf-8")
    signature = _sign(payload_b64)
    return f"{payload_b64}.{signature}"


def decode_session_token(token: str) -> dict:
    try:
        payload_b64, signature = token.split(".", 1)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Invalid session") from exc

    if not hmac.compare_digest(_sign(payload_b64), signature):
        raise HTTPException(status_code=401, detail="Invalid session")

    payload_json = base64.urlsafe_b64decode(payload_b64.encode("utf-8")).decode("utf-8")
    payload = json.loads(payload_json)
    if payload["exp"] < int(datetime.now(timezone.utc).timestamp()):
        raise HTTPException(status_code=401, detail="Session expired")
    return payload


def get_current_user(soc_session: str | None = Cookie(default=None, alias=COOKIE_NAME)) -> dict:
    if not soc_session:
        raise HTTPException(status_code=401, detail="Authentication required")
    return decode_session_token(soc_session)
