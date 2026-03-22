import os
import re
import sys
import logging
import traceback
from typing import Dict, List, Any, Optional

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('zhipuai_service')

# 调整路径以正确导入配置
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import Config

# 尝试导入zhipuai
try:
    from zhipuai import ZhipuAI
    logger.info("成功导入zhipuai库")
except ImportError as e:
    logger.error(f"导入zhipuai库失败: {e}")
    logger.info("尝试安装zhipuai库...")
    try:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "zhipuai"])
        from zhipuai import ZhipuAI
        logger.info("成功安装并导入zhipuai库")
    except Exception as e:
        logger.error(f"安装zhipuai库失败: {e}")
        raise ImportError("无法导入或安装zhipuai库，AI教练功能将不可用")

def filter_thinking_tags(text: str) -> str:
    """
    过滤掉文本中的<think>...</think>标签及其内容
    保持Markdown格式不变
    """
    # 使用非贪婪匹配来移除<think>...</think>和任何嵌套的标签
    filtered_text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    
    # 移除可能存在的空行（连续多个换行符）
    filtered_text = re.sub(r'\n{3,}', '\n\n', filtered_text)
    
    return filtered_text.strip()

class ZhipuAIService:
    """
    智谱AI服务类，用于与智谱AI API交互
    支持聊天对话、历史记忆和个性化提示
    """
    def __init__(self):
        """初始化智谱AI服务"""
        try:
            # 获取API密钥
            self.api_key = Config.ZHIPUAI_API_KEY
            if not self.api_key or self.api_key == 'YOUR_NEW_API_KEY':
                logger.error("未找到有效的智谱AI API密钥")
                raise ValueError("未找到有效的智谱AI API密钥，请检查配置或环境变量")
                
            logger.info(f"使用API密钥: {self.api_key[:8]}...{self.api_key[-8:] if len(self.api_key) > 16 else '*****'}")
            
            # 初始化智谱AI客户端
            self.client = ZhipuAI(api_key=self.api_key)
            
            # 设置默认模型
            self.default_model = "glm-4"  # 默认使用最新的GLM-4模型
            
            # 会话记忆，使用字典存储不同用户的对话历史
            self.chat_history: Dict[str, List[Dict[str, str]]] = {}
            
            # 最大历史记忆长度（消息数量）
            self.max_history_length = 10
            
            logger.info(f"智谱AI服务初始化完成，使用模型: {self.default_model}")
        except Exception as e:
            logger.error(f"初始化智谱AI服务失败: {e}")
            logger.error(traceback.format_exc())
            raise

    def get_chat_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        获取AI聊天回复，支持对话记忆和问卷结果集成
        
        Args:
            data: 包含消息内容、用户ID、可选的聊天历史和问卷结果的字典
                - message: 用户消息
                - user_id: 用户ID
                - chat_history: 可选的聊天历史
                - assessment_results: 可选的评估结果
                
        Returns:
            包含回复内容的字典，格式为:
            - 成功: {"status": "success", "reply": "AI回复内容"}
            - 失败: {"status": "error", "message": "错误信息"}
        """
        try:
            # 提取数据
            message = data.get('message', '')
            user_id = data.get('user_id', 'default_user')
            chat_history = data.get('chat_history', [])
            assessment_results = data.get('assessment_results', None)
            
            logger.info(f"处理用户[{user_id}]的消息: {message[:30]}...")
            
            # 如果前端提供了聊天历史，则使用它，否则使用服务端存储的历史
            if not chat_history and user_id in self.chat_history:
                chat_history = self.chat_history[user_id]
                logger.info(f"使用服务端存储的历史记录，共{len(chat_history)}条消息")
            
            # 构建系统提示词
            system_prompt = self._build_system_prompt(assessment_results)
            
            # 构建对话历史
            messages = [{"role": "system", "content": system_prompt}]
            
            # 添加历史消息，确保不超过限制
            if chat_history:
                # 如果历史太长，只保留最近的几条
                recent_history = chat_history[-self.max_history_length:] if len(chat_history) > self.max_history_length else chat_history
                for msg in recent_history:
                    messages.append({"role": msg.get('role', 'user'), "content": msg.get('content', '')})
                logger.info(f"添加了{len(recent_history)}条历史消息")
            
            # 添加当前用户消息
            messages.append({"role": "user", "content": message})
            
            # 调用智谱AI API
            logger.info(f"调用智谱AI API ({self.default_model})...")
            try:
                # 使用新版SDK的chat.completions接口
                response = self.client.chat.completions.create(
                    model=self.default_model,
                    messages=messages,
                    temperature=0.7,
                    top_p=0.9,
                    max_tokens=2000
                )
                logger.info("API调用成功")
            except Exception as api_error:
                logger.error(f"API调用出错: {api_error}")
                logger.error(traceback.format_exc())
                return {"status": "error", "message": f"智谱AI API调用失败: {str(api_error)}"}
            
            # 获取AI回复
            ai_reply = response.choices[0].message.content
            logger.info(f"获取到AI回复: {ai_reply[:50]}...")
            
            # 过滤掉思考标签
            filtered_response = filter_thinking_tags(ai_reply)
            
            # 更新对话历史
            if user_id not in self.chat_history:
                self.chat_history[user_id] = []
            
            # 添加用户消息和AI回复到历史记录
            self.chat_history[user_id].append({"role": "user", "content": message})
            self.chat_history[user_id].append({"role": "assistant", "content": filtered_response})
            
            # 如果历史太长，移除最早的消息
            if len(self.chat_history[user_id]) > self.max_history_length * 2:  # 乘以2是因为每轮对话有用户和AI两条消息
                self.chat_history[user_id] = self.chat_history[user_id][-self.max_history_length * 2:]
            
            return {"status": "success", "reply": filtered_response}
                
        except Exception as e:
            error_msg = f"调用ZhipuAI服务时发生错误: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            return {"status": "error", "message": error_msg}

    def _build_system_prompt(self, assessment_results: Optional[Dict[str, Any]] = None) -> str:
        """
        构建系统提示词，根据是否有评估结果进行调整
        
        Args:
            assessment_results: 用户的财务评估结果
            
        Returns:
            系统提示词
        """
        prompt = """你是一个专业的金融心智教练，名为"财赋思"。你的主要职责是帮助用户培养健康的金钱观念和财务习惯，提供个性化的财务建议，并回答用户关于个人理财的问题。

请注意以下要求：
1. 回答要专业、友好且富有同理心
2. 提供具体、可行的财务建议，而不是空泛的建议
3. 遵循Markdown格式规范，保持良好的排版和结构
4. 适当使用表格、列表等Markdown元素提高回答的可读性
5. 不要在回复中使用<think>标签或类似的元标签
6. 如需强调重点，可以使用**加粗**或*斜体*格式
7. 保持对话连贯性，记住用户之前提到的信息
8. 如果用户表达负面情绪或财务困境，给予支持和鼓励"""

        # 如果有评估结果，则添加到系统提示中
        if assessment_results:
            try:
                # 提取关键评估数据
                score = assessment_results.get('score', 0)
                category_scores = assessment_results.get('categoryScores', {})
                result_message = assessment_results.get('resultMessage', {})
                category_advice = assessment_results.get('categoryAdvice', [])
                user_name = assessment_results.get('userName', '用户')
                
                # 计算总分百分比
                max_score = 40  # 假设总分为40
                score_percentage = (score / max_score) * 100 if max_score > 0 else 0
                
                # 找出用户的强项和弱项
                strengths = []
                weaknesses = []
                for category, score in category_scores.items():
                    category_name = self._get_category_name(category)
                    if score >= 70:
                        strengths.append(category_name)
                    elif score <= 40:
                        weaknesses.append(category_name)
                
                # 添加评估结果到提示词
                prompt += f"""

用户财务评估数据：
- 用户姓名: {user_name}
- 财务状况: {result_message.get('title', '财务成长阶段')}
- 评估得分: {score}/{max_score} ({round(score_percentage)}%)
- 强项领域: {', '.join(strengths) if strengths else '暂无明显强项'}
- 待提升领域: {', '.join(weaknesses) if weaknesses else '总体表现平衡'}
- 建议重点关注: {', '.join(category_advice[:3]) if category_advice else '建立预算习惯，增加储蓄比例'}

请根据上述评估结果，为用户提供更个性化的建议。在对话中自然地引用这些信息，但不要机械地重复。关注用户当前的问题和需求，并将建议与其评估结果关联起来。"""

            except Exception as e:
                # 如果处理评估结果时出错，记录错误但继续使用基本提示词
                logger.error(f"处理评估结果时出错: {str(e)}")
                logger.error(traceback.format_exc())
        
        return prompt

    def _get_category_name(self, category: str) -> str:
        """
        获取分类的中文名称
        
        Args:
            category: 分类代码
            
        Returns:
            中文名称
        """
        category_names = {
            'savings': '储蓄能力',
            'risk': '风险管理',
            'emergency': '应急准备',
            'debt': '债务管理',
            'knowledge': '财务知识',
            'income': '收入稳定性',
            'goals': '财务目标',
            'tracking': '支出追踪',
            'insurance': '保险保障',
            'pressure': '应对能力'
        }
        return category_names.get(category, category)
        
    def get_available_models(self) -> List[str]:
        """
        获取可用的模型列表
        
        Returns:
            模型名称列表
        """
        try:
            # 智谱AI支持的模型列表
            models = [
                "glm-4", 
                "glm-4-flash", 
                "glm-z1-air", 
                "glm-z1-flash"
            ]
            return models
        except Exception as e:
            logger.error(f"获取模型列表失败: {e}")
            return ["glm-4"]  # 默认返回glm-4
            
    def switch_model(self, model_name: str) -> bool:
        """
        切换使用的模型
        
        Args:
            model_name: 模型名称
            
        Returns:
            是否切换成功
        """
        available_models = self.get_available_models()
        if model_name in available_models:
            self.default_model = model_name
            logger.info(f"已切换到模型: {model_name}")
            return True
        else:
            logger.warning(f"无效的模型名称: {model_name}，可用模型: {available_models}")
            return False 