import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/businessViews/permission',
    name: 'permission',
    meta: {
      breadcrumbName: '权限管理'
    },
    redirect: '/businessViews/permission/user',
    component: () => import('@/views/businessViews/permission/index.vue'),
    children: [
      {
        path: '/businessViews/permission/user',
        name: 'permission-user',
        meta: {
          breadcrumbName: '用户管理'
        },
        component: () => import('@/views/businessViews/permission/User.vue')
      },
      {
        path: '/businessViews/permission/role',
        name: 'permission-role',
        meta: {
          breadcrumbName: '角色管理'
        },
        component: () => import('@/views/businessViews/permission/Role.vue')
      }
    ]
  }
]

export default routes