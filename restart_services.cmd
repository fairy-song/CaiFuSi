@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 服务重启脚本
echo ================================================
echo.

echo [1/3] 停止可能运行的服务...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1

echo [2/3] 清理临时文件...
if exist .env del .env
if exist .env.development del .env.development
if exist backend\.env del backend\.env

echo [3/3] 重新启动服务...
call direct_start.cmd

exit 