<template>
  <el-dialog
    :title="dialogTitle"
    v-model="visible"
    width="410px"
    :header-class="'custom-dialog-header'"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
      label-position="top"
    >
      <!-- 账号 - 编辑时禁用 -->
      <el-form-item label="账号" prop="account" v-if="status === 'edit'">
        <el-input
          v-model="formData.account"
          placeholder="请输入用户名"
          disabled
        />
      </el-form-item>

      <!-- 用户名 -->
      <el-form-item label="用户名" prop="userName">
        <el-input
          v-model="formData.userName"
          placeholder="请输入用户名"
          :maxlength="20"
          :minlength="2"
          clearable
        />
      </el-form-item>

      <!-- 用户密码 -->
      <el-form-item label="用户密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入用户密码"
          show-password
          maxlength="20"
          :minlength="6"
          clearable
        />
      </el-form-item>

      <!-- 角色 -->
      <el-form-item label="角色" prop="role" class="role-item">
        <div class="role-item-text" style="margin-top: 8px; color: #999; font-size: 12px;">
          没有想要的角色？
          <el-button link type="primary" size="small" @click="handleCreateRole">
            去新建
          </el-button>
        </div>
        <el-select
          v-model="formData.role"
          placeholder="请选择角色类型"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="item in roleOptions"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { getRoleData,addUser,updateUser } from '@/api'
import type { EditUserItem,RoleItem } from '@/types/permission'

const router = useRouter()

// 定义 emits
const emit = defineEmits<{
  (e:'confirm'):void
}>()

// 响应式数据
const formRef = ref<FormInstance>()

const loading = ref(false)

// 计算属性
const visible = ref(false)
const status = ref<'add' | 'edit'>('add')

const dialogTitle = computed(() => {
  return status.value === 'add' ? '添加用户' : '编辑用户'
})

// 表单数据
const formData = ref<EditUserItem>({
  account: '',
  userName: '',
  password: '',
  role: ''
})

// 角色选项
const roleOptions = ref<RoleItem[]>([])

// 表单验证规则
const rules ={
  userName: [{required: true, message: '请输入用户名', trigger: 'blur'}],
  password: [{required: true, message: '请输入用户密码', trigger: 'blur'}],
  role: [{required: true, message: '请选择角色', trigger: 'change'}]
}


const show = (item?:EditUserItem) => {
  visible.value = true
  resetForm()
  if(roleOptions.value.length === 0){
    initRole()
  }
  if(item){
    status.value = 'edit'
    formData.value = { ...item }
  }else{
    status.value = 'add'
    formData.value = {
      account: '',
      userName: '',
      password: '',
      role: ''
    }
  }
}

const initRole = async () => {
  try{

    const { data } = await getRoleData()

    if(data.length > 0){
      roleOptions.value = data
    }
    roleOptions.value = [
      { roleName: '超级管理员', roleCode:'super_admin',id: 'super_admin',description:'超级管理员',createTime:'2025-07-30' },
      { roleName: '技术负责人', roleCode:'tech_lead',id: 'tech_lead',description:'技术负责人',createTime:'2025-07-30' },
      { roleName: '业务技术专家', roleCode:'business_expert',id: 'business_expert',description:'业务技术专家',createTime:'2025-07-30' },
      { roleName: '普通用户', roleCode:'normal_user',id: 'normal_user',description:'普通用户',createTime:'2025-07-30' }
    ]
  } catch (error) {
    console.error('获取角色数据失败:', error)
    ElMessage.error('获取角色数据接口未联调')
  }
}

// 重置表单
const resetForm = () => {

  formData.value = {
    account: '',
    userName: '',
    password: '',
    role: ''
  }
  formRef.value?.clearValidate()
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  visible.value = false
}

// 确认操作
const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { data,message } = status.value === 'add' ? 
      await addUser(formData.value) 
      : await updateUser({...formData.value,id:formData.value.id!})

    if(data){
      ElMessage.success(message)
      emit('confirm')
      handleClose()
    }else{
      ElMessage.error(message)
    }

    emit('confirm')
    handleClose()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('接口未联调')
  } finally {
    loading.value = false
  }
}

// 创建角色
const handleCreateRole = () => {
  router.push('/permission-management/role')
}

defineExpose({
  show
})

</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
// 设置dialog整体样式
:deep(.el-dialog) {
  padding: 24px;
}

// 直接设置header样式 - 方法1：通过header-class
:deep(.custom-dialog-header) {
  font-size: 18px !important;
  font-weight: 500 !important;
  color: #303133 !important;
}
.role-item{
  position: relative;
  .role-item-text{
    position: absolute;
    top: -42px;
    right: 0;
  }
}

</style>