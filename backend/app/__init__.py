import os
from flask import Flask
from flask_cors import CORS
import sys

def create_app():
    """创建并配置Flask应用"""
    try:
        print("开始创建Flask应用...")
        app = Flask(__name__)
        
        # 配置跨域资源共享 - 限制允许的来源以提高安全性
        print("配置CORS...")
        allowed_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://xiaocow666.github.io",  # GitHub Pages
        ]
        
        # 从环境变量读取额外的允许来源
        extra_origins = os.environ.get('CORS_ALLOWED_ORIGINS', '')
        if extra_origins:
            allowed_origins.extend([origin.strip() for origin in extra_origins.split(',')])
        
        CORS(app, resources={
            r"/api/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True
            }
        })
        print(f"CORS 配置完成，允许的来源: {allowed_origins}")
        
        # 加载配置
        try:
            print("尝试从config.py加载配置...")
            from .config import Config
            app.config.from_object(Config)
            print("配置加载成功")
        except ImportError as e:
            print(f"导入配置失败: {e}，使用默认配置")
            # 设置默认配置
            app.config['DEBUG'] = True
            app.config['API_PREFIX'] = '/api'
            app.config['CORS_ORIGINS'] = ["http://localhost:3000", "http://127.0.0.1:3000"]
        
        # 确保目录存在
        print("确保services目录存在...")
        os.makedirs(os.path.join(app.root_path, 'services'), exist_ok=True)
        
        # 注册蓝图 (routes) - 使用真实的AI服务
        try:
            print("尝试导入真实的coach_routes...")
            from .routes.coach_routes import coach_bp
            app.register_blueprint(coach_bp, url_prefix='/api/coach')
            print("✓ 成功注册真实的AI教练服务")
        except ImportError as e:
            print(f"导入coach_routes失败: {e}")
            print("尝试使用备用导入方式...")
            try:
                # 备用导入方式
                import sys
                sys.path.insert(0, app.root_path)
                from routes.coach_routes import coach_bp
                app.register_blueprint(coach_bp, url_prefix='/api/coach')
                print("✓ 通过备用方式成功注册AI教练服务")
            except Exception as e2:
                print(f"备用导入也失败: {e2}")
                # 如果都失败，创建一个错误提示蓝图
                from flask import Blueprint, jsonify
                coach_bp = Blueprint('coach', __name__)
                
                @coach_bp.route('/chat', methods=['POST'])
                def chat():
                    return jsonify({
                        "status": "error",
                        "message": "AI服务加载失败，请检查后端日志"
                    }), 500
                    
                app.register_blueprint(coach_bp, url_prefix='/api/coach')
                print("✗ 使用错误提示蓝图")
        except Exception as e:
            print(f"注册蓝图时出错: {e}")
            import traceback
            traceback.print_exc()
        
        # 注册Dashboard路由
        try:
            print("尝试导入dashboard_routes...")
            from .routes.dashboard_routes import dashboard_bp
            app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
            print("✓ 成功注册Dashboard服务")
        except Exception as e:
            print(f"注册Dashboard路由失败: {e}")
            import traceback
            traceback.print_exc()
        
        # 注册Assessment路由
        try:
            print("尝试导入assessment_routes...")
            from .routes.assessment_routes import assessment_bp
            app.register_blueprint(assessment_bp, url_prefix='/api/assessment')
            print("✓ 成功注册Assessment服务")
        except Exception as e:
            print(f"注册Assessment路由失败: {e}")
            import traceback
            traceback.print_exc()
        
        # 添加健康检查路由
        @app.route('/api/health', methods=['GET'])
        def health_check():
            return {"status": "healthy", "message": "API服务正常运行中"}, 200
        
        # 添加根路由
        @app.route('/')
        def index():
            return {"message": "欢迎使用财赋思 AI金融心智教练 API"}, 200
        
        # 打印已注册的路由（开发环境下有助于调试）
        print("已注册的路由:")
        for rule in app.url_map.iter_rules():
            print(f"{rule} - {rule.methods}")

        return app 
        
    except Exception as e:
        print(f"创建应用时出现错误: {e}")
        import traceback
        traceback.print_exc()
        # 创建一个最小可用的应用
        minimal_app = Flask(__name__)
        
        @minimal_app.route('/')
        def minimal_index():
            return {"status": "error", "message": "应用初始化失败，请检查服务器日志"}, 500
            
        return minimal_app 