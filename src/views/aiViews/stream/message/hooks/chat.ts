import { defineStore } from 'pinia'
import { ref } from 'vue'
import useScroll from './useScroll'
import useHistoryStore from './history'

export interface Agent {
  name: string // agent姓名
  introduction: string // 简介
  id: string // agent_id
  status: boolean // 是否被删除
  color: string // agent颜色
}

export interface Reference {
  _id: string
  title: string
  url: string
  code_url?: string
  citation?: string
}
// pdf，视频内部跳转的链接
export interface InnerReference {
  _id: number
  video_id: string
  title: string
  text: string
  content: string
  time_stamp: string
  type: string
  page?: number
  citation?: string
  resource_id:string
}

interface Communication {
  id: string
  summary?: string
  email?: string
  status: 'finish' | 'in_progress'
}

interface ChatHistory {
  text: string
  id: string
  communi_id: string
  name: string
  date: number
  color: string
}

export type ChatStatus = 'create' | 'checking' | 'not_pass' | 'generating' | 'finished_thinking'| 'agent_interaction' | 'ready' | 'check_pass'

type chatType = 'text' | 'communication' | 'agree' | 'agent' | 'refuse'

export interface ChatDetailProps {
  type: chatType
  speaker: 'me' | 'ai'
  content?: string // 放回答文本或提问文本
  reference?: Reference[]
  recommendation?: string[] // 用于type为text的
  agents?: Agent[]
  communication?: Communication
  loading_indicator?: string
  progress_indicator?: string
  indicator_expend_time?: number
  intention_indicator?: boolean
  memoryList?: string[] // 相关记忆列表
}

export default defineStore('chat', () => {
  const chatId = ref<string | null>(null) // 聊天ID
  const messageValue = ref<string>('') // 用户输入的消息
  const messages = ref<ChatDetailProps[]>([]) // 存储消息记录

  //视频聊天的消息的，内部跳转的链接 // 测试用
  const videoInnerRef = ref([
    {
      _id: 1,
      title: '1.研究背景',
      content: '我是总结，我是总结，我是总结，我是总结，我是总结。',
      type: 'video',
      time: '00:10',
    },
    {
      _id: 2,
      title: '2.研究方法我是研究方法我是研究方法我是研究方法我是研究方法。',
      content: '我是研究方法我是研究方法我是研究方法我是研究方法。',
      type: 'video',
      time: '05:35',
    },
    { _id: 3, title: '3.实验设计', content: '我是实验设计我是实验设计我是实验设计。', type: 'video', time: '16:29' },
    { _id: 4, title: '4.实验结果', content: '实验结果实验结果实验结果实验结果实验结果。', type: 'video', time: '17:04' },
    { _id: 5, title: '5.实验结果', content: '实验结果实验结果实验结果实验结果实验结果。', type: 'video', time: '18:04' },
    { _id: 6, title: '6.实验结果', content: '实验结果实验结果实验结果实验结果实验结果。', type: 'video', time: '19:04' },
    { _id: 7, title: '7.实验结果', content: '实验结果实验结果实验结果实验结果实验结果。', type: 'video', time: '19:24' }
  ])
  const pdfInnerRef = ref([
    {
      _id: 1,
      title: '1.研究背景',
      content: "Teleoperation of humanoids can be categorized into three types: 1) task-space teleoperation [45, 46], 2) upper-bodyretargeted teleoperation [47, 48], and 3) whole-body teleoperation [6, 7, 13, 42, 49]. For the first and second types, the shared morphology between humans and humanoids is not fully utilized, and whole-body control must be solved in a task-specified way. This also raises the concern that, if tracking lower body movement is not necessary, the robot could opt for designs with better stability, such as a quadruped [50] or wheeled configuration [51].\n\nOur work belongs to the third type and is the first to achieve learning-based whole-body teleoperation. Moreover, our approach does not require capture markers or force sensors on the human teleoperator, as we directly employ an RGB camera to capture human motions for tracking, potentially paving the way for collecting large-scale humanoid data for training autonomous agents.",
      type: 'pdf',
      page: 1,
    },
    {
      _id: 2,
      title: '2.研究方法',
      content: '我是研究方法我是研究方法我是研究方法我是研究方法。',
      type: 'pdf',
      page: 2,
    },
    {
      _id: 3,
      title: '3.研究方法',
      content: '我是研究方法我是研究方法我是研究方法我是研究方法。',
      type: 'pdf',
      page: 3,
    },
  ])

  const answerStatus = ref<ChatStatus | 'error'>('create') // 当前对话状态
  const loading = ref<boolean>(false) // loading状态
  // const historyLoading = ref<boolean>(false) // 加载历史记录的loading
  const agentTableId = ref<string>('')
  const messageController = ref<null | AbortController>(null)
  const judgeController = ref<null | AbortController>(null)
  const stopAsk = ref<boolean>(false)
  const isHistory = ref<boolean>(true)
  const isDelayMapClose = ref(false)
  const scrollFlag = ref(false)
  // 添加消息
  const addMessage = (type: chatType, content: string, speaker: 'me' | 'ai', recommendation?: string[], agents?: Agent[], reference?: Reference[], loading_indicator?: string, progress_indicator?: string, intention_indicator?: boolean, memoryList?: string[]) => {
    messages.value.push({
      type,
      speaker,
      content: content || '',
      reference: reference || [],
      recommendation: recommendation || [],
      memoryList: memoryList || [],
      agents: agents || [],
      loading_indicator: loading_indicator || '',
      progress_indicator: progress_indicator || '',
      indicator_expend_time: 0,
      intention_indicator: intention_indicator === false ? false : undefined,
    })
  }

  // 设置消息内容
  const setMessageValue = (value: string) => {
    messageValue.value = value
  }

  // 设置对话状态
  const setAnswerStatus = (status: ChatStatus | 'error') => {
    console.log('setAnswerStatus', status)
    answerStatus.value = status
  }

  // 设置loading状态
  const setLoading = (status: boolean) => {
    loading.value = status
  }

  // 设置历史记录Loading状态
  // const setHistoryLoading = (status: boolean) => {
  //   historyLoading.value = status
  // }
  // 设置 chatId
  const setChatId = (id: string) => {
    chatId.value = id
  }
  const setScrollFlag = (bol: boolean) => {
    scrollFlag.value = bol
  }
  // 清空 消息对话
  const clearAllMessage = () => {
    messages.value = []
  }
  const setMessageController = (val: AbortController | null) => {
    messageController.value = val
  }
  const setJudgeController = (val: AbortController | null) => {
    judgeController.value = val
  }
  const setIsHistory = (val: boolean) => {
    isHistory.value = val
  }
  const setStopAsk = (bol: boolean) => {
    stopAsk.value = bol
  }
  // 加载历史消息
  const loadHistoryMessage = (historyMessages: ChatDetailProps[]) => {
    messages.value = historyMessages
  }

  // 当前agent互动地图所需要所有数据
  const agentCommunicationData = ref<{
    joinedAgents: { id: string, name: string, color: string }[]
    otherAgents: { id: string, name: string, color: string }[]
    data: ChatHistory[]
  }>({
    joinedAgents: [],
    otherAgents: [],
    data: [],
  })

  // 添加agent互动总结
  const addAgenntMesage = (id: string, status: 'finish' | 'in_progress', summary?: string, email?: string) => {
    messages.value.push({
      type: 'communication',
      speaker: 'ai',
      communication: {
        id,
        status,
        summary: summary || '',
        email: email || '',
      },
    })
  }

  const { scrollToBottom } = useScroll()

  const agentComuniController = ref<null | AbortController>(null)
  // const createAgentCommunication = async (id: string, question: string, joined_agent_ids: string[]) => {
  //   if (agentComuniController.value)
  //     agentComuniController.value.abort()
  //   agentComuniController.value = new AbortController()

  //   addMessage('text', question, 'me')

  //   if (question === '同意') {
  //     joined_agent_ids = []
  //   }

  //   try {
  //     const responseStream = await useAgentCommunication(id, question, joined_agent_ids, agentComuniController.value)

  //     // 处理流式响应
  //     for await (const chunk of responseStream) {
  //       try {
  //         // 跳出循环
  //         if (typeof chunk === 'string' && chunk === '[DONE]') {
  //           messages.value.forEach((i) => {
  //             if (i.type === 'communication' && i.communication) {
  //               i.communication.status = 'finish'
  //             }
  //           })
  //           break
  //         }

  //         if (typeof chunk === 'string') {
  //           continue
  //         }

  //         const results = chunk.results
  //         if (!results?.type)
  //           continue

  //         if (results.type === 'chatSumUp') {
  //           const chatSumupData = results as ChatSumup
  //           const agentMessage = messages.value.find(item => item.type === 'communication' && item.communication?.id === chatSumupData.communi_id)
  //           if (agentMessage) {
  //             agentMessage.communication!.status = 'in_progress'
  //             agentMessage.communication!.summary = chatSumupData.data
  //           }
  //           else {
  //             addAgenntMesage(chatSumupData.communi_id, 'in_progress', chatSumupData.data)
  //           }
  //         }
  //         else if (results.type === 'chatInfo') {
  //           const chatInfo = results as ChatInfo
  //           const agentMessage = messages.value.find(item => item.type === 'communication' && item.communication?.id === chatInfo.communi_id)
  //           if (agentMessage) {
  //             agentMessage.communication!.status = 'in_progress'
  //             agentMessage.communication!.email = chatInfo.email
  //           }
  //           else {
  //             addAgenntMesage(chatInfo.communi_id, 'in_progress', '', chatInfo.email)
  //           }
  //         }
  //         else if (results.type === 'chatHistory') {
  //           const chatHistoryRes = results as ChatHistoryRes
  //           const { type, ...chatHistoryData } = chatHistoryRes
  //           agentCommunicationData.value.data.push(chatHistoryData as ChatHistory)
  //         }
  //       }
  //       catch (e) {
  //         console.error(e)
  //       }
  //     }
  //   }
  //   catch (error: unknown) {
  //     console.error(error)
  //   }
  //   finally {
  //     if (!agentComuniController.value?.signal.reason) {
  //       isDelayMapClose.value = true
  //     }
  //     setAnswerStatus('ready')
  //     setLoading(false)

  //     if (!scrollFlag.value) {
  //       scrollToBottom()
  //     }
  //   }
  // }

  // 获取agen互动中，需要使用到的agent信息
  // const initAgentdata = async (joinedAgents: { id: string, name: string, color: string }[]) => {
  //   agentCommunicationData.value.joinedAgents = joinedAgents.map(i => ({ id: i.id, name: i.name, color: i.color }))
  //   const ids = joinedAgents.map(i => i.id)
  //   if (currentUser.value?.id) {
  //     ids.push(currentUser.value.id)
  //   }

  //   const { data, error } = await useAgentOthers(ids)
  //   console.log('useAgentOthers', data.value, error.value)
  //   if (!error.value && data.value) {
  //     agentCommunicationData.value.otherAgents = data.value.map(i => ({ id: i.id, name: i.name, color: i.color })).slice(0, 10)
  //     return true
  //   }
  //   return false
  // }

  // const sendAgentMessage = async (question: string, agents: Agent[]) => {
  //   if (!chatId.value)
  //     return
  //   agentCommunicationData.value.joinedAgents = []
  //   agentCommunicationData.value.otherAgents = []
  //   agentCommunicationData.value.data = []

  //   setAnswerStatus('agent_interaction')
  //   setLoading(true)
  //   const result = await initAgentdata(agents)
  //   console.log('result', result)
  //   if (!result) {
  //     setAnswerStatus('ready')
  //     setLoading(false)
  //     return
  //   }

  //   createAgentCommunication(chatId.value, question, agents.map(i => i.id))
  // }

  // 获取当前agent互动对话的数据,用于轮询
  // const setAgentData = async () => {
  //   if (!chatId.value) {
  //     return
  //   }

  //   setLoading(true)
  //   const { data, error } = await useAgentCommunications(chatId.value)

  //   if (!data.value || error.value) {
  //     setLoading(false)
  //     return
  //   }

  //   if (agentCommunicationData.value.otherAgents.length === 0) {
  //     const res = await initAgentdata(data.value.other_agents)
  //     if (!res) {
  //       setLoading(false)
  //     }
  //   }

  //   agentCommunicationData.value.data = data.value.data

  //   if (data.value.status === 'in_progress') {
  //     setTimeout(() => {
  //       setAgentData()
  //     }, 3000)
  //   }
  //   else {
  //     setAnswerStatus('ready')
  //     setLoading(false)
  //   }
  // }

  function stopAgentInteraction() {
    agentComuniController.value?.abort()
    answerStatus.value = 'ready'
    isDelayMapClose.value = false
  }

  function clearStore() {
    setChatId('')
    stopAgentInteraction()
    setIsHistory(true)
    clearAllMessage()
    setAnswerStatus('create')
    setLoading(false)
    scrollFlag.value = false
    // setHistoryLoading(false)
  }

  const asideHistory = useHistoryStore()
  function updateDot() {
    if (chatId.value) {
      asideHistory.updateLocalDotStatus(chatId.value, false)
      // useHsitoryDot({ id: chatId.value, isUpdate: false })
    }
  }

  return {
    chatId, // 直接访问 chatId
    messageValue,
    messages,
    answerStatus,
    loading,
    agentTableId,
    // historyLoading,
    messageController,
    stopAsk,
    judgeController,
    isHistory,
    addMessage,
    setMessageValue,
    setAnswerStatus,
    setLoading,
    setChatId, // 直接访问 setChatId
    clearAllMessage,
    loadHistoryMessage,
    // setHistoryLoading,
    // sendAgentMessage,
    agentCommunicationData,
    // setAgentData,
    stopAgentInteraction,
    setMessageController,
    setStopAsk,
    setJudgeController,
    setIsHistory,
    clearStore,
    isDelayMapClose,
    scrollFlag,
    setScrollFlag,
    updateDot,
    videoInnerRef,
    pdfInnerRef,
  }
})
