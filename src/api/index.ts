import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const getBaseURL = (): string => {
  if (import.meta.env.PROD) {
    return 'https://anime-news-backend-production.up.railway.app/api';
  }
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
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理 Token 过期
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      if (window.location.pathname !== '/anime-news-vue/login') {
        window.location.href = '/anime-news-vue/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;