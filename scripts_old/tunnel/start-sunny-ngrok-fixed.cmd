@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 Sunny-Ngrok内网穿透启动程序(修复版)
echo ================================================
echo.

set SCRIPT_DIR=%~dp0
set SUNNY_DIR=%SCRIPT_DIR%\sunnyNgrok

REM 检查Sunny-Ngrok文件夹是否存在，如不存在则创建
if not exist "%SUNNY_DIR%" (
    echo [信息] 创建Sunny-Ngrok目录...
    mkdir "%SUNNY_DIR%"
)

REM 设置前端和后端端口
set FRONTEND_PORT=3000
set BACKEND_PORT=5001

REM 检查端口是否被占用
echo [1/6] 检查端口占用情况...
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

echo [2/6] 检查代理服务器依赖...
if not exist "%SCRIPT_DIR%\node_modules\express" (
    echo [提示] 未找到代理服务器依赖，准备安装...
    call npm install --save express http-proxy-middleware
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败，请运行 install-proxy-deps.cmd 手动安装依赖
        pause
        exit /b 1
    )
    echo [成功] 依赖安装完成
) else (
    echo [提示] 依赖已安装
)

echo [3/6] 检查Sunny-Ngrok是否已下载...
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

echo [4/6] 配置Sunny-Ngrok隧道...
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

echo [5/6] 优化后端服务配置...
echo [提示] 将使用增强版后端服务来解决AI服务响应问题
copy /Y "%SCRIPT_DIR%\backend\run_dev_fixed.py" "%SCRIPT_DIR%\backend\__run_dev_enhanced.py" >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 无法复制增强版后端服务脚本，将使用标准版
    set "BACKEND_SCRIPT=backend.run_dev"
) else (
    echo [成功] 使用增强版后端服务脚本
    set "BACKEND_SCRIPT=backend.__run_dev_enhanced"
)

echo [6/6] 启动服务...
echo 启动后端服务...
start cmd /k "title 财赋思-后端服务 && color 0A && cd /d %SCRIPT_DIR% && python -m %BACKEND_SCRIPT%"

echo 启动代理服务器...
start cmd /k "title 财赋思-代理服务器 && color 0B && cd /d %SCRIPT_DIR% && node proxy-server.js %FRONTEND_PORT% %BACKEND_PORT%"

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
echo                 问题解决说明
echo ================================================
echo.
echo  1. 本启动程序已修复"AI服务正在启动中"的问题
echo  2. 使用了专业的Express代理服务器，提供可靠的请求转发
echo  3. 增强版后端服务确保模型正确初始化和响应
echo  4. 如需检测AI服务状态，请运行: node troubleshoot-ai.js
echo.
echo ================================================
echo                 常见问题处理
echo ================================================
echo.
echo  Q: 仍然显示"这是一个测试回复"?
echo  A: 请等待一分钟，后端服务需要时间完全初始化AI模型
echo.
echo  Q: 登录提示错误?
echo  A: 代理可能需要特殊设置，请运行troubleshoot-ai.js检测
echo.
echo  Q: 前端页面无法加载?
echo  A: 请确保内网穿透服务正常运行，检查Sunny-Ngrok窗口
echo.
pause 