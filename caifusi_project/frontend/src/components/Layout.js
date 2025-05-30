import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 导航栏 */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">财赋思</Link>
          
          <nav className="flex items-center space-x-4">
            <Link to="/" className="hover:text-blue-200">首页</Link>
            
            {currentUser ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">个人中心</Link>
                <Link to="/assessment" className="hover:text-blue-200">心智评估</Link>
                <Link to="/coach" className="hover:text-blue-200">AI教练</Link>
                <button 
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-1 rounded-md"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">登录</Link>
                <Link 
                  to="/register" 
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-1 rounded-md"
                >
                  注册
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">财赋思 (Cái Fù Sī)</h3>
              <p className="text-gray-400">你的AI金融心智教练</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-bold mb-2">关于我们</h4>
                <ul className="text-gray-400">
                  <li><a href="#" className="hover:text-white">团队介绍</a></li>
                  <li><a href="#" className="hover:text-white">联系我们</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">资源</h4>
                <ul className="text-gray-400">
                  <li><a href="#" className="hover:text-white">金融知识库</a></li>
                  <li><a href="#" className="hover:text-white">常见问题</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">法律</h4>
                <ul className="text-gray-400">
                  <li><a href="#" className="hover:text-white">隐私政策</a></li>
                  <li><a href="#" className="hover:text-white">使用条款</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700 text-center text-gray-400">
            <p>© {new Date().getFullYear()} 财赋思 (Cái Fù Sī). 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 