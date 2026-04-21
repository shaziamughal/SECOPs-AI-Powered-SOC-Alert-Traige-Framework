import os
import time

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app_models import User
from app_schemas import AuthResponse, LoginRequest, UserResponse
from db import get_db
from services.auth import (
    COOKIE_NAME,
    create_session_token,
    get_current_user,
    session_cookie_max_age,
    session_cookie_samesite,
    session_cookie_secure,
    verify_password,
)

router = APIRouter()
_LOGIN_ATTEMPTS: dict[str, dict[str, float | int]] = {}


def _int_env(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


def _rate_limit_settings() -> tuple[int, int, int]:
    max_attempts = max(1, _int_env("LOGIN_MAX_ATTEMPTS", 5))
    window_seconds = max(30, _int_env("LOGIN_WINDOW_SECONDS", 300))
    lockout_seconds = max(30, _int_env("LOGIN_LOCKOUT_SECONDS", 900))
    return max_attempts, window_seconds, lockout_seconds


def _rate_limit_key(request: Request, username: str) -> str:
    client_ip = request.client.host if request.client else "unknown"
    return f"{client_ip}:{username.strip().lower()}"


def _check_login_rate_limit(key: str) -> None:
    now = time.time()
    state = _LOGIN_ATTEMPTS.get(key)
    if not state:
        return
    locked_until = float(state.get("locked_until", 0.0))
    if locked_until > now:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")


def _register_failed_login(key: str) -> None:
    now = time.time()
    max_attempts, window_seconds, lockout_seconds = _rate_limit_settings()
    state = _LOGIN_ATTEMPTS.get(key)

    if not state or float(state.get("window_start", 0.0)) + window_seconds < now:
        state = {"count": 0, "window_start": now, "locked_until": 0.0}

    count = int(state.get("count", 0)) + 1
    state["count"] = count

    if count >= max_attempts:
        state["locked_until"] = now + lockout_seconds

    _LOGIN_ATTEMPTS[key] = state


def _clear_login_attempts(key: str) -> None:
    _LOGIN_ATTEMPTS.pop(key, None)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    limiter_key = _rate_limit_key(request, payload.username)
    _check_login_rate_limit(limiter_key)

    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        _register_failed_login(limiter_key)
        raise HTTPException(status_code=401, detail="Invalid username or password")

    _clear_login_attempts(limiter_key)

    token = create_session_token(user)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite=session_cookie_samesite(),
        secure=session_cookie_secure(request),
        max_age=session_cookie_max_age(),
    )
    return AuthResponse(authenticated=True, user=UserResponse.model_validate(user))


@router.post("/logout", response_model=AuthResponse)
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return AuthResponse(authenticated=False, user=None)


@router.get("/me", response_model=AuthResponse)
def me(current_user: dict = Depends(get_current_user)):
    return AuthResponse(
        authenticated=True,
        user=UserResponse(
            id=current_user["id"],
            username=current_user["username"],
            display_name=current_user["display_name"],
            role=current_user["role"],
        ),
    )
