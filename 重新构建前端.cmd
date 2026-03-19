@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ================================================
echo    重新构建前端项目
echo ================================================
echo.

REM 检查Node.js
echo [检查] 正在检测Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] Node.js命令不可用，尝试使用常见安装路径...
    
    set "NODE_FOUND=0"
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
        set "NODE_FOUND=1"
        echo [成功] 在 C:\Program Files\nodejs 找到Node.js
    )
    if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
        set "NODE_FOUND=1"
        echo [成功] 在 C:\Program Files (x86)\nodejs 找到Node.js
    )
    if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
        set "NODE_FOUND=1"
        echo [成功] 在 %LOCALAPPDATA%\Programs\nodejs 找到Node.js
    )
    
    if !NODE_FOUND! equ 0 (
        echo [错误] 未找到Node.js！
        echo 请先安装Node.js: https://nodejs.org/
        pause
        exit /b 1
    )
)

echo [成功] Node.js已就绪
node -v
npm -v
echo.

REM 进入项目目录
cd /d "%~dp0"

REM 构建项目
echo [构建] 正在构建React项目...
echo [提示] 这可能需要几分钟时间，请耐心等待...
echo.

call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo    构建成功！
    echo ================================================
    echo.
    echo [提示] 现在可以重新运行 快速启动.cmd 查看更新
    echo.
) else (
    echo.
    echo ================================================
    echo    构建失败！
    echo ================================================
    echo.
    echo [错误] 构建过程中出现错误
    echo [建议] 请检查上面的错误信息
    echo.
)

pause
