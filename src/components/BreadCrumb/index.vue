<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item 
      @click="handleBreadcrumbClick(item)"
      v-for="(item, index) in breadcrumbList" 
      :key="index"
      :to="item.path"
    >
      <span class="cursor-pointer text-[14px] font-normal leading-[20px]" :style="{color: index === breadcrumbList.length - 1 ? '#303133' : '#909399'}">{{ item.name }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface BreadcrumbItem {
  name: string
  path: string
}

const route = useRoute()
const router = useRouter()
const breadcrumbList = ref<BreadcrumbItem[]>([])

const handleBreadcrumbClick = (item: BreadcrumbItem) => {
  router.push(item.path)
}

// 生成面包屑数据
const generateBreadcrumb = () => {
  const matched = route.matched
  const breadcrumbs: BreadcrumbItem[] = []
  
  // 遍历匹配的路由，添加有breadcrumbName的路由
  matched.forEach(item => {
    if (item.meta?.breadcrumbName) {
      breadcrumbs.push({
        name: item.meta.breadcrumbName as string,
        path: item.path
      })
    }
  })
  
  breadcrumbList.value = breadcrumbs
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    generateBreadcrumb()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.el-breadcrumb {
  font-size: 14px;
  color: #000000;
  
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: #606266;
      text-decoration: none;
      
      &:hover {
        color: #409eff;
      }
    }
    
    &:last-child {
      .el-breadcrumb__inner {
        color: #000000;
        font-weight: 500;
      }
    }
  }
}
</style>
