@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 端口检查工具
echo ================================================
echo.

echo [1/2] 检查8080端口占用情况...
netstat -ano | findstr :8080
echo.

echo [2/2] 查看可能占用端口的Node进程...
tasklist | findstr node.exe
echo.

echo 如果需要关闭占用端口的进程，请使用以下命令：
echo taskkill /F /PID [进程ID]
echo 或者运行 direct_access_fix.cmd 自动释放端口
echo.
pause 