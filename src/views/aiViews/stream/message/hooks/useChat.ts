import { useRouter } from 'vue-router' // 导入路由模块
import { useChatAsk, useChatCreate, useChatJudge } from './api'
import useHistoryStore from './history'
import useChatStore from './chat'
import useScroll from './useScroll'
// 引入 useScroll

// 检查LaTeX公式是否完整的辅助函数
function checkIncompleteLatexFormula(text: string): boolean {
  // 检查单$符号是否成对
  const singleDollarMatches = text.match(/(?<!\$)\$(?!\$)/g) || []
  const hasIncompleteSingle = singleDollarMatches.length % 2 !== 0
  
  // 检查$$符号是否成对
  const doubleDollarMatches = text.match(/\$\$/g) || []
  const hasIncompleteDouble = doubleDollarMatches.length % 2 !== 0
  
  // 检查 \[ \] 是否成对
  const leftBrackets = (text.match(/\\\[/g) || []).length
  const rightBrackets = (text.match(/\\\]/g) || []).length
  const hasIncompleteBrackets = leftBrackets !== rightBrackets
  
  // 检查 \( \) 是否成对  
  const leftParens = (text.match(/\\\(/g) || []).length
  const rightParens = (text.match(/\\\)/g) || []).length
  const hasIncompleteParens = leftParens !== rightParens
  
  return hasIncompleteSingle || hasIncompleteDouble || hasIncompleteBrackets || hasIncompleteParens
}

export default function useChat() {
  const chatStore = useChatStore()
  const asideHistory = useHistoryStore()

  const router = useRouter() // 获取路由实例
  // const { scrollRef,scrollInnerRef, scrollToBottom } = useScroll() // 获取 scrollRef 和滚动方法
  const { scrollToBottom } = useScroll() // 获取 scrollRef 和滚动方法
  let isRequestStarted = false // 新增请求状态标志
  // 创建对话并跳转
  const createChat = async (question: string, tab?: IChatTabsEnum, jump: boolean = true, isReplace = false) => {
    if (question.trim() === '')
      return
    chatStore.setIsHistory(false)
    chatStore.setStopAsk(false)
    if (jump) {
      isReplace ? router.replace(`/message`) : router.push(`/message`)
    }
    chatStore.clearAllMessage()
    chatStore.addMessage('text', question, 'me')
    chatStore.setAnswerStatus('create') // 设置为正在加载状态
    // 调用创建对话的接口
    const { data, error } = await useChatCreate({ title: question, tab })
    asideHistory.updateHistoryDataData()

    if (error?.value) {
      console.error('创建对话失败', error)
      chatStore.setAnswerStatus('ready')
      return
    }

    chatStore.setChatId((data?.value as { id: string })?.id) // 将 chatId 存入 store

    // 跳转到新的消息页面
    if (chatStore.stopAsk) {
      return
    }
    // 在跳转后立即发起 judge 请求
    await sendMessage(question)
  }
  // 发送消息
  const sendMessage = async (question: string) => {
    if (question === '')
      return
    chatStore.setStopAsk(false)
    if (isRequestStarted)
      return
    // 发送消息后 消息框应该清空
    chatStore.setMessageValue('')
    // 添加用户消息到消息列表
    if (question && chatStore.answerStatus !== 'create') {
      chatStore.addMessage('text', question, 'me')
    }
    scrollToBottom()
    chatStore.setLoading(true) // 开启loading
    chatStore.setAnswerStatus('checking')
    let is_first = chatStore.messages.length == 1
    // 判断是否拒答
    chatStore.setJudgeController(new AbortController())
    const { data: judgeData, error: judgeError } = await useChatJudge(
      chatStore.chatId!,
      question, // 使用 messageValue
      is_first,
      chatStore?.judgeController as AbortController,
    )

    const judgeResult = judgeData?.value as { is_reject?: boolean; reject_text?: string } | undefined
    if (judgeError?.value || judgeResult?.is_reject) {
      if (judgeResult?.reject_text) {
                chatStore.addMessage('refuse', judgeResult.reject_text, 'ai')
        }
        chatStore.setAnswerStatus('not_pass') // 拒答状态
      chatStore.setLoading(false) // 请求结束，关闭loading
      chatStore.setJudgeController(null)
      return
    }
    if (chatStore.stopAsk) {
      return
    }
    // 创建 AbortController 用于控制流的取消
    // messageController.value = new AbortController()
    chatStore.setMessageController(new AbortController())
    isRequestStarted = true

    try {
      // 使用封装的 reqStream 发起流式请求，接收 AI 回复
      chatStore.setStopAsk(true)
      const responseStream = await useChatAsk(
        chatStore.chatId!,
        question, // 使用 messageValue
        chatStore?.messageController as AbortController,
      )
      chatStore.setAnswerStatus('generating')
      await tryForStream(responseStream)
      // messageController = null
      // 当流结束后，设置为完成状态
      chatStore.setAnswerStatus('ready')
      setTimeout(() => {
        scrollToBottom() // 滚动到底部
      }, 200)
      // messageController.value = null
    }
    catch (error) {
      dealCatchErr(error)
    }
    finally {
      isRequestStarted = false
      chatStore.setMessageController(null)
      chatStore.setAnswerStatus('ready')
    }
  }

  // 监听回车键发送消息
  const onEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && chatStore.messageValue.trim()) {
      sendMessage(chatStore.messageValue)
    }
  }

  // 获取历史对话记录
  const getChatHistory = async (chatId: string) => {
    // 跳转到新的消息页面
    chatStore.setChatId(chatId)

    try {
      const { data, error } = await useGetChatHistory(chatId) // 通过 chatId 获取历史对话
      if (error?.value) {
        console.error('获取历史对话失败', error)
        // chatStore.setHistoryLoading(false)
        return
      }
      // 将历史消息数据加载到 store
      chatStore.loadHistoryMessage(data?.value?.data || [])
      let lastData = data?.value?.data[data?.value?.data.length - 1]
      if (lastData?.type == 'agent') {
        chatStore.agentTableId = lastData?.tableId
      }

      // 用于延缓关闭地图
      if (chatStore.answerStatus === 'agent_interaction' && data?.value?.status === 'ready') {
        chatStore.isDelayMapClose = true
      }
      chatStore.setAnswerStatus(data?.value?.status)
      if (!chatStore.scrollFlag) {
        scrollToBottom()
      }
    }
    catch (error) {
      // chatStore.setHistoryLoading(false)
      chatStore.setAnswerStatus('ready')
    }
  }
  // 数据流处理抽出
  const tryForStream = async (responseStream: AsyncIterable<{ results: any }>) => {
    // 初始化一个变量来存储拼接的内容
    let responseText = ''
    // 处理流式响应
    for await (const chunk of responseStream) {
      try {
        // 跳出循环
        if (chunk?.results?.data === '[DONE]')
          break
        if (typeof chunk === 'string' && chunk === '[DONE]') {
          break
        }

        chatStore.setLoading(false)
        // 存text
        if (chunk?.results?.type === 'text') {
          // 说明思考完毕，设置状态
          if(chatStore.answerStatus !== 'finished_thinking'){
            chatStore.setAnswerStatus('finished_thinking')
          }
          responseText += chunk.results.data // 拼接文本
          
          // 检查是否有未完成的LaTeX公式
          const hasIncompleteFormula = checkIncompleteLatexFormula(responseText)
          
          // 更新 messages 数组中的已有消息
          const lastMessage = chatStore.messages[chatStore.messages.length - 1]
          if (lastMessage && lastMessage.speaker === 'ai') {
            // 如果没有未完成的公式或者是最后的内容，则立即更新
            if (!hasIncompleteFormula || chunk.results.data === '[DONE]') {
              lastMessage.content = responseText
            } else {
              // 暂存原始文本，延迟渲染避免公式被截断
              lastMessage.content = responseText
            }
          }
          else {
            // 如果找不到该消息，添加一个新的
            chatStore.addMessage('text', responseText, 'ai')
          }
          // chatStore.setAnswerStatus('generating') // 保持加载状态
        }

        // 存recommendation
        if (chunk?.results?.type === 'recommendation') {
          // 更新 messages 数组中的已有消息
          const lastMessage = chatStore.messages[chatStore.messages.length - 1]
          if (lastMessage && lastMessage.speaker === 'ai') {
            lastMessage.recommendation = chunk?.results?.data // 更新最后一条 AI 消息的内容
          }
          else {
            // 如果找不到该消息，添加一个新的
            chatStore.addMessage('text', '', 'ai', chunk?.results?.data)
          }
          // chatStore.setAnswerStatus('generating') // 保持加载状态
        }
        // 存memoryList 存相关记忆
        if (chunk?.results?.type === 'memoryList') {
          const lastMessage = chatStore.messages[chatStore.messages.length - 1]
          if (lastMessage && lastMessage.speaker === 'ai') {
            lastMessage.memoryList = chunk?.results?.data // 更新最后一条 AI 消息的内容
          }
          else {
            // 如果找不到该消息，添加一个新的
            chatStore.addMessage('text', '', 'ai', [], [], [], '', '', false, chunk?.results?.data)
          }
        }

        // 存agent
        if (chunk?.results?.type === 'agent') {
          chatStore.agentTableId = (chunk?.results as any)?.table_id
          // 更新 messages 数组中的已有消息
          const curAgentData = chunk?.results?.data
          const lastMessage = chatStore.messages[chatStore.messages.length - 1]
          if (lastMessage && lastMessage.speaker === 'ai') {
            lastMessage.agents = curAgentData // 更新最后一条 AI 消息的内容
            lastMessage.type = 'agent'
          }
          else {
            // 如果找不到该消息，添加一个新的
            chatStore.addMessage('agent', '', 'ai', [], curAgentData)
          }
          // chatStore.setAnswerStatus('generating') // 保持加载状态
        }
        // 存refrence
        if (chunk?.results?.type === 'ref') {
          // 更新 messages 数组中的已有消息
          const curAgentData = chunk?.results?.data
          const lastMessage = chatStore.messages[chatStore.messages.length - 1]
          if (lastMessage && lastMessage.speaker === 'ai') {
            lastMessage.reference = lastMessage.reference?.concat(curAgentData) // 更新最后一条 AI 消息的内容
          }
          else {
            // 如果找不到该消息，添加一个新的
            chatStore.addMessage('text', '', 'ai', [], [], curAgentData)
          }
          // chatStore.setAnswerStatus('generating') // 保持加载状态
        }
        // 存 agree
        if (chunk?.results?.type === 'agree') {
          // 更新 messages 数组中的已有消息
          const curAgentData = chunk?.results?.data
          const lastMessage = chatStore.messages[chatStore.messages.length - 1]
          if (lastMessage && lastMessage.speaker === 'ai') {
            lastMessage.content = curAgentData // 更新最后一条 AI 消息的内容
            lastMessage.agents = chunk?.results?.agents || []
            lastMessage.type = 'agree'
          }
          else {
            // 如果找不到该消息，添加一个新的
            chatStore.addMessage('agree', curAgentData, 'ai', [], chunk?.results?.agents || [], [])
          }
          // chatStore.setAnswerStatus('generating') // 保持加载状态
        }

        if (chunk.results.type === 'loading_indicator') {
          const curAgentData = chunk?.results?.data
          const lastMessage = chatStore.messages[chatStore.messages.length - 1]
          if (lastMessage && lastMessage.speaker === 'ai') {
            lastMessage.loading_indicator = curAgentData
          }
          else {
            // 如果找不到该消息，添加一个新的
            chatStore.addMessage('text', '', 'ai', [], [], [], curAgentData)
          }
        }

        if (chunk.results.type === 'progress_indicator') {
          const curAgentData = chunk?.results?.data
          const lastMessage = chatStore.messages[chatStore.messages.length - 1]
          if (lastMessage && lastMessage.speaker === 'ai') {
            lastMessage.progress_indicator += curAgentData
          }
          else {
            chatStore.addMessage('text', '', 'ai', [], [], [], '', curAgentData)
          }
        }

        if (chunk.results.type === 'intention_indicator') {
          const curAgentData = chunk?.results?.data
          const lastMessage = chatStore.messages[chatStore.messages.length - 1]
          if (lastMessage && lastMessage.speaker === 'ai') {
            lastMessage.intention_indicator = curAgentData
          }
          else {
            chatStore.addMessage('text', '', 'ai', [], [], [], '', '', curAgentData)
          }
        }
        if (!chatStore.scrollFlag) {
          scrollToBottom()
        }
      }
      catch (error) {
        console.error('解析流数据失败', error)
      }
    }
  }
  // 异常抽出
  const dealCatchErr = (error: unknown) => {
    if (error instanceof Error && error.name === 'FetchError' && error.message.includes('aborted')) {
      // 区分取消时机
      // if (isRequestStarted) {
      // chatStore.addMessage('text', '请求已停止', 'ai')
      chatStore.setAnswerStatus('ready')
      // }
    }
    else {
      chatStore.setAnswerStatus('ready') // 错误状态
      // 处理错误，判断最后一条是否为AI消息，如果是则更新内容，否则添加错误提示消息
      const lastMessage = chatStore.messages[chatStore.messages.length - 1]
      if (lastMessage && lastMessage.speaker === 'ai') {
        lastMessage.content = '服务器响应错误，请稍后重试'
        lastMessage.intention_indicator = false
      } else {
        chatStore.addMessage('text', '服务器响应错误，请稍后重试', 'ai') // 错误提示消息
      }
    }
    chatStore.setLoading(false) // 请求结束，关闭loading
    scrollToBottom() // 请求失败时滚动到底部
    chatStore.setMessageController(null)
  }
  // 续接流
  const getChatResumeStream = async (chatId: string) => {
    chatStore.setLoading(true) // 开启loading
    chatStore.setAnswerStatus('checking')
    chatStore.setMessageController(new AbortController())
    try{
      chatStore.setAnswerStatus('generating')
      const responseStream = await useChatResumeStream(chatId, chatStore?.messageController as AbortController)
      await tryForStream(responseStream)
      // 当流结束后，设置为完成状态
      chatStore.setAnswerStatus('ready')
      setTimeout(() => {
        scrollToBottom() // 滚动到底部
      }, 200)

    }catch(error){
      console.error('续接流失败', error)
      
      dealCatchErr(error)

    }finally{
      chatStore.setLoading(false)
      chatStore.setAnswerStatus('ready')
    }
  }
  // 取消 SSE 请求
  const cancelRequest = (type: string) => {
    if (type == 'stop') {
      useChatStop(chatStore?.chatId, 'chat').then((res) => {
        let data = res.data.value as any
        if (data.status == 'success') {
          breakRequest()
        }
        else {
          console.log('停止出错')
        }
      })
    }
    if (type == 'leave') {
      breakRequest()
    }
  }
  const breakRequest = () => {
    if (chatStore.answerStatus == 'checking' && !chatStore.stopAsk) {
      chatStore.setStopAsk(true)
      chatStore.setAnswerStatus('ready')
      if (chatStore?.judgeController)
        chatStore?.judgeController.abort()
      // 判断状态的 点击拒答
    }
    if (chatStore.stopAsk || chatStore.answerStatus == 'generating') {
      // 输出状态点击拒答
      if (chatStore?.messageController) {
        chatStore?.messageController.abort() // 中断 SSE 请求
      }
    }
  }
  return {
    createChat,
    sendMessage,
    onEnter, // 这里暴露 onEnter
    getChatHistory,
    cancelRequest,
    getChatResumeStream,
  }
}
