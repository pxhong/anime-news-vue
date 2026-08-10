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
        <div v-if="avatarPreview" class="avatar-preview">
          <img :src="avatarPreview" alt="预览" />
          <div class="preview-actions">
            <button @click="confirmAvatar" class="confirm-btn">✅ 确认</button>
            <button @click="cancelAvatar" class="cancel-btn">❌ 取消</button>
          </div>
        </div>
      </div>

      <!-- 用户名显示 -->
      <div class="username-display">
        <h2>{{ userInfo?.username || '用户' }}</h2>
        <span class="user-id">账号: {{ userInfo?.account || '' }}</span>
        <span class="user-id">ID: {{ userInfo?.id || '' }}</span>
      </div>

      <!-- 用户信息表单 -->
      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="form-group">
          <label>昵称</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入昵称"
          />
          <span class="hint">昵称至少2个字符</span>
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

        <button type="submit" :disabled="loading" class="save-btn">
          {{ loading ? '保存中...' : '保存修改' }}
        </button>
        
        <p class="success" v-if="success">✅ 保存成功！</p>
        <p class="error" v-if="error">{{ error }}</p>
      </form>

      <!-- 退出登录 -->
      <div class="logout-section">
        <button @click="handleLogout" class="logout-btn">🚪 退出登录</button>
      </div>

      <!-- ✅ 注销账号 -->
      <div class="danger-section">
        <button @click="showDeleteModal = true" class="delete-account-btn">
          ⚠️ 注销账号
        </button>
        <p class="danger-hint">注销后所有数据将被永久删除，无法恢复</p>
      </div>
    </div>
  </div>

  <!-- ✅ 确认注销弹窗 -->
  <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
    <div class="modal-box">
      <div class="modal-icon">⚠️</div>
      <h3>确认注销账号？</h3>
      <p class="modal-warning">
        注销后，你的所有数据将被永久删除，包括：
      </p>
      <ul class="modal-list">
        <li>个人信息</li>
        <li>发布的作品</li>
        <li>点赞记录</li>
        <li>所有关联数据</li>
      </ul>
      <p class="modal-confirm-text">此操作<strong>不可恢复</strong>，请谨慎操作！</p>
      
      <div class="modal-actions">
        <button @click="showDeleteModal = false" class="modal-cancel-btn">
          取消
        </button>
        <button @click="confirmDeleteAccount" :disabled="deleting" class="modal-confirm-btn">
          {{ deleting ? '注销中...' : '确认注销' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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

// 注销相关
const showDeleteModal = ref(false);
const deleting = ref(false);

// 计算当前头像 URL
const currentAvatar = computed(() => {
  if (avatarPreview.value) return avatarPreview.value;
  if (userInfo.value?.avatar_url) {
    const url = userInfo.value.avatar_url;
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000${url}`;
  }
  const name = userInfo.value?.username || 'User';
  return `https://ui-avatars.com/api/?name=${name}&background=FB7299&color=fff&size=128`;
});

// 图片加载失败处理
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  const name = userInfo.value?.username || 'User';
  img.src = `https://ui-avatars.com/api/?name=${name}&background=FB7299&color=fff&size=128`;
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await api.get('/profile/');
    userInfo.value = res.data;
    username.value = res.data.username;
    bio.value = res.data.bio || '';
    console.log('用户信息:', res.data);
  } catch (err) {
    console.error('加载用户信息失败:', err);
  }
};

// 头像上传预览
const handleAvatarUpload = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    avatarFile.value = input.files[0];
    avatarPreview.value = URL.createObjectURL(input.files[0]);
  }
};

// 确认上传头像
const confirmAvatar = async () => {
  if (!avatarFile.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile.value);
    
    const res = await api.post('/avatar/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    userInfo.value = res.data;
    avatarPreview.value = '';
    avatarFile.value = null;
    
    userStore.user = res.data;
    localStorage.setItem('user_info', JSON.stringify(res.data));
    
    success.value = true;
    setTimeout(() => { success.value = false; }, 3000);
  } catch (err: any) {
    error.value = err.response?.data?.error || '上传失败';
  } finally {
    loading.value = false;
  }
};

// 取消头像上传
const cancelAvatar = () => {
  avatarPreview.value = '';
  avatarFile.value = null;
};

// 更新个人信息
const updateProfile = async () => {
  loading.value = true;
  error.value = '';
  success.value = false;
  
  try {
    const updateData: any = { bio: bio.value };
    
    if (username.value !== userInfo.value?.username) {
      if (!username.value || username.value.length < 2) {
        error.value = '昵称至少2个字符';
        loading.value = false;
        return;
      }
      updateData.username = username.value;
    }
    
    const res = await api.put('/profile/', updateData);
    
    userInfo.value = res.data;
    userStore.user = res.data;
    localStorage.setItem('user_info', JSON.stringify(res.data));
    
    success.value = true;
    setTimeout(() => { success.value = false; }, 3000);
  } catch (err: any) {
    if (err.response?.data?.username) {
      error.value = err.response.data.username[0];
    } else if (err.response?.data?.detail) {
      error.value = err.response.data.detail;
    } else {
      error.value = '保存失败，请重试';
    }
  } finally {
    loading.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  userStore.logout();
};

// ✅ 确认注销账号
const confirmDeleteAccount = async () => {
  deleting.value = true;
  try {
    await api.delete('/delete-account/');
    // 清除本地存储
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    // 跳转到首页
    router.push('/');
    // 刷新页面
    window.location.reload();
  } catch (err: any) {
    alert(err.response?.data?.error || '注销失败，请重试');
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
};

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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.profile-card h1 {
  text-align: center;
  color: #1a1a2e;
  margin-bottom: 30px;
}

/* 头像区域 */
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
  flex-shrink: 0;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #FB7299;
  background: #f0f0f0;
  display: block;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.3s;
}

.avatar-upload-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.avatar-preview {
  margin-top: 16px;
  text-align: center;
}

.avatar-preview img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FB7299;
}

.preview-actions {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-btn, .cancel-btn {
  padding: 4px 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.confirm-btn {
  background: #27ae60;
  color: white;
}

.confirm-btn:hover {
  background: #219a52;
}

.cancel-btn {
  background: #e74c3c;
  color: white;
}

.cancel-btn:hover {
  background: #c0392b;
}

.username-display {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.username-display h2 {
  font-size: 24px;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.user-id {
  font-size: 13px;
  color: #999;
  display: inline-block;
  margin: 0 8px;
}

/* 表单样式 */
.profile-form .form-group {
  margin-bottom: 20px;
}

.profile-form .form-group label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

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

.hint {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

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

.save-btn:hover:not(:disabled) {
  background: #e85a7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  color: #27ae60;
  margin-top: 12px;
  text-align: center;
}

.error {
  color: #e74c3c;
  margin-top: 12px;
  text-align: center;
}

/* 退出登录 */
.logout-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

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

.logout-btn:hover {
  background: #e74c3c;
  color: white;
}

/* ✅ 注销账号 */
.danger-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

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

.delete-account-btn:hover {
  background: #e74c3c;
  color: white;
}

.danger-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* ===== 弹窗样式 ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.modal-box {
  background: white;
  padding: 32px;
  border-radius: 16px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-icon {
  text-align: center;
  font-size: 48px;
  margin-bottom: 12px;
}

.modal-box h3 {
  text-align: center;
  color: #1a1a2e;
  font-size: 22px;
  margin-bottom: 16px;
}

.modal-warning {
  color: #666;
  font-size: 14px;
  text-align: center;
  margin-bottom: 12px;
}

.modal-list {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.modal-list li {
  padding: 6px 12px;
  color: #555;
  font-size: 14px;
  border-bottom: 1px solid #f5f5f5;
  text-align: center;
}

.modal-list li:last-child {
  border-bottom: none;
}

.modal-confirm-text {
  text-align: center;
  color: #e74c3c;
  font-size: 14px;
  margin: 16px 0 20px;
}

.modal-confirm-text strong {
  font-weight: 700;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-cancel-btn,
.modal-confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-cancel-btn {
  background: #f0f0f0;
  color: #333;
}

.modal-cancel-btn:hover {
  background: #e0e0e0;
}

.modal-confirm-btn {
  background: #e74c3c;
  color: white;
}

.modal-confirm-btn:hover:not(:disabled) {
  background: #c0392b;
}

.modal-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>