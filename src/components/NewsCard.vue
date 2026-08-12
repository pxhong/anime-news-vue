<template>
  <div class="news-card" @click="$emit('click')">
    <div class="cover">
      <!-- 如果有封面图则显示 -->
      <img 
        v-if="item.cover" 
        :src="getImageUrl(item.cover)" 
        :alt="item.title" 
        loading="lazy"
        @error="handleImageError"
      />
      <!-- 没有封面图则显示占位 -->
      <div v-else class="cover-placeholder">
        <span>📰</span>
      </div>
    </div>
    <div class="info">
      <h3 class="title">{{ item.title }}</h3>
      <p class="summary">{{ item.content || item.summary || '暂无内容' }}</p>
      <div class="meta">
        <span class="author">👤 {{ item.author?.username || '匿名' }}</span>
        <span class="date">📅 {{ formatDate(item.created_at || item.date) }}</span>
        <span class="type" :class="item.work_type">
          {{ item.work_type === 'article' ? '文章' : '视频' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 定义 Props - 兼容本地数据和后端数据
defineProps<{
  item: {
    id: number;
    title: string;
    content?: string;
    summary?: string;
    cover: string | null;
    work_type?: 'article' | 'video';
    created_at?: string;
    date?: string;
    author?: {
      username: string;
    };
  };
}>();

// 定义事件
defineEmits<{
  (e: 'click'): void;
}>();

// 获取图片完整URL - 自动处理 http -> https
const getImageUrl = (path: string) => {
  if (!path) return '';
  
  // 如果是 http，强制转为 https
  if (path.startsWith('http://')) {
    return path.replace('http://', 'https://');
  }
  
  // 如果已经是 https，直接返回
  if (path.startsWith('https://')) {
    return path;
  }
  
  // 如果是 /media/ 开头的相对路径
  if (path.startsWith('/media/')) {
    return `https://anime-news-backend-production.up.railway.app${path}`;
  }
  
  // 如果是 media/ 开头的相对路径（没有前导斜杠）
  if (path.startsWith('media/')) {
    return `https://anime-news-backend-production.up.railway.app/${path}`;
  }
  
  // 其他情况，尝试拼接
  return path;
};

// 图片加载失败处理
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
  // 显示占位符
  const parent = img.parentElement;
  if (parent) {
    const placeholder = document.createElement('div');
    placeholder.className = 'cover-placeholder';
    placeholder.innerHTML = '<span>📰</span>';
    parent.appendChild(placeholder);
  }
};

// 格式化日期 - 兼容 created_at 和 date
const formatDate = (dateString: string) => {
  if (!dateString) return '未知日期';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '未知日期';
  }
};
</script>

<style scoped>
.news-card {
  display: flex;
  gap: 16px;
  background: #f4f4f4;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.22s ease;
}
.news-card:hover {
  background: #eeeeee;
  transform: translateY(-3px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
}

.cover {
  width: 240px;
  height: 136px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e8e8e8;
  position: relative;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #ccc;
  background: #f0f0f0;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 17px;
  color: #222;
  margin: 0 0 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #999;
}

.meta .type {
  padding: 1px 10px;
  border-radius: 10px;
  font-size: 11px;
}

.meta .type.article {
  background: #e8f5e9;
  color: #4caf50;
}

.meta .type.video {
  background: #e3f2fd;
  color: #2196f3;
}

/* 手机端适配 */
@media (max-width: 768px) {
  .news-card {
    flex-direction: column;
  }
  .cover {
    width: 100%;
    height: 200px;
  }
}
</style>