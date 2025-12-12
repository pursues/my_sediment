<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()
const loginForm = ref({
  username: '187475806@jiyitupu',
  password: '129384757689'
})
const loading = ref(false)
const handleLogin = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    router.replace('/template-list')
  }, 2000)
 
  // 这里添加登录逻辑
  ElMessage.success('登录成功')
}
</script>

<template>
  <div class="login-container h-full w-full flex items-center justify-center" v-loading="loading">
    <div class="login-box w-[500px] bg-white rounded-[16px] p-[32px] shadow-lg">
      <!-- Logo 和标题 -->
      <div class="text-center mb-[24px]">
        <div class="logo-wrapper mb-[8px] p-[4px] flex justify-center">
          <img 
            src="../assets/icons/logo-mian.svg" 
            alt="记忆图谱平台" 
            class="w-[64px] h-[64px]"
          />
        </div>
        <h1 class="text-[30px] font-bold text-[#000000]">
          欢迎使用记忆图谱平台
        </h1>
      </div>

      <!-- 登录表单 -->
      <el-form 
        :model="loginForm" 
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <!-- 用户名输入框 -->
        <el-form-item class="custom-form-item">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            class="login-input"
          />
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item class="custom-form-item_sec">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            class="login-input"
            show-password
          />
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item class="custom-form-item_sub">
          <el-button
            type="primary"
            size="large"
            class="login-button w-full mb-0"
            :class="{ 'login-button-disabled': !loginForm.username || !loginForm.password }"
            :disabled="!loginForm.username || !loginForm.password"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
}

.login-box {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  .custom-form-item{
    margin-bottom: 24px !important;
  }
  .custom-form-item_sec{
    margin-bottom: 32px !important;
  }
  .custom-form-item_sub{
    margin-bottom: 0 !important;
  }
}

.logo-wrapper {
  img {
    border-radius: 12px;
  }
}

.login-input {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    box-shadow: none;
    transition: all 0.3s ease;
    // height: 40px;
    
    &:hover {
      border-color: var(--hc-primary);
    }
    
    &.is-focus {
      border-color: var(--hc-primary);
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
    }
  }
  
  :deep(.el-input__inner) {
    height: 40px;
    font-size: 16px;
  }
}

.login-button {
  height: 48px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  background: var(--hc-primary);
  border: none;
  transition: all 0.3s ease;
  &.login-button-disabled{
    opacity: 0.5;
    &:hover{
        box-shadow: none;
    }
  }
  &:hover{
    box-shadow: 0 0 2px 1px rgba(64, 158, 255, 0.7);
  }
}

// 响应式设计
@media (max-width: 480px) {
  .login-box {
    width: 90%;
    padding: 24px;
  }
  
  h1 {
    font-size: 24px;
  }
}
</style>