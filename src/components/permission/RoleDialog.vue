<template>
  <el-dialog
    :title="dialogTitle"
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
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="formData.roleName"
          placeholder="请输入角色名称"
          :maxlength="20"
          clearable
        />
      </el-form-item>

      <!-- 角色描述 -->
      <el-form-item label="角色描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入角色描述"
          :maxlength="200"
          show-word-limit
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
import { ref, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import type { EditRoleItem,RoleItem } from '@/types/permission'
import { addRole, updateRole } from '@/api/permission'

// 定义 emits
const emit = defineEmits<{
  (e: 'confirm'): void
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)
const visible = ref(false)
const status = ref<'add' | 'edit'>('add')

const dialogTitle = computed(() => {
  return status.value === 'add' ? '添加角色' : '编辑角色'
})

// 表单数据
const formData = ref<EditRoleItem>({
  roleName: '',
  description: ''
})

// 表单验证规则
const rules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

// 显示弹窗
const show = (item?: EditRoleItem) => {
  visible.value = true
  resetForm()
  if (item) {
    status.value = 'edit'
    formData.value = { ...item }
  } else {
    status.value = 'add'
    formData.value = {
      roleName: '',
      description: ''
    }
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    roleName: '',
    description: ''
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
    
    const {data,message} = status.value === 'add' ? await addRole(formData.value) : await updateRole(formData.value as RoleItem)

    if (data) {
      ElMessage.success(message)
      emit('confirm')
      handleClose()
    } else {
      ElMessage.error(message)
    }

  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('角色接口未联调')
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