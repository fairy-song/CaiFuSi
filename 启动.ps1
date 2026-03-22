# 财赋思应用 主菜单
Clear-Host
Write-Host "================================================"
Write-Host "   财赋思应用 启动菜单 (PowerShell版)"
Write-Host "================================================"
Write-Host ""
Write-Host " 请选择要执行的操作:"
Write-Host ""
Write-Host " [1] 启动本地服务 (后端+代理)"
Write-Host " [2] 启动内网穿透 (Sunny-Ngrok)"
Write-Host " [3] 退出"
Write-Host ""
$choice = Read-Host -Prompt "请输入选项 (1-3)"

switch ($choice) {
    "1" {
        & "$PSScriptRoot\启动-本地服务.ps1"
    }
    "2" {
        & "$PSScriptRoot\启动-内网穿透.ps1"
    }
    "3" {
        Write-Host "退出程序..."
        exit
    }
    default {
        Write-Host "无效的选项，请重新运行脚本。" -ForegroundColor Red
        Read-Host "按Enter键退出"
    }
} 