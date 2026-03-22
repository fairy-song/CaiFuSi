@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 超简易代理服务器启动程序
echo ================================================
echo.

set SCRIPT_DIR=%~dp0
set FRONTEND_PORT=3000
set BACKEND_PORT=5001

REM 检查端口是否被占用
echo [1/2] 检查端口占用情况...
:CHECK_FRONTEND_PORT
netstat -ano | findstr ":%FRONTEND_PORT% " > nul
if %errorlevel% equ 0 (
    echo [提示] 端口 %FRONTEND_PORT% 已被占用，尝试使用下一个端口...
    set /a FRONTEND_PORT+=1
    goto CHECK_FRONTEND_PORT
)
echo [成功] 将使用前端端口: %FRONTEND_PORT%

:CHECK_BACKEND_PORT
netstat -ano | findstr ":%BACKEND_PORT% " > nul
if %errorlevel% equ 0 (
    echo [提示] 端口 %BACKEND_PORT% 已被占用，尝试使用下一个端口...
    set /a BACKEND_PORT+=1
    goto CHECK_BACKEND_PORT
)
echo [成功] 将使用后端端口: %BACKEND_PORT%

echo [2/2] 启动超简易代理服务器...
node ultra-simple-proxy.js %FRONTEND_PORT% %BACKEND_PORT%

echo.
echo ================================================
echo                 服务已启动!
echo ================================================
echo.
echo  本地前端+代理: http://localhost:%FRONTEND_PORT%
echo  本地后端: http://localhost:%BACKEND_PORT%
echo.
echo  请确保您的Sunny-Ngrok隧道已启动:
echo  - 隧道本地端口为%FRONTEND_PORT%
echo  - 请使用隧道提供的外部URL访问应用
echo  - 您的隧道地址: http://caifusi.viphk.nnhk.cc
echo.
echo  如遇到"这是一个测试回复"的问题，请等待1-2分钟
echo  让AI模型完全初始化后再尝试。
echo.
echo  按任意键退出该窗口(但保持服务窗口运行)
pause 