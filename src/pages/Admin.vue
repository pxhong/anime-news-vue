<template>
  <div class="admin-page">
    <h2 class="page-title">✍️ 新闻投稿后台</h2>

    <div class="form-wrap">
      <!-- 标题 -->
      <div class="form-item">
        <label>新闻标题 <span class="required">*</span></label>
        <input
          v-model="form.title"
          type="text"
          class="input"
          placeholder="请输入新闻标题"
        />
      </div>

      <!-- 摘要 -->
      <div class="form-item">
        <label>新闻摘要 <span class="required">*</span></label>
        <textarea
          v-model="form.summary"
          class="textarea"
          placeholder="简短新闻简介"
        ></textarea>
      </div>

      <!-- 正文 -->
      <div class="form-item">
        <label>新闻正文 <span class="required">*</span></label>
        <textarea
          v-model="form.content"
          class="textarea content-area"
          placeholder="撰写新闻正文内容"
        ></textarea>
      </div>

      <!-- 封面图片 -->
      <div class="form-item">
        <label>封面图片（二选一）</label>
        <input
          v-model="form.cover"
          type="text"
          class="input"
          placeholder="粘贴图片网络链接"
        />
        <div class="divider">或者选择本地图片(jpg/png/gif)</div>
        <input
          ref="fileRef"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          @change="handleSelectFile"
          class="file-input"
        />
        <!-- 图片预览 -->
        <div v-if="previewUrl" class="preview">
          <p class="preview-text">预览：</p>
          <img :src="previewUrl" alt="预览图" />
        </div>
      </div>

      <!-- 日期 -->
      <div class="form-item">
        <label>发布日期 <span class="required">*</span></label>
        <input v-model="form.date" type="date" class="input" />
      </div>

      <div class="btn-group">
        <button class="btn btn-primary submit-btn" @click="submitNews">
          发布新闻
        </button>
        <button class="btn reset-btn" @click="resetForm">清空表单</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { newsList } from '@/stores/newsStore'
import type { NewsItem } from '@/stores/newsStore'

const router = useRouter()
const fileRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')

// 表单数据
const form = reactive({
  title: '',
  summary: '',
  content: '',
  cover: '',
  date: ''
})

// 选择本地图片
function handleSelectFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 释放上一张图片blob资源，防止内存占用
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  // 生成浏览器临时预览地址
  previewUrl.value = URL.createObjectURL(file)
  form.cover = previewUrl.value
}

// 提交新闻
// 提交新闻
function submitNews() {
  // 简单表单校验，增加trim，过滤全空格
  if (!form.title.trim() || !form.summary.trim() || !form.content.trim() || !form.date.trim()) {
    alert('请填写所有必填项！不要只输入空格。')
    return
  }

  const newNews: NewsItem = {
    id: Date.now(), // 使用时间戳作为唯一ID
    title: form.title,
    summary: form.summary,
    content: form.content,
    cover: form.cover,
    date: form.date
  }

  // script内必须 .value
  newsList.value.unshift(newNews)
  alert('新闻发布成功！')
  resetForm()
  router.push('/news')
}

// 重置表单
function resetForm() {
  form.title = ''
  form.summary = ''
  form.content = ''
  form.cover = ''
  form.date = ''
  previewUrl.value = ''
  if (fileRef.value) fileRef.value.value = ''
}
</script>

<style scoped>
.admin-page {
  max-width: 800px;
  margin: 0 auto;
}
.page-title {
  font-size: 24px;
  margin-bottom: 28px;
  color: #222;
}
.form-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-item label {
  font-size: 15px;
  color: #333;
}
.required {
  color: #f53f3f;
}
.input {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: 0.2s;
}
.input:focus {
  outline: none;
  border-color: #FB7299;
}
.textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 100px;
  resize: vertical;
}
.textarea:focus {
  outline: none;
  border-color: #FB7299;
}
.content-area {
  min-height: 180px;
}
.divider {
  text-align: center;
  color: #999;
  margin: 6px 0;
}
.file-input {
  padding: 6px 0;
}
.preview-text {
  font-size: 14px;
  color: #666;
  margin: 8px 0 4px;
}
.preview img {
  max-width: 360px;
  max-height: 240px;
  border-radius: 8px;
  object-fit: contain;
}
.btn-group {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}
.reset-btn {
  background: #eee;
  color: #333;
}
.reset-btn:hover {
  background: #dddddd;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .preview img {
    width: 100%;
  }
}
</style>