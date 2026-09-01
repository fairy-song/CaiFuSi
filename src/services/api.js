import axios from 'axios';

// 这里是API服务模块，用于处理与后端的通信

const DEFAULT_REQUEST_TIMEOUT = 30000;
const DEFAULT_RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;

// 检查是否在GitHub Pages环境
const isGitHubPages = window.location.hostname === 'xiaocow666.github.io';

const resolveApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (isGitHubPages) {
    console.warn('GitHub Pages 环境未配置 REACT_APP_API_URL，将使用占位地址');
    return 'https://你的API服务器地址';
  }

  return 'http://localhost:5001/api';
};

// 默认的API基础URL
const API_BASE_URL = resolveApiBaseUrl();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildFriendlyError = (error, fallbackMessage) => {
  if (error.name === 'AbortError') {
    return new Error('请求超时，请稍后重试');
  }

  if (error.code === 'ECONNABORTED') {
    return new Error('请求超时，请检查网络或稍后重试');
  }

  if (error.message === 'Failed to fetch' || error.message === 'Network Error') {
    return new Error('无法连接到服务器，请确认后端服务已启动');
  }

  return new Error(error.message || fallbackMessage);
};

const shouldRetry = (error, retriesLeft) => {
  if (retriesLeft <= 0) {
    return false;
  }

  if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
    return true;
  }

  if (error.message === 'Failed to fetch' || error.message === 'Network Error') {
    return true;
  }

  const status = error.response?.status;
  return status >= 500 || status === 429;
};

const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const requestWithRetry = async (
  requestFn,
  {
    retries = DEFAULT_RETRY_COUNT,
    retryDelay = RETRY_DELAY_MS,
    fallbackMessage = '请求失败，请稍后重试',
  } = {}
) => {
  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error, retries - attempt)) {
        throw buildFriendlyError(error, fallbackMessage);
      }

      attempt += 1;
      if (attempt > retries) {
        break;
      }

      console.warn(`请求失败，准备进行第 ${attempt} 次重试`, error);
      await sleep(retryDelay * attempt);
    }
  }

  throw buildFriendlyError(lastError, fallbackMessage);
};

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_REQUEST_TIMEOUT,
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
  async (error) => {
    // 处理401错误 (未认证)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      // 可以在这里添加重定向到登录页的逻辑
    }

    const config = error.config || {};
    config.__retryCount = config.__retryCount || 0;

    if (shouldRetry(error, DEFAULT_RETRY_COUNT - config.__retryCount)) {
      config.__retryCount += 1;
      await sleep(RETRY_DELAY_MS * config.__retryCount);
      return api(config);
    }

    return Promise.reject(buildFriendlyError(error, '请求失败，请稍后重试'));
  }
);

// 通用请求函数
async function fetchApi(endpoint, options = {}) {
  // 根据环境选择API基础URL
  let baseUrl;

  // 在GitHub Pages环境中使用外部API服务
  if (isGitHubPages) {
    baseUrl = process.env.REACT_APP_API_URL || 'https://你的API服务器地址';
    // 注意: 外部API服务需要配置CORS允许GitHub Pages域名访问
  } else if (process.env.NODE_ENV === 'production') {
    baseUrl = process.env.REACT_APP_API_URL || '';
  } else {
    baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
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
    const response = await requestWithRetry(
      () => fetchWithTimeout(url, fetchOptions, DEFAULT_REQUEST_TIMEOUT),
      { fallbackMessage: 'API请求失败，请稍后重试' }
    );

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
    throw buildFriendlyError(error, 'API请求失败，请稍后重试');
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
    console.log('发送消息到AI教练:', data);

    const response = await requestWithRetry(
      () =>
        fetchApi('/coach/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }),
      {
        retries: 1,
        fallbackMessage: 'AI教练服务暂时不可用，请稍后重试',
      }
    );

    console.log('AI教练响应:', response);

    if (response.status === 'success') {
      return { reply: response.reply };
    }

    throw new Error(response.message || '获取回复失败');
  } catch (error) {
    console.error('AI教练请求错误:', error);

    if (error.message.includes('无法连接到服务器')) {
      throw new Error('无法连接到AI教练服务，请确认后端服务已启动');
    }

    if (error.message.includes('超时')) {
      throw new Error('AI教练响应超时，请稍后重试');
    }

    throw new Error(`AI教练回复错误: ${error.message}`);
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

// Dashboard API
export const getDashboardOverview = async () => {
  try {
    const response = await api.get('/dashboard/overview');
    return response.data;
  } catch (error) {
    console.error('获取Dashboard概览失败:', error);
    throw error;
  }
};

export const getFinancialHealth = async () => {
  try {
    const response = await api.get('/dashboard/financial-health');
    return response.data;
  } catch (error) {
    console.error('获取财务健康度失败:', error);
    throw error;
  }
};

export const getUserGoals = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await api.get('/dashboard/goals', { params });
    return response.data;
  } catch (error) {
    console.error('获取用户目标失败:', error);
    throw error;
  }
};

export const createGoal = async (goalData) => {
  try {
    const response = await api.post('/dashboard/goals', goalData);
    return response.data;
  } catch (error) {
    console.error('创建目标失败:', error);
    throw error;
  }
};

export const updateGoal = async (goalId, updates) => {
  try {
    const response = await api.put(`/dashboard/goals/${goalId}`, updates);
    return response.data;
  } catch (error) {
    console.error('更新目标失败:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId) => {
  try {
    const response = await api.delete(`/dashboard/goals/${goalId}`);
    return response.data;
  } catch (error) {
    console.error('删除目标失败:', error);
    throw error;
  }
};

export const getRecommendations = async () => {
  try {
    const response = await api.get('/dashboard/recommendations');
    return response.data;
  } catch (error) {
    console.error('获取建议失败:', error);
    throw error;
  }
};

// Assessment API (新增)
export const submitAssessmentNew = async (assessmentData) => {
  try {
    const response = await api.post('/assessment/submit', { assessment: assessmentData });
    return response.data;
  } catch (error) {
    console.error('提交评估失败:', error);
    throw error;
  }
};

export const getLatestAssessment = async () => {
  try {
    const response = await api.get('/assessment/latest');
    return response.data;
  } catch (error) {
    console.error('获取最新评估失败:', error);
    throw error;
  }
};

export const getAssessmentHistory = async () => {
  try {
    const response = await api.get('/assessment/history');
    return response.data;
  } catch (error) {
    console.error('获取评估历史失败:', error);
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
  checkHealth,
  // Dashboard APIs
  getDashboardOverview,
  getFinancialHealth,
  getUserGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getRecommendations,
  // Assessment APIs
  submitAssessmentNew,
  getLatestAssessment,
  getAssessmentHistory
};

export default apiService;