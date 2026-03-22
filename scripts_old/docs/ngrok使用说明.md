# ngrok内网穿透使用说明

## 简介

ngrok是一款功能强大的内网穿透工具，可以将本地运行的Web服务安全地暴露到互联网。通过ngrok，您可以：
- 让外部用户访问本地开发的应用
- 测试WebHooks
- 在移动设备上演示您的Web应用
- 远程访问您的应用

## 使用步骤

### 1. 下载并安装ngrok

运行`start-ngrok-tunnel.cmd`脚本时，会自动下载并安装ngrok到项目目录下的`ngrok`文件夹中。您也可以从[ngrok官网](https://ngrok.com/download)手动下载安装。

### 2. 注册ngrok账号

1. 访问[ngrok官网](https://ngrok.com)，点击"Sign up"注册一个账号
2. 注册完成后，登录到控制台
3. 在左侧菜单找到"Your Authtoken"，复制您的authtoken

### 3. 配置authtoken

首次运行`start-ngrok-tunnel.cmd`脚本时，会提示您输入authtoken。您也可以手动运行以下命令配置：

```
ngrok.exe authtoken 您的authtoken
```

### 4. 启动内网穿透

运行`start-ngrok-tunnel.cmd`脚本，它会自动：
1. 启动本地前端和后端服务
2. 为前端和后端分别启动ngrok隧道
3. 在命令行窗口中显示转发URL

### 5. 使用公网URL

启动成功后，ngrok会为每个服务分配一个公网URL，格式如：
- 前端：`https://xxxx-xxxx-xxxx-xxxx.ngrok.io`
- 后端：`https://xxxx-xxxx-xxxx-xxxx.ngrok.io`

这些URL可以从任何地方访问您的本地服务。

## 注意事项

1. **免费版限制**：
   - 免费版ngrok每次启动会随机分配URL
   - 连接会在8小时后超时
   - 有带宽和连接数限制

2. **付费版特性**：
   - 可以设置固定子域名
   - 自定义域名支持
   - 更长的会话时间
   - 更高的带宽和连接数限制

3. **安全建议**：
   - 不要在生产环境长期使用ngrok
   - 注意保护您的authtoken
   - 必要时使用ngrok的身份验证功能限制访问

## 常见问题

1. **连接被拒绝**：确保本地服务正在运行，并且端口配置正确

2. **URL无法访问**：检查ngrok会话是否仍在运行，免费版有会话时长限制

3. **配置authtoken失败**：确保网络连接正常，authtoken正确无误

4. **想要固定域名**：升级到ngrok付费版可以获得固定子域名功能

## 更多资源

- [ngrok官方文档](https://ngrok.com/docs)
- [ngrok控制面板](https://dashboard.ngrok.com)
- [ngrok API参考](https://ngrok.com/docs/api) 