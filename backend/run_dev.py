import os
import sys
from pathlib import Path
import logging

print("=== 财赋思后端服务启动 ===")

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

# 加载环境变量
from dotenv import load_dotenv
env_path = project_root / '.env'
if env_path.exists():
    load_dotenv(env_path)
    logger.info(f"成功加载 .env 文件: {env_path}")
else:
    logger.warning(f"未能找到 .env 文件: {env_path}")

# 设置环境变量
os.environ["DEV_MODE"] = "true"
logger.info("开发模式环境变量设置完成")

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

    print("✓ 应用实例创建成功")
    logger.info("应用实例创建成功")
    print("✓ 开发模式已启用")
    print("✓ 使用智谱AI GLM-Z1-air模型")
    print(f"✓ API地址: http://localhost:5001")
    logger.info(f"API地址: http://0.0.0.0:5001")
    
    # 打印应用配置
    logger.info("应用配置:")
    for key, value in app.config.items():
        logger.info(f"  {key}: {value}")
    
    # 打印路由
    logger.info("已注册的路由:")
    for rule in app.url_map.iter_rules():
        logger.info(f"  {rule} - {rule.methods}")
    
    # 开发模式使用Flask内置服务器
    # 使用0.0.0.0作为主机，允许从外部访问
    logger.info("启动Flask服务器...")
    app.run(debug=True, port=5001, host='0.0.0.0')
    
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
        print("✓ 备用导入成功")
        logger.info("备用导入成功")
        logger.info("启动Flask服务器(备用方式)...")
        app.run(debug=True, port=5001, host='0.0.0.0')
    except Exception as e:
        print(f"✕ 启动失败: {e}")
        logger.critical(f"启动失败: {e}", exc_info=True)
        print("\n请检查项目结构是否正确。")
        sys.exit(1) 