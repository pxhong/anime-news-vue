import api from './index';
import { ChunkUploader } from '@/utils/uploader';

export interface Work {
  id: number;
  author: { id: number; username: string; avatar: string | null };
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

export const uploadVideoWithChunks = (
  file: File,
  onProgress?: (progress: number, uploaded: number, total: number) => void,
  onComplete?: (result: any) => void,
  onError?: (error: Error) => void
): { uploader: ChunkUploader; start: () => Promise<void> } => {
  const fileId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  
  const uploader = new ChunkUploader({
    file,
    fileId,
    onProgress,
    onComplete,
    onError
  });

  return {
    uploader,
    start: () => uploader.upload()
  };
};

export const getWorks = (params?: { page?: number; search?: string; work_type?: string }) =>
  api.get('/works/', { params });

export const getWork = (id: number) => api.get(`/works/${id}/`);

// ✅ 全局 json header 已删除，FormData 自动走 multipart
export const createWork = (data: FormData) => api.post('/works/', data);

export const getMyWorks = (params?: { page?: number }) =>
  api.get('/works/mine/', { params });

export const updateWork = (id: number, data: FormData) => api.patch(`/works/${id}/`, data);

export const deleteWork = (id: number) => api.delete(`/works/${id}/`);

export const likeWork = (id: number) => api.post(`/works/${id}/like/`);

export const getLikeStatus = (id: number) => api.get(`/works/${id}/like_status/`);