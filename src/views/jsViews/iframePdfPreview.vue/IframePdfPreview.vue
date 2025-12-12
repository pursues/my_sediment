<template>
  <div class="pdf-preview">
    <div v-if="!loading && !error" class="pdf-content">
      <!-- PDF渲染容器 -->
       <div class="pdf-container-box" ref="iframeContainerRef">
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
            :disabled="false" 
            src="@/assets/icons/zoom-out-line.svg" 
            alt="zoom-out" 
            class="zoom-icon" 
            />
          <span class="zoom-level">{{ zoomPercent }}%</span>
          <img 
            @click="handleZoomIn" 
            :disabled="false" 
            src="@/assets/icons/zoom-in-line.svg" 
            alt="zoom-in" 
            class="zoom-icon" 
            />
        </div>
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
import { watch,ref,onBeforeUnmount,nextTick,onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'



interface Props {
  pdfUrl: string
  initialScale?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialScale: 1.0
})
const token = localStorage.getItem('token')
const error = ref('')
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const pageInputValue = ref('1')
const currentLocale = ref('zh')
const zoomPercent = ref(100)


const iframeContainerRef = ref()
let _iframeWindow: Window | null = null
let _iframe: HTMLIFrameElement | null = null

// 移除未使用的类型避免告警

function setOptions() {
  if (!_iframeWindow) return
  // 避免偏好覆盖手动设置，抑制 setAll 警告
  _iframeWindow.PDFViewerApplicationOptions.set('disablePreferences', true)
  _iframeWindow.PDFViewerApplicationOptions.set('isEvalSupported', false)
  _iframeWindow.PDFViewerApplicationOptions.set('defaultUrl', '')
  _iframeWindow.PDFViewerApplicationOptions.set('historyUpdateUrl', false)
  _iframeWindow.PDFViewerApplicationOptions.set('textLayerMode', 1)
  _iframeWindow.PDFViewerApplicationOptions.set('sidebarViewOnLoad', 0)
  _iframeWindow.PDFViewerApplicationOptions.set('ignoreDestinationZoom', true)
  _iframeWindow.PDFViewerApplicationOptions.set('renderInteractiveForms', false)
  _iframeWindow.PDFViewerApplicationOptions.set('printResolution', 300)
  // _iframeWindow.PDFViewerApplicationOptions.set('locale', locale.value)
}

function hideDefaultToolbar() {
  if (!_iframeWindow) return
  const doc = _iframeWindow.document
  try {
    const style = doc.createElement('style')
    style.setAttribute('data-injected', 'hide-default-toolbar')
    style.textContent = `
      #toolbarContainer,
      #secondaryToolbar,
      #findbar { display: none !important; }
      #viewerContainer { top: 0 !important; }
    `
    doc.head.appendChild(style)
  } catch (e) {
    console.warn('隐藏 PDF.js 工具栏失败', e)
  }
}

// function scrollToTop() {
//   if (!_iframeWindow) return
//   try {
//     const app = _iframeWindow.PDFViewerApplication
//     if (app?.pdfViewer) {
//       app.pdfViewer.currentPageNumber = 1
//     }
//     const vc = _iframeWindow.document.getElementById('viewerContainer')
//     if (vc) {
//       ;(vc as HTMLElement).scrollTop = 0
//     }
//   } catch (e) {
//     console.warn('滚动到顶部失败', e)
//   }
// }

async function initPdf() {
  _iframeWindow = null
  _iframe = null
  loading.value = true
  try {
    _iframe = document.createElement('iframe')
    _iframe.setAttribute('style', 'width: 100%; height: 100%; border: none;')
    // 使用禁用偏好设定参数，进一步避免偏好覆盖 AppOptions
    _iframe.src = '/pdf/web/viewer.html?disablePreferences=true'
    _iframe.addEventListener('load', async () => {
      try {
        _iframeWindow = _iframe!.contentWindow
        if (!_iframeWindow) throw new Error('无法访问 iframe 窗口')

        // 必须在 open 之前设置 AppOptions
        setOptions()
        // 隐藏默认工具栏
        hideDefaultToolbar()

        // 先关闭可能的上一次会话
        try { _iframeWindow.PDFViewerApplication.close() } catch {}

        // 绑定事件更新页码、总页数与缩放
        const app = _iframeWindow.PDFViewerApplication
        const eventBus = app.eventBus
        eventBus.on('pagesinit', () => {
          totalPages.value = app.pdfViewer.pagesCount || 0
          currentPage.value = app.pdfViewer.currentPageNumber || 1
          pageInputValue.value = String(currentPage.value)
          zoomPercent.value = Math.round((app.pdfViewer.currentScale || 1) * 100)
          // 初始化完成后回到顶部
          // scrollToTop()
        })
        eventBus.on('pagechanging', (evt: any) => {
          currentPage.value = evt?.pageNumber || app.pdfViewer.currentPageNumber || 1
          pageInputValue.value = String(currentPage.value)
        })
        eventBus.on('scalechanging', () => {
          zoomPercent.value = Math.round((app.pdfViewer.currentScale || 1) * 100)
        })

        const pdfOpenResult = app.open({
          url: props.pdfUrl,
          httpHeaders: { Authorization: `Bearer ${token}`, 'Accept-Language': currentLocale.value },
        })
        pdfOpenResult
          .then(() => {
            loading.value = false
            // 打开后回到顶部，确保位置复位
            // scrollToTop()
            _iframeWindow?.postMessage(
              {
                type: 'PDF_OPENED',
                data: { disabled: 'false' },
              },
              '*'
            )
          })
          .catch((e: Error) => {
            loading.value = false
            error.value = e?.message || 'PDF 打开失败'
            ElMessage({
              type: 'error',
              customClass: '!z-10000',
              message: '加载失败: ' + props.pdfUrl,
            })
          })

        // 暴露到全局仅用于调试
        ;(window as any).PDFViewerApplication = app
        ;(window as any).if = _iframeWindow
      } catch (e) {
        error.value = (e as any)?.message || '初始化失败'
        console.error(e)
      } finally {
        loading.value = false
      }
    })
    iframeContainerRef.value.appendChild(_iframe)
  } catch (e) {
    error.value = (e as any)?.message || '创建 iframe 失败'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const retryLoad = async () => {
  if (_iframe) {
    try { _iframeWindow?.PDFViewerApplication.close() } catch {}
    iframeContainerRef.value.removeChild(_iframe)
    _iframe = null
    _iframeWindow = null
  }
  await nextTick()
  initPdf()
}
const getApp = () => _iframeWindow?.PDFViewerApplication
const handlePrevPage = () => {
  const app = getApp()
  if (!app) return
  const viewer = app.pdfViewer
  if (viewer.currentPageNumber > 1) viewer.currentPageNumber = viewer.currentPageNumber - 1
}
const handleNextPage = () => {
  const app = getApp()
  if (!app) return
  const viewer = app.pdfViewer
  if (viewer.currentPageNumber < viewer.pagesCount) viewer.currentPageNumber = viewer.currentPageNumber + 1
}
const handleZoomIn = () => {
  const app = getApp()
  if (!app) return
  app.eventBus.dispatch('zoomin', { source: window })
}
const handleZoomOut = () => {
  const app = getApp()
  if (!app) return
  app.eventBus.dispatch('zoomout', { source: window })
}
const handlePageJump = () => {
  const app = getApp()
  if (!app) return
  const viewer = app.pdfViewer
  const target = parseInt(pageInputValue.value)
  if (!Number.isFinite(target)) return
  const clamped = Math.max(1, Math.min(target, viewer.pagesCount || 1))
  viewer.currentPageNumber = clamped
}


// 监听PDF URL变化
watch(
  () => props.pdfUrl,
  async (newUrl) => {
    console.log('PDF URL变化:', newUrl)
    if (_iframe) {
      try { _iframeWindow?.PDFViewerApplication.close() } catch {}
      iframeContainerRef.value.removeChild(_iframe)
      _iframe = null
      _iframeWindow = null
    }
    await nextTick()
    initPdf()
  }
)
onMounted(() => {
  initPdf()
})
onBeforeUnmount(() => {
    // window.removeEventListener('message', handleMessage)
    try { _iframeWindow?.PDFViewerApplication.close() } catch {}
    if (_iframe) iframeContainerRef.value.removeChild(_iframe)
  })

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
  position: relative;
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

.control-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
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