<template>
  <div class="attributes-section">
    <div class="attributes-header">
      <span>属性</span>
      <span>属性类型</span>
      <span>是否必填</span>
      <span>属性值</span>
      <span>操作</span>
    </div>
    
    <div
      v-for="(attr, index) in attributes"
      :key="index"
      class="attribute-row"
    >
      <el-input 
        v-model="attr.name" 
        placeholder="属性名" 
        size="small"
        @input="updateAttributes"
      />
      <el-select 
        v-model="attr.type" 
        size="small"
        @change="updateAttributes"
      >
        <el-option 
          v-for="type in attributeTypes"
          :key="type.value"
          :label="type.label" 
          :value="type.value" 
        />
      </el-select>
      <el-select 
        v-model="attr.required" 
        size="small"
        @change="updateAttributes"
      >
        <el-option label="是" value="true" />
        <el-option label="否" value="false" />
      </el-select>
      <el-input 
        v-model="attr.value" 
        placeholder="属性值" 
        size="small"
        @input="updateAttributes"
      />
      <el-button 
        type="danger" 
        text 
        size="small"
        @click="removeAttribute(index)"
      >
        删除
      </el-button>
    </div>
    
    <el-button 
      type="primary" 
      text 
      @click="addAttribute" 
      class="add-button"
    >
      + 添加属性
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Attribute {
  name: string
  type: string
  required: string
  value: string
}

const props = withDefaults(defineProps<{
  modelValue?: Attribute[]
}>(), {
  modelValue: () => []
})

const emits = defineEmits<{
  'update:modelValue': [value: Attribute[]]
}>()

const attributes = ref<Attribute[]>([...props.modelValue])

// 属性类型配置
const attributeTypes = [
  { label: 'string', value: 'string' },
  { label: 'boolean', value: 'boolean' },
  { label: 'number', value: 'number' },
  { label: 'date', value: 'date' }
]

// 添加属性
const addAttribute = (): void => {
  attributes.value.push({
    name: '',
    type: 'string',
    required: 'false',
    value: ''
  })
  updateAttributes()
}

// 删除属性
const removeAttribute = (index: number): void => {
  attributes.value.splice(index, 1)
  updateAttributes()
}

// 更新属性到父组件
const updateAttributes = (): void => {
  emits('update:modelValue', [...attributes.value])
}

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  attributes.value = [...newVal]
}, { deep: true })
</script>

<style scoped lang="scss">
.attributes-section {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}

.attributes-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 80px;
  gap: 8px;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
  color: #666;
  font-size: 14px;
}

.attribute-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 80px;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.add-button {
  margin-top: 8px;
}
</style> 