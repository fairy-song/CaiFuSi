// 超简易代理服务器 - 使用最基础的http模块，避免path-to-regexp错误
const http = require('http');
const fs = require('fs');
const path = require('path');

// 从命令行参数获取端口
const FRONTEND_PORT = process.argv[2] || 3000;
const BACKEND_PORT = process.argv[3] || 5001;

console.log(`启动超简易代理服务器，前端端口: ${FRONTEND_PORT}，后端端口: ${BACKEND_PORT}`);

// 检查前端构建目录
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');
const indexHtmlPath = path.join(frontendBuildPath, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendBuildPath) && 
                         fs.existsSync(indexHtmlPath) && 
                         fs.readdirSync(frontendBuildPath).length > 0;

if (hasFrontendBuild) {
  console.log(`[提示] 发现前端构建文件: ${frontendBuildPath}`);
} else {
  console.log(`[警告] 未找到前端构建文件，将只提供API代理和状态页面`);
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  const url = req.url;
  
  // 处理API请求
  if (url.startsWith('/api')) {
    console.log(`[代理] ${req.method} ${url} -> http://localhost:${BACKEND_PORT}${url}`);
    
    // 创建到后端的代理请求
    const options = {
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      // 转发响应头
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // 转发响应主体
      proxyRes.pipe(res);
    });
    
    // 错误处理
    proxyReq.on('error', (e) => {
      console.error(`[代理错误] ${e.message}`);
      res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
      res.end(`代理请求错误: ${e.message}`);
    });
    
    // 转发请求主体
    req.pipe(proxyReq);
    
    return;
  }
  
  // 处理前端请求
  if (hasFrontendBuild) {
    // 具体的路径
    let filePath;
    
    if (url === '/' || url === '/index.html') {
      filePath = indexHtmlPath;
    } else {
      // 尝试提供静态文件
      filePath = path.join(frontendBuildPath, url);
    }
    
    // 检查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        // 文件存在，提供文件
        const contentType = getContentType(filePath);
        
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('内部服务器错误');
            return;
          }
          
          res.writeHead(200, {'Content-Type': contentType});
          res.end(data);
        });
      } else {
        // 对于所有其他请求，如果是前端路由，返回index.html
        if (!url.includes('.')) {
          fs.readFile(indexHtmlPath, (err, data) => {
            if (err) {
              res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
              res.end('内部服务器错误');
              return;
            }
            
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(data);
          });
        } else {
          // 文件不存在
          res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
          res.end('文件未找到');
        }
      }
    });
  } else {
    // 没有前端构建文件，显示状态页面
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
      res.end(`
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
              <h1>财赋思应用 - 超简易代理服务器</h1>
              <div class="info">
                <p class="success">✓ 超简易代理服务器已成功启动!</p>
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
    } else {
      res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
      res.end('文件未找到');
    }
  }
});

// 根据文件扩展名获取内容类型
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  
  return contentTypes[ext] || 'application/octet-stream';
}

// 启动服务器
server.listen(FRONTEND_PORT, () => {
  console.log(`
================================================
  财赋思应用超简易代理服务器已启动
================================================

- 监听端口: ${FRONTEND_PORT}
- 后端API: http://localhost:${BACKEND_PORT}
- 代理状态: 已将所有 /api 请求转发到后端服务
- 前端文件: ${hasFrontendBuild ? frontendBuildPath : '未找到构建文件'}

访问 http://localhost:${FRONTEND_PORT} 查看应用
  `);
}); 