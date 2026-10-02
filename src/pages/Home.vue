<template>
  <div class="home-page">
    <header class="hero">
      <h1 class="hero-title">二次元资讯站</h1>
      <p class="hero-sub">发现最新的二次元资讯、动漫推荐与游戏情报</p>
    </header>

    <div v-if="loading" class="state-tip">
      <div class="spinner"></div>
      <span>加载中</span>
    </div>

    <div v-else-if="works.length" class="work-grid">
      <article v-for="work in works" :key="work.id" class="work-card" @click="goToDetail(work.id)">
        <div class="cover">
          <img v-if="work.cover" :src="getImageUrl(work.cover)" :alt="work.title" loading="lazy" />
          <div v-else class="cover-fallback">
            <svg v-if="work.work_type === 'video'" viewBox="0 0 24 24" class="cover-icon"><path d="M8 5v14l11-7z"/></svg>
            <svg v-else viewBox="0 0 24 24" class="cover-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span v-if="work.work_type === 'video'" class="play-tag">
            <svg viewBox="0 0 24 24" class="play-icon"><path d="M8 5v14l11-7z"/></svg>
          </span>
          <span class="type-badge" :class="work.work_type">
            {{ work.work_type === 'video' ? '视频' : '文章' }}
          </span>
        </div>
        <div class="body">
          <h3 class="title">{{ work.title }}</h3>
          <p class="summary">{{ work.content?.slice(0, 80) || '暂无内容' }}</p>
          <div class="meta">
            <span class="author">
              <svg viewBox="0 0 24 24" class="meta-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {{ work.author?.username || '匿名' }}
            </span>
            <span class="meta-item">{{ formatViewCount(work.views) }} 播放</span>
            <span class="meta-item">{{ formatViewCount(work.likes) }} 点赞</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="state-tip empty">
      <p>暂无作品，快来发布第一个吧</p>
      <router-link v-if="userStore.isLoggedIn" to="/admin" class="empty-btn">去投稿</router-link>
      <router-link v-else to="/login" class="empty-btn">登录后投稿</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getWorks } from '@/api/work';
import { useUserStore } from '@/stores/user';
import { getImageUrl, formatViewCount, formatDate } from '@/utils/media';

const router = useRouter();
const userStore = useUserStore();

const works = ref<any[]>([]);
const loading = ref(true);

const goToDetail = (id: number) => router.push(`/newsdetail/${id}`);

const loadWorks = async () => {
  loading.value = true;
  try {
    const res = await getWorks();
    works.value = res.data.results || res.data || [];
  } catch (e) {
    works.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadWorks);
</script>

<style scoped>
.home-page { max-width: 1120px; margin: 0 auto; padding: 20px 16px; }

.hero { text-align: center; padding: 36px 20px 28px; margin-bottom: 28px;
  background: linear-gradient(135deg, #fdf6f9 0%, #f7f8fc 100%);
  border-radius: 12px; }
.hero-title { font-size: 28px; color: #18191c; margin-bottom: 8px; letter-spacing: 1px; }
.hero-sub { color: #61666d; font-size: 15px; }

.state-tip { display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 60px 0; color: #9499a0; font-size: 15px; }
.state-tip.empty { color: #61666d; }
.spinner { width: 28px; height: 28px; border: 3px solid #f0f1f2; border-top-color: #FB7299;
  border-radius: 50%; animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.work-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(216px, 1fr)); gap: 20px; }

.work-card { background: #fff; border: 1px solid #f0f1f2; border-radius: 8px; overflow: hidden;
  cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.work-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }

.cover { position: relative; aspect-ratio: 16 / 9; background: #f1f2f3; overflow: hidden; }
.cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.work-card:hover .cover img { transform: scale(1.04); }
.cover-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.cover-icon { width: 36px; height: 36px; fill: #c9ccd0; }

.play-tag { position: absolute; right: 8px; bottom: 8px; width: 32px; height: 32px;
  border-radius: 50%; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; }
.play-icon { width: 14px; height: 14px; fill: #fff; margin-left: 2px; }

.type-badge { position: absolute; left: 8px; top: 8px; padding: 2px 10px; border-radius: 10px;
  font-size: 11px; background: rgba(0,0,0,0.6); color: #fff; }

.body { padding: 12px 14px 14px; }
.title { font-size: 15px; color: #18191c; margin: 0 0 6px; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 42px; }
.summary { font-size: 13px; color: #9499a0; margin: 0 0 10px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #9499a0; }
.author { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #61666d; }
.meta-icon { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2; flex-shrink: 0; }
.meta-item { flex-shrink: 0; }

.empty-btn { display: inline-block; padding: 9px 26px; background: #FB7299; color: #fff;
  border-radius: 20px; font-size: 14px; transition: background 0.2s; }
.empty-btn:hover { background: #e86288; }

@media (max-width: 640px) {
  .work-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .hero-title { font-size: 22px; }
}
</style>