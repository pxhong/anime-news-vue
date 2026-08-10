import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/index';

interface User {
  id: number;
  account: string;  // ✅ 新增账号字段
  username: string;
  email: string;
  avatar: string | null;
  avatar_url?: string;
  bio: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('access_token'));

  const isLoggedIn = computed(() => !!token.value && !!user.value);

  // ✅ 登录 - 使用 account
  const login = async (account: string, password: string) => {
    try {
      const res = await api.post('/login/', { account, password });
      token.value = res.data.access;
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      user.value = res.data.user;
      localStorage.setItem('user_info', JSON.stringify(res.data.user));
      return res;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  // 注册
  const register = async (username: string, password: string, email?: string) => {
    try {
      const res = await api.post('/register/', { username, password, email });
      return res;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  };

  // 退出
  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    window.location.href = '/anime-news-vue/login';
  };

  // 恢复用户信息
  const restoreUser = () => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (e) {
        console.error('解析用户信息失败:', e);
        localStorage.removeItem('user_info');
      }
    }
  };

  return {
    user,
    token,
    isLoggedIn,
    login,
    register,
    logout,
    restoreUser,
  };
});

export default useUserStore;