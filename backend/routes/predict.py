from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from services.prediction_service import run_prediction

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Accepted: JPEG, PNG, WEBP, BMP"
        )

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds 10MB limit"
        )

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Empty file received"
        )

    try:
        result = run_prediction(image_bytes)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction engine error: {str(e)}"
        )
