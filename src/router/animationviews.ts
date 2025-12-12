import { RouteRecordRaw } from 'vue-router'
const routes: RouteRecordRaw[] = [
  {
    path: '/animationViews/memory-graph',
    name: 'memory-graph',
    meta: {
      breadcrumbName: '基于G6的记忆图谱'
    },
    component: () => import('@/views/animationViews/memoryGraph/index.vue'),
    redirect: '/animationViews/memory-graph/index',
    children: [
      {
        path: '/animationViews/memory-graph/index',
        name: '记忆图谱',
        component: () => import('@/views/animationViews/memoryGraph/MemoryGraph.vue')
      },
      {
        path: '/animationViews/memory-graph/history',
        name: '记忆图谱历史版本',
        component: () => import('@/views/animationViews/memoryGraph/history.vue')
      }
    ]
  }
]

export default routes