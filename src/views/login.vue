<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { View, Hide } from '@element-plus/icons-vue'
import LoginCharacter from '@/components/LoginCharacter.vue'

const router = useRouter()
const loginForm = ref({
  username: '187475806@jiyitupu',
  password: '129384757689'
})
const loading = ref(false)

// Animation States
const mouseX = ref(window.innerWidth / 2)
const mouseY = ref(window.innerHeight / 2)
const passwordVisible = ref(false)
const isSad = ref(false)

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

const handleLogin = () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    isSad.value = true
    ElMessage.error('用户名或密码不能为空')
    setTimeout(() => { isSad.value = false }, 2000)
    return
  }

  loading.value = true
  setTimeout(() => {
    loading.value = false
    if (loginForm.value.username === '187475806@jiyitupu' && loginForm.value.password === '129384757689') {
      ElMessage.success('登录成功')
      router.replace('/businessViews/permission/user')
    } else {
      isSad.value = true
      ElMessage.error('账号或密码错误')
      setTimeout(() => { isSad.value = false }, 2000)
    }
  }, 1000)
}
</script>

<template>
  <div class="login-container h-full w-full flex items-center justify-center">
    <div class="login-box w-[900px] h-[550px] bg-white rounded-[24px] flex shadow-2xl overflow-hidden">
      <!-- 左侧动画区域 -->
      <div class="left-side w-1/2 relative flex items-center justify-center p-[20px]">
        <LoginCharacter 
          :mouseX="mouseX" 
          :mouseY="mouseY" 
          :isLookingAtPassword="passwordVisible" 
          :isSad="isSad" 
          :isLoading="loading"
        />
      </div>

      <!-- 右侧登录表单 -->
      <div class="right-side w-1/2 p-[48px] flex flex-col justify-center bg-white relative">
        <!-- Logo 和标题 -->
        <div class="text-center mb-[32px]">
          <div class="logo-wrapper mb-[16px] flex justify-center">
            <img 
              src="../assets/icons/logo-mian.svg" 
              alt="记忆图谱平台" 
              class="w-[48px] h-[48px] rounded-[12px]"
            />
          </div>
          <h1 class="text-[28px] font-bold text-[#111827]">
            Welcome back!
          </h1>
          <p class="text-[#6B7280] text-[14px] mt-[8px]">Please enter your details</p>
        </div>

        <!-- 登录表单 -->
        <el-form 
          :model="loginForm" 
          class="login-form relative"
          @submit.prevent="handleLogin"
        >
          <div class="mb-[8px] text-[14px] font-medium text-[#374151]">Email</div>
          <!-- 用户名输入框 -->
          <el-form-item class="custom-form-item z-10">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              class="login-input"
            />
          </el-form-item>

          <div class="mb-[8px] text-[14px] font-medium text-[#374151]">Password</div>
          <!-- 密码输入框 -->
          <el-form-item class="custom-form-item_sec z-10">
            <el-input
              v-model="loginForm.password"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="请输入密码"
              size="large"
              class="login-input"
            >
              <template #suffix>
                <el-icon @click="passwordVisible = !passwordVisible" class="cursor-pointer text-[18px] text-[#9CA3AF] hover:text-[#4B5563]">
                  <View v-if="passwordVisible" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="flex justify-between items-center mb-[24px]">
            <el-checkbox class="text-[#6B7280]">Remember for 30 days</el-checkbox>
            <a href="#" class="text-[14px] text-[#D1D5DB] hover:text-[#9CA3AF]">Forgot password?</a>
          </div>

          <!-- 登录按钮 -->
          <el-form-item class="custom-form-item_sub z-10">
            <el-button
              type="primary"
              size="large"
              class="login-button w-full mb-[16px]"
              :loading="loading"
              @click="handleLogin"
            >
              Log In
            </el-button>
          </el-form-item>
          
          <el-button
            size="large"
            class="google-button w-full mb-0"
          >
            <img src="../assets/icons/logo-mian.svg" class="w-[18px] h-[18px] mr-[8px] grayscale" alt="G" />
            Log in with Google
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  background: #F3F4F6;
}

.login-box {
  .left-side {
    background: #F9FAFB;
  }
  .custom-form-item{
    margin-bottom: 24px !important;
  }
  .custom-form-item_sec{
    margin-bottom: 24px !important;
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
    border: 1px solid #D1D5DB;
    box-shadow: none;
    transition: all 0.3s ease;
    background: transparent;
    padding-left: 0;
    padding-right: 0;
    
    // remove the default blue border on hover because these are bottom-border only styles in image (optional, I'm adapting standard input to look sleek)
    box-shadow: none !important;
    border-top: none;
    border-left: none;
    border-right: none;
    border-bottom: 1px solid #D1D5DB;
    border-radius: 0;
    
    &:hover, &.is-focus {
      border-color: #111827;
      box-shadow: none;
    }
  }
  
  :deep(.el-input__inner) {
    height: 40px;
    font-size: 16px;
    font-weight: 500;
  }
}

.login-button {
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 24px;
  background: #111827;
  color: #fff;
  border: none;
  transition: all 0.3s ease;
  &:hover:not(:disabled) {
    background: #374151;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  &:disabled {
    background: #9CA3AF;
  }
}

.google-button {
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 24px;
  background: #F9FAFB;
  color: #374151;
  border: 1px solid #E5E7EB;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #F3F4F6;
    color: #111827;
  }
}

// 响应式设计
@media (max-width: 900px) {
  .login-box {
    width: 90%;
    flex-direction: column;
    height: auto;
    max-height: 90vh;
    overflow-y: auto;
    .left-side {
      width: 100%;
      height: 300px;
    }
    .right-side {
      width: 100%;
      padding: 32px;
    }
  }
}
</style>