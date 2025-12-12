<script setup lang="ts">
import { ref, computed } from 'vue'

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 完整的数据列表
const allTableData = ref([
  { relationType: '关系1', relationDirection: '→', targetEntity: '实体1' },
  { relationType: '关系2', relationDirection: '→', targetEntity: '实体2' },
  { relationType: '关系3', relationDirection: '→', targetEntity: '实体3' },
  { relationType: '关系4', relationDirection: '→', targetEntity: '实体4' },
  { relationType: '关系5', relationDirection: '→', targetEntity: '实体5' },
  { relationType: '关系6', relationDirection: '←', targetEntity: '实体6' },
  { relationType: '关系7', relationDirection: '→', targetEntity: '实体7' },
  { relationType: '关系8', relationDirection: '←', targetEntity: '实体8' },
  { relationType: '关系9', relationDirection: '→', targetEntity: '实体9' },
  { relationType: '关系10', relationDirection: '→', targetEntity: '实体10' }
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
</script>

<template>
  <div>
    <ElTable :data="tableData" style="width: 100%" class="entity-attribute-table">
      <ElTableColumn prop="relationType" label="关系类型" />
      <ElTableColumn prop="relationDirection" label="关系方向" width="80" />
      <ElTableColumn prop="targetEntity" label="目标实体" />
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
