<template>
  <ContainerDrawer v-model:visible="drawerVisible" @close="handleClose">
    <template #header>
      <div class="w-[calc(100%-24px)] flex items-start">
        <div
          class="flex items-center gap-x-[8px] gap-y-[4px] flex-wrap mr-[12px] min-w-0"
          :class="isEditMode ? 'w-[calc(100%-200px)]' : 'flex-1'"
        >
          <h2 class="min-w-[80px] text-ellipsis overflow-hidden whitespace-nowrap mr-[4px]">
            实体节点：
            {{ nodeData ? `${String(nodeData.label || nodeData.id || '')}` : '' }}
          </h2>
          <ElTag>设备系统</ElTag>
          <ElTag>设备</ElTag>
        </div>
        <div class="flex items-center gap-x-[8px] flex-shrink-0" v-if="isEditMode">
          <ElButton type="danger" plain :icon="Delete" size="small" @click="handleDeleteEntity"
            >删除实体</ElButton
          >
          <ElButton 
            type="primary" 
            plain 
            :icon="Edit" 
            size="small" 
            style="margin: 0"
            :loading="isSaving"
            :disabled="!hasChanges"
            @click="handleSaveAll"
            >{{ isSaving ? '保存中...' : '保存实体' }}</ElButton
          >
        </div>
      </div>
    </template>
    <div>
      <div
        class="my-[4px] text-[14px] line-height-[22px] text-ellipsis overflow-hidden whitespace-nowrap"
      >
        来源文档：<span class="text-primary">白水系统作业指导书</span>
      </div>
      <ElTabs v-model="activeTab">
        <template v-if="!isEditMode">
          <ElTabPane label="属性" :name="Tab.ATTRIBUTE">
            <EntityAttributeDetail />
          </ElTabPane>
          <ElTabPane label="关联关系" :name="Tab.RELATION">
            <EntityRelationDetail />
          </ElTabPane>
        </template>
        <template v-else>
          <ElTabPane label="属性" :name="Tab.ATTRIBUTE">
            <EntityAttributeEditor 
              ref="attributeEditorRef"
              @change="handleAttributeChange"
            />
          </ElTabPane>
          <ElTabPane label="关联关系" :name="Tab.RELATION">
            <EntityRelationEditor 
              ref="relationEditorRef"
              @change="handleRelationChange"
            />
          </ElTabPane>
        </template>
      </ElTabs>
    </div>
  </ContainerDrawer>
</template>

<script setup lang="ts">
import { computed, markRaw, onBeforeMount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Edit, WarnTriangleFilled } from '@element-plus/icons-vue'
import { useMemoryGraphStore } from '@/store/memoryGraphStore'
import ContainerDrawer from '../common/ContainerDrawer.vue'
import EntityAttributeDetail from './EntityAttributeDetail.vue'
import EntityRelationDetail from './EntityRelationDetail.vue'
import EntityAttributeEditor from './EntityAttributeEditor.vue'
import EntityRelationEditor from './EntityRelationEditor.vue'
import { useGraphStore } from '@/store/graphStore'
import type { GraphNodeData } from '@/types/graph'
import { deleteEntityApi } from '@/hooks/memoryGraph/useMemoryGraphApi'

interface Props {
  modelValue: boolean
  nodeData: GraphNodeData | null
}

enum Tab {
  ATTRIBUTE = 1,
  RELATION = 2
}

const props = withDefaults(defineProps<Props>(), {})
const graphStore = useGraphStore()
const memoryGraphStore = useMemoryGraphStore()
const { isEditMode } = storeToRefs(memoryGraphStore)

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 双向绑定 visible
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => {
    graphStore.clearHighlight()
    emits('update:modelValue', value)
  }
})

const activeTab = ref(Tab.ATTRIBUTE)

// 子组件引用
const attributeEditorRef = ref()
const relationEditorRef = ref()

// 批量保存相关状态
const isSaving = ref(false)
const hasChanges = ref(false)
const changedAttributeData = ref<any[]>([])
const changedRelationData = ref<any[]>([])

// 监听子组件数据变化
const handleAttributeChange = (data: any[]) => {
  changedAttributeData.value = data
  updateHasChanges()
}

const handleRelationChange = (data: any[]) => {
  changedRelationData.value = data
  updateHasChanges()
}

const updateHasChanges = () => {
  hasChanges.value = changedAttributeData.value.length > 0 || changedRelationData.value.length > 0
}

/** 批量保存所有修改 */
const handleSaveAll = async () => {
  if (!hasChanges.value || isSaving.value) return
  
  isSaving.value = true
  
  try {
    // 模拟API保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 可能的随机错误（用于测试）
    if (Math.random() < 0.1) {
      throw new Error('保存失败')
    }
    
    // 确认保存 - 更新原始值
    if (attributeEditorRef.value) {
      attributeEditorRef.value.confirmSave()
    }
    if (relationEditorRef.value) {
      relationEditorRef.value.confirmSave()
    }
    
    // 重置状态
    changedAttributeData.value = []
    changedRelationData.value = []
    hasChanges.value = false
    
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {}

/** 删除实体 */
const handleDeleteEntity = async () => {
  try {
    await ElMessageBox({
      title: '',
      message: '是否删除该实体',
      showCancelButton: true,
      showClose: true,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      icon: markRaw(WarnTriangleFilled),
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      buttonSize: 'small',
      type: 'warning',
      beforeClose: async (action, instance, done) => {
        if (action !== 'confirm') {
          done()
          return
        }
        if (!props.nodeData) {
          done()
          return
        }

        // 设置确认按钮为加载状态
        instance.confirmButtonLoading = true

        await deleteEntityApi(props.nodeData.id)
        graphStore.removeNodeData([props.nodeData.id])
        graphStore.clearHighlight()
        memoryGraphStore.closeEntityDrawer()
        done()
        instance.confirmButtonLoading = false
      }
    })
  } catch (error) {
    // 用户取消操作
    console.log('删除操作已取消')
  }
}

onBeforeMount(() => {
  activeTab.value = Tab.ATTRIBUTE
})

watch(
  () => props.nodeData,
  () => {
    activeTab.value = Tab.ATTRIBUTE
  }
)
</script>

<style scoped lang="scss"></style>
