document.addEventListener('DOMContentLoaded', () => {
  const langButton = document.getElementById('changeLanguage')
  const langLabelEn = document.getElementById('langLabelEn')
  const langLabelZh = document.getElementById('langLabelZh')
  const dropdown = document.getElementById('languageOptions')
  const arrow = document.getElementById('languageArrow')
  const pdfOriginUrl = document.getElementById('pdf-origin-url')
  const urlParams = new URLSearchParams(window.parent?.location.search)
  const pdfLangType = urlParams.get('type')
  if (pdfLangType !== '2') {
    langButton.disabled = 'disabled'
  }

  window.parent.postMessage({ type: 'DOM_LOADED' }, '*')
  // 初始化时获取父窗口语言状态
  window.parent.postMessage({ type: 'REQUEST_LANG_STATUS' }, '*')

  langButton.addEventListener('click', () => {
    // window.parent.postMessage({ type: 'TOGGLE_LANG_REQUEST' }, '*');
    dropdown.classList.toggle('show')
    // 切换箭头方向
    arrow.classList.toggle('rotate')
    // 可选：点击外部区域关闭下拉框
    if (dropdown.classList.contains('show')) {
      document.addEventListener('click', closeDropdownOutside)
    } else {
      document.removeEventListener('click', closeDropdownOutside)
    }
  })

  function closeDropdownOutside(e) {
    if (!langButton.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show')
      arrow.classList.remove('rotate')
      document.removeEventListener('click', closeDropdownOutside)
    }
  }

  dropdown.addEventListener('click', (event) => {
    const liElement = event.target.closest('li')
    if (liElement) {
      const language = liElement.dataset.value
      // 发送语言切换请求
      window.parent.postMessage({ type: 'TOGGLE_LANG_REQUEST', lang: language }, '*')
      // 更新语言标签
      langLabelEn.style.display = language === 'en' ? 'block' : 'none'
      langLabelZh.style.display = language === 'zh' ? 'block' : 'none'
      // 关闭下拉框
      dropdown.classList.remove('show')
      arrow.classList.remove('rotate')
      document.removeEventListener('click', closeDropdownOutside)
    }
  })

  // 接收语言状态更新
  window.addEventListener('message', (event) => {
    const { type, data } = event.data
    if (type === 'PDF_OPENED') {}
    if (type === 'INIT_INFO') {
        pdfOriginUrl.onclick = null
        if (data.originUrl) {
          pdfOriginUrl.style.display = 'block'
          pdfOriginUrl.onclick = () => {
            window.open(
              `/knowledgeMap/course/fullPdfPreview?originUrl=${data.originUrl}`,
              '_blank',
            )
          }
          // pdfOriginUrl.addEventListener('click', () => {
          //   window.open(
          //     `/knowledgeMap/course/fullPdfPreview?originUrl=${data.originUrl}`,
          //     '_blank',
          //   )
          // })
        } else {
          pdfOriginUrl.style.display = 'none'
        }
      document.getElementById('sidebarToggle').disabled = data.outlineBtn
      document.getElementById('pdf-title-text').textContent = data.pdfName||''
      document.getElementById('pdf-title-hover-text').textContent = data.pdfName||''
    }
  })
})
