"""
用户数据服务模块
负责用户数据的存储、检索和管理
"""
import datetime
from typing import Dict, List, Optional, Any
from .firestore_service import (
    get_db, 
    is_dev_mode,
    get_user_collection_path,
    _dev_db
)

class UserDataService:
    """用户数据服务类"""
    
    def __init__(self):
        """初始化用户数据服务"""
        self.db = get_db()
    
    def save_user_data(self, user_id: str, data_type: str, data: Dict[str, Any]) -> tuple:
        """
        保存用户数据
        
        Args:
            user_id: 用户ID
            data_type: 数据类型 (assessment, goals, transactions等)
            data: 要保存的数据
            
        Returns:
            (success: bool, message: str)
        """
        try:
            if is_dev_mode():
                # 开发模式 - 使用内存存储
                if user_id not in _dev_db["users"]:
                    _dev_db["users"][user_id] = {}
                
                if data_type not in _dev_db["users"][user_id]:
                    _dev_db["users"][user_id][data_type] = []
                elif isinstance(_dev_db["users"][user_id][data_type], dict):
                    # Legacy firestore_service initialization compatibility
                    _dev_db["users"][user_id][data_type] = list(_dev_db["users"][user_id][data_type].values())
                
                # 添加时间戳
                data['timestamp'] = datetime.datetime.now().isoformat()
                data['id'] = f"{data_type}_{len(_dev_db['users'][user_id][data_type])}"
                
                _dev_db["users"][user_id][data_type].append(data)
                return True, "数据保存成功"
            
            # 生产模式 - 使用Firestore
            if not self.db:
                return False, "数据库未初始化"
            
            collection_path = get_user_collection_path(user_id, data_type)
            doc_ref = self.db.collection(collection_path).document()
            
            data['timestamp'] = datetime.datetime.now()
            data['id'] = doc_ref.id
            
            doc_ref.set(data)
            return True, "数据保存成功"
            
        except Exception as e:
            return False, f"保存数据失败: {str(e)}"
    
    def get_user_data(self, user_id: str, data_type: str, limit: int = 10) -> tuple:
        """
        获取用户数据
        
        Args:
            user_id: 用户ID
            data_type: 数据类型
            limit: 返回数据条数限制
            
        Returns:
            (data: List[Dict], error: Optional[str])
        """
        try:
            if is_dev_mode():
                # 开发模式
                if user_id not in _dev_db["users"]:
                    return [], None
                
                data_list = _dev_db["users"][user_id].get(data_type, [])
                
                # Deal with legacy firestore_service initializing it as dict
                if isinstance(data_list, dict):
                    data_list = list(data_list.values())
                    
                # 返回最新的limit条数据
                return data_list[-limit:] if data_list else [], None
            
            # 生产模式
            if not self.db:
                return [], "数据库未初始化"
            
            collection_path = get_user_collection_path(user_id, data_type)
            docs = self.db.collection(collection_path)\
                         .order_by('timestamp', direction='DESCENDING')\
                         .limit(limit)\
                         .stream()
            
            data_list = [doc.to_dict() for doc in docs]
            return data_list, None
            
        except Exception as e:
            return [], f"获取数据失败: {str(e)}"
    
    def get_latest_data(self, user_id: str, data_type: str) -> tuple:
        """
        获取用户最新的一条数据
        
        Args:
            user_id: 用户ID
            data_type: 数据类型
            
        Returns:
            (data: Optional[Dict], error: Optional[str])
        """
        try:
            data_list, error = self.get_user_data(user_id, data_type, limit=1)
            if error:
                return None, error
            
            return data_list[0] if data_list else None, None
            
        except Exception as e:
            return None, f"获取最新数据失败: {str(e)}"
    
    def update_user_data(self, user_id: str, data_type: str, data_id: str, updates: Dict[str, Any]) -> tuple:
        """
        更新用户数据
        
        Args:
            user_id: 用户ID
            data_type: 数据类型
            data_id: 数据ID
            updates: 要更新的字段
            
        Returns:
            (success: bool, message: str)
        """
        try:
            if is_dev_mode():
                # 开发模式
                if user_id not in _dev_db["users"] or data_type not in _dev_db["users"][user_id]:
                    return False, "数据不存在"
                
                data_list = _dev_db["users"][user_id][data_type]
                for i, data in enumerate(data_list):
                    if data.get('id') == data_id:
                        data_list[i].update(updates)
                        data_list[i]['updated_at'] = datetime.datetime.now().isoformat()
                        return True, "数据更新成功"
                
                return False, "未找到指定数据"
            
            # 生产模式
            if not self.db:
                return False, "数据库未初始化"
            
            collection_path = get_user_collection_path(user_id, data_type)
            doc_ref = self.db.collection(collection_path).document(data_id)
            
            updates['updated_at'] = datetime.datetime.now()
            doc_ref.update(updates)
            
            return True, "数据更新成功"
            
        except Exception as e:
            return False, f"更新数据失败: {str(e)}"
    
    def delete_user_data(self, user_id: str, data_type: str, data_id: str) -> tuple:
        """
        删除用户数据
        
        Args:
            user_id: 用户ID
            data_type: 数据类型
            data_id: 数据ID
            
        Returns:
            (success: bool, message: str)
        """
        try:
            if is_dev_mode():
                # 开发模式
                if user_id not in _dev_db["users"] or data_type not in _dev_db["users"][user_id]:
                    return False, "数据不存在"
                
                data_list = _dev_db["users"][user_id][data_type]
                _dev_db["users"][user_id][data_type] = [
                    data for data in data_list if data.get('id') != data_id
                ]
                return True, "数据删除成功"
            
            # 生产模式
            if not self.db:
                return False, "数据库未初始化"
            
            collection_path = get_user_collection_path(user_id, data_type)
            self.db.collection(collection_path).document(data_id).delete()
            
            return True, "数据删除成功"
            
        except Exception as e:
            return False, f"删除数据失败: {str(e)}"
    
    def get_user_statistics(self, user_id: str) -> Dict[str, Any]:
        """
        获取用户统计数据
        
        Args:
            user_id: 用户ID
            
        Returns:
            统计数据字典
        """
        try:
            stats = {
                'total_assessments': 0,
                'total_goals': 0,
                'total_transactions': 0,
                'last_assessment_date': None,
                'last_login': None
            }
            
            if is_dev_mode():
                if user_id in _dev_db["users"]:
                    user_data = _dev_db["users"][user_id]
                    stats['total_assessments'] = len(user_data.get('assessments', []))
                    stats['total_goals'] = len(user_data.get('goals', []))
                    stats['total_transactions'] = len(user_data.get('transactions', []))
                    
                    # 获取最后评估日期
                    assessments = user_data.get('assessments', [])
                    if assessments:
                        stats['last_assessment_date'] = assessments[-1].get('timestamp')
            else:
                # 生产模式 - 从Firestore获取统计
                if self.db:
                    # 获取各类数据的数量
                    for data_type in ['assessments', 'goals', 'transactions']:
                        collection_path = get_user_collection_path(user_id, data_type)
                        docs = self.db.collection(collection_path).stream()
                        stats[f'total_{data_type}'] = len(list(docs))
            
            return stats
            
        except Exception as e:
            print(f"获取用户统计数据失败: {str(e)}")
            return {}

# 创建全局实例
user_data_service = UserDataService()
