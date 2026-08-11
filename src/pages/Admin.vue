<template>
  <div class="admin-page">
    <h2 class="page-title">✍️ 投稿中心</h2>

    <!-- 作品类型切换 -->
    <div class="type-selector">
      <button 
        class="type-btn" 
        :class="{ active: workType === 'article' }"
        @click="workType = 'article'"
      >
        📝 文章
      </button>
      <button 
        class="type-btn" 
        :class="{ active: workType === 'video' }"
        @click="workType = 'video'"
      >
        🎬 视频
      </button>
    </div>

    <div class="form-wrap">
      <!-- 标题 -->
      <div class="form-item">
        <label>标题 <span class="required">*</span></label>
        <input
          v-model="form.title"
          type="text"
          class="input"
          placeholder="请输入标题"
        />
      </div>

      <!-- 内容 -->
      <div class="form-item">
        <label>{{ workType === 'article' ? '正文内容' : '视频简介' }} <span class="required">*</span></label>
        <textarea
          v-model="form.content"
          class="textarea content-area"
          :placeholder="workType === 'article' ? '撰写新闻正文内容' : '描述视频内容'"
        ></textarea>
      </div>

      <!-- 视频文件上传（仅视频类型） -->
      <div class="form-item" v-if="workType === 'video'">
        <label>视频文件 <span class="required">*</span></label>
        <div class="file-upload-area" @dragover.prevent @drop.prevent="handleVideoDrop">
          <input
            ref="videoInput"
            type="file"
            accept="video/*"
            @change="handleVideoSelect"
            class="file-input-hidden"
          />
          <div v-if="!videoFile && !videoPreviewUrl" class="upload-placeholder">
            <span class="upload-icon">🎬</span>
            <p>点击上传或拖拽视频文件</p>
            <p class="upload-hint">支持 MP4, WebM, MOV 等格式</p>
          </div>
          <div v-else class="video-preview">
            <video :src="videoPreviewUrl" controls class="preview-video"></video>
            <div class="file-info">
              <span>{{ videoFile?.name || '视频文件' }}</span>
              <span class="file-size">{{ formatFileSize(videoFile?.size || 0) }}</span>
              <button @click="removeVideo" class="remove-file-btn">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 封面图片 -->
      <div class="form-item">
        <label>封面图片</label>
        <div class="cover-upload-area">
          <input
            ref="coverInput"
            type="file"
            accept="image/*"
            @change="handleCoverSelect"
            class="file-input-hidden"
          />
          <div v-if="!coverFile && !coverPreviewUrl" class="cover-placeholder" @click="coverInput?.click()">
            <span class="upload-icon">🖼️</span>
            <p>点击上传封面图</p>
            <p class="upload-hint">支持 JPG, PNG, GIF 格式</p>
          </div>
          <div v-else class="cover-preview" @click="coverInput?.click()">
            <img :src="coverPreviewUrl" alt="封面预览" />
            <div class="cover-overlay">
              <span>点击更换</span>
            </div>
          </div>
        </div>
        <div v-if="coverFile" class="file-info">
          <span>{{ coverFile.name }}</span>
          <button @click="removeCover" class="remove-file-btn">✕</button>
        </div>
      </div>

      <div class="btn-group">
        <button class="btn btn-primary submit-btn" @click="submitWork" :disabled="loading">
          {{ loading ? '发布中...' : '发布作品' }}
        </button>
        <button class="btn reset-btn" @click="resetForm">清空表单</button>
      </div>
      
      <p class="success" v-if="success">✅ 发布成功！</p>
      <p class="error" v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { createWork } from '@/api/work';

const router = useRouter();

// 作品类型
const workType = ref<'article' | 'video'>('article');

// 表单数据
const form = reactive({
  title: '',
  content: '',
});

// 文件相关
const videoFile = ref<File | null>(null);
const coverFile = ref<File | null>(null);
const videoPreviewUrl = ref('');
const coverPreviewUrl = ref('');

// 引用
const videoInput = ref<HTMLInputElement | null>(null);
const coverInput = ref<HTMLInputElement | null>(null);

// 状态
const loading = ref(false);
const error = ref('');
const success = ref(false);

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 选择视频文件
const handleVideoSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (!file.type.startsWith('video/')) {
      alert('请选择视频文件');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      alert('视频文件不能超过500MB');
      return;
    }
    videoFile.value = file;
    videoPreviewUrl.value = URL.createObjectURL(file);
  }
};

// 拖拽上传视频
const handleVideoDrop = (e: DragEvent) => {
  const files = e.dataTransfer?.files;
  if (files && files[0]) {
    const file = files[0];
    if (!file.type.startsWith('video/')) {
      alert('请拖拽视频文件');
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      alert('视频文件不能超过500MB');
      return;
    }
    videoFile.value = file;
    videoPreviewUrl.value = URL.createObjectURL(file);
    if (videoInput.value) videoInput.value.files = files;
  }
};

// 移除视频
const removeVideo = () => {
  videoFile.value = null;
  if (videoPreviewUrl.value) {
    URL.revokeObjectURL(videoPreviewUrl.value);
    videoPreviewUrl.value = '';
  }
  if (videoInput.value) videoInput.value.value = '';
};

// 选择封面图
const handleCoverSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片不能超过5MB');
      return;
    }
    coverFile.value = file;
    coverPreviewUrl.value = URL.createObjectURL(file);
  }
};

// 移除封面
const removeCover = () => {
  coverFile.value = null;
  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value);
    coverPreviewUrl.value = '';
  }
  if (coverInput.value) coverInput.value.value = '';
};

// 提交作品
const submitWork = async () => {
  // 验证
  if (!form.title.trim()) {
    error.value = '请输入标题';
    return;
  }
  if (!form.content.trim()) {
    error.value = workType.value === 'article' ? '请输入正文内容' : '请输入视频简介';
    return;
  }
  if (workType.value === 'video' && !videoFile.value) {
    error.value = '请上传视频文件';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('content', form.content.trim());
    formData.append('work_type', workType.value);

    if (coverFile.value) {
      formData.append('cover', coverFile.value);
    }
    if (workType.value === 'video' && videoFile.value) {
      formData.append('file', videoFile.value);
    }

    await createWork(formData);
    
    success.value = true;
    setTimeout(() => {
      resetForm();
      router.push('/news');
    }, 1500);
  } catch (err: any) {
    error.value = err.response?.data?.detail || '发布失败，请重试';
    console.error('发布失败:', err);
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  form.title = '';
  form.content = '';
  workType.value = 'article';
  removeVideo();
  removeCover();
  error.value = '';
  success.value = false;
};
</script>

<style scoped>
.admin-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 28px;
  color: #222;
}

/* 类型切换 */
.type-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.type-btn {
  flex: 1;
  padding: 10px 20px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  background: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn:hover {
  border-color: #FB7299;
}

.type-btn.active {
  border-color: #FB7299;
  background: #FB7299;
  color: white;
}

.form-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.required {
  color: #f53f3f;
}

.input {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: 0.2s;
  font-size: 15px;
}

.input:focus {
  outline: none;
  border-color: #FB7299;
}

.textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  min-height: 100px;
  resize: vertical;
  font-size: 15px;
  font-family: inherit;
}

.textarea:focus {
  outline: none;
  border-color: #FB7299;
}

.content-area {
  min-height: 180px;
}

/* 文件上传 */
.file-input-hidden {
  display: none;
}

.file-upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 20px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
  cursor: pointer;
}

.file-upload-area:hover {
  border-color: #FB7299;
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.upload-placeholder p {
  color: #999;
  margin: 4px 0;
}

.upload-hint {
  font-size: 12px;
  color: #ccc;
}

.video-preview {
  width: 100%;
}

.preview-video {
  width: 100%;
  max-height: 300px;
  border-radius: 8px;
  background: #000;
}

/* 封面上传 */
.cover-upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s;
}

.cover-upload-area:hover {
  border-color: #FB7299;
}

.cover-placeholder {
  padding: 40px;
  text-align: center;
}

.cover-placeholder p {
  color: #999;
  margin: 4px 0;
}

.cover-preview {
  position: relative;
  width: 100%;
  max-height: 300px;
  overflow: hidden;
}

.cover-preview img {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  background: #f5f5f5;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

/* 文件信息 */
.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
}

.file-size {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.remove-file-btn {
  padding: 2px 8px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.remove-file-btn:hover {
  background: #c0392b;
}

/* 按钮 */
.btn-group {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-primary {
  background: #FB7299;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #e85a7a;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  background: #eee;
  color: #333;
}

.reset-btn:hover {
  background: #dddddd;
}

.success {
  color: #27ae60;
  text-align: center;
  font-size: 16px;
  margin-top: 12px;
}

.error {
  color: #e74c3c;
  text-align: center;
  font-size: 16px;
  margin-top: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .admin-page {
    padding: 0 12px;
  }
  
  .type-selector {
    flex-direction: column;
  }
  
  .btn-group {
    flex-direction: column;
  }
}
</style>