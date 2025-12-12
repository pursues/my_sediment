<template>
  <div class="relationships-section">
    <div class="relationships-header">
      <span>关系类型</span>
      <span>关系方向</span>
      <span>目标实体类型</span>
      <span>操作</span>
    </div>
    
    <div
      v-for="(rel, index) in relationships"
      :key="index"
      class="relationship-row"
    >
      <el-select 
        v-model="rel.type" 
        size="small"
        placeholder="选择关系类型"
        @change="updateRelationships"
      >
        <el-option 
          v-for="type in relationshipTypes"
          :key="type.value"
          :label="type.label" 
          :value="type.value" 
        />
      </el-select>
      <el-select 
        v-model="rel.direction" 
        size="small"
        @change="updateRelationships"
      >
        <el-option label="→" value="source-target" />
        <el-option label="←" value="target-source" />
      </el-select>
      <el-select 
        v-model="rel.targetType" 
        size="small"
        placeholder="选择目标实体"
        @change="updateRelationships"
      >
        <el-option 
          v-for="entity in availableEntities"
          :key="entity.id"
          :label="entity.label" 
          :value="entity.id" 
        />
      </el-select>
      <el-button 
        type="danger" 
        text 
        size="small"
        @click="removeRelationship(index)"
      >
        删除
      </el-button>
    </div>
    
    <el-button 
      type="primary" 
      text 
      @click="addRelationship" 
      class="add-button"
    >
      + 添加关系
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Relationship {
  type: string
  direction: string
  targetType: string
}

interface Entity {
  id: string
  label: string
  nodeType: string
}

const props = withDefaults(defineProps<{
  modelValue?: Relationship[]
  availableEntities?: Entity[]
}>(), {
  modelValue: () => [],
  availableEntities: () => []
})

const emits = defineEmits<{
  'update:modelValue': [value: Relationship[]]
}>()

const relationships = ref<Relationship[]>([...props.modelValue])

// 关系类型配置
const relationshipTypes = [
  { label: '关联', value: 'related' },
  { label: '包含', value: 'contains' },
  { label: '属于', value: 'belongs' },
  { label: '依赖', value: 'depends' }
]

// 添加关系
const addRelationship = (): void => {
  relationships.value.push({
    type: '',
    direction: 'source-target',
    targetType: ''
  })
  updateRelationships()
}

// 删除关系
const removeRelationship = (index: number): void => {
  relationships.value.splice(index, 1)
  updateRelationships()
}

// 更新关系到父组件
const updateRelationships = (): void => {
  emits('update:modelValue', [...relationships.value])
}

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  relationships.value = [...newVal]
}, { deep: true })
</script>

<style scoped lang="scss">
.relationships-section {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}

.relationships-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 80px;
  gap: 8px;
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
  color: #666;
  font-size: 14px;
}

.relationship-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 80px;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.add-button {
  margin-top: 8px;
}
</style> 