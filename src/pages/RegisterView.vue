<template>
  <div class="register-container">
    <div class="register-card">
      <h1>📝 注册</h1>
      <p class="subtitle">注册后系统将自动分配账号</p>
      
      <!-- ✅ 注册成功提示 -->
      <div v-if="registered" class="success-box">
        <div class="success-icon">🎉</div>
        <h3>注册成功！</h3>
        <p class="account-info">
          你的账号是：<strong class="account-number">{{ newAccount }}</strong>
        </p>
        <p class="account-tip">请妥善保管你的账号，登录时需要使用</p>
        <button @click="goToLogin" class="login-btn-success">立即登录</button>
      </div>
      
      <!-- 注册表单 -->
      <form v-else @submit.prevent="handleRegister">
        <div class="form-group">
          <label>昵称</label>
          <input 
            v-model="username" 
            type="text" 
            required 
            placeholder="请设置你的昵称"
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <div class="password-wrapper">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              placeholder="至少6位密码"
            />
            <button type="button" @click="showPassword = !showPassword" class="toggle-btn">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>确认密码</label>
          <div class="password-wrapper">
            <input 
              v-model="confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              required 
              placeholder="请再次输入密码"
            />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="toggle-btn">
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        
        <!-- 密码强度提示 -->
        <div v-if="password" class="password-strength">
          <div class="strength-bar">
            <div class="strength-fill" :style="{ width: passwordStrength + '%', background: strengthColor }"></div>
          </div>
          <span class="strength-text" :style="{ color: strengthColor }">
            {{ strengthText }}
          </span>
        </div>
        
        <button type="submit" :disabled="loading" class="register-btn">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        
        <p class="error" v-if="error">{{ error }}</p>
        
        <p class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// ✅ 注册成功状态
const registered = ref(false);
const newAccount = ref('');

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = password.value;
  if (!pwd) return 0;
  
  let score = 0;
  if (pwd.length >= 6) score += 20;
  if (pwd.length >= 8) score += 20;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 20;
  if (/\d/.test(pwd)) score += 20;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;
  
  return Math.min(score, 100);
});

const strengthColor = computed(() => {
  const score = passwordStrength.value;
  if (score < 40) return '#e74c3c';
  if (score < 70) return '#f39c12';
  return '#27ae60';
});

const strengthText = computed(() => {
  const score = passwordStrength.value;
  if (score === 0) return '';
  if (score < 40) return '弱';
  if (score < 70) return '中';
  return '强';
});

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
    // ✅ 保存注册成功的账号
    newAccount.value = res.data.account;
    registered.value = true;
  } catch (err: any) {
    console.error('注册错误:', err);
    
    if (err.response?.data) {
      const data = err.response.data;
      if (data.username) {
        error.value = data.username[0];
      } else if (data.password) {
        error.value = data.password[0];
      } else if (data.detail) {
        error.value = data.detail;
      } else {
        error.value = '注册失败，请重试';
      }
    } else {
      error.value = '注册失败，请检查网络连接';
    }
  } finally {
    loading.value = false;
  }
};

// ✅ 跳转到登录页
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
}

.register-card h1 {
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

/* ===== 注册成功样式 ===== */
.success-box {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-box h3 {
  font-size: 24px;
  color: #27ae60;
  margin-bottom: 16px;
}

.account-info {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.account-number {
  font-size: 28px;
  color: #FB7299;
  font-weight: bold;
  letter-spacing: 2px;
  display: block;
  margin: 12px 0;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
  border: 2px dashed #FB7299;
}

.account-tip {
  font-size: 13px;
  color: #999;
  margin-bottom: 24px;
}

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

.login-btn-success:hover {
  background: #e85a7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

/* ===== 表单样式 ===== */
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

.password-strength {
  margin-top: -8px;
  margin-bottom: 16px;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: #e8e8e8;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.strength-text {
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

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

.register-btn:hover:not(:disabled) {
  background: #e85a7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #FB7299;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>