<template>
  <el-dialog
    title="添加权限点"
    v-model="visible"
    width="410px"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
      label-position="top"
    >
      <!-- 角色名称 -->
      <el-form-item label="权限点key" prop="key">
        <el-input
          v-model="formData.key"
          placeholder="请输入权限点key"
          :maxlength="20"
          clearable
        />
      </el-form-item>

      <!-- 角色描述 -->
      <el-form-item label="权限点名称" prop="label">
        <el-input
          v-model="formData.label"
          placeholder="请输入权限点名称"
          :maxlength="20"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import type { EditPermissionItem } from '@/types/permission'
import { addPermission } from '@/api'

// 定义 emits
const emit = defineEmits<{
  (e: 'confirm'): void
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)
const visible = ref(false)


// 表单数据
const formData = ref<EditPermissionItem>({
  key: '',
  parentId: '',
  id: '',
  label: ''
})

// 表单验证规则
const rules = {
  key: [{ required: true, message: '请输入权限点key', trigger: 'blur' }],
  label: [{ required: true, message: '请输入权限点名称', trigger: 'blur' }]
}

// 显示弹窗
const show = (item?: EditPermissionItem) => {
  visible.value = true

  resetForm()
  if (item) {
    formData.value = {
      key: '',
      parentId: item.id,//选中的权限点id
      id: Math.random().toString(36).substr(2, 9),//随机生成id
      label: ''
    }
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    key: '',
    parentId: '',
    id: '',
    label: ''
  }
  formRef.value?.clearValidate()
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  visible.value = false
}

// 确认操作
const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    
    const {data,message} = await addPermission(formData.value)

    if (data) {
      ElMessage.success(message)
      emit('confirm')
      handleClose()
    } else {
      ElMessage.error(message)
    }

  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

defineExpose({
  show
})
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 