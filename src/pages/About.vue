<template>
  <div class="about-page">
    <h2 class="page-title">关于本站</h2>
    <div class="content-card">
      <p>二次元资讯站 - 纯前端Vue3+TS演示项目</p>
      <p>当前版本：纯前端实现，数据保存在浏览器本地(localStorage)</p>
      <p>功能：新闻浏览、投稿发布、本地图片预览</p>
      <p>⚠️ 注意：清除浏览器缓存后新增内容将会丢失</p>
      <p>后续计划：学习后端，改造为完整全栈前后端分离项目</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
// 无业务逻辑
</script>

<style scoped>
.page-title {
  font-size: 24px;
  margin-bottom: 24px;
}
.content-card {
  background: #f4f4f4;
  border-radius: 12px;
  padding: 24px;
  line-height: 2;
  font-size: 16px;
  color: #333;
}
.content-card p {
  margin: 6px 0;
}
</style>