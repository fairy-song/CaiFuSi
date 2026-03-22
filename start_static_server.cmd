@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 静态服务启动脚本
echo ================================================
echo.

echo [1/3] 构建React应用...
call npm run build

echo [2/3] 安装静态服务器依赖...
npm install express --save

echo [3/3] 启动静态服务器...
node static_server.js

echo.
echo 如果服务器启动失败，请检查依赖是否安装正确
echo. 