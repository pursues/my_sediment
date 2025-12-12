import type { GraphNodeData } from '@/types/graph'
import type { GraphData, Graph, EdgeData } from '@antv/g6'
import type { State } from '@antv/g6/lib/types'
import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

export enum GraphType {
  MemoryGraph = 1,
  TemplateGraph = 2
}

export const useGraphStore = defineStore('graph', () => {
  // Graph核心状态
  const graphInstance = shallowRef<Graph | null>(null)
  const graphData = shallowRef<GraphData>({
    nodes: [],
    edges: []
  })
  const isLoading = ref(false)
  const zoomLevel = ref(100)
  const isEmptyGraph = ref(true)

  // 设置Graph实例
  const setGraphInstance = (graph: Graph | null) => {
    graphInstance.value = graph
  }

  // 更新缩放级别
  const updateZoomLevel = () => {
    if (!graphInstance.value) return
    try {
      const zoom = graphInstance.value.getZoom()
      if (typeof zoom === 'number' && !isNaN(zoom) && zoom > 0) {
        zoomLevel.value = Math.round(zoom * 100)
      } else {
        zoomLevel.value = 100
      }
    } catch (error) {
      console.error('获取缩放比例失败:', error)
      zoomLevel.value = 100
    }
  }

  // 缩放操作
  const zoomIn = () => {
    if (!graphInstance.value) return
    const currentZoom = graphInstance.value.getZoom()
    const newZoom = currentZoom + 0.1
    graphInstance.value.zoomTo(newZoom)
    updateZoomLevel()
  }

  const zoomOut = () => {
    if (!graphInstance.value) return
    const currentZoom = graphInstance.value.getZoom()
    const newZoom = Math.max(0.1, currentZoom - 0.1)
    graphInstance.value.zoomTo(newZoom)
    updateZoomLevel()
  }

  // 节点操作
  const addNode = (nodeData: GraphData) => {
    if (!graphInstance.value) return
    graphInstance.value.addData(nodeData)
    graphInstance.value.draw()
  }

  const removeNodeData = (nodeIds: string[]) => {
    if (!graphInstance.value) return
    graphInstance.value.removeNodeData(nodeIds)
    graphInstance.value.draw()
    graphData.value = {
      ...graphData.value,
      nodes: graphData.value.nodes?.filter((node) => {
        return !nodeIds?.includes(node.id)
      })
    }
  }

  const updateNode = (data: GraphData) => {
    if (!graphInstance.value) return
    graphInstance.value.updateData(data)
    graphInstance.value.draw()
  }

  // 边操作
  const addEdge = (edgeData: EdgeData[]) => {
    if (!graphInstance.value) return
    graphInstance.value.addEdgeData(edgeData)
    graphInstance.value.draw()
  }

  // 高亮节点
  const highlightNode = (nodeId: string) => {
    if (!graphInstance.value) return

    try {
      const neighborNodes = graphInstance.value.getNeighborNodesData(nodeId)
      const relatedEdges = graphInstance.value.getRelatedEdgesData(nodeId)

      const activeNodeIds = new Set<string>()
      const activeEdgeIds = new Set<string>()

      activeNodeIds.add(nodeId)
      neighborNodes.forEach((node) => activeNodeIds.add(node.id))
      relatedEdges.forEach((edge) => {
        if (edge.id !== undefined) {
          activeEdgeIds.add(edge.id)
        }
      })

      const stateMapping: Record<string, State> = {}
      activeNodeIds.forEach((id) => {
        stateMapping[id] = 'active'
      })
      activeEdgeIds.forEach((id) => {
        stateMapping[id] = 'active'
      })

      const allNodes = graphInstance.value.getNodeData()
      const allEdges = graphInstance.value.getEdgeData()

      allNodes.forEach((node) => {
        if (!activeNodeIds.has(node.id)) {
          stateMapping[node.id] = 'inactive'
        }
      })

      allEdges.forEach((edge) => {
        if (edge.id !== undefined && !activeEdgeIds.has(edge.id)) {
          stateMapping[edge.id] = 'inactive'
        }
      })

      graphInstance.value.setElementState(stateMapping)
    } catch (error) {
      console.warn('高亮节点失败:', error)
    }
  }

  // 清除所有高亮
  const clearHighlight = () => {
    if (!graphInstance.value) return
    try {
      // 方法1：获取所有处于 active 状态的节点并逐个清除
      const activeNodes = graphInstance.value.getElementDataByState('node', 'active')
      const resetMapping: Record<string, string | string[]> = {}

      // 清除节点的 active 状态
      activeNodes.forEach((node: GraphNodeData) => {
        resetMapping[node.id] = []
      })

      // 清除 inactive 状态
      const inactiveNodes = graphInstance.value.getElementDataByState('node', 'inactive')
      const inactiveEdges = graphInstance.value.getElementDataByState('edge', 'inactive')

      inactiveNodes.forEach((node: GraphNodeData) => {
        resetMapping[node.id] = []
      })

      inactiveEdges.forEach((edge: EdgeData) => {
        if (edge.id != null) {
          resetMapping[edge.id] = []
        }
      })

      graphInstance.value!.setElementState(resetMapping)
    } catch (error) {
      console.warn('清除高亮失败:', error)
    }
  }

  // 居中显示
  const fitView = () => {
    if (!graphInstance.value) return
    graphInstance.value.fitView()
    updateZoomLevel()
  }

  // 重新布局
  const layout = () => {
    if (!graphInstance.value) return
    graphInstance.value.layout()
  }

  // 选中节点
  const selectNode = (nodeId: string) => {
    if (!graphInstance.value) return
    graphInstance.value.setElementState({ [nodeId]: 'selected' })
  }

  // 取消选中
  const unselectAll = () => {
    if (!graphInstance.value) return
    const allNodes = graphInstance.value.getNodeData()
    const allEdges = graphInstance.value.getEdgeData()
    const stateMapping: Record<string, State> = {}

    allNodes.forEach((node) => {
      stateMapping[node.id] = 'default'
    })
    allEdges.forEach((edge) => {
      if (edge.id !== undefined) {
        stateMapping[edge.id] = 'default'
      }
    })
    graphInstance.value.setElementState(stateMapping)
  }

  // 销毁Graph
  const destroyGraph = () => {
    if (graphInstance.value) {
      graphInstance.value.off()
      graphInstance.value.destroy()
      graphInstance.value = null
    }
  }

  // 重置所有状态
  const resetState = () => {
    isEmptyGraph.value = true
    isLoading.value = false
    zoomLevel.value = 100
    graphData.value = { nodes: [], edges: [] }
  }

  return {
    // 状态
    graphInstance,
    graphData,
    isLoading,
    zoomLevel,
    isEmptyGraph,

    setGraphInstance,
    updateZoomLevel,
    destroyGraph,
    resetState,

    // 操作方法
    zoomIn,
    zoomOut,
    addNode,
    removeNodeData,
    updateNode,
    addEdge,
    highlightNode,
    clearHighlight,
    fitView,
    layout,
    selectNode,
    unselectAll
  }
})
