<template>
  <div class="edit-markdown">
    <!-- 工具栏 -->
    <div  class="editor-toolbar">
      <div class="toolbar-group">
        <button @click="insertMarkdown('**', '**')" class="toolbar-btn" title="粗体">
          <strong>B</strong>
        </button>
        <button @click="insertMarkdown('*', '*')" class="toolbar-btn" title="斜体">
          <em>I</em>
        </button>
        <button @click="insertMarkdown('# ')" class="toolbar-btn" title="标题">H1</button>
        <button @click="insertMarkdown('- ')" class="toolbar-btn" title="列表">•</button>
        <button @click="insertMarkdown('`', '`')" class="toolbar-btn" title="代码">
          &lt;/&gt;
        </button>
        <button @click="insertMarkdown('[', '](url)')" class="toolbar-btn" title="链接">🔗</button>
      </div>
      <div class="view-toggle">
        <button 
          @click="currentView = 'edit'" 
          :class="{ active: currentView === 'edit' }"
          class="toggle-btn"
        >
          编辑模式
        </button>
        <button 
          @click="currentView = 'preview'" 
          :class="{ active: currentView === 'preview' }"
          class="toggle-btn"
        >
          预览模式
        </button>
        <button 
          @click="currentView = 'split'" 
          :class="{ active: currentView === 'split' }"
          class="toggle-btn"
        >
          分屏
        </button>
      </div>
    </div>
    
    <!-- 编辑器内容区域 -->
    <div class="editor-content" :class="currentView">
      <!-- 编辑区域 -->
      <div v-show="currentView === 'edit' || currentView === 'split'" class="edit-panel">
        <textarea
          ref="textareaRef"
          v-model="markdownText"
          class="markdown-textarea"
          placeholder="在此输入 Markdown 内容..."
          @input="handleInput"
          @keydown="handleKeydown"
        ></textarea>
      </div>
      
      <!-- 预览区域 -->
      <div v-show="currentView === 'preview' || currentView === 'split'" class="preview-panel">
        <div class="markdown-preview" v-html="previewHtml"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'

// Props
interface Props {
  markdownContent: string
}

const props = withDefaults(defineProps<Props>(), {
  markdownContent: ''
})

// Emits
const emit = defineEmits<{
  save: [content: string]
  cancel: []
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const markdownText = ref(props.markdownContent)
// 还有一个切换分屏模式，但是暂时不实现
const currentView = ref<'edit' | 'preview' | 'split'>('split')

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

// 计算预览内容
const previewHtml = computed(() => {
  return md.render(markdownText.value)
})

// 插入 Markdown 语法
const insertMarkdown = (before: string, after = '') => {
  if (!textareaRef.value) return
  
  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = markdownText.value.substring(start, end)
  
  const newText = before + selectedText + after
  const beforeText = markdownText.value.substring(0, start)
  const afterText = markdownText.value.substring(end)
  
  markdownText.value = beforeText + newText + afterText
  
  // 设置新的光标位置
  nextTick(() => {
    const newCursorPos = start + before.length + selectedText.length + after.length
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

// 处理输入事件
const handleInput = () => {
  // 实时更新预览
}

// 处理按键事件
const handleKeydown = (event: KeyboardEvent) => {
  // Tab 键插入空格
  if (event.key === 'Tab') {
    event.preventDefault()
    // insertMarkdown('  ')
  }
  
  // Ctrl+S 保存
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    handleSave()
  }
  
  // Esc 取消
  if (event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
  }
}

// 获取编辑器内容
const getContent = () => {
  return markdownText.value
}

// 保存内容
const handleSave = () => {
  emit('save', markdownText.value)
}

// 取消编辑
const handleCancel = () => {
  emit('cancel')
}

// 暴露方法给父组件
defineExpose({
  getContent,
  handleSave,
  handleCancel
})
</script>

<style scoped lang="scss">
.edit-markdown {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  
  .editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid #e4e7ed;
    background-color: #fafbfc;
    flex-shrink: 0;
    
    .toolbar-group {
      display: flex;
      gap: 4px;
    }
    
    .toolbar-btn {
      width: 32px;
      height: 32px;
      border: 1px solid #dcdfe6;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: all 0.2s;
      
      &:hover {
        background-color: #f5f7fa;
        border-color: #409eff;
      }
    }
    
    .view-toggle {
      display: flex;
      gap: 0;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .toggle-btn {
      padding: 6px 12px;
      border: none;
      background: white;
      cursor: pointer;
      font-size: 12px;
      color: #606266;
      transition: all 0.2s;
      
      &:not(:last-child) {
        border-right: 1px solid #dcdfe6;
      }
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      &.active {
        background-color: #409eff;
        color: white;
      }
    }
  }
  
  .editor-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    
    &.edit {
      .edit-panel {
        width: 100%;
      }
    }
    
    &.preview {
      .preview-panel {
        width: 100%;
      }
    }
    
    &.split {
      .edit-panel,
      .preview-panel {
        width: 50%;
      }
      
      .edit-panel {
        border-right: 1px solid #e4e7ed;
      }
    }
  }
  
  .edit-panel {
    display: flex;
    flex-direction: column;
    
    .markdown-textarea {
      flex: 1;
      border: none;
      outline: none;
      padding: 16px;
      font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.6;
      resize: none;
      background-color: white;
      color: #303133;
      
      &::placeholder {
        color: #c0c4cc;
      }
    }
  }
  
  .preview-panel {
    overflow-y: auto;
    background-color: white;
    
    .markdown-preview {
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      
      // 标题样式
      :deep(h1) {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 20px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #e1e4e8;
        color: #24292e;
      }
      
      :deep(h2) {
        font-size: 22px;
        font-weight: 600;
        margin: 24px 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid #e1e4e8;
        color: #24292e;
      }
      
      :deep(h3) {
        font-size: 18px;
        font-weight: 600;
        margin: 20px 0 12px 0;
        color: #24292e;
      }
      
      // 段落样式
      :deep(p) {
        margin: 0 0 16px 0;
        font-size: 14px;
        line-height: 1.7;
      }
      
      // 列表样式
      :deep(ul), :deep(ol) {
        margin: 0 0 16px 0;
        padding-left: 24px;
        
        li {
          margin: 8px 0;
          font-size: 14px;
          line-height: 1.6;
        }
      }
      
      // 代码样式
      :deep(code) {
        padding: 2px 4px;
        background-color: #f6f8fa;
        border-radius: 3px;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 12px;
        color: #24292e;
      }
      
      :deep(pre) {
        padding: 16px;
        background-color: #f6f8fa;
        border-radius: 6px;
        overflow-x: auto;
        margin: 16px 0;
        
        code {
          padding: 0;
          background-color: transparent;
          border-radius: 0;
          font-size: 12px;
        }
      }
      
      // 引用样式
      :deep(blockquote) {
        margin: 16px 0;
        padding: 0 16px;
        border-left: 4px solid #d0d7de;
        background-color: #f6f8fa;
        color: #656d76;
        
        p {
          margin: 8px 0;
          font-style: italic;
        }
      }
      
      // 表格样式
      :deep(table) {
        width: 100%;
        margin: 16px 0;
        border-collapse: collapse;
        
        th, td {
          padding: 8px 12px;
          border: 1px solid #d0d7de;
          text-align: left;
          font-size: 14px;
        }
        
        th {
          background-color: #f6f8fa;
          font-weight: 600;
        }
      }
      
      // 强调样式
      :deep(strong) {
        font-weight: 600;
        color: #24292e;
      }
      
      :deep(em) {
        font-style: italic;
      }
      
      // 链接样式
      :deep(a) {
        color: #0969da;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      // 分割线
      :deep(hr) {
        height: 0;
        margin: 24px 0;
        background-color: #e1e4e8;
        border: 0;
        border-bottom: 1px solid #e1e4e8;
      }
    }
  }
}
</style> 