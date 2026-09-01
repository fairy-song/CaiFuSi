const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 配置API代理 (http-proxy-middleware v3: 使用 pathFilter 匹配,不能挂载在 '/api' 前缀下)
  app.use(
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathFilter: '/api',
      logLevel: 'debug',
    })
  );

  // 允许所有源的跨域请求
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // 处理/Caifusi路径的重定向
    if (req.path === '/Caifusi' || req.path.startsWith('/Caifusi/')) {
      return res.redirect('/#/');
    }
    
    next();
  });
}; 