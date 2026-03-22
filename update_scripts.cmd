@echo off
chcp 65001 >nul
cls
echo ================================================
echo   财赋思应用 脚本更新工具
echo ================================================
echo.
echo 此工具将删除旧的scripts目录，并启用新的简化脚本结构。
echo.
echo 警告: 此操作不可逆，请确保您已备份需要的自定义脚本!
echo.
set /p confirm=确认继续? (Y/N): 

if /i not "%confirm%"=="Y" (
    echo.
    echo 操作已取消。
    pause
    exit
)

echo.
echo [1/3] 备份重要文件...
if not exist scripts_backup mkdir scripts_backup
if exist scripts\docs xcopy /E /I /Y scripts\docs scripts_backup\docs > nul

echo [2/3] 替换脚本目录...
ren scripts scripts_old
ren scripts_new scripts

echo [3/3] 清理...
echo 操作完成! 如有需要，旧脚本在scripts_old目录中。
echo.
echo 现在您可以使用以下命令启动应用:
echo   - scripts\start.cmd
echo.
pause 