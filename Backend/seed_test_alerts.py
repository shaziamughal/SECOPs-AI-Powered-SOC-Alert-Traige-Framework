#!/usr/bin/env python3
"""
Quick script to seed test alerts into the database for development/demo purposes.
Run this once to populate the alerts table with sample data.
"""

from datetime import datetime, timedelta, timezone
from db import SessionLocal
from app_models import Alert

# Sample alert templates
SAMPLE_ALERTS = [
    {
        "external_alert_id": "wazuh-001-brute-force",
        "timestamp": datetime.now(timezone.utc) - timedelta(hours=2),
        "rule_id": "5710",
        "rule_level": 10,
        "severity": "high",
        "rule_description": "Multiple authentication failures detected",
        "source_ip": "192.168.1.100",
        "agent_name": "agent-01",
        "status": "new",
        "raw_data": {
            "srcip": "192.168.1.100",
            "user": "admin",
            "location": "/var/log/auth.log",
            "attempts": 15,
        },
    },
    {
        "external_alert_id": "wazuh-002-malware",
        "timestamp": datetime.now(timezone.utc) - timedelta(hours=1),
        "rule_id": "100002",
        "rule_level": 12,
        "severity": "critical",
        "rule_description": "Malware signature detected in file",
        "source_ip": "192.168.1.50",
        "agent_name": "agent-02",
        "status": "new",
        "raw_data": {
            "file": "/tmp/suspicious.exe",
            "hash": "5d41402abc4b2a76b9719d911017c592",
            "signature": "Trojan.Generic.A",
        },
    },
    {
        "external_alert_id": "wazuh-003-update",
        "timestamp": datetime.now(timezone.utc) - timedelta(hours=3),
        "rule_id": "1002",
        "rule_level": 2,
        "severity": "low",
        "rule_description": "System update applied",
        "source_ip": "192.168.1.200",
        "agent_name": "agent-03",
        "status": "new",
        "raw_data": {
            "package": "openssl-1.1.1",
            "action": "updated",
            "version_before": "1.1.0",
            "version_after": "1.1.1",
        },
    },
    {
        "external_alert_id": "wazuh-004-port-scan",
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=30),
        "rule_id": "5202",
        "rule_level": 9,
        "severity": "medium",
        "rule_description": "Port scanning activity detected",
        "source_ip": "203.0.113.45",
        "agent_name": "agent-04",
        "status": "new",
        "raw_data": {
            "scanned_ports": ["22", "80", "443", "3306"],
            "packets": 150,
            "destination": "192.168.1.0/24",
        },
    },
    {
        "external_alert_id": "wazuh-005-sqlinjection",
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=15),
        "rule_id": "31601",
        "rule_level": 11,
        "severity": "critical",
        "rule_description": "SQL injection attack attempt",
        "source_ip": "198.51.100.20",
        "agent_name": "web-agent-01",
        "status": "new",
        "raw_data": {
            "url": "/api/users?id=1' OR '1'='1",
            "method": "GET",
            "response_code": 403,
            "detection_engine": "ModSecurity",
        },
    },
    {
        "external_alert_id": "wazuh-006-rdp-bruteforce",
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=12),
        "rule_id": "60204",
        "rule_level": 10,
        "severity": "high",
        "rule_description": "RDP brute force activity detected",
        "source_ip": "203.0.113.87",
        "agent_name": "windows-agent-07",
        "status": "new",
        "raw_data": {
            "target_port": 3389,
            "failed_logins": 27,
            "username": "administrator",
            "source_country": "unknown",
        },
    },
    {
        "external_alert_id": "wazuh-007-suspicious-powershell",
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=10),
        "rule_id": "18106",
        "rule_level": 9,
        "severity": "medium",
        "rule_description": "Suspicious PowerShell command execution",
        "source_ip": "192.168.1.77",
        "agent_name": "windows-agent-03",
        "status": "new",
        "raw_data": {
            "command": "powershell -enc SQBFAFgA...",
            "process": "powershell.exe",
            "parent_process": "winword.exe",
            "user": "corp\\jdoe",
        },
    },
    {
        "external_alert_id": "wazuh-008-privilege-escalation",
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=8),
        "rule_id": "60122",
        "rule_level": 12,
        "severity": "critical",
        "rule_description": "Potential privilege escalation detected",
        "source_ip": "10.20.30.44",
        "agent_name": "linux-agent-12",
        "status": "new",
        "raw_data": {
            "binary": "/usr/bin/sudo",
            "executed_as": "root",
            "invoking_user": "www-data",
            "tty": "pts/1",
        },
    },
    {
        "external_alert_id": "wazuh-009-data-exfiltration",
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=6),
        "rule_id": "91015",
        "rule_level": 11,
        "severity": "high",
        "rule_description": "Possible data exfiltration over DNS tunneling",
        "source_ip": "172.16.50.19",
        "agent_name": "dns-gateway-01",
        "status": "new",
        "raw_data": {
            "queried_domain": "x4f9k2b7-data.sync-example.net",
            "query_count_5m": 1240,
            "avg_label_length": 41,
            "transport": "udp",
        },
    },
    {
        "external_alert_id": "wazuh-010-webshell-indicator",
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=4),
        "rule_id": "31168",
        "rule_level": 10,
        "severity": "high",
        "rule_description": "Webshell indicator found in uploads directory",
        "source_ip": "198.51.100.142",
        "agent_name": "web-agent-02",
        "status": "new",
        "raw_data": {
            "file_path": "/var/www/html/uploads/cache.php",
            "md5": "e2fc714c4727ee9395f324cd2e7f331f",
            "trigger": "eval(base64_decode())",
            "scanner": "yara",
        },
    },
]


def seed_alerts():
    """Insert sample alerts into database."""
    db = SessionLocal()
    try:
        existing_external_ids = {
            row[0]
            for row in db.query(Alert.external_alert_id).all()
            if row[0]
        }

        inserted_count = 0
        skipped_count = 0

        # Create only alerts not already present, keyed by external_alert_id.
        for alert_data in SAMPLE_ALERTS:
            if alert_data["external_alert_id"] in existing_external_ids:
                skipped_count += 1
                continue
            alert = Alert(**alert_data)
            db.add(alert)
            inserted_count += 1

        db.commit()
        print(
            f"✓ Inserted {inserted_count} sample alerts "
            f"({skipped_count} already existed)."
        )
        print("\nSample alerts created:")
        for sample in SAMPLE_ALERTS:
            if sample["external_alert_id"] not in existing_external_ids:
                print(f"  - {sample['rule_description']} (severity: {sample['severity']})")

    except Exception as e:
        db.rollback()
        print(f"✗ Error inserting sample alerts: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_alerts()
