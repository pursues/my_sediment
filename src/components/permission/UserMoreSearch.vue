<template>
  <div class="search-form">
    <el-form
      ref="formRef"
      :model="formData"
      label-width="80px"
       label-position="top"
      class="filter-form"
    >
      <el-row :gutter="20">
        
        <el-col :span="12">
          <el-form-item class="label" label="创建时间" prop="dateRange">
            <el-date-picker
              v-model="formData.createTimeRage"
              type="daterange"
              range-separator="To"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item class="label" label="更新时间" prop="dateRange">
            <el-date-picker
              v-model="formData.updateTimeRage"
              type="daterange"
              range-separator="To"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <div class="form-actions">
            <el-button class="reset-btn" link @click="handleReset">重置</el-button>
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleFilter" :loading="loading">筛选</el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance } from 'element-plus'

// 定义 emits
const emit = defineEmits<{
  close: []
  filter: [filterData: {
    createTimeRage: [string, string] | undefined
    updateTimeRage: [string, string] | undefined
  }]
}>()

// 表单引用
const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const formData = reactive({
  createTimeRage: undefined as [string, string] | undefined,
  updateTimeRage: undefined as [string, string] | undefined
})

// 初始状态备份
const initialData = reactive({
  createTimeRage: undefined as [string, string] | undefined,
  updateTimeRage: undefined as [string, string] | undefined
})

// 检查数据是否发生变化
const hasDataChanged = () => {
  return (
    JSON.stringify(formData.createTimeRage) !== JSON.stringify(initialData.createTimeRage) ||
    JSON.stringify(formData.updateTimeRage) !== JSON.stringify(initialData.updateTimeRage)
  )
}

// 重置表单
const handleReset = (event: MouseEvent) => {
  // 阻止事件冒泡，避免触发外部点击关闭
  event.stopPropagation()
  if (formRef.value) {
    formRef.value.resetFields()
  }
    // 手动清空数据确保完全重置
  formData.createTimeRage = undefined
  formData.updateTimeRage = undefined
  // 先把数据改了，再判断是否发生变化 ，走完在往下更新初始状态
  if (!hasDataChanged()) {
    console.log('数据未发生变化，不触发筛选')
    emit('close')
    return
  }
  // 更新初始状态
  initialData.createTimeRage = undefined
  initialData.updateTimeRage = undefined
  emit('filter', formData)
}

// 取消操作
const handleCancel = (event: MouseEvent) => {
  // 阻止事件冒泡，避免触发外部点击关闭
  event.stopPropagation()
  emit('close')
}

// 筛选操作
const handleFilter = async () => {
  // 检查数据是否发生变化
  if (!hasDataChanged()) {
    console.log('数据未发生变化，不触发筛选')
    emit('close')
    return
  }
  loading.value = true
  
  try {
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const filterData = {
      createTimeRage: formData.createTimeRage,
      updateTimeRage: formData.updateTimeRage
    }
    
    // 更新初始状态为当前数据
    initialData.createTimeRage = formData.createTimeRage ? [...formData.createTimeRage] : undefined
    initialData.updateTimeRage = formData.updateTimeRage ? [...formData.updateTimeRage] : undefined
    
    emit('filter', filterData)
    emit('close')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.search-form {
  padding: 0px 4px;
  .filter-form {
    :deep(.el-range-separator){
      color: #909399;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 16px;
      .el-button{
        margin-left: 0;
      }
      .reset-btn{
        margin-right: 12px;
      }
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-size: 14px;
  color: #606266;
}
</style> 