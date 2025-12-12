import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { GraphNodeData } from '@/types/graph'
import type { IElementEvent } from '@antv/g6/lib/types'
import { useGraphStore } from '@/store/graphStore'
import { storeToRefs } from 'pinia'
import useGraph from '../useGraph'
import { getGraphDataApi } from '../memoryGraph/useMemoryGraphApi'

export default function useTemplateGraph() {
  const graphStore = useGraphStore()
  const { isEmptyGraph, isLoading, graphData, graphInstance } = storeToRefs(graphStore)
  const { initGraph, graphContainerRef } = useGraph()

  const isShowEntityTypeDetail = ref(false)
  const selectedNode = ref<GraphNodeData | null>(null)

  const fetchGraphData = async () => {
    // 获取模板图谱数据
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

  const initTemplateGraph = async () => {
    isLoading.value = true

    // 获取数据
    await fetchGraphData()

    if (isEmptyGraph.value) {
      isLoading.value = false
      return
    }
    await initGraph()
    isLoading.value = false

    // 监听节点点击事件
    graphInstance.value?.on('node:click', (event: IElementEvent) => {
      //   console.log('template graph node click event:', event)
      const id = event.target.id
      const node = graphInstance.value?.getNodeData(id)
      if (node) {
        selectedNode.value = node
        isShowEntityTypeDetail.value = true
      }
    })
  }

  const resetTemplateGraph = () => {
    selectedNode.value = null
    isShowEntityTypeDetail.value = false
  }

  // 组件挂载时初始化
  onMounted(() => {
    initTemplateGraph()
  })

  onBeforeUnmount(() => {
    resetTemplateGraph()
  })

  return {
    graphContainerRef,
    isShowEntityTypeDetail,
    selectedNode
  }
}
