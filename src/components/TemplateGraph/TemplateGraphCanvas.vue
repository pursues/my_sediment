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
      <ElEmpty :image-size="100" :image="emptyImage"> </ElEmpty>
    </div>

    <!-- 图表内容 -->
    <template v-else>
      <div id="container" class="h-full" ref="graphContainerRef"></div>
      <GraphToolbar v-if="!isLoading" />
      <!-- 节点详情抽屉 -->
      <EntityTypeDetail v-model="isShowEntityTypeDetail" :node-data="(selectedNode as GraphNodeData)" />
    </template>
  </div>
</template>

<script setup lang="ts">
import GraphToolbar from '@/components/graph/GraphToolbar.vue'
import EntityTypeDetail from './EntityTypeDetail.vue'
import emptyImage from '@/assets/images/emptyImage.webp'
import { useGraphStore } from '@/store/graphStore'
import { storeToRefs } from 'pinia'
import useTemplateGraph from '@/hooks/templateGraph/useTemplateGraph'
import type { GraphNodeData } from '@/types/graph'

// 使用新的composable函数
const graphStore = useGraphStore()
const { isEmptyGraph, isLoading } = storeToRefs(graphStore)

const { graphContainerRef, isShowEntityTypeDetail, selectedNode } = useTemplateGraph()
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
