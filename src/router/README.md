# 路由守卫系统

本目录包含了应用的路由配置和守卫系统，用于管理导航栏状态和路由跳转逻辑。

## 文件结构

```
src/router/
├── index.ts          # 主路由配置文件
├── guards.ts         # 路由守卫钩子文件 ⭐️ 新增
├── business.ts       # 业务相关路由
├── jsviews.ts        # JS相关路由
├── cssviews.ts       # CSS相关路由
├── aiviews.ts        # AI相关路由
└── README.md         # 说明文档
```

## 路由守卫功能

### 🚀 主要功能

1. **路由跳转后自动更新导航栏** - 在每次路由跳转后自动更新顶部和左侧导航栏数据
2. **页面刷新状态恢复** - 在页面刷新后恢复正确的导航栏状态
3. **路由错误处理** - 统一处理路由相关的错误

### 📋 核心方法

#### `setupRouterGuards(router: Router)`
设置路由守卫，包括：
- **beforeEach**: 路由跳转前守卫（可用于权限验证）
- **afterEach**: 路由跳转后守卫（更新导航栏数据）
- **onError**: 路由错误处理


#### `updateNavigationData(currentPath, userStore)`
更新导航栏数据的核心方法：
- 提取顶级路径（如 `/jsViews/htmlEdit` → `/jsViews`）
- 调用 userStore 的方法更新导航栏
- 处理首次加载和刷新的情况

## 使用方式

### 1. 自动使用（已配置）

路由守卫已经在 `src/router/index.ts` 中自动配置：

```typescript
import { setupRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 自动设置路由守卫
setupRouterGuards(router)
```

### 2. 刷新恢复（已配置）

在 `src/main.ts` 中已经配置了刷新后的状态恢复：

## 工作流程

### 应用初次加载流程（包括刷新）
```
应用启动/刷新 → afterEach → 检测未初始化 → updateNavigationData → 标记已初始化
```

### 普通路由跳转流程
```
用户点击导航 → beforeEach → 路由跳转 → afterEach → 检测已初始化 → 跳过导航栏更新
```


## 与 UserStore 的集成

路由守卫与 `src/store/userStore.ts` 紧密集成：

```typescript
// userStore 提供的方法
- routerList          // 顶部导航栏数据
- leftNavRouterList   // 左侧导航栏数据
- setNavActive(path)        // 设置顶部导航栏
- setLeftNavRouterList(path) // 设置左侧导航栏
```

## 调试信息

路由守卫包含详细的控制台日志，便于调试：

```javascript
// 路由跳转日志
console.log('路由跳转前:', from.path, '->', to.path)
console.log('路由跳转后:', from.path, '->', to.path)

// 导航栏更新日志
console.log('开始更新导航栏数据, 当前路径:', currentPath)
console.log('导航栏数据更新成功')
console.log('顶部导航:', userStore.routerList?.length || 0, '个')
console.log('左侧导航:', userStore.leftNavRouterList?.length || 0, '个')
```

## 扩展功能

如需添加其他路由守卫功能，可以在 `guards.ts` 中扩展：

```typescript
// 在 setupRouterGuards 中添加
router.beforeEach(async (to, from, next) => {
  // 添加权限验证
  // 添加登录检查
  // 添加页面标题设置
  next()
})
```

## 注意事项

1. **依赖关系**: 依赖 `userStore` 和 `WaitFor` 工具类
2. **错误处理**: 所有操作都包含 try-catch 错误处理
3. **性能优化**: 使用防抖和条件检查避免不必要的更新
4. **类型安全**: 使用 TypeScript 确保类型安全