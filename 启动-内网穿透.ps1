# 财赋思应用启动脚本 - 内网穿透
Clear-Host
Write-Host "================================================"
Write-Host "   财赋思应用 内网穿透启动 (PowerShell版)"
Write-Host "================================================"
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 3000

# 确保scripts_new/tunnel/sunnyNgrok目录存在
$sunnyNgrokPath = "$scriptPath\scripts_new\tunnel\sunnyNgrok"
if (-not (Test-Path $sunnyNgrokPath)) {
    Write-Host "[提示] 创建Sunny-Ngrok目录..."
    New-Item -ItemType Directory -Path $sunnyNgrokPath -Force | Out-Null

    # 检查是否存在原始的SunnyNgrok目录
    $originalPath = "$scriptPath\scripts\tunnel\sunnyNgrok"
    if (Test-Path $originalPath) {
        Write-Host "[提示] 复制Sunny-Ngrok文件..."
        Copy-Item -Path "$originalPath\*" -Destination $sunnyNgrokPath -Recurse -Force
        Write-Host "[成功] 已复制Sunny-Ngrok文件" -ForegroundColor Green
    } else {
        Write-Host "[警告] 未找到原始Sunny-Ngrok目录，请手动复制sunny.exe到 $sunnyNgrokPath" -ForegroundColor Yellow
    }
}

# 检查sunny.exe是否存在
if (-not (Test-Path "$sunnyNgrokPath\sunny.exe")) {
    Write-Host "[错误] 未找到sunny.exe文件，请确保它存在于 $sunnyNgrokPath 目录中" -ForegroundColor Red
    Write-Host "您可能需要从官网下载Sunny-Ngrok客户端并放置在正确的位置" -ForegroundColor Yellow
    Read-Host "按Enter键退出"
    exit 1
}

# 启动内网穿透
Write-Host ""
Write-Host "[1/1] 启动内网穿透..."
Write-Host "注意: 您可能需要修改脚本中的隧道ID" -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/c cd $sunnyNgrokPath && sunny.exe clientid 隧道id -p $port" -WindowStyle Normal

Write-Host ""
Write-Host "================================================"
Write-Host "                穿透已启动!"
Write-Host "================================================"
Write-Host ""
Write-Host "  请确保本地服务已运行在端口: $port"
Write-Host "  然后通过Sunny-Ngrok提供的域名访问应用"
Write-Host ""
Write-Host "  首次使用时，您需要修改此脚本，将"隧道id"替换为您的实际隧道ID"
Write-Host ""
Read-Host "按Enter键退出此窗口(但保持隧道运行)" 