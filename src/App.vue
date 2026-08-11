<template>
  <div class="app">
    <header class="header">
      <div class="container nav-wrap">
        <h1 class="logo">Anime News</h1>
        <nav class="nav">
          <RouterLink to="/" active-class="active">首页</RouterLink>
          <RouterLink to="/news" active-class="active">新闻列表</RouterLink>
          <RouterLink to="/about" active-class="active">关于本站</RouterLink>
          <RouterLink 
            to="/admin" 
            active-class="active" 
            v-if="userStore.isLoggedIn"
          >
            投稿后台
          </RouterLink>
        </nav>
        
        <!-- 用户区域 -->
        <div class="user-section">
          <template v-if="userStore.isLoggedIn">
            <div class="user-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
              <div class="user-avatar-wrapper">
                <img 
                  :src="userAvatar" 
                  :alt="userStore.user?.username"
                  class="user-avatar"
                />
                <span class="user-name">{{ userStore.user?.username }}</span>
                <svg class="dropdown-arrow" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                </svg>
              </div>
              
              <transition name="dropdown">
                <div v-if="showDropdown" class="dropdown-menu">
                  <div class="dropdown-header">
                    <img :src="userAvatar" :alt="userStore.user?.username" class="dropdown-avatar" />
                    <div class="dropdown-user-info">
                      <span class="dropdown-username">{{ userStore.user?.username }}</span>
                      <span class="dropdown-user-id">账号: {{ userStore.user?.account }}</span>
                    </div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <RouterLink to="/profile" class="dropdown-item" @click="showDropdown = false">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    个人中心
                  </RouterLink>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item logout-item" @click="handleLogout">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    退出登录
                  </button>
                </div>
              </transition>
            </div>
          </template>
          <template v-else>
            <RouterLink to="/login" class="auth-btn login-btn">登录</RouterLink>
            <RouterLink to="/register" class="auth-btn register-btn">注册</RouterLink>
          </template>
        </div>
      </div>
    </header>

    <main class="main container">
      <RouterView v-slot="{ Component }">
        <component :is="Component" class="page-transition" />
      </RouterView>
    </main>
  </div>
</template>

<script lang="ts" setup name="App">
import { RouterLink, RouterView } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ref, computed, onMounted } from 'vue';

const userStore = useUserStore();
const showDropdown = ref(false);

const userAvatar = computed(() => {
  const user = userStore.user;
  if (user?.avatar_url) {
    if (user.avatar_url.startsWith('http')) return user.avatar_url;
    return `https://anime-news-backend-production.up.railway.app${user.avatar_url}`;
  }
  return `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=FB7299&color=fff&size=128`;
});

onMounted(() => {
  userStore.restoreUser();
});

const handleLogout = () => {
  showDropdown.value = false;
  userStore.logout();
};
</script>

<style scoped>
/* 你的原有样式 + 下拉菜单样式 */
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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
  flex: 1;
  margin-left: 40px;
}
.nav a {
  font-size: 16px;
  color: #666666;
  padding: 6px 0;
  position: relative;
  text-decoration: none;
}
.nav a:hover { color: #FB7299; }
.nav a.active { color: #FB7299; }
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

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.user-dropdown { position: relative; cursor: pointer; }
.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: 24px;
  transition: all 0.3s;
}
.user-avatar-wrapper:hover { background: #f0f0f0; }
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FB7299;
}
.user-name { font-size: 14px; color: #333; font-weight: 500; }
.dropdown-arrow { color: #999; transition: transform 0.3s; }
.user-dropdown:hover .dropdown-arrow { transform: rotate(180deg); }

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 1000;
  overflow: hidden;
}
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.25s ease; }
.dropdown-enter-from { opacity: 0; transform: translateY(-10px) scale(0.95); }
.dropdown-enter-to { opacity: 1; transform: translateY(0) scale(1); }
.dropdown-leave-from { opacity: 1; transform: translateY(0) scale(1); }
.dropdown-leave-to { opacity: 0; transform: translateY(-10px) scale(0.95); }

.dropdown-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; }
.dropdown-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #FB7299; }
.dropdown-username { font-size: 15px; font-weight: 600; color: #1a1a2e; }
.dropdown-user-id { font-size: 12px; color: #999; }
.dropdown-divider { height: 1px; background: #f0f0f0; margin: 4px 12px; }
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
}
.dropdown-item:hover { background: #f5f5f5; }
.logout-item { color: #e74c3c; }
.logout-item:hover { background: #fdf0ef; }

.auth-btn {
  padding: 6px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}
.login-btn { color: #FB7299; border: 1.5px solid #FB7299; }
.login-btn:hover { background: #FB7299; color: #fff; }
.register-btn { background: #FB7299; color: #fff; }
.register-btn:hover { background: #e85a7a; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(251, 114, 153, 0.3); }

.main {
  padding: 32px 16px;
  min-height: calc(100vh - 64px);
  max-width: 1200px;
  margin: 0 auto;
}
.page-transition { animation: fadeIn 0.3s ease; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 768px) {
  .nav-wrap { flex-direction: column; height: auto; padding: 12px 0; gap: 12px; }
  .nav { gap: 20px; margin-left: 0; }
  .user-section { margin-left: 0; }
  .user-name { display: none; }
  .dropdown-menu { right: -60px; }
}
</style>