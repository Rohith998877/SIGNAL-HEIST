@echo off
title Signal Heist - Localhost Server
echo ===================================================
echo        SIGNAL HEIST: OVERDRIVE - LOCALHOST
echo ===================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js is detected!
    echo.
    echo Installing dependencies (Express, Socket.IO)...
    call npm install
    echo.
    echo Starting the online multiplayer server on localhost:3000...
    echo Open http://localhost:3000 in your browser.
    echo Press Ctrl+C to stop the server anytime.
    echo.
    call npm start
) else (
    echo [!] Node.js is NOT installed on this machine yet.
    echo     Download the installer here: https://nodejs.org
    echo.
    echo Starting instant Python localhost server instead...
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Serving Signal Heist on http://localhost:8000/local-prototype.html
        start http://localhost:8000/local-prototype.html
        python -m http.server 8000
    ) else (
        echo Launching browser directly...
        start local-prototype.html
    )
)
pause
