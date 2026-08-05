<template>
  <div class="news-page">
    <h2 class="page-title">📰 全部资讯</h2>

    <div class="card-list">
      <NewsCard v-for="item in newsList" :key="item.id" :item="item" />
    </div>

    <div v-if="newsList.length === 0" class="empty-tip">
      暂无资讯
    </div>
  </div>
</template>

<script lang="ts" setup>
import { newsList } from '@/stores/newsStore'
import NewsCard from '@/components/NewsCard.vue'



</script>


<style scoped>
.page-title {
  font-size: 22px;
  margin-bottom: 24px;
  color: #222;
}
.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>