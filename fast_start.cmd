@echo off
chcp 65001 >nul

echo 启动财赋思应用服务...
echo.
echo 1. 启动后端...
start "后端API" /D "%~dp0backend" cmd /k "color 0A & python run_dev_enhanced.py"

echo.
echo 2. 启动前端代理...
start "前端服务" /D "%~dp0" cmd /k "color 0B & node scripts\local\proxy-server.js 3001 5001"

echo.
echo 启动完成! 请访问: http://localhost:3001
echo. 