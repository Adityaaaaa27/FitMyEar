# main.py
from fastapi import FastAPI
from pydantic import BaseModel
import base64, io, json

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

MODEL_PATH = "ear_classifier_mobilenet_v2.pt"
CLASS_MAP_PATH = "class_mapping.json"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- load class map ---
with open(CLASS_MAP_PATH, "r") as f:
    class_to_idx = json.load(f)

idx_to_class = {v: k for k, v in class_to_idx.items()}
EAR_INDEX = class_to_idx["ear"]

# --- build model & load weights ---
model = models.mobilenet_v2(pretrained=False)
model.classifier[1] = nn.Linear(1280, 2)
state_dict = torch.load(MODEL_PATH, map_location=device)
model.load_state_dict(state_dict)
model.to(device)
model.eval()

# --- same transforms as training (no augmentation) ---
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

class ImagePayload(BaseModel):
    image_base64: str

app = FastAPI()

@app.post("/validate-ear")
def validate_ear(payload: ImagePayload):
    # base64 -> PIL image
    img_bytes = base64.b64decode(payload.image_base64)
    image = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    x = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]

    ear_conf = float(probs[EAR_INDEX].item())
    pred_idx = int(torch.argmax(probs).item())
    pred_class = idx_to_class[pred_idx]

    # threshold – can tune; start with 0.80
    is_ear = (pred_class == "ear") and (ear_conf >= 0.80)

    return {
        "predictedClass": pred_class,
        "earConfidence": ear_conf,
        "isEar": is_ear,
    }
