<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container nav-wrap">
        <h1 class="logo">二次元资讯站</h1>
        <nav class="nav">
          <RouterLink :to="{path:'/home'}" active-class="active">首页</RouterLink>
          <RouterLink to="/news" active-class="active">新闻列表</RouterLink>
          <RouterLink to="/about" active-class="active">关于本站</RouterLink>
          <RouterLink to="/admin" active-class="active">投稿后台</RouterLink>
        </nav>
      </div>
    </header>

    <!-- 页面主体容器 -->
    <main class="main container">
      <RouterView v-slot="{ Component }">
        <component :is="Component" class="page-transition" />
      </RouterView>
    </main>
  </div>
</template>

<script lang="ts" setup name="App">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.header {
  background: #ffffff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.07);
  position: sticky;
  top: 0;
  z-index: 99;
}
.nav-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.logo {
  font-size: 22px;
  color: #FB7299;
  font-weight: bold;
  cursor: pointer;
}
.nav {
  display: flex;
  gap: 36px;
}
.nav a {
  font-size: 16px;
  color: #666666;
  padding: 6px 0;
  position: relative;
}
.nav a:hover {
  color: #FB7299;
}
.nav a.active {
  color: #FB7299;
}
.nav a.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #FB7299;
  border-radius: 3px;
}
.main {
  padding: 32px 16px;
  min-height: calc(100vh - 64px);
}

/* 路由切换过渡动画 */
.page-transition {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .nav-wrap {
    flex-direction: column;
    height: auto;
    padding: 12px 0;
    gap:12px;
  }
  .nav {
    gap: 20px;
  }
}
</style>