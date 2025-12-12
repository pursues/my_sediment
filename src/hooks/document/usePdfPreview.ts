import { ref,nextTick,onBeforeUnmount,onMounted,watch} from "vue"
import { ElMessage } from 'element-plus'
import * as pdfjsLib from 'pdfjs-dist'

// 设置 worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjsLib as any).version}/build/pdf.worker.mjs`


export default function usePdfPreview(
  pdfUrl:string,
  initialScale:number
) {

  const containerRef = ref<HTMLElement>()
  // 滚动容器
  const scrollContainerRef = ref<HTMLElement>()
  const scale = ref(1)
  const loading = ref(false)
  const error = ref('')
  const currentPage = ref(1)
  const totalPages = ref(0)
  const pageInputValue = ref('1')

  let pdfDocument: any = null
  let scrollCleanup: (() => void) | null = null
  
  onMounted(async () => {
    console.log('PdfPreview组件已挂载')
    await nextTick()
    
    // 重置缩放状态
    scale.value = initialScale
    await loadPDF()
  })
  watch(currentPage, (newPage) => {
    pageInputValue.value = newPage.toString()
  })
  // 根据新的url处理新数据
  const updatePdfUrl = async (newUrl:string) => {
    // 清理之前的滚动监听
    if (scrollCleanup) {
      scrollCleanup()
      scrollCleanup = null
    }
    
    // 重置缩放状态
    scale.value = initialScale
    if (containerRef.value) {
      containerRef.value.style.transform = ''
    }
    
    if (newUrl) {
      await loadPDF()
    }
  }
  // 重新加载
  const retryLoad = () => {
    loadPDF()
  }
  // 加载PDF文档
  const loadPDF = async () => {
    try {
      loading.value = true
      error.value = ''
      
      // 加载PDF文档
      const loadingTask = pdfjsLib.getDocument(pdfUrl)
      pdfDocument = await loadingTask.promise
      totalPages.value = pdfDocument.numPages
      
      console.log('PDF加载成功，总页数:', totalPages.value)
      
      // 渲染所有页面
      await renderAllPages()
      
      // 应用初始缩放
      await nextTick()
      applyZoomTransform()
      
      // 设置滚动监听
      scrollCleanup = setupScrollListener()
      
      loading.value = false
    } catch (err: any) {
      error.value = `加载PDF文件失败: ${err.message || err.toString()}`
      loading.value = false
      console.error('PDF加载错误:', err)
      console.error('PDF URL:', pdfUrl)
    }
  }

  // 渲染所有页面
  const renderAllPages = async () => {
    if (!pdfDocument || !containerRef.value) return
    
    try {
      // 清空容器
      containerRef.value.innerHTML = ''
      
      // 遍历渲染所有页面
      for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
        await renderSinglePage(pageNum)
      }
      // 设置当前页为第一页
      currentPage.value = 1
    } catch (err: any) {
      error.value = `渲染页面失败: ${err.message}`
      console.error('页面渲染错误:', err)
    }
  }

  // 渲染单个页面（用于渲染所有页面时）
  const renderSinglePage = async (pageNum: number) => {
    if (!pdfDocument || !containerRef.value) return
    
    try {
      // 获取页面
      const page = await pdfDocument.getPage(pageNum)
      
      // 计算适应容器宽度的基础缩放比例
      const containerWidth = containerRef.value.clientWidth - 32 // 减去padding
      const baseViewport = page.getViewport({ scale: 1.0 })
      const baseScale = containerWidth / baseViewport.width
      
      // 使用基础缩放进行渲染，用户缩放通过CSS transform控制
      const viewport = page.getViewport({ scale: baseScale })
      
      // 创建页面容器
      const pageContainer = document.createElement('div')
      pageContainer.className = 'pdf-page-container'
      pageContainer.setAttribute('data-page', pageNum.toString())
      
      // 创建canvas元素
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) return
      
      // 设置canvas尺寸
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.className = 'pdf-canvas'
      
      // 直接添加canvas到页面容器（去掉页码标签）
      pageContainer.appendChild(canvas)
      
      // 添加到主容器
      containerRef.value.appendChild(pageContainer)
      
      // 渲染页面
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
    } catch (err: any) {
      console.error(`渲染第 ${pageNum} 页失败:`, err)
    }
  }

  // 渲染指定页面（用于按钮切换时）
  const renderPage = async (pageNum: number) => {
    if (!scrollContainerRef.value || !containerRef.value) return
    
    try {
      // 找到对应的页面容器并滚动到该位置
      const pageContainer = containerRef.value.querySelector(`[data-page="${pageNum}"]`) as HTMLElement
      if (pageContainer) {
        const containerRect = scrollContainerRef.value.getBoundingClientRect()
        const pageRect = pageContainer.getBoundingClientRect()
        const scrollTop = scrollContainerRef.value.scrollTop + pageRect.top - containerRect.top
        
        scrollContainerRef.value.scrollTo({ 
          top: scrollTop, 
          behavior: 'smooth' 
        })
        currentPage.value = pageNum
      }
    } catch (err: any) {
      console.error('页面跳转错误:', err)
    }
  }

  // 滚动监听，更新当前页码
  const setupScrollListener = () => {
    if (!scrollContainerRef.value || !containerRef.value) return () => {}
    
    const container = scrollContainerRef.value
    const pdfContainer = containerRef.value
    const handleScroll = () => {
      if (!container || !pdfContainer) return
      
      const pageContainers = pdfContainer.querySelectorAll('.pdf-page-container')
      const containerTop = container.scrollTop
      const containerHeight = container.clientHeight
      const viewportMiddle = containerTop + containerHeight / 2
      
      let closestPage = 1
      let closestDistance = Infinity
      
      pageContainers.forEach((pageContainer, index) => {
        const pageTop = (pageContainer as HTMLElement).offsetTop
        const pageHeight = pageContainer.clientHeight
        const pageMiddle = pageTop + pageHeight / 2
        
        const distance = Math.abs(viewportMiddle - pageMiddle)
        if (distance < closestDistance) {
          closestDistance = distance
          closestPage = index + 1
        }
      })
      
      if (currentPage.value !== closestPage) {
        currentPage.value = closestPage
      }
    }
    
    // 防抖处理
    let scrollTimer: number | null = null
    const debouncedHandleScroll = () => {
      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }
      scrollTimer = window.setTimeout(handleScroll, 100)
    }
    
    container.addEventListener('scroll', debouncedHandleScroll)
    
    // 返回清理函数
    return () => {
      container.removeEventListener('scroll', debouncedHandleScroll)
      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }
    }
  }
  const handlePrevPage = async () => {
    if (currentPage.value > 1) {
      await renderPage(currentPage.value - 1)
    }
  }
  
  const handleNextPage = async () => {
    if (currentPage.value < totalPages.value) {
      await renderPage(currentPage.value + 1)
    }
  }
  
  // 页面跳转
  const handlePageJump = () => {
    const targetPage = parseInt(pageInputValue.value)
    if (targetPage >= 1 && targetPage <= totalPages.value) {
      renderPage(targetPage)
    } else {
      pageInputValue.value = currentPage.value.toString()
      ElMessage.warning('请输入有效的页码')
    }
  }


  // 缩放控制
  const handleZoomIn = () => {
    if (scale.value < 3) {
      scale.value = Math.min(scale.value + 0.1, 3)
      applyZoomTransform()
    }
  }

  const handleZoomOut = () => {
    if (scale.value > 0.5) {
      scale.value = Math.max(scale.value - 0.1, 0.5)
      applyZoomTransform()
    }
  }

  // 应用缩放变换
  const applyZoomTransform = () => {
    if (containerRef.value) {
      containerRef.value.style.transform = `scale(${scale.value})`
      // containerRef.value.style.transformOrigin = 'top center'
      console.log(`应用缩放变换: ${Math.round(scale.value * 100)}%`)
    }
  }
  // 全屏控制
  // const handleFullScreen = () => {
  //   const scrollContainer = scrollContainerRef.value
  //   if (scrollContainer) {
  //     if (document.fullscreenElement) {
  //       document.exitFullscreen()
  //     } else {
  //       scrollContainer.requestFullscreen()
  //     }
  //   }
  // }

  onBeforeUnmount(() => {
    // 清理滚动监听
    if (scrollCleanup) {
      scrollCleanup()
    }
    
    // 清理PDF文档
    if (pdfDocument) {
      pdfDocument.destroy()
    }
  })

  return {
    containerRef,
    scrollContainerRef,
    scale,
    handleZoomIn,
    handleZoomOut,
    applyZoomTransform,
    loadPDF,
    renderAllPages,
    renderSinglePage,
    renderPage,
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
  }
}