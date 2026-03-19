"""
用户画像服务模块
负责构建和管理用户的财务画像
"""
from typing import Dict, Optional, Any
from .user_data_service import user_data_service

class UserProfileService:
    """用户画像服务类"""
    
    def __init__(self):
        """初始化用户画像服务"""
        self.data_service = user_data_service
    
    def build_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        构建用户完整画像
        
        Args:
            user_id: 用户ID
            
        Returns:
            用户画像字典
        """
        profile = {
            'user_id': user_id,
            'financial_health': {},
            'risk_profile': {},
            'goals': [],
            'assessment_summary': {},
            'recommendations': [],
            'statistics': {}
        }
        
        try:
            # 获取最新评估结果
            latest_assessment, _ = self.data_service.get_latest_data(user_id, 'assessments')
            if latest_assessment:
                profile['assessment_summary'] = self._extract_assessment_summary(latest_assessment)
                profile['risk_profile'] = self._extract_risk_profile(latest_assessment)
                profile['recommendations'] = latest_assessment.get('recommendations', [])
            
            # 获取用户目标
            goals, _ = self.data_service.get_user_data(user_id, 'goals', limit=10)
            profile['goals'] = goals
            
            # 获取统计数据
            profile['statistics'] = self.data_service.get_user_statistics(user_id)
            
            # 计算财务健康度
            profile['financial_health'] = self._calculate_financial_health(profile)
            
        except Exception as e:
            print(f"构建用户画像失败: {str(e)}")
        
        return profile
    
    def get_user_context_for_ai(self, user_id: str) -> str:
        """
        获取用于AI教练的用户上下文信息
        
        Args:
            user_id: 用户ID
            
        Returns:
            格式化的用户上下文字符串
        """
        profile = self.build_user_profile(user_id)
        
        context_parts = []
        
        # 添加评估摘要
        if profile['assessment_summary']:
            summary = profile['assessment_summary']
            context_parts.append(f"用户财务评估总分: {summary.get('total_score', 0):.1f}/4.0")
            
            # 添加各维度得分
            scores = summary.get('scores', {})
            if scores:
                context_parts.append("各维度得分:")
                for category, score in scores.items():
                    category_name = self._get_category_name(category)
                    context_parts.append(f"  - {category_name}: {score:.1f}/4.0")
        
        # 添加风险偏好
        if profile['risk_profile']:
            risk = profile['risk_profile']
            context_parts.append(f"\n风险偏好: {risk.get('level', '未知')}")
            context_parts.append(f"风险承受能力: {risk.get('tolerance', '未知')}")
        
        # 添加财务目标
        if profile['goals']:
            context_parts.append(f"\n当前财务目标数量: {len(profile['goals'])}")
            active_goals = [g for g in profile['goals'] if g.get('status') == 'active']
            if active_goals:
                context_parts.append("活跃目标:")
                for goal in active_goals[:3]:  # 只显示前3个
                    context_parts.append(f"  - {goal.get('title', '未命名目标')}")
        
        # 添加关键建议
        if profile['recommendations']:
            high_priority = [r for r in profile['recommendations'] if r.get('priority') == 'high']
            if high_priority:
                context_parts.append(f"\n高优先级建议数量: {len(high_priority)}")
        
        # 添加统计信息
        stats = profile['statistics']
        if stats:
            context_parts.append(f"\n评估完成次数: {stats.get('total_assessments', 0)}")
            if stats.get('last_assessment_date'):
                context_parts.append(f"最后评估时间: {stats.get('last_assessment_date')}")
        
        return "\n".join(context_parts) if context_parts else "用户尚未完成财务评估"
    
    def _extract_assessment_summary(self, assessment: Dict) -> Dict:
        """提取评估摘要"""
        return {
            'total_score': assessment.get('total_score', 0),
            'scores': assessment.get('scores', {}),
            'completed': assessment.get('completed', False),
            'timestamp': assessment.get('timestamp', '')
        }
    
    def _extract_risk_profile(self, assessment: Dict) -> Dict:
        """提取风险画像"""
        risk_score = assessment.get('scores', {}).get('risk', 0)
        
        # 根据风险得分确定风险等级
        if risk_score >= 3.5:
            level = '进取型'
            tolerance = '高'
        elif risk_score >= 2.5:
            level = '平衡型'
            tolerance = '中等'
        elif risk_score >= 1.5:
            level = '保守型'
            tolerance = '较低'
        else:
            level = '极度保守型'
            tolerance = '很低'
        
        return {
            'level': level,
            'tolerance': tolerance,
            'score': risk_score
        }
    
    def _calculate_financial_health(self, profile: Dict) -> Dict:
        """
        计算财务健康度
        
        Args:
            profile: 用户画像
            
        Returns:
            财务健康度指标
        """
        health = {
            'overall_score': 0,
            'level': '待评估',
            'strengths': [],
            'weaknesses': []
        }
        
        assessment = profile.get('assessment_summary', {})
        if not assessment:
            return health
        
        total_score = assessment.get('total_score', 0)
        scores = assessment.get('scores', {})
        
        # 计算总体健康度
        health['overall_score'] = total_score
        
        # 确定健康等级
        if total_score >= 3.5:
            health['level'] = '优秀'
        elif total_score >= 2.5:
            health['level'] = '良好'
        elif total_score >= 1.5:
            health['level'] = '一般'
        else:
            health['level'] = '需改进'
        
        # 识别优势和劣势
        for category, score in scores.items():
            category_name = self._get_category_name(category)
            if score >= 3.0:
                health['strengths'].append(category_name)
            elif score < 2.0:
                health['weaknesses'].append(category_name)
        
        return health
    
    def _get_category_name(self, category: str) -> str:
        """获取分类的中文名称"""
        category_names = {
            'savings': '储蓄能力',
            'risk': '风险管理',
            'emergency': '应急准备',
            'debt': '债务管理',
            'knowledge': '金融知识',
            'income': '收入稳定性',
            'goals': '目标规划',
            'spending': '支出控制'
        }
        return category_names.get(category, category)
    
    def update_user_goal(self, user_id: str, goal_data: Dict) -> tuple:
        """
        更新或创建用户财务目标
        
        Args:
            user_id: 用户ID
            goal_data: 目标数据
            
        Returns:
            (success: bool, message: str)
        """
        try:
            # 验证必需字段
            required_fields = ['title', 'target_amount', 'deadline']
            missing = [f for f in required_fields if f not in goal_data]
            if missing:
                return False, f"缺少必需字段: {', '.join(missing)}"
            
            # 添加默认字段
            if 'status' not in goal_data:
                goal_data['status'] = 'active'
            if 'progress' not in goal_data:
                goal_data['progress'] = 0
            if 'current_amount' not in goal_data:
                goal_data['current_amount'] = 0
            
            # 保存目标
            success, message = self.data_service.save_user_data(
                user_id,
                'goals',
                goal_data
            )
            
            return success, message
            
        except Exception as e:
            return False, f"更新目标失败: {str(e)}"
    
    def get_user_goals(self, user_id: str, status: Optional[str] = None) -> tuple:
        """
        获取用户财务目标
        
        Args:
            user_id: 用户ID
            status: 目标状态筛选 (active, completed, cancelled)
            
        Returns:
            (goals: List[Dict], error: Optional[str])
        """
        try:
            goals, error = self.data_service.get_user_data(user_id, 'goals', limit=50)
            
            if error:
                return [], error
            
            # 按状态筛选
            if status:
                goals = [g for g in goals if g.get('status') == status]
            
            return goals, None
            
        except Exception as e:
            return [], f"获取目标失败: {str(e)}"

# 创建全局实例
user_profile_service = UserProfileService()
