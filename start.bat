@echo off
echo ==================================================
echo   INDUSTRIAL DAMAGE DETECTION SYSTEM - IDDS v1.0
echo ==================================================

echo.
echo [1/3] Installing backend dependencies...
cd backend
pip install -r requirements.txt
echo.

echo [2/3] Starting FastAPI backend on port 8000...
start "IDDS Backend" cmd /k "uvicorn main:app --reload --port 8000"

echo [3/3] Installing and starting React frontend...
cd ..\frontend
call npm install
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
start "IDDS Frontend" cmd /k "npm start"

echo Both services started. Close the terminal windows to stop.
pause
