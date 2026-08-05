<template>
  <div class="detail-page" v-if="article">
    <h1 class="title">{{ article.title }}</h1>
    <div class="meta">发布日期：{{ article.date }}</div>

    <div class="cover-wrap">
      <img :src="article.cover" :alt="article.title" />
    </div>

    <div class="content">
      {{ article.content }}
    </div>

    <div class="back-btn-wrap">
      <button class="btn btn-primary" @click="$router.push('/news')">
        返回新闻列表
      </button>
    </div>
  </div>

  <div v-else class="empty-tip">新闻不存在或已被删除</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { newsList } from '@/stores/newsStore'
import type { NewsItem } from '@/stores/newsStore'

const route = useRoute()
const router = useRouter()

const article = computed(() => {
  const id = Number(route.params.id)
  return newsList.value.find((n: NewsItem) => n.id === id)
})
</script>

<style scoped>
.title {
  font-size: 26px;
  color: #222;
  margin-bottom: 12px;
  line-height: 1.4;
}
.meta {
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
}
.cover-wrap {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
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
.back-btn-wrap {
  margin-top: 40px;
}
</style>