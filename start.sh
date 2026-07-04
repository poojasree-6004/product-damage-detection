#!/bin/bash
echo "=================================================="
echo "  INDUSTRIAL DAMAGE DETECTION SYSTEM - IDDS v1.0"
echo "=================================================="

# Start backend
echo ""
echo "[1/3] Installing backend dependencies..."
cd backend
pip install -r requirements.txt -q

echo "[2/3] Starting FastAPI backend on port 8000..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "[3/3] Installing frontend dependencies and starting React app..."
cd ../frontend
npm install --silent
npm start &
FRONTEND_PID=$!

echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Services stopped.'" SIGINT SIGTERM
wait
