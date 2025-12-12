<template>
  <el-dialog
    v-model="newEntityDialogVisible"
    title="新建实体"
    width="800px"
    :before-close="handleClose"
    class="entity-dialog"
    append-to-body
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="实体名称" prop="name" required>
        <el-input v-model="formData.name" placeholder="请输入实体名称" />
      </el-form-item>

      <el-form-item label="实体所属类型" prop="type" required>
        <el-select v-model="formData.type" placeholder="选择实体类型">
          <el-option
            v-for="option in entityTypes"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="实体属性">
        <AttributeEditor v-model="formData.attributes" />
      </el-form-item>

      <el-form-item label="关联关系">
        <RelationshipEditor
          v-model="formData.relationships"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting"> 新建 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'
import AttributeEditor from './AttributeEditor.vue'
import RelationshipEditor from './RelationshipEditor.vue'
import { useMemoryGraphStore } from '@/store/memoryGraphStore'
import { storeToRefs } from 'pinia'

const memoryGraphStore = useMemoryGraphStore()
const { newEntityDialogVisible } = storeToRefs(memoryGraphStore)

interface EntityType {
  label: string
  value: string
}

interface EntityFormData {
  id: string
  label: string
  nodeType: string
  color?: string
  attributes: Attribute[]
  relationships: Relationship[]
}

interface Attribute {
  name: string
  type: string
  required: string
  value: string
}

interface Relationship {
  type: string
  direction: string
  targetType: string
}

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [entity: EntityFormData]
}>()
const submitting = ref(false)
const formRef = ref<FormInstance | null>(null)

// 实体类型配置
const entityTypes: EntityType[] = [
  { label: '人物', value: 'person' },
  { label: '地点', value: 'location' },
  { label: '组织', value: 'organization' },
  { label: '事件', value: 'event' },
  { label: '概念', value: 'concept' }
]

// 表单数据
const formData = reactive({
  name: '',
  type: '',
  attributes: [
    { name: '属性1', type: 'string', required: 'true', value: '' },
    { name: '属性2', type: 'boolean', required: 'false', value: '' }
  ],
  relationships: [{ type: 'relation1', direction: 'source-target', targetType: 'entity1' }]
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入实体名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择实体类型', trigger: 'change' }]
}

// 重置表单
const resetForm = (): void => {
  formData.name = ''
  formData.type = ''
  formData.attributes = [
    { name: '属性1', type: 'string', required: 'true', value: '' },
    { name: '属性2', type: 'boolean', required: 'false', value: '' }
  ]
  formData.relationships = [
    { type: 'relation1', direction: 'source-target', targetType: 'entity1' }
  ]

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 关闭弹窗
const handleClose = (): void => {
  newEntityDialogVisible.value = false
  emits('update:modelValue', false)
  resetForm()
}

// 提交表单
const handleSubmit = async (): Promise<void> => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 生成新实体数据
    const newEntity = {
      id: `node_${Date.now()}`,
      label: formData.name,
      nodeType: formData.type,
      attributes: [...formData.attributes],
      relationships: [...formData.relationships]
    }

    emits('submit', newEntity)
    handleClose()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.entity-dialog :deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
