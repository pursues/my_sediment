import request, { type ApiResponse } from '@/utils/net'
import type { AxiosResponse } from 'axios'

// 定义token验证请求参数类型
interface TokenValidationData {
  token: string
  [key: string]: any
}

// 定义token验证响应类型
interface TokenValidationResponse {
  valid: boolean
  expired?: boolean
  message?: string
}

export function getToken(data: TokenValidationData): Promise<AxiosResponse<ApiResponse<TokenValidationResponse>>> {
  return request({
    url: `/validToken`,
    method: 'post',
    data: data
  })
}

export type { TokenValidationData, TokenValidationResponse } 