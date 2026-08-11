<template>
  <div class="register-container">
    <div class="register-card">
      <h1>📝 注册</h1>
      <p class="subtitle">注册后系统将自动分配账号</p>
      
      <div v-if="registered" class="success-box">
        <div class="success-icon">🎉</div>
        <h3>注册成功！</h3>
        <p class="account-info">你的账号是：</p>
        <p class="account-number">{{ newAccount }}</p>
        <button @click="goToLogin" class="login-btn-success">立即登录</button>
      </div>
      
      <form v-else @submit.prevent="handleRegister">
        <div class="form-group">
          <label>昵称</label>
          <input v-model="username" type="text" required placeholder="请设置你的昵称" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="password" type="password" required placeholder="至少6位密码" />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input v-model="confirmPassword" type="password" required placeholder="请再次输入密码" />
        </div>
        <button type="submit" :disabled="loading" class="register-btn">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <p class="error" v-if="error">{{ error }}</p>
        <p class="login-link">已有账号？<router-link to="/login">立即登录</router-link></p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const registered = ref(false);
const newAccount = ref('');

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致';
    return;
  }
  if (password.value.length < 6) {
    error.value = '密码至少6位';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    const res = await userStore.register(username.value, password.value);
    newAccount.value = res.data.account;
    registered.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.detail || '注册失败，请重试';
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}
.register-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 420px;
}
.register-card h1 { text-align: center; font-size: 28px; color: #1a1a2e; margin-bottom: 8px; }
.subtitle { text-align: center; color: #999; margin-bottom: 30px; font-size: 14px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 6px; color: #333; font-weight: 500; font-size: 14px; }
.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e8e8e8;
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
}
.form-group input:focus { outline: none; border-color: #FB7299; }
.register-btn {
  width: 100%;
  padding: 12px;
  background: #FB7299;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}
.register-btn:hover:not(:disabled) { background: #e85a7a; }
.register-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: #e74c3c; margin-top: 12px; text-align: center; font-size: 14px; }
.login-link { margin-top: 20px; text-align: center; color: #666; font-size: 14px; }
.login-link a { color: #FB7299; text-decoration: none; font-weight: 500; }
.login-link a:hover { text-decoration: underline; }
.success-box { text-align: center; padding: 20px 0; }
.success-icon { font-size: 64px; margin-bottom: 16px; }
.success-box h3 { font-size: 24px; color: #27ae60; margin-bottom: 16px; }
.account-number { font-size: 28px; color: #FB7299; font-weight: bold; display: block; margin: 12px 0; padding: 12px; background: #f8f8f8; border-radius: 8px; }
.login-btn-success {
  width: 100%;
  padding: 12px;
  background: #FB7299;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}
.login-btn-success:hover { background: #e85a7a; }
</style>