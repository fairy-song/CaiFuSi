/**
 * 这个脚本用于修改React应用的homepage路径配置
 * 使用方法：node fix-homepage.js
 */
const fs = require('fs');
const path = require('path');

// 前端目录路径
const frontendPath = path.join(__dirname, 'frontend');
const packageJsonPath = path.join(frontendPath, 'package.json');

try {
    // 读取package.json
    const packageJson = require(packageJsonPath);
    
    // 显示当前homepage设置
    console.log('当前homepage设置:', packageJson.homepage);
    
    // 修改homepage为根路径
    packageJson.homepage = '/';
    
    // 写回文件
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ 成功修改homepage为: "/"');
    console.log('请重新运行npm run build来应用此更改');
} catch (error) {
    console.error('❌ 修改package.json失败:', error.message);
} 