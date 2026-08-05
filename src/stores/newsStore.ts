import { ref } from 'vue'

export interface NewsItem{
  id:number
  title:string
  summary:string
  content:string
  date:string
  cover:string
}

// 初始模拟新闻
export const newsList = ref<NewsItem[]>([
 {id:1,
  title:'万万没想到',
  summary:'新闻摘要',
  content:'今天是周一',
  date:'2026-08-15',
  cover:'pictures/小维2.gif',
 },
 {id:2,
  title:'万万没想到',
  summary:'新闻摘要',
  content:'今天是周二',
  date:'2026-08-15',
  cover:'pictures/saki1.gif',
 }
])

// 新增新闻方法
export function addNews(newArticle:NewsItem){
  newsList.value.unshift(newArticle) // unshift 加到最顶部，最新新闻放前面
}