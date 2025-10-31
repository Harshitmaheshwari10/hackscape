@echo off
echo ==========================================
echo AI Demand Forecasting Dashboard Setup
echo ==========================================

REM Create virtual environment
echo Creating virtual environment...
python -m venv ai-dashboard-env

REM Activate virtual environment
echo Activating virtual environment...
call ai-dashboard-env\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo To run the application:
echo 1. ai-dashboard-env\Scripts\activate
echo 2. python run.py
echo 3. Open http://localhost:5000
echo.
pause
