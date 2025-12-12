<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// import { Edit } from '@element-plus/icons-vue'

const emits = defineEmits<{
  change: [data: any[]]
}>()

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 完整的数据列表
const allTableData = ref([
  {
    id: '1',
    name: '属性1',
    type: 'string',
    required: '是',
    value: '属性的1值',
    originalValue: '属性的1值',
    hasChanges: false
  },
  {
    id: '2',
    name: '属性2',
    type: 'boolean',
    required: '是',
    value: '属性的2值',
    originalValue: '属性的2值',
    hasChanges: false
  },
  {
    id: '3',
    name: '属性3',
    type: 'string',
    required: '是',
    value: '属性的3值',
    originalValue: '属性的3值',
    hasChanges: false
  },
  {
    id: '4',
    name: '属性4',
    type: 'string',
    required: '是',
    value: '属性的4值',
    originalValue: '属性的4值',
    hasChanges: false
  },
  {
    id: '5',
    name: '属性5',
    type: 'string',
    required: '是',
    value: '属性的5值',
    originalValue: '属性的5值',
    hasChanges: false
  },
  {
    id: '6',
    name: '属性6',
    type: 'string',
    required: '是',
    value: '属性的6值',
    originalValue: '属性的6值',
    hasChanges: false
  },
  {
    id: '7',
    name: '属性7',
    type: 'string',
    required: '是',
    value: '属性的7值',
    originalValue: '属性的7值',
    hasChanges: false
  },
  {
    id: '8',
    name: '属性8',
    type: 'string',
    required: '是',
    value: '属性的8值',
    originalValue: '属性的8值',
    hasChanges: false
  },
  {
    id: '9',
    name: '属性9',
    type: 'string',
    required: '是',
    value: '属性的9值',
    originalValue: '属性的9值',
    hasChanges: false
  },
  {
    id: '10',
    name: '属性10',
    type: 'string',
    required: '是',
    value: '属性的10值',
    originalValue: '属性的10值',
    hasChanges: false
  }
])

// 初始化总数
total.value = allTableData.value.length

// 分页后的数据
const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allTableData.value.slice(start, end)
})

// 分页事件处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 监听值变化并标记编辑状态
watch(
  allTableData,
  (newData) => {
    newData.forEach((item) => {
      item.hasChanges = item.value !== item.originalValue
    })

    // 发送变化数据给父组件
    const changedData = newData.filter((item) => item.hasChanges)
    emits('change', changedData)
  },
  { deep: true }
)

// 获取所有修改的数据
const getChangedData = () => {
  return allTableData.value.filter((item) => item.hasChanges)
}

// 重置所有修改
const resetChanges = () => {
  allTableData.value.forEach((item) => {
    item.value = item.originalValue
    item.hasChanges = false
  })
}

// 确认保存后更新原始值
const confirmSave = () => {
  allTableData.value.forEach((item) => {
    if (item.hasChanges) {
      item.originalValue = item.value
      item.hasChanges = false
    }
  })
}

// 暴露方法给父组件
defineExpose({
  getChangedData,
  resetChanges,
  confirmSave
})
</script>

<template>
  <div>
    <ElTable :data="tableData" style="width: 100%" class="entity-attribute-table">
      <ElTableColumn prop="name" label="属性" />
      <ElTableColumn prop="type" label="属性类型" />
      <ElTableColumn prop="required" label="是否必填" />
      <ElTableColumn prop="value" label="属性值">
        <template #default="scope">
          <div class="flex items-center">
            <ElInput v-model="scope.row.value" placeholder="请输入属性值" class="flex-1" />
            <!-- <ElIcon v-if="scope.row.hasChanges" class="ml-2 text-orange-500" title="已修改">
              <Edit />
            </ElIcon> -->
          </div>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="sizes, prev, pager, next"
        class="text-[14px] text-[#606266]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.entity-attribute-table {
  // 表头样式
  :deep(.el-table__header-wrapper) {
    .el-table__header {
      th {
        background-color: #f5f7fa !important;
        font-size: 14px;
        font-weight: normal;
        height: 40px;
        .cell {
          font-size: 14px;
          font-weight: normal;
        }
      }
    }
  }

  // 表体样式
  :deep(.el-table__body-wrapper) {
    .el-table__body {
      tr {
        td {
          height: 44px;
          font-size: 14px;
          font-weight: normal;
          color: #303133;
          .cell {
            font-size: 14px;
            font-weight: normal;
            color: #303133;
          }
        }
      }
    }
  }
}

// 分页容器样式
.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 12px;
}
</style>
