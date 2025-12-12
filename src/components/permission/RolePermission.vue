<template>
  <div class="set-permission">
    <!-- 头部 -->
    <div class="header" v-if="selectedRole">
        <div class="header-left">
          <h3>{{ selectedRole.roleName }}</h3>
        </div>
        <div class="header-right">
          <el-button 
            v-if="!isEditing" 
            type="primary" 
            @click="handleStartEdit"
          >
            修改角色权限
          </el-button>
          <template v-else>
            <el-button @click="handleCancelEdit">取消</el-button>
            <el-button type="primary" @click="handleSavePermission" :loading="saving">
              保存
            </el-button>
          </template>
        </div>
    </div>
    <div class="no-role" v-else>
      <div class="empty-state">
        <div class="empty-icon">🛡️</div>
        <div class="empty-title">请选择角色</div>
        <div class="empty-desc">选择左侧角色后可设置其权限</div>
      </div>
    </div>

    <!-- 权限树 -->
    <div class="permission-content" v-if="selectedRole">
      <el-tree
        ref="treeRef"
        :data="permissionTree"
        :props="treeProps"
        show-checkbox
        node-key="key"
        :disabled="!isEditing"
        :checked-keys="checkedKeys"
        :expand-on-click-node="false"
        :default-expand-all="true"
        @check="handleTreeCheck"
        >
        <template #default="{ node, data }">
        <div v-if="isEditing && selectedRole?.roleCode === 'super_admin'" class="custom-tree-node">
          <span>{{ node.label }}</span>
          <div>
            <el-button :icon="Plus" type="primary" link @click="append(data)">
            </el-button>
            <el-button
              style="margin-left: 4px"
              type="danger"
              :icon="Delete"
              link
              @click="remove(node, data)"
            >
            </el-button>
          </div>
        </div>
      </template>
      </el-tree>
    </div>
    <AddPermission ref="addPermissionRef" @confirm="handleAddPermission" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick,onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { RoleItem,PermissionNode,EditPermissionItem } from '@/types/permission'
import type { TreeNodeData,RenderContentContext } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import AddPermission from './AddPermission.vue'
import { saveUserPermission,getPermissionData } from '@/api'

type Node = RenderContentContext['node']

// 最后一级需要铺平
const customNodeClass = ({ children }: TreeNodeData) =>{
  return !children ? 'is-penultimate' : ''
}
// 禁用
const disabled = () => {
  return !isEditing.value || props.selectedRole?.roleCode === 'super_admin'
}

// Props
const props = defineProps<{
  selectedRole: RoleItem | null
}>()

// 响应式数据
const isEditing = ref(false)
const saving = ref(false)
const treeRef = ref()
const checkedKeys = ref<string[]>([])
const addPermissionRef = ref()


// 树形控件配置
const treeProps = {
  children: 'children',
  label: 'label',
  disabled:disabled,
  class: customNodeClass
}

// 权限树数据
const permissionTree = ref<PermissionNode[]>([])

// 方法
const handleStartEdit = () => {
  isEditing.value = true
}

const handleCancelEdit = () => {
  isEditing.value = false
  // 重置选中状态
  loadRolePermissions()
  if (treeRef.value) {
    treeRef.value.setCheckedKeys(checkedKeys.value)
  }
}
// 添加权限点
const append = (data: PermissionNode) => {
  // addPermissionRef.value.show(data)
  // 添加节点
  const newChild = { 
    id: Math.random().toString(36).substr(2, 9),
    key: `key${Math.random().toString(36).substr(2, 6)}`, 
    parentId: data.id, 
    label: `新增的权限点${Math.random().toString(36).substr(2, 6)}`, 
  }
  if (!data.children) {
    data.children = []
  }
  data.children.push(newChild)
}
// 添加权限点成功后，刷新权限树
const handleAddPermission = () => {
  // if (treeRef.value) {
  //   treeRef.value.setCheckedKeys(checkedKeys.value)
  // }
}

const remove = (node: Node, data: EditPermissionItem) => {
  const parent = node.parent
  const children: PermissionNode[] = parent?.data.children || parent?.data
  const index = children.findIndex((d) => d.id === data.id)
  children.splice(index, 1)
}

const handleSavePermission = async () => {
  saving.value = true
  try {
    // 获取选中的权限
    const checkedNodes = treeRef.value.getCheckedKeys()
    const halfCheckedNodes = treeRef.value.getHalfCheckedKeys()
    
    // 模拟保存API
    await new Promise(resolve => setTimeout(resolve, 1000))

    const {data,message} = await saveUserPermission({roleId:props.selectedRole?.id || '',permissionIds:checkedNodes})

    if(data){
      ElMessage.success(message)
    }else{
      ElMessage.error(message)
    }


    
    ElMessage.success('权限保存成功')
    isEditing.value = false
    
    console.log('选中的权限:', checkedNodes)
    
    console.log('半选中的权限:', halfCheckedNodes)
  } catch (error) {
    ElMessage.error('权限保存接口未联调')
    
  } finally {
    saving.value = false
  }
}

const handleTreeCheck = (data: PermissionNode, checked: any) => {
  // 处理权限选择逻辑
  console.log('权限变更:', data, checked)
}
// 获取权限点数据
const initData = async () => {
  try{
      
    // 获取权限数据
    const {data,message} = await getPermissionData()

    if(data){
      permissionTree.value = data
    }else{
      ElMessage.error(message)
    }
  }catch(error){
    ElMessage.error('获取权限点数据接口未联调，使用mock数据')
  }
  // 使用mock数据
  permissionTree.value = [
    {
      id: '1',
      key: 'document_manage',
      label: '文档管理',
      parentId: '',
      children: [
        {
          id: '1-1',
          key: 'document_upload',
          parentId: '1',
          label: '上传文档功能'
        },
        {
          id: '1-2',
          key: 'document_list',
          parentId: '1',
          label: '文档列表功能'
        }
      ]
    },
    {
      id: '2',
      key: 'memory_extract',
      label: '记忆抽取',
      parentId: '',
      children: [
        {
          id: '2-1',
          key: 'template_list',
          parentId: '2',
          label: '模板列表功能',
          children: [
            {
              id: '2-1-1',
              key: 'template_cut',
              parentId: '2-1',
              label: '切换模板'
            },
            {
              id: '2-1-2',
              key: 'template_operation',
              parentId: '2-1',
              label: '操作模板列表'
            }
          ]
        },
        {
          id: '2-2',
          key: 'task_manage',
          parentId: '',
          label: '任务管理',
          children: [
            {
              id: '2-2-1',
              key: 'task_publish',
              parentId: '2-2',
              label: '发布记忆'
            },
            {
              id: '2-2-2',
              key: 'task_operation',
              parentId: '2-2',
              label: '操作记忆任务'
            }
          ]
        }
      ]
    },
    {
      id: '3',
      key: 'memory_graph',
      parentId: '',
      label: '记忆图谱',
      children: [
        {
          id: '3-1',
          key: 'graph_edit',
          parentId: '3',
          label: '编辑图谱'
        },
        {
          id: '3-2',
          key: 'graph_history',
          parentId: '3',
          label: '查看历史版本'
        },
        {
          id: '3-3',
          key: 'graph_rollback',
          parentId: '3',
          label: '回滚历史版本'
        },
        {
          id: '3-4',
          key: 'graph_query',
          parentId: '3',
          label: '查询图谱'
        }
      ]
    }
  ]
}

// 根据角色加载权限
const loadRolePermissions = () => {
  if (!props.selectedRole) {
    checkedKeys.value = []
    return
  }
  
  // 根据角色类型设置默认权限
  const rolePermissions: Record<string, string[]> = {
    'super_admin': [
      'document_manage', 'document_upload', 'document_list',
      'memory_extract', 'template_list', 'template_cut', 'template_operation',
      'task_manage', 'task_publish', 'task_operation',
      'memory_graph', 'graph_edit', 'graph_history', 'graph_rollback', 'graph_query'
    ],
    'tech_lead': [
      'document_manage', 'document_upload', 'document_list',
      'memory_extract', 'template_list', 'template_cut', 'template_operation',
      'task_manage', 'task_publish', 'task_operation',
    ],
    'business_expert': [
      'document_manage', 'document_upload', 'document_list',
      'memory_extract', 'template_list', 'template_cut', 'template_operation',
      'task_manage', 'task_publish', 'task_operation',
       'graph_edit', 'graph_history', 'graph_query'
    ],
    'normal_user': [
      'document_manage', 'document_list',
      'graph_history', 'graph_query'
      
    ]
  }
  
  checkedKeys.value = rolePermissions[props.selectedRole.roleCode] || []
}
onMounted(() => {
  initData()
})
// 监听选中的角色变化
watch(() => props.selectedRole, () => {
  isEditing.value = false
  nextTick(() => {
    loadRolePermissions()
    // 重新设置tree的选中状态
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(checkedKeys.value)
    }
  })
}, { immediate: true })
</script>

<style scoped lang="scss">
.set-permission {
  display: flex;
  flex-direction: column;
  height: 100%;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
    .header-left{
      h3{
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .no-role {
      .empty-state {
        text-align: center;
        padding: 40px 0;

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 8px;
        }

        .empty-desc {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .permission-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }
}

:deep(.el-tree) {
  // 只设置第一级节点的样式
  > .el-tree-node > .el-tree-node__content {
    background: #F0F2F5;
    padding: 10px 12px;
    border-radius: 8px;
    height: 44px;
    display: flex;
    align-items: center;
  }
  .el-tree-node__content{
    height: 44px;
    display: flex;
    align-items: center;
    border-radius: 8px;
    margin: 6px 0;
    padding: 0 10px;
  }
     // 只对直接包含最后一级元素的父容器应用换行
   .el-tree-node__children:has(> .is-penultimate) {
     display: flex;
     flex-wrap: wrap;
     gap: 8px;
     padding-left: 20px;
   }
   
   // 最后一级铺平并支持换行
   .is-penultimate {
     display: inline-flex;
     align-items: center;
    //  margin: 2px 4px 2px 0;
    //  padding: 2px 8px;
   }
  .el-checkbox {
    margin-right: 8px;
  }
  .custom-tree-node{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .el-tree-node__expand-icon.is-leaf{
    display: none;
  }
  .el-tree-node__expand-icon{
    width: 24px;
    height: 24px;
  }
}
</style>
