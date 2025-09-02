@echo off
echo 🚀 Starting StyleHub E-commerce Website...
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Start backend server
echo.
echo 🔧 Starting backend server on port 5001...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend server
echo.
echo 🎨 Starting frontend server on port 3000...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 🎉 StyleHub is now starting!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5001
echo 🔗 Health Check: http://localhost:5001/health
echo.
echo Both servers are now running in separate windows.
echo Close the command windows to stop the servers.
echo.
pause

