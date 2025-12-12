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
        <el-col 
          v-for="option in filterOptions" 
          :key="option.value" 
          :span="12"
        >
          <el-form-item 
            class="label" 
            :label="option.label" 
            :prop="option.value"
          >
            <!-- 单选下拉框 -->
            <el-select 
              v-if="option.type === 'select'"
              v-model="formData[option.value]" 
              :placeholder="`请选择${option.label}`" 
              clearable
              style="width: 100%"
            >
              <el-option 
                v-for="opt in option.options" 
                :key="opt.value" 
                :label="opt.label" 
                :value="opt.value" 
              />
            </el-select>

            <!-- 多选下拉框 -->
            <el-select 
              v-else-if="option.type === 'multiple-select'"
              v-model="formData[option.value]" 
              :placeholder="`请选择${option.label}`" 
              clearable
              multiple
              :class="['multiple-select', `select-${option.value}`]"
              style="width: 100%"
              @change="handleSelectChange"
            >
              <el-option 
                v-for="opt in option.options" 
                :key="opt.value" 
                :label="opt.label" 
                :value="opt.value" 
                :data-tag-type="opt.tagType || 'primary'"
              />
            </el-select>

            <!-- 输入框 -->
            <el-input 
              v-else-if="option.type === 'input'"
              v-model="formData[option.value]" 
              :placeholder="`请输入${option.label}`" 
              style="width: 100%" 
              clearable
            />

            <!-- 日期范围选择器 -->
            <el-date-picker
              v-else-if="option.type === 'date-range'"
              v-model="formData[option.value]"
              type="daterange"
              range-separator="To"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              clearable
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
            <el-button type="primary" @click="handleFilter">筛选</el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted } from 'vue'
import type { FormInstance } from 'element-plus'
import type { FilterOption } from '@/utils/interface'

const props = defineProps<{
  filterOptions: FilterOption[]
  modelValue?: Record<string, any>  // 支持v-model
}>()

// 定义 emits
const emit = defineEmits<{
  close: []
  filter: [filterData: Record<string, any>]
  'update:modelValue': [value: Record<string, any>]
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 动态生成表单数据结构
const generateFormData = () => {
  const data: Record<string, any> = {}
  
  props.filterOptions.forEach(option => {
    switch (option.type) {
      case 'select':
        data[option.value] = ''
        break
      case 'multiple-select':
        data[option.value] = []
        break
      case 'input':
        data[option.value] = ''
        break
      case 'date-range':
        data[option.value] = undefined
        break
    }
  })
  
  return data
}

// 表单数据 - 支持外部传入的初始值
const formData = reactive({
  ...generateFormData(),
  ...props.modelValue
})

// 监听filterOptions变化，重新生成表单数据
watch(() => props.filterOptions, () => {
  const newFormData = generateFormData()
  Object.keys(formData).forEach(key => {
    delete formData[key]
  })
  Object.assign(formData, {
    ...newFormData,
    ...props.modelValue
  })
}, { deep: true })

// 监听外部传入的modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    Object.assign(formData, newValue)
  }
}, { deep: true })

// 组件挂载时设置初始样式
onMounted(() => {
  handleSelectChange()
})

// 处理选择变化，设置标签样式
const handleSelectChange = () => {
  // 使用nextTick确保DOM更新后再设置样式
  nextTick(() => {
    const selects = document.querySelectorAll('.multiple-select')
    selects.forEach(select => {
      const tags = select.querySelectorAll('.el-tag')
      tags.forEach(tag => {
        const tagText = tag.textContent?.trim()
        if (tagText) {
          // 移除所有现有的标签样式类
          tag.classList.remove('tag-primary', 'tag-success', 'tag-info', 'tag-warning', 'tag-danger')
          
          // 从所有筛选选项中查找对应的tagType
          let foundTagType = 'primary'
          props.filterOptions.forEach(option => {
            if (option.options) {
              const foundOption = option.options.find(opt => opt.label === tagText)
              if (foundOption?.tagType) {
                foundTagType = foundOption.tagType
              }
            }
          })
          
          // 设置对应的样式类
          tag.classList.add(`tag-${foundTagType}`)
        }
      })
    })
  })
}

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 手动清空数据确保完全重置
  const resetData = generateFormData()
  Object.keys(formData).forEach(key => {
    delete formData[key]
  })
  Object.assign(formData, resetData)
  
  // 通知父组件数据已重置
  emit('update:modelValue', resetData)
}

// 取消操作
const handleCancel = () => {
  emit('close')
  handleReset()
}

// 筛选操作
const handleFilter = () => {
  // 过滤掉空值
  const filterData: Record<string, any> = {}
  Object.keys(formData).forEach(key => {
    const value = formData[key]
    if (value !== '' && value !== undefined && value !== null) {
      if (Array.isArray(value) && value.length === 0) {
        return
      }
      filterData[key] = value
    }
  })
  
  // 通知父组件当前表单数据
  emit('update:modelValue', formData)
  emit('filter', filterData)
  emit('close')
  // handleReset()
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

/* 多选下拉框标签样式 */
:deep(.multiple-select) {
  .el-select__tags {
    .el-tag {
      margin: 2px 4px 2px 0;
    }
  }
}

/* 标签样式类 */
:deep(.tag-primary) {
  background-color: #f0f9ff !important;
  border-color: #b3d8ff !important;
  color: #409eff !important;
  
  .el-tag__close {
    color: #409eff !important;
    
    &:hover {
      background-color: #409eff !important;
      color: #fff !important;
    }
  }
  
  &:hover {
    background-color: #e6f7ff !important;
    border-color: #91d5ff !important;
  }
}

:deep(.tag-success) {
  background-color: #f0f9eb !important;
  border-color: #e1f3d7 !important;
  color: #67c23a !important;
  
  .el-tag__close {
    color: #67c23a !important;
    
    &:hover {
      background-color: #67c23a !important;
      color: #fff !important;
    }
  }
  
  &:hover {
    border-color: #67c23a !important;
  }
}

:deep(.tag-info) {
  background-color: #f4f4f5 !important;
  border-color: #d3d4d6 !important;
  color: #909399 !important;
  
  .el-tag__close {
    color: #909399 !important;
    
    &:hover {
      background-color: #909399 !important;
      color: #fff !important;
    }
  }
  
  &:hover {
    border-color: #c8c9cc !important;
  }
}

:deep(.tag-warning) {
  background-color: #fdf6ec !important;
  border-color: #f5dab1 !important;
  color: #e6a23c !important;
  
  .el-tag__close {
    color: #e6a23c !important;
    
    &:hover {
      background-color: #e6a23c !important;
      color: #fff !important;
    }
  }
  
  &:hover {
    border-color: #f0c78a !important;
  }
}

:deep(.tag-danger) {
  background-color: #fef0f0 !important;
  border-color: #fbc4c4 !important;
  color: #f56c6c !important;
  
  .el-tag__close {
    color: #f56c6c !important;
    
    &:hover {
      background-color: #f56c6c !important;
      color: #fff !important;
    }
  }
  
  &:hover {
    border-color: #f89898 !important;
  }
}
</style> 