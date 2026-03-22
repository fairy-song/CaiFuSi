import React from 'react';
import { Link } from 'react-router-dom';

const InfoPageHeader = ({ title, subtitle, category }) => {
  // 根据类别设置不同的主题色
  let bgColor = 'from-blue-600 to-blue-800';
  let badgeColor = 'bg-blue-500';
  
  if (category === 'resources') {
    bgColor = 'from-green-600 to-green-800';
    badgeColor = 'bg-green-500';
  } else if (category === 'legal') {
    bgColor = 'from-gray-600 to-gray-800';
    badgeColor = 'bg-gray-500';
  }

  return (
    <div className={`w-full bg-gradient-to-r ${bgColor} text-white py-12 mb-10`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          {/* 面包屑导航 */}
          <div className="text-sm mb-4">
            <Link to="/" className="text-white/80 hover:text-white">首页</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{title}</span>
          </div>
          
          {/* 页面标题 */}
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          
          {/* 可选徽章 */}
          {category && (
            <span className={`${badgeColor} text-white text-xs px-3 py-1 rounded-full uppercase tracking-wide mb-4`}>
              {category === 'about' && '关于我们'}
              {category === 'resources' && '资源中心'}
              {category === 'legal' && '法律条款'}
            </span>
          )}
          
          {/* 副标题/描述 */}
          {subtitle && (
            <p className="text-lg text-white/90 max-w-2xl">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPageHeader; 