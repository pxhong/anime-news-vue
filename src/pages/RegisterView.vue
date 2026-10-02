<template>
  <div class="register-container">
    <div class="register-card">
      <div class="brand">
        <h1>创建账号</h1>
        <p class="subtitle">使用邮箱注册，系统将自动为您分配昵称与账号</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 邮箱 -->
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="请输入邮箱地址"
            autocomplete="email"
          />
        </div>

        <!-- 验证码 -->
        <div class="form-group">
          <label for="code">验证码</label>
          <div class="code-row">
            <input
              id="code"
              v-model="code"
              type="text"
              required
              maxlength="6"
              placeholder="请输入6位验证码"
              class="code-input"
            />
            <button
              type="button"
              class="send-code-btn"
              :disabled="sending || countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : (sending ? '发送中...' : '获取验证码') }}
            </button>
          </div>
        </div>

        <!-- 密码 -->
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            placeholder="至少6位密码"
            autocomplete="new-password"
          />
        </div>

        <!-- 确认密码 -->
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            minlength="6"
            placeholder="请再次输入密码"
            autocomplete="new-password"
          />
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? '注册中...' : '注 册' }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="successMsg" class="success">{{ successMsg }}</p>

        <p class="switch-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/api/index';

const router = useRouter();
const userStore = useUserStore();

const email = ref('');
const code = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const sending = ref(false);
const error = ref('');
const successMsg = ref('');
const countdown = ref(0);
let timer: number | null = null;

const validateEmail = (val: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
};

// 发送验证码
const sendCode = async () => {
  error.value = '';
  successMsg.value = '';

  if (!email.value) {
    error.value = '请先输入邮箱地址';
    return;
  }
  if (!validateEmail(email.value)) {
    error.value = '邮箱格式不正确';
    return;
  }

  sending.value = true;
  try {
    const res = await api.post('/send-code/', { email: email.value });
    successMsg.value = res.data.detail || '验证码已发送';
    // 开始倒计时
    countdown.value = 60;
    timer = window.setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.response?.data?.email?.[0] || '验证码发送失败';
  } finally {
    sending.value = false;
  }
};

// 注册
const handleRegister = async () => {
  error.value = '';
  successMsg.value = '';

  if (!validateEmail(email.value)) {
    error.value = '邮箱格式不正确';
    return;
  }
  if (code.value.length !== 6) {
    error.value = '请输入6位验证码';
    return;
  }
  if (password.value.length < 6) {
    error.value = '密码至少6位';
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致';
    return;
  }

  loading.value = true;
  try {
    const res = await userStore.register(email.value, code.value, password.value);
    successMsg.value = '注册成功，正在进入...';
    setTimeout(() => {
      router.push('/home');
    }, 1000);
  } catch (err: any) {
    error.value = err.response?.data?.detail || '注册失败，请重试';
  } finally {
    loading.value = false;
  }
};

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 24px;
  background: #f8f9fb;
}

.register-card {
  background: #fff;
  padding: 40px 44px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 440px;
}

.brand { text-align: center; margin-bottom: 32px; }
.brand h1 { font-size: 26px; color: #1f2329; font-weight: 600; margin-bottom: 8px; letter-spacing: 1px; }
.subtitle { color: #8a919f; font-size: 14px; line-height: 1.6; }

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

.code-row { display: flex; gap: 10px; }
.code-input { flex: 1; }
.send-code-btn {
  width: 128px;
  flex-shrink: 0;
  padding: 0 8px;
  background: #eef3ff;
  color: #2f6fed;
  border: 1px solid #d4e0ff;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.send-code-btn:hover:not(:disabled) { background: #dfe9ff; }
.send-code-btn:disabled { opacity: 0.6; cursor: not-allowed; }

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
.success { color: #30a46c; margin-top: 14px; text-align: center; font-size: 14px; }

.switch-link { margin-top: 24px; text-align: center; color: #8a919f; font-size: 14px; }
.switch-link a { color: #2f6fed; text-decoration: none; font-weight: 500; }
.switch-link a:hover { text-decoration: underline; }
</style>