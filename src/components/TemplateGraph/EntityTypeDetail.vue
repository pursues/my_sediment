<template>
  <ContainerDrawer
    :visible="modelValue"
    @update:visible="emits('update:modelValue', $event)"
    :title="nodeData ? `实体节点：${String(nodeData.label || nodeData.id || '')}` : '实体节点'"
    width="400px"
    :close-on-click-modal="false"
  >
    <div>
      <h2>实体类型</h2>
    </div>
  </ContainerDrawer>
</template>

<script setup lang="ts">
import type { GraphNodeData } from '@/types/graph'
import ContainerDrawer from '../common/ContainerDrawer.vue'

defineProps<{
  modelValue: boolean
  nodeData: GraphNodeData | null
}>()
const emits = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped lang="scss">
// 这个组件主要作为容器，样式由子组件处理
</style>
