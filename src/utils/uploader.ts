// src/utils/uploader.ts

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB 每片
const MAX_CONCURRENT = 3; // 最大并发上传数

export interface UploadOptions {
  file: File;
  fileId: string;
  onProgress?: (progress: number, uploaded: number, total: number) => void;
  onChunkComplete?: (chunkIndex: number, total: number) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

export class ChunkUploader {
  private file: File;
  private fileId: string;
  private totalChunks: number;
  private uploadedChunks: Set<number> = new Set();
  private isPaused: boolean = false;
  private isCancelled: boolean = false;
  private options: UploadOptions;
  private baseURL: string;

  constructor(options: UploadOptions) {
    this.options = options;
    this.file = options.file;
    this.fileId = options.fileId;
    this.totalChunks = Math.ceil(this.file.size / CHUNK_SIZE);
       this.baseURL = 'http://42.193.218.113:8000/api';
    
    // 从 localStorage 恢复已上传的分片（断点续传）
    this.loadProgress();
  }

  // 获取文件扩展名
  private getFileExtension(): string {
    const name = this.file.name;
    const ext = name.split('.').pop();
    return ext ? `.${ext}` : '.mp4';
  }

  // 保存上传进度到 localStorage（断点续传）
  private saveProgress(): void {
    const key = `upload_${this.fileId}`;
    const data = {
      uploadedChunks: Array.from(this.uploadedChunks),
      totalChunks: this.totalChunks,
      fileName: this.file.name,
      fileSize: this.file.size
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  // 加载上传进度
  private loadProgress(): void {
    const key = `upload_${this.fileId}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.uploadedChunks = new Set(parsed.uploadedChunks);
      } catch (e) {
        // 忽略
      }
    }
  }

  // 上传单个分片
  private async uploadChunk(index: number): Promise<void> {
    if (this.isCancelled || this.isPaused) return;
    if (this.uploadedChunks.has(index)) return;

    const start = index * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, this.file.size);
    const chunk = this.file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunk_index', String(index));
    formData.append('total_chunks', String(this.totalChunks));
    formData.append('file_id', this.fileId);
    formData.append('file_ext', this.getFileExtension());

    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${this.baseURL}/works/chunk_upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`上传分片 ${index} 失败: ${response.status}`);
      }

      const data = await response.json();
      
      // 标记分片已上传
      this.uploadedChunks.add(index);
      this.saveProgress();

      // 回调
      if (this.options.onChunkComplete) {
        this.options.onChunkComplete(index, this.totalChunks);
      }

      // 检查是否完成
      if (this.uploadedChunks.size === this.totalChunks) {
        if (this.options.onComplete) {
          this.options.onComplete(data);
        }
        // 清除进度缓存
        localStorage.removeItem(`upload_${this.fileId}`);
      }

      // 更新进度
      if (this.options.onProgress) {
        const progress = Math.round((this.uploadedChunks.size / this.totalChunks) * 100);
        this.options.onProgress(progress, this.uploadedChunks.size, this.totalChunks);
      }

    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 上传所有分片（并发控制）
  async upload(): Promise<void> {
    this.isPaused = false;
    this.isCancelled = false;

    // 找出未上传的分片索引
    const pendingChunks: number[] = [];
    for (let i = 0; i < this.totalChunks; i++) {
      if (!this.uploadedChunks.has(i)) {
        pendingChunks.push(i);
      }
    }

    if (pendingChunks.length === 0) {
      // 全部已上传，检查是否已合并
      return;
    }

    // 并发上传
    const promises: Promise<void>[] = [];
    let index = 0;

    const nextChunk = (): Promise<void> => {
      if (index >= pendingChunks.length) {
        return Promise.resolve();
      }
      const chunkIndex = pendingChunks[index++];
      return this.uploadChunk(chunkIndex).then(() => nextChunk());
    };

    // 启动 MAX_CONCURRENT 个并发
    for (let i = 0; i < Math.min(MAX_CONCURRENT, pendingChunks.length); i++) {
      promises.push(nextChunk());
    }

    await Promise.all(promises);
  }

  // 暂停上传
  pause(): void {
    this.isPaused = true;
  }

  // 取消上传
  cancel(): void {
    this.isCancelled = true;
    localStorage.removeItem(`upload_${this.fileId}`);
  }

  // 获取上传进度
  getProgress(): { uploaded: number; total: number; percent: number } {
    return {
      uploaded: this.uploadedChunks.size,
      total: this.totalChunks,
      percent: Math.round((this.uploadedChunks.size / this.totalChunks) * 100)
    };
  }
}