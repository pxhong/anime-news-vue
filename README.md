# 二次元新闻资讯站 📺
> Vue3 + TypeScript + Vue‑Router + Vite 纯前端演示项目

## ✨项目功能
1. 新闻首页、新闻列表、新闻详情页
2. 前端模拟投稿后台，支持上传图片、GIF预览
3. 使用 localStorage 本地存储新闻，浏览器刷新数据不会丢失
4. B站/Niconico风格亮色UI

## ⚠️当前版本限制【纯前端】
1. 上传图片使用浏览器Blob临时地址，**刷新页面图片会直接丢失**
2. 所有新闻数据保存在当前浏览器，换电脑、换浏览器数据消失
3. 没有管理员权限控制，任何人访问投稿页面都可以新增新闻

> 🚧后续学习全栈之后：接入后端、数据库、真实图片上传接口，解决上面全部问题。

## 🛠技术栈
- Vue3 `<script setup>` + TypeScript
- Vue Router 4
- Vite
- LocalStorage

## 🧪本地运行
```bash
#安装依赖
npm install

#启动开发服务器
npm run dev

#打包静态文件
npm run build