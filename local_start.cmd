@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 本地一键启动
echo ================================================
echo.

echo [1/2] 启动后端服务...
start "财赋思-后端服务" /D "%~dp0backend" cmd /k "color 0A & python run_dev_enhanced.py"

echo [2/2] 启动前端代理服务...
start "财赋思-前端代理" /D "%~dp0" cmd /k "color 0B & node scripts\local\proxy-server.js 3001 5001"

echo.
echo ================================================
echo                  启动完成!
echo ================================================
echo.
echo  前端访问地址: http://localhost:3001
echo  后端API地址: http://localhost:5001
echo.
echo  如果显示"这是一个测试回复"，请等待1分钟让AI模型初始化
echo.
echo  注意：本启动脚本使用代理服务器提供前端界面，
echo        并将API请求转发到后端服务
echo.
pause 