<template>
  <div class="custom-toolbar">
    <button class="toolbar-btn" @click="graphStore.zoomIn" :title="'放大'">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
          stroke="#303133"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M17.5 17.5L13.875 13.875"
          stroke="#303133"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9.16667 6.66667V11.6667"
          stroke="#303133"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M6.66667 9.16667H11.6667"
          stroke="#303133"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <div class="zoom-display">{{ zoomLevel }}%</div>
    <button class="toolbar-btn" @click="graphStore.zoomOut" :title="'缩小'">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
          stroke="#303133"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M17.5 17.5L13.875 13.875"
          stroke="#303133"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M6.66667 9.16667H11.6667"
          stroke="#303133"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGraphStore } from '@/store/graphStore'
import { storeToRefs } from 'pinia'

const graphStore = useGraphStore()
const { zoomLevel } = storeToRefs(graphStore)
</script>

<style scoped lang="scss">
.custom-toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  min-width: 141px;
  width: auto;
  height: 46px;
  border-radius: 50px;
  opacity: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
  background: #ffffff;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.zoom-display {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  padding: 0 4px;
  min-width: 40px;
  text-align: center;
  user-select: none;
}
</style>
