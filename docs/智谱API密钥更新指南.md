# 智谱API密钥更新指南

## 问题描述

AI教练功能无法正常工作，无法连接到智谱API，这是因为当前使用的API密钥已经过期。

## 解决方案

需要在智谱AI开放平台获取新的API密钥，并更新项目配置。

### 步骤1：注册并获取新的API密钥

1. 访问智谱AI开放平台：[https://open.bigmodel.cn/](https://open.bigmodel.cn/)
2. 注册账号并登录（如果已有账号，直接登录即可）
3. 完成实名认证（个人或企业认证均可）
4. 在用户中心找到"API Keys"选项
5. 创建新的API Key，记录下生成的密钥

> 注意：智谱AI通常会提供一定的免费额度，新注册用户可获得18元的调用额度（约100万token），实名认证后可额外获得400万token的额度，有效期通常为1个月。

### 步骤2：更新项目配置

有两种方式可以更新API密钥：

#### 方式一：直接修改配置文件

1. 打开 `backend/app/config.py` 文件
2. 找到 `ZHIPUAI_API_KEY` 配置项
3. 将获取到的新密钥替换 `YOUR_NEW_API_KEY` 占位符：

```python
ZHIPUAI_API_KEY = os.environ.get('ZHIPUAI_API_KEY') or '您的新API密钥'
```

4. 保存文件

#### 方式二：使用环境变量（推荐）

1. 打开 `backend/run_dev_enhanced.py` 文件
2. 找到环境变量设置部分
3. 取消注释并更新API密钥：

```python
# 如果您已获取新密钥，请取消下面这行的注释并替换YOUR_NEW_API_KEY
os.environ["ZHIPUAI_API_KEY"] = "您的新API密钥"
```

4. 保存文件

### 步骤3：重启服务

更新API密钥后，需要重启服务以使更改生效：

1. 关闭当前运行的后端服务（如果有）
2. 使用启动脚本重新启动服务：
   - Windows: 双击 `direct_start.cmd`
   - PowerShell: 运行 `./start.ps1`

## 验证

服务启动后，可以通过以下方式验证API连接是否正常：

1. 访问前端应用：http://localhost:3001/Caifusi
2. 尝试与AI教练进行对话
3. 如果能够得到正常回复（非"这是一个测试回复"），则表示连接成功

## 注意事项

1. API密钥属于敏感信息，请勿泄露或分享给他人
2. 智谱AI的API调用是按量计费的，请注意控制使用量
3. 如果API密钥即将到期，请提前更新以避免服务中断 