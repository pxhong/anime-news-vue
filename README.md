# 二次元新闻资讯站

浏览动漫资讯、投稿图文与视频作品的网站。

前端 Vue 3 + TypeScript + Vite；后端 Django REST Framework + PostgreSQL（[anime-news-backend](https://github.com/pxhong/anime-news-backend)）；图片与视频存储于腾讯云 COS。

## 功能

- 浏览：首页信息流、列表页、详情页，支持图文与视频两类内容
- 投稿：文章与视频两种类型；视频分片上传，服务端合并后用 ffmpeg 转码
- 播放：支持进度条拖拽；播放地址为对象存储签名 URL（私有桶，1 小时有效，浏览器直连）
- 用户：邮箱验证码注册 / 登录、个人中心、我的作品
- 互动：点赞、浏览量

## 视频链路

上传：浏览器分片上传 -> 服务端合并 -> ffmpeg 转码 -> 上传 COS -> 清理服务器本地文件
播放：GET /media/... -> 302 重定向 -> COS 签名 URL -> 浏览器直连对象存储

- 视频流量不经过应用服务器，避免小带宽服务器的播放卡顿
- 媒体文件持久化于对象存储，不受服务器磁盘限制、不随容器重建丢失
- 未配置对象存储时自动回退本地磁盘存储，本地开发零配置

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端 | Vue 3（`<script setup>`）、TypeScript、Vite、Vue Router、Pinia、Axios |
| 后端 | Django、Django REST Framework、Gunicorn |
| 数据库 | PostgreSQL |
| 对象存储 | 腾讯云 COS（django-storages） |
| 媒体处理 | ffmpeg |
| 部署 | Ubuntu + Docker Compose |

## 本地运行

```bash
npm install
npm run dev
npm run build
```

## 路线图

- [x] 前后端分离重构（Django + PostgreSQL）
- [x] 视频分片上传与 ffmpeg 转码
- [x] 图片、视频迁移至腾讯云 COS
- [ ] 备案 + 独立域名 + HTTPS 上线（备案审核中）
- [ ] 评论区（回复、删除、分页）
- [ ] 接口地址抽取为环境变量

## 说明

- 新版因 ICP 备案审核中暂未上线；旧版在线演示为早期纯前端版本（数据存于浏览器 localStorage）：https://pxhong.github.io/anime-news-vue/
- 完整的前后端分离版源码在 `backup-20261001` 分支，默认分支仍为早期版本，后续整理迁移
- 个人学习项目，用于求职展示

<!--
## 界面预览

| 首页 | 视频详情 |
| --- | --- |
| ![首页](docs/screenshots/home.png) | ![详情](docs/screenshots/detail.png) |
-->
