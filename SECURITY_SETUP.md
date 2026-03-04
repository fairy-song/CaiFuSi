# 安全配置指南

## 重要提示 ⚠️

本项目已移除所有硬编码的 API 密钥和敏感配置。在运行项目前，您**必须**正确配置环境变量。

---

## 快速开始

### 1. 创建环境变量文件

复制 `.env.example` 文件并重命名为 `.env.local`：

```bash
# Windows
copy .env.example .env.local

# Linux/Mac
cp .env.example .env.local
```

### 2. 配置必需的环境变量

编辑 `.env.local` 文件，填入真实的配置值：

#### 2.1 智谱 AI API 密钥（必需）

```env
ZHIPUAI_API_KEY=你的智谱AI密钥
```

**获取方式：**
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 在控制台创建 API 密钥
4. 复制密钥并粘贴到 `.env.local` 文件

#### 2.2 Firebase 配置（必需）

```env
REACT_APP_FIREBASE_API_KEY=你的Firebase_API密钥
REACT_APP_FIREBASE_AUTH_DOMAIN=你的项目.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=你的项目ID
REACT_APP_FIREBASE_STORAGE_BUCKET=你的项目.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=你的发送者ID
REACT_APP_FIREBASE_APP_ID=你的应用ID
REACT_APP_FIREBASE_MEASUREMENT_ID=你的测量ID
```

**获取方式：**
1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 选择你的项目（或创建新项目）
3. 进入项目设置 → 常规 → 你的应用
4. 复制 Firebase SDK 配置信息

**重要：配置 Firebase 安全规则**
- 在 Firebase 控制台配置 API 密钥限制
- 设置允许的 HTTP referrer（域名白名单）
- 配置 Firestore 安全规则，限制数据访问权限

#### 2.3 安全密钥（必需）

```env
SECRET_KEY=你的随机密钥
```

**生成方式：**

```bash
# Python
python -c "import secrets; print(secrets.token_hex(32))"

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 在线生成
# 访问 https://randomkeygen.com/
```

#### 2.4 其他可选配置

```env
# Google Gemini AI（如果使用）
GEMINI_API_KEY=你的Gemini密钥

# Firebase Admin SDK（后端使用）
FIREBASE_ADMIN_SDK_PATH=path/to/serviceAccountKey.json

# API 基础 URL（生产环境）
REACT_APP_API_URL=https://你的API服务器地址

# CORS 额外允许的来源（用逗号分隔）
CORS_ALLOWED_ORIGINS=https://example.com,https://app.example.com
```

---

## 安全最佳实践

### ✅ 应该做的

1. **永远不要提交 `.env.local` 文件到 Git**
   - 已在 `.gitignore` 中配置忽略
   - 定期检查 `git status` 确保未被追踪

2. **定期轮换 API 密钥**
   - 建议每 3-6 个月更换一次
   - 如果怀疑密钥泄露，立即撤销并重新生成

3. **使用不同的密钥用于不同环境**
   - 开发环境使用测试密钥
   - 生产环境使用独立的生产密钥

4. **配置 API 密钥限制**
   - Firebase: 设置 HTTP referrer 限制
   - 智谱 AI: 在控制台配置 IP 白名单或域名限制

5. **启用 Firebase 安全规则**
   ```javascript
   // Firestore 安全规则示例
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // 只允许认证用户访问自己的数据
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### ❌ 不应该做的

1. **不要在代码中硬编码密钥**
   - 使用环境变量
   - 使用密钥管理服务（如 AWS Secrets Manager）

2. **不要在客户端代码中使用服务端密钥**
   - Firebase Admin SDK 密钥只能在后端使用
   - 前端只使用 Firebase Web SDK 配置

3. **不要在公开仓库中提交密钥**
   - 即使后续删除，Git 历史中仍会保留
   - 如果不慎提交，立即撤销密钥

4. **不要使用弱密钥**
   - 使用强随机生成器
   - 密钥长度至少 32 字符

---

## 验证配置

### 检查环境变量是否正确加载

**前端（React）：**
```javascript
// 在浏览器控制台运行
console.log('Firebase API Key:', process.env.REACT_APP_FIREBASE_API_KEY ? '已配置' : '未配置');
console.log('API URL:', process.env.REACT_APP_API_URL || '使用默认值');
```

**后端（Python）：**
```python
# 在 Python 终端运行
import os
print('ZHIPUAI_API_KEY:', '已配置' if os.getenv('ZHIPUAI_API_KEY') else '未配置')
print('SECRET_KEY:', '已配置' if os.getenv('SECRET_KEY') else '未配置')
```

---

## 部署到生产环境

### Vercel / Netlify

1. 在项目设置中添加环境变量
2. 确保所有 `REACT_APP_*` 变量都已配置
3. 重新部署应用

### 自托管服务器

1. 在服务器上创建 `.env.local` 文件
2. 配置所有必需的环境变量
3. 确保文件权限正确（仅所有者可读）：
   ```bash
   chmod 600 .env.local
   ```

### Docker

```dockerfile
# 使用 .env.local 文件
docker run --env-file .env.local your-image

# 或通过 -e 参数传递
docker run -e ZHIPUAI_API_KEY=xxx -e SECRET_KEY=xxx your-image
```

---

## 故障排查

### 错误：环境变量未设置

**症状：**
```
ValueError: ZHIPUAI_API_KEY 环境变量未设置！
```

**解决方案：**
1. 确认 `.env.local` 文件存在
2. 检查文件中是否有对应的环境变量
3. 重启开发服务器

### 错误：Firebase 配置缺失

**症状：**
```
Firebase 配置缺失！请在 .env.local 文件中配置...
```

**解决方案：**
1. 检查所有 `REACT_APP_FIREBASE_*` 变量是否都已配置
2. 确认变量名拼写正确（区分大小写）
3. 清除浏览器缓存并重新加载

### 错误：CORS 问题

**症状：**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**解决方案：**
1. 检查后端 CORS 配置中是否包含前端域名
2. 如需添加额外域名，配置 `CORS_ALLOWED_ORIGINS` 环境变量
3. 重启后端服务

---

## 紧急情况：密钥泄露

如果您不慎将密钥提交到公开仓库：

1. **立即撤销所有泄露的密钥**
   - 智谱 AI: 在控制台删除密钥
   - Firebase: 在控制台删除/重置 API 密钥
   - Google Gemini: 在 Google Cloud Console 撤销密钥

2. **生成新的密钥**
   - 按照上述步骤重新获取密钥
   - 更新 `.env.local` 文件

3. **清理 Git 历史**（可选但推荐）
   ```bash
   # 使用 BFG Repo-Cleaner 或 git-filter-repo
   # 警告：这会重写 Git 历史
   git filter-repo --path .env.local --invert-paths
   ```

4. **通知团队成员**
   - 如果是团队项目，通知所有成员更新密钥

---

## 联系支持

如有任何安全相关问题，请联系：
- 项目维护者
- 安全团队邮箱（如有）

**记住：安全是每个人的责任！** 🔒
