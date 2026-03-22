@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 一键启动脚本
echo ================================================
echo.

echo [1/4] 释放所有占用的端口...
echo 关闭可能占用端口的进程...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/4] 应用HTML重定向修复...
echo 正在复制重定向页面到关键位置...
if not exist public\Caifusi mkdir public\Caifusi
copy /y cpolar_redirect.html public\index.html >nul
copy /y cpolar_redirect.html public\404.html >nul
copy /y cpolar_redirect.html public\Caifusi\index.html >nul

echo [3/4] 构建应用...
echo 构建React应用优化版本...
call npm run build

if %errorlevel% neq 0 (
  echo.
  echo 应用构建失败，错误代码: %errorlevel%
  echo.
  pause
  exit /b 1
)

echo [4/4] 启动服务...
echo 启动简易静态服务器...
echo.
echo ================================================
echo 服务器即将启动...
echo.
echo 重要提示:
echo 1. cpolar应映射到自动选择的端口(8080或备用端口)
echo 2. 访问URL: https://[您的cpolar域名]/#/
echo 3. 如访问出错，请清除浏览器缓存
echo ================================================
echo.
echo 按任意键启动服务器...
pause >nul

node simple_server.js 