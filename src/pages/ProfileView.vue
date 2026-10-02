<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="avatar-section">
        <div class="avatar-wrap">
          <img :src="currentAvatar" :alt="userInfo?.username || '用户'" class="avatar" @error="handleImageError" />
          <label class="avatar-upload" for="avatar-upload">
            <svg viewBox="0 0 24 24" class="up-icon"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            更换头像
            <input type="file" id="avatar-upload" accept="image/*" @change="handleAvatarUpload" style="display:none" />
          </label>
        </div>
        <div v-if="avatarPreview" class="avatar-preview">
          <img :src="avatarPreview" alt="预览" />
          <div class="preview-actions">
            <button @click="confirmAvatar" class="confirm-btn" :disabled="loading">{{ loading ? '上传中' : '确认' }}</button>
            <button @click="cancelAvatar" class="cancel-btn">取消</button>
          </div>
        </div>
      </div>

      <div class="profile-head">
        <h2 class="display-name">{{ userInfo?.username || '用户' }}</h2>
        <div class="profile-ids">
          <span>账号：{{ userInfo?.account || '' }}</span>
          <span class="dot">·</span>
          <span>ID：{{ userInfo?.id || '' }}</span>
        </div>
      </div>

      <router-link to="/profile/works" class="my-works-entry">
        <svg viewBox="0 0 24 24" class="entry-icon"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        我的投稿
        <span class="entry-arrow">›</span>
      </router-link>

      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="form-group">
          <label>昵称 <span class="required">*</span></label>
          <input v-model="username" type="text" placeholder="请输入昵称"
            :class="{ 'input-error': usernameError, 'input-success': usernameAvailable && username !== originalUsername }" />
          <div class="username-feedback">
            <p v-if="usernameChecking" class="hint checking">检查中</p>
            <p v-else-if="usernameError" class="hint error-text">{{ usernameError }}</p>
            <p v-else-if="usernameAvailable && username !== originalUsername" class="hint success-text">昵称可用</p>
            <p v-else class="hint muted">昵称至少2个字符，不能与他人重复</p>
          </div>
        </div>

        <div class="form-group">
          <label>个人简介</label>
          <textarea v-model="bio" rows="4" placeholder="介绍一下你自己..." maxlength="500"></textarea>
          <span class="char-count">{{ bio?.length || 0 }}/500</span>
        </div>

        <button type="submit" :disabled="loading || !!usernameError" class="save-btn">
          {{ loading ? '保存中' : '保存修改' }}
        </button>
        <p v-if="success" class="tip success">保存成功</p>
        <p v-if="error" class="tip error">{{ error }}</p>
      </form>

      <div class="danger-zone">
        <button @click="handleLogout" class="logout-btn">退出登录</button>
        <button @click="showDeleteModal = true" class="delete-account-btn">注销账号</button>
      </div>
    </div>
  </div>

  <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
    <div class="modal-box">
      <h3>确认注销账号？</h3>
      <p class="modal-warning">注销后，你的所有数据将被永久删除，无法恢复！</p>
      <div class="modal-actions">
        <button @click="showDeleteModal = false" class="modal-cancel-btn">取消</button>
        <button @click="confirmDeleteAccount" :disabled="deleting" class="modal-confirm-btn">
          {{ deleting ? '注销中' : '确认注销' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import api from '@/api/index';
import { getImageUrl } from '@/utils/media';
const router = useRouter();
const userStore = useUserStore();

const userInfo = ref(null);
const username = ref('');
const originalUsername = ref('');
const bio = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

const avatarFile = ref(null);
const avatarPreview = ref('');
const showDeleteModal = ref(false);
const deleting = ref(false);

const usernameError = ref('');
const usernameAvailable = ref(false);
const usernameChecking = ref(false);
let checkTimer = null;
let checkSeq = 0;



const currentAvatar = computed(() => {
  if (avatarPreview.value) return avatarPreview.value;
  if (userInfo.value?.avatar_url) return getImageUrl(userInfo.value.avatar_url);
  const name = userInfo.value?.username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FB7299&color=fff&size=128`;
});

const handleImageError = (e) => {
  const img = e.target;
  const name = userInfo.value?.username || 'User';
  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FB7299&color=fff&size=128`;
};

const loadUserInfo = async () => {
  try {
    const res = await api.get('/profile/');
    userInfo.value = res.data;
    username.value = res.data.username;
    originalUsername.value = res.data.username;
    bio.value = res.data.bio || '';
    usernameAvailable.value = true;
  } catch (err) {
    console.error('加载用户信息失败:', err);
  }
};

const checkUsername = async () => {
  const val = username.value.trim();
  if (val === originalUsername.value) {
    usernameError.value = '';
    usernameAvailable.value = true;
    usernameChecking.value = false;
    return;
  }
  if (!val || val.length < 2) {
    usernameError.value = '昵称至少2个字符';
    usernameAvailable.value = false;
    usernameChecking.value = false;
    return;
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(val)) {
    usernameError.value = '昵称只能包含中文、字母、数字和下划线';
    usernameAvailable.value = false;
    usernameChecking.value = false;
    return;
  }
  usernameChecking.value = true;
  usernameError.value = '';
  usernameAvailable.value = false;
  const seq = ++checkSeq;
  try {
    const res = await api.get(`/check-username/?username=${encodeURIComponent(val)}`);
    if (seq !== checkSeq) return;
    if (res.data.exists) {
      usernameError.value = '该昵称已被使用，请换一个';
      usernameAvailable.value = false;
    } else {
      usernameError.value = '';
      usernameAvailable.value = true;
    }
  } catch (err) {
    if (seq !== checkSeq) return;
    usernameError.value = '';
    usernameAvailable.value = true;
  } finally {
    if (seq === checkSeq) usernameChecking.value = false;
  }
};

watch(username, () => {
  if (checkTimer) clearTimeout(checkTimer);
  checkTimer = setTimeout(checkUsername, 300);
});

const handleAvatarUpload = (e) => {
  const input = e.target;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (!file.type.startsWith('image/')) { alert('请选择图片文件'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('图片不能超过5MB'); return; }
    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
  }
};

const confirmAvatar = async () => {
  if (!avatarFile.value) return;
  loading.value = true;
  error.value = '';
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile.value);
    const res = await api.post('/avatar/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    userInfo.value = res.data;
    avatarPreview.value = '';
    avatarFile.value = null;
    userStore.user = res.data;
    localStorage.setItem('user_info', JSON.stringify(res.data));
    success.value = true;
    setTimeout(() => { success.value = false; }, 3000);
  } catch (err) {
    error.value = err.response?.data?.error || '上传失败';
  } finally {
    loading.value = false;
  }
};

const cancelAvatar = () => {
  avatarPreview.value = '';
  avatarFile.value = null;
};

const updateProfile = async () => {
  if (usernameError.value) { error.value = '请先解决昵称问题'; return; }
  if (!username.value.trim() || username.value.trim().length < 2) { error.value = '昵称至少2个字符'; return; }
  loading.value = true;
  error.value = '';
  success.value = false;
  try {
    const res = await api.put('/profile/', { username: username.value.trim(), bio: bio.value });
    userInfo.value = res.data;
    userStore.user = res.data;
    localStorage.setItem('user_info', JSON.stringify(res.data));
    originalUsername.value = res.data.username;
    usernameAvailable.value = true;
    success.value = true;
    setTimeout(() => { success.value = false; }, 3000);
  } catch (err) {
    if (err.response?.data?.username) {
      usernameError.value = err.response.data.username[0];
      usernameAvailable.value = false;
      error.value = '';
    } else {
      error.value = err.response?.data?.detail || '保存失败，请重试';
    }
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => userStore.logout();

const confirmDeleteAccount = async () => {
  deleting.value = true;
  try {
    await api.delete('/delete-account/');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    router.push('/');
    window.location.reload();
  } catch (err) {
    alert(err.response?.data?.error || '注销失败，请重试');
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
};

onMounted(loadUserInfo);
</script>

<style scoped>
.profile-page { max-width: 560px; margin: 0 auto; padding: 20px 16px; }
.profile-card { background: #fff; border: 1px solid #f0f1f2; border-radius: 12px; padding: 32px; }

.avatar-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
.avatar-wrap { position: relative; width: 104px; height: 104px; }
.avatar { width: 104px; height: 104px; border-radius: 50%; object-fit: cover; border: 3px solid #f0f1f2; background: #f1f2f3; }
.avatar-upload { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.65); color: #fff; padding: 4px 12px; border-radius: 12px;
  font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
.avatar-upload:hover { background: rgba(0,0,0,0.8); }
.up-icon { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2; }

.avatar-preview { margin-top: 14px; text-align: center; }
.avatar-preview img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid #f0f1f2; }
.preview-actions { margin-top: 8px; display: flex; gap: 10px; justify-content: center; }
.confirm-btn, .cancel-btn { padding: 4px 16px; border: none; border-radius: 12px; cursor: pointer; font-size: 13px; }
.confirm-btn { background: #FB7299; color: #fff; }
.confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cancel-btn { background: #f1f2f3; color: #61666d; }

.profile-head { text-align: center; margin-bottom: 16px; }
.display-name { font-size: 22px; color: #18191c; margin: 0 0 6px; }
.profile-ids { font-size: 13px; color: #9499a0; }
.profile-ids .dot { color: #c9ccd0; margin: 0 6px; }

.my-works-entry { display: flex; align-items: center; justify-content: center; gap: 8px;
  margin: 0 0 24px; padding: 12px; background: #fdf6f9; color: #FB7299;
  border: 1px solid #fbe4ec; border-radius: 8px; text-decoration: none; font-size: 15px;
  transition: background 0.2s; }
.my-works-entry:hover { background: #fbe4ec; }
.entry-icon { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 2; }
.entry-arrow { font-size: 18px; line-height: 1; }

.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; color: #18191c; font-weight: 500; font-size: 14px; }
.required { color: #e74c3c; }
.form-group input, .form-group textarea { width: 100%; padding: 11px 14px;
  border: 1px solid #e3e5e7; border-radius: 8px; font-size: 15px; box-sizing: border-box;
  transition: border-color 0.2s; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #FB7299; }
.input-error { border-color: #e74c3c !important; background: #fff5f5; }
.input-success { border-color: #27ae60 !important; }

.username-feedback { min-height: 22px; margin-top: 4px; }
.hint { font-size: 13px; margin: 0; }
.hint.checking { color: #f39c12; }
.hint.error-text { color: #e74c3c; }
.hint.success-text { color: #27ae60; }
.hint.muted { color: #9499a0; }

.char-count { display: block; text-align: right; font-size: 12px; color: #9499a0; margin-top: 4px; }

.save-btn { width: 100%; padding: 12px; background: #FB7299; color: #fff; border: none;
  border-radius: 8px; font-size: 16px; cursor: pointer; transition: background 0.2s; }
.save-btn:hover:not(:disabled) { background: #e86288; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.tip { text-align: center; margin-top: 12px; font-size: 14px; }
.tip.success { color: #27ae60; }
.tip.error { color: #e74c3c; }

.danger-zone { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f0f1f2;
  display: flex; flex-direction: column; gap: 12px; }
.logout-btn { padding: 12px; background: transparent; color: #61666d;
  border: 1px solid #e3e5e7; border-radius: 8px; font-size: 15px; cursor: pointer; transition: all 0.2s; }
.logout-btn:hover { background: #f6f7f8; }
.delete-account-btn { padding: 12px; background: transparent; color: #e74c3c;
  border: 1px solid #f0c0c0; border-radius: 8px; font-size: 15px; cursor: pointer; transition: all 0.2s; }
.delete-account-btn:hover { background: #e74c3c; color: #fff; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-box { background: #fff; padding: 28px; border-radius: 12px; max-width: 400px; width: 90%; }
.modal-box h3 { text-align: center; color: #18191c; font-size: 20px; margin-bottom: 12px; }
.modal-warning { color: #61666d; font-size: 14px; text-align: center; margin-bottom: 20px; }
.modal-actions { display: flex; gap: 12px; }
.modal-cancel-btn, .modal-confirm-btn { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
.modal-cancel-btn { background: #f1f2f3; color: #61666d; }
.modal-confirm-btn { background: #e74c3c; color: #fff; }
.modal-confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>