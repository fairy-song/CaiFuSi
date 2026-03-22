const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const TARGET_PORT = process.env.TARGET_PORT || 3000;

// 允许所有源的跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 处理根路径重定向
app.get('/', (req, res) => {
  res.redirect('/#/');
});

// 处理/Caifusi路径重定向
app.get('/Caifusi*', (req, res) => {
  res.redirect('/#/');
});

// 提供404页面
app.get('/404.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

// 代理所有其他请求到React开发服务器
app.use('/', createProxyMiddleware({
  target: `http://localhost:${TARGET_PORT}`,
  changeOrigin: true,
  logLevel: 'debug',
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`  财赋思cpolar代理服务器已启动，端口: ${PORT}`);
  console.log(`===================================================`);
  console.log();
  console.log(`  本地访问: http://localhost:${PORT}/`);
  console.log(`  目标React服务: http://localhost:${TARGET_PORT}`);
  console.log(`  cpolar访问: https://<cpolar域名>/`);
}); 