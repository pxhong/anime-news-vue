<template>
  <div class="home">
    <section class="hot-section">
      <h2 class="section-title">🔥 最新资讯</h2>
      <div class="card-list">
        <NewsCard v-for="item in topNews" :key="item.id" :item="item" />
      </div>
    </section>

    <!-- 空状态 -->
    <div v-if="newsList.length == 0" class="empty-tip">
      暂无新闻，前往投稿后台发布第一条资讯！
    </div>
  </div>
</template>

<script lang="ts" setup>
import { newsList } from '@/stores/newsStore'
import NewsCard from '@/components/NewsCard.vue'

// 取出前3条新闻作为首页推荐
const topNews = newsList.value.slice(0, 3)
</script>

<style scoped>
.home {
  gap: 32px;
  display: flex;
  flex-direction: column;
}
.section-title {
  font-size: 20px;
  color: #222;
  padding-left: 8px;
  border-left: 4px solid #FB7299;
}
.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>