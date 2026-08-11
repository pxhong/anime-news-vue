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

export const getWorks = (params?: { page?: number; search?: string; work_type?: string }) => {
  return api.get('/works/', { params });
};

export const getWork = (id: number) => {
  return api.get(`/works/${id}/`);
};

export const createWork = (data: FormData) => {
  return api.post('/works/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const likeWork = (id: number) => {
  return api.post(`/works/${id}/like/`);
};

export const getLikeStatus = (id: number) => {
  return api.get(`/works/${id}/like_status/`);
};