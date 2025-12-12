import { onBeforeUnmount, onMounted } from 'vue'
import type { IElementEvent } from '@antv/g6/lib/types'
import { useGraphStore } from '@/store/graphStore'
import { storeToRefs } from 'pinia'
import useGraph from '../useGraph'
import { getGraphDataApi } from './useMemoryGraphApi'
import { useMemoryGraphStore } from '@/store/memoryGraphStore'

export default function useMemoryGraph() {
  const graphStore = useGraphStore()
  const { isEmptyGraph, isLoading, graphData, graphInstance } = storeToRefs(graphStore)
  const memoryGraphStore = useMemoryGraphStore()

  const { initGraph, graphContainerRef } = useGraph()

  const fetchGraphData = async () => {
    // 获取记忆图谱数据
    const data = await getGraphDataApi()

    // 检查数据是否为空
    if (data == null || !data.nodes || (Array.isArray(data.nodes) && data.nodes.length === 0)) {
      isEmptyGraph.value = true
      return null
    }

    isEmptyGraph.value = false
    graphData.value = data
    return data
  }

  const initMemoryGraph = async () => {
    isLoading.value = true

    // 获取数据
    await fetchGraphData()

    if (isEmptyGraph.value) {
      isLoading.value = false
      return
    }
    await initGraph()

    isLoading.value = false

    graphInstance.value?.on('node:click', (event: IElementEvent) => {
      const id = event.target.id
      const node = graphInstance.value?.getNodeData(id)
      if (node == null) {
        return
      }
      memoryGraphStore.handleNodeClick(node)
    })

    graphInstance.value?.on('canvas:click', () => {
      memoryGraphStore.closeAllDialogs()
    })
  }
  // 组件挂载时初始化
  onMounted(() => {
    initMemoryGraph()
  })

  onBeforeUnmount(() => {
    memoryGraphStore.closeAllDialogs()
    memoryGraphStore.resetPageState()
  })

  return {
    graphContainerRef
  }
}
