import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/aiViews/latex',
    name: 'latex',
    meta: {
      breadcrumbName: '流式输出公式绘制'
    },
    component: () => import('@/views/aiViews/latex/index.vue')
  },
  {
    path: '/aiViews/stream',
    name: 'stream',
    meta: {
      breadcrumbName: '流式输出'
    },
    component: () => import('@/views/aiViews/stream/index.vue')
  },
  {
    path: '/aiViews/streamDemo',
    name: 'streamDemo',
    meta: {
      breadcrumbName: '流式输出demo'
    },
    component: () => import('@/views/aiViews/streamDome/index.vue')
  }
]

export default routes