@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 前后端直接启动版
echo ================================================
echo.

echo [1/3] 关闭可能占用端口的进程...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/3] 检查环境，删除可能存在的问题文件...
if exist .env del .env
if exist .env.development del .env.development
if exist backend\.env del backend\.env

echo [3/3] 启动服务...
echo.
echo [3.1] 启动后端服务...
start "财赋思-后端服务" /D "%~dp0backend" cmd /k "color 0A && set FLASK_ENV=development && set FLASK_DEBUG=1 && set FLASK_SKIP_DOTENV=1 && python run_dev_enhanced.py"

echo [3.2] 启动前端开发服务器...
start "财赋思-前端" /D "%~dp0" cmd /k "color 0B && set HOST=0.0.0.0 && set WDS_SOCKET_HOST=localhost && set DANGEROUSLY_DISABLE_HOST_CHECK=true && set PORT=3000 && npm start"

echo.
echo ================================================
echo                  启动完成!
echo ================================================
echo.
echo  后端地址: http://localhost:5001 (API服务)
echo  前端地址: http://localhost:3000/#/
echo  穿透地址: https://6baebd64.r11.vip.cpolar.cn/#/ (如果使用cpolar)
echo.
echo  注意:
echo  1. 前端React应用会自动在浏览器中打开，访问格式应为"/#/"
echo  2. 如果显示"这是一个测试回复"，请等待1分钟让AI模型初始化
echo  3. 如果3000端口被占用，React会自动使用其他端口
echo  4. 已启用跨域访问，支持cpolar等内网穿透服务
echo.
pause 