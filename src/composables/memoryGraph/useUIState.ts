import { ref } from 'vue'
import type{ GraphNodeData } from '@/types/graph'

/**
 * UI状态管理 - 负责各种抽屉和对话框的显示状态
 */
export const useUIState = () => {
  const entityDrawerVisible = ref(false)
  const selectedNode = ref<GraphNodeData | null>(null)
  const newEntityDialogVisible = ref(false)

  const openEntityDrawer = (node: GraphNodeData) => {
    selectedNode.value = node
    entityDrawerVisible.value = true
  }

  const closeEntityDrawer = () => {
    entityDrawerVisible.value = false
    selectedNode.value = null
  }

  const openAddEntityDialog = () => {
    newEntityDialogVisible.value = true
  }

  const closeAddEntityDialog = () => {
    newEntityDialogVisible.value = false
  }

  const resetUIState = () => {
    entityDrawerVisible.value = false
    selectedNode.value = null
    newEntityDialogVisible.value = false
  }

  return {
    // 状态
    entityDrawerVisible,
    selectedNode,
    newEntityDialogVisible,
    // 方法
    openEntityDrawer,
    closeEntityDrawer,
    openAddEntityDialog,
    closeAddEntityDialog,
    resetUIState
  }
}