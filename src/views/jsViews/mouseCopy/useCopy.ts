import { ref } from "vue"
import { ElMessage } from "element-plus"
import { CopyType,CopyFormat,CopyTableFormat,CopyDownloadFormat } from '@/types/document'
import html2canvas from 'html2canvas'

export default function useMarkdown() {

  const markdownContentRef = ref<HTMLElement | null>(null)

  // 鼠标悬停相关
  const showPopover = ref(false)

  const currentHoveredElement = ref<HTMLElement | null>(null)

  // 弹窗自动隐藏定时器
  let popoverTimer: NodeJS.Timeout | null = null

  // 虚拟元素用于定位弹窗
  const virtualElement = ref<any>(null)

  // 当前可点击的元素
  const clickableElement = ref<HTMLElement | null>(null)

  // 鼠标是否在弹窗内的状态
  const isMouseInPopover = ref(false)

  // 当前操作的目标元素（用于复制等操作）
  const currentTargetElement = ref<HTMLElement | null>(null)

  const currentTargetType = ref<'image' | 'table' | 'text' | null>(null)

  // 记录鼠标Y坐标与弹窗打开时的基准Y，用于滚动/移动距离阈值关闭弹窗
  const lastMouseClientY = ref<number | null>(null)
  const popoverAnchorClientY = ref<number | null>(null)
  const POPOVER_HIDE_MOVE_THRESHOLD_PX = 300
  // 记录弹窗打开时的滚动位置，用于判断滚动距离是否超过阈值
  const popoverAnchorScrollY = ref<number | null>(null)




  // 添加点击事件监听
  const addClickListener = (element: HTMLElement, type: 'image' | 'table' | 'text') => {

    element.style.cursor = 'pointer'
    // 给元素添加点击事件
    element.addEventListener('click', () => handleElementClick(element, type), { once: false })
  }

  // 移除点击事件监听
  const removeClickListener = (element: HTMLElement) => {
    element.style.cursor = ''
    // 移除所有事件监听器（通过克隆节点）
    const newElement = element.cloneNode(true) as HTMLElement

    element.parentNode?.replaceChild(newElement, element)
  }

  // 处理元素点击事件
  const handleElementClick = (element: HTMLElement, type: 'image' | 'table' | 'text') => {
    console.log(`点击了${type}元素`)
    
    // 清除之前的定时器
    if (popoverTimer) {
      clearTimeout(popoverTimer)
      popoverTimer = null
    }
    
    // 保存当前操作的目标元素和类型
    currentTargetElement.value = element
    currentTargetType.value = type
    
    // 设置虚拟元素位置
    virtualElement.value = createVirtualElementFromElement(element)
    
    showPopover.value = true
    // 记录弹窗打开时的鼠标Y基准值（若无最近鼠标位置，则退化到元素顶部位置）
    if (lastMouseClientY.value != null) {
      popoverAnchorClientY.value = lastMouseClientY.value
    } else {
      const rect = element.getBoundingClientRect()
      popoverAnchorClientY.value = rect.top
    }
    // 记录弹窗打开时的容器滚动位置（优先使用 markdownContentRef）
    popoverAnchorScrollY.value = markdownContentRef.value
      ? markdownContentRef.value.scrollTop
      : window.scrollY
  }

  // 隐藏所有弹窗
  const hideAllPopovers = () => {
    showPopover.value = false
    currentTargetElement.value = null
    currentTargetType.value = null
    popoverAnchorClientY.value = null
    popoverAnchorScrollY.value = null
  }

  // 鼠标移动事件处理（只高亮，不显示弹窗）
  const handleMouseMove = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    // 如果鼠标还在同一个元素上，不做任何处理
    if (target === currentHoveredElement.value) {
      return
    }
    // 记录最近一次鼠标Y坐标
    lastMouseClientY.value = event.clientY

    // 当弹窗打开且鼠标上下移动超过阈值时，自动关闭弹窗
      if (isMoveThreshold(event)) {
      showPopover.value = false
    }
    if (!target) return
    

    // 特殊处理：如果当前悬停在表格上，且新target仍在同一个表格内，则不做任何处理 否则在表格内会重复添加点击事件，导致资源浪费
    if (currentHoveredElement.value && currentHoveredElement.value.tagName === 'TABLE') {
      const targetInSameTable = target.closest('table')
      if (targetInSameTable === currentHoveredElement.value) {
        return
      }
    }

    // 移除之前元素的高亮和点击事件
    if (currentHoveredElement.value) {
      removeHighlight(currentHoveredElement.value)
      removeClickListener(currentHoveredElement.value)
      currentHoveredElement.value = null
    }

    // 新增：如果当前 target 是仅包含单一图片且无其他内容的 P 标签，则不处理
    if (isParagraphWithOnlyImage(target)) {
      return
    }
    // 智能检测元素类型，优先处理更具体的元素
    const { element: targetElement, type: elementType } = detectTargetElement(target)
    
    if (targetElement && elementType) {
      // 如果已经在同一个元素上，不重复处理
      if (currentHoveredElement.value === targetElement ) {
        // console.log('同一个元素，跳过处理')
        return
      }
      currentHoveredElement.value = targetElement
      clickableElement.value = targetElement
      addHighlight(targetElement)
      addClickListener(targetElement, elementType)
    } else {
      currentHoveredElement.value = null
      clickableElement.value = null
    }
  }
  // 判断鼠标移动是否超过阈值（不包含滚动判断）
  const isMoveThreshold = (event: MouseEvent): boolean => {
    if (!showPopover.value || popoverAnchorClientY.value == null) return false
    // 设置上下绝对值，避免鼠标向上移动时，无法关闭弹窗
    const deltaY = Math.abs(event.clientY - popoverAnchorClientY.value)
    return deltaY > POPOVER_HIDE_MOVE_THRESHOLD_PX
  }

  // 容器滚动事件：仅在滚动中判断阈值（独立于鼠标移动）
  const handleContainerScroll = (event: Event) => {
    
    if (!showPopover.value) return
    const el = (event.target as HTMLElement) || markdownContentRef.value

    if (!el) return
    if (popoverAnchorScrollY.value == null) {
      popoverAnchorScrollY.value = el.scrollTop
    }

    const deltaY = Math.abs(el.scrollTop - (popoverAnchorScrollY.value ?? 0))
    if(deltaY > POPOVER_HIDE_MOVE_THRESHOLD_PX){
      showPopover.value = false
    }
  }

  // 判断是否为仅包含单一图片且无其他内容的 P 标签
  const isParagraphWithOnlyImage = (el: HTMLElement): boolean => {
    if (!el || el.tagName !== 'P') return false
    // 是否存在非空白文本节点
    const hasNonWhitespaceText = Array.from(el.childNodes).some((node) => {
      return node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0
    })
    if (hasNonWhitespaceText) return false
    // 仅允许一个 IMG 子元素
    const elementChildren = Array.from(el.children) as HTMLElement[]
    if (elementChildren.length !== 1) return false
    return elementChildren[0].tagName === 'IMG'
  }

  // 鼠标离开事件处理（检查是否需要延迟隐藏）
  const handleMouseLeave = () => {

    // 如果鼠标在弹窗内，不立即隐藏
    if (isMouseInPopover.value) {
      return
    }
    
    // 延迟1秒后隐藏，给用户时间移动到弹窗
    setTimeout(() => {
      // 再次检查鼠标是否在弹窗内
      if (!isMouseInPopover.value && currentHoveredElement.value) {
        removeHighlight(currentHoveredElement.value)
        removeClickListener(currentHoveredElement.value)
        hideAllPopovers()
      }
    }, 500)
  }

  // 弹窗鼠标进入事件处理
  const handlePopoverMouseEnter = () => {
    isMouseInPopover.value = true
    
    // 清除自动隐藏定时器
    if (popoverTimer) {
      clearTimeout(popoverTimer)
      popoverTimer = null
    }
  }

  // 弹窗鼠标离开事件处理
  const handlePopoverMouseLeave = () => {
    isMouseInPopover.value = false
    
    // 延迟1秒后隐藏
    setTimeout(() => {
      if (!isMouseInPopover.value && currentHoveredElement.value) {
        removeHighlight(currentHoveredElement.value)
        removeClickListener(currentHoveredElement.value)
        hideAllPopovers()
      }
    }, 500)
  }

  /**
   * 弹窗事件统一处理
   * @param type 弹窗类型
   * @param format 表格格式
   * */ 
  const handlePopoverEvent = async (type: CopyType,format?: CopyFormat) => {
    switch (type) {
      case 'image':
        await copyImage()
        break
      case 'table':
        await copyTable( format as CopyTableFormat )
        break
      case 'text':
        await copyText()
        break
      case 'download':
        await downloadTable(format as CopyDownloadFormat)
        break
    }
    // 隐藏弹窗
    hideAllPopovers()
  }

  // 复制图片
  const copyImage = async () => {
    try {
      if (currentTargetElement.value && currentTargetType.value === 'image') {
        const img = currentTargetElement.value as HTMLImageElement
        
        // 方案1: 尝试使用fetch获取图片并复制
        try {
          const response = await fetch(img.src)
          const blob = await response.blob()
          
          if (blob.type.startsWith('image/')) {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ])
            ElMessage.success('图片已复制到剪贴板')
            return
          }
        } catch (fetchError) {
          console.warn('Fetch方式复制失败，尝试Canvas方式:', fetchError)
        }
        
        // 方案2: 尝试使用Canvas (设置crossOrigin)
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            // 创建新的图片元素并设置跨域属性
            const crossOriginImg = new Image()
            crossOriginImg.crossOrigin = 'anonymous'
            
            await new Promise((resolve, reject) => {
              crossOriginImg.onload = () => {
                try {
                  canvas.width = crossOriginImg.naturalWidth
                  canvas.height = crossOriginImg.naturalHeight
                  ctx.drawImage(crossOriginImg, 0, 0)
                  
                  canvas.toBlob(async (blob) => {
                    if (blob) {
                      await navigator.clipboard.write([
                        new ClipboardItem({
                          'image/png': blob
                        })
                      ])
                      ElMessage.success('图片已复制到剪贴板')
                      resolve(true)
                    } else {
                      reject(new Error('Canvas 转换失败'))
                    }
                  })
                } catch (canvasError) {
                  reject(canvasError)
                }
              }
              
              crossOriginImg.onerror = () => {
                reject(new Error('图片加载失败'))
              }
              
              crossOriginImg.src = img.src
            })
            return
          }
        } catch (canvasError) {
          console.warn('Canvas方式复制失败，使用备用方案:', canvasError)
        }
        
        // 方案3: 备用方案 - 复制图片URL
        await navigator.clipboard.writeText(img.src)
        ElMessage.success('图片链接已复制到剪贴板')
      }
    } catch (error) {
      ElMessage.error('复制图片失败')
      console.error('复制图片失败:', error)
    }
  }
  // 创建虚拟元素用于定位弹窗（基于元素左下角）
  const createVirtualElementFromElement = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    return {
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          top: rect.bottom,
          right: rect.left,
          bottom: rect.bottom,
          left: rect.left,
          x: rect.left,
          y: rect.bottom,
        }
      }
    }
  }
  // 复制表格
  const copyTable = async (format: CopyTableFormat) => {
    try {
      if (currentTargetElement.value && currentTargetType.value === 'table') {
        const table = currentTargetElement.value.tagName === 'TABLE' 
          ? currentTargetElement.value 
          : currentTargetElement.value.closest('table')
        
        if (table) {
          let content = ''
          const formatZhMap: Record<CopyTableFormat, string> = {
            html: 'HTML 代码',
            markdown: 'Markdown 表格',
            latex: 'LaTeX 表格',
            tsv: 'TSV 文本'
          }
          
          switch (format) {
            case 'html':
              content = table.outerHTML
              break
            case 'markdown':
              content = convertTableToMarkdown(table as HTMLTableElement)
              break
            case 'latex':
              content = convertTableToLatex(table as HTMLTableElement)
              break
            case 'tsv':
              content = convertTableToTSV(table as HTMLTableElement)
              break
          }
          
          await navigator.clipboard.writeText(content)
          ElMessage.success(`表格已复制为 ${formatZhMap[format]} 格式`)
        }
      }
    } catch (error) {
      ElMessage.error('复制表格失败')
      console.error('复制表格失败:', error)
    }
  }

  // 下载表格
  const downloadTable = async (format: CopyDownloadFormat) => {
    try {
      ElMessage.success('正在将表格转为图片下载...')
      
      if (currentTargetElement.value && currentTargetType.value === 'table') {
        const table = currentTargetElement.value.tagName === 'TABLE' 
          ? currentTargetElement.value 
          : currentTargetElement.value.closest('table')
        
        // console.log('downloadTable - 找到的table元素:', table)
        // console.log('downloadTable - table在document.body中:', table && document.body.contains(table))
        // console.log('downloadTable - currentTargetElement在document.body中:', document.body.contains(currentTargetElement.value))
        
        if (table) {
          if (format === 'csv') {
            downloadTableAsCSV(table as HTMLTableElement)
          } else if (format === 'png') {
            await downloadTableAsPNG(table as HTMLTableElement)
          }
        } else {
          console.log('downloadTable - 没有找到table元素')
        }
      } else {
        console.log('downloadTable - 条件不满足')
      }
    } catch (error) {
      ElMessage.error('下载表格失败')
      console.error('下载表格失败:', error)
    }
  }

  // 复制文本
  const copyText = async () => {
    try {
      console.log('复制文本', currentTargetElement.value)
      if (currentTargetElement.value && currentTargetType.value === 'text') {
        const text = currentTargetElement.value.textContent || ''
        await navigator.clipboard.writeText(text.trim())
        ElMessage.success('文本已复制到剪贴板')
      }
    } catch (error) {
      ElMessage.error('复制文本失败')
      console.error('复制文本失败:', error)
    }
  }

  // 表格转换工具函数
  const convertTableToMarkdown = (table: HTMLTableElement): string => {
    const rows = Array.from(table.rows)
    if (rows.length === 0) return ''
    
    let markdown = ''
    
    // 检查是否有表头（查看第一行是否都是th元素）
    const firstRow = rows[0]
    const hasHeader = Array.from(firstRow.cells).some(cell => cell.tagName === 'TH')
    
    if (hasHeader) {
      // 处理表头
      const headers = Array.from(firstRow.cells).map(cell => cell.textContent?.trim() || '')
      markdown += '| ' + headers.join(' | ') + ' |\n'
      markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
      
      // 处理数据行
      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].cells).map(cell => cell.textContent?.trim() || '')
        markdown += '| ' + cells.join(' | ') + ' |\n'
      }
    } else {
      // 所有行都作为数据行处理
      for (let i = 0; i < rows.length; i++) {
        const cells = Array.from(rows[i].cells).map(cell => cell.textContent?.trim() || '')
        markdown += '| ' + cells.join(' | ') + ' |\n'
      }
    }
    
    return markdown
  }
  // 表格转换为Latex
  const convertTableToLatex = (table: HTMLTableElement): string => {
    const rows = Array.from(table.rows)
    if (rows.length === 0) return ''
    
    const colCount = rows[0].cells.length
    let latex = `\\begin{tabular}{${'|c'.repeat(colCount)}|}\n\\hline\n`
    
    rows.forEach((row, index) => {
      const cells = Array.from(row.cells).map(cell => cell.textContent?.trim() || '')
      latex += cells.join(' & ') + ' \\\\\n'
      if (index === 0 || index === rows.length - 1) {
        latex += '\\hline\n'
      }
    })
    
    latex += '\\end{tabular}'
    return latex
  }
  // 表格转换为TSV
  const convertTableToTSV = (table: HTMLTableElement): string => {
    const rows = Array.from(table.rows)
    return rows.map(row => 
      Array.from(row.cells).map(cell => cell.textContent?.trim() || '').join('\t')
    ).join('\n')
  }
  // 下载表格为CSV
  const downloadTableAsCSV = (table: HTMLTableElement) => {
    const rows = Array.from(table.rows)
    const csv = rows.map(row => 
      Array.from(row.cells).map(cell => {
        const text = cell.textContent?.trim() || ''
        return `"${text.replace(/"/g, '""')}"`
      }).join(',')
    ).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'table.csv'
    link.click()
  }
  // 下载表格为PNG
  const downloadTableAsPNG = async (table: HTMLTableElement) => {
    
    try {
      
      // 检查表格状态
      let isTableInBody = document.body.contains(table)
      let needsTemporaryAttachment = false
      let appendedToBody = false
      let originalParent: Node | null = null
      let originalNextSibling: Node | null = null
      
      if (!isTableInBody) {
        
        // 保存原始位置信息
        originalParent = table.parentNode
        originalNextSibling = table.nextSibling
        
        // 临时添加到body中
        document.body.appendChild(table)
        needsTemporaryAttachment = true
        appendedToBody = true
      }

      // 获取表格的实际尺寸
      const rect = table.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        
        // 如果需要，恢复原始位置
        if (needsTemporaryAttachment && originalParent) {
          if (originalNextSibling) {
            originalParent.insertBefore(table, originalNextSibling)
          } else {
            originalParent.appendChild(table)
          }
        }
        
        throw new Error('表格尺寸无效')
      }

      // 优化的html2canvas配置选项
      const options = {
        backgroundColor: '#ffffff',
        scale: 2, // 提高分辨率
        useCORS: true, // 允许跨域图片
        allowTaint: false, // 不允许画布被污染，避免某些问题
        removeContainer: true, // 渲染完成后移除临时容器，避免遗留到body
        foreignObjectRendering: false, // 禁用foreignObject渲染
        imageTimeout: 15000, // 图片超时时间
        logging: false, // 关闭日志
        willReadFrequently: true, // 提高频繁读取canvas数据的性能
        onclone: (clonedDoc: Document) => {
          // 在克隆文档中查找对应的表格元素
          const clonedTable = clonedDoc.querySelector('table')
          if (clonedTable) {
            // 确保表格在克隆文档中的样式正确
            clonedTable.style.display = 'table'
            clonedTable.style.visibility = 'visible'
          }
        }
      }
      
      // 临时移除高亮样式以获得干净的截图，并增强表头样式（给 th 增加边框，尽量还原表格）
      // 记录表格和 th 的原始样式
      const originalOutline = table.style.outline
      const originalOutlineOffset = table.style.outlineOffset
      const originalBackground = table.style.background
      const originalBorderRadius = table.style.borderRadius
      const originalBorderCollapse = table.style.borderCollapse
      const originalBorderSpacing = table.style.borderSpacing
      const thElements = Array.from(table.querySelectorAll('th')) as HTMLElement[]
      const tdElements = Array.from(table.querySelectorAll('td')) as HTMLElement[]
      const originalThCssTexts: Array<string | null> = thElements.map((el) => el.getAttribute('style'))
      const originalTdCssTexts: Array<string | null> = tdElements.map((el) => el.getAttribute('style'))
      
      table.style.outline = ''
      table.style.outlineOffset = ''
      table.style.background = ''
      table.style.borderRadius = ''
      // 增强：确保表格边框合并与白底，避免导出时边框/背景丢失
      table.style.borderCollapse = 'collapse'
      table.style.borderSpacing = '0'
      table.style.backgroundColor = '#ffffff'
      table.style.border = '1px solid #d0d7de'
      // 仅在导出时给 th/td 增加边框与内边距，尽量还原表格
      thElements.forEach((el) => {
        el.style.border = el.style.border || '1px solid #d0d7de'
        el.style.padding = el.style.padding || '6px'
        el.style.textAlign = el.style.textAlign || 'left'
        el.style.verticalAlign = el.style.verticalAlign || 'middle'
        el.style.boxSizing = 'border-box'
      })
      tdElements.forEach((el) => {
        el.style.border = el.style.border || '1px solid #d0d7de'
        el.style.padding = el.style.padding || '6px'
        el.style.boxSizing = 'border-box'
      })
      
      try {
        // 使用html2canvas转换表格为canvas
        const canvas = await html2canvas(table, options)
        
        // 创建下载链接
        const link = document.createElement('a')
        link.download = `table_${new Date().getTime()}.png`
        link.href = canvas.toDataURL('image/png', 0.95) // 设置质量
        
        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // ElMessage.success('表格PNG图片下载成功')
      } finally {
        // 恢复原始样式
        table.style.outline = originalOutline
        table.style.outlineOffset = originalOutlineOffset
        table.style.background = originalBackground
        table.style.borderRadius = originalBorderRadius
        table.style.borderCollapse = originalBorderCollapse
        table.style.borderSpacing = originalBorderSpacing
        thElements.forEach((el, idx) => {
          const css = originalThCssTexts[idx]
          if (css === null) {
            el.removeAttribute('style')
          } else {
            el.setAttribute('style', css)
          }
        })
        tdElements.forEach((el, idx) => {
          const css = originalTdCssTexts[idx]
          if (css === null) {
            el.removeAttribute('style')
          } else {
            el.setAttribute('style', css)
          }
        })
        
        // 如果曾临时插入到 body，优先恢复原位置；若无法恢复则从 body 清除
        if (needsTemporaryAttachment) {
          if (originalParent) {
            // 恢复表格到原始位置
            if (originalNextSibling) {
              originalParent.insertBefore(table, originalNextSibling)
            } else {
              originalParent.appendChild(table)
            }
          } else if (appendedToBody && table.parentNode === document.body) {
            // 原始父节点不存在，且当前仍在 body，则移除
            document.body.removeChild(table)
          }
        }

        // 额外清理：移除可能残留到 body 的 html2canvas 容器以及孤立的临时表格
        const residueContainers = document.querySelectorAll('.html2canvas-container')
        residueContainers.forEach((node) => node.parentNode?.removeChild(node))
        // 若 body 下意外遗留了与当前 table 相同引用的节点，进行一次兜底清理
        if (table.parentNode === document.body && needsTemporaryAttachment) {
          try { document.body.removeChild(table) } catch {}
        }
      }
      
    } catch (error) {
      console.error('下载表格PNG失败:', error)
      ElMessage.error(`下载表格PNG失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 深拷贝节点并将计算样式写入行内，尽量还原真实渲染效果
  const cloneNodeWithComputedStyles = (node: HTMLElement): HTMLElement => {
    const clone = node.cloneNode(false) as HTMLElement
    const computed = window.getComputedStyle(node)
    let cssText = ''
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i]
      const value = computed.getPropertyValue(prop)
      cssText += `${prop}:${value};`
    }
    clone.setAttribute('style', cssText)

    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as HTMLElement
        const childClone = cloneNodeWithComputedStyles(childEl)
        clone.appendChild(childClone)
      } else if (child.nodeType === Node.TEXT_NODE) {
        clone.appendChild(child.cloneNode(true))
      }
    })
    return clone
  }


  // 添加元素高亮样式
  const addHighlight = (element: HTMLElement) => {
    // 立即设置 outline，避免过渡时的黑边闪烁
    element.style.outline = '1px solid #1677FF'
    element.style.outlineOffset = '-1px'
    element.style.background = '#FAFCFF'
    element.style.borderRadius = '4px'
    // 只对背景色和圆角应用过渡效果，outline 立即生效
    element.style.transition = 'background 0.2s ease, border-radius 0.2s ease'
  }

  // 移除元素高亮样式
  const removeHighlight = (element: HTMLElement) => {
    element.style.outline = ''
    element.style.outlineOffset = ''
    element.style.background = ''
    element.style.borderRadius = ''
    element.style.transition = ''
  }

  // 智能检测目标元素，优先处理更具体的元素
  const detectTargetElement = (target: HTMLElement): { element: HTMLElement | null, type: 'image' | 'table' | 'text' | null } => {
    // 优先级1: 检查是否是表格或表格内元素（最高优先级，防止深入捕获）
    if (target.tagName === 'TABLE') {
      return { element: target, type: 'table' }
    }
    
    const tableParent = target.closest('table')
    if (tableParent) {
      return { element: tableParent as HTMLElement, type: 'table' }
    }
    
    // 优先级2: 仅当直接悬停在图片元素上时才认为是图片
    if (target.tagName === 'IMG') {
      return { element: target, type: 'image' }
    }
    
    // 优先级3: 检查是否是文本元素
    if (target.tagName === 'P' || target.tagName === 'STRONG' || target.tagName === 'H1' || target.tagName === 'H2' || 
        target.tagName === 'H3' || target.tagName === 'H4' || target.tagName === 'H5' || target.tagName === 'H6' || 
        target.tagName === 'LI' || target.tagName === 'BLOCKQUOTE') {
      return { element: target, type: 'text' }
    }
    return { element: null, type: null }
  }

  return {
    markdownContentRef,
    handleContainerScroll,
    copyImage,
    createVirtualElementFromElement,
    addHighlight,
    removeHighlight,
    detectTargetElement,
    copyTable,
    downloadTable,
    copyText,
    handleMouseMove,
    handleMouseLeave,
    handlePopoverMouseEnter,
    handlePopoverMouseLeave,
    handlePopoverEvent,
    showPopover,
    currentHoveredElement,
    clickableElement,
    isMouseInPopover,
    currentTargetElement,
    currentTargetType,
    virtualElement,
  }
}