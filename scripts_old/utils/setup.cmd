@echo off
chcp 65001 >nul
cls
echo ================================================
echo             财赋思应用安装程序
echo ================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d %SCRIPT_DIR%

echo [1/2] 安装前端依赖...
echo 当前目录: %SCRIPT_DIR%frontend
cd /d %SCRIPT_DIR%frontend
call npm install
if %errorlevel% neq 0 (
    echo [错误] 前端依赖安装失败，请检查npm是否正确安装。
    goto :error
)

echo [2/2] 安装后端依赖...
echo 当前目录: %SCRIPT_DIR%backend
cd /d %SCRIPT_DIR%backend
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [错误] 后端依赖安装失败，请检查Python是否正确安装。
    goto :error
)

echo.
echo ================================================
echo             安装完成！
echo ================================================
echo.
echo 请运行 start.cmd 启动应用
goto :end

:error
echo.
echo 安装过程中出现错误，请查看上方提示。
echo.

:end
pause 