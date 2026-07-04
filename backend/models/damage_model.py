"""
Plug-and-play model for AI-Based Product Damage Detection System.

Works in 2 modes:
1. Simulation mode (if no model file present)
2. Real model mode (auto-activates when .keras folder is added)

Just drop your model at:
    backend/models/damage_model.keras/

And restart backend — DONE.
"""

import os
import random
import time
import base64
import io

from PIL import Image, ImageDraw, ImageFilter

# Optional torch imports (only used if model exists)
try:
    import torch
    import torch.nn as nn
    import torchvision.models as models
    from torchvision import transforms
except:
    torch = None

# Optional TensorFlow/Keras imports
try:
    import tensorflow as tf
    import numpy as np
except:
    tf = None
    np = None


# -------------------------
# GLOBALS
# -------------------------
device = None
transform = None

CLASSES = ["teared", "crushed", "cracked", "scratched", "undamaged"]

SEVERITY_MAP = {
    "teared": "high",
    "crushed": "high",
    "cracked": "medium",
    "scratched": "low",
    "undamaged": "none",
}


# -------------------------
# LOAD MODEL
# -------------------------
def load_model():
    global device, transform

    # Build absolute path to the .keras folder
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_dir = os.path.join(base_dir, "models", "damage_model.keras")

    config_path  = os.path.join(model_dir, "config.json")
    weights_path = os.path.join(model_dir, "model.weights.h5")

    if tf is not None and os.path.isdir(model_dir) and os.path.exists(config_path) and os.path.exists(weights_path):
        try:
            print("Loading model...")

            # Read architecture from config.json
            with open(config_path, "r", encoding="utf-8") as f:
                config_json = f.read()

            keras_model = tf.keras.models.model_from_json(config_json)

            # Load weights from model.weights.h5
            keras_model.load_weights(weights_path)

            print("Model loaded successfully")
            return keras_model

        except Exception as e:
            print(f"Error loading model: {e}")
            print("⚠️ Falling back to SIMULATION MODE.")
            return None

    # Fallback: try legacy .pth torch model
    model_path_pth = os.path.abspath(os.path.join("models", "damage_model.pth"))
    if torch is not None and os.path.exists(model_path_pth):
        print("✅ Loading REAL PyTorch model...")

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        model = models.mobilenet_v2(pretrained=False)
        model.classifier[1] = nn.Linear(model.last_channel, 2)

        model.load_state_dict(torch.load(model_path_pth, map_location=device))
        model.eval()
        model.to(device)

        transform = transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.ToTensor(),
        ])

        return model

    else:
        print("⚠️ Model not found. Running in SIMULATION MODE.")
        return None


# -------------------------
# PREDICTION FUNCTION
# -------------------------
def predict_image(image_bytes: bytes, model=None) -> dict:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        width, height = img.size
    except Exception:
        width, height = 640, 480
        img = Image.new("RGB", (width, height), color=(30, 30, 30))

    # =========================================
    # 🔥 REAL KERAS MODEL MODE
    # =========================================
    if model is not None and tf is not None and isinstance(model, tf.keras.Model):
        img_resized = img.resize((224, 224))
        img_array = np.array(img_resized, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        preds = model.predict(img_array)
        pred_index = int(np.argmax(preds[0]))
        confidence = float(preds[0][pred_index])

        damage_type = CLASSES[pred_index]
        severity = SEVERITY_MAP[damage_type]
        damage_detected = damage_type != "undamaged"

        if damage_detected:
            bx = int(width * 0.2)
            by = int(height * 0.2)
            bw = int(width * 0.4)
            bh = int(height * 0.4)
            bounding_boxes = [[bx, by, bw, bh]]
        else:
            bounding_boxes = []

    # =========================================
    # 🔥 REAL PYTORCH MODEL MODE
    # =========================================
    elif model is not None and torch is not None:
        input_img = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            output = model(input_img)
            probs = torch.softmax(output, dim=1)
            confidence, pred = torch.max(probs, 1)

        prediction = pred.item()
        confidence = float(confidence.item())

        if prediction == 0:
            damage_detected = True
            damage_type = "structural_damage"
            severity = "medium"
            bounding_boxes = [[int(width*0.3), int(height*0.3), int(width*0.3), int(height*0.3)]]
        else:
            damage_detected = False
            damage_type = "undamaged"
            severity = "none"
            bounding_boxes = []

    # =========================================
    # 🎭 SIMULATION MODE
    # =========================================
    else:
        time.sleep(0.6)

        rand = random.random()
        damage_detected = rand < 0.55

        if damage_detected:
            confidence = round(random.uniform(0.72, 0.97), 4)
            severity = random.choice(["low", "medium", "high"])
            damage_type = random.choice([
                "scratch",
                "fracture",
                "corrosion",
                "deformation",
                "impact_damage",
                "wear_pattern"
            ])

            bx = random.randint(int(width * 0.1), int(width * 0.35))
            by = random.randint(int(height * 0.1), int(height * 0.35))
            bw = random.randint(int(width * 0.2), int(width * 0.45))
            bh = random.randint(int(height * 0.2), int(height * 0.45))

            bounding_boxes = [[bx, by, bw, bh]]
        else:
            confidence = round(random.uniform(0.80, 0.99), 4)
            severity = "none"
            damage_type = "undamaged"
            bounding_boxes = []

    # -------------------------
    # Heatmap (still simulated)
    # -------------------------
    heatmap_b64 = _generate_heatmap(img, bounding_boxes)

    return {
        "damage_detected": damage_detected,
        "damage_type": damage_type,
        "severity": severity,
        "confidence": confidence,
        "bounding_boxes": bounding_boxes,
        "heatmap_base64": heatmap_b64,
    }


# -------------------------
# HEATMAP GENERATION
# -------------------------
def _generate_heatmap(img: Image.Image, bounding_boxes: list) -> str:
    w, h = img.size
    heatmap = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(heatmap)

    for bb in bounding_boxes:
        bx, by, bw, bh = bb
        cx, cy = bx + bw // 2, by + bh // 2

        for r in range(min(bw, bh) // 2, 0, -4):
            alpha = int(80 * (1 - r / (min(bw, bh) / 2)))
            draw.ellipse(
                [cx - r, cy - r, cx + r, cy + r],
                fill=(255, 40, 40, alpha)
            )

    heatmap = heatmap.filter(ImageFilter.GaussianBlur(radius=6))

    buf = io.BytesIO()
    heatmap.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")