<template>
  <div class="nav-index">
    <div class="nav">
      <el-menu
        :default-active="userStore.navActive"
        class="el-menu-demo"
        mode="horizontal"
        text-color="#fff"
        background-color="rgb(15, 20, 53)"
        active-text-color="#1677FF"
        @select="handleSelect"
      >
        <el-menu-item 
          v-for="item in userStore.routerList" 
          :key="item.path" 
          :index="item.path" 
          class="text-[16px]"
          >{{ item.name }}
        </el-menu-item>
      </el-menu>
    </div>

    <div class="nav-user">
      <div class="header-right-item flex items-center gap-[8px] cursor-pointer">
        <img
          class="h-[32px] w-[32px] rounded-[50%]"
          src="../../assets/icons/icon-user.svg"
          alt="user"
        />
        <span class="text-[14px] font-medium text-[#fff]">眸子的色彩</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()


const handleSelect = (key: string) => {
  userStore.setLeftNavRouterList(key)
}
</script>

<style scoped lang="scss">
.nav-index {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  .nav {
    flex: 1;
  }
  .nav-user {
    width: 150px;
    height: 100%;
    border-bottom: 1px solid #E4E7ED;
    display: flex;
    align-items: center;
    background-color: rgb(15, 20, 53);
    
  }
}
</style>