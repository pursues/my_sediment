<template>
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-x-[12px]">
      <ElButton :icon="ArrowLeft" style="padding: 9px"></ElButton>
      <h2 class="text-[18px] font-[600] text-[#303133]">模板可视化</h2>
    </div>
    <div class="flex items-center gap-x-[8px]" v-if="!isEmptyGraph">
      <TemplateSearchBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import TemplateSearchBar from './TemplateSearchBar.vue'
import { storeToRefs } from 'pinia'
import { useGraphStore } from '@/store/graphStore'
import { ArrowLeft } from '@element-plus/icons-vue'

const graphStore = useGraphStore()
const { isEmptyGraph } = storeToRefs(graphStore)
</script>

<style scoped lang="scss"></style>
