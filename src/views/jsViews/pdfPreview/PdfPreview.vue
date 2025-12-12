<template>
  <div class="pdf-preview">
    <div v-if="!error" class="pdf-content">
      <!-- PDF渲染容器 -->
       <div class="pdf-container-box" ref="scrollContainerRef">
        
        <div class="pdf-container" ref="containerRef">
        </div>
       </div>
      
      <!-- 控制栏 -->
      <div class="control-bar">
        <div class="control-group">
          <!-- 分页控制 -->
          <el-button 
            size="small"
            @click="handlePrevPage"
            :disabled="currentPage <= 1"
          >◀</el-button>
          <div class="page-input-container">
            <el-input 
              v-model="pageInputValue"
              size="small"
              @keyup.enter="handlePageJump"
              @blur="handlePageJump"
              class="page-input"
            />
            <span class="page-separator">/</span>
            <span class="total-pages">{{ totalPages }}</span>
          </div>
          <el-button 
            size="small"
            @click="handleNextPage"
            :disabled="currentPage >= totalPages"
          >▶</el-button>
        </div>
        <div class="line"></div>
        <div class="control-group">
          <img 
            @click="handleZoomOut" 
            :disabled="scale <= 0.5" 
            src="@/assets/icons/zoom-out-line.svg" 
            alt="zoom-out" 
            class="zoom-icon" 
            />
          <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
          <img 
            @click="handleZoomIn" 
            :disabled="scale >= 3" 
            src="@/assets/icons/zoom-in-line.svg" 
            alt="zoom-in" 
            class="zoom-icon" 
            />
        </div>

        <!-- 全屏按钮 -->
        <!-- <div class="control-group">
          <el-button 
            :icon="FullScreen"
            size="small"
            circle
            @click="handleFullScreen"
          />
        </div> -->
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <p>正在加载PDF文件...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-alert
        :title="error"
        type="error"
        show-icon
        :closable="false"
      />
      <el-button @click="retryLoad" style="margin-top: 16px;">重新加载</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'


import usePdfPreview from '@/hooks/document/usePdfPreview'


interface Props {
  pdfUrl: string
  initialScale?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialScale: 1.0
})

const { 
  containerRef,
  scrollContainerRef,
  scale, 
  handleZoomIn, 
  handleZoomOut,
  handlePrevPage,
  handleNextPage,
  handlePageJump,
  loading,
  error,
  currentPage,
  totalPages,
  pageInputValue,
  retryLoad,
  updatePdfUrl
} = usePdfPreview(props.pdfUrl,props.initialScale)

// 监听PDF URL变化
watch(
  () => props.pdfUrl,
  async (newUrl) => {
    console.log('PDF URL变化:', newUrl)
    updatePdfUrl(newUrl)
  }
)
</script>

<style scoped lang="scss">
.pdf-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.pdf-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pdf-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pdf-container-box {
  flex: 1;
  overflow: auto;
  background: #f8f9fa;
  position: relative;
}

.pdf-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  transition: transform 0.2s ease;
  transform-origin: top left;
  min-height: 100%;
  
  :deep(.pdf-page-container) {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 16px;
    }
    
    .pdf-canvas {
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      background: white;
      display: block;
      width: 100%;
      height: auto;
      border: 1px solid #e9ecef;
      transition: box-shadow 0.2s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }
    }
  }
}

.control-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto;
  width: 340px;
  padding: 8px 12px;
  background: white;
  border-top: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  gap: 12px;
  border-radius: 50px;

  .line{
    width: 1px;
    height: 20px;
    background: #e9ecef;
  }

  
  .control-group {
    display: flex;
    align-items: center;
    gap: 8px;
    .el-button{
      border:none;
      transform: scale(0.8,1.2);
    }
    .zoom-icon{
      cursor: pointer;
    }
    .zoom-level {
      font-size: 13px;
      color: #495057;
      font-weight: 500;
      min-width: 45px;
      text-align: center;
    }
    
    .page-input-container {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .page-input {
        width: 50px;
        
        :deep(.el-input__wrapper) {
          padding: 0 8px;
          border-radius: 4px;
          box-shadow: 0 0 0 1px #d0d7de;
          
          .el-input__inner {
            text-align: center;
            font-size: 13px;
            height: 24px;
            line-height: 24px;
          }
        }
      }
      
      .page-separator {
        color: #6c757d;
        font-size: 13px;
        margin: 0 2px;
      }
      
      .total-pages {
        color: #6c757d;
        font-size: 13px;
        font-weight: 500;
      }
    }
  }
}

.loading-container,
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  
  .el-icon {
    font-size: 24px;
    margin-bottom: 16px;
    color: #409eff;
  }
  
  p {
    color: #606266;
    font-size: 14px;
  }
}

// 全屏样式
:global(.pdf-container-box:fullscreen) {
  background: #000;
  
  .pdf-container {
    background: #000;
  }
}
</style> 