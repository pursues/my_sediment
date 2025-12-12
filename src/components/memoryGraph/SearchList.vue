<template>
  <ContainerDrawer
    v-model:visible="drawerVisible"
    :show-close="false"
  >
    <template #header>
      <h2
        class="h-[26px] line-height-[26px] text-[#303133] text-[18px] font-[500] text-ellipsis overflow-hidden whitespace-nowrap"
      >
        搜索结果：{{ searchKeyword }}
      </h2>
    </template>
    <div
      class="h-[calc(100%-20px)] mt-[20px] flex items-center justify-center"
      v-loading="isLoadingSearchList"
    >
      <ul class="w-full h-full overflow-y-auto" v-if="isLoadingSearchList || searchResults.length > 0">
        <li
          class="p-[12px] flex flex-col gap-y-[8px] hover:bg-[#F0F2F5] cursor-pointer rounded-[4px]"
          v-for="item in searchResults"
          :key="item.source"
        >
          <h4
            class="flex items-center gap-x-[4px] line-height-[24px] text-[#303133] text-[16px] font-[600] text-ellipsis overflow-hidden whitespace-nowrap"
          >
            <span>{{ item.source }}</span
            ><span>></span><span>{{ item.relation }}</span
            ><span>></span><span>{{ item.target }}</span>
          </h4>
          <span
            class="text-[#A8ABB2] text-[14px] line-height-[22px] inline-block text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {{ item.description }}
          </span>
        </li>
      </ul>
      <ElEmpty v-else description="暂无搜索结果" />
    </div>
  </ContainerDrawer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ContainerDrawer from '../common/ContainerDrawer.vue'
import { useMemoryGraphStore } from '@/store/memoryGraphStore'
import { storeToRefs } from 'pinia'

const memoryGraphStore = useMemoryGraphStore()
const { searchKeyword, isLoadingSearchList, searchResults } = storeToRefs(memoryGraphStore)

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 双向绑定 visible
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value)
})

onMounted(() => {
  setTimeout(() => {
    isLoadingSearchList.value = false
  }, 1000)
})
</script>

<style scoped lang="scss">
// 这个组件主要作为容器，样式由子组件处理
</style>
