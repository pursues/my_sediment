/**
 * 文档列表查询参数
 * */
export interface DocumentListParams {
  page: number
  size: number
  name?: string
  status?: string
  creator?: string
  type?: string
  startDate?: string
  endDate?: string
}
export type DocumentStatus = 'waiting' | 'uploading' | 'failed'| 'editing' | 'parsing' | 'parse_success'  | 'parse_failed' | 'parse_queuing'

// 统一状态处理
export const StatusMap = {
  WAITING: 'waiting',//待上传
  UPLOADING: 'uploading',//上传中
  FAILED: 'failed',//上传失败
  EDITING: 'editing',//编辑中
  PARSING: 'parsing',//解析中
  PARSE_SUCCESS: 'parse_success',//解析成功
  PARSE_FAILED: 'parse_failed',//解析失败
  PARSE_QUEUING: 'parse_queuing',//排队中
}
/**
 * 文档列表接口定义
 * */ 
export interface DocumentItem {
  id: string
  name: string
  size: string
  type: string
  status: DocumentStatus
  creator: string
  createdAt?: string
  updatedAt?: string
  url?: string
  isDelete?:number
  pdfUrl?: string
  markdownUrl?: string

}
// 上传文件
export interface UploadFile extends DocumentItem {
  file: File // 文件对象
  name: string
  size: string
  type: string
  uploadController?: AbortController // 上传控制器
}
// 参考surveyX的上传接口返回的数据
export interface UploadResponse{
  filename:string,
  id:string,
  size:string,
  status:DocumentStatus,
  url:string,
}
/**
 * 更多搜索参数
 * */ 
export interface FilterData {
  name?: string
  status: string
  creator: string
  type: string
  dateRange: string[] | undefined
}

// 定义文件接口
export interface FileItem {
  id: string
  fileName: string
  size: string
  status: string
  pdfUrl: string
  markdownUrl: string
}
// 文件状态标签
export type FileStatusTag = 'warning' | 'primary' | 'success' | 'danger' | 'info'

// 文件状态
export interface FileStatus {
  queuing: 'warning'
  parsing: 'primary'
  success: 'success'
  failed: 'danger'
}

// 文件状态名称
export interface FileStatusText {
  queuing: '排队中'
  parsing: '解析中'
  success: '解析成功'
  failed: '解析失败'
}

// 复制类型
export type CopyType = 'image' | 'table' | 'text' | 'download'
// 复制格式
export type CopyFormat = 'latex' | 'html' | 'markdown' | 'tsv' | 'csv' | 'png'
// 复制表格格式
export type CopyTableFormat = 'latex' | 'html' | 'markdown' | 'tsv'
// 复制下载格式
export type CopyDownloadFormat = 'csv' | 'png'

// 文档详情
// export interface DocumentDetail {
//   originalFileUrl: string
//   markdownUrl: string
//   id: string
//   fileName: string
//   fileSize: string
//   status: string
//   creator: string
//   uploadTime: string
// }