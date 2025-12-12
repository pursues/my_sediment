<template>
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-x-[20px]" v-if="!isEditMode">
      <h2 class="text-[18px] font-[600] text-[#303133]">记忆图谱</h2>
      <span class="text-[14px] text-[#606266]">当前生效的 Schema：{{ currentSchema }}</span>
      <p v-if="!isEmptyGraph" class="flex items-center">
        <span class="text-[14px] text-[#606266]">当前版本： {{ graphVersion }}</span>
        <RouterLink to="/memory-graph/history" class="flex items-center ml-[4px]">
          <ElButton type="primary" link>查看历史版本</ElButton>
        </RouterLink>
      </p>
    </div>
    <div class="flex items-center gap-x-[12px]" v-else>
      <h2 class="text-[18px] font-[600] text-[#303133]">{{ graphVersion }}</h2>
      <ElTag type="success">编辑模式</ElTag>
      <div class="text-[14px] font-[500] text-[#909399]">
        <span>当前修改了</span><ElButton type="primary" link> {{ editCount }} </ElButton
        ><span>个实体</span>
      </div>
    </div>
    <div class="flex items-center gap-x-[8px]" v-if="!isEmptyGraph">
      <SearchBar v-if="!isEditMode" />
      <el-button
        v-if="!isEditMode"
        type="primary"
        :icon="Edit"
        @click="handleEditMemoryGraph"
        :loading="isLoadingEdit"
      >
        编辑记忆图谱
      </el-button>
      <template v-else>
        <el-button :icon="FolderAdd" @click="handleAddEntity"> 新建实体 </el-button>
        <el-button type="primary" :icon="Position" style="margin: 0"> 发布到记忆图谱 </el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from './SearchBar.vue'
import { storeToRefs } from 'pinia'
import { useMemoryGraphStore } from '@/store/memoryGraphStore'
import { Edit, FolderAdd, Position } from '@element-plus/icons-vue'
import { useGraphStore } from '@/store/graphStore'
import { onMounted, ref } from 'vue'
import { getCurrentSchemaApi, getGraphEditStatusApi } from '@/hooks/memoryGraph/useMemoryGraphApi'

const memoryGraphStore = useMemoryGraphStore()
const { isEditMode, editCount, graphVersion } = storeToRefs(memoryGraphStore)
const graphStore = useGraphStore()
const { isEmptyGraph } = storeToRefs(graphStore)

/** 编辑记忆图谱 */
const isLoadingEdit = ref(false)
const handleEditMemoryGraph = async () => {
  isLoadingEdit.value = true
  const res = await getGraphEditStatusApi()
  isLoadingEdit.value = false
  if (!res) return
  memoryGraphStore.handleClickEditGraph()
}

/** 新建实体 */
const handleAddEntity = () => {
  memoryGraphStore.handleAddEntity()
}

const currentSchema = ref('')
const initHeader = async () => {
  memoryGraphStore.getGraphVersion()
  const schema = await getCurrentSchemaApi()
  if (schema == null) return
  currentSchema.value = schema
}

onMounted(() => {
  initHeader()
})
</script>

<style scoped lang="scss"></style>
