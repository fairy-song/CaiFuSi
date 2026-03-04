# 财赋思项目 - GitHub上传前的API密钥保护方案

## 🔒 保护API密钥的完整方案

### 步骤1: 更新 .gitignore（已完成✅）

你的 [`.gitignore`](.gitignore:72) 已经包含了关键配置：
```
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 步骤2: 移除代码中的硬编码密钥

需要修改以下文件，将硬编码的API密钥替换为环境变量：

#### 2.1 backend/app/services/config.py
**当前状态**：包含硬编码密钥
**需要修改为**：
```python
ZHIPUAI_API_KEY = os.environ.get("ZHIPUAI_API_KEY", "YOUR_API_KEY_HERE")
```

#### 2.2 backend/app/config.py
**当前状态**：包含硬编码密钥
**需要修改为**：
```python
ZHIPUAI_API_KEY = os.environ.get('ZHIPUAI_API_KEY', 'YOUR_API_KEY_HERE')
```

#### 2.3 backend/run_dev_enhanced.py
**当前状态**：包含硬编码密钥
**需要修改为**：
```python
# 不在代码中设置密钥，改为从环境变量读取
# os.environ["ZHIPUAI_API_KEY"] = "50098b0e6eca4c86aff0d238c06227a2.YZCIj2wn1SWB0Dtz"
```

### 步骤3: 创建环境变量模板文件

创建 `.env.example` 文件（可以上传到GitHub）：
```env
# 智谱AI API密钥
# 请访问 https://open.bigmodel.cn/ 获取你的API密钥
ZHIPUAI_API_KEY=YOUR_API_KEY_HERE

# Firebase配置（如果使用）
FIREBASE_API_KEY=YOUR_FIREBASE_KEY
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

### 步骤4: 创建本地环境变量文件

创建 `.env.local` 文件（不会上传到GitHub）：
```env
ZHIPUAI_API_KEY=50098b0e6eca4c86aff0d238c06227a2.YZCIj2wn1SWB0Dtz
```

### 步骤5: 更新启动脚本

修改 `快速启动.cmd`，在启动前加载环境变量：
```cmd
REM 设置环境变量（从.env.local读取）
if exist .env.local (
    for /f "tokens=1,2 delims==" %%a in (.env.local) do (
        set %%a=%%b
    )
)
```

### 步骤6: 更新README.md

添加配置说明：
```markdown
## 配置API密钥

1. 复制 `.env.example` 为 `.env.local`
2. 编辑 `.env.local`，填入你的智谱AI API密钥
3. 运行 `快速启动.cmd`
```

### 步骤7: 检查Git历史

如果之前已经提交过包含密钥的文件，需要清理Git历史：
```bash
# 从Git历史中移除敏感文件
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/app/services/config.py" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送（谨慎使用）
git push origin --force --all
```

## ⚠️ 重要提醒

1. **立即更换密钥**：如果密钥已经泄露到GitHub，立即在智谱AI平台删除旧密钥并生成新密钥
2. **检查提交历史**：确保之前的提交中没有包含密钥
3. **使用GitHub Secrets**：如果使用GitHub Actions，将密钥存储在Repository Secrets中

## 📋 上传前检查清单

- [ ] `.gitignore` 包含 `.env.local` 和 `.env.development.local`
- [ ] 所有配置文件中的密钥都替换为 `YOUR_API_KEY_HERE`
- [ ] 创建了 `.env.example` 模板文件
- [ ] 创建了 `.env.local` 本地配置（不上传）
- [ ] 更新了 README.md 添加配置说明
- [ ] 运行 `git status` 确认敏感文件不在待提交列表中

## 🚀 安全上传流程

```bash
# 1. 检查状态
git status

# 2. 确认 .env.local 不在列表中
# 如果出现，说明 .gitignore 没生效

# 3. 添加文件
git add .

# 4. 提交
git commit -m "feat: 完成AI教练功能，保护API密钥"

# 5. 推送
git push origin main
```

需要我帮你执行这些修改吗？
