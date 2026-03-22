// 极简版代理服务器 - 不使用http-proxy-middleware
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const app = express();

// 从命令行参数获取端口
const FRONTEND_PORT = process.argv[2] || 3000;
const BACKEND_PORT = process.argv[3] || 5001;

console.log(`启动极简代理服务器，前端端口: ${FRONTEND_PORT}，后端端口: ${BACKEND_PORT}`);

// 解析JSON请求
app.use(express.json());

// 简单的API代理实现
app.use('/api', (req, res) => {
  console.log(`[代理] ${req.method} ${req.originalUrl} -> http://localhost:${BACKEND_PORT}${req.originalUrl}`);
  
  // 创建请求选项
  const options = {
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${BACKEND_PORT}`
    }
  };
  
  // 创建代理请求
  const proxyReq = http.request(options, (proxyRes) => {
    // 转发响应头
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // 转发响应主体
    proxyRes.pipe(res);
  });
  
  // 错误处理
  proxyReq.on('error', (e) => {
    console.error('[代理错误]', e.message);
    res.status(500).send(`代理错误: ${e.message}`);
  });
  
  // 转发请求主体（如果有）
  if (req.body && Object.keys(req.body).length > 0) {
    proxyReq.write(JSON.stringify(req.body));
  }
  
  // 结束请求
  proxyReq.end();
});

// 检查前端构建目录
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');

// 如果有构建文件，提供静态文件服务
if (fs.existsSync(frontendBuildPath) && fs.readdirSync(frontendBuildPath).length > 0) {
  console.log(`[提示] 使用前端构建文件: ${frontendBuildPath}`);
  
  // 配置静态文件服务
  app.use(express.static(frontendBuildPath));
  
  // 处理所有非API路由，返回index.html (React单页应用标准做法)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
  
  console.log('[成功] 已配置前端应用静态文件服务');
} else {
  // 没有构建文件时显示状态页面
  console.log('[警告] 未找到前端构建文件，将只显示状态页面');
  
  // 简单的状态页面
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
              <div class="error">
                <p>注意: 未找到前端构建文件，仅提供API代理服务</p>
                <p>要解决此问题，请执行以下步骤之一：</p>
                <ol>
                  <li>运行前端应用构建: <code>cd frontend && npm run build</code></li>
                  <li>使用另一个隧道直接转发到前端开发服务的端口(通常是3001)</li>
                </ol>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  });
}

// 监听端口
app.listen(FRONTEND_PORT, () => {
  console.log(`
================================================
  财赋思应用极简代理服务器已启动
================================================

- 监听端口: ${FRONTEND_PORT}
- 后端API: http://localhost:${BACKEND_PORT}
- 代理状态: 已将所有 /api 请求转发到后端服务
${fs.existsSync(frontendBuildPath) ? `- 前端文件: ${frontendBuildPath}` : '- 前端状态: 未找到构建文件'}

访问 http://localhost:${FRONTEND_PORT} 查看应用
  `);
}); 