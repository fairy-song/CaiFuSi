/**
 * 财赋思应用 - 简单静态服务器
 * 提供静态文件托管和API代理
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const PROXY_TIMEOUT_MS = 30000;
const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'upgrade'
]);

// 获取命令行参数
const args = process.argv.slice(2);
const FRONTEND_PORT = args[0] || 3000;
const BACKEND_PORT = args[1] || 5001;
const BACKEND_API = `http://localhost:${BACKEND_PORT}`;

// 创建Express应用
const app = express();

// 解析JSON请求体
app.use(express.json());

const sanitizeProxyHeaders = (headers = {}) => {
  const result = {};

  Object.entries(headers).forEach(([key, value]) => {
    if (!HOP_BY_HOP_HEADERS.has(String(key).toLowerCase())) {
      result[key] = value;
    }
  });

  return result;
};

const buildProxyErrorResponse = (error) => {
  if (error.name === 'AbortError') {
    return {
      status: 504,
      payload: {
        error: '代理请求超时',
        message: '后端服务响应超时，请稍后重试',
        backend: BACKEND_API
      }
    };
  }

  return {
    status: 502,
    payload: {
      error: '代理服务器错误',
      message: error.message,
      backend: BACKEND_API
    }
  };
};

// API代理 - 手动实现，不使用http-proxy-middleware
app.all('/api/*', async (req, res) => {
  const apiPath = req.path;
  const targetUrl = `${BACKEND_API}${apiPath}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

  console.log(`[代理] ${req.method} ${apiPath} -> ${targetUrl}`);

  try {
    // 使用fetch API进行代理
    const fetch = (await import('node-fetch')).default;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

    const options = {
      method: req.method,
      headers: sanitizeProxyHeaders({
        'Content-Type': 'application/json',
        ...req.headers
      }),
      signal: controller.signal
    };

    // 如果有请求体，添加到options
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body ?? {});
    }

    const response = await fetch(targetUrl, options);
    const data = await response.text();
    clearTimeout(timeoutId);

    // 设置响应头
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(String(key).toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // 发送响应
    res.send(data);
  } catch (error) {
    console.error(`[错误] 代理请求失败:`, error.message);
    const proxyError = buildProxyErrorResponse(error);
    res.status(proxyError.status).json(proxyError.payload);
  }
});

// 查找前端构建文件夹
const buildPath = path.join(__dirname, 'build');
const hasBuildFolder = fs.existsSync(buildPath);

if (hasBuildFolder) {
  console.log(`找到前端构建文件，将提供静态文件服务`);
  app.use(express.static(buildPath));
  
  // 对于SPA应用，将所有未匹配的路由指向index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
} else {
  // 创建一个简单的首页
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>财赋思应用 - 静态服务器</title>
        <style>
          body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #1e88e5;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          .status {
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 12px;
            margin: 15px 0;
          }
          .warning {
            background-color: #fff8e1;
            border-left: 4px solid #ff9800;
            padding: 12px;
            margin: 15px 0;
          }
          code {
            background-color: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: Consolas, monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>财赋思应用 - 静态服务器</h1>
          
          <div class="status">
            <strong>状态:</strong> 服务器正在运行
            <p>API 请求将被转发到: <code>${BACKEND_API}</code></p>
          </div>
          
          <div class="warning">
            <strong>注意:</strong> 未找到前端构建文件。
            <p>请运行 <code>npm run build</code> 生成前端构建文件。</p>
          </div>
          
          <h2>API 端点测试</h2>
          <ul>
            <li>后端状态: <span id="backend-status">检查中...</span></li>
          </ul>
          
          <script>
            fetch('/api/health', { method: 'GET' })
              .then(response => response.ok ? '在线 ✓' : '离线 ✗')
              .then(status => {
                document.getElementById('backend-status').textContent = status;
                document.getElementById('backend-status').style.color = status.includes('✓') ? 'green' : 'red';
              })
              .catch(() => {
                document.getElementById('backend-status').textContent = '离线 ✗';
                document.getElementById('backend-status').style.color = 'red';
              });
          </script>
        </div>
      </body>
      </html>
    `);
  });
}

// 启动服务器
app.listen(FRONTEND_PORT, () => {
  console.log('================================================');
  console.log(`  财赋思应用静态服务器已启动`);
  console.log('================================================');
  console.log(`- 前端页面: http://localhost:${FRONTEND_PORT}`);
  console.log(`- 后端API: ${BACKEND_API}/api`);
  console.log('- 代理状态: 已将所有 /api 请求转发到后端服务');
  if (!hasBuildFolder) {
    console.log('[警告] 未找到前端构建文件，将只提供API代理和状态页面');
  }
  console.log(`访问 http://localhost:${FRONTEND_PORT} 开始使用应用`);
});