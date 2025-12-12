import { defineStore } from 'pinia'
import { ref,reactive } from 'vue'
import type { FileStatusTag,FileItem,FilterData } from '@/types/document'


// 状态映射
export const getStatusType = (status: string): FileStatusTag => {
  const statusMap: Record<string, FileStatusTag> = {
    waiting: 'warning',
    uploading: 'warning',
    editing: 'primary',
    success: 'success',
    failed: 'danger',
    queuing: 'warning',
    parsing: 'primary',
    parse_failed: 'danger',
  }
  return statusMap[status] || 'info'
}

export const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    waiting:'待上传',
    uploading: '上传中',
    failed: '上传失败',
    editing: '编辑中',
    queuing: '排队中',
    parsing: '解析中',
    success: '解析成功',
    parse_failed: '解析失败',
  }
  return statusMap[status] || status
}

export const useDocumentStore = defineStore('document', () => {
  // 文档预览数据
  const documentPreview = ref({})
  // 显示导航栏
  const isShowLeftNav = ref(true)
  // 选中文件
  const selectedFile = ref<FileItem>({
    id: '',
    fileName: '',
    status: ''
  })
  // 文件类型
  const viewType = ref('');//pdf,html
  // 是否显示原始文件
  const showOriginal = ref(true)
  // 原始文件加载中
  const originalFileLoading = ref(false)
  // 原始文件url
  const originalFileUrl = ref('')
  // markdown编辑状态
  const markdownIsEdit = ref(false)
  // markdown加载中
  const markdownLoading = ref(false)
  // markdown解析成功
  const markdownSuccess = ref(false)
  // 前方正在解析的个数
  const queueNum = ref(0)
  // 文档列表
  const docList = ref<FileItem[]>([])
  // 文档查询参数
  const filterData = reactive<FilterData>({
    keyword: '',
    status: '',
    creator: '',
    fileType: '',
    dateRange: []
  })
  // 分页数据
  const pageData = reactive({
    page: 1,
    size: 10,
    total: 0
  })
  // 文档详情
  const documentDetail = ref({})
  // 文档状态
  const documentStatus = ref('')
  // 文档加载中
  const docListLoading = ref(false)
  // 保存加载状态
  const saveLoading = ref(false)

  // 获取表格数据
  const getDocumentList = async () => {
    docListLoading.value = true
    try {
      // 模拟数据
      const mockData: FileItem[] = [
        {
          id: '1',
          fileName: '白水系统作业指导书.doc',
          fileSize: '32.2MB',
          status: 'success',
          creator: '徐之琪',
          uploadTime: '2025-07-13 12:00:00'
        },
        {
          id: '2',
          fileName: '赤水系统作业指导书.doc',
          fileSize: '32.2MB',
          status: 'parsing',
          creator: '雨奇',
          uploadTime: '2025-07-11 16:12:00'
        },
        {
          id: '3',
          fileName: 'html渲染作业指导书.xlsx',
          fileSize: '32.2MB',
          status: 'success',
          creator: '简泽浩',
          uploadTime: '2025-07-12 12:00:00'
        },
        {
          id: '4',
          fileName: '红水系统作业指导书.doc',
          fileSize: '32.2MB',
          status: 'parse_failed',
          creator: '简泽浩',
          uploadTime: '2025-07-12 12:00:00'
        },
        {
          id: '5',
          fileName: '绿水系统作业指导书.doc',
          fileSize: '32.2MB',
          status: 'success',
          creator: '雨奇',
          uploadTime: '2025-07-11 16:12:00'
        },
        {
          id: '6',
          fileName: '橙水系统作业指导书.doc',
          fileSize: '32.2MB',
          status: 'queuing',
          creator: '简泽浩',
          uploadTime: '2025-07-12 12:00:00'
        },
      ]
      let filteredData = [...mockData]

      console.log(filterData,'filterData')
      // 关键词搜索
      if (filterData.keyword) {
        filteredData = filteredData.filter(item => 
          item.fileName.toLowerCase().includes(filterData.keyword as string)
        )
      }
      
      // 状态筛选
      if (filterData.status) {
        filteredData = filteredData.filter(item => 
          item.status === filterData.status
        )
      }
      // 创建人筛选
      if (filterData.creator) {
        filteredData = filteredData.filter(item => 
          item.creator === filterData.creator
        )
      }

      // 文件类型筛选
      if (filterData.fileType) {
        filteredData = filteredData.filter(item => {
          return item.fileName.includes(filterData.fileType)
        })
      }
      
      // 时间范围筛选
      if (filterData.dateRange && filterData.dateRange.length === 2) {
        const [startDate, endDate] = filterData.dateRange
        filteredData = filteredData.filter(item => {
          const itemDate = item.uploadTime?.split(' ')[0] as string
          return itemDate >= startDate && itemDate <= endDate
        })
      }
      // const response = await fetch('/api/documents/list')
      docList.value = filteredData
    } catch (error) {
      console.error('获取表格数据失败:', error)
    } finally {
      docListLoading.value = false
    }
  }



  // 取消markdown编辑
  const cancelMarkdownEdit = () => {
    markdownIsEdit.value = false
    console.log('取消markdown编辑')
  }

  // 重置整个数据
  const clearDocumentData = () => {
    documentPreview.value = {}
    isShowLeftNav.value = true
    selectedFile.value = {
      id: '',
      fileName: '',
      status: ''
    }
    viewType.value = ''
    showOriginal.value = true
    markdownIsEdit.value = false
  }

  return {
    documentPreview,
    viewType,
    isShowLeftNav,
    selectedFile,
    showOriginal,
    originalFileLoading,
    originalFileUrl,
    markdownIsEdit,
    markdownLoading,
    queueNum,
    saveLoading,
    getDocumentList,
    pageData,
    filterData,
    markdownSuccess,
    cancelMarkdownEdit,
    docList,
    documentDetail,
    documentStatus,
    docListLoading,
    clearDocumentData
  }
})