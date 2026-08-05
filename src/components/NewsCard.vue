<template>
  <div class="news-card" @click="$router.push(`/news/${item.id}`)">
    <div class="cover">
      <img :src="item.cover" :alt="item.title" loading="lazy" />
    </div>
    <div class="info">
      <h3 class="title">{{ item.title }}</h3>
      <p class="summary">{{ item.summary }}</p>
      <span class="date">{{ item.date }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { NewsItem } from '@/stores/newsStore'
defineProps<{
  item: NewsItem
}>()
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
  /* 图片居中放置 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e8e8e8;
}
.cover img {
  max-width: 100%;
  max-height: 100%;
  /* contain：完整展示整张图片，不裁切，保持原图比例 */
  object-fit: contain;
}
.info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.title {
  font-size: 17px;
  color: #222;
  margin-bottom: 8px;
}
.summary {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.date {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

/* 手机端适配：上下布局 */
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