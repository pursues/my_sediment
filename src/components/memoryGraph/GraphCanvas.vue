<template>
  <div class="graph-wrapper">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="h-full flex items-center justify-center">
      <ElSkeleton animated>
        <template #template>
          <div class="flex items-center justify-center h-full">
            <ElSkeletonItem variant="text" style="width: 200px; height: 30px" />
          </div>
        </template>
      </ElSkeleton>
    </div>

    <!-- 空状态 -->
    <div v-if="isEmptyGraph" class="h-full flex items-center justify-center">
      <ElEmpty :image-size="100" :image="emptyImage">
        <template #description>
          <p class="flex items-center text-[14px]">
            <span class="text-[#303133]">暂无记忆图谱，请先去</span>
            <RouterLink to="/memory-extract" class="flex items-center ml-[4px]">
              <ElButton type="primary" link>创建抽取记忆任务</ElButton>
            </RouterLink>
          </p>
        </template>
      </ElEmpty>
    </div>

    <!-- 图表内容 -->
    <template v-else>
      <div id="container" class="h-full" ref="graphContainerRef"></div>
      <GraphToolbar v-if="!isLoading" />
      <!-- 节点详情抽屉 -->
      <EntityDrawer v-model="entityDrawerVisible" :node-data="selectedNode" />
      <SearchList v-model="isShowSearchList" />
    </template>
  </div>
</template>

<script setup lang="ts">
import GraphToolbar from '@/components/graph/GraphToolbar.vue'
import useMemoryGraph from '@/hooks/memoryGraph/useMemoryGraph'
import emptyImage from '@/assets/images/emptyImage.webp'
import { useGraphStore } from '@/store/graphStore'
import { useMemoryGraphStore } from '@/store/memoryGraphStore'
import { storeToRefs } from 'pinia'

// 使用新的composable函数
const { graphContainerRef } = useMemoryGraph()
const graphStore = useGraphStore()
const { isEmptyGraph, isLoading } = storeToRefs(graphStore)
const memoryGraphStore = useMemoryGraphStore()
const { entityDrawerVisible, selectedNode, isShowSearchList } = storeToRefs(memoryGraphStore)
</script>

<style scoped lang="scss">
.graph-wrapper {
  width: 100%;
  height: calc(100% - 48px);
  position: relative;
  margin-top: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  overflow: hidden;
}
</style>
