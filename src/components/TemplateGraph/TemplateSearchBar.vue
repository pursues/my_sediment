<template>
  <div class="search-container">
    <el-input placeholder="搜索关键词" style="width: 240px" clearable>
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
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
