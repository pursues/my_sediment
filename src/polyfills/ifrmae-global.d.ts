// 全局配置pdfjs-dist预览中，使用iframe预览的window对象
declare global {
  interface Window {
    PDFViewerApplication: any
    PDFViewerApplicationOptions: any
    if: any
  }
}

export {}