import type { SearchResult } from '@/types/graph'
import { ref } from 'vue'

/**
 * 搜索功能状态管理 - 负责搜索相关的所有逻辑
 */
export const useSearchState = () => {
  const isShowSearchList = ref(false)
  const isLoadingSearchList = ref(false)
  const searchKeyword = ref('')
  const searchResults = ref<SearchResult[]>([])

  const openSearchList = () => {
    isShowSearchList.value = true
  }

  const closeSearchList = () => {
    isShowSearchList.value = false
  }

  const updateSearchKeyword = (keyword: string) => {
    searchKeyword.value = keyword
  }

  const updateSearchResults = (results: SearchResult[]) => {
    searchResults.value = results
  }

  const resetSearch = () => {
    isShowSearchList.value = false
    isLoadingSearchList.value = false
    searchKeyword.value = ''
    searchResults.value = []
  }

  return {
    // 状态
    isShowSearchList,
    isLoadingSearchList,
    searchKeyword,
    searchResults,
    // 方法
    openSearchList,
    closeSearchList,
    updateSearchKeyword,
    updateSearchResults,
    resetSearch
  }
}
