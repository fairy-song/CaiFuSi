@echo off
chcp 65001 >nul
echo ================================================
echo    GitHub上传前安全检查
echo ================================================
echo.

echo [检查1] 验证 .gitignore 配置...
findstr /C:".env.local" .gitignore >nul
if %errorlevel% equ 0 (
    echo ✓ .gitignore 已配置忽略 .env.local
) else (
    echo ✗ .gitignore 未配置忽略 .env.local
    echo   请添加 .env.local 到 .gitignore
    pause
    exit /b 1
)
echo.

echo [检查2] 验证配置文件中无硬编码密钥...
findstr /C:"50098b0e6eca4c86aff0d238c06227a2" backend\app\services\config.py >nul
if %errorlevel% equ 0 (
    echo ✗ backend\app\services\config.py 仍包含硬编码密钥
    pause
    exit /b 1
) else (
    echo ✓ backend\app\services\config.py 已移除硬编码密钥
)

findstr /C:"50098b0e6eca4c86aff0d238c06227a2" backend\app\config.py >nul
if %errorlevel% equ 0 (
    echo ✗ backend\app\config.py 仍包含硬编码密钥
    pause
    exit /b 1
) else (
    echo ✓ backend\app\config.py 已移除硬编码密钥
)

findstr /C:"50098b0e6eca4c86aff0d238c06227a2" backend\run_dev_enhanced.py >nul
if %errorlevel% equ 0 (
    echo ✗ backend\run_dev_enhanced.py 仍包含硬编码密钥
    pause
    exit /b 1
) else (
    echo ✓ backend\run_dev_enhanced.py 已移除硬编码密钥
)
echo.

echo [检查3] 验证环境变量文件存在...
if exist .env.example (
    echo ✓ .env.example 模板文件存在
) else (
    echo ✗ .env.example 模板文件不存在
    pause
    exit /b 1
)

if exist .env.local (
    echo ✓ .env.local 本地配置存在
) else (
    echo ✗ .env.local 本地配置不存在
    pause
    exit /b 1
)
echo.

echo [检查4] 验证Git状态...
git status --short | findstr ".env.local" >nul
if %errorlevel% equ 0 (
    echo ✗ .env.local 在Git待提交列表中！
    echo   这个文件不应该被提交，请检查 .gitignore
    pause
    exit /b 1
) else (
    echo ✓ .env.local 不在Git待提交列表中
)
echo.

echo ================================================
echo    ✓ 所有检查通过！可以安全上传到GitHub
echo ================================================
echo.
echo 建议的上传命令：
echo   git add .
echo   git commit -m "feat: 完成AI教练功能，保护API密钥"
echo   git push origin main
echo.
pause
