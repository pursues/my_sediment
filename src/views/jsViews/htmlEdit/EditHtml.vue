<template>
  <div 
    ref="editHtmlContainer"
    class="edit-html" 
    v-html="renderHtml"
    @mouseover="debouncedMouseOver"
    @mouseout="debouncedMouseOut"
    @mouseleave="handleContainerLeave"
    @click="handleClick"
  >
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'

const props = defineProps<{
  htmlData: string,
}>()

// 容器引用
const editHtmlContainer = ref<HTMLElement | null>(null)
// 当前悬停的元素
const hoveredElement = ref<HTMLElement | null>(null)
// 当前编辑的元素
const editingElement = ref<HTMLElement | null>(null)
// 防抖定时器
const debounceTimer = ref<NodeJS.Timeout | null>(null)

// 防抖函数
const debounce = (func: Function, delay: number) => {
  return (...args: any[]) => {
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }
    debounceTimer.value = setTimeout(() => func(...args), delay)
  }
}

// 应用悬停样式
const applyHoverStyle = (element: HTMLElement) => {
  if (element && element !== editingElement.value) {
    element.style.border = '1px solid #1677FF'
    element.style.backgroundColor = '#FAFCFF'
  }
}

// 移除悬停样式
const removeHoverStyle = (element: HTMLElement) => {
  if (element && element !== editingElement.value) {
    element.style.border = '1px solid transparent'
    element.style.backgroundColor = ''
  }
}

// 鼠标移入处理（原始函数）
const handleMouseOver = (event: MouseEvent) => {
  
  const target = event.target as HTMLElement
  if (target && target !== event.currentTarget) {
    // 移除之前悬停元素的样式
    if (hoveredElement.value && hoveredElement.value !== target) {
      removeHoverStyle(hoveredElement.value)
    }
    
    // 移除所有父元素的hover样式，确保只有最内层元素有hover效果
    let parent = target.parentElement
    while (parent && parent !== event.currentTarget) {
      if (parent !== editingElement.value) {
        removeHoverStyle(parent)
      }
      parent = parent.parentElement
    }
    
    // 只有当前目标元素与之前的不同时才更新
    if (target !== hoveredElement.value) {
      hoveredElement.value = target
      applyHoverStyle(target)
    }
  }
}

// 鼠标移出处理（原始函数）
const handleMouseOut = (event: MouseEvent) => {
  
  const target = event.target as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  
  // 检查是否真的离开了元素（而不是进入子元素或父元素）
  if (target && target !== editingElement.value) {
    // 如果移动到的目标不是当前元素的子元素，且当前元素也不是移动目标的父元素
    const isMovingToChild = target.contains(relatedTarget)
    const isMovingToParent = relatedTarget && relatedTarget.contains(target)
    
    if (!isMovingToChild && !isMovingToParent && relatedTarget !== target) {
      removeHoverStyle(target)
      if (hoveredElement.value === target) {
        hoveredElement.value = null
      }
    }
  }
}

// 容器离开处理 - 清除所有悬停效果
const handleContainerLeave = () => {
  
  // 清除当前悬停元素的样式
  if (hoveredElement.value && hoveredElement.value !== editingElement.value) {
    removeHoverStyle(hoveredElement.value)
  }
  hoveredElement.value = null
  
  // 清除防抖定时器
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
    debounceTimer.value = null
  }
}

// 防抖处理的鼠标事件
const debouncedMouseOver = debounce(handleMouseOver, 50)
const debouncedMouseOut = debounce(handleMouseOut, 50)

// 点击处理 - 使元素可编辑
const handleClick = (event: MouseEvent) => {
  
  const target = event.target as HTMLElement
  if (target && target !== event.currentTarget) {
    event.preventDefault()
    
    // 如果点击的是已经在编辑的元素，不做处理
    if (target === editingElement.value) return
    
    // 清除防抖定时器，避免在点击时还有延迟的样式变化
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
      debounceTimer.value = null
    }
    
    // 结束之前的编辑
    if (editingElement.value) {
      editingElement.value.contentEditable = 'false'
      editingElement.value.style.border = '1px solid transparent'
      editingElement.value.style.backgroundColor = ''
      editingElement.value.blur()
    }
    
    // 开始新的编辑
    editingElement.value = target
    target.contentEditable = 'true'
    target.style.border = '1px solid #1677FF'
    target.style.backgroundColor = '#FAFCFF'
    target.focus()
    
    // 监听失去焦点事件
    const handleBlur = () => {
      if (editingElement.value === target) {
        target.contentEditable = 'false'
        target.style.border = '1px solid transparent'
        target.style.backgroundColor = ''
        editingElement.value = null
      }
      target.removeEventListener('blur', handleBlur)
    }
    target.addEventListener('blur', handleBlur)
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
    debounceTimer.value = null
  }
})
const renderHtml = computed(() => {
  return props.htmlData ? props.htmlData : `<div data-v-d3f63c61="" class="markdown-content"><h1 style="">2020 Pedagogicon Proceedings</h1></div>`
})


// 获取编辑后的HTML内容
const getContent = () => {
  if (editHtmlContainer.value) {
    // 在获取内容前，结束当前的编辑状态
    if (editingElement.value) {
      editingElement.value.contentEditable = 'false'
      editingElement.value.style.border = '1px solid transparent'
      editingElement.value.style.backgroundColor = ''
      editingElement.value.blur()
      editingElement.value = null
    }
    
    // 返回容器中的实际HTML内容（包含用户的编辑）
    return editHtmlContainer.value.innerHTML
  }
  
  // 如果容器还没有渲染，返回原始内容
  return renderHtml.value
}

// 获取编辑后的纯文本内容
const getTextContent = () => {
  if (editHtmlContainer.value) {
    // 结束编辑状态
    if (editingElement.value) {
      editingElement.value.contentEditable = 'false'
      editingElement.value.style.border = '1px solid transparent'
      editingElement.value.style.backgroundColor = ''
      editingElement.value.blur()
      editingElement.value = null
    }
    
    // 返回纯文本内容
    return editHtmlContainer.value.textContent || ''
  }
  
  return ''
}

defineExpose({
  getContent,
  getTextContent
})




</script>
<style scoped lang="scss">
.edit-html {
  width: 100%;
  height: 100%;
  overflow: auto;
  
  // 编辑模式下的通用样式
  :deep(*[contenteditable="true"]) {
    outline: none !important;
    cursor: text !important;
    
    &:focus {
      border: 1px solid #1677FF !important;
      background-color: #FAFCFF !important;
      box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1) !important;
    }
  }
  
  // 悬停样式的过渡效果
  :deep(*) {
    outline: none !important; // 清除默认outline，防止黑边
    transition: border 0.1s ease, background-color 0.1s ease, box-shadow 0.1s ease;
    border-radius: 2px;
    position: relative;
    border: 1px solid transparent; // 设置透明边框，为过渡做准备
    
    // 只在编辑模式下显示指针光标
    &:hover {
      cursor: pointer;
    }
  }
  
  // 减少子元素的事件冒泡造成的抖动
  :deep(*) {
    &:not([contenteditable="true"]) {
      &:hover {
        // 确保不会干扰子元素的事件
        pointer-events: auto;
      }
    }
  }
  
  // 确保编辑元素有合适的最小高度
  :deep(p[contenteditable="true"]),
  :deep(h1[contenteditable="true"]),
  :deep(h2[contenteditable="true"]),
  :deep(h3[contenteditable="true"]),
  :deep(h4[contenteditable="true"]),
  :deep(h5[contenteditable="true"]),
  :deep(h6[contenteditable="true"]),
  :deep(li[contenteditable="true"]),
  :deep(td[contenteditable="true"]),
  :deep(th[contenteditable="true"]) {
    min-height: 20px;
    padding: 4px;
  }
  
  // 表格单元格编辑样式
  :deep(table) {
    td, th {
      &[contenteditable="true"] {
        background-color: #FAFCFF !important;
        border: 1px solid #1677FF !important;
      }
    }
  }
  
  // 列表编辑样式
  :deep(ul, ol) {
    li {
      &[contenteditable="true"] {
        margin: 2px 0;
        list-style-position: inside;
      }
    }
  }
}
</style>