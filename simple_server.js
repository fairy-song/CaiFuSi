const http = require('http');
const fs = require('fs');
const path = require('path');

// 定义一系列可能的端口，如果前面的被占用，会尝试下一个
const PORTS = [8080, 8081, 8082, 8083, 9000, 9090];
const BUILD_DIR = path.join(__dirname, 'build');
const INDEX_HTML = path.join(BUILD_DIR, 'index.html');

// 简易MIME类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  console.log(`请求: ${req.method} ${req.url}`);
  
  // 处理/Caifusi路径或根路径的重定向
  if (req.url.includes('/Caifusi') || req.url === '/') {
    res.writeHead(302, { 'Location': '/#/' });
    res.end();
    return;
  }
  
  // 从URL解析文件路径
  let filePath = BUILD_DIR + req.url;
  if (filePath === BUILD_DIR + '/') {
    filePath = INDEX_HTML;
  }
  
  // 获取文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // 尝试读取文件
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // 文件不存在，返回index.html (SPA应用)
      fs.readFile(INDEX_HTML, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('服务器错误，找不到index.html');
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      });
      return;
    }
    
    // 文件存在，返回文件内容
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

// 函数：尝试在不同端口启动服务器
function tryStartServer(portIndex = 0) {
  if (portIndex >= PORTS.length) {
    console.log('无法找到可用端口，请手动终止占用端口的程序');
    process.exit(1);
    return;
  }
  
  const PORT = PORTS[portIndex];
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`===================================================`);
    console.log(`  财赋思简易静态服务器已启动，端口: ${PORT}`);
    console.log(`===================================================`);
    console.log();
    console.log(`  本地访问: http://localhost:${PORT}/#/`);
    console.log(`  cpolar访问: https://<cpolar域名>/#/`);
    console.log(`  注意: 请确保cpolar映射到端口 ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`端口 ${PORT} 已被占用，尝试下一个端口...`);
      tryStartServer(portIndex + 1);
    } else {
      console.error('启动服务器时发生错误:', err);
      process.exit(1);
    }
  });
}

// 开始尝试启动服务器
tryStartServer(); 