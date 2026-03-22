@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 - 本地解决方案
echo ================================================
echo.

set SCRIPT_DIR=%~dp0
set FRONTEND_PORT=3002
set BACKEND_PORT=5001

echo [1/4] 获取本机IP地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r "IPv4.*"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP:~1%
echo 本机IP地址: %LOCAL_IP%

echo.
echo [2/4] 检查网络...
echo 提示: 为了让移动设备访问，您需要确保:
echo  1. 电脑和手机连接在同一网络下（如同一WiFi），或
echo  2. 电脑开启移动热点，手机连接到此热点
echo.
echo 正在检查网络设置...
echo.

netsh wlan show hostednetwork
echo.
echo 如需开启移动热点，请按照以下步骤操作:
echo  1. 打开Windows设置 -^> 网络和Internet -^> 移动热点
echo  2. 开启"与其他设备共享网络连接"
echo  3. 设置热点名称和密码
echo  4. 将手机连接到此热点
echo.
pause
echo.

echo [3/4] 启动服务...
echo 启动前端和后端服务，确保监听所有网络接口...
start cmd /k "title 财赋思-后端服务 && color 0A && cd /d %SCRIPT_DIR% && C:\Python313\python.exe -m backend.run_dev"
start cmd /k "title 财赋思-前端服务 && color 0B && cd /d %SCRIPT_DIR%\frontend && npx http-server build -p %FRONTEND_PORT% --cors -a 0.0.0.0"

echo [4/4] 检查防火墙...
echo 提示: 如果无法从手机访问，可能是防火墙阻止了连接
echo 正在添加防火墙例外规则...

netsh advfirewall firewall show rule name="财赋思应用前端" > nul
if %errorlevel% neq 0 (
    echo 添加前端服务防火墙规则...
    netsh advfirewall firewall add rule name="财赋思应用前端" dir=in action=allow protocol=TCP localport=%FRONTEND_PORT%
) else (
    echo 前端服务防火墙规则已存在
)

netsh advfirewall firewall show rule name="财赋思应用后端" > nul
if %errorlevel% neq 0 (
    echo 添加后端服务防火墙规则...
    netsh advfirewall firewall add rule name="财赋思应用后端" dir=in action=allow protocol=TCP localport=%BACKEND_PORT%
) else (
    echo 后端服务防火墙规则已存在
)

echo.
echo ================================================
echo                  启动完成!
echo ================================================
echo.
echo  在您的电脑上访问:
echo  本地前端: http://localhost:%FRONTEND_PORT%
echo  本地后端: http://localhost:%BACKEND_PORT%
echo.
echo  在移动设备上访问 (请确保连接同一网络):
echo  移动前端: http://%LOCAL_IP%:%FRONTEND_PORT%
echo  移动后端: http://%LOCAL_IP%:%BACKEND_PORT%
echo.
echo  使用说明:
echo  1. 让手机连接电脑开启的热点或与电脑连接同一WiFi
echo  2. 在手机浏览器中输入: http://%LOCAL_IP%:%FRONTEND_PORT%
echo  3. 如果连接失败:
echo     - 确认手机和电脑在同一网络
echo     - 检查电脑防火墙设置
echo     - 尝试暂时关闭电脑防火墙
echo.
echo  注意: 这种方法只能在本地网络内访问，不支持互联网访问
echo  如需互联网访问，请尝试其他内网穿透方案
echo.
echo ================================================
echo 请保持所有窗口运行，关闭窗口会停止相应服务
echo ================================================
pause 