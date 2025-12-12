<template>
  <div class="drag-container">
    <div class="drag-item-left" :style="{ width: `${chatWidth}%` }">
      <div class="drag-item-content">
        <div class="drag-item-content-title">
          <h1>左侧</h1>
        </div>
      </div>
    </div>
    <div class="drag-item-right" :style="{ width: `${codeWidth}%` }">
      <div class="resize-handle" @mousedown="handleMouseDown"></div>
      <div class="drag-item-content">
        <div class="drag-item-content-title">
          <h1>右侧</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 设置元素左右拖动拖动调整宽度相关
const isDragging = ref(false)
const chatWidth = ref(40) // 初始宽度百分比
const minChatWidth = 20 // 最小宽度百分比
const maxChatWidth = 80 // 最大宽度百分比


// 拖动开始
const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 拖动中
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  const container = document.querySelector('.drag-container') as HTMLElement
  if (!container) return
  
  const containerRect = container.getBoundingClientRect()
  const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
  
  // 限制宽度范围
  if (newWidth >= minChatWidth && newWidth <= maxChatWidth) {
    chatWidth.value = newWidth
  }
}

// 拖动结束
const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 计算code-content的宽度
const codeWidth = computed(() => {
  return 100 - chatWidth.value
})
</script>

<style lang="scss" scoped>
.drag-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  .drag-item-left {
    height: 100%;
    background-color: #f1f2f5;
  }
  .drag-item-right {
    height: 100%;
    background-color: lightcyan;
    position: relative;
    .resize-handle {
      position: absolute;
      left: 0;
      top: 0;
      width: 2px;
      height: 100%;
      background: #4C4D4F;
      cursor: col-resize;
      z-index: 10;
      transition: background-color 0.2s;
      
      &:hover {
        background: #008858;
      }
      
      &:active {
        background: #006644;
      }
    }
  }
}

</style>