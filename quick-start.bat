@echo off
echo ========================================
echo    SAFE PAWS - QUICK START SCRIPT
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found!
    echo Creating .env from template...
    (
        echo # Database (Supabase^)
        echo SUPABASE_URL=your_supabase_url_here
        echo SUPABASE_KEY=your_supabase_key_here
        echo.
        echo # Email (SendGrid^)
        echo SENDGRID_API_KEY=your_sendgrid_api_key_here
        echo SENDGRID_FROM_EMAIL=your_verified_email@example.com
        echo.
        echo # Server
        echo PORT=3000
        echo NODE_ENV=development
    ) > .env
    echo [CREATED] .env file created. Please edit it with your credentials.
    echo.
    notepad .env
    echo.
    echo Press any key after saving your credentials...
    pause >nul
)

echo [OK] .env file exists
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
    echo.
) else (
    echo [OK] Dependencies already installed
    echo.
)

REM Start the server
echo ========================================
echo    STARTING SAFE PAWS SERVER
echo ========================================
echo.
echo Server will start on: http://localhost:3000
echo Dashboard available at: http://localhost:3000/dashboard.html
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm start

pause