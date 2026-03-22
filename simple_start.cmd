@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 本地智能启动
echo ================================================
echo.

rem 检查前端依赖
echo [检查] 前端依赖...
if not exist "frontend\node_modules" (
    echo [安装] 前端依赖，这可能需要几分钟时间...
    cd frontend
    call npm install
    cd ..
    echo [完成] 前端依赖安装完成
) else (
    echo [已有] 前端依赖已存在
)

rem 检查后端依赖
echo [检查] 后端依赖...
if not exist "backend\venv" (
    echo [提示] 后端虚拟环境不存在，建议手动创建并安装依赖
    echo        请参考后端目录中的README.md或requirements.txt
) else (
    echo [已有] 后端虚拟环境已存在
)

echo.
echo [1/2] 启动后端服务...
start "财赋思-后端服务" /D "%~dp0backend" cmd /k "color 0A & python run_dev_enhanced.py"

echo [2/2] 启动前端服务...
start "财赋思-前端服务" /D "%~dp0frontend" cmd /k "color 0B & npm start"

echo.
echo ================================================
echo                  启动完成!
echo ================================================
echo.
echo  前端服务: http://localhost:3000
echo  后端服务: http://localhost:5001
echo.
echo  注意事项:
echo  1. 如果显示"这是一个测试回复"，请等待1分钟让AI模型初始化
echo  2. 如果前端启动失败，请检查依赖是否安装完成
echo  3. 如果后端启动失败，可能需要手动配置Python环境
echo.
pause 