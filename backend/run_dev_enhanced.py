import os
import sys
from pathlib import Path
import logging
import threading
import time

print("=== 财赋思后端服务启动 (增强版) ===")

# 设置全局状态标识
MODEL_INITIALIZED = False
MODEL_READY_EVENT = threading.Event()

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('caifusi-backend')
logger.info("正在启动后端服务...")

# 添加项目根目录到系统路径
try:
    current_dir = Path(__file__).parent
    project_root = current_dir.parent
    sys.path.insert(0, str(project_root))
    print(f"✓ 系统路径设置成功")
    logger.info(f"系统路径: {sys.path}")
except Exception as e:
    print(f"✕ 设置路径出错: {e}")
    logger.error(f"设置路径出错: {e}", exc_info=True)

# 设置环境变量
os.environ["DEV_MODE"] = "true"
# 旧密钥已过期，需要在智谱AI开放平台(https://open.bigmodel.cn/)获取新密钥
# os.environ["ZHIPUAI_API_KEY"] = "d569cc60785b4cd8a9cc3c033ac5a72f.MmbuHzbqGEsGntG5"
# 如果您已获取新密钥，请取消下面这行的注释并替换YOUR_NEW_API_KEY
# os.environ["ZHIPUAI_API_KEY"] = "YOUR_NEW_API_KEY"
# 增加新环境变量，强制立即初始化模型
os.environ["INITIALIZE_MODEL_ON_START"] = "true" 
# 禁用自动加载.env文件，避免编码问题
os.environ["FLASK_SKIP_DOTENV"] = "1"
logger.info("环境变量设置完成")

def monitor_model_initialization():
    """监控模型初始化状态的线程函数"""
    global MODEL_INITIALIZED
    
    print("⟳ 正在初始化AI模型...")
    loading_chars = "|/-\\"
    i = 0
    
    # 最长等待5分钟
    for _ in range(300):
        if MODEL_INITIALIZED:
            print("\r✓ AI模型初始化完成!                 ")
            MODEL_READY_EVENT.set()
            return
            
        print(f"\r⟳ 正在初始化AI模型...{loading_chars[i % len(loading_chars)]}", end="", flush=True)
        i += 1
        time.sleep(1)
        
    print("\r! AI模型初始化超时，可能会影响服务质量")
    # 即使超时也设置事件，避免永久阻塞
    MODEL_READY_EVENT.set()

# 启动模型初始化监视线程
init_thread = threading.Thread(target=monitor_model_initialization, daemon=True)
init_thread.start()

def patch_app_routes(app):
    """修补应用路由，确保API响应是实际的而非测试消息"""
    from flask import jsonify, request, current_app
    import functools
    
    # 获取所有路由处理函数
    for rule in app.url_map.iter_rules():
        endpoint = app.view_functions.get(rule.endpoint)
        if endpoint and rule.rule.startswith('/api/coach'):
            original_func = endpoint
            
            @functools.wraps(original_func)
            def patched_endpoint(*args, **kwargs):
                # 等待模型初始化完成，但最多等待3秒
                ready = MODEL_READY_EVENT.wait(timeout=3)
                
                if not ready:
                    logger.warning("API请求超时等待模型初始化")
                    return jsonify({
                        "status": "initializing",
                        "response": "AI模型正在初始化，请稍后再试...",
                        "error": "模型初始化中"
                    }), 503
                
                # 模型已初始化，调用原始处理函数
                return original_func(*args, **kwargs)
                
            # 替换原始路由处理函数
            app.view_functions[rule.endpoint] = patched_endpoint
    
    # 检查是否已存在健康检查端点，否则添加一个
    health_endpoint_exists = False
    for rule in app.url_map.iter_rules():
        if rule.rule == '/api/health':
            health_endpoint_exists = True
            break
    
    if not health_endpoint_exists:
        # 使用不同的端点名称，避免冲突
        @app.route('/api/health', methods=['GET'], endpoint='enhanced_health_check')
        def enhanced_health_check():
            return jsonify({
                "status": "ok",
                "model_initialized": MODEL_INITIALIZED,
                "timestamp": time.time()
            })
    
    logger.info("已修补应用路由以确保最佳响应")
    return app

# 导入和创建应用
try:
    # 方式1: 标准导入方式
    logger.info("尝试标准导入方式...")
    from backend.app import create_app
    print("✓ 应用模块导入成功")
    logger.info("应用模块导入成功")

    # 创建应用实例
    logger.info("正在创建应用实例...")
    app = create_app()
    
    # 应用路由补丁
    app = patch_app_routes(app)

    print("✓ 应用实例创建成功")
    logger.info("应用实例创建成功")
    print("✓ 开发模式已启用")
    print("✓ 使用智谱AI GLM-Z1-air模型")
    print(f"✓ API地址: http://localhost:5001")
    logger.info(f"API地址: http://0.0.0.0:5001")
    
    # 标记模型已初始化
    MODEL_INITIALIZED = True
    
    # 开发模式使用Flask内置服务器
    # 使用0.0.0.0作为主机，允许从外部访问
    logger.info("启动Flask服务器...")
    # 禁用自动加载.env，避免编码问题
    app.run(debug=True, port=5001, host='0.0.0.0', threaded=True, load_dotenv=False)
    
except ImportError as e:
    print(f"✕ 导入错误: {e}")
    logger.error(f"导入错误: {e}", exc_info=True)
    print("尝试备用导入方式...")
    logger.info("尝试备用导入方式...")
    
    try:
        # 方式2: 直接导入
        logger.info("添加当前目录到sys.path...")
        sys.path.append(str(current_dir))
        logger.info("尝试从app导入create_app...")
        from app import create_app
        logger.info("创建应用实例...")
        app = create_app()
        
        # 应用路由补丁
        app = patch_app_routes(app)
        
        print("✓ 备用导入成功")
        logger.info("备用导入成功")
        
        # 标记模型已初始化
        MODEL_INITIALIZED = True
        
        logger.info("启动Flask服务器(备用方式)...")
        # 禁用自动加载.env，避免编码问题
        app.run(debug=True, port=5001, host='0.0.0.0', threaded=True, load_dotenv=False)
    except Exception as e:
        print(f"✕ 启动失败: {e}")
        logger.critical(f"启动失败: {e}", exc_info=True)
        print("\n请检查项目结构是否正确。")
        sys.exit(1) 