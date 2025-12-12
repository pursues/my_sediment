import { onBeforeUnmount, ref } from 'vue'
import { Graph, IElementEvent } from '@antv/g6'
import { useGraphStore } from '@/store/graphStore'
import { storeToRefs } from 'pinia'

export default function useGraph() {
  const graphStore = useGraphStore()
  const { graphData, graphInstance } = storeToRefs(graphStore)

  const graphContainerRef = ref<HTMLDivElement>()
  let resizeObserver: ResizeObserver | null = null

  // 图容器大小监听
  const resizeGraph = () => {
    resizeObserver = new ResizeObserver(() => {
      if (graphInstance.value) {
        graphInstance.value.resize()
        graphInstance.value.draw()
      }
    })

    if (graphContainerRef.value) {
      resizeObserver.observe(graphContainerRef.value)
    }
  }

  // 初始化图
  const initGraph = async () => {
    // 创建Graph实例
    const graph = new Graph({
      container: 'container',
      animation: false,
      data: graphData.value,
      node: {
        style: {
          size: 15,
          labelText: (d) => d.id,
          ports: [],
          cursor: 'move'
        },
        palette: {
          type: 'group',
          field: 'cluster'
        }
      },
      edge: {
        style: {
          labelText: (d) => (d.data?.type as string) || '',
          stroke: '#999',
          labelFill: '#666',
          labelFontSize: 9,
          labelOffsetY: -6,
          endArrow: true,
          endArrowSize: 8
        }
      },
      layout: {
        type: 'force-atlas2',
        preventOverlap: true,
        kr: 20,
      },
      behaviors: [
        {
          type: 'click-select',
          degree: 1,
          state: 'active',
          // 相邻节点附着状态
          neighborState: 'neighborActive',
          // 未选中节点状态
          unselectedState: 'inactive',
          enable: (event: IElementEvent) => {
            return event.targetType !== 'edge'
          }
        },
        { type: 'drag-element', enableOptimize: true },
        { type: 'drag-canvas', enableOptimize: true },
        { type: 'zoom-canvas', enableOptimize: true }
      ]
    })

    // 将graph实例存储到store
    graphStore.setGraphInstance(graph)

    // 监听容器大小变化
    resizeGraph()

    // 渲染图
    await graph.render()

    // 注册事件监听
    setupEventListeners(graph)

    // 初始化缩放比例显示
    graphStore.updateZoomLevel()
  }

  // 设置事件监听
  const setupEventListeners = (graph: Graph) => {
    // 缩放事件监听
    const zoomEvents = [
      'afterzoom',
      'zoom',
      'wheel',
      'canvas:wheel',
      'behavior:zoom-canvas:change',
      'viewportchange'
    ]
    zoomEvents.forEach((eventName) => {
      graph.on(eventName, () => {
        setTimeout(() => {
          graphStore.updateZoomLevel()
        }, 10)
      })
    })
  }

  // 组件卸载时清理
  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
    graphStore.destroyGraph()
  })

  // 返回必要的refs和方法
  return {
    initGraph,
    graphContainerRef
  }
}
