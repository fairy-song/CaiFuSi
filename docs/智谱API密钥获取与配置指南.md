# 智谱AI API密钥获取与配置指南

## 概述

本指南将帮助您获取智谱AI API密钥，并正确配置到财赋思项目中，以启用AI教练功能。

## 步骤一：注册智谱AI开放平台账号

1. 访问智谱AI开放平台：[https://open.bigmodel.cn/](https://open.bigmodel.cn/)
2. 点击右上角的"注册/登录"按钮
3. 根据提示完成账号注册流程
   - 可以使用手机号或邮箱注册
   - 设置安全的密码
   - 完成验证流程

## 步骤二：完成实名认证（可选但推荐）

1. 登录智谱AI开放平台
2. 点击右上角的头像，选择"个人中心"
3. 在左侧菜单中选择"实名认证"
4. 根据提示完成个人或企业实名认证
   - 个人认证：需要提供身份证信息
   - 企业认证：需要提供营业执照等信息

> **注意**：完成实名认证后，您将获得更多免费额度。新用户通常可获得18元的调用额度（约100万token），实名认证后可额外获得400万token的额度，有效期通常为1个月。

## 步骤三：创建API密钥

1. 登录智谱AI开放平台
2. 点击右上角的头像，选择"开发者中心"或"API密钥管理"
3. 点击"创建API密钥"按钮
4. 输入密钥名称（如"财赋思项目"）
5. 点击"确认"创建密钥
6. 系统会生成API密钥，请立即复制并保存在安全的地方
   - **重要**：API密钥只会显示一次，请务必保存好

![API密钥示例](https://open.bigmodel.cn/static/img/apikey.png)

## 步骤四：配置API密钥到项目

有两种方式可以配置API密钥：

### 方式一：修改配置文件（推荐）

1. 打开项目中的配置文件：`backend/app/config.py`
2. 找到以下代码行：

```python
ZHIPUAI_API_KEY = os.environ.get('ZHIPUAI_API_KEY') or 'YOUR_NEW_API_KEY'
```

3. 将`YOUR_NEW_API_KEY`替换为您刚才获取的API密钥：

```python
ZHIPUAI_API_KEY = os.environ.get('ZHIPUAI_API_KEY') or '您的API密钥'
```

4. 保存文件

### 方式二：使用环境变量

1. 打开项目中的启动脚本：`backend/run_dev_enhanced.py`
2. 找到以下注释掉的代码行：

```python
# os.environ["ZHIPUAI_API_KEY"] = "YOUR_NEW_API_KEY"
```

3. 取消注释并替换为您的API密钥：

```python
os.environ["ZHIPUAI_API_KEY"] = "您的API密钥"
```

4. 保存文件

## 步骤五：重启服务

配置完API密钥后，需要重启服务以使更改生效：

1. 关闭当前运行的后端服务（如果有）
2. 使用启动脚本重新启动服务：
   - Windows: 双击 `direct_start.cmd`
   - PowerShell: 运行 `./start.ps1`

## 步骤六：验证配置

服务启动后，可以通过以下方式验证API连接是否正常：

1. 访问前端应用：http://localhost:3001/Caifusi
2. 尝试与AI教练进行对话
3. 如果能够得到正常回复（非"这是一个测试回复"），则表示连接成功

或者，您可以直接访问API健康检查端点：

```
http://localhost:5001/api/coach/health
```

如果返回状态为"ok"，则表示服务正常运行。

## 常见问题

### 1. API密钥无效或过期

**症状**：尝试使用AI教练时，收到"API调用失败"或"无效的API密钥"错误。

**解决方案**：
- 检查API密钥是否正确复制（没有多余的空格或换行）
- 确认API密钥未过期（智谱AI的API密钥通常有效期为1年）
- 登录智谱AI开放平台，检查密钥状态或重新生成密钥

### 2. API额度用尽

**症状**：API调用返回"额度不足"或"余额不足"错误。

**解决方案**：
- 登录智谱AI开放平台，检查账户余额
- 如需继续使用，可以充值或购买更多额度
- 考虑使用更经济的模型（如glm-4-flash代替glm-4）

### 3. 网络连接问题

**症状**：API调用超时或连接失败。

**解决方案**：
- 检查网络连接是否正常
- 确认服务器能够访问智谱AI的API服务器
- 如果使用代理，检查代理配置是否正确

## 智谱AI模型说明

财赋思项目支持以下智谱AI模型：

1. **GLM-4**：最强大的模型，适合复杂的财务咨询和建议
2. **GLM-4-Flash**：经济版GLM-4，速度更快，成本更低
3. **GLM-Z1-Air**：平衡版模型，性能与成本的良好平衡
4. **GLM-Z1-Flash**：最经济的选择，适合简单对话

可以通过API切换使用的模型：

```
POST http://localhost:5001/api/coach/switch_model
Content-Type: application/json

{
  "model": "glm-4-flash"
}
```

## 安全注意事项

1. **不要泄露API密钥**：API密钥等同于您的账户凭证，泄露可能导致被盗用和额外费用
2. **不要在客户端代码中嵌入API密钥**：始终在服务器端使用API密钥
3. **定期轮换API密钥**：建议每3-6个月更换一次API密钥
4. **设置使用限制**：在智谱AI平台上为API密钥设置使用限制，避免意外消费

## 相关资源

- [智谱AI开放平台文档](https://open.bigmodel.cn/dev/api)
- [智谱AI Python SDK文档](https://github.com/zhipuai/zhipuai-sdk-python)
- [GLM-4模型介绍](https://open.bigmodel.cn/dev/api#glm-4) 