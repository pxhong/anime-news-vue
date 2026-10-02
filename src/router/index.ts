import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Home from '@/pages/Home.vue'
import News from '@/pages/News.vue'
import About from '@/pages/About.vue'
import Admin from '@/pages/Admin.vue'
import NewsDetail from '@/pages/NewsDetail.vue'
import Login from '@/pages/LoginView.vue'
import Register from '@/pages/RegisterView.vue'
import Profile from '@/pages/ProfileView.vue'
import MyWorks from '@/pages/MyWorks.vue'  // ✅ 新增：我的投稿

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: Home },
  { path: '/news', name: 'News', component: News },
  { path: '/newsdetail/:id', name: 'NewsDetail', component: NewsDetail },
  { path: '/about', name: 'About', component: About },

  // ✅ 新增：我的投稿（放在 /admin 之前，避免路由冲突）
  {
    path: '/profile/works',
    name: 'MyWorks',
    component: MyWorks,
    meta: { requiresAuth: true }
  },
  // ✅ 新增：编辑作品（放在 /admin 之前）
  {
    path: '/admin/edit/:id',
    name: 'AdminEdit',
    component: Admin,
    meta: { requiresAuth: true }
  },

  { path: '/admin', name: 'Admin', component: Admin, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guest: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory('/anime-news-vue/'),
  routes
})

// ✅ 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  userStore.restoreUser()

  // 需要登录才能访问的页面
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/')  // 跳转到首页
  } 
  // 登录/注册页面（已登录用户不能访问）
  else if (to.meta.guest && userStore.isLoggedIn) {
    next('/home')
  } 
  else {
    next()
  }
})

export default router