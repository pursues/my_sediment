import type { Router } from 'vue-router'
import { useUserStore } from '@/store/userStore'

// 全局状态标记，用于区分是否是应用初次加载
let isAppInitialized = false

/**
 * 路由守卫配置
 * 用于处理路由跳转后的逻辑，包括导航栏数据的更新
 */
export function setupRouterGuards(router: Router) {
  
  // 路由跳转前守卫
  router.beforeEach(async (_to, _from, next) => {
    // 可以在这里添加权限验证、登录检查等逻辑
    // console.log('路由跳转前:', _from.path, '->', _to.path)
    next()
  })

  // 路由跳转后守卫 - 主要用于应用初次加载时更新导航栏
  router.afterEach(async (to, _from) => {
    // console.log('路由跳转后:', _from.path, '->', to.path)
    
    try {
      // 只在应用初次加载时更新导航栏
      if (!isAppInitialized) {
        console.log('检测到应用初次加载，更新导航栏数据')
        
        // 获取 userStore 实例
        const userStore = useUserStore()
        
        // 更新导航栏数据
        await updateNavigationData(to.path, userStore)
        
        // 标记应用已初始化
        isAppInitialized = true
      }
      
    } catch (error) {
      console.error('路由跳转后处理导航栏数据失败:', error)
    }
  })

  // 路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
  })
}

/**
 * 更新导航栏数据
 * @param currentPath 当前路由路径
 * @param userStore 用户store实例
 */
async function updateNavigationData(currentPath: string, userStore: any) {
  try {
    console.log('开始更新导航栏数据, 当前路径:', currentPath)
    
    // 提取顶级路径 (例如: /jsViews/htmlEdit -> /jsViews)
    const topLevelPath = getTopLevelPath(currentPath)
    // 设置顶部导航栏
    userStore.setNavActive(topLevelPath)
    
    // 更新左侧导航栏数据
    userStore.setLeftNavRouterList(topLevelPath)
    
    // 如果是刷新页面或首次加载，初始化路由
    if (!userStore.leftNavRouterList?.length) {
      console.log('初始化路由')
      await userStore.initRouter()
    }
    
    
  } catch (error) {
    console.error('更新导航栏数据失败:', error)
    throw error
  }
}

/**
 * 重置应用初始化状态
 * 用于测试或特殊情况下重新初始化
 */
export function resetAppInitialization() {
  isAppInitialized = false
  console.log('应用初始化状态已重置')
}

/**
 * 手动触发导航栏更新
 * 用于特殊情况下需要强制更新导航栏
 */
export async function forceUpdateNavigation(currentPath?: string) {
  try {
    const userStore = useUserStore()
    const path = currentPath || window.location.pathname
    console.log('手动触发导航栏更新:', path)
    await updateNavigationData(path, userStore)
  } catch (error) {
    console.error('手动更新导航栏失败:', error)
  }
}

/**
 * 获取顶级路径
 * 例如: /jsViews/htmlEdit/detail -> /jsViews
 * @param path 完整路径
 * @returns 顶级路径
 */
function getTopLevelPath(path: string): string {
  if (!path || path === '/') return '/'
  
  const pathSegments = path.split('/').filter(segment => segment.length > 0)
  
  if (pathSegments.length === 0) return '/'
  
  return '/' + pathSegments[0]
}

/**
 * 页面刷新后的导航栏恢复
 * 在应用启动时调用，用于恢复刷新前的导航状态
 */
// export async function restoreNavigationOnRefresh() {
//   try {
//     console.log('开始恢复刷新后的导航栏状态')
    
//     const userStore = useUserStore()
    
//     // 初始化路由和导航栏数据
//     await userStore.initRouter()
    
//     console.log('导航栏状态恢复成功')
    
//   } catch (error) {
//     console.error('恢复导航栏状态失败:', error)
//   }
// }