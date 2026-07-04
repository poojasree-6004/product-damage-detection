import hashlib
import time


def compute_file_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:16].upper()


def unix_to_iso(ts: float = None) -> str:
    if ts is None:
        ts = time.time()
    from datetime import datetime, timezone
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def format_confidence(confidence: float) -> str:
    return f"{confidence * 100:.1f}%"


def severity_to_code(severity: str) -> int:
    mapping = {"None": 0, "Low": 1, "Medium": 2, "High": 3}
    return mapping.get(severity, -1)
