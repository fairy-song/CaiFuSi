@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ================================================
echo    财赋思应用 - 快速启动
echo ================================================
echo.

REM 加载环境变量
if exist .env.local (
    echo [配置] 正在加载环境变量...
    for /f "usebackq tokens=1,* delims==" %%a in (".env.local") do (
        set "line=%%a"
        REM 跳过注释行和空行
        if not "!line:~0,1!"=="#" if not "!line!"=="" (
            set "%%a=%%b"
        )
    )
    echo [成功] 环境变量加载完成
    echo.
) else (
    echo [警告] 未找到 .env.local 文件
    echo [提示] 请复制 .env.example 为 .env.local 并配置API密钥
    echo.
    pause
    exit /b 1
)

REM 检查Node.js是否可用
echo [检查] 正在检测Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] Node.js命令不可用，尝试使用常见安装路径...
    
    REM 尝试常见的Node.js安装路径
    set "NODE_PATH="
    if exist "C:\Program Files\nodejs\node.exe" set "NODE_PATH=C:\Program Files\nodejs\node.exe"
    if exist "C:\Program Files (x86)\nodejs\node.exe" set "NODE_PATH=C:\Program Files (x86)\nodejs\node.exe"
    if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_PATH=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_PATH=%ProgramFiles%\nodejs\node.exe"
    
    if defined NODE_PATH (
        echo [成功] 在 !NODE_PATH! 找到Node.js
        set "NODE_CMD=!NODE_PATH!"
    ) else (
        echo [错误] 未找到Node.js！
        echo.
        echo 请先安装Node.js：
        echo 1. 访问 https://nodejs.org/
        echo 2. 下载并安装LTS版本
        echo 3. 重启命令行窗口
        echo.
        echo 或者将Node.js添加到系统PATH环境变量
        echo.
        pause
        exit /b 1
    )
) else (
    REM Node.js在PATH中，直接使用
    set "NODE_CMD=node"
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [成功] 找到Node.js %NODE_VERSION%
)
echo.

REM ===============================================
REM  第一阶段：检查前端依赖
REM ===============================================
echo [依赖] 正在检测前端npm依赖...
if not exist "node_modules\.package-lock.json" (
    echo [依赖] ✕ 缺少npm依赖包，正在自动安装...
    echo [依赖] 执行 npm install，这可能需要几分钟...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [依赖] ✕ 依赖安装失败！请手动运行: npm install
        pause
        exit /b 1
    )
    echo [依赖] ✓ 依赖安装完成
    echo.
) else (
    echo [依赖] ✓ 前端依赖已就绪
)
echo.

REM ===============================================
REM  第二阶段：检查Python环境
REM ===============================================
echo [环境] 正在检测Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [环境] Python命令不可用，尝试使用py命令...
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [环境] ✕ 未找到Python！请先安装Python 3.8或更高版本
        pause
        exit /b 1
    ) else (
        set "PYTHON_CMD=py"
        for /f "tokens=*" %%i in ('py --version') do set PYTHON_VERSION=%%i
        echo [环境] ✓ 找到!PYTHON_VERSION!
    )
) else (
    set "PYTHON_CMD=python"
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [环境] ✓ 找到!PYTHON_VERSION!
)
echo.

REM ===============================================
REM  第三阶段：启动后端服务
REM ===============================================
echo ================================================
echo    正在启动后端服务...
echo ================================================
echo.
echo [后端] 正在启动Flask后端服务...
start "财赋思-后端" cmd /k "cd /d "%~dp0backend" && %PYTHON_CMD% run_dev_enhanced.py"
echo [后端] ✓ 后端服务已在新窗口中启动
echo [后端] 等待后端初始化（5秒）...
timeout /t 5 /nobreak >nul
echo [后端] ✓ 后端初始化等待完成
echo.

REM ===============================================
REM  第四阶段：构建前端资源
REM ===============================================
echo ================================================
echo    正在构建前端资源（生产模式）...
echo ================================================
echo.
echo [构建] 开始执行 npm run build...
echo [构建] 正在编译React组件、打包资源文件...
echo [构建] 这可能需要1-3分钟，请耐心等待...
echo.

call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [构建] ✕ 前端构建失败！
    echo [构建] 请检查上方的错误信息并修复后重试
    echo.
    pause
    exit /b 1
)

echo.
echo [构建] ✓ 前端资源构建成功！
echo [构建] ✓ 生产环境文件已输出到 build 目录
echo.

REM ===============================================
REM  第五阶段：启动前端静态服务器
REM ===============================================
echo ================================================
echo    正在启动前端静态服务器...
echo ================================================
echo.
echo [前端] 正在启动静态文件服务器（含API代理）...
start "财赋思-前端" cmd /k "cd /d "%~dp0" && %NODE_CMD% simple-static-server.js"
echo [前端] ✓ 前端静态服务器已在新窗口中启动
echo.

REM 等待静态服务器启动
echo [前端] 等待服务器就绪（3秒）...
timeout /t 3 /nobreak >nul
echo.

REM ===============================================
REM  第六阶段：验证服务状态
REM ===============================================
echo ================================================
echo    正在验证所有服务状态...
echo ================================================
echo.

echo [验证] 检测前端服务 (http://localhost:3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [验证] ✓ 前端服务运行正常
    set FRONTEND_OK=1
) else (
    echo [验证] ⟳ 前端服务正在启动中...
    set FRONTEND_OK=0
)

echo [验证] 检测后端服务 (http://localhost:5001)...
curl -s http://localhost:5001 >nul 2>&1
if %errorlevel% equ 0 (
    echo [验证] ✓ 后端服务运行正常
    set BACKEND_OK=1
) else (
    echo [验证] ⟳ 后端服务正在启动中...
    set BACKEND_OK=0
)

echo.
echo ================================================
echo    财赋思应用启动完成！
echo ================================================
echo.
echo  服务地址：
echo    前端页面: http://localhost:3000
echo    后端API:  http://localhost:5001
echo.

if !FRONTEND_OK!==1 if !BACKEND_OK!==1 (
    echo  状态：所有服务运行正常 ✓
    echo.
    echo [浏览器] 正在自动打开浏览器...
    timeout /t 2 /nobreak >nul
    start http://localhost:3000
) else (
    echo  状态：部分服务正在启动中，请稍候...
    echo.
    echo  提示：
    echo  - 后端AI模型首次加载需要约1-2分钟
    echo  - 如果页面无法访问，请等待10-20秒后重试
    echo.
    echo [浏览器] 等待5秒后尝试打开浏览器...
    timeout /t 5 /nobreak >nul
    start http://localhost:3000
)

echo.
echo  使用说明：
echo  - 已打开两个命令行窗口（后端 和 前端静态服务器）
echo  - 关闭这两个窗口将停止对应服务
echo  - 修改前端代码后需重新运行此脚本以重新构建
echo.
echo  常见问题：
echo  1. 页面空白      → 等待服务完全启动后刷新
echo  2. 显示代理错误  → 检查后端窗口是否有错误日志
echo  3. AI功能不可用  → 检查 .env.local 中的API密钥配置
echo.
pause
endlocal
