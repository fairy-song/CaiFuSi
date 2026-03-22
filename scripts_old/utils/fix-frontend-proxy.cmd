@echo off
chcp 65001 >nul
cls
echo ================================================
echo     财赋思应用前端穿透修复工具
echo ================================================
echo.

set SCRIPT_DIR=%~dp0
set SUNNY_DIR=%SCRIPT_DIR%\sunnyNgrok

REM 检查前端应用端口
echo [1/4] 检查前端应用端口...
set DEFAULT_PORT=3001
netstat -ano | findstr ":%DEFAULT_PORT% " > nul
if %errorlevel% neq 0 (
    echo [警告] 端口 %DEFAULT_PORT% 不在使用中
    echo [提示] 请确认前端应用正在运行
    set /p FRONTEND_PORT="请输入前端应用实际运行的端口 (默认:3001): "
    if "%FRONTEND_PORT%"=="" set "FRONTEND_PORT=%DEFAULT_PORT%"
) else (
    echo [成功] 发现前端应用运行在端口: %DEFAULT_PORT%
    set "FRONTEND_PORT=%DEFAULT_PORT%"
)

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
echo 请创建一个隧道，本地端口设为 %FRONTEND_PORT%（前端应用实际端口）
echo.
set /p SUNNY_ID="请输入您的隧道ID: "

if "%SUNNY_ID%"=="" (
    echo [错误] 必须提供隧道ID
    pause
    exit /b 1
)

echo [4/4] 启动内网穿透...
echo 直接连接到前端应用端口 %FRONTEND_PORT%...
start cmd /k "title 财赋思前端应用穿透 && color 0E && cd /d %SUNNY_DIR% && sunny.exe clientid %SUNNY_ID%"

echo.
echo ================================================
echo                  启动完成!
echo ================================================
echo.
echo  本地前端应用: http://localhost:%FRONTEND_PORT%
echo  穿透地址: 请查看Sunny-Ngrok窗口显示的转发URL
echo.
echo ================================================
echo                 重要说明
echo ================================================
echo.
echo  1. 此脚本配置了直接穿透到前端应用的端口(%FRONTEND_PORT%)
echo  2. 确保您的前端应用已经启动并运行在此端口
echo  3. 如果前端应用依赖于后端API，请确保已启动后端服务
echo  4. 内网穿透URL现在应该可以直接访问前端应用界面
echo.
pause 