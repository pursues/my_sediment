import { ref,nextTick,onBeforeUnmount,onMounted,watch} from "vue"
import { ElMessage } from 'element-plus'
import * as pdfjsLib from 'pdfjs-dist'
// 使用 module worker（优先原生 workerPort，避免 fake worker 动态导入）
// 方案一：Vite 静态资源 url（仍可能触发 fake worker）。保留为后备：
// import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc
// 方案二：使用原生 module worker。pdfjs >= 4 支持 workerPort

// const worker = new Worker(
//   new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url),
//   { type: 'module' }
// )
// pdfjsLib.GlobalWorkerOptions.workerPort = worker


// 优先使用 module worker；老版浏览器（如 Chrome ~80）降级到经典 workerSrc
(() => {
  try {
    const worker = new Worker(
      new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url),
      { type: 'module' }
    )
    ;(pdfjsLib as any).GlobalWorkerOptions.workerPort = worker as any
  } catch (e) {
    // 降级方案：使用 CDN 的经典 worker 脚本
    ;(pdfjsLib as any).GlobalWorkerOptions.workerPort = undefined
    ;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${
      (pdfjsLib as any).version
    }/build/pdf.worker.min.js`
  }
})()

// 设置 worker 取消线上，改为本地
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${(pdfjsLib as any).version}/build/pdf.worker.mjs`
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc


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
  let loadingTask: any = null
  let currentLoadToken = 0
  let activeRenderTasks: any[] = []
  let scrollCleanup: (() => void) | null = null
  let currentPdfUrl: string = pdfUrl
  const MAX_CANVAS_PIXELS = 120000000 // 约 120MP，提高清晰度上限
  const OVERSAMPLE_FACTOR = 1.5 // 过采样倍率，结合设备像素比提升清晰度

  // 避免缩放后模糊：缩放时重新渲染，且使用设备像素比
  let zoomRerenderTimer: number | null = null

  const isBenignRenderError = (err: any): boolean => {
    const msg = String(err?.message || err || '')
    const name = String((err && err.name) || '')
    return (
      msg.includes('Transport destroyed') ||
      name === 'RenderingCancelledException' ||
      msg.includes('RenderingCancelled') ||
      msg.includes('Page closed')
    )
  }
  
  const cleanupDocument = async () => {
    // 取消所有在途渲染
    try {
      activeRenderTasks.forEach((task: any) => {
        try { task?.cancel?.() } catch {}
      })
    } finally {
      activeRenderTasks = []
    }
    // 销毁已加载的文档
    if (pdfDocument) {
      try { await pdfDocument.destroy() } catch {}
      pdfDocument = null
    }
    // 销毁加载任务（未完成/已完成都安全）
    if (loadingTask) {
      try { await loadingTask.destroy() } catch {}
      loadingTask = null
    }
  }
  
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
      // 清空旧渲染内容以避免视觉缓存
      containerRef.value.innerHTML = ''
    }
    
    // 销毁旧的 PDF 文档/任务，释放资源（需等待完成，避免竞争）
    await cleanupDocument()
    
    // 重置分页与错误状态
    currentPage.value = 1
    totalPages.value = 0
    pageInputValue.value = '1'
    error.value = ''
    
    // 更新为新的地址
    currentPdfUrl = newUrl
    
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
      // 本次加载令牌（用于避免并发竞争）
      const myToken = ++currentLoadToken
      // 加载PDF文档 ，
      // 默认会探测 Range/Stream，先发探测/首块请求，再发后续分块请求。所以你会看到同一地址多次 GET
      // 这样会导致无法分块，无法流式渲染，但是可以一次性加载所有数据 {url:pdfUrl,disableRange:true,disableStream:true} 
      loadingTask = pdfjsLib.getDocument({
        url: currentPdfUrl,
        // 降低传输复杂度，避免部分服务器 Range/Stream 行为带来的问题
        disableRange: true,
        disableStream: true,
        // 为避免中文/多语种文字出现乱码，提供 CMap 与标准字体资源
        // cMapUrl: pdfjsCMapUrl,
        // cMapPacked: true,
        // standardFontDataUrl: pdfjsStdFontUrl,
        // 允许使用系统字体作为回退，增强老浏览器显示稳定性
        useSystemFonts: true,
        // 遇到个别对象解析/绘制错误时不中断整体
        stopAtErrors: false
      })
      const doc = await loadingTask.promise
      // 如果在等待期间已启动了新的加载，则丢弃本次结果
      if (myToken !== currentLoadToken) {
        try { await loadingTask.destroy() } catch {}
        return
      }
      pdfDocument = doc
      totalPages.value = pdfDocument.numPages
      
      console.log('PDF加载成功，总页数:', totalPages.value)
      
      // 渲染所有页面
      await renderAllPages(myToken)
      
      // 应用初始缩放
      await nextTick()
      applyZoomTransform()
      
      // 设置滚动监听
      scrollCleanup = setupScrollListener()
      
      loading.value = false
    } catch (err: any) {
      if (!isBenignRenderError(err)) {
        error.value = `加载PDF文件失败: ${err.message || err.toString()}`
        console.error('PDF加载错误:', err)
        console.error('PDF URL:', pdfUrl)
      }
      loading.value = false
    }
  }

  // 渲染所有页面
  const renderAllPages = async (token?: number) => {
    if (!pdfDocument || !containerRef.value) return
    
    try {
      // 清空容器
      containerRef.value.innerHTML = ''
      
      // 遍历渲染所有页面
      for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
        if (token && token !== currentLoadToken) return
        await renderSinglePage(pageNum, token)
      }
      // 设置当前页为第一页
      currentPage.value = 1
    } catch (err: any) {
      error.value = `渲染页面失败: ${err.message}`
      console.error('页面渲染错误:', err)
    }
  }

  // 渲染单个页面（用于渲染所有页面时）
  const renderSinglePage = async (pageNum: number, token?: number) => {
    if (!pdfDocument || !containerRef.value) return
    
    try {
      if (token && token !== currentLoadToken) return
      // 获取页面
      const page = await pdfDocument.getPage(pageNum)
      if (token && token !== currentLoadToken) return
      
      // 计算适应容器宽度的基础缩放比例
      const containerWidth = containerRef.value.clientWidth - 32 // 减去padding
      const baseViewport = page.getViewport({ scale: 1.0 })
      const baseScale = containerWidth / baseViewport.width
      
      // 当前缩放（用户设置 * 基础适配）
      const dpr = Math.max(window.devicePixelRatio || 1, 1) * OVERSAMPLE_FACTOR
      const desiredScale = baseScale * (scale.value || 1)
      
      // 使用目标缩放进行渲染，必要时根据像素限制降级
      let viewport = page.getViewport({ scale: desiredScale })
      const pixels = viewport.width * viewport.height
      if (pixels * dpr * dpr > MAX_CANVAS_PIXELS) {
        // 根据 dpr 一并计算需要降低的比例，确保画布像素不超限
        const factor = Math.sqrt(MAX_CANVAS_PIXELS / (pixels * dpr * dpr))
        viewport = page.getViewport({ scale: desiredScale * factor })
      }
      
      // 创建页面容器
      const pageContainer = document.createElement('div')
      pageContainer.className = 'pdf-page-container'
      pageContainer.setAttribute('data-page', pageNum.toString())
      
      // 创建canvas元素
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) return
      
      // 设置 canvas 尺寸（考虑设备像素比以避免模糊）
      canvas.style.width = `${Math.round(viewport.width)}px`
      canvas.style.height = `${Math.round(viewport.height)}px`
      canvas.width = Math.round(viewport.width * dpr)
      canvas.height = Math.round(viewport.height * dpr)
      canvas.className = 'pdf-canvas'
      
      // 直接添加canvas到页面容器（去掉页码标签）
      pageContainer.appendChild(canvas)
      
      // 添加到主容器
      containerRef.value.appendChild(pageContainer)
      
      // 渲染页面
      if (context.imageSmoothingEnabled !== undefined) {
        context.imageSmoothingEnabled = true
        ;(context as any).imageSmoothingQuality = 'high'
      }
      const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform
      } as any
      const doRender = async (vp: any, retries = 1): Promise<void> => {
        const renderTask = page.render({ ...renderContext, viewport: vp })
        activeRenderTasks.push(renderTask)
        try {
          await renderTask.promise
        } catch (e: any) {
          if (isBenignRenderError(e)) {
            return
          }
          // 若渲染异常，尝试降级缩放重试一次
          if (retries > 0) {
            const downgrade = page.getViewport({ scale: vp.scale * 0.8 })
            return doRender(downgrade, retries - 1)
          }
          throw e
        } finally {
          activeRenderTasks = activeRenderTasks.filter((t) => t !== renderTask)
        }
      }
      await doRender(viewport, 1)
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

  // 应用缩放：不再使用 CSS scale，改为触发重新渲染（去模糊）
  const applyZoomTransform = () => {
    if (zoomRerenderTimer) {
      clearTimeout(zoomRerenderTimer)
    }
    zoomRerenderTimer = window.setTimeout(() => {
      renderAllPages(currentLoadToken)
    }, 150)
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
    
    // 清理PDF文档与加载任务（无需等待卸载完成）
    cleanupDocument()
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