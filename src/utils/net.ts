import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'


// 定义响应数据类型
interface ApiResponse<T = any> {
  data: T
  message: string
  code: number
}

interface PaginatedResponse<T = any> {
  total: number
  page: number
  size: number
  items: T[]
}
// 不需要token的接口
const noTokenList = ['/api/v1/postgresql/auth/login']

function handleEleMessage(status:number,content:string){
  let message = ''
  switch (status) {
    case 400:
      message = content || '请求错误'
      break
    case 401:
      // Token 过期或无效, 删除token并跳转登录
      message = content || '未授权'
      localStorage.removeItem('token')
      router.replace('/login')
      break
    case 403:
      message = content || '拒绝访问'
      break
    case 404:
      message = '请求地址出错'
      break
    case 408:
      message = '请求超时'
      break
    case 500:
      message = '服务器内部错误'
      break
    case 501:
      message = '服务未实现'
      break
    case 502:
      message = '网关错误'
      break
    case 503:
      message = '服务不可用'
      break
    case 504:
      message = '网关超时'
      break
    case 505:
      message = 'HTTP 版本不受支持'
      break
  }
  ElMessage.error({ message: message, grouping: true })
}

/** 创建请求实例 */
function createInstance() {
  // 创建一个 axios 实例命名为 instance
  const instance = axios.create()
  
  // 请求拦截器
  instance.interceptors.request.use(
    // 发送之前
    (config) => {
      const isLogin = noTokenList.includes(config.url || '')
      // 统一规范 headers 对象
      config.headers = config.headers || {}

      if (isLogin) {
        // 登录接口不携带 token
        delete (config.headers as Record<string, any>)['Authorization']
        return config
      }

      const currentToken = localStorage.getItem('token')
      if (!currentToken) {
        localStorage.setItem('token','qwerrttyyu')
        // 无 token，跳转登录并中断请求
        router.replace('/login')
        return Promise.reject(new Error('Unauthorized: missing token'))
      }
      // 其他接口统一携带 Authorization
      (config.headers as any)['Authorization'] = `Bearer ${currentToken}`
      return config
    },
    // 发送失败
    (error) => Promise.reject(error)
  )
  // 响应拦截器（可根据具体业务作出相应的调整）
  instance.interceptors.response.use(
    (response) => {
      // 由于 transformResponse 已经处理了数据，这里直接使用
      const apiData = response.data;
      
      // 确保 apiData 不为 null
      if (!apiData) {
        return Promise.reject(new Error('响应数据为空'));
      }

      // 二进制数据则直接返回
      const responseType = response.config.responseType;
      if (responseType === 'blob' || responseType === 'arraybuffer') return apiData;
      
      // 这个 code 是和后端约定的业务 code
      const code = apiData.code;
      const message = apiData.message;

      // 登录成功时，持久化 token
      const isLogin = noTokenList.includes(response.config.url || '')

      switch (Number(code)) {
        case 200:
          // 存储token
          if (isLogin && apiData?.data?.token) {
            localStorage.setItem('token',apiData.data.token)
          }
          return apiData
        case 401:
          
          handleEleMessage(401,message || 'Unauthorized' )

          return Promise.reject(new Error(message || 'Unauthorized'))
        default:
          // 不是正确的 code
          handleEleMessage(code,message || 'Error')

          return Promise.reject(new Error(message))
      }
    },
    (error) => {
      // status 是 HTTP 状态码
      const {status,data} = error.response

      handleEleMessage(status,data.message || 'Error')
      
      return Promise.reject(error)
    }
  )
  return instance
}

/** 创建请求方法 */
function createRequest(instance: AxiosInstance) {
  return <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    // 默认配置
    const defaultConfig: AxiosRequestConfig = {
      // 接口地址
      baseURL: import.meta.env.VITE_APP_API_BASE_UEL,
      // 请求头
      headers: {
        'Content-Type': 'application/json'
      },
      // 请求体
      data: {},
      // 请求超时
      timeout: 6000,
      // 跨域请求时是否携带 Cookies
      withCredentials: false
    }
    // 将默认配置 defaultConfig 和传入的自定义配置 config 进行合并成为 mergeConfig
    const mergeConfig = { ...defaultConfig, ...config }
    return instance(mergeConfig)
  }
}

/** 用于请求的实例 */
const instance = createInstance()

/** 用于请求的方法 */
const request = createRequest(instance)
export default request
export type { ApiResponse, PaginatedResponse }
