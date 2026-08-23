/**
 * 全局媒体 URL 与格式化工具
 * 统一所有页面对后端地址、数字、日期的处理
 */

export const API_BASE = 'https://anime-news-backend-production.up.railway.app';

/** 图片完整地址：兼容相对路径 /media/、media/ 与绝对地址 */
export function getImageUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
}

/** 视频完整地址（与图片同规则） */
// src/utils/media.ts
/** 视频完整地址（强制带 /media/ 前缀） */
export function getVideoUrl(path?: string | null): string {
  if (!path) return '';

  // 已经是完整 http(s) 地址：直接返回（并确保 https）
  if (path.startsWith('http://')) {
    return path.replace('http://', 'https://');
  }
  if (path.startsWith('https://')) {
    return path;
  }

  // 去掉开头的斜杠，统一处理
  const clean = path.startsWith('/') ? path.slice(1) : path;

  // ✅ 关键：如果路径不是以 media/ 开头，就补上 media/
  const withMedia = clean.startsWith('media/') ? clean : `media/${clean}`;

  return `${API_BASE}/${withMedia}`;
}

/** 播放量/点赞数 万、亿缩写 */
export function formatViewCount(n?: number | string): string {
  n = Number(n) || 0;
  if (n >= 1e8) return (n / 1e8).toFixed(1) + '亿';
  if (n >= 1e4) return (n / 1e4).toFixed(1) + '万';
  return String(n);
}

/** 日期格式化 */
export function formatDate(s?: string): string {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/** 相对时间（用于评论） */
export function formatRelativeTime(s?: string): string {
  if (!s) return '';
  try {
    const date = new Date(s);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 604800) return Math.floor(diff / 86400) + '天前';
    return formatDate(s);
  } catch {
    return '';
  }
}