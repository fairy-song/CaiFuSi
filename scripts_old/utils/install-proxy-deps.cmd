@echo off
echo 安装代理服务器所需的依赖包...
cd /d %~dp0

echo 安装 express 和 http-proxy-middleware...
npm install --save express http-proxy-middleware

echo 依赖安装完成！
pause 