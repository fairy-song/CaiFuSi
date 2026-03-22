// 前后端代理服务器
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const app = express();

// 从命令行参数获取端口
const FRONTEND_PORT = process.argv[2] || 3000;
const BACKEND_PORT = process.argv[3] || 5001;

console.log(`启动代理服务器，前端端口: ${FRONTEND_PORT}，后端端口: ${BACKEND_PORT}`);

// 解析JSON请求体
app.use(express.json());

// 配置API代理 - 简化配置，避免path-to-regexp错误
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${BACKEND_PORT}`,
  changeOrigin: true,
  ws: true
}));

// 检查前端构建目录
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');

// 使用构建好的前端文件
if (fs.existsSync(frontendBuildPath) && fs.readdirSync(frontendBuildPath).length > 0) {
  console.log(`[提示] 使用前端构建文件: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));
  
  // 对于任何未匹配的路由，返回index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
} else {
  // 如果没有构建文件，显示简单的状态页面
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>财赋思应用 - 代理模式</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; }
            .container { max-width: 800px; margin: 0 auto; }
            .info { background: #f4f4f4; padding: 20px; border-radius: 5px; }
            .success { color: green; }
            .error { color: red; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>财赋思应用 - 代理服务器正在运行</h1>
            <div class="info">
              <p class="success">✓ 代理服务器已成功启动!</p>
              <p>所有 /api 请求已被代理到后端服务: <b>http://localhost:${BACKEND_PORT}</b></p>
              <p>请使用您的Sunny-Ngrok隧道URL访问此应用。</p>
              <div class="error">
                <p>注意: 未找到前端构建文件</p>
                <p>请确保前端应用已经构建或运行在端口3001上</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  });
}

// 启动服务器
app.listen(FRONTEND_PORT, () => {
  console.log(`
================================================
  财赋思应用代理服务器已启动
================================================

- 前端页面: http://localhost:${FRONTEND_PORT}
- 后端API: http://localhost:${BACKEND_PORT}/api
- 代理状态: 已将所有 /api 请求转发到后端服务

访问 http://localhost:${FRONTEND_PORT} 开始使用应用
`);
}); 