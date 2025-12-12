import { getGraphVersionApi } from '@/hooks/memoryGraph/useMemoryGraphApi'
import { ref } from 'vue'

/**
 * 编辑模式状态管理 - 负责编辑模式的状态和切换逻辑
 */
export const useEditModeState = () => {
  const isEditMode = ref(false)
  const editCount = ref(0)
  const graphVersion = ref('')

  const getGraphVersion = async () => {
    const version = await getGraphVersionApi()
    if (version == null) return
    graphVersion.value = version
  }

  const toggleEditMode = () => {
    isEditMode.value = !isEditMode.value
  }

  const resetEditMode = () => {
    isEditMode.value = false
  }

  return {
    // 状态
    isEditMode,
    editCount,
    graphVersion,
    // 方法
    getGraphVersion,
    toggleEditMode,
    resetEditMode,
  }
}