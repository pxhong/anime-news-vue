import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'http://42.193.218.113:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 1000000,
  // ✅ 不再全局声明 Content-Type，让 axios 自动判断
});

// 通用 URL 修复
const fixImageUrl = (url: string): string => {
  if (!url) return '';
  if (typeof url !== 'string') return url;
    if (url.startsWith('http://42.193.218.113')) return url;
  if (url.startsWith('http://')) return url.replace('http://', 'https://'); 
    if (url.startsWith('/media/')) return `http://42.193.218.113:8000${url}`;
  return url;
};

// 递归修复所有 URL
const fixAllUrls = (data: any): any => {
  if (!data) return data;
  if (typeof data === 'string') return fixImageUrl(data);
  if (Array.isArray(data)) return data.map((item) => fixAllUrls(item));
  if (typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      if (['cover', 'avatar', 'avatar_url', 'file', 'url', 'image', 'photo', 'picture'].includes(key)) {
        result[key] = fixImageUrl(data[key]);
      } else {
        result[key] = fixAllUrls(data[key]);
      }
    }
    return result;
  }
  return data;
};

// 请求拦截器 - 自动添加 Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 响应拦截器 - 自动修复 HTTP 链接
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data) response.data = fixAllUrls(response.data);
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