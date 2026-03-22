// 代理配置文件
module.exports = {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
    secure: false,
    ws: true,
    xfwd: true,
    headers: {
      'Connection': 'keep-alive'
    },
    onProxyReq: function(proxyReq, req, res) {
      // 保留原始的host和origin
      proxyReq.setHeader('Host', 'localhost:5001');
      proxyReq.setHeader('Origin', 'http://localhost:5001');
      
      // 确保请求体被正确转发
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    }
  }
}; 