<template>
  <div class="detail-page">
    <!-- ===== 文章模式：封面 + 正文 ===== -->
    <template v-if="article && article.work_type === 'article'">
      <h1 class="video-title">{{ article.title }}</h1>
      <div class="info-bar">
        <div class="info-left">
          <span class="author-chip">
            <img :src="getAvatarUrl(article.author?.avatar_url)" :alt="article.author?.username" class="author-avatar" />
            <span class="author-name">{{ article.author?.username || '匿名用户' }}</span>
          </span>
          <span class="dot">·</span>
          <span class="info-item">{{ formatViewCount(article.views) }} 次阅读</span>
          <span class="dot">·</span>
          <span class="info-item">{{ formatDate(article.created_at) }}</span>
        </div>
        <div class="info-right" v-if="isAuthor">
          <button class="del-btn" @click="handleDelete">删除作品</button>
        </div>
      </div>
      <div class="cover-wrap" v-if="article.cover">
        <img :src="getImageUrl(article.cover)" :alt="article.title" />
      </div>
      <div class="content-box">{{ article.content }}</div>
      <div class="action-bar">
        <button class="action-btn" :class="{ active: liked }" @click="toggleLike" :disabled="likeLoading">
          <svg viewBox="0 0 24 24" class="icon"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span class="count">{{ formatViewCount(likesCount) }}</span>
        </button>
        <button class="action-btn" @click="share">
          <svg viewBox="0 0 24 24" class="icon"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <span class="label">分享</span>
        </button>
        <span v-if="copied" class="copied-tip">链接已复制</span>
      </div>
    </template>

    <!-- ===== 视频模式：播放器 + 信息条 ===== -->
    <template v-else-if="article && article.work_type === 'video'">
      <div class="player-wrapper">
        <div class="player-box">
          <video
            ref="videoPlayer"
            controls
            class="video-player"
            preload="metadata"
            playsinline
            @error="onVideoError"
            @loadeddata="onVideoLoaded"
            @canplay="onVideoCanPlay"
            @waiting="onVideoWaiting"
            @playing="onVideoPlaying"
            @pause="onVideoPause"
          >
            <source :src="getVideoUrl(article.file)" type="video/mp4" />
            您的浏览器不支持视频播放
          </video>

          <!-- 标题浮层 -->
          <div class="player-overlay" v-if="showOverlay && !videoLoading && !videoError">
            <h1 class="overlay-title">{{ article.title }}</h1>
            <div class="overlay-meta">
              <span>{{ formatViewCount(article.views) }} 次观看</span>
              <span class="dot">·</span>
              <span>{{ formatDate(article.created_at) }}</span>
            </div>
          </div>

          <!-- 加载浮层 -->
          <div v-if="videoLoading && !videoError" class="player-mask loading">
            <div class="spinner"></div>
            <span class="mask-text">加载中...</span>
          </div>

          <!-- 错误浮层 -->
          <div v-if="videoError && !videoLoading" class="player-mask error">
            <svg viewBox="0 0 24 24" class="mask-icon">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="mask-text">视频加载失败</span>
            <button class="retry-btn" @click="retryVideo">重试</button>
          </div>
        </div>
      </div>

      <h1 class="video-title">{{ article.title }}</h1>

      <div class="info-bar">
        <div class="info-left">
          <span class="author-chip">
            <img :src="getAvatarUrl(article.author?.avatar_url)" :alt="article.author?.username" class="author-avatar" />
            <span class="author-name">{{ article.author?.username || '匿名用户' }}</span>
          </span>
          <span class="dot">·</span>
          <span class="info-item">{{ formatViewCount(article.views) }} 次观看</span>
          <span class="dot">·</span>
          <span class="info-item">{{ formatDate(article.created_at) }}</span>
        </div>
        <div class="info-right" v-if="isAuthor">
          <button class="del-btn" @click="handleDelete">删除作品</button>
        </div>
      </div>

      <div class="action-bar">
        <button class="action-btn" :class="{ active: liked }" @click="toggleLike" :disabled="likeLoading">
          <svg viewBox="0 0 24 24" class="icon"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span class="count">{{ formatViewCount(likesCount) }}</span>
        </button>
        <button class="action-btn" @click="share">
          <svg viewBox="0 0 24 24" class="icon"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <span class="label">分享</span>
        </button>
        <span v-if="copied" class="copied-tip">链接已复制</span>
      </div>

      <div class="desc-box" v-if="article.content">
        <h3 class="desc-title">简介</h3>
        <p class="desc-text">{{ article.content }}</p>
      </div>
    </template>

    <!-- ===== 相关推荐 ===== -->
    <div class="related-section" v-if="related.length">
      <h3 class="section-title">相关推荐</h3>
      <div class="related-grid">
        <div class="related-card" v-for="item in related" :key="item.id" @click="router.push(`/newsdetail/${item.id}`)">
          <div class="related-cover">
            <img v-if="item.cover" :src="getImageUrl(item.cover)" :alt="item.title" />
            <span v-else class="related-fallback">{{ item.work_type === 'video' ? '▶' : '文' }}</span>
          </div>
          <div class="related-info">
            <p class="related-title">{{ item.title }}</p>
            <p class="related-meta">{{ item.author?.username }} · {{ formatViewCount(item.views) }} 播放</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 状态 ===== -->
    <div v-if="loading" class="state-tip">加载中</div>
    <div v-else-if="error" class="state-tip error">{{ error }}</div>
    <div v-else-if="!article" class="state-tip">作品不存在或已被删除</div>

    <div class="back-wrap">
      <button class="back-btn" @click="goBack">返回列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getWork, getWorks, deleteWork } from '@/api/work';
import api from '@/api/index';
import { useUserStore } from '@/stores/user';
import { getImageUrl, getVideoUrl, formatViewCount, formatDate } from '@/utils/media';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const getAvatarUrl = (path) => getImageUrl(path);

const article = ref(null);
const loading = ref(true);
const error = ref('');
const related = ref([]);

// 视频
const videoPlayer = ref(null);
const videoLoading = ref(true);
const videoError = ref(false);
const showOverlay = ref(true);
let errorTimeout = null;
let retryCount = 0;
const MAX_RETRIES = 2;

// 点赞
const liked = ref(false);
const likesCount = ref(0);
const likeLoading = ref(false);

// 分享
const copied = ref(false);

const isAuthor = computed(() => {
  return !!(
    userStore.isLoggedIn &&
    article.value?.author?.id &&
    userStore.user?.id &&
    article.value.author.id === userStore.user.id
  );
});

const loadArticle = async () => {
  loading.value = true;
  error.value = '';
  try {
    const id = route.params.id;
    if (!id) { error.value = '作品ID不存在'; return; }
    const res = await getWork(Number(id));
    article.value = res.data;
    likesCount.value = res.data.likes || 0;
    if (userStore.isLoggedIn) await getLikeStatus();
    loadRelated(id);
  } catch (err) {
    error.value = err.response?.data?.detail || '加载失败，请重试';
  } finally {
    loading.value = false;
  }
};

const loadRelated = async (currentId) => {
  try {
    const res = await getWorks({ page: 1 });
    const list = (res.data.results || []).filter((w) => w.id !== Number(currentId));
    related.value = list.slice(0, 4);
  } catch (e) { /* 静默 */ }
};

const getLikeStatus = async () => {
  try {
    const res = await api.get(`/works/${route.params.id}/like_status/`);
    liked.value = res.data.liked;
    likesCount.value = res.data.likes_count;
  } catch (e) { /* 静默 */ }
};

const toggleLike = async () => {
  if (!userStore.isLoggedIn) { router.push('/login'); return; }
  likeLoading.value = true;
  try {
    const res = await api.post(`/works/${route.params.id}/like/`);
    liked.value = res.data.liked;
    likesCount.value = res.data.likes_count;
  } catch (err) {
    if (err.response?.status === 401) router.push('/login');
  } finally {
    likeLoading.value = false;
  }
};

const share = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (e) { /* 剪贴板不可用时静默 */ }
};

const handleDelete = async () => {
  if (!confirm('确定要删除这个作品吗？此操作不可恢复！')) return;
  try {
    await deleteWork(article.value.id);
    router.push('/news');
  } catch (err) {
    alert(err.response?.data?.detail || '删除失败，请重试');
  }
};

// ===== 视频事件处理 =====
const onVideoLoaded = () => {
  videoLoading.value = false;
  videoError.value = false;
  retryCount = 0;
  if (errorTimeout) {
    clearTimeout(errorTimeout);
    errorTimeout = null;
  }
};

const onVideoCanPlay = () => {
  videoLoading.value = false;
  videoError.value = false;
};

const onVideoWaiting = () => {
  // 只显示加载状态，不触发错误
  videoLoading.value = true;
};

const onVideoPlaying = () => {
  videoLoading.value = false;
  videoError.value = false;
};

const onVideoPause = () => {
  // 暂停时不做特殊处理
};

// 视频错误处理
const onVideoError = (e) => {
  const video = e.target;
  const errorCode = video.error?.code;
  
  // MEDIA_ERR_ABORTED = 用户主动停止，忽略
  if (errorCode === 1) {
    console.log('视频加载被用户中止');
    return;
  }
  
  // MEDIA_ERR_NETWORK = 网络错误，可以重试
  if (errorCode === 2) {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`网络错误，重试 ${retryCount}/${MAX_RETRIES}`);
      setTimeout(() => retryVideo(), 1000);
      return;
    }
  }
  
  // 其他错误或重试次数用完
  videoLoading.value = false;
  videoError.value = true;
  console.error('视频错误:', video.error);
};

const retryVideo = () => {
  videoError.value = false;
  videoLoading.value = true;
  showOverlay.value = false;
  if (videoPlayer.value) {
    videoPlayer.value.load();
  }
};

const goBack = () => router.push('/news');

onMounted(() => {
  loadArticle();
});

onUnmounted(() => {
  if (errorTimeout) {
    clearTimeout(errorTimeout);
    errorTimeout = null;
  }
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.src = '';
    videoPlayer.value.load();
  }
});
</script>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 16px;
  color: #18191c;
}

/* ===== 播放器 ===== */
.player-wrapper { display: flex; justify-content: center; }
.player-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
.video-player { width: 100%; height: 100%; display: block; background: #000; }

.player-overlay {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 48px 20px 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.72));
  pointer-events: none;
  color: #fff;
}
.overlay-title { margin: 0 0 6px; font-size: 18px; font-weight: 600; }
.overlay-meta { font-size: 13px; opacity: 0.85; display: flex; gap: 6px; align-items: center; }

.player-mask {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px;
  background: rgba(0,0,0,0.75);
  color: #fff;
  z-index: 10;
}

.player-mask.loading {
  background: rgba(0,0,0,0.7);
}

.player-mask.error {
  background: rgba(0,0,0,0.8);
}

.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: #FB7299;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.mask-icon {
  width: 44px; height: 44px;
  stroke: #fff;
  stroke-width: 1.5;
  fill: none;
}
.mask-text { font-size: 15px; }
.retry-btn {
  padding: 6px 22px;
  background: #FB7299;
  color: #fff;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}
.retry-btn:hover {
  background: #e86288;
}

/* ===== 标题与信息条 ===== */
.video-title {
  font-size: 22px;
  font-weight: 700;
  margin: 20px 0 14px;
  line-height: 1.4;
}

.info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.info-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #61666d;
  flex-wrap: wrap;
}
.author-chip {
  display: flex;
  align-items: center;
  gap: 8px;
}
.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #f1f2f3;
}
.author-name {
  color: #18191c;
  font-weight: 500;
}
.dot {
  color: #c9ccd0;
}
.info-item {
  color: #9499a0;
}

.del-btn {
  padding: 6px 16px;
  background: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 16px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.del-btn:hover {
  background: #e74c3c;
  color: #fff;
}

/* ===== 操作按钮 ===== */
.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 18px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: #f1f2f3;
  color: #61666d;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.action-btn:hover {
  background: #e3e5e7;
}
.action-btn.active {
  background: rgba(251,114,153,0.12);
  color: #FB7299;
}
.icon {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}
.action-btn .icon path,
.action-btn .icon circle,
.action-btn .icon line {
  stroke: currentColor;
}
.action-btn.active .icon {
  fill: #FB7299;
}
.count {
  font-weight: 500;
}
.label {
  font-weight: 500;
}
.copied-tip {
  color: #27ae60;
  font-size: 13px;
}

/* ===== 简介/正文 ===== */
.desc-box {
  background: #fff;
  border: 1px solid #f0f1f2;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}
.desc-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #18191c;
}
.desc-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #61666d;
  white-space: pre-line;
}
.content-box {
  font-size: 15px;
  line-height: 1.9;
  color: #333;
  white-space: pre-line;
}

/* ===== 封面（文章） ===== */
.cover-wrap {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  background: #f1f2f3;
}
.cover-wrap img {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
}

/* ===== 相关推荐 ===== */
.related-section {
  margin-top: 28px;
  border-top: 1px solid #f0f1f2;
  padding-top: 20px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 14px;
}
.related-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.related-card {
  display: flex;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.related-card:hover {
  background: #f6f7f8;
}
.related-cover {
  width: 120px;
  height: 72px;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f2f3;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9499a0;
  font-size: 13px;
}
.related-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.related-fallback {
  font-size: 18px;
}
.related-info {
  min-width: 0;
}
.related-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 500;
  color: #18191c;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.related-meta {
  margin: 0;
  font-size: 12px;
  color: #9499a0;
}

/* ===== 状态与返回 ===== */
.state-tip {
  text-align: center;
  padding: 60px 0;
  color: #9499a0;
  font-size: 16px;
}
.state-tip.error {
  color: #e74c3c;
}
.back-wrap {
  margin-top: 30px;
}
.back-btn {
  padding: 10px 26px;
  background: #fff;
  color: #61666d;
  border: 1px solid #d0d3d6;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.back-btn:hover {
  border-color: #FB7299;
  color: #FB7299;
}

@media (max-width: 640px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
  .video-title {
    font-size: 18px;
  }
  .info-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>