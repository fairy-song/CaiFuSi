# 财赋思 (Caifusi) - AI金融心智教练

## ⚠️ 重要安全提示

**本项目已移除所有硬编码的 API 密钥和敏感配置。在运行项目前，您必须正确配置环境变量。**

详细的安全配置指南请查看：[`SECURITY_SETUP.md`](SECURITY_SETUP.md)

---

## 项目介绍
财赋思是一款基于人工智能的金融心智教练应用，旨在帮助用户培养健康的财务心态，提升金融决策能力，并实现个人财务目标。

## 主要功能
- 个性化金融心智指导
- 金融知识学习与咨询
- 财务目标设定与跟踪
- 心理压力管理与情绪引导
- 交互式学习体验

## 技术栈
- 前端：React 18、Bootstrap 5、React Router
- 后端：Python Flask、智谱AI SDK
- AI模型：智谱AI GLM-4
- 数据存储：Firebase、本地存储

## 快速开始

### 1. 环境要求
- Node.js 18+
- Python 3.8+
- 智谱AI API密钥（必需）
- Firebase 项目配置（必需）

### 2. 配置环境变量 🔑

**这是最重要的步骤！** 项目需要以下 API 密钥才能正常运行：

1. **复制环境变量模板**：
   ```bash
   # Windows
   copy .env.example .env.local
   
   # Linux/Mac
   cp .env.example .env.local
   ```

2. **获取智谱AI API密钥**：
   - 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
   - 注册并创建 API 密钥
   - 在 `.env.local` 中配置：
     ```env
     ZHIPUAI_API_KEY=你的智谱AI密钥
     ```

3. **获取 Firebase 配置**：
   - 访问 [Firebase 控制台](https://console.firebase.google.com/)
   - 创建项目并获取配置信息
   - 在 `.env.local` 中配置所有 `REACT_APP_FIREBASE_*` 变量

4. **生成安全密钥**：
   ```bash
   # Python
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   将生成的密钥配置到 `.env.local` 的 `SECRET_KEY`

**详细配置步骤请查看：[`SECURITY_SETUP.md`](SECURITY_SETUP.md)**

### 3. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
pip install -r requirements.txt
```

### 4. 启动项目

**Windows用户**：
```bash
# 双击运行
快速启动.cmd
```

**手动启动**：
```bash
# 启动后端（终端1）
cd backend
python run_dev_enhanced.py

# 启动前端（终端2）
npm start
```

### 5. 访问应用

- 前端：http://localhost:3000
- 后端API：http://localhost:5001

## 本地开发
详细开发指南请查看 [`使用说明.md`](使用说明.md)

## 安全最佳实践

- ✅ 永远不要提交 `.env.local` 文件到 Git
- ✅ 定期轮换 API 密钥
- ✅ 为不同环境使用不同的密钥
- ✅ 配置 Firebase 安全规则和 API 限制
- ❌ 不要在代码中硬编码密钥
- ❌ 不要在公开仓库中提交敏感信息

详细安全指南：[`SECURITY_SETUP.md`](SECURITY_SETUP.md)

## 在线体验
访问 [https://XiaoCow666.github.io/Caifusi/](https://XiaoCow666.github.io/Caifusi/) 体验应用。

**注意**：在线版本需要配置生产环境的 API 服务器地址。

## 开源许可
本项目遵循 LICENSE 文件中规定的许可证。