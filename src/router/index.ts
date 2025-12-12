import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import business from './business'
import jsViews from './jsviews'
import cssViews from './cssviews'
import aiViews from './aiviews'
import animationViews from './animationviews'
import { setupRouterGuards } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: '业务组件',
    component: HomeView,
    redirect: '/businessViews/permission',
    children: business
  },
  {
    path: '/jsViews',
    name: 'js相关',
    component: HomeView,
    redirect: '/jsViews/markdownPreview',
    children: jsViews
  },
  {
    path: '/cssViews',
    name: 'css相关',
    component: HomeView,
    redirect: '/cssViews/scale',
    children: cssViews
  },
  {
    path: '/aiViews',
    name: 'ai相关',
    component: HomeView,
    redirect: '/aiViews/stream',
    children: aiViews
  },
  {
    path: '/animationViews',
    name: '动画相关',
    component: HomeView,
    redirect: '/animationViews/memory-graph/index',
    children: animationViews
  },
  {
    path: '/login',
    name: '登录',
    component: () => import('@/views/login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 设置路由守卫
setupRouterGuards(router)

export const useRouteList = routes
export default router
