<template>
  <div class="admin-page">
    <h2 class="page-title">{{ isEdit ? '✏️ 编辑作品' : '✍️ 投稿中心' }}</h2>

    <!-- 编辑模式加载中 -->
    <div v-if="pageLoading" class="status-tip">⏳ 加载中...</div>

    <div v-else>
      <!-- 类型切换 -->
      <div class="type-selector">
        <button 
          class="type-btn" 
          :class="{ active: workType === 'article' }" 
          @click="workType = 'article'" 
          :disabled="isEdit"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="8" y1="12" x2="14" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          文章
        </button>
        <button 
          class="type-btn" 
          :class="{ active: workType === 'video' }" 
          @click="workType = 'video'" 
          :disabled="isEdit"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <polygon points="10,9 16,12 10,15" fill="currentColor"/>
          </svg>
          视频
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
            maxlength="50" 
          />
          <span class="char-count">{{ form.title?.length || 0 }}/50</span>
        </div>

        <!-- 内容 -->
        <div class="form-item">
          <label>{{ workType === 'article' ? '正文内容' : '视频简介' }} <span class="required">*</span></label>
          <textarea 
            v-model="form.content" 
            class="textarea content-area" 
            :placeholder="workType === 'article' ? '撰写新闻正文内容...' : '描述视频内容...'" 
            maxlength="5000"
          ></textarea>
          <span class="char-count">{{ form.content?.length || 0 }}/5000</span>
        </div>

        <!-- 视频文件上传 -->
        <div class="form-item" v-if="workType === 'video'">
          <label>视频文件 <span class="required">*</span></label>
          <div 
            class="file-upload-area" 
            :class="{ 'dragover': isDragging }" 
            @dragover.prevent="isDragging = true" 
            @dragleave.prevent="isDragging = false" 
            @drop.prevent="handleVideoDrop" 
            @click="videoInput?.click()"
          >
            <input 
              ref="videoInput" 
              type="file" 
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" 
              @change="handleVideoSelect" 
              class="file-input-hidden" 
            />
            <div v-if="!videoFile && !videoPreviewUrl" class="upload-placeholder">
              <svg viewBox="0 0 48 48" width="40" height="40">
                <rect x="8" y="14" width="32" height="20" rx="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <polygon points="20,19 28,24 20,29" fill="currentColor"/>
              </svg>
              <p>点击上传或拖拽视频文件</p>
              <p class="upload-hint">支持 MP4, WebM, MOV, AVI 格式</p>
            </div>
            <div v-else class="video-preview">
              <video :src="videoPreviewUrl" controls class="preview-video"></video>
              <div class="file-info">
                <span class="file-name">{{ videoFile?.name || '视频文件' }}</span>
                <span class="file-size">{{ formatFileSize(videoFile?.size || 0) }}</span>
                <button @click.stop="removeVideo" class="remove-file-btn">✕</button>
              </div>
            </div>
          </div>
          <!-- 编辑模式下显示当前视频 -->
          <div v-if="isEdit && workType === 'video' && existingFileName && !videoFile" class="existing-file">
            📁 当前视频：{{ existingFileName }}（不重新上传则保留原视频）
          </div>
        </div>

        <!-- 封面图 -->
        <div class="form-item">
          <label>封面图片</label>
          <div class="cover-upload-area" @click="coverInput?.click()">
            <input 
              ref="coverInput" 
              type="file" 
              accept="image/*" 
              @change="handleCoverSelect" 
              class="file-input-hidden" 
            />
            <div v-if="!coverFile && !coverPreviewUrl" class="cover-placeholder">
              <svg viewBox="0 0 48 48" width="32" height="32">
                <rect x="6" y="10" width="36" height="28" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M16 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
                <path d="M42 28l-8-8-10 10-6-6-8 8" stroke="currentColor" stroke-width="1.5" fill="none"/>
              </svg>
              <p>点击上传封面图</p>
              <p class="upload-hint">建议 16:9，支持 JPG/PNG</p>
            </div>
            <div v-else class="cover-preview">
              <img :src="coverPreviewUrl" alt="封面预览" />
              <div class="cover-overlay"><span>点击更换</span></div>
            </div>
          </div>
          <div v-if="coverFile" class="file-info">
            <span class="file-name">{{ coverFile.name }}</span>
            <button @click="removeCover" class="remove-file-btn">✕</button>
          </div>
        </div>

        <!-- 分片上传进度 -->
        <div v-if="isUploading" class="upload-progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <div class="progress-text">
            {{ uploadProgress }}% ({{ uploadedChunks }}/{{ totalChunks }} 分片)
          </div>
          <div class="progress-actions">
            <button @click="pauseUpload" class="pause-btn" v-if="!isPaused">⏸ 暂停</button>
            <button @click="resumeUpload" class="resume-btn" v-if="isPaused">▶ 继续</button>
            <button @click="cancelUpload" class="cancel-btn">✕ 取消</button>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="btn-group">
          <button class="btn btn-primary submit-btn" @click="submitWork" :disabled="loading">
            <span v-if="loading">⏳ 提交中...</span>
            <span v-else-if="isEdit">💾 保存修改</span>
            <span v-else>🚀 发布作品</span>
          </button>
          <button class="btn reset-btn" @click="resetForm">🗑️ 清空表单</button>
        </div>

        <p class="success" v-if="success">{{ isEdit ? '✅ 保存成功！' : '✅ 发布成功！' }}</p>
        <p class="error" v-if="error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createWork, updateWork, getWork } from '@/api/work';
import { getImageUrl } from '@/utils/media';
import { uploadVideoWithChunks } from '@/api/work';

const route = useRoute();
const router = useRouter();

// 作品类型
const workType = ref('article');
const form = reactive({ title: '', content: '' });

// 文件
const videoFile = ref(null);
const coverFile = ref(null);
const videoPreviewUrl = ref('');
const coverPreviewUrl = ref('');
const isDragging = ref(false);
const uploadProgress = ref(0);
const videoInput = ref(null);
const coverInput = ref(null);

// 状态
const loading = ref(false);
const error = ref('');
const success = ref(false);

// 编辑模式
const editId = ref(route.params.id ? Number(route.params.id) : null);
const isEdit = computed(() => editId.value !== null);
const existingFileName = ref('');
const pageLoading = ref(false);

// 分片上传状态
const isUploading = ref(false);
const uploadedChunks = ref(0);
const totalChunks = ref(0);
const isPaused = ref(false);
let currentUploader = null;

// 文件类型校验
const isVideoFile = (file) => {
  if (!file) return false;
  if (file.type && file.type.startsWith('video/')) return true;
  return /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name);
};

const isImageFile = (file) => {
  if (!file) return false;
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|gif|webp|bmp)$/i.test(file.name);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleVideoSelect = (e) => {
  const input = e.target;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (!isVideoFile(file)) { alert('请选择视频文件'); return; }
    if (file.size > 500 * 1024 * 1024) { alert('视频文件不能超过500MB'); return; }
    videoFile.value = file;
    videoPreviewUrl.value = URL.createObjectURL(file);
  }
  isDragging.value = false;
};

const handleVideoDrop = (e) => {
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files[0]) {
    const file = files[0];
    if (!isVideoFile(file)) { alert('请拖拽视频文件'); return; }
    if (file.size > 500 * 1024 * 1024) { alert('视频文件不能超过500MB'); return; }
    videoFile.value = file;
    videoPreviewUrl.value = URL.createObjectURL(file);
    if (videoInput.value) videoInput.value.files = files;
  }
};

const removeVideo = () => {
  videoFile.value = null;
  if (videoPreviewUrl.value) {
    URL.revokeObjectURL(videoPreviewUrl.value);
    videoPreviewUrl.value = '';
  }
  if (videoInput.value) videoInput.value.value = '';
};

const handleCoverSelect = (e) => {
  const input = e.target;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (!isImageFile(file)) { alert('请选择图片文件'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('图片不能超过5MB'); return; }
    coverFile.value = file;
    coverPreviewUrl.value = URL.createObjectURL(file);
  }
};

const removeCover = () => {
  coverFile.value = null;
  if (coverPreviewUrl.value) {
    URL.revokeObjectURL(coverPreviewUrl.value);
    coverPreviewUrl.value = '';
  }
  if (coverInput.value) coverInput.value.value = '';
};

// 加载待编辑作品
const loadWorkForEdit = async () => {
  if (!isEdit.value) return;
  pageLoading.value = true;
  error.value = '';
  try {
    const res = await getWork(editId.value);
    const work = res.data;
    form.title = work.title;
    form.content = work.content;
    workType.value = work.work_type;
    if (work.file) existingFileName.value = work.file.split('/').pop();
    if (work.cover) coverPreviewUrl.value = getImageUrl(work.cover);
  } catch (err) {
    if (err.response?.status === 403 || err.response?.status === 404) {
      error.value = '作品不存在或你没有编辑权限';
    } else {
      error.value = '加载作品失败，请重试';
    }
  } finally {
    pageLoading.value = false;
  }
};

// 提交作品（主入口）
const submitWork = async () => {
  if (!form.title.trim()) {
    error.value = '请输入标题';
    return;
  }
  if (!form.content.trim()) {
    error.value = workType.value === 'article' ? '请输入正文内容' : '请输入视频简介';
    return;
  }
  
  // 视频：使用分片上传
  if (workType.value === 'video' && videoFile.value) {
    await uploadVideoWithChunksFlow();
    return;
  }
  
  // 文章：普通上传
  await submitArticle();
};

// 分片上传视频
const uploadVideoWithChunksFlow = async () => {
  if (!videoFile.value) {
    error.value = '请上传视频文件';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = false;
  isUploading.value = true;
  uploadProgress.value = 0;
  uploadedChunks.value = 0;
  totalChunks.value = 0;

  try {
    const file = videoFile.value;
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
    totalChunks.value = Math.ceil(file.size / CHUNK_SIZE);

    const { uploader, start } = uploadVideoWithChunks(
      file,
      // 进度回调
      (progress, uploaded, total) => {
        uploadProgress.value = progress;
        uploadedChunks.value = uploaded;
        totalChunks.value = total;
      },
      // 完成回调
      async (result) => {
        isUploading.value = false;
        loading.value = false;
        
        if (result.status === 'complete') {
          // 保存作品信息
          const formData = new FormData();
          formData.append('title', form.title.trim());
          formData.append('content', form.content.trim());
          formData.append('work_type', 'video');
          formData.append('file', result.file_path);
          if (coverFile.value) {
            formData.append('cover', coverFile.value);
          }
          
          await createWork(formData);
          
          success.value = true;
          setTimeout(() => {
            resetForm();
            router.push(isEdit.value ? '/profile/works' : '/news');
          }, 1500);
        }
      },
      // 错误回调
      (err) => {
        console.error('上传失败:', err);
        error.value = '视频上传失败，请重试';
        isUploading.value = false;
        loading.value = false;
      }
    );
    
    currentUploader = uploader;
    await start();
    
  } catch (err) {
    error.value = err.message || '上传失败，请重试';
    isUploading.value = false;
    loading.value = false;
  }
};

// 文章提交
const submitArticle = async () => {
  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('content', form.content.trim());
    formData.append('work_type', workType.value);

    if (coverFile.value && coverFile.value instanceof File) {
      formData.append('cover', coverFile.value);
    }

    if (isEdit.value) {
      await updateWork(editId.value, formData);
    } else {
      await createWork(formData);
    }

    success.value = true;
    setTimeout(() => {
      resetForm();
      router.push(isEdit.value ? '/profile/works' : '/news');
    }, 1500);
  } catch (err) {
    const data = err.response?.data;
    let msg = data?.detail;
    if (!msg && data && typeof data === 'object') {
      const parts = [];
      for (const [k, v] of Object.entries(data)) {
        parts.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
      }
      if (parts.length) msg = parts.join('；');
    }
    error.value = msg || (isEdit.value ? '保存失败，请重试' : '发布失败，请重试');
    console.error('提交失败:', err);
  } finally {
    loading.value = false;
  }
};

// 暂停上传
const pauseUpload = () => {
  if (currentUploader) {
    currentUploader.pause();
    isPaused.value = true;
  }
};

// 继续上传
const resumeUpload = () => {
  if (currentUploader) {
    isPaused.value = false;
    currentUploader.resume?.();
    currentUploader.upload();
  }
};

// 取消上传
const cancelUpload = () => {
  if (currentUploader) {
    currentUploader.cancel();
    isUploading.value = false;
    loading.value = false;
    error.value = '上传已取消';
    uploadProgress.value = 0;
  }
};

const resetForm = () => {
  form.title = '';
  form.content = '';
  workType.value = 'article';
  removeVideo();
  removeCover();
  existingFileName.value = '';
  error.value = '';
  success.value = false;
};

onMounted(() => {
  loadWorkForEdit();
});
</script>

<style scoped>
.admin-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 28px;
  color: #222;
}

.type-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.type-btn {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  background: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.type-btn:hover {
  border-color: #FB7299;
}

.type-btn.active {
  border-color: #FB7299;
  background: #FB7299;
  color: white;
}

.type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 2px;
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
  transition: all 0.3s;
  cursor: pointer;
  background: #fafafa;
}

.file-upload-area:hover {
  border-color: #FB7299;
  background: #fdf5f7;
}

.file-upload-area.dragover {
  border-color: #FB7299;
  background: #fdf0f3;
  transform: scale(1.01);
}

.upload-placeholder {
  text-align: center;
}

.upload-placeholder svg {
  color: #999;
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

.cover-upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s;
  background: #fafafa;
}

.cover-upload-area:hover {
  border-color: #FB7299;
}

.cover-placeholder {
  padding: 40px;
  text-align: center;
}

.cover-placeholder svg {
  color: #999;
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

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  margin-top: 8px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #999;
  font-size: 12px;
}

.remove-file-btn {
  padding: 2px 8px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.remove-file-btn:hover {
  background: #c0392b;
}

.existing-file {
  padding: 10px 12px;
  background: #fdf5f7;
  color: #c0392b;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 8px;
}

/* 分片上传进度 */
.upload-progress-container {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FB7299, #FF6B8A);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 8px;
  font-size: 14px;
  color: #61666d;
  text-align: center;
}

.progress-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.progress-actions button {
  padding: 4px 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.pause-btn {
  background: #f1f2f3;
  color: #61666d;
}
.pause-btn:hover {
  background: #e3e5e7;
}

.resume-btn {
  background: #FB7299;
  color: white;
}
.resume-btn:hover {
  background: #e86288;
}

.cancel-btn {
  background: transparent;
  color: #e74c3c;
}
.cancel-btn:hover {
  background: #fef0ef;
}

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
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 114, 153, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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

.status-tip {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}

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
  
  .file-upload-area {
    min-height: 150px;
  }
}
</style>