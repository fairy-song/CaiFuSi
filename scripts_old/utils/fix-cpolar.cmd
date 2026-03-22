@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思内网穿透修复工具 (增强版)
echo ================================================
echo.

set CPOLAR_PATH=E:\cpolar\cpolar\cpolar.exe
set CPOLAR_CONFIG_DIR=%USERPROFILE%\.cpolar
set CPOLAR_CONFIG_FILE=%CPOLAR_CONFIG_DIR%\cpolar.yml

echo [1/4] 检查cpolar安装...
if not exist "%CPOLAR_PATH%" (
    echo [错误] 未找到cpolar程序: %CPOLAR_PATH%
    echo 请确认cpolar已正确安装
    pause
    exit /b 1
)

echo [2/4] 修复cpolar配置...

if not exist "%CPOLAR_CONFIG_DIR%" (
    mkdir "%CPOLAR_CONFIG_DIR%"
)

echo 请输入您的cpolar authtoken
echo 可从 https://dashboard.cpolar.com/auth 获取
echo 示例: NDdmNjlhYjEtZjkwNy00NjZjLTlkNzAtOTJhNWQyMDIwNDdk
echo.
set /p AUTH_TOKEN=请输入authtoken: 

echo.
echo 正在创建配置文件...

REM 创建临时文件，确保正确的格式和缩进
> "%TEMP%\cpolar_temp.yml" (
  echo authtoken: %AUTH_TOKEN%
  echo server_addr: cn.cpolar.com:443
  echo trust_host_root_certs: false
  echo web_addr: 127.0.0.1:4040
  echo tunnels:
  echo   frontend:
  echo     addr: 3002
  echo     proto: http
  echo     subdomain: caifusi-frontend
  echo     region: cn
  echo   backend:
  echo     addr: 5001
  echo     proto: http
  echo     subdomain: caifusi-backend
  echo     region: cn
)

REM 复制到最终位置
copy /y "%TEMP%\cpolar_temp.yml" "%CPOLAR_CONFIG_FILE%" > nul

echo 配置文件已创建在: %CPOLAR_CONFIG_FILE%
echo 配置内容:
type "%CPOLAR_CONFIG_FILE%"
echo.

echo [3/4] 检查服务是否运行...
netstat -ano | findstr ":3002" > nul
if %errorlevel% neq 0 (
    echo [警告] 前端服务似乎未运行在3002端口
    echo 请确保前端已启动并在3002端口运行
)

netstat -ano | findstr ":5001" > nul
if %errorlevel% neq 0 (
    echo [警告] 后端服务似乎未运行在5001端口
    echo 请确保后端已启动并在5001端口运行
)

echo [4/4] 启动内网穿透...
echo 尝试启动cpolar...
echo.

REM 清理旧进程
taskkill /f /im cpolar.exe 2>nul

REM 创建临时启动脚本
echo @echo off > "%TEMP%\cpolar_start.bat"
echo cd /d E:\cpolar\cpolar >> "%TEMP%\cpolar_start.bat"
echo echo 当前工作目录: >> "%TEMP%\cpolar_start.bat"
echo cd >> "%TEMP%\cpolar_start.bat"
echo echo 配置文件内容: >> "%TEMP%\cpolar_start.bat"
echo type "%CPOLAR_CONFIG_FILE%" >> "%TEMP%\cpolar_start.bat"
echo echo. >> "%TEMP%\cpolar_start.bat"
echo echo 尝试方法1: 使用start-all命令... >> "%TEMP%\cpolar_start.bat"
echo %CPOLAR_PATH% start-all >> "%TEMP%\cpolar_start.bat"
echo if %%errorlevel%% neq 0 ( >> "%TEMP%\cpolar_start.bat"
echo   echo 方法1失败，尝试方法2: 指定配置文件... >> "%TEMP%\cpolar_start.bat"
echo   %CPOLAR_PATH% start-all -config="%CPOLAR_CONFIG_FILE%" >> "%TEMP%\cpolar_start.bat"
echo   if %%errorlevel%% neq 0 ( >> "%TEMP%\cpolar_start.bat"
echo     echo 方法2失败，尝试方法3: 单独启动隧道... >> "%TEMP%\cpolar_start.bat"
echo     %CPOLAR_PATH% http 3002 >> "%TEMP%\cpolar_start.bat"
echo     echo 已启动前端穿透，请在新窗口中启动后端穿透 >> "%TEMP%\cpolar_start.bat"
echo   ) >> "%TEMP%\cpolar_start.bat"
echo ) >> "%TEMP%\cpolar_start.bat"
echo pause >> "%TEMP%\cpolar_start.bat"

echo 启动内网穿透...
start cmd /k "title 财赋思-内网穿透 && color 0E && call "%TEMP%\cpolar_start.bat""

echo.
echo ================================================
echo            穿透服务启动信息
echo ================================================
echo.
echo 前端服务: http://localhost:3002 (本地)
echo 后端服务: http://localhost:5001 (本地)
echo.
echo 穿透地址 (供移动网络访问):
echo  - 前端: https://caifusi-frontend.cpolar.cn
echo  - 后端: https://caifusi-backend.cpolar.cn
echo.
echo 如果穿透地址无法访问，请尝试手动方式:
echo  1. 打开新的命令提示符，进入cpolar目录:
echo     cd /d E:\cpolar\cpolar
echo  2. 直接用端口号启动:
echo     cpolar.exe http 3002
echo.
echo  如果一切正常，请访问以下地址检查隧道状态:
echo  http://127.0.0.1:4040
echo.
echo ================================================
echo   如果您已经注册了cpolar账户，您也可以直接登录
echo   官网dashboard查看和管理隧道:
echo   https://dashboard.cpolar.com/
echo ================================================

pause 