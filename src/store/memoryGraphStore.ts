import { defineStore } from 'pinia'
import { useUIState } from '@/composables/memoryGraph/useUIState'
import { useSearchState } from '@/composables/memoryGraph/useSearchState'
import { useEditModeState } from '@/composables/memoryGraph/useEditState'
import type { GraphNodeData } from '@/types/graph'
import { useGraphStore } from './graphStore'

/**
 * 内存图谱 Pinia Store
 */
export const useMemoryGraphStore = defineStore('memoryGraph', () => {
  // 各个功能模块
  const uiState = useUIState()
  const search = useSearchState()
  const editMode = useEditModeState()
  const graphStore = useGraphStore()

  // 跨模块的业务逻辑
  const handleNodeClick = (node: GraphNodeData) => {
    search.closeSearchList()
    uiState.openEntityDrawer(node)
  }

  /** 点击编辑图谱进图编辑模式 */
  const handleClickEditGraph = () => {
    search.closeSearchList()
    editMode.toggleEditMode()
  }

  const handleAddEntity = () => {
    uiState.openAddEntityDialog()
  }

  const updateSearchKeyword = (keyword: string) => {
    search.updateSearchKeyword(keyword)
    if (keyword.trim() === '') {
      search.closeSearchList()
      return
    }
    uiState.closeEntityDrawer()
    graphStore.clearHighlight()
    search.openSearchList()
  }

  // 关闭所有对话框
  const closeAllDialogs = () => {
    uiState.closeEntityDrawer()
    uiState.closeAddEntityDialog()
    search.closeSearchList()
  }

  // 重置所有状态
  const resetPageState = () => {
    editMode.resetEditMode()
    uiState.resetUIState()
    search.resetSearch()
  }

  return {
    // 状态 - 直接暴露各模块的状态
    ...uiState,
    ...search,
    ...editMode,

    // 跨模块业务方法
    handleNodeClick,
    handleClickEditGraph,
    updateSearchKeyword,
    handleAddEntity,

    // 工具方法
    closeAllDialogs,
    resetPageState
  }
})
