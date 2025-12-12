<template>
  <div class="user-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 左侧按钮组 -->
      <div class="toolbar-left">
        <el-button 
          type="primary" 
          class="bg-primary" 
          :icon="Plus" 
          @click="handleAddUser"
        >
          添加用户
        </el-button>
        <el-button 
          :icon="Delete" 
          :disabled="selectedRows.length === 0" 
          @click="handleBatchDelete"
        >
          删除
        </el-button>
      </div>
      
      <!-- 右侧搜索区域 -->
      <UserSearch @searchData="handleSearch" />
    </div>

    <!-- 表格 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        v-loading="loading"
        class="user-table"
        height="100%"
      >
        <el-table-column type="selection" width="55" :selectable="checkSelectable" />
        
        <el-table-column prop="account" label="账号" min-width="120" />
        
        <el-table-column prop="userName" label="用户名" min-width="100" />
        
        <el-table-column prop="role" label="角色" >
          <template #default="scope">
            <el-tag
              :type="getRoleTagType(scope.row.role)"
              size="small"
            >
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="password" label="密码" >
          <template #default>
            <span>*********</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="220" />
        
        <el-table-column prop="updateTime" label="更新时间" width="220" />
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              link
              v-if="scope.row.role !== 'super_admin'"
              type="primary"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
        
        <template #empty>
          <div class="empty-container">
            <img src="@/assets/icons/no-data.svg" alt="no-data" />
            <div class="empty-content">
              <span>暂无用户，请</span>
              <el-button link type="primary" @click="handleAddUser">添加用户</el-button>
            </div>
          </div>
        </template>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 用户弹窗 -->
    <UserDialog ref="dialogRef" @confirm="loadData()" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted,reactive } from 'vue'
import { 
  Plus, 
  Delete,
} from '@element-plus/icons-vue'
import { ElMessage,ComponentSize } from 'element-plus'
import UserDialog from '@/components/permission/UserDialog.vue'
import UserSearch from '@/components/permission/UserSearch.vue'
import { UserItem,RoleTagColor,UserFilterData } from '@/types/permission'
import { getUserList,batchDeleteUser } from '@/api'
import { modalWait } from '@/utils/common'


// 响应式数据
const loading = ref(false)

// 表格数据
const tableData = ref<UserItem[]>([])
const selectedRows = ref<UserItem[]>([])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(100)
const total = ref(0)
const size = ref<ComponentSize>('default')

// 请求参数
const filterParams = reactive<UserFilterData>({
  keyword: '',
  createTimeRage: undefined,
  updateTimeRage: undefined
})

// 弹窗相关
const dialogRef = ref<InstanceType<typeof UserDialog>>()

// 模拟数据
const mockData: UserItem[] = [
  {
    id: '1',
    account: 'zhanghaolD1',
    userName: '徐之琪',
    role: 'super_admin',
    password: '123456789',
    createTime: '2025-07-12 12:00:00',
    updateTime: '2025-07-12 12:00:00'
  },
  {
    id: '2',
    account: 'zhanghaolD2',
    userName: '雨奇',
    role: 'tech_lead',
    password: '123456789',
    createTime: '2025-07-12 12:00:00',
    updateTime: '2025-07-12 12:00:00'
  },
  {
    id: '3',
    account: 'zhanghaolD3',
    userName: '雨奇',
    role: 'business_expert',
    password: '123456789',
    createTime: '2025-07-12 12:00:00',
    updateTime: '2025-07-12 12:00:00'
  },
  {
    id: '4',
    account: 'zhanghaolD4',
    userName: '雨奇',
    role: 'normal_user',
    password: '123456789',
    createTime: '2025-07-12 12:00:00',
    updateTime: '2025-07-12 12:00:00'
  }
]

// 为了填满页面，复制更多数据
for (let i = 5; i <= 15; i++) {
  mockData.push({
    id: i.toString(),
    account: `zhanghaolD${i}`,
    userName: '雨奇',
    role: 'normal_user',
    password: '123456789',
    createTime: '2025-07-12 12:00:00',
    updateTime: '2025-07-12 12:00:00'
  })
}

// 角色标签类型
const getRoleTagType = (role: string): RoleTagColor => {
  const typeMap: Record<string, RoleTagColor> = {
    'super_admin': 'danger',
    'tech_lead': 'warning',
    'business_expert': 'success',
    'normal_user': 'info'
  }
  return typeMap[role] || 'info'
}

// 角色文本
const getRoleText = (role: string) => {
  const textMap: Record<string, string> = {
    'super_admin': '超级管理员',
    'tech_lead': '技术负责人',
    'business_expert': '业务技术专家',
    'normal_user': '普通用户'
  }
  return textMap[role] || '普通用户'
}

// 检查行是否可选择（超级管理员不可选择）
const checkSelectable = (row: UserItem) => {
  return row.role !== 'super_admin'
}

// 新增
const handleAddUser = () => {
  dialogRef.value?.show()
}
// 编辑
const handleEdit = (row: UserItem) => {
  dialogRef.value?.show(row)
}
// 删除
const handleDelete = async (row: UserItem) => {

  const isOK = await modalWait({ content: `确认删除该用户吗？`})
  if(!isOK) return
  try {
    const { data,message } = await batchDeleteUser([row.id])
    
    if(data){
      ElMessage.success(message)
      loadData()
    }else{
      ElMessage.error(message)
    }
    
    loadData()
  } catch {
    // 用户取消删除
    ElMessage.error('删除接口未联调')
  }
}

const handleBatchDelete = async () => {

  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }

  const isOK = await modalWait({ 
    content: `确认删除吗？`,
    subContent: `删除后，${selectedRows.value.length}名用户将无法访问系统`
  })
  if(!isOK) return
  
  try {

    const { data,message } = await batchDeleteUser(selectedRows.value.map(item => item.id))

    if(data){
      ElMessage.success(message)
      loadData()
    }else{
      ElMessage.error(message)
    }
    
    loadData()
  } catch {
    // 用户取消删除
  }
}

const handleSelectionChange = (selection: UserItem[]) => {
  selectedRows.value = selection
}

const handleSearch = (filterData:UserFilterData) => {
  currentPage.value = 1

  // 遍历筛选数据，有值则赋值给filterParams   事件dateRange可能需要改为startTime ,endTime
  Object.keys(filterData).forEach((key) => {
    if(filterData[key as keyof UserFilterData]){
      filterParams[key as keyof UserFilterData] = filterData[key as keyof UserFilterData] as any
    }
  })
  loadData()
}


// 分页功能
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadData()
}
// 数据加载
const loadData = async () => {
  loading.value = true
  try{
    // const {data,total:totalData} = await getUserList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   ...filterParams
    // })
    // tableData.value = data
    // total.value = totalData

  }catch(error){
    console.error('获取用户列表失败:', error)
  }finally{
    loading.value = false
  }
  
  // 模拟 API 请求延迟
  setTimeout(() => {
    // 应用搜索过滤
    let filteredData = [...mockData]
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    tableData.value = filteredData.slice(start, end)
    total.value = filteredData.length
    
    loading.value = false
  }, 300)
}

// 组件挂载
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.user-management {
  padding: 0;
  background-color: #fff;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .toolbar {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    background: white;
    border-radius: 8px;

    .toolbar-left {
      display: flex;
      gap: 8px;
      
      .el-button {
        margin-left: 0;
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
    }
  }

  .table-container {
    flex: 1;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      
      .empty-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 44px;
        font-size: 14px;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: right;
    margin-top: 16px;
  }
}

:deep(.el-table__inner-wrapper:before) {
  display: none;
}

:deep(.user-table) {
  .el-table__header {
    th {
      background-color: #fafafa;
      color: #262626;
      font-weight: 500;
    }
  }
}
</style>