<template>
  <div class="my-works-page">
    <div class="page-header">
      <h2 class="page-title">我的投稿</h2>
      <router-link to="/admin" class="new-btn">发布新作品</router-link>
    </div>

    <div v-if="pageLoading" class="state-tip"><div class="spinner"></div><span>加载中</span></div>
    <div v-else-if="error" class="state-tip error">{{ error }}</div>

    <div v-else-if="works.length === 0" class="state-tip">
      <p>还没有投稿作品</p>
      <router-link to="/admin" class="empty-btn">去发布第一个作品</router-link>
    </div>

    <div v-else>
      <div v-for="work in works" :key="work.id" class="work-item">
        <div class="work-cover" @click="goDetail(work.id)">
          <img v-if="work.cover" :src="getImageUrl(work.cover)" :alt="work.title" />
          <span v-else class="cover-fallback">
            <svg v-if="work.work_type === 'video'" viewBox="0 0 24 24" class="fb-icon"><path d="M8 5v14l11-7z"/></svg>
            <svg v-else viewBox="0 0 24 24" class="fb-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </span>
        </div>

        <div class="work-info" @click="goDetail(work.id)">
          <h3 class="work-title">{{ work.title }}</h3>
          <div class="work-meta">
            <span class="tag" :class="work.work_type">{{ work.work_type === 'video' ? '视频' : '文章' }}</span>
            <span>{{ formatViewCount(work.views) }} 播放</span>
            <span>{{ formatViewCount(work.likes) }} 点赞</span>
            <span>{{ formatDate(work.created_at) }}</span>
          </div>
        </div>

        <div class="work-actions">
          <button class="btn-edit" @click="goEdit(work.id)">编辑</button>
          <button class="btn-delete" @click="handleDelete(work)">删除</button>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="goPage(page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyWorks, deleteWork } from '@/api/work';
import { getImageUrl, formatViewCount, formatDate } from '@/utils/media';
const router = useRouter();

const works = ref([]);
const pageLoading = ref(true);
const error = ref('');
const page = ref(1);
const totalPages = ref(1);
const PAGE_SIZE = 10;

const loadPage = async (p) => {
  pageLoading.value = true;
  error.value = '';
  try {
    const res = await getMyWorks({ page: p });
    works.value = res.data.results || [];
    page.value = p;
    totalPages.value = Math.max(1, Math.ceil((res.data.count || 0) / PAGE_SIZE));
  } catch (err) {
    error.value = err.response?.data?.detail || '加载失败，请重试';
    if (err.response?.status === 401) router.push('/login');
  } finally {
    pageLoading.value = false;
  }
};

const handleDelete = async (work) => {
  if (!confirm(`确定要删除《${work.title}》吗？删除后不可恢复！`)) return;
  try {
    await deleteWork(work.id);
    if (works.value.length === 1 && page.value > 1) await loadPage(page.value - 1);
    else await loadPage(page.value);
  } catch (err) {
    alert(err.response?.data?.detail || '删除失败，请重试');
  }
};

const goEdit = (id) => router.push(`/admin/edit/${id}`);
const goDetail = (id) => router.push(`/newsdetail/${id}`);   // ✅ 修复路由
const goPage = (p) => loadPage(p);

onMounted(() => loadPage(1));
</script>

<style scoped>
.my-works-page { max-width: 820px; margin: 0 auto; padding: 20px 16px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { margin: 0; font-size: 22px; color: #18191c; }
.new-btn { padding: 8px 18px; background: #FB7299; color: #fff; border-radius: 18px;
  text-decoration: none; font-size: 14px; transition: background 0.2s; }
.new-btn:hover { background: #e86288; }

.state-tip { display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 60px 0; color: #9499a0; font-size: 15px; }
.state-tip.error { color: #e74c3c; }
.spinner { width: 28px; height: 28px; border: 3px solid #f0f1f2; border-top-color: #FB7299;
  border-radius: 50%; animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-btn { padding: 8px 20px; background: #FB7299; color: #fff; border-radius: 18px;
  text-decoration: none; font-size: 14px; }

.work-item { display: flex; align-items: center; gap: 16px; background: #fff;
  border: 1px solid #f0f1f2; border-radius: 8px; padding: 12px; margin-bottom: 12px;
  transition: box-shadow 0.2s; }
.work-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

.work-cover { width: 168px; height: 94px; border-radius: 6px; overflow: hidden;
  cursor: pointer; flex-shrink: 0; background: #f1f2f3;
  display: flex; align-items: center; justify-content: center; }
.work-cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-fallback { display: flex; align-items: center; justify-content: center; }
.fb-icon { width: 30px; height: 30px; fill: #c9ccd0; }

.work-info { flex: 1; min-width: 0; cursor: pointer; }
.work-title { font-size: 16px; color: #18191c; margin: 0 0 8px; line-height: 1.4;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.work-meta { display: flex; gap: 12px; font-size: 12px; color: #9499a0; align-items: center; flex-wrap: wrap; }
.tag { padding: 2px 10px; border-radius: 10px; font-size: 11px; }
.tag.video { background: #f0f6fd; color: #3498db; }
.tag.article { background: #f0f9f2; color: #27ae60; }

.work-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-edit, .btn-delete { padding: 6px 16px; border-radius: 16px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.btn-edit { background: #f1f2f3; color: #61666d; border: none; }
.btn-edit:hover { background: #e3e5e7; }
.btn-delete { background: transparent; color: #e74c3c; border: 1px solid #e74c3c; }
.btn-delete:hover { background: #e74c3c; color: #fff; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 20px; }
.pagination button { padding: 6px 16px; border: 1px solid #f0f1f2; background: #fff;
  border-radius: 16px; cursor: pointer; color: #61666d; }
.pagination button:hover:not(:disabled) { background: #f6f7f8; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 640px) {
  .work-cover { width: 120px; height: 72px; }
  .work-actions { flex-direction: column; }
}
</style>