from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import predict

app = FastAPI(
    title="Industrial Damage Detection API",
    description="AI-Powered Product Damage Detection System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://product-damage-detection.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="/api", tags=["Prediction"])

@app.get("/")
def root():
    return {"status": "ONLINE", "system": "Industrial Damage Detection System", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "HEALTHY", "message": "System operational"}
