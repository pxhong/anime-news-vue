<template>
  <div class="detail-page" v-if="article">
    <h1 class="title">{{ article.title }}</h1>
    <div class="meta">
      <span>👤 {{ article.author?.username || '匿名' }}</span>
      <span>📅 {{ formatDate(article.created_at) }}</span>
      <span class="type" :class="article.work_type">
        {{ article.work_type === 'article' ? '📝 文章' : '🎬 视频' }}
      </span>
    </div>

    <div class="cover-wrap" v-if="article.cover">
      <img :src="getImageUrl(article.cover)" :alt="article.title" />
    </div>

    <div class="content">
      {{ article.content }}
    </div>

    <!-- 视频播放 -->
    <div class="video-container" v-if="article.work_type === 'video' && article.file">
      <video controls class="video-player">
        <source :src="getImageUrl(article.file)" />
        您的浏览器不支持视频播放
      </video>
    </div>

    <!-- 点赞和浏览量 -->
    <div class="actions">
      <button @click="toggleLike" class="like-btn" :class="{ 'liked': liked }" :disabled="likeLoading">
        {{ liked ? '❤️' : '🤍' }} {{ likesCount }}
      </button>
      <span class="views">👁️ {{ article.views || 0 }}</span>
    </div>

    <div class="back-btn-wrap">
      <button class="btn btn-primary" @click="goBack">
        ← 返回新闻列表
      </button>
    </div>
  </div>

  <div v-else-if="loading" class="loading-tip">⏳ 加载中...</div>
  <div v-else-if="error" class="error-tip">
    ❌ {{ error }}
    <button @click="loadArticle" class="retry-btn">重试</button>
  </div>
  <div v-else class="empty-tip">新闻不存在或已被删除</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getWork } from '@/api/work';
import api from '@/api/index';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const article = ref<any>(null);
const loading = ref(true);
const error = ref('');

// 点赞相关
const liked = ref(false);
const likesCount = ref(0);
const likeLoading = ref(false);

// 获取图片完整URL
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // 如果是相对路径，拼接后端地址
  const baseURL = 'https://anime-news-backend-production.up.railway.app';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${cleanPath}`;
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知日期';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 加载文章详情
const loadArticle = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const id = route.params.id;
    if (!id) {
      error.value = '新闻ID不存在';
      return;
    }
    
    const res = await getWork(Number(id));
    article.value = res.data;
    likesCount.value = res.data.likes || 0;
    
    // 如果已登录，获取点赞状态
    if (userStore.isLoggedIn) {
      await getLikeStatus();
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || '加载新闻失败，请重试';
    console.error('加载新闻失败:', err);
  } finally {
    loading.value = false;
  }
};

// 获取点赞状态
const getLikeStatus = async () => {
  try {
    const id = route.params.id;
    const res = await api.get(`/works/${id}/like_status/`);
    liked.value = res.data.liked;
    likesCount.value = res.data.likes_count;
  } catch (err) {
    console.error('获取点赞状态失败:', err);
  }
};

// 切换点赞
const toggleLike = async () => {
  // 未登录时跳转登录
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  likeLoading.value = true;
  try {
    const id = route.params.id;
    const res = await api.post(`/works/${id}/like/`);
    liked.value = res.data.liked;
    likesCount.value = res.data.likes_count;
    // 更新 article 中的 likes
    article.value.likes = res.data.likes_count;
  } catch (err: any) {
    console.error('点赞失败:', err);
    if (err.response?.status === 401) {
      router.push('/login');
    } else {
      alert('操作失败，请重试');
    }
  } finally {
    likeLoading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.push('/news');
};

onMounted(() => {
  loadArticle();
});
</script>

<style scoped>
.detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 28px;
  color: #1a1a2e;
  margin-bottom: 16px;
  line-height: 1.4;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #888;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.type {
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.type.article {
  background: #e8f5e9;
  color: #4caf50;
}

.type.video {
  background: #e3f2fd;
  color: #2196f3;
}

.cover-wrap {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  background: #f5f5f5;
}

.cover-wrap img {
  width: 100%;
  max-height: 460px;
  object-fit: contain;
}

.content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-line;
}

.video-container {
  margin: 24px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.video-player {
  width: 100%;
  max-height: 500px;
  display: block;
}

.actions {
  display: flex;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 24px;
}

.like-btn {
  padding: 8px 24px;
  background: transparent;
  border: 1.5px solid #e74c3c;
  color: #e74c3c;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.like-btn:hover:not(:disabled) {
  background: #e74c3c;
  color: #fff;
}

.like-btn.liked {
  background: #e74c3c;
  color: #fff;
}

.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.views {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 14px;
}

.back-btn-wrap {
  margin-top: 30px;
}

.btn {
  padding: 10px 28px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #FB7299;
  color: white;
}

.btn-primary:hover {
  background: #e85a7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

.loading-tip,
.empty-tip,
.error-tip {
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 18px;
}

.error-tip {
  color: #e74c3c;
}

.retry-btn {
  display: block;
  margin: 12px auto 0;
  padding: 8px 24px;
  background: #FB7299;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background: #e85a7a;
}
</style>