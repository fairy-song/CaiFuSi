@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 超简易代理+内网穿透启动程序
echo ================================================
echo.

set SCRIPT_DIR=%~dp0
set SUNNY_DIR=%SCRIPT_DIR%\sunnyNgrok
set FRONTEND_PORT=3000
set BACKEND_PORT=5001

REM 检查Sunny-Ngrok文件夹是否存在，如不存在则创建
if not exist "%SUNNY_DIR%" (
    echo [信息] 创建Sunny-Ngrok目录...
    mkdir "%SUNNY_DIR%"
)

REM 检查端口是否被占用
echo [1/4] 检查端口占用情况...
:CHECK_FRONTEND_PORT
netstat -ano | findstr ":%FRONTEND_PORT% " > nul
if %errorlevel% equ 0 (
    echo [提示] 端口 %FRONTEND_PORT% 已被占用，尝试使用下一个端口...
    set /a FRONTEND_PORT+=1
    goto CHECK_FRONTEND_PORT
)
echo [成功] 将使用前端端口: %FRONTEND_PORT%

:CHECK_BACKEND_PORT
netstat -ano | findstr ":%BACKEND_PORT% " > nul
if %errorlevel% equ 0 (
    echo [提示] 端口 %BACKEND_PORT% 已被占用，尝试使用下一个端口...
    set /a BACKEND_PORT+=1
    goto CHECK_BACKEND_PORT
)
echo [成功] 将使用后端端口: %BACKEND_PORT%

echo [2/4] 检查Sunny-Ngrok是否已下载...
if not exist "%SUNNY_DIR%\sunny.exe" (
    echo [提示] 未找到Sunny-Ngrok，请手动下载
    echo 下载地址: https://www.ngrok.cc/download.html
    echo.
    echo [提示] 请下载Windows版本的Sunny-Ngrok客户端，解压后将sunny.exe文件
    echo       复制到以下目录: %SUNNY_DIR%
    pause
    exit /b 1
) else (
    echo [提示] 发现Sunny-Ngrok已安装
)

echo [3/4] 配置Sunny-Ngrok隧道...
echo.
echo [提示] 使用Sunny-Ngrok需要隧道ID
echo 请访问: https://www.ngrok.cc/user.html 登录并创建隧道
echo 请创建一个隧道，本地端口设为 %FRONTEND_PORT%
echo.
set /p SUNNY_ID="请输入您的隧道ID: "

if "%SUNNY_ID%"=="" (
    echo [错误] 必须提供隧道ID
    pause
    exit /b 1
)

echo [4/4] 启动所有服务...
echo 启动后端服务...
start cmd /k "title 财赋思-后端服务 && color 0A && cd /d %SCRIPT_DIR% && python -m backend.run_dev"

echo 启动超简易代理服务器...
start cmd /k "title 财赋思-超简易代理 && color 0B && cd /d %SCRIPT_DIR% && node ultra-simple-proxy.js %FRONTEND_PORT% %BACKEND_PORT%"

echo 等待5秒，确保本地服务已启动...
timeout /t 5 >nul

echo 启动内网穿透...
start cmd /k "title 财赋思-内网穿透 && color 0E && cd /d %SUNNY_DIR% && sunny.exe clientid %SUNNY_ID%"

echo.
echo ================================================
echo                  启动完成!
echo ================================================
echo.
echo  本地前端+代理: http://localhost:%FRONTEND_PORT%
echo  本地后端: http://localhost:%BACKEND_PORT%
echo  穿透地址: 请查看Sunny-Ngrok窗口显示的转发URL
echo.
echo ================================================
echo                使用说明
echo ================================================
echo.
echo  1. 已启动后端API服务和超简易代理服务器
echo  2. 已配置Sunny-Ngrok进行内网穿透
echo  3. 使用Sunny-Ngrok显示的URL访问应用
echo  4. 现在应该可以正确显示前端界面
echo.
pause 