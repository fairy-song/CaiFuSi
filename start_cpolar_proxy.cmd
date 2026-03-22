@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 cpolar代理服务器启动脚本
echo ================================================
echo.

echo [1/2] 安装必要依赖...
echo 正在安装express和http-proxy-middleware...
call npm install express http-proxy-middleware --save

if %errorlevel% neq 0 (
  echo.
  echo 依赖安装失败，错误代码: %errorlevel%
  echo 请确保网络连接正常且已安装Node.js
  echo.
  pause
  exit /b 1
)

echo.
echo 依赖安装成功！
echo.

echo [2/2] 启动代理服务器...
echo 服务器将在8080端口启动，代理到React的3000端口
echo.
node cpolar_proxy.js

if %errorlevel% neq 0 (
  echo.
  echo 服务器启动失败，错误代码: %errorlevel%
  echo 请检查端口是否被占用或Node.js环境是否正常
  echo.
  pause
  exit /b 1
)

echo.
echo 如果服务器启动失败，请检查依赖是否安装正确
echo.
pause 