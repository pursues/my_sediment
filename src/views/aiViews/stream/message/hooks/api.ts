import { Stream } from './stream'

interface ChatRes {
  type: 'chat'
  text: string
  data: string
}
interface TextRes {
  type: 'text'
  data: string
}

interface MemoryListRes {
  type: 'memoryList'
  data: string[]
}

interface RecommendationRes {
  type: 'recommendation'
  data: string[]
}

interface ReferenceRes {
  type: 'ref'
  data: { _id: string, title: string, url: string, code_url: string, citation: string }[]
}

interface AgentRes {
  type: 'agent'
  data: { name: string, introduction: string, id: string, color: string, status: boolean }[]
}

interface LoadingIndicatorRes {
  type: 'loading_indicator'
  data: string
}

interface ProgressIndicator {
  type: 'progress_indicator'
  data: string
}

interface AgreeRes {
  type: 'agree'
  data: string
  agents: { name: string, introduction: string, id: string, color: string, status: boolean }[]
}
interface CodeRes {
  type: 'code'
  data: string
}

interface IntentionIndicator {
  type: 'intention_indicator'
  data: boolean
}


async function reqStream<T>(url: string, options: { controller: AbortController } ) {
  // const { defaults } = await beforeFetch(url)

  const { controller, ...rest } = options
  // const params = defu(defaults, rest, {
  //   responseType: 'stream',
  //   timeout: 1000 * 60 * 10,
  //   signal: controller.signal,
  // })
  // const res = await ofetch<T, 'stream'>(url)
  const res = new ReadableStream<Uint8Array>()
  return Stream.fromSSEResponse<T>(res as ReadableStream<Uint8Array>, controller)
}


// 流式输出对话内容
export function useChatAsk(sessionId: string, question: string, controller: AbortController) {
  return reqStream<{
    results: TextRes | RecommendationRes | ReferenceRes | AgentRes | LoadingIndicatorRes | ProgressIndicator | AgreeRes | IntentionIndicator | MemoryListRes
  }>('/api/chat/ask', {
    method: 'POST',
    body: { id: sessionId, question },
    headers: {
      'Accept': 'text/event-stream', // 服务器推送流事件
      'Content-Type': 'application/json', // 确保请求内容为 JSON
    },
    controller,
    signal: controller.signal,
  })
}
export type IChatTabsEnum = 'explore_idea' | 'optimize_idea' | 'cooperation' | null
interface IUseChatCreateProps {
  title: string
  tab?: IChatTabsEnum
}

// 创建对话
export function useChatCreate(params: IUseChatCreateProps) {
  // 一个正常的请求接口方法
  // return useCustomFetch('/api/chat/create', {
  //   method: 'POST',
  //   body: params,
  // })
}

// 判断拒答
export function useChatJudge(id: string, question: string, isFirst: boolean, controller: AbortController) {
  // return useCustomFetch('/api/chat/judge', {
  //   method: 'POST',
  //   body: {
  //     id,
  //     question,
  //     is_first: isFirst,
  //   }, 
  // }, controller)
}