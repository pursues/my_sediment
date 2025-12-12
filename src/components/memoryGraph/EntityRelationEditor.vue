<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Edit } from '@element-plus/icons-vue'

// 定义组件的emits

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
    relationType: '关系1',
    relationDirection: '→',
    targetEntity: '实体1',
    originalRelationType: '关系1',
    originalTargetEntity: '实体1',
    hasChanges: false
  },
  {
    id: '2',
    relationType: '关系2',
    relationDirection: '→',
    targetEntity: '实体2',
    originalRelationType: '关系2',
    originalTargetEntity: '实体2',
    hasChanges: false
  },
  {
    id: '3',
    relationType: '关系3',
    relationDirection: '→',
    targetEntity: '实体3',
    originalRelationType: '关系3',
    originalTargetEntity: '实体3',
    hasChanges: false
  },
  {
    id: '4',
    relationType: '关系4',
    relationDirection: '→',
    targetEntity: '实体4',
    originalRelationType: '关系4',
    originalTargetEntity: '实体4',
    hasChanges: false
  },
  {
    id: '5',
    relationType: '关系5',
    relationDirection: '→',
    targetEntity: '实体5',
    originalRelationType: '关系5',
    originalTargetEntity: '实体5',
    hasChanges: false
  },
  {
    id: '6',
    relationType: '关系6',
    relationDirection: '←',
    targetEntity: '实体6',
    originalRelationType: '关系6',
    originalTargetEntity: '实体6',
    hasChanges: false
  },
  {
    id: '7',
    relationType: '关系7',
    relationDirection: '→',
    targetEntity: '实体7',
    originalRelationType: '关系7',
    originalTargetEntity: '实体7',
    hasChanges: false
  },
  {
    id: '8',
    relationType: '关系8',
    relationDirection: '←',
    targetEntity: '实体8',
    originalRelationType: '关系8',
    originalTargetEntity: '实体8',
    hasChanges: false
  },
  {
    id: '9',
    relationType: '关系9',
    relationDirection: '→',
    targetEntity: '实体9',
    originalRelationType: '关系9',
    originalTargetEntity: '实体9',
    hasChanges: false
  },
  {
    id: '10',
    relationType: '关系10',
    relationDirection: '→',
    targetEntity: '实体10',
    originalRelationType: '关系10',
    originalTargetEntity: '实体10',
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
      item.hasChanges =
        item.relationType !== item.originalRelationType ||
        item.targetEntity !== item.originalTargetEntity
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
    item.relationType = item.originalRelationType
    item.targetEntity = item.originalTargetEntity
    item.hasChanges = false
  })
}

// 确认保存后更新原始值
const confirmSave = () => {
  allTableData.value.forEach((item) => {
    if (item.hasChanges) {
      item.originalRelationType = item.relationType
      item.originalTargetEntity = item.targetEntity
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
      <ElTableColumn prop="relationType" label="关系类型">
        <template #default="scope">
          <div class="flex items-center">
            <ElInput v-model="scope.row.relationType" placeholder="请输入关系类型" class="flex-1" />
            <ElIcon v-if="scope.row.hasChanges" class="ml-2 text-orange-500" title="已修改">
              <Edit />
            </ElIcon>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="relationDirection" label="关系方向" width="100">
        <template #default="scope">
          <ElSelect v-model="scope.row.relationDirection" placeholder="方向">
            <ElOption label="→" value="→" />
            <ElOption label="←" value="←" />
            <ElOption label="↔" value="↔" />
          </ElSelect>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="targetEntity" label="目标实体">
        <template #default="scope">
          <ElInput v-model="scope.row.targetEntity" placeholder="请输入目标实体" />
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
