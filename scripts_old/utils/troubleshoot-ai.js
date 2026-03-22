// AI服务状态检测和问题诊断工具
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 设置参数
const BACKEND_URL = process.argv[2] || 'http://localhost:5001';
const API_PATH = '/api/coach/chat';
const TEST_MESSAGE = {
  user_message: "这是一个测试消息，请检查AI服务是否正常工作",
  conversation_history: [],
  session_id: `test-session-${Date.now()}`
};

// 控制台颜色
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 打印带颜色的信息
function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 清屏并打印标题
console.clear();
log('cyan', `
================================================
        财赋思AI服务状态检测工具
================================================
`);

// 检测服务状态
log('blue', `[1/4] 检测后端服务状态...`);
const backendUrl = new URL(BACKEND_URL);
const apiUrl = new URL(API_PATH, BACKEND_URL).toString();

function sendTestRequest() {
  return new Promise((resolve, reject) => {
    log('blue', `[2/4] 向 ${apiUrl} 发送测试请求...`);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Service-Diagnostic-Tool',
        'Origin': backendUrl.origin
      }
    };
    
    // 根据协议选择http或https模块
    const client = backendUrl.protocol === 'https:' ? https : http;
    
    const req = client.request(apiUrl, options, (res) => {
      let data = '';
      
      log('blue', `[状态] 响应状态码: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          log('blue', `[3/4] 接收到响应数据，长度: ${data.length} 字节`);
          
          // 尝试解析JSON
          let jsonData = null;
          try {
            jsonData = JSON.parse(data);
          } catch (e) {
            log('yellow', `[警告] 响应不是有效的JSON格式: ${e.message}`);
          }
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            jsonData: jsonData
          });
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      log('red', `[错误] 请求失败: ${e.message}`);
      reject(e);
    });
    
    // 写入请求体
    req.write(JSON.stringify(TEST_MESSAGE));
    req.end();
  });
}

// 主诊断函数
async function diagnose() {
  try {
    // 检查服务是否可访问
    try {
      const pingUrl = new URL('/api/health', BACKEND_URL).toString();
      log('blue', `尝试ping后端健康检查接口: ${pingUrl}`);
      
      const client = backendUrl.protocol === 'https:' ? https : http;
      await new Promise((resolve, reject) => {
        const req = client.get(pingUrl, { timeout: 5000 }, (res) => {
          log('green', `[成功] 后端服务可访问，状态码: ${res.statusCode}`);
          resolve();
        });
        
        req.on('error', (e) => {
          log('yellow', `[警告] 无法访问后端健康检查接口: ${e.message}`);
          resolve(); // 继续执行，不中断诊断
        });
        
        req.on('timeout', () => {
          log('yellow', `[警告] 健康检查接口请求超时`);
          req.abort();
          resolve(); // 继续执行，不中断诊断
        });
      });
    } catch (e) {
      log('yellow', `[警告] 健康检查失败: ${e.message}`);
    }
    
    // 发送测试请求
    const response = await sendTestRequest();
    
    // 分析响应
    log('blue', `[4/4] 分析响应...`);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      log('green', `[成功] 服务器返回成功状态码: ${response.statusCode}`);
    } else {
      log('red', `[错误] 服务器返回错误状态码: ${response.statusCode}`);
    }
    
    // 检查响应内容
    if (response.jsonData) {
      // 判断是否为默认的测试回复
      if (response.data.includes('测试回复') && response.data.includes('AI服务正在启动中')) {
        log('yellow', `[问题检测] 发现AI服务正在返回默认测试回复`);
        log('yellow', `---------------------------------------------`);
        log('yellow', `问题原因: 后端服务可能未完全初始化或AI模型加载未完成`);
        log('yellow', `建议解决方案:`);
        log('yellow', `1. 请确保后端服务已完全启动 (通常需要等待30-60秒)`);
        log('yellow', `2. 检查后端服务窗口输出是否有错误信息`);
        log('yellow', `3. 尝试重启后端服务`);
      } else {
        log('green', `[成功] AI服务正在返回实际响应，而不是测试回复`);
        log('green', `---------------------------------------------`);
        log('green', `服务响应预览:`);
        
        if (typeof response.jsonData === 'object') {
          if (response.jsonData.response) {
            log('cyan', response.jsonData.response.substring(0, 150) + (response.jsonData.response.length > 150 ? '...' : ''));
          } else {
            log('cyan', JSON.stringify(response.jsonData).substring(0, 150) + '...');
          }
        } else {
          log('cyan', String(response.jsonData).substring(0, 150) + '...');
        }
      }
    } else {
      log('red', `[错误] 响应不是有效的JSON格式`);
      log('yellow', `响应内容预览 (前150个字符):`);
      log('yellow', response.data.substring(0, 150) + (response.data.length > 150 ? '...' : ''));
    }
    
  } catch (error) {
    log('red', `[错误] 诊断过程中出现错误: ${error.message}`);
    log('red', `请检查后端服务是否正在运行，以及网络连接是否正常。`);
  }
}

// 执行诊断
diagnose().then(() => {
  console.log('\n');
  log('cyan', `================================================`);
  log('cyan', `         诊断完成，按任意键退出          `);
  log('cyan', `================================================`);
  
  // 等待用户按键后退出
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', process.exit.bind(process, 0));
}); 