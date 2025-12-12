<script setup lang="ts">
import NavIndex from '@/components/CustomHeader/NavIndex.vue'
import Header from '@/components/CustomHeader/index.vue'
import Aside from '@/components/CustomAside/index.vue'
import { ref } from 'vue'



const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

</script>

<template>
  <div class="content h-full w-full flex">
    <el-container>
      <!-- 一级导航 -->
      <el-header class="nav-index-container">
        <NavIndex />
      </el-header>

      <el-container style="height: calc(100vh - 60px);">
        <!-- 二级导航 -->
        <el-aside>
          <Aside :isCollapsed="isCollapsed"/>
        </el-aside>

        <!-- 主内容 -->
        <el-container>
          <!-- 路径显示 -->
          <el-header><Header v-model:isCollapsed="isCollapsed" @toggleCollapse="toggleCollapse"/></el-header>
          <!-- 主容器 -->
          <el-main>
            <div 
              :class="'p-[20px]'" 
              class="main-content h-full w-full rounded-[12px] overflow-hidden bg-[#ffffff]">
              <RouterView />
            </div>
          </el-main>

        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
/* 如果需要自定义样式，可以在这里添加 */
.container {
  background-color: #ffffff;
}
</style>