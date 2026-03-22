@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 ngrok内网穿透启动程序
echo ================================================
echo.

set SCRIPT_DIR=%~dp0
set NGROK_DIR=%SCRIPT_DIR%\ngrok

REM 检查ngrok文件夹是否存在，如不存在则创建
if not exist "%NGROK_DIR%" (
    echo [信息] 创建ngrok目录...
    mkdir "%NGROK_DIR%"
)

REM 设置前端和后端端口，如果默认端口被占用可以修改这里
set FRONTEND_PORT=3000
set BACKEND_PORT=5001

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

echo [2/4] 检查ngrok是否已下载...
if not exist "%NGROK_DIR%\ngrok.exe" (
    echo [提示] 未找到ngrok，正在下载...
    powershell -Command "Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile '%NGROK_DIR%\ngrok.zip'"
    
    echo [提示] 正在解压ngrok...
    powershell -Command "Expand-Archive -Path '%NGROK_DIR%\ngrok.zip' -DestinationPath '%NGROK_DIR%' -Force"
    
    if not exist "%NGROK_DIR%\ngrok.exe" (
        echo [错误] 下载或解压ngrok失败，请手动下载ngrok并放置在 %NGROK_DIR% 目录下
        echo 下载地址: https://ngrok.com/download
        pause
        exit /b 1
    ) else (
        echo [成功] ngrok已下载并解压
    )
) else (
    echo [提示] 发现ngrok已安装
)

echo [3/4] 配置ngrok...
echo [提示] 首次使用ngrok需要注册账号并获取authtoken
echo 请访问: https://dashboard.ngrok.com/get-started/setup 注册账号并获取令牌
set /p NGROK_TOKEN="请输入您的ngrok authtoken (留空则跳过): "

if not "%NGROK_TOKEN%"=="" (
    echo 正在配置ngrok authtoken...
    "%NGROK_DIR%\ngrok.exe" authtoken %NGROK_TOKEN%
    echo [成功] ngrok配置已更新!
)

echo [4/4] 启动服务...
echo 启动本地服务...
start cmd /k "title 财赋思-后端服务 && color 0A && cd /d %SCRIPT_DIR% && C:\Python313\python.exe -m backend.run_dev"
start cmd /k "title 财赋思-前端服务 && color 0B && cd /d %SCRIPT_DIR%\frontend && npx http-server build -p %FRONTEND_PORT% --cors -a 0.0.0.0"

echo 等待5秒，确保本地服务已启动...
timeout /t 5 >nul

echo 启动前端内网穿透...
start cmd /k "title 财赋思-前端穿透 && color 0E && cd /d %NGROK_DIR% && ngrok.exe http %FRONTEND_PORT% --log=stdout"

echo 启动后端内网穿透...
start cmd /k "title 财赋思-后端穿透 && color 0D && cd /d %NGROK_DIR% && ngrok.exe http %BACKEND_PORT% --log=stdout"

echo.
echo ================================================
echo                  启动完成!
echo ================================================
echo.
echo  本地前端: http://localhost:%FRONTEND_PORT%
echo  本地后端: http://localhost:%BACKEND_PORT%
echo  穿透地址: 请查看ngrok窗口显示的转发URL
echo.
echo ================================================
echo               ngrok内网穿透使用说明
echo ================================================
echo.
echo  1. 首次使用需要注册ngrok账号并获取authtoken
echo  2. 免费版每次启动会随机分配域名
echo  3. 请在ngrok窗口中查看分配的公网URL
echo  4. 如需固定域名，请升级到ngrok付费版
echo  5. 如需更多功能，请访问ngrok官网：https://ngrok.com
echo.
pause 