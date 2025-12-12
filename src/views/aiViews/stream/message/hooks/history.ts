import { defineStore } from 'pinia'
import { classifyDataByTime,DataItem } from '@/utils/common'
import { ref,computed } from 'vue'
import { ElMessage } from 'element-plus'

export type DataGroup = Pick<DataItem, 'id' | 'title' | 'type'>

const useHistoryStore = defineStore('history', () => {
  /** 侧边栏最近对话参数 */
  const recentlyParams = ref({ page: 1, size: 13 })
  /** 所有历史数据分页参数（用于historyMemory页面） */
  const allHistoryParams = ref({ page: 1, size: 10 })
  
  /** 分组标题定义 */
  const recentlyGroup = {
    today: { type: 'title', title: '今天', id: 'today' },
    yesterday: { type: 'title', title: '昨天', id: 'yesterday' },
    lastSevenDays: { type: 'title', title: '近7天', id: 'seven' },
    lastThirtyDays: { type: 'title', title: '近30天', id: 'thirty' },
    lastYear: { type: 'title', title: '近一年', id: 'year' },
  }

  /** 分组数据 */
  const todayList = ref<DataItem[]>([])
  const yesterdayList = ref<DataItem[]>([])
  const sevenList = ref<DataItem[]>([])
  const thirtyList = ref<DataItem[]>([])
  
  /** 历史对话列表 */
  const todayDialogue = ref<DataItem[]>([])
  const sevenDialogue = ref<DataItem[]>([])
  const yearDialogue = ref<DataItem[]>([])
  
  /** 最近对话列表源数据 */
  const asideHistoryData = ref<DataItem[]>([])
  
  /** 所有历史对话列表 */
  const allHistoryData = ref<DataItem[]>([])
  
  /** 总数据量 */
  const totalCount = ref(0)

  /** 最近对话分组数据 */
  const recently = computed<(DataItem | DataGroup)[]>(() => {
    const todayGroup = todayList.value.length > 0 ? [recentlyGroup.today, ...todayList.value] : []
    const yesterdayGroup = yesterdayList.value.length > 0 ? [recentlyGroup.yesterday, ...yesterdayList.value] : []
    const sevenGroup = sevenList.value.length > 0 ? [recentlyGroup.lastSevenDays, ...sevenList.value] : []
    const thirtyGroup = thirtyList.value.length > 0 ? [recentlyGroup.lastThirtyDays, ...thirtyList.value] : []
    return [...todayGroup, ...yesterdayGroup, ...sevenGroup, ...thirtyGroup]
  })

  /** 是否显示更多按钮 */
  const isShowMoreButton = computed(() => {
    return totalCount.value > 13
  })

  /**
   * 获取历史对话列表（分页）- 仅用于historyMemory页面
   * @param params 分页参数
   * @returns 历史对话数据
   */
  const loadPageHistoryList = async (
    params: { page: number, size: number }
  ): Promise<DataItem[]> => {
    try {
      // 获取历史记录
      // const res = await useHsitoryList(params)
      // const responseData = res?.data.value
      // // console.log(responseData?.data.records, 'loadPageHistoryList', params.page, params.size)
      
      // if (responseData && responseData.data) {
      //   const { records = [], total = 0 } = responseData.data
        
      //   // 更新总数
      //   totalCount.value = total
        
      //   return records
      // }
      
      return []
    } catch (error) {
      console.error('获取历史对话失败:', error)
      if (error instanceof Error) {
        ElMessage.error(error.message)
      }
      return []
    }
  }

  /**
   * 获取侧边栏历史记录，展示最近13条
   * 注意：此方法独立于historyMemory页面，不会被其他数据源影响
   * @param params 分页参数，默认获取13条数据
   */
  const getAsideHistoryList = async () => {
    try {
      // 直接调用接口，不依赖其他方法，确保数据独立
      const responseData = await loadPageHistoryList(recentlyParams.value)
      // console.log(JSON.stringify(responseData?.data.records),responseData?.data.records, 'responseData', recentlyParams.page, recentlyParams.size)
        
        
        if (responseData.length > 0) {
          // 更新侧边栏源数据
          asideHistoryData.value = responseData
          
          // 取前13条进行时间分组（今天、昨天、近7天、近30天）
          const classifiedData = classifyDataByTime(responseData)

          const { today, yesterday, lastSevenDays, lastThirtyDays } = classifiedData
          todayList.value = today
          yesterdayList.value = yesterday
          sevenList.value = lastSevenDays
          thirtyList.value = lastThirtyDays
        }
      
    } catch (error) {
      console.error('获取侧边栏历史记录失败:', error)
      if (error instanceof Error) {
        ElMessage.error(error.message)
      }
    }
  }

  /**
   * 获取所有历史数据（用于historyMemory页面）
   * @param params 分页参数
   * @param append 是否追加到现有数据
   */
  const fetchAllHistoryData = async (
    params: { page: number, size: number },
    append: boolean = false
  ): Promise<{ records: DataItem[], total: number }> => {
    try {
      const records = await loadPageHistoryList(params)
      
      if (append) {
        // 追加到现有数据
        allHistoryData.value = [...allHistoryData.value, ...records]
      } else {
        // 替换现有数据
        allHistoryData.value = records
      }
      
      return { records, total: totalCount.value }
    } catch (error) {
      console.error('获取全部历史数据失败:', error)
      return { records: [], total: 0 }
    }
  }

  /**
   * 更新对话记录，插入到所有对话的最前面
   * 用于创建新对话后更新历史记录
   */
  const updateHistoryDataData = async () => {
    // 先更新侧边栏数据
    await getAsideHistoryList()
    
    // 获取最新的侧边栏数据中的第一项（最新对话）
    const latestSidebarItem = asideHistoryData.value[0]
    if (!latestSidebarItem) return
    
    // 如果allHistoryData为空，说明用户还没访问过historyMemory页面
    // 这时需要获取第一页数据来初始化allHistoryData
    if (allHistoryData.value.length === 0) {
      try {
        // 重置第一页参数
        allHistoryParams.value.page = 1
        const { records } = await fetchAllHistoryData(allHistoryParams.value, false)
        // 检查新对话是否已经在获取的数据中
        const existsInRecords = records.find(item => item.id === latestSidebarItem.id)
        if (!existsInRecords) {
          // 如果新对话不在第一页数据中，将其插入到最前面
          allHistoryData.value = [latestSidebarItem, ...records]
        }
      } catch (error) {
        console.error('初始化全部历史数据失败:', error)
        // 如果获取失败，至少保存新对话
        allHistoryData.value = [latestSidebarItem]
      }
    } else {
      // 如果allHistoryData已有数据，检查新对话是否存在
      const existsInAllHistory = allHistoryData.value.find(item => item.id === latestSidebarItem.id)
      if (!existsInAllHistory) {
        // 如果不存在，将新对话插入到最前面
        allHistoryData.value = [latestSidebarItem, ...allHistoryData.value]
      }
    }
  }

  /**
   * 从所有数据中删除指定ID的项目
   * @param id 要删除的项目ID
   */
  const removeItemFromAllData = (id: string) => {
    // 从侧边栏数据中删除
    todayList.value = todayList.value.filter(item => item.id !== id)
    yesterdayList.value = yesterdayList.value.filter(item => item.id !== id)
    sevenList.value = sevenList.value.filter(item => item.id !== id)
    thirtyList.value = thirtyList.value.filter(item => item.id !== id)
    
    // 从源数据中删除
    asideHistoryData.value = asideHistoryData.value.filter(item => item.id !== id)
    
    // 从全部历史数据中删除
    allHistoryData.value = allHistoryData.value.filter(item => item.id !== id)
    
    // 更新总数
    if (totalCount.value > 0) {
      totalCount.value--
    }
  }

  /**
   * 重置历史记录数据
   */
  const resetHistoryList = () => {
    todayList.value = []
    yesterdayList.value = []
    sevenList.value = []
    thirtyList.value = []
    todayDialogue.value = []
    sevenDialogue.value = []
    yearDialogue.value = []
    asideHistoryData.value = []
    allHistoryData.value = []
    totalCount.value = 0
  }

  /**
   * 更新对话的红点提示状态
   * @param id 对话ID
   * @param value 是否显示红点
   */
  const updateLocalDotStatus = (id: string, value: boolean) => {
    const lists = [todayList.value, yesterdayList.value, sevenList.value, thirtyList.value]
    
    for (const list of lists) {
      const item = list.find(i => i.id === id)
      if (item) {
        item.isUpdate = value
        return
      }
    }
    
    // 也更新全部历史数据中的状态
    const allHistoryItem = allHistoryData.value.find(i => i.id === id)
    if (allHistoryItem) {
      allHistoryItem.isUpdate = value
    }
  }

  return {
    // 数据
    todayList,
    sevenList,
    yesterdayList,
    thirtyList,
    todayDialogue,
    sevenDialogue,
    yearDialogue,
    allHistoryParams,
    allHistoryData,
    totalCount,
    
    // 计算属性
    recently,
    isShowMoreButton,
    
    recentlyGroup,
    
    // 方法
    getAsideHistoryList, // 兼容旧方法名
    fetchAllHistoryData,
    updateHistoryDataData,
    removeItemFromAllData,
    resetHistoryList,
    updateLocalDotStatus,
  }
})

export default useHistoryStore
