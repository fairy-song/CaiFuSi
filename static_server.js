const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 设置CORS以允许所有源
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 提供静态文件
app.use(express.static(path.join(__dirname, 'build')));

// 处理所有/Caifusi路径的请求
app.get('/Caifusi*', (req, res) => {
  res.redirect('/#/');
});

// 处理所有路由，返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`===================================================`);
  console.log(`  财赋思静态服务器已启动，端口: ${PORT}`);
  console.log(`===================================================`);
  console.log();
  console.log(`  本地访问: http://localhost:${PORT}/#/`);
  console.log(`  局域网访问: http://<您的IP地址>:${PORT}/#/`);
  console.log(`  如使用cpolar: https://<cpolar域名>/#/`);
}); 