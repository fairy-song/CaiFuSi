@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 Sunny-Ngrok内网穿透启动程序(简化版)
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
echo [1/3] 检查端口占用情况...
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

echo [2/3] 检查Sunny-Ngrok是否已下载...
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

echo [3/3] 配置Sunny-Ngrok隧道...
echo [提示] 使用Sunny-Ngrok需要隧道ID
echo 请访问: https://www.ngrok.cc/user.html 登录并创建隧道
echo.
set /p SUNNY_ID="请输入您的前端隧道ID: "

if "%SUNNY_ID%"=="" (
    echo [错误] 必须提供隧道ID
    pause
    exit /b 1
)

echo 启动本地服务...
start cmd /k "title 财赋思-后端服务 && color 0A && cd /d %SCRIPT_DIR% && C:\Python313\python.exe -m backend.run_dev"

REM 修改前端启动命令，添加代理配置，将/api请求转发到后端服务
echo [提示] 使用代理配置启动前端服务，将API请求转发到后端...
start cmd /k "title 财赋思-前端服务 && color 0B && cd /d %SCRIPT_DIR%\frontend && npx http-server build -p %FRONTEND_PORT% --cors -a 0.0.0.0 --proxy http://localhost:%BACKEND_PORT%"

echo 等待5秒，确保本地服务已启动...
timeout /t 5 >nul

echo 启动内网穿透...
start cmd /k "title 财赋思-内网穿透 && color 0E && cd /d %SUNNY_DIR% && sunny.exe clientid %SUNNY_ID%"

echo.
echo ================================================
echo                  启动完成!
echo ================================================
echo.
echo  本地前端: http://localhost:%FRONTEND_PORT%
echo  本地后端: http://localhost:%BACKEND_PORT%
echo  穿透地址: 请查看Sunny-Ngrok窗口显示的转发URL
echo.
echo ================================================
echo               优化使用提示
echo ================================================
echo.
echo  1. 已配置API代理，所有/api开头的请求将转发到后端服务
echo  2. 只需一个隧道即可同时访问前端页面和后端API
echo  3. 如果API请求仍然失败，请检查以下几点：
echo     a) API路径是否正确以/api开头
echo     b) 后端服务是否正常运行
echo     c) 代理配置是否生效
echo.
pause 