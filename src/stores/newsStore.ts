import { ref } from 'vue'

export interface NewsItem {
  id: number
  title: string
  summary: string
  content: string
  date: string
  cover: string
}

export const newsList = ref<NewsItem[]>([])

export function addNews(newArticle: NewsItem) {
  newsList.value.unshift(newArticle)
}