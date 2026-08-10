import api from './index';

export interface Work {
  id: number;
  author: {
    id: number;
    username: string;
    avatar: string | null;
  };
  title: string;
  content: string;
  work_type: 'article' | 'video';
  file: string | null;
  cover: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
}

// 获取作品列表
export const getWorks = (params?: { 
  page?: number; 
  search?: string; 
  work_type?: string 
}) => {
  return api.get('/works/', { params });
};

// 获取单个作品
export const getWork = (id: number) => {
  return api.get(`/works/${id}/`);
};

// 创建作品
export const createWork = (data: FormData) => {
  return api.post('/works/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 更新作品
export const updateWork = (id: number, data: FormData) => {
  return api.put(`/works/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 删除作品
export const deleteWork = (id: number) => {
  return api.delete(`/works/${id}/`);
};