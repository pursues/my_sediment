<script setup lang="ts">
import type { ChatDetailProps,ChatStatus } from '../hooks/chat'
import markdownit from 'markdown-it'
import { computed,getCurrentInstance,ref,onMounted,onBeforeUnmount,watch,toRefs } from 'vue'
// 基础markdown-it配置
const md = markdownit({
  html: true,
  breaks: true,
  linkify: true
})

// 后处理函数：清理HTML中的空白节点
function cleanMarkdownHtml(html: string): string {
  return html
    // 移除标签之间的空白字符和换行
    .replace(/>\s+</g, '><')
    // 移除开头和结尾的空白
    .trim()
    // 移除可能的空白段落
    .replace(/<p>\s*<\/p>/g, '')
    // 移除空白的div或其他容器
    .replace(/<div>\s*<\/div>/g, '')
    // 移除br标签避免换行符产生的行高间距
    .replace(/<br\s*\/?>/gi, '')
}


const props = defineProps<{
  loadingIndicator?: string
  progressIndicator?: string
  msg: ChatDetailProps
  isEnd: boolean
  status: ChatStatus | 'error',
  time?:string,
  setVisible?:boolean | undefined
}>()

const emits = defineEmits<{
  (e: 'visibleChange'): void
}>()

const { progressIndicator, loadingIndicator, msg, isEnd, status, time } = toRefs(props)

// 检查setVisible是否真的被传递
const setVisible = computed(() => {
  const instance = getCurrentInstance()
  const propsData = instance?.vnode.props || {}
  // console.log('setVisible真的被传递吗？', 'setVisible' in propsData || 'set-visible' in propsData)
  
  // 检查是否真的传递了setVisible（可能是驼峰命名或短横线命名）
  if ('setVisible' in propsData || 'set-visible' in propsData) {
    return props.setVisible
  }
  return undefined
})

// 内部手动切换状态
const manualToggle = ref<boolean | null>(null)

const progressIndicatorHtml = computed(() => {
  const rawHtml = md.render(progressIndicator.value || '')
  return cleanMarkdownHtml(rawHtml)
})

// 使用computed替代watch，避免频繁触发
const visible = computed(() => {
  // 如果有手动切换状态，优先使用
  if (manualToggle.value !== null) {
    return manualToggle.value
  }
  
  // 如果有外部设置的可见性，优先使用
  if (setVisible.value !== undefined) {
    return setVisible.value
  }
  // 因为思考完毕需要收起来，所以加一个status状态判断切换finished_thinking,如此往下return时会返回false
  // 默认显示逻辑
  return !!(isEnd.value && (status.value === 'generating' || status.value === 'checking'))
})

let intervalId: null | number = null

onMounted(() => {
  if (isEnd.value && status.value === 'generating' && msg.value.speaker === 'ai') {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    intervalId = window.setInterval(() => {
      if (msg.value.content && msg.value.content.length > 0 && intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      else if (msg.value.type !== 'text' && intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      else {
        if (!msg.value.indicator_expend_time) {
          msg.value.indicator_expend_time = 0
        }
        msg.value.indicator_expend_time += 1000
      }
    }, 1000)
  }
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})

const expendTime = computed(() => {
  // 是否已经停止定时器，没有的话则还是0 或者是已经思考完毕，则获取最后思考的时间
  if(intervalId || status.value === 'finished_thinking'){
    return Math.floor((msg.value.indicator_expend_time || 0) / 1000)
  }
  return 0
})
// 停止定时器
watch(()=> status.value, (value) => {
  if (value === 'ready' && msg.value.speaker === 'ai' && intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})
const visibleExpandTime = computed(() => {
  if (msg.value.type !== 'text') {
    return false
  }

  if (expendTime.value > 0 && status.value === 'ready') {
    return true
  }

  if (expendTime.value > 0 && msg.value.content && msg.value.content.length > 0) {
    return true
  }

  return false
})
function visibleChange(){
  manualToggle.value = !visible.value
  emits('visibleChange')
}
</script>

<template>
  <div class="max-w-max">
    <div class="flex items-center p-[17px] bg-[#272727] rounded-[24px] max-w-max mb-[12px]">
      <div class="i-ll-magic-line text-[20px] text-[#E5EAF3]" />
        <div class="px-[8px] text-[13px] leading-[17px] text-[#E5EAF3] font-500 flex items-center">
          {{ loadingIndicator }}
          <span class="loading-dot" v-if="(setVisible===undefined ? !expendTime : !time) && status !== 'ready'">
            <span class="dot dot-1">.</span>
            <span class="dot dot-2">.</span>
            <span class="dot dot-3">.</span>
          </span>
          <span v-if="time" class="time">{{ time }}</span>
        </div>
      <span v-if="visibleExpandTime" class="text-[13px] leading-[18px] font-300 text-[#A3A6AD] mr-[8px]">用时{{ expendTime }}秒</span>
      <div
        class="i-ll-arrow-up text-[20px] text-[#8D9095] cursor-pointer transition-all"
        :class="{
          'rotate-180': !visible,
        }"
        @click="visibleChange"
      />
    </div>
    <div v-if="visible" v-html="progressIndicatorHtml" class="w-full markdown-container progress-container mb-[24px] pl-[16px]">
    </div>
  </div>
</template>

<style lang="scss" scoped>
.progress-container {
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    color: #A3A6AD;
    border-width: 0px 0px 0px 1px;
    border-style: solid;
    border-color: #58585B;
    // white-space: pre-wrap;
    word-break: break-all;
}
.time{
  font-size: 13px;
  font-weight: normal;
  line-height: normal;
  letter-spacing: 0em;
  font-feature-settings: "kern" on;
  color: #A3A6AD;
  margin-left: 8px;
}

// 思考中的点动画
.loading-dot {
  display: inline-block;
  margin-left: 4px;
  font-size: 30px;
  vertical-align: top;
  position: relative;
  top: -6px;
  .dot {
    display: inline-block;
    opacity: 0.3;
    animation: dot-blink 1.5s infinite;
  }
  
  .dot-1 {
    animation-delay: 0s;
  }
  
  .dot-2 {
    animation-delay: 0.5s;
  }
  
  .dot-3 {
    animation-delay: 1s;
  }
}

@keyframes dot-blink {
  0%, 66% {
    opacity: 0.3;
  }
  33% {
    opacity: 1;
  }
}
</style>
