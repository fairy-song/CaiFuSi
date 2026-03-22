@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 cpolar配置脚本
echo ================================================
echo.

echo [1/3] 创建cpolar配置文件...
echo 确保cpolar在正确端口上运行

echo [2/3] 配置应用入口...
copy /y cpolar_redirect.html public\index.html
copy /y cpolar_redirect.html public\404.html

echo [3/3] 提供访问信息...
echo.
echo ================================================
echo             cpolar访问方式说明
echo ================================================
echo.
echo  cpolar访问URL应为: https://[您的cpolar域名]/#/
echo  例如: https://6baebd64.r11.vip.cpolar.cn/#/
echo  或者: https://6baebd64.r11.vip.cpolar.cn/
echo.
echo  注意:
echo  1. 确保cpolar正确配置，将3000端口映射到cpolar
echo  2. 如果URL错误，尝试访问/#/而不是/Caifusi
echo  3. 必要时清除浏览器缓存或使用隐私模式
echo.
pause 