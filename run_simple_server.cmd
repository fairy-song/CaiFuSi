@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 简易服务器启动脚本
echo ================================================
echo.

echo [1/2] 构建React应用...
call npm run build

if %errorlevel% neq 0 (
  echo.
  echo 构建应用失败，错误代码: %errorlevel%
  echo.
  pause
  exit /b 1
)

echo [2/2] 启动简易静态服务器...
echo 服务器将在8080端口启动，不依赖额外npm包
echo.

node simple_server.js

if %errorlevel% neq 0 (
  echo.
  echo 服务器启动失败，错误代码: %errorlevel%
  echo 请检查端口是否被占用
  echo.
  pause
  exit /b 1
)

echo.
pause 