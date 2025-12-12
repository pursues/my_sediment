import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/jsViews/markdownPreview',
    name: 'markdownPreview',
    meta: {
      breadcrumbName: 'markdown编辑预览'
    },
    component: () => import('@/views/jsViews/markdownPreview/index.vue')
  },
  {
    path: '/jsViews/pdfPreview',
    name: 'pdfPreview',
    meta: {
      breadcrumbName: 'pdf预览'
    },
    component: () => import('@/views/jsViews/pdfPreview/index.vue')
  },
  {
    path: '/jsViews/iframePdfPreview',
    name: 'iframePdfPreview',
    meta: {
      breadcrumbName: 'iframe pdf预览'
    },
    component: () => import('@/views/jsViews/iframePdfPreview.vue/index.vue')
  },
  {
    path: '/jsViews/htmlEdit',
    name: 'htmlEdit',
    meta: {
      breadcrumbName: 'html编辑'
    },
    component: () => import('@/views/jsViews/htmlEdit/index.vue')
  },
  {
    path: '/jsViews/documentUpload',
    name: 'documentUpload',
    meta: {
      breadcrumbName: '文档上传'
    },
    component: () => import('@/views/jsViews/documentUpload/index.vue')
  },
  {
    path: '/jsViews/mouseCopy',
    name: 'mouseCopy',
    meta: {
      breadcrumbName: '鼠标复制文本图片等'
    },
    component: () => import('@/views/jsViews/mouseCopy/index.vue')
  },
  {
    path: '/jsViews/inputEnter',
    name: 'inputEnter',
    meta: {
      breadcrumbName: '高亮输入框'
    },
    component: () => import('@/views/jsViews/inputEnter/index.vue')
  }
]

export default routes