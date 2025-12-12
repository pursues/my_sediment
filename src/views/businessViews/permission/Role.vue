<template>
  <div class="role-management">
    <div class="role-layout">
      <!-- 左侧角色列表 -->
      <div class="role-left">
        <RoleList @role-select="handleRoleSelect" />
      </div>
      
      <!-- 右侧权限设置 -->
      <div class="role-right">
        <RolePermission :selected-role="selectedRole" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RoleList from '@/components/permission/RoleList.vue'
import RolePermission from '@/components/permission/RolePermission.vue'
import type { RoleItem } from '@/types/permission'


// 选中的角色
const selectedRole = ref<RoleItem | null>(null)

// 处理角色选择
const handleRoleSelect = (role: RoleItem) => {
  selectedRole.value = role
}
</script>

<style scoped lang="scss">
.role-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  .role-layout {
    width: 100%;
    display: flex;
    height: 100%;
    border-radius: 12px;
    border: 1px solid #DCDFE6;
    .role-left {
      width: 208px;
      border-right: 1px solid #DCDFE6;
    }

    .role-right {
      width: calc(100% - 208px);
    }
  }
}
</style>