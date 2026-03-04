import axios from 'axios';

// 这里是API服务模块，用于处理与后端的通信

// 检查是否在GitHub Pages环境
const isGitHubPages = window.location.hostname === 'xiaocow666.github.io';

// 默认的API基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                    (isGitHubPages ? 
                     'https://你的API服务器地址' : 'http://localhost:5001/api');

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401错误 (未认证)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      // 可以在这里添加重定向到登录页的逻辑
    }
    return Promise.reject(error);
  }
);

// 通用请求函数
async function fetchApi(endpoint, options = {}) {
  // 根据环境选择API基础URL
  let baseUrl;
  
  // 在GitHub Pages环境中使用外部API服务
  if (isGitHubPages) {
    baseUrl = 'https://你的API服务器地址';  // 替换为你的实际API服务地址
    // 注意: 外部API服务需要配置CORS允许GitHub Pages域名访问
  } else if (process.env.NODE_ENV === 'production') {
    baseUrl = '';  // 在其他生产环境中使用相对路径
  } else {
    baseUrl = 'http://localhost:5001';  // 开发环境
  }
  
  // 确保endpoint格式正确
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}/api${formattedEndpoint}`;
  
  // 默认配置
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    // 添加跨域支持
    credentials: 'include',
    mode: 'cors',
  };
  
  // 合并配置
  const fetchOptions = {
    ...defaultOptions,
    ...options,
  };
  
  console.log(`正在请求API: ${url}`, options.method || 'GET');
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // 非2xx状态码
    if (!response.ok) {
      console.error(`API错误: ${response.status}`, response);
      // 尝试解析错误响应
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `请求失败，状态码: ${response.status}`;
      } catch (e) {
        errorMessage = `请求失败，状态码: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    // 尝试解析JSON响应
    try {
    const data = await response.json();
    console.log(`API响应:`, data);
    return data;
    } catch (e) {
      // 处理非JSON响应
      console.log('API响应不是JSON格式');
      return { status: 'success', message: '请求成功但返回非JSON格式' };
    }
  } catch (error) {
    console.error('API请求错误:', error);
    // 友好错误信息
    if (error.message === 'Failed to fetch') {
      console.error('无法连接到服务器，请确认后端服务已启动');
      error.message = '无法连接到服务器，请确认后端服务已启动';
    }
    throw error;
  }
}

// 示例：注册用户
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

// 示例：用户登录
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

// 提交问卷结果
export const submitAssessment = async (userId, assessmentData) => {
  try {
    const response = await api.post(`/assessments/${userId}`, { 
      assessmentData 
    });
    return response.data;
  } catch (error) {
    console.error('提交问卷失败:', error);
    throw error;
  }
};

// 用户信息相关
export const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 评估相关
export const fetchAssessmentResults = async (userId) => {
  try {
    const response = await api.get(`/assessments/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 向AI教练发送消息并获取回复
 * @param {object} data - 包含消息内容、用户ID、聊天历史和评估结果的对象
 * @returns {Promise} 返回AI回复
 */
export const sendMessageToCoach = async (data) => {
  try {
    // 使用通用请求函数来处理请求
    console.log('发送消息到AI教练:', data);
    
    // 根据环境选择正确的 API 基础 URL
    let baseUrl;
    if (isGitHubPages) {
      baseUrl = process.env.REACT_APP_API_URL || 'https://你的API服务器地址';
    } else if (process.env.NODE_ENV === 'production') {
      baseUrl = process.env.REACT_APP_API_URL || '';
    } else {
      baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    }
    
    const url = `${baseUrl}/api/coach/chat`;
    console.log('请求 URL:', url);
    
    // 发送请求
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI教练响应错误:', response.status, errorText);
      throw new Error(`服务器响应错误: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('AI教练响应:', result);
    
    if (result.status === 'success') {
      return { reply: result.reply };
    } else {
      throw new Error(result.message || '获取回复失败');
    }
  } catch (error) {
    console.error('AI教练请求错误:', error);
    // 提供更友好的错误信息
    if (error.message.includes('无法连接到服务器') || error.message === 'Failed to fetch') {
      throw new Error('无法连接到AI教练服务，请确认后端服务已启动');
    } else {
      throw new Error(`AI教练回复错误: ${error.message}`);
    }
  }
};

// 系统健康检查
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 导出API服务
const apiService = {
  loginUser,
  registerUser,
  fetchUserProfile,
  fetchAssessmentResults,
  submitAssessment,
  sendMessageToCoach,
  checkHealth
}; 

export default apiService; 