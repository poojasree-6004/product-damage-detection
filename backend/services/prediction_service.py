from models.damage_model import load_model, predict_image
from datetime import datetime
import random
import string

# Load model once at startup
_model = None


def get_model():
    global _model
    if _model is None:
        _model = load_model()
    return _model


def run_prediction(image_bytes: bytes) -> dict:
    """
    Calls the model, maps its raw output into the UI-friendly response format,
    and attaches metadata.

    Raw model output format:
        {
            "damage_detected": bool,
            "damage_type": str,       # e.g. "undamaged", "scratch", "fracture"
            "severity": str,          # "none" | "low" | "medium" | "high"
            "confidence": float,      # 0.0 – 1.0
            "bounding_boxes": list,   # [] or [[x, y, w, h], ...]
            "heatmap_base64": str
        }

    Mapped UI response format:
        {
            "prediction": "Damaged" | "Safe",
            "confidence": float,         # percentage (0–100)
            "severity": str,             # "None" | "Low" | "Medium" | "High"
            "bounding_box": list | null, # [x, y, w, h] or null
            "damage_type": str,          # human-readable defect label
            "heatmap": str,              # base64 PNG string
            "structural_integrity": str,
            "risk_level": str,
            "scan_id": str,
            "timestamp": str
        }
    """
    model = get_model()
    raw = predict_image(image_bytes, model)

    # --- Mapping layer ---
    damage_detected: bool = raw.get("damage_detected", False)
    prediction = "Damaged" if damage_detected else "Safe"

    # confidence: 0.0–1.0 → percentage float
    confidence_raw = float(raw.get("confidence", 0.0))
    confidence_pct = round(confidence_raw * 100, 2)

    # severity: normalise to Title case
    severity_map = {
        "none": "None",
        "low": "Low",
        "medium": "Medium",
        "high": "High",
    }
    severity_raw = str(raw.get("severity", "none")).lower()
    severity = severity_map.get(severity_raw, "None")

    # bounding_box: first entry of bounding_boxes or null
    bounding_boxes = raw.get("bounding_boxes", [])
    bounding_box = bounding_boxes[0] if bounding_boxes else None

    # damage_type: convert snake_case to human label
    damage_type_raw = str(raw.get("damage_type", "undamaged"))
    damage_type = _humanise_damage_type(damage_type_raw)

    # heatmap
    heatmap = raw.get("heatmap_base64", "")

    # Derived fields for sidebar / integrity card
    structural_integrity = _calculate_integrity(severity, confidence_raw)
    risk_level = _calculate_risk(severity, confidence_raw)

    return {
        "prediction": prediction,
        "confidence": confidence_pct,
        "severity": severity,
        "bounding_box": bounding_box,
        "damage_type": damage_type,
        "heatmap": heatmap,
        "structural_integrity": structural_integrity,
        "risk_level": risk_level,
        "scan_id": _generate_scan_id(),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ── helpers ──────────────────────────────────────────────────────────────────

_DAMAGE_TYPE_LABELS = {
    "undamaged": "No Defect",
    "scratch": "Surface Scratch",
    "fracture": "Structural Fracture",
    "corrosion": "Corrosion Detected",
    "deformation": "Material Deformation",
    "impact_damage": "Impact Damage",
    "wear_pattern": "Wear Pattern Anomaly",
    "crack": "Surface Crack",
    "dent": "Dent / Indentation",
    "burn": "Thermal Burn Mark",
}


def _humanise_damage_type(raw: str) -> str:
    return _DAMAGE_TYPE_LABELS.get(raw.lower(), raw.replace("_", " ").title())


def _calculate_integrity(severity: str, confidence: float) -> str:
    if severity == "None":
        return "OPTIMAL"
    elif severity == "Low":
        return "STABLE" if confidence < 0.85 else "DEGRADED"
    elif severity == "Medium":
        return "COMPROMISED"
    else:
        return "CRITICAL"


def _calculate_risk(severity: str, confidence: float) -> str:
    if severity == "None":
        return "MINIMAL"
    elif severity == "Low":
        return "LOW"
    elif severity == "Medium":
        return "ELEVATED" if confidence < 0.85 else "HIGH"
    else:
        return "CRITICAL"


def _generate_scan_id() -> str:
    prefix = "SCN"
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=8))
    return f"{prefix}-{suffix}"
