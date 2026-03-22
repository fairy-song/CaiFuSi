from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import logging
import traceback
from services.zhipuai_service import ZhipuAIService

# 配置日志
logger = logging.getLogger('coach_routes')

# 创建蓝图
coach_bp = Blueprint('coach', __name__)

# 初始化智谱AI服务
try:
    zhipuai_service = ZhipuAIService()
    logger.info("智谱AI服务初始化成功")
except Exception as e:
    logger.error(f"智谱AI服务初始化失败: {e}")
    logger.error(traceback.format_exc())
    zhipuai_service = None

@coach_bp.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    """
    AI教练聊天接口
    接收用户消息，返回AI回复
    """
    try:
        # 检查服务是否可用
        if zhipuai_service is None:
            return jsonify({
                'status': 'error', 
                'message': 'AI教练服务未正确初始化，请检查API密钥配置'
            }), 503
        
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return jsonify({'status': 'error', 'message': '请求数据为空'}), 400
            
        if 'message' not in data:
            return jsonify({'status': 'error', 'message': '缺少必要的消息内容'}), 400
        
        # 使用智谱AI服务获取回复
        response = zhipuai_service.get_chat_response(data)
        
        # 返回结果
        if response.get('status') == 'success':
            return jsonify(response), 200
        else:
            return jsonify(response), 500
            
    except Exception as e:
        logger.error(f"处理聊天请求时出错: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error', 
            'message': f'服务器内部错误: {str(e)}'
        }), 500

@coach_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """
    健康检查接口
    检查AI教练服务是否正常运行
    """
    status = "ok" if zhipuai_service is not None else "error"
    message = "AI教练服务正常运行" if status == "ok" else "AI教练服务未初始化"
    
    return jsonify({
        'status': status,
        'message': message,
        'model': zhipuai_service.default_model if zhipuai_service else None
    })

@coach_bp.route('/models', methods=['GET'])
@cross_origin()
def get_models():
    """
    获取可用模型列表
    """
    if zhipuai_service is None:
        return jsonify({
            'status': 'error', 
            'message': 'AI教练服务未正确初始化'
        }), 503
    
    models = zhipuai_service.get_available_models()
    current_model = zhipuai_service.default_model
    
    return jsonify({
        'status': 'success',
        'models': models,
        'current_model': current_model
    })

@coach_bp.route('/switch_model', methods=['POST'])
@cross_origin()
def switch_model():
    """
    切换使用的模型
    """
    if zhipuai_service is None:
        return jsonify({
            'status': 'error', 
            'message': 'AI教练服务未正确初始化'
        }), 503
    
    data = request.get_json()
    if not data or 'model' not in data:
        return jsonify({
            'status': 'error', 
            'message': '缺少必要的模型名称'
        }), 400
    
    model_name = data['model']
    success = zhipuai_service.switch_model(model_name)
    
    if success:
        return jsonify({
            'status': 'success',
            'message': f'已切换到模型: {model_name}',
            'current_model': zhipuai_service.default_model
        })
    else:
        return jsonify({
            'status': 'error',
            'message': f'无效的模型名称: {model_name}',
            'available_models': zhipuai_service.get_available_models(),
            'current_model': zhipuai_service.default_model
        }), 400 