<template>
    <div class="memory-graph-container">
      <!-- 顶部工具栏 -->
      <GraphHeader />
  
      <!-- 图谱容器 -->
      <GraphCanvas> </GraphCanvas>
  
      <!-- 新建实体弹窗 -->
      <EntityDialog />
    </div>
  </template>
  
  <script setup lang="ts">
  import GraphHeader from '@/components/memoryGraph/GraphHeader.vue'
  import GraphCanvas from '@/components/memoryGraph/GraphCanvas.vue'
  import EntityDialog from '@/components/memoryGraph/EntityDialog.vue'

  </script>
  
  <style scoped lang="scss">
  .memory-graph-container {
    height: 100%;
  }
  </style>
  