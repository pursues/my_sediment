import request,{type ApiResponse,type PaginatedResponse } from '@/utils/net'
import type { 
  DocumentListParams, 
  DocumentItem, 
  FileItem,
  UploadResponse,
} from '@/types/document'

// 文档列表接口
export const getDocumentList = async (params: DocumentListParams) => {
  return request<PaginatedResponse<DocumentItem>>({
    url: '/api/v1/postgresql/file/list',
    method: 'GET',
    params
  }).then(res => res.data)
}
/**
 * 删除前判断状态接口
 * result { data:boolean,message:string }
 * */ 
// export const checkDocumentStatus = (id: string): Promise<ApiResponse<{data:boolean,message:string}>> => {
//   return request({
//     url: `/document/checkDocumentStatus/${id}`,
//     method: 'get'
//   })
// }
/***
 * 批量删除判断状态接口
 */
export const batchCheckDocumentStatus = (ids: string[]) => {
  return request<{usingFileNum:number}>({
    url: `/api/v1/postgresql/file/checkDelete`,
    method: 'POST',
    data: { ids }
  })
}
// 批量删除接口
export const batchDeleteDocument = (ids: string[]) => {
  return request({
    url: '/api/v1/postgresql/file/delete',
    method: 'delete',
    data: { ids }
  })
}
// 文档上传接口
export async function uploadDocument(file: File, controller?: AbortController) {
  
  const formData = new FormData()
  formData.append('file', file)

  return request<UploadResponse>({
    url: '/api/v1/postgresql/file/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: formData,
    signal: controller?.signal // 添加 AbortSignal
  })
}
// 获取文档详情
export const getDocumentDetail = (id: string) => {
  return request<FileItem>({
    url: `/api/v1/postgresql/file/info?fileId=${id}`,
    method: 'get'
  })
}


// 编辑前检查是否可以编辑
export const checkMarkdownEdit = (id: string): Promise<ApiResponse<{data:boolean,message:string}>> => {
  return request({
    url: `/document/checkMarkdownEdit/${id}`,
    method: 'get'
  })
} 

// 保存markdown
export const saveMarkdownApi = (id: string, markdown: string): Promise<ApiResponse<{data:boolean,message:string}>> => {
  return request({
    url: `/document/saveMarkdown/${id}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data: markdown
  })
}

// 重新解析文档
export const retryParseDocument = (id: string): Promise<ApiResponse<{data:boolean,message:string}>> => {
  return request({
    url: `/document/retryParse/${id}`,
    method: 'post'
  })
}