@echo off
chcp 65001 >nul
echo ================================================
echo    启动开发模式 - 无需构建
echo ================================================
echo.
echo [说明] 开发模式会自动监听代码更改并刷新浏览器
echo [说明] 修改代码后会立即看到效果，无需手动构建
echo.

REM 检查是否已有服务在运行
echo [检查] 检测端口占用情况...
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口3000已被占用
    echo [提示] 请先关闭其他前端服务
    pause
    exit /b 1
)

netstat -ano | findstr ":5001" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口5001已被占用
    echo [提示] 请先关闭其他后端服务
    pause
    exit /b 1
)

echo [成功] 端口检查通过
echo.

REM 启动后端
echo [启动] 正在启动后端服务...
start "财赋思-后端(开发模式)" cmd /k "cd /d "%~dp0backend" && python run_dev_enhanced.py"

REM 等待后端启动
echo [等待] 等待后端服务启动（5秒）...
timeout /t 5 /nobreak >nul

REM 启动前端开发服务器
echo [启动] 正在启动前端开发服务器...
echo [提示] 首次启动可能需要较长时间...
start "财赋思-前端(开发模式)" cmd /k "cd /d "%~dp0" && npm start"

echo.
echo ================================================
echo    服务启动中...
echo ================================================
echo.
echo [前端] http://localhost:3000 (开发服务器)
echo [后端] http://localhost:5001 (API服务)
echo.
echo [提示] 前端开发服务器启动后会自动打开浏览器
echo [提示] 修改代码后会自动刷新，无需重启
echo [提示] 按 Ctrl+C 可以停止服务
echo.
echo [注意] 请保持两个命令行窗口打开
echo.

pause
