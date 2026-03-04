import os
# 移除对dotenv的依赖，避免编码问题
# from dotenv import load_dotenv
# load_dotenv() # 加载 .env 文件中的环境变量

class Config:
    # 安全密钥 - 必须通过环境变量设置
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY 环境变量未设置！请在 .env.local 文件中配置")
    
    # Google Gemini API密钥 - 必须通过环境变量设置
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    # 注意：如果不使用 Gemini，可以不设置此变量
    
    # 智谱AI API密钥 - 必须通过环境变量设置
    # 请在 .env.local 文件中配置，或访问 https://open.bigmodel.cn/ 获取新密钥
    ZHIPUAI_API_KEY = os.environ.get('ZHIPUAI_API_KEY')
    if not ZHIPUAI_API_KEY:
        raise ValueError("ZHIPUAI_API_KEY 环境变量未设置！请在 .env.local 文件中配置")
    
    # Firebase Admin SDK 配置文件路径
    FIREBASE_ADMIN_SDK_PATH = os.environ.get('FIREBASE_ADMIN_SDK_PATH')
    
    # Firebase Web SDK config (如果前端需要直接与Firebase交互，通常后端用Admin SDK)
    # FIREBASE_CONFIG = {
    #     "apiKey": os.environ.get("FIREBASE_API_KEY"),
    #     "authDomain": os.environ.get("FIREBASE_AUTH_DOMAIN"),
    #     "projectId": os.environ.get("FIREBASE_PROJECT_ID"),
    #     "storageBucket": os.environ.get("FIREBASE_STORAGE_BUCKET"),
    #     "messagingSenderId": os.environ.get("FIREBASE_MESSAGING_SENDER_ID"),
    #     "appId": os.environ.get("FIREBASE_APP_ID")
    # } 