@echo off
chcp 65001 >nul
echo 运行AI服务诊断工具...
node troubleshoot-ai.js http://localhost:5001
echo.
echo 如果诊断工具无法运行，请确保Node.js已安装，并且已运行install-proxy-deps.cmd
pause 