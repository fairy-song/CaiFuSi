@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 端口释放工具
echo ================================================
echo.

echo [1/3] 检查占用端口的进程...
echo 8080端口:
netstat -ano | findstr :8080
echo 8081端口:
netstat -ano | findstr :8081
echo.

echo [2/3] 尝试安全关闭Node.js进程...
echo 关闭node.exe进程...
taskkill /f /im node.exe >nul 2>&1

echo [3/3] 验证端口是否已释放...
timeout /t 2 /nobreak >nul
echo 再次检查8080端口:
netstat -ano | findstr :8080
echo.

echo 端口释放操作完成!
echo 如果还有进程占用端口，请使用任务管理器手动关闭
echo.
pause 