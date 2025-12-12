<script setup lang="ts">
import type { ChatDetailProps } from './hooks/chat'
import useChatStore from './hooks/chat'
import { onMounted,computed,ref,watch,onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import useChat from './hooks/useChat'
import { getEleSize } from '@/utils/common'

// 获取路由中的 chatId 参数
const route = useRoute()
const chatStore = useChatStore()
const router = useRouter()
const inputBoxRef = ref<HTMLElement | null>(null)
const size = ref(getEleSize(inputBoxRef))
const {
  sendMessage,
  getChatHistory,
  cancelRequest,
  getChatResumeStream,
} = useChat() // 使用 onEnter 和 scrollRef

const { answerStatus, agentCommunicationData, loading, isDelayMapClose } = storeToRefs(chatStore)

const isFullScreenMap = ref(false)
const visibleMap = computed(() => {
  if (isDelayMapClose.value)
    return true
  if (answerStatus.value !== 'agent_interaction')
    return false

  if (
    agentCommunicationData.value.joinedAgents.length === 0
    || agentCommunicationData.value.otherAgents.length === 0
  ) {
    return false
  }

  return true
})


onMounted(async () => {
  const queryCharId = route.query.chatId as string
  if (queryCharId) {
    chatStore.setChatId(queryCharId)
  }
  addScrollEve()
  // console.log(size)
  // const chatId = route.params.id as string
  // const type = route.query.type // 获取 type 参数，判断是否是新创建的对话
  // chatStore.setChatId(chatId) // 设置 chatId 到 store
  // // 如果是历史对话，调用 getChatHistory 获取历史消息
  // if (type !== 'new' && chatId) {
  //   await getChatHistory(chatId)
  //   if (answerStatus.value !== 'ready' && answerStatus.value !== 'not_pass') {
  //     chatHistoryInterval(chatId)
  //   }
  // }
  // 移除 type 参数，避免刷新后仍存在
  // if (type === 'new') {
  //   // 复制当前的查询参数对象
  //   const newQuery = { ...route.query }
  //   // 删除 type 参数
  //   delete newQuery.type
  //   // 使用 router.replace 替换当前路由，移除 type 参数
  //   router.replace({
  //     path: route.path,
  //     query: newQuery,
  //   })
  // }
})

// let interval: any = null
// function chatHistoryInterval(chatId: string) {
//   if (interval) {
//     clearInterval(interval)
//   }
//   interval = setInterval(() => {
//     getChatHistory(chatId)
//   }, 1000)
// }
// watch(answerStatus, (val: string) => {
//   if (val === 'ready' || val === 'not_pass' || val === 'check_pass') {
//     clearInterval(interval)
//   }
// })
// 监听 chatId 的变化，切换历史记录时更新聊天记录
watch(() => chatStore.chatId, async (newChatId: string | null) => {
  if (newChatId && chatStore.isHistory) {
    chatStore.updateDot()
    router.replace({
      path: route.path,
      query: {
        chatId: newChatId,
      },
    })
    // if (interval) {
    //   clearInterval(interval)
    // }
    cancelRequest('leave')
    chatStore.clearStore()
    await getChatHistory(newChatId) // 获取新的历史记录
    if (answerStatus.value !== 'ready' && answerStatus.value !== 'not_pass' && answerStatus.value !== 'check_pass') {
      // chatHistoryInterval(newChatId)
      // 不轮询获取，改用续接流
      getChatResumeStream(newChatId)
    }
  }
  if (newChatId) {
    router.replace({
      path: route.path,
      query: {
        chatId: newChatId,
      },
    })
  }
}, { immediate: true })

onBeforeUnmount(() => {
  chatStore.updateDot()
  // if (interval) {
  //   clearInterval(interval)
  // }

  cancelRequest('leave')
  chatStore.clearStore()
})

watch([answerStatus, loading], (value) => {
  if (value[0] === 'agent_interaction' && !value[1]) {
    // chatStore.setAgentData()
  }
  // if (value[0] === 'ready' && !value[1]) {
  //   toolTipsRef.value.setupEventListeners()
  // }
})
// watch(historyLoading, (value: boolean) => {
//   if (!value) {
//     nextTick(() => {
//       toolTipsRef.value.setupEventListeners()
//     })
//   }
// })


function stopAnswer() {

  chatStore.setStopAsk(true)
  cancelRequest('stop')
  chatStore.stopAgentInteraction()
  // if (interval) {
  //   clearInterval(interval)
  // }
}

// onBeforeUnmount(() => {
//   stopAnswer()
// })

const lastMessage = computed(() => {
  if (chatStore.messages.length === 0)
    return null
  return chatStore.messages[chatStore.messages.length - 1]
})
function sendMessageHandler() {
  if (chatStore.messageValue) {
    const str = chatStore.messageValue.trim() || ''
    if (str.length > 0 && str.length < 10001) {
      sendMessage(str)
    }
  }
}

function isVisibleIndicator(msg: ChatDetailProps, index: number) {
  if (msg.speaker !== 'ai' || ['communication', 'refuse', 'agent'].includes(msg.type)) {
    return false
  }

  if (msg.intention_indicator === false) {
    if ((index === chatStore.messages.length - 1) && (answerStatus.value === 'generating') && !msg.content) {
      return true
    }
    return false
  }
  return true
}
function addScrollEve() {
  const scroll = document.getElementById('scrollRef') as HTMLElement
  scroll.addEventListener('scroll', () => {
    // 检查滚动位置是否在底部
    const isAtBottom = scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 1
    if (!isAtBottom) {
      // 用户手动滚动且不在底部，标记为人工接管
      chatStore.setScrollFlag(true)
    }
    else {
      // 用户将滚动条拉到底部，恢复自动滚动
      chatStore.setScrollFlag(false)
    }
  })
}
// 目前无需要，暂注
// const filterMessage = computed(() => {
//   console.log(chatStore.messages)
//   return chatStore.messages.filter((msg: ChatDetailProps) => {
//     if (msg.type === 'communication') {
//       if (msg.communication?.email && msg.communication?.summary) {
//         return true
//       }
//       return false
//     }
//     return true
//   })
// })
function contentKeyDown(e: { preventDefault?: any, code?: any, isComposing?: any, shiftKey?: any }) {
  if (answerStatus.value !== 'ready' && answerStatus.value !== 'not_pass')
    return
  const { code, isComposing, shiftKey } = e
  if (code === 'Enter') {
    // 不是输入法回车且没有同时按shift键时，触发发送事件
    if (!isComposing && !shiftKey) {
      e.preventDefault()
      sendMessageHandler()
    }
  }
}

</script>

<template>
  <div class="message-content">
    <div
      id="scrollRef"
      class="message-box"
      :style="{ height: `calc(100% - ${size.height}px)` }"
    >
      <div id="scrollInnerRef" class="scroll-inner">
        <div v-for="(msg, index) in chatStore.messages" :key="index" class="message">
          <!-- <div
            v-if="msg.type === 'text'"
            class="message-p"
            :class="msg.speaker === 'me' ? 'me' : 'ai'"
            v-html="convertMarkdown(msg, index)"
          /> -->
          <ChatIndicator
            v-if="isVisibleIndicator(msg, index)"
            :loading-indicator="msg.loading_indicator || 'AI 思考中'"
            :progress-indicator="msg.progress_indicator || ''"
            :indicator-expend-time="msg.indicator_expend_time || 0"
            :msg="msg"
            :is-end="index === (chatStore.messages.length - 1)"
            :status="answerStatus"
          />
          <Content
            v-if="msg.type === 'text' || msg.type === 'refuse'"
            :content="msg.content"
            :speaker="msg.speaker"
            :reference="msg.reference"
            :index="index"
          />
          <!-- 点赞和点踩 -->
          <template v-if="index !== (chatStore.messages.length - 1) || answerStatus === 'ready'">
            <MinComp v-if="msg.speaker !== 'me' && msg.type === 'text'" :text="msg.content || ''" />
          </template>
        </div>
        <!-- loading -->
        <ChatIndicator
          v-if="(answerStatus === 'generating' || answerStatus === 'checking') && lastMessage?.speaker === 'me'"
          loading-indicator="AI 思考中"
          progress-indicator=""
          :msg="lastMessage"
          :is-end="true"
          :status="answerStatus"
        />
        <div v-if="answerStatus === 'agent_interaction'" class="loading">
          <img class="loading-img" src="~/assets/icons/loading.png">
          <div class="text">
            我正在和这些学习搭子的Agent进一步沟通
          </div>
          <div class="time">
            可3分钟后再来
          </div>
        </div>
      </div>
    </div>
    <!-- <div v-if="answerStatus !== 'ready' && answerStatus !== 'not_pass'" class="stopAnswer" @click="stopAnswer">
      <img src="~/assets/icons/stop-circle.png" class="stop-icon">
      <div class="stop-text">
        {{ answerStatus === 'agent_interaction' ? '停止互动' : '停止生成' }}
      </div>
    </div> -->
    <div ref="inputBoxRef" class="message-input-box">
      <div class="message-input">
        <el-input
          v-model="chatStore.messageValue"
          type="textarea"
          resize="none"
          :autosize="{ minRows: 2, maxRows: 8 }"
          placeholder="输入您的问题或想法"
          @keydown="contentKeyDown"
        />
        <div class="operate">
          <img v-if="answerStatus !== 'ready' && answerStatus !== 'not_pass'" class="stop-icon" src="~/assets/icons/stop-circle.png" @click="stopAnswer">
          <div
            v-else
            class="i-study-send send-icon"
            :style="{
              background: chatStore.messageValue.trim() ? '#00D382' : '#6C6E72',
            }"
            @click="sendMessageHandler"
          />
        </div>
      </div>
    </div>
    <ToolTips />
  </div>
  <template v-if="visibleMap">
    <AgentInteraction
      v-model="isFullScreenMap"
      :data="agentCommunicationData"
      @stop="stopAnswer"
    />
  </template>
</template>

<style lang="scss" scoped>
.message-content {
  width: 100%;
  height: 100%;
  padding: 34px 0px 24px;
  background-image: url('~/assets/images/page-bg.webp');
  background-repeat: no-repeat;
  background-size: 100% 320px;
  background-position: left top;
  // background-color: #141414;
}
.message-box::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
.message-box {
  width: calc(100% - 380px);
  min-width: 800px;
  height: calc(100% - 104px);
  overflow-y: auto;
  margin: 0 190px;
  position: relative;
  scrollbar-width: none;
   -ms-overflow-style: none;
  .message:last-child {
    margin-bottom: 0;
  }
  .message {
    margin-bottom: 24px;
    .message-p {
      color: #e5eaf3;
    }
    .meMsg {
      padding: 16px;
      float: right;
      width: fit-content;
      background-color: #008858;
      border-radius: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .ai {
      float: left;
      width: fit-content;
    }
  }
  .message::after {
    content: '';
    display: table; /* 或者使用 display: block; */
    clear: both;
  }
  .loading {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background: #272727;
    padding: 16px;
    border-radius: 24px;
    float: left;
    .loading-img {
      width: 16px;
      height: 16px;
      display: block;
      animation: rotateAnimation 2s linear infinite;
    }
    .text {
      color: #e5eaf3;
      font-size: 13px;
      margin: 0 8px;
    }
    .time {
      color: #a3a6ad;
      font-size: 13px;
    }
  }
}
.message-box::after {
  content: '';
  display: table;
  clear: both; /* 清除浮动 */
}
@keyframes rotateAnimation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.message-input-box {
  width: 100%;
  min-height: 104px;
  background: #141414;
  // position: absolute;
  // bottom: 24px;
  // left: 50%;
  // transform: translateX(-50%);
  padding-top: 24px;
}
.message-input {
  width: calc(100% - 380px);
  min-width: 800px;
  min-height: 80px;
  background: #272727;
  border-radius: 12px;
  position: relative;
  margin: 0 190px;
  .operate {
    position: absolute;
    right: 12px;
    bottom: 10px;
    cursor: pointer;
    .send-icon {
      font-size: 24px;
    }
    .stop-icon {
      width: 24px;
      height: 24px;
      display: block;
    }
  }
}
// .stopAnswer {
//   border: 1px solid #4c4d4f;
//   width: 120px;
//   height: 46px;
//   border-radius: 60px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   padding: 10px 18px;
//   margin: 0 auto;
//   cursor: pointer;
//   position: absolute;
//   bottom: 40px;
//   left: 50%;
//   transform: translateX(-50%);
//   background: #141414;
//   .stop-text {
//     color: #e5eaf3;
//     font-size: 14px;
//   }
//   .stop-icon {
//     width: 16px;
//     height: 16px;
//     display: block;
//     margin-right: 8px;
//   }
// }
</style>
