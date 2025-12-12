<script setup lang="ts">
import { ref, computed } from 'vue'

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 完整的数据列表
const allTableData = ref([
  { name: '属性1', type: 'string', required: '是', value: '属性的1值' },
  { name: '属性2', type: 'boolean', required: '是', value: '属性的2值' },
  { name: '属性3', type: 'string', required: '是', value: '属性的3值' },
  { name: '属性4', type: 'string', required: '是', value: '属性的4值' },
  { name: '属性5', type: 'string', required: '是', value: '属性的5值' },
  { name: '属性6', type: 'string', required: '是', value: '属性的6值' },
  { name: '属性7', type: 'string', required: '是', value: '属性的7值' },
  { name: '属性8', type: 'string', required: '是', value: '属性的8值' },
  { name: '属性9', type: 'string', required: '是', value: '属性的9值' },
  { name: '属性10', type: 'string', required: '是', value: '属性的10值' }
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
      <ElTableColumn prop="name" label="属性" />
      <ElTableColumn prop="type" label="属性类型" />
      <ElTableColumn prop="required" label="是否必填" />
      <ElTableColumn prop="value" label="属性值" />
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
        background-color: #F5F7FA !important;
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
