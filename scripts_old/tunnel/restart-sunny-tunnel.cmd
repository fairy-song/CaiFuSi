@echo off
chcp 65001 >nul
cls
echo ================================================
echo        财赋思应用 Sunny-Ngrok隧道修复工具
echo ================================================
echo.

set SCRIPT_DIR=%~dp0
set SUNNY_DIR=%SCRIPT_DIR%\sunnyNgrok

echo [1/3] 检查Sunny-Ngrok...
if not exist "%SUNNY_DIR%\sunny.exe" (
    echo [错误] 未找到Sunny-Ngrok，请手动下载
    echo 下载地址: https://www.ngrok.cc/download.html
    echo.
    echo [提示] 请下载Windows版本的Sunny-Ngrok客户端，解压后将sunny.exe文件
    echo       复制到以下目录: %SUNNY_DIR%
    pause
    exit /b 1
) else (
    echo [成功] 已找到Sunny-Ngrok
)

echo [2/3] 获取隧道信息...
echo.
echo [提示] 请在Sunny-Ngrok官网(https://www.ngrok.cc/user.html)获取以下信息
echo.
set /p SUNNY_ID="请输入您的隧道ID: "

if "%SUNNY_ID%"=="" (
    echo [错误] 必须提供隧道ID
    pause
    exit /b 1
)

echo.
echo [3/3] 重新启动隧道连接...
echo.
echo [提示] 即将启动隧道连接，请确保：
echo  1. 本地服务正在端口3000上运行
echo  2. 该端口未被其他应用占用
echo  3. 防火墙未阻止该端口
echo.
echo 确认后按任意键启动隧道...
pause >nul

echo 关闭可能存在的Sunny-Ngrok进程...
taskkill /f /im sunny.exe >nul 2>&1

echo 启动Sunny-Ngrok隧道...
start cmd /k "title 财赋思-Sunny隧道 && color 0E && cd /d %SUNNY_DIR% && sunny.exe clientid %SUNNY_ID%"

echo.
echo ================================================
echo                隧道启动完成!
echo ================================================
echo.
echo  请在新打开的窗口中查看隧道状态
echo  如果隧道成功启动，您将看到"隧道建立成功"的提示
echo  此时应可访问: http://caifusi.viphk.nnhk.cc
echo.
echo  如仍有问题，请确认以下事项:
echo  1. 隧道ID是否正确
echo  2. 网络连接是否正常
echo  3. 前端应用和代理服务器是否已启动
echo.
pause 