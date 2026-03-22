import os

class Config:
    # 安全密钥 - 优先从环境变量读取，未设置时使用开发用默认值
    SECRET_KEY = os.environ.get('SECRET_KEY', 'caifusi-dev-secret-key-change-in-production')

    # Google Gemini API密钥 - 可选，不使用 Gemini 时无需设置
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

    # 智谱AI API密钥 - 优先从环境变量读取，未设置时打印警告
    ZHIPUAI_API_KEY = os.environ.get('ZHIPUAI_API_KEY')
    if not ZHIPUAI_API_KEY:
        print("警告: ZHIPUAI_API_KEY 环境变量未设置，AI教练功能可能不可用")

    # Firebase Admin SDK 配置文件路径
    FIREBASE_ADMIN_SDK_PATH = os.environ.get('FIREBASE_ADMIN_SDK_PATH')