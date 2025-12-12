<template>
  <div class="role-list">
    <!-- 顶部工具栏 -->
    <div class="role-header">
      <el-button 
        type="primary" 
        :icon="Plus" 
        @click="handleAddRole"
        style="width: 100%"
      >
        创建新角色
      </el-button>
    </div>
    <!-- 角色列表 -->
    <div class="role-content">
      <div class="role-items">
        <div 
          v-for="role in roles" 
          :key="role.id"
          class="role-item"
          :class="{ active: selectedRoleId === role.id }"
          @click="handleSelectRole(role)"
        >
          <div class="role-name">{{ role.roleName }}</div>
          <div 
            class="delete-icon"
            v-if="role.roleCode !== 'super_admin'"
            @click.stop="handleDeleteRole(role)"
          >
            <el-icon><Delete /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色弹窗 -->
    <RoleDialog ref="roleDialogRef" @confirm="loadRoles()" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import RoleDialog from './RoleDialog.vue'
import type { RoleItem } from '@/types/permission'
import { modalWait } from '@/utils/common'
import { deleteRole,getRoleData } from '@/api'

// 定义emits
const emit = defineEmits<{
  'role-select': [role: RoleItem]
}>()

// 响应式数据
const selectedRoleId = ref<string>('')
const roles = ref<RoleItem[]>([])
const roleDialogRef = ref()

// 模拟数据
const mockData: RoleItem[] = [
  {
    id: '1',
    roleName: '超级管理员',
    roleCode: 'super_admin',
    description: '系统最高权限，可以管理所有功能',
    createTime: '2025-07-12 12:00:00',
  },
  {
    id: '2',
    roleName: '技术负责人',
    roleCode: 'tech_lead',
    description: '技术团队负责人，可以管理技术相关功能',
    createTime: '2025-07-12 12:00:00',
  },
  {
    id: '3',
    roleName: '业务技术专家',
    roleCode: 'business_expert',
    description: '业务专家，可以管理业务相关功能',
    createTime: '2025-07-12 12:00:00',
  },
  {
    id: '4',
    roleName: '普通用户',
    roleCode: 'normal_user',
    description: '普通用户，只能查看和基本操作',
    createTime: '2025-07-12 12:00:00',
  }
]

// 方法
const handleAddRole = () => {
  roleDialogRef.value?.show()
}

const handleSelectRole = (role: RoleItem) => {
  selectedRoleId.value = role.id || ''
  emit('role-select', role)
}

const handleDeleteRole = async (role: RoleItem) => {
  try {
    const isOk = await modalWait({content:'确认删除角色吗？'})
    if (!isOk) return

    const {data,message} = await deleteRole(role.id)
    if (data) {
      ElMessage.success(message)
      loadRoles()
    } else {
      ElMessage.error(message)
    }

  } catch (error) {
    console.error('删除角色失败:', error)
    ElMessage.error('删除接口未联调')
  }
}

const loadRoles = async () => {

  try{
    const {data,message } = await getRoleData()
    if (data) {
      roles.value = data
    } else {
      ElMessage.error(message)
    }
  } catch (error) {
  }


  // 模拟API调用
  roles.value = [...mockData]
  
  // 默认选中第一个角色
  if (roles.value.length > 0 && !selectedRoleId.value) {
    handleSelectRole(roles.value[0])
  }
}

// 组件挂载
onMounted(() => {
  loadRoles()
})
</script>

<style scoped lang="scss">
.role-list {
  width: 208px;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;

  .role-header {
    width: 168px;
    button {
      background: #ECF5FF;
      color: #1677FF;
    }
  }

  .role-content {
    flex: 1;
    padding-top: 16px;
    overflow-y: hidden;
    .role-items {
      height: 100%;
      overflow-y: auto;
      .role-item {
        padding: 8px 12px;
        margin-bottom: 4px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 8px;
        position: relative;

        &:hover {
          background-color: #f5f7fa;
          
          .delete-icon {
            opacity: 1;
          }
        }

        &.active {
          background: #E6F4FF;
          color: #1677FF;
          font-weight: 500;
        }

        .role-name {
          font-size: 14px;
          color: inherit;
        }

        .delete-icon {
          opacity: 0;
          transition: opacity 0.2s;
          color: #f56c6c;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background-color: #fef0f0;
          }

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }
  }
}
</style>
