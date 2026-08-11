<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>🎌 二次元资讯站</h1>
      <p>发现最新的二次元资讯、动漫推荐和游戏情报</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-tip">
      <span class="loading-spinner">⏳</span> 加载中...
    </div>

    <!-- 作品列表 -->
    <div v-else-if="works.length > 0" class="works-list">
      <div v-for="work in works" :key="work.id" class="work-card" @click="goToDetail(work.id)">
        <!-- 封面图 -->
        <div class="work-cover" v-if="work.cover">
          <img :src="getImageUrl(work.cover)" :alt="work.title" loading="lazy" />
        </div>
        <div class="work-cover-placeholder" v-else>
          <span>📰</span>
        </div>
        
        <!-- 内容 -->
        <div class="work-info">
          <div class="work-type" :class="work.work_type">
            {{ work.work_type === 'article' ? '📝 文章' : '🎬 视频' }}
          </div>
          <h3 class="work-title">{{ work.title }}</h3>
          <p class="work-summary">{{ work.content?.slice(0, 120) || '暂无内容' }}...</p>
          <div class="work-meta">
            <span class="work-author">👤 {{ work.author?.username || '匿名' }}</span>
            <span class="work-date">📅 {{ formatDate(work.created_at) }}</span>
            <span class="work-stats">❤️ {{ work.likes || 0 }}  👁️ {{ work.views || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!loading" class="empty-tip">
      <span class="empty-icon">📭</span>
      <p>暂无作品，快来发布第一个吧！</p>
      <router-link to="/admin" class="empty-btn" v-if="userStore.isLoggedIn">去投稿</router-link>
      <router-link to="/login" class="empty-btn" v-else>登录后投稿</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getWorks } from '@/api/work';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const works = ref<any[]>([]);
const loading = ref(true);

// 获取图片完整URL
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
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
    month: 'short',
    day: 'numeric'
  });
};

// 跳转到详情页
const goToDetail = (id: number) => {
  router.push(`/newsdetail/${id}`);
};

// 加载作品列表
const loadWorks = async () => {
  loading.value = true;
  try {
    const res = await getWorks();
    works.value = res.data.results || res.data || [];
    console.log('✅ 加载成功，共', works.value.length, '条数据');
  } catch (error) {
    console.error('❌ 加载失败:', error);
    works.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadWorks();
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 头部 */
.hero-section {
  text-align: center;
  padding: 40px 20px 32px;
  background: linear-gradient(135deg, #f8f0ff 0%, #fff0f5 100%);
  border-radius: 16px;
  margin-bottom: 32px;
}

.hero-section h1 {
  font-size: 32px;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.hero-section p {
  color: #666;
  font-size: 16px;
}

/* 加载状态 */
.loading-tip {
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 18px;
}

.loading-spinner {
  font-size: 24px;
  margin-right: 8px;
}

/* 作品列表 */
.works-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* 作品卡片 */
.work-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.work-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

/* 封面图 */
.work-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.work-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.work-card:hover .work-cover img {
  transform: scale(1.05);
}

.work-cover-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  font-size: 48px;
  color: #ccc;
}

/* 内容 */
.work-info {
  padding: 16px 20px 20px;
}

.work-type {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}

.work-type.article {
  background: #e8f5e9;
  color: #4caf50;
}

.work-type.video {
  background: #e3f2fd;
  color: #2196f3;
}

.work-title {
  font-size: 18px;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #999;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.work-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.work-stats {
  margin-left: auto;
}

/* 空状态 */
.empty-tip {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.empty-tip p {
  font-size: 18px;
  margin-bottom: 20px;
}

.empty-btn {
  display: inline-block;
  padding: 10px 32px;
  background: #FB7299;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s;
}

.empty-btn:hover {
  background: #e85a7a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 24px;
  }
  
  .works-list {
    grid-template-columns: 1fr;
  }
  
  .work-cover {
    height: 160px;
  }
}
</style>