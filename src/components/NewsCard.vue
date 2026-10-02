<template>
  <div class="news-card" @click="$emit('click')">
    <div class="cover">
      <img v-if="item.cover && !imgFailed" :src="getImageUrl(item.cover)" :alt="item.title"
        loading="lazy" @error="imgFailed = true" />
      <div v-else class="cover-fallback">
        <svg v-if="item.work_type === 'video'" viewBox="0 0 24 24" class="fb-icon"><path d="M8 5v14l11-7z"/></svg>
        <svg v-else viewBox="0 0 24 24" class="fb-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <span v-if="item.work_type === 'video'" class="play-tag">
        <svg viewBox="0 0 24 24" class="play-icon"><path d="M8 5v14l11-7z"/></svg>
      </span>
    </div>
    <div class="info">
      <h3 class="title">{{ item.title }}</h3>
      <p class="summary">{{ item.content || item.summary || '暂无内容' }}</p>
      <div class="meta">
        <span class="author">
          <svg viewBox="0 0 24 24" class="meta-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {{ item.author?.username || '匿名' }}
        </span>
        <span class="meta-item">
          <svg viewBox="0 0 24 24" class="meta-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {{ formatViewCount(item.views) }}
        </span>
        <span class="type" :class="item.work_type">{{ item.work_type === 'article' ? '文章' : '视频' }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { getImageUrl, formatViewCount } from '@/utils/media';
defineProps<{
  item: {
    id: number;
    title: string;
    content?: string;
    summary?: string;
    cover: string | null;
    views?: number;
    work_type?: 'article' | 'video';
    created_at?: string;
    date?: string;
    author?: { username: string };
  };
}>();

defineEmits<{ (e: 'click'): void }>();

const imgFailed = ref(false);




</script>

<style scoped>
.news-card { display: flex; gap: 16px; background: #fff; border: 1px solid #f0f1f2;
  border-radius: 8px; padding: 12px; cursor: pointer; transition: box-shadow 0.2s, transform 0.2s; }
.news-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }

.cover { position: relative; width: 168px; height: 94px; flex-shrink: 0; border-radius: 6px;
  overflow: hidden; background: #f1f2f3; }
.cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.fb-icon { width: 30px; height: 30px; fill: #c9ccd0; }
.play-tag { position: absolute; right: 6px; bottom: 6px; width: 26px; height: 26px; border-radius: 50%;
  background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; }
.play-icon { width: 11px; height: 11px; fill: #fff; margin-left: 1px; }

.info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
.title { font-size: 15px; color: #18191c; margin: 0 0 6px; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.summary { font-size: 13px; color: #9499a0; line-height: 1.5; margin: 0 0 8px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #9499a0; }
.author { display: flex; align-items: center; gap: 4px; color: #61666d; flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta-item { display: flex; align-items: center; gap: 4px; }
.meta-icon { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2; }
.type { padding: 1px 10px; border-radius: 10px; font-size: 11px; }
.type.article { background: #f0f9f2; color: #27ae60; }
.type.video { background: #f0f6fd; color: #3498db; }

@media (max-width: 768px) {
  .news-card { flex-direction: column; }
  .cover { width: 100%; height: 180px; }
}
</style>