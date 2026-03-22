@echo off
chcp 65001 >nul
cls
echo ================================================
echo   cpolar内网穿透启动程序 (简化版)
echo ================================================
echo.

set CPOLAR_PATH=E:\cpolar\cpolar\cpolar.exe
set FRONTEND_PORT=3000
set BACKEND_PORT=5001

echo [1] 检查端口...
netstat -ano | findstr ":%FRONTEND_PORT% " > nul
if %errorlevel% equ 0 (
    echo 端口 %FRONTEND_PORT% 已被占用，将使用3099端口...
    set FRONTEND_PORT=3099
)

netstat -ano | findstr ":%BACKEND_PORT% " > nul
if %errorlevel% equ 0 (
    echo 端口 %BACKEND_PORT% 已被占用，将使用5099端口...
    set BACKEND_PORT=5099
)

echo 前端端口: %FRONTEND_PORT%
echo 后端端口: %BACKEND_PORT%

echo [2] 检查cpolar...
if not exist "%CPOLAR_PATH%" (
    echo cpolar程序不存在，请确认安装路径！
    pause
    exit /b 1
)

echo [3] 结束旧进程...
taskkill /f /im cpolar.exe 2>nul
timeout /t 2 >nul

echo [4] 启动内网穿透...

REM 获取本机IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r "IPv4.*172\."') do set LOCAL_IP=%%a
set LOCAL_IP=%LOCAL_IP:~1%
if "%LOCAL_IP%"=="" (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r "IPv4.*192\."') do set LOCAL_IP=%%a
    set LOCAL_IP=%LOCAL_IP:~1%
)
echo 本地IP: %LOCAL_IP%

echo 启动前端穿透...
start cmd /k "title cpolar-frontend && cd /d E:\cpolar\cpolar && E:\cpolar\cpolar\cpolar.exe http %FRONTEND_PORT%"

echo 等待5秒...
timeout /t 5 >nul

echo 启动后端穿透...
start cmd /k "title cpolar-backend && cd /d E:\cpolar\cpolar && E:\cpolar\cpolar\cpolar.exe http %BACKEND_PORT%"

echo.
echo ================================================
echo                  启动完成!
echo ================================================
echo.
echo  本地前端: http://localhost:%FRONTEND_PORT%
echo  本地IP前端: http://%LOCAL_IP%:%FRONTEND_PORT%
echo  本地后端: http://localhost:%BACKEND_PORT%
echo  穿透地址: 请查看cpolar窗口显示的URL
echo.
pause 