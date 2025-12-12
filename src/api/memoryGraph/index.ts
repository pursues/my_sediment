import type { GraphNodeData } from '@/types/graph'
import request, { type ApiResponse } from '@/utils/net'
import type { AxiosResponse } from 'axios'

export const graphDataApi = (): Promise<AxiosResponse<ApiResponse<GraphNodeData>>> => {
  return request({
    url: '/api/graph/data',
    method: 'get'
  })
}
