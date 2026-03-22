@echo off
chcp 65001 >nul
cls
echo ================================================
echo     财赋思应用 全面诊断与修复工具
echo ================================================
echo.

set SCRIPT_DIR=%~dp0
set SUNNY_DIR=%SCRIPT_DIR%\sunnyNgrok
set FRONTEND_PORT=3000
set BACKEND_PORT=5001

echo [1/5] 检查服务状态...

echo 检查前端服务(端口3001)...
netstat -ano | findstr ":3001" > nul
if %errorlevel% equ 0 (
    echo [✓] 前端开发服务正在运行 (端口3001)
    set FRONTEND_DEV_RUNNING=1
) else (
    echo [✗] 前端开发服务未运行
    set FRONTEND_DEV_RUNNING=0
)

echo 检查代理服务(端口3000)...
netstat -ano | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo [✓] 代理服务正在运行 (端口3000)
    set PROXY_RUNNING=1
) else (
    echo [✗] 代理服务未运行
    set PROXY_RUNNING=0
)

echo 检查后端服务(端口5001)...
netstat -ano | findstr ":5001" > nul
if %errorlevel% equ 0 (
    echo [✓] 后端服务正在运行 (端口5001)
    set BACKEND_RUNNING=1
) else (
    echo [✗] 后端服务未运行
    set BACKEND_RUNNING=0
)

echo 检查Sunny-Ngrok进程...
tasklist | findstr "sunny.exe" > nul
if %errorlevel% equ 0 (
    echo [✓] Sunny-Ngrok正在运行
    set SUNNY_RUNNING=1
) else (
    echo [✗] Sunny-Ngrok未运行
    set SUNNY_RUNNING=0
)

echo.
echo [2/5] 检查文件和目录...

echo 检查前端构建文件...
if exist "%SCRIPT_DIR%\frontend\build\index.html" (
    echo [✓] 前端构建文件存在
    set FRONTEND_BUILD_EXISTS=1
) else (
    echo [✗] 未找到前端构建文件
    set FRONTEND_BUILD_EXISTS=0
)

echo 检查Sunny-Ngrok...
if exist "%SUNNY_DIR%\sunny.exe" (
    echo [✓] Sunny-Ngrok已安装
    set SUNNY_EXISTS=1
) else (
    echo [✗] 未找到Sunny-Ngrok
    set SUNNY_EXISTS=0
)

echo.
echo [3/5] 诊断结果
echo ------------------------------------------------

if %PROXY_RUNNING% equ 0 (
    echo [问题] 代理服务未运行，需要启动代理服务
)

if %BACKEND_RUNNING% equ 0 (
    echo [问题] 后端服务未运行，需要启动后端服务
)

if %SUNNY_EXISTS% equ 0 (
    echo [问题] Sunny-Ngrok未安装，需要下载并安装
)

if %SUNNY_RUNNING% equ 0 (
    echo [问题] Sunny-Ngrok未运行，需要启动隧道
)

if %FRONTEND_BUILD_EXISTS% equ 0 if %FRONTEND_DEV_RUNNING% equ 0 (
    echo [问题] 前端文件不可用，需要构建前端或启动前端开发服务
)

echo.
echo [4/5] 选择修复操作
echo ------------------------------------------------
echo  1. 重启所有服务 (代理、后端和隧道)
echo  2. 只启动代理服务器
echo  3. 只启动后端服务
echo  4. 只重启Sunny-Ngrok隧道
echo  5. 构建前端应用
echo  6. 退出
echo.

set /p CHOICE="请输入选项(1-6): "

echo.
echo [5/5] 执行修复...
echo ------------------------------------------------

if "%CHOICE%"=="1" (
    echo 正在重启所有服务...
    
    echo 关闭现有服务...
    taskkill /f /im node.exe >nul 2>&1
    taskkill /f /im python.exe >nul 2>&1
    taskkill /f /im sunny.exe >nul 2>&1
    
    echo 启动后端服务...
    start cmd /k "title 财赋思-后端服务 && color 0A && cd /d %SCRIPT_DIR% && python -m backend.run_dev"
    
    echo 启动超简易代理服务器...
    start cmd /k "title 财赋思-超简易代理 && color 0B && cd /d %SCRIPT_DIR% && node ultra-simple-proxy.js %FRONTEND_PORT% %BACKEND_PORT%"
    
    echo 等待5秒，确保本地服务已启动...
    timeout /t 5 >nul
    
    if %SUNNY_EXISTS% equ 1 (
        echo 请输入您的Sunny-Ngrok隧道ID:
        set /p SUNNY_ID="隧道ID: "
        
        if not "%SUNNY_ID%"=="" (
            echo 启动Sunny-Ngrok隧道...
            start cmd /k "title 财赋思-内网穿透 && color 0E && cd /d %SUNNY_DIR% && sunny.exe clientid %SUNNY_ID%"
        )
    )
    
    echo [完成] 所有服务已重启
) else if "%CHOICE%"=="2" (
    echo 启动代理服务器...
    start cmd /k "title 财赋思-超简易代理 && color 0B && cd /d %SCRIPT_DIR% && node ultra-simple-proxy.js %FRONTEND_PORT% %BACKEND_PORT%"
    echo [完成] 代理服务器已启动
) else if "%CHOICE%"=="3" (
    echo 启动后端服务...
    start cmd /k "title 财赋思-后端服务 && color 0A && cd /d %SCRIPT_DIR% && python -m backend.run_dev"
    echo [完成] 后端服务已启动
) else if "%CHOICE%"=="4" (
    if %SUNNY_EXISTS% equ 1 (
        echo 关闭现有Sunny-Ngrok进程...
        taskkill /f /im sunny.exe >nul 2>&1
        
        echo 请输入您的Sunny-Ngrok隧道ID:
        set /p SUNNY_ID="隧道ID: "
        
        if not "%SUNNY_ID%"=="" (
            echo 启动Sunny-Ngrok隧道...
            start cmd /k "title 财赋思-内网穿透 && color 0E && cd /d %SUNNY_DIR% && sunny.exe clientid %SUNNY_ID%"
            echo [完成] Sunny-Ngrok隧道已重启
        ) else (
            echo [错误] 未提供隧道ID，取消操作
        )
    ) else (
        echo [错误] 未找到Sunny-Ngrok，请先下载
        echo 下载地址: https://www.ngrok.cc/download.html
    )
) else if "%CHOICE%"=="5" (
    echo 构建前端应用...
    echo 请确认已安装Node.js和npm
    cd "%SCRIPT_DIR%\frontend"
    call npm run build
    echo [完成] 前端应用已构建
) else if "%CHOICE%"=="6" (
    echo 退出程序...
    exit /b 0
) else (
    echo [错误] 无效的选项
)

echo.
echo ================================================
echo                修复操作完成
echo ================================================
echo.
echo  建议按以下顺序检查：
echo  1. 确认本地服务可访问: http://localhost:3000
echo  2. 确认代理和后端服务正常运行
echo  3. 确认Sunny-Ngrok隧道已连接
echo  4. 尝试访问: http://caifusi.viphk.nnhk.cc
echo.
pause 