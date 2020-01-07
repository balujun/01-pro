import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '@/views/login'
import Home from '@/views/home'
Vue.use(VueRouter)

const routes = [
  // { path: '/login', component: 箭头函数}
  // import使用:
  // 1. import xxx from xxx;  模块化导入  // 完整导入
  // 2. import(xxx)  函数调用 // 按需导入
  // 它们本质不是一回事
  // 如下是import()函数调用，好处是按需导入

  // @符号代表src目录的绝对路径名地址：E:\Vue92\everyday92\01pro\topline\src\
  // index.vue是默认索引文件，不用设置，代码更节省，更优雅
  // name属性作用：编程式导航可以利用
  { path: '/login', name: 'login', component: Login },
  { path: '/home', name: 'home', component: Home }
  // { path: '/login', name: 'login', component: () => import('@/views/login') }
]

const router = new VueRouter({
  routes
})

// 配置全局前置路由守卫
router.beforeEach((to, from, next) => {
  // 获得用户登录状态信息
  let userinfo = window.sessionStorage.getItem('userinfo')
  // 登录状态：userinfo是大字符串， 非登录状态，userinfo是null
  if (!userinfo && to.path !== '/login') {
    // 强制登录
    return next('/login')
  }

  // 放行
  next()
})

export default router
