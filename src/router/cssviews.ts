import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/cssViews/scale',
    name: 'scale',
    meta: {
      breadcrumbName: 'scale布局'
    },
    component: () => import('@/views/cssViews/scale/index.vue')
  },
  {
    path: '/cssViews/elementDrag',
    name: 'elementDrag',
    meta: {
      breadcrumbName: '元素拖动'
    },
    component: () => import('@/views/cssViews/elementDrag/index.vue')
  },
  {
    path: '/cssViews/cssEffect',
    name: 'cssEffect',
    meta: {
      breadcrumbName: '一些样式效果'
    },
    component: () => import('@/views/cssViews/cssEffect/index.vue')
  }
]

export default routes