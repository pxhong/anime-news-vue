<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🔐 登录</h1>
      <p class="subtitle">使用你的账号登录</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>账号</label>
          <input 
            v-model="account" 
            type="text" 
            required 
            placeholder="请输入11位数字账号"
            maxlength="11"
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <div class="password-wrapper">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              placeholder="请输入密码"
              autocomplete="current-password"
            />
            <button type="button" @click="showPassword = !showPassword" class="toggle-btn">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <p class="error" v-if="error">{{ error }}</p>
        
        <p class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const account = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // ✅ 使用 account 登录
    await userStore.login(account.value, password.value);
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
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
}

.login-card h1 {
  text-align: center;
  font-size: 28px;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.subtitle {
  text-align: center;
  color: #999;
  margin-bottom: 30px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e8e8e8;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #FB7299;
  box-shadow: 0 0 0 3px rgba(251, 114, 153, 0.1);
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 48px;
}

.toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #f0f0f0;
}

.login-btn {
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

.login-btn:hover:not(:disabled) {
  background: #e85a7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
}

.register-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #FB7299;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>