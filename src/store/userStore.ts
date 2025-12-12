import { defineStore } from 'pinia'
import { ref,computed } from 'vue'
import { useRouteList } from '@/router/index'
import type { RouteRecordRaw } from 'vue-router'

export const useUserStore = defineStore('useUserStore', () => {
  
  // 获取路由列表
  const routerList = computed<RouteRecordRaw[]>(() => {
    return useRouteList || []
  })
  // 当前一级路由
  const navActive = ref(routerList.value[0].path)


  // 当前二级路由,默认取第一个
  const leftNavRouterList = ref<RouteRecordRaw[]>(routerList.value[0].children || [])


  // 初始化路由
  const initRouter = () => {
    navActive.value = routerList.value[0].path
    leftNavRouterList.value = routerList.value[0].children || []
  }

  // 设置当前一级路由
  const setNavActive = (path: string) => {
    navActive.value = path
  }

  // 设置当前二级路由
  const setLeftNavRouterList = (path: string) => {
    leftNavRouterList.value = routerList.value.find(item => item.path === path)?.children || []
  }

  return { 
    routerList,
    navActive,
    initRouter,
    setNavActive,
    leftNavRouterList,
    setLeftNavRouterList
  }
})