/**
 * 这个文件用于解决内网穿透时的"Invalid Host header"问题
 * 使用方法：node host-fix.js
 */
const fs = require('fs');
const path = require('path');

// 前端目录路径
const frontendPath = path.join(__dirname, 'frontend');
const envPath = path.join(frontendPath, '.env');

// 写入环境变量
const envContent = `DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_HOST=localhost
WDS_SOCKET_PORT=0
HOST=127.0.0.1`;

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ 成功创建.env文件');
    console.log('  内容:', envContent.split('\n').map(line => `    ${line}`).join('\n'));
} catch (error) {
    console.error('❌ 创建.env文件失败:', error.message);
}

// 尝试修改package.json添加一个自定义的start脚本
try {
    const packageJsonPath = path.join(frontendPath, 'package.json');
    const packageJson = require(packageJsonPath);
    
    // 备份原始start脚本
    if (!packageJson.scripts.start_original) {
        packageJson.scripts.start_original = packageJson.scripts.start;
    }
    
    // 添加自定义start脚本，设置允许所有主机
    packageJson.scripts.start_tunnel = "cross-env DANGEROUSLY_DISABLE_HOST_CHECK=true HOST=127.0.0.1 WDS_SOCKET_HOST=localhost WDS_SOCKET_PORT=0 react-scripts start";
    
    // 写回文件
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ 成功修改package.json');
    console.log('  添加了新的启动脚本: start_tunnel');
} catch (error) {
    console.error('❌ 修改package.json失败:', error.message);
    console.error('  您可以手动修改frontend/package.json文件，添加以下脚本:');
    console.error('  "start_tunnel": "cross-env DANGEROUSLY_DISABLE_HOST_CHECK=true HOST=127.0.0.1 WDS_SOCKET_HOST=localhost WDS_SOCKET_PORT=0 react-scripts start"');
}

console.log('\n🔧 解决方案说明:');
console.log('  1. 安装cross-env包: npm install --save-dev cross-env');
console.log('  2. 使用新的启动命令: npm run start_tunnel');
console.log('  3. 如果上述方法仍不生效，请考虑将前端项目构建为静态文件并使用简单的HTTP服务器:');
console.log('     - npm run build');
console.log('     - npx serve -s build'); 