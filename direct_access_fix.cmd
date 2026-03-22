@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 cpolar访问修复工具
echo ================================================
echo.

echo [0/3] 关闭可能占用端口的进程...
echo 尝试释放8080端口...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [1/3] 修复HTML文件...
echo 正在复制重定向页面到关键位置...
copy /y cpolar_redirect.html public\index.html
copy /y cpolar_redirect.html public\404.html
copy /y cpolar_redirect.html public\Caifusi\index.html

echo [2/3] 创建cpolar访问配置...
echo 请运行任意一个选项：
echo.
echo 1. 运行简易服务器（推荐，不需要额外依赖）:
echo    .\run_simple_server.cmd
echo.
echo 2. 如果简易服务器不工作，尝试:
echo    .\start_cpolar_proxy.cmd
echo.
echo 3. 或者尝试静态服务器:
echo    .\start_static_server.cmd
echo.
echo [3/3] cpolar配置说明...
echo.
echo 重要：请确保cpolar映射到8080端口（或自动选择的其他端口）！
echo.
echo 访问地址应为:
echo   https://[您的cpolar域名]/#/
echo   例如: https://6baebd64.r11.vip.cpolar.cn/#/
echo.
echo 如果访问失败，请尝试清除浏览器缓存或使用隐私模式
echo.
pause 