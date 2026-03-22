@echo off
chcp 65001 >nul
cls
echo ================================================
echo   cpolar配置重置工具
echo ================================================
echo.

set CPOLAR_PATH=E:\cpolar\cpolar\cpolar.exe
set CPOLAR_CONFIG_DIR=%USERPROFILE%\.cpolar
set CPOLAR_CONFIG_FILE=%CPOLAR_CONFIG_DIR%\cpolar.yml

echo [1] 结束所有cpolar进程...
taskkill /f /im cpolar.exe 2>nul
timeout /t 2 >nul

echo [2] 检查配置文件...
if exist "%CPOLAR_CONFIG_FILE%" (
    echo 当前配置文件内容:
    type "%CPOLAR_CONFIG_FILE%"
    
    echo.
    echo [3] 备份当前配置...
    copy "%CPOLAR_CONFIG_FILE%" "%CPOLAR_CONFIG_FILE%.bak" >nul
    echo 备份到: %CPOLAR_CONFIG_FILE%.bak
) else (
    echo 未找到配置文件，将创建新的配置文件
    if not exist "%CPOLAR_CONFIG_DIR%" mkdir "%CPOLAR_CONFIG_DIR%"
)

echo.
echo [4] 请输入您的cpolar authtoken
echo 可以从cpolar官网(https://www.cpolar.com)的个人设置中获取
echo 如果没有，请先注册账号并获取authtoken
echo.
set /p CPOLAR_TOKEN="请输入您的cpolar authtoken: "

if "%CPOLAR_TOKEN%"=="" (
    echo 未输入authtoken，操作取消。
    pause
    exit /b 1
)

echo.
echo [5] 更新配置文件...
echo authtoken: %CPOLAR_TOKEN% > "%CPOLAR_CONFIG_FILE%"
echo server_addr: cn.cpolar.com:443 >> "%CPOLAR_CONFIG_FILE%"
echo trust_host_root_certs: false >> "%CPOLAR_CONFIG_FILE%"
echo web_addr: 127.0.0.1:4040 >> "%CPOLAR_CONFIG_FILE%"
echo log_level: INFO >> "%CPOLAR_CONFIG_FILE%"
echo update: false >> "%CPOLAR_CONFIG_FILE%"
echo region: cn >> "%CPOLAR_CONFIG_FILE%"

echo.
echo [6] 测试连接...
echo 正在测试cpolar连接，请稍候...
start cmd /k "title cpolar-test && cd /d E:\cpolar\cpolar && E:\cpolar\cpolar\cpolar.exe authtoken %CPOLAR_TOKEN%"

echo.
echo ================================================
echo                配置重置完成!
echo ================================================
echo.
echo 如果cpolar窗口显示"Authtoken saved"，则表示配置成功。
echo 接下来您可以运行start-cpolar-simple.cmd启动内网穿透服务。
echo.
pause 