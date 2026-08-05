import { createRouter, createWebHashHistory } from 'vue-router'

import Home from '@/pages/Home.vue'
import News from '@/pages/News.vue'
import About from '@/pages/About.vue'
import NewsDetail from '@/pages/NewsDetail.vue'
// 新增后台投稿页面
import Admin from '@/pages/Admin.vue'

const router = createRouter({
    history:createWebHashHistory(),
    routes:[
        {
            path:'/',
            redirect:'/home'
        },
        {
            path:'/home',
            component:Home
        },
        {
            path:'/news',
            component:News
        },
        {
            path:'/news/:id',
            component:NewsDetail
        },
        {
            path:'/about',
            component:About
        },
        // 管理员投稿后台
        {
            path:'/admin',
            component:Admin
        },
    ]
})


export default router