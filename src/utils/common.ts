
import { ElMessageBox } from 'element-plus'
import { markRaw, h ,ref,watchEffect,Ref} from 'vue'

// 创建警告图标组件
const WarnTriangleIcon = {
  name: 'WarnTriangleIcon',
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      width: '22',
      height: '22',
      viewBox: '0 0 22 22'
    }, [
      h('path', {
        d: 'M19.95871537246704,16.238538271713256C19.95871537246704,16.238538271713256,12.34491537246704,4.366700271713257,12.34491537246704,4.366700271713257C12.068015372467041,3.9335752717132566,11.555155372467041,3.666738271713257,11.00000537246704,3.666738271713257C10.444845372467041,3.666738271713257,9.93200537246704,3.9337892717132568,9.655075372467042,4.366700271713257C9.655075372467042,4.366700271713257,2.041230372467041,16.238538271713256,2.041230372467041,16.238538271713256C1.763867272467041,16.670838271713258,1.7640819724670411,17.203438271713257,2.041445372467041,17.635638271713255C2.319023372467041,18.067938271713256,2.831641372467041,18.334138271713257,3.386155372467041,18.33373827171326C3.386155372467041,18.33373827171326,18.61381537246704,18.33373827171326,18.61381537246704,18.33373827171326C19.16861537246704,18.333838271713255,19.68121537246704,18.067938271713256,19.95851537246704,17.635638271713255C20.23591537246704,17.203438271713257,20.23621537246704,16.670838271713258,19.95871537246704,16.238538271713256C19.95871537246704,16.238538271713256,19.95871537246704,16.238538271713256,19.95871537246704,16.238538271713256ZM11.91671537246704,16.500038271713258C11.91671537246704,16.500038271713258,10.08347537246704,16.500038271713258,10.08347537246704,16.500038271713258C10.08347537246704,16.500038271713258,10.08347537246704,14.666738271713257,10.08347537246704,14.666738271713257C10.08347537246704,14.666738271713257,11.91671537246704,14.666738271713257,11.91671537246704,14.666738271713257C11.91671537246704,14.666738271713257,11.91671537246704,16.500038271713258,11.91671537246704,16.500038271713258C11.91671537246704,16.500038271713258,11.91671537246704,16.500038271713258,11.91671537246704,16.500038271713258ZM11.91671537246704,7.333258271713257C11.91671537246704,7.333258271713257,11.91671537246704,13.749838271713257,11.91671537246704,13.749838271713257C11.91671537246704,13.749838271713257,10.08347537246704,13.749838271713257,10.08347537246704,13.749838271713257C10.08347537246704,13.749838271713257,10.08347537246704,7.333048271713257,10.08347537246704,7.333048271713257C10.08347537246704,7.333048271713257,11.91671537246704,7.333258271713257,11.91671537246704,7.333258271713257C11.91671537246704,7.333258271713257,11.91671537246704,7.333258271713257,11.91671537246704,7.333258271713257Z',
        fill: '#E6A23C',
        'fill-opacity': '1'
      })
    ])
  }
}

interface ModalObj {
  title?: string;
  content?: string;
  subContent?: string;  // 新增：副内容，用于换行显示
  okText?: string;
  cancelText?: string;
  showCancel?: boolean;  // 新增：是否显示取消按钮，默认为 true
  type?: 'warning' | 'info' | 'success' | 'error';
  width?: string | number;
  customClass?: string;
  showIcon?: boolean;
}

export async function modalWait(obj: ModalObj) {
  try {
    // 组合内容：如果有 subContent，则换行显示
    const content = obj?.subContent 
      ? `${obj?.content ?? '确定删除吗？'}<br/>${obj.subContent}`
      : obj?.content ?? '确定删除吗？'
    // 默认显示取消按钮
    const showCancelButton = obj?.showCancel !== false  
    await ElMessageBox.confirm(
      content,
      obj?.title ?? '',
      {
        confirmButtonText: obj?.okText ?? '确定',
        cancelButtonText: obj?.cancelText ?? '取消',
        showCancelButton: showCancelButton,
        type: obj?.type ?? 'warning',
        icon: obj?.showIcon !== false ? markRaw(WarnTriangleIcon) : undefined,
        customClass: `custom-message-box ${obj?.customClass || ''}`,
        customStyle: {
          width: typeof obj?.width === 'number' ? `${obj.width}px` : obj?.width || '420px',
          borderRadius: '12px'
        },
        dangerouslyUseHTMLString: true  // 允许使用 HTML
      }
    )
    return true
  } catch {
    return false
  }
}

/**
 * 防抖函数 - 确保最后一次调用会被触发
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @param immediate 是否立即执行第一次调用，默认为 false
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null
  let lastCallTime = 0
  let lastArgs: Parameters<T> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    lastArgs = args

    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    // 如果是立即执行模式且是第一次调用
    if (immediate && lastCallTime === 0) {
      func.apply(this, args)
      lastCallTime = now
      return
    }

    // 设置新的定时器
    timer = setTimeout(() => {
      // 确保执行最后一次调用的参数
      if (lastArgs) {
        func.apply(this, lastArgs)
      }
      timer = null
      lastCallTime = 0
      lastArgs = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0
  let timer: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastCallTime >= delay) {
      // 如果距离上次调用已经超过延迟时间，立即执行
      func.apply(this, args)
      lastCallTime = now
    } else {
      // 否则，设置定时器在剩余时间后执行
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        func.apply(this, args)
        lastCallTime = Date.now()
        timer = null
      }, delay - (now - lastCallTime))
    }
  }
}


export function getEleSize(domRef: Ref<HTMLElement | null>) {
  const width = ref<number>(0)
  const height = ref<number>(0)
  const observer = new ResizeObserver(() => {
    if (domRef.value) {
      width.value = domRef.value.clientWidth
      height.value = domRef.value.clientHeight
    }
  })
  // 设置一个变量来存储dom元素，让ResizeObserver知道它要监听哪个元素
  // 因为domRef.value可能会变化，所以我们需要一个变量来存储它,这样我们就可以在domRef.value变化的时候取消监听，防止内存泄漏并提高性能
  // 如果在该函数中需要同时监听多个dom，可以考虑使用weakMap来存储dom和ResizeObserver实例
  let observerDom: HTMLElement | null = null
  watchEffect(() => {
    const newDom = domRef.value
    // 如果我们传入的dom存在，就让ResizeObserver监听它
    // 如果我们传入的dom不存在，就让ResizeObserver取消监听
    if (newDom) {
      observerDom = newDom
      observer.observe(observerDom)
    }
    else if (observerDom) {
      observer.unobserve(observerDom)
    }
  })
  console.log(width, height)
  return { width, height }
}

export interface DataItem {
  id: string
  type: string
  title: string
  description: string
  date: number
  isUpdate: boolean
}
export function classifyDataByTime(data: DataItem[]): {
  today: DataItem[]
  yesterday: DataItem[]
  lastSevenDays: DataItem[]
  lastThirtyDays: DataItem[]
} {
  const now = new Date()
  // 获取今天的起始时间戳
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  // 获取昨天的起始时间戳
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime()
  // 获取近 7 天前的起始时间戳
  const sevenDaysAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime()
  // 获取近 30 天前的起始时间戳
  const thirtyDaysAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).getTime()
  const todayData: DataItem[] = []
  const yesterdayData: DataItem[] = []
  const lastSevenDaysData: DataItem[] = []
  const lastThirtyDaysData: DataItem[] = []
  data.forEach((item) => {
    const timestamp = item.date
    if (timestamp >= todayStart) {
      todayData.push(item)
    }
    else if (timestamp >= yesterdayStart && timestamp < todayStart) {
      yesterdayData.push(item)
    }
    else if (timestamp >= sevenDaysAgoStart) {
      lastSevenDaysData.push(item)
    }
    else if (timestamp >= thirtyDaysAgoStart) {
      lastThirtyDaysData.push(item)
    }
  })
  return {
    today: todayData,
    yesterday: yesterdayData,
    lastSevenDays: lastSevenDaysData,
    lastThirtyDays: lastThirtyDaysData,
  }
}