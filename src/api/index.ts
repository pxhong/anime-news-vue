import axios from 'axios';

const getBaseURL = (): string => {
  // 生产环境
  if (import.meta.env.PROD) {
    return 'https://anime-news-backend-production.up.railway.app/api';  // ✅ 替换为你的域名
  }
  // 开发环境
  return 'http://127.0.0.1:8000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 处理 Token 过期
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      window.location.href = '/anime-news-vue/login';
    }
    return Promise.reject(error);
  }
);

export default api;