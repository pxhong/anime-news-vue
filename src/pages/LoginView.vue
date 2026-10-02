<template>
  <div class="login-container">
    <div class="login-card">
      <div class="brand">
        <h1>欢迎回来</h1>
        <p class="subtitle">使用账号、邮箱或手机号登录</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="account">账号 / 邮箱 / 手机号</label>
          <input
            id="account"
            v-model="account"
            type="text"
            required
            placeholder="请输入账号、邮箱或手机号"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? '登录中...' : '登 录' }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>

        <p class="switch-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </p>
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

const account = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  if (!account.value.trim()) {
    error.value = '请输入账号、邮箱或手机号';
    return;
  }
  if (!password.value) {
    error.value = '请输入密码';
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    await userStore.login(account.value.trim(), password.value);
    router.push('/home');
  } catch (err: any) {
    error.value = err.response?.data?.detail || '登录失败，请检查账号和密码';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 24px;
  background: #f8f9fb;
}

.login-card {
  background: #fff;
  padding: 40px 44px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 440px;
}

.brand { text-align: center; margin-bottom: 32px; }
.brand h1 { font-size: 26px; color: #1f2329; font-weight: 600; margin-bottom: 8px; letter-spacing: 1px; }
.subtitle { color: #8a919f; font-size: 14px; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #1f2329; font-size: 14px; font-weight: 500; }
.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d9dde3;
  border-radius: 10px;
  font-size: 15px;
  background: #fafbfc;
  box-sizing: border-box;
  transition: all 0.2s;
}
.form-group input:focus {
  outline: none;
  border-color: #2f6fed;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 13px;
  background: #2f6fed;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
}
.submit-btn:hover:not(:disabled) { background: #245cd6; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.error { color: #e5484d; margin-top: 14px; text-align: center; font-size: 14px; }

.switch-link { margin-top: 24px; text-align: center; color: #8a919f; font-size: 14px; }
.switch-link a { color: #2f6fed; text-decoration: none; font-weight: 500; }
.switch-link a:hover { text-decoration: underline; }
</style>