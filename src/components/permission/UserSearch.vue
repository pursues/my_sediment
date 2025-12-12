<template>
  <div class="search">
    <el-input
      v-model="moreFilterData.keyword"
      placeholder="搜索文档名称"
      class="search-input"
      @keydown.enter.trim="handleSearch"
      clearable
    />
    <el-popover
      placement="bottom-end"
      width="700"
      trigger="click"
      popper-class="filter-popover"
      :visible="filterVisible"
      @show="filterVisible = true"
      @hide="filterVisible = false"
    >
      <template #reference>
        <img src="@/assets/icons/more-search.svg" alt="more-search" @click="filterVisible = true" class="filter-btn" />
      </template>
      <UserMoreSearch
        @close="closeFilter"
        @filter="searchFilterData"
      />
    </el-popover>
  </div>
  </template>
  
  <script setup lang="ts">
  import { ref,reactive,watch } from 'vue'
  import UserMoreSearch from './UserMoreSearch.vue'
  import type { UserFilterData } from '@/types/permission'
  
  const emit = defineEmits(['searchData','closeSearch','visibleChange'])
  
  
  // 旧数据，做防止重复回车触发
  const previousKeyword = ref('')
  const filterVisible = ref(false)
  
  // 更多数据接收
  const moreFilterData = reactive<UserFilterData>({
    keyword: '',
    createTimeRage: undefined,
    updateTimeRage: undefined
  })
  // 监听状态的改变，用于外部关闭弹窗
  watch(filterVisible,(newVal)=>{
    emit('visibleChange',newVal)
  })
  
  const handleSearch = () => {
    // 如果输入的是只包含空格的字符串（不是空字符串），则直接返回
    if (moreFilterData.keyword && !moreFilterData.keyword.trim()) {
      return
    }
    // 只有搜索关键词发生变化时才触发
    if (moreFilterData.keyword !== previousKeyword.value) {
      emit('searchData', moreFilterData)
      previousKeyword.value = moreFilterData.keyword || ''
    }
  }
  // 更多搜索返回
  function searchFilterData(filterData:UserFilterData){
    emit('searchData',{...filterData,keyword:moreFilterData.keyword})
    filterVisible.value = false
  }
  
  function closeFilter(){
    filterVisible.value = false
  }
  
  
  </script>
  
  
  <style scoped lang="scss">
  .search {
    display: flex;
    align-items: center;
    gap: 12px;
    .search-input {
      flex: 1;
    }
    .filter-btn {
      width: 32px;
      cursor: pointer;
    }
  }
  </style>