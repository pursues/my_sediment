<template>
  <div class="search-container">
    <el-input
      placeholder="搜索关键词"
      style="width: 240px"
      clearable
      v-model="searchKeyword"
      @input="handleSearchDebounce"
      @focus="handleFocus"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { useMemoryGraphStore } from '@/store/memoryGraphStore'
import { storeToRefs } from 'pinia'
import { debounce } from '@/utils/common'

const memoryGraphStore = useMemoryGraphStore()
const { searchKeyword, isLoadingSearchList } = storeToRefs(memoryGraphStore)

const handleSearchDebounce = debounce(async (value: string) => {
  memoryGraphStore.updateSearchKeyword(value)
  isLoadingSearchList.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  memoryGraphStore.updateSearchResults([
    {
      id: '1',
      source: '电机过热',
      target: '电机焦味',
      relation: '[:CAUSES]',
      description: '原因： 电机过热；描述： 导致绝缘降低'
    },
    {
      id: '2',
      source: '电机过热',
      target: '电机焦味',
      relation: '[:CAUSES]',
      description: '原因： 电机过热；描述： 导致绝缘降低'
    }
  ])
  isLoadingSearchList.value = false
}, 200)

const handleFocus = debounce(() => {
  if (searchKeyword.value.trim()) {
    memoryGraphStore.openSearchList()
  }
}, 100)
</script>

<style scoped lang="scss">
.search-container {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.search-item:hover {
  background-color: #f5f5f5;
}

.search-item:last-child {
  border-bottom: none;
}
</style>
