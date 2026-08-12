<template>
  <div class="profile-container">
    <div class="profile-card">
      <h1>👤 个人中心</h1>
      
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <img 
            :src="currentAvatar" 
            :alt="userInfo?.username || '用户'"
            class="avatar"
            @error="handleImageError"
          />
          <label class="avatar-upload-btn" for="avatar-upload">
            📷 更换头像
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/*"
              @change="handleAvatarUpload"
              style="display: none"
            />
          </label>
        </div>
        <!-- 头像预览 -->
        <div v-if="avatarPreview" class="avatar-preview">
          <img :src="avatarPreview" alt="预览" />
          <div class="preview-actions">
            <button @click="confirmAvatar" class="confirm-btn" :disabled="uploading">
              {{ uploading ? '上传中...' : '✅ 确认' }}
            </button>
            <button @click="cancelAvatar" class="cancel-btn">❌ 取消</button>
          </div>
        </div>
        <p v-if="avatarError" class="error-text">{{ avatarError }}</p>
        <p v-if="avatarSuccess" class="success-text">✅ 头像更新成功！</p>
      </div>

      <!-- 用户名显示 -->
      <div class="username-display">
        <h2>{{ userInfo?.username || '用户' }}</h2>
        <span class="user-id">账号: {{ userInfo?.account || '' }}</span>
        <span class="user-id">ID: {{ userInfo?.id || '' }}</span>
      </div>

      <!-- 用户信息表单 -->
      <form @submit.prevent="updateProfile" class="profile-form">
        <!-- 昵称 -->
        <div class="form-group">
          <label>昵称 <span class="required">*</span></label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入昵称"
            @input="checkUsername"
            :class="{ 'input-error': usernameError, 'input-success': usernameAvailable }"
          />
          <div v-if="usernameChecking" class="hint checking">⏳ 检查中...</div>
          <div v-if="usernameError" class="hint error-text">{{ usernameError }}</div>
          <div v-if="usernameAvailable" class="hint success-text">✅ 昵称可用</div>
          <div v-if="!usernameError && !usernameAvailable && username" class="hint">昵称至少2个字符，不能与其他人重复</div>
        </div>

        <div class="form-group">
          <label>个人简介</label>
          <textarea 
            v-model="bio" 
            rows="4" 
            placeholder="介绍一下你自己..."
            maxlength="500"
          ></textarea>
          <span class="char-count">{{ bio?.length || 0 }}/500</span>
        </div>

        <button type="submit" :disabled="loading || !canSave" class="save-btn">
          {{ loading ? '保存中...' : '保存修改' }}
        </button>
        
        <p class="success" v-if="success">✅ 保存成功！</p>
        <p class="error" v-if="error">{{ error }}</p>
      </form>

      <!-- 退出登录 -->
      <div class="logout-section">
        <button @click="handleLogout" class="logout-btn">🚪 退出登录</button>
      </div>

      <!-- 注销账号 -->
      <div class="danger-section">
        <button @click="showDeleteModal = true" class="delete-account-btn">
          ⚠️ 注销账号
        </button>
        <p class="danger-hint">注销后所有数据将被永久删除，无法恢复</p>
      </div>
    </div>
  </div>

  <!-- 确认注销弹窗 -->
  <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
    <div class="modal-box">
      <div class="modal-icon">⚠️</div>
      <h3>确认注销账号？</h3>
      <p class="modal-warning">注销后，你的所有数据将被永久删除，无法恢复！</p>
      <div class="modal-actions">
        <button @click="showDeleteModal = false" class="modal-cancel-btn">取消</button>
        <button @click="confirmDeleteAccount" :disabled="deleting" class="modal-confirm-btn">
          {{ deleting ? '注销中...' : '确认注销' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/api/index';

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const userInfo = ref<any>(null);
const username = ref('');
const bio = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

// 头像相关
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string>('');
const uploading = ref(false);
const avatarError = ref('');
const avatarSuccess = ref(false);

// 用户名验证
const usernameError = ref('');
const usernameAvailable = ref(false);
const usernameChecking = ref(false);
const originalUsername = ref('');

// 注销
const showDeleteModal = ref(false);
const deleting = ref(false);

// 是否可保存
const canSave = computed(() => {
  return !usernameError.value && (username.value !== originalUsername.value || bio.value !== userInfo.value?.bio);
});

// 获取头像完整URL
const getFullImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/')) {
    return `https://anime-news-backend-production.up.railway.app${path}`;
  }
  return `https://anime-news-backend-production.up.railway.app/${path}`;
};

// 计算当前头像
const currentAvatar = computed(() => {
  if (avatarPreview.value) return avatarPreview.value;
  if (userInfo.value?.avatar_url) {
    return getFullImageUrl(userInfo.value.avatar_url);
  }
  const name = userInfo.value?.username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FB7299&color=fff&size=128`;
});

// 图片加载失败处理
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  const name = userInfo.value?.username || 'User';
  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FB7299&color=fff&size=128`;
};

// 检查用户名是否可用
const checkUsername = async () => {
  const val = username.value.trim();
  
  // 如果和原用户名相同，直接通过
  if (val === originalUsername.value) {
    usernameError.value = '';
    usernameAvailable.value = true;
    return;
  }
  
  // 基础验证
  if (!val || val.length < 2) {
    usernameError.value = '昵称至少2个字符';
    usernameAvailable.value = false;
    return;
  }
  
  // 检查是否包含特殊字符
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(val)) {
    usernameError.value = '昵称只能包含中文、字母、数字和下划线';
    usernameAvailable.value = false;
    return;
  }
  
  usernameChecking.value = true;
  usernameError.value = '';
  
  try {
    // 调用后端检查用户名是否已存在
    const res = await api.get(`/check-username/?username=${encodeURIComponent(val)}`);
    if (res.data.exists) {
      usernameError.value = '该昵称已被使用，请换一个';
      usernameAvailable.value = false;
    } else {
      usernameError.value = '';
      usernameAvailable.value = true;
    }
  } catch (err) {
    console.error('检查用户名失败:', err);
    // 如果检查失败，允许用户尝试（但后端最终会验证）
    usernameError.value = '';
    usernameAvailable.value = true;
  } finally {
    usernameChecking.value = false;
  }
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await api.get('/profile/');
    userInfo.value = res.data;
    username.value = res.data.username;
    originalUsername.value = res.data.username;
    bio.value = res.data.bio || '';
    usernameAvailable.value = true;
    console.log('✅ 用户信息加载成功:', res.data);
  } catch (err) {
    console.error('❌ 加载用户信息失败:', err);
  }
};

// 选择头像
const handleAvatarUpload = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      avatarError.value = '请选择图片文件';
      return;
    }
    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      avatarError.value = '图片不能超过5MB';
      return;
    }
    avatarError.value = '';
    avatarSuccess.value = false;
    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
  }
};

// 确认上传头像
const confirmAvatar = async () => {
  if (!avatarFile.value) return;
  
  uploading.value = true;
  avatarError.value = '';
  avatarSuccess.value = false;
  
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile.value);
    
    const res = await api.post('/avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    console.log('✅ 头像上传成功:', res.data);
    
    // 更新用户信息
    userInfo.value = res.data;
    avatarPreview.value = '';
    avatarFile.value = null;
    
    // 更新 Store
    userStore.user = res.data;
    localStorage.setItem('user_info', JSON.stringify(res.data));
    
    avatarSuccess.value = true;
    setTimeout(() => { avatarSuccess.value = false; }, 3000);
  } catch (err: any) {
    avatarError.value = err.response?.data?.error || '上传失败，请重试';
    console.error('❌ 头像上传失败:', err);
  } finally {
    uploading.value = false;
  }
};

// 取消头像上传
const cancelAvatar = () => {
  avatarPreview.value = '';
  avatarFile.value = null;
  avatarError.value = '';
};

// 更新个人信息
const updateProfile = async () => {
  // 验证用户名
  if (!username.value.trim() || username.value.trim().length < 2) {
    error.value = '昵称至少2个字符';
    return;
  }
  
  // 如果用户名有错误，阻止提交
  if (usernameError.value) {
    error.value = '请先解决用户名问题';
    return;
  }
  
  loading.value = true;
  error.value = '';
  success.value = false;
  
  try {
    const updateData: any = { 
      username: username.value.trim(),
      bio: bio.value 
    };
    
    const res = await api.put('/profile/', updateData);
    userInfo.value = res.data;
    userStore.user = res.data;
    localStorage.setItem('user_info', JSON.stringify(res.data));
    originalUsername.value = res.data.username;
    usernameAvailable.value = true;
    
    success.value = true;
    setTimeout(() => { success.value = false; }, 3000);
  } catch (err: any) {
    if (err.response?.data?.username) {
      error.value = err.response.data.username[0];
    } else {
      error.value = err.response?.data?.detail || '保存失败，请重试';
    }
  } finally {
    loading.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  userStore.logout();
};

// 确认注销
const confirmDeleteAccount = async () => {
  deleting.value = true;
  try {
    await api.delete('/delete-account/');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    router.push('/');
    window.location.reload();
  } catch (err: any) {
    alert(err.response?.data?.error || '注销失败，请重试');
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
};

// 监听用户名变化
watch(username, (newVal) => {
  if (newVal !== originalUsername.value) {
    checkUsername();
  } else {
    usernameError.value = '';
    usernameAvailable.value = true;
  }
});

onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.profile-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.profile-card h1 {
  text-align: center;
  color: #1a1a2e;
  margin-bottom: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
}
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #FB7299;
  background: #f0f0f0;
}
.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
}
.avatar-upload-btn:hover { background: rgba(0,0,0,0.8); }

.avatar-preview { margin-top: 16px; text-align: center; }
.avatar-preview img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FB7299;
}
.preview-actions { margin-top: 8px; display: flex; gap: 12px; justify-content: center; }
.confirm-btn, .cancel-btn {
  padding: 4px 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}
.confirm-btn { background: #27ae60; color: white; }
.confirm-btn:hover:not(:disabled) { background: #219a52; }
.confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.cancel-btn { background: #e74c3c; color: white; }
.cancel-btn:hover { background: #c0392b; }

.error-text { color: #e74c3c; font-size: 13px; margin-top: 4px; }
.success-text { color: #27ae60; font-size: 13px; margin-top: 4px; }

.username-display {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}
.username-display h2 { font-size: 24px; color: #1a1a2e; margin: 0 0 4px 0; }
.user-id { font-size: 13px; color: #999; display: inline-block; margin: 0 8px; }

.profile-form .form-group { margin-bottom: 20px; }
.profile-form .form-group label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}
.required { color: #e74c3c; }
.profile-form .form-group input,
.profile-form .form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e8e8e8;
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}
.profile-form .form-group input:focus,
.profile-form .form-group textarea:focus {
  outline: none;
  border-color: #FB7299;
}
.profile-form .form-group input.input-error {
  border-color: #e74c3c;
}
.profile-form .form-group input.input-success {
  border-color: #27ae60;
}
.hint { display: block; font-size: 12px; margin-top: 4px; }
.hint.checking { color: #f39c12; }
.hint.error-text { color: #e74c3c; }
.hint.success-text { color: #27ae60; }
.char-count { display: block; text-align: right; font-size: 12px; color: #999; margin-top: 4px; }

.save-btn {
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
.save-btn:hover:not(:disabled) { background: #e85a7a; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.success { color: #27ae60; margin-top: 12px; text-align: center; }
.error { color: #e74c3c; margin-top: 12px; text-align: center; }

.logout-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
.logout-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #e74c3c;
  border: 1.5px solid #e74c3c;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}
.logout-btn:hover { background: #e74c3c; color: white; }

.danger-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.delete-account-btn {
  width: 100%;
  padding: 12px;
  background: #fff5f5;
  color: #c0392b;
  border: 1.5px solid #e74c3c;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}
.delete-account-btn:hover { background: #e74c3c; color: white; }
.danger-hint { text-align: center; font-size: 12px; color: #999; margin-top: 8px; }

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-box {
  background: white;
  padding: 32px;
  border-radius: 16px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-icon { text-align: center; font-size: 48px; margin-bottom: 12px; }
.modal-box h3 { text-align: center; color: #1a1a2e; font-size: 22px; margin-bottom: 16px; }
.modal-warning { color: #666; font-size: 14px; text-align: center; margin-bottom: 20px; }
.modal-actions { display: flex; gap: 12px; }
.modal-cancel-btn, .modal-confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}
.modal-cancel-btn { background: #f0f0f0; color: #333; }
.modal-cancel-btn:hover { background: #e0e0e0; }
.modal-confirm-btn { background: #e74c3c; color: white; }
.modal-confirm-btn:hover:not(:disabled) { background: #c0392b; }
.modal-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>