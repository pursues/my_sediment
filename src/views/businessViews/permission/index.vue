<template>
    <div class="permission-management h-full w-full flex">
        <div class="top">
            <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick">
                <el-tab-pane label="用户管理" name="user"></el-tab-pane>
                <el-tab-pane label="角色管理" name="role"></el-tab-pane>
            </el-tabs>
        </div>
        <div class="content">
            <!-- 左右切换的组件需要缓存 -->
            <RouterView v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </RouterView>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeName = ref('user')

// 监听路由变化，同步更新activeName
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes('/permission-management/role')) {
      activeName.value = 'role'
    } else if (newPath.includes('/permission-management/user')) {
      activeName.value = 'user'
    }
  },
  { immediate: true }
)

const handleClick = (tab: any) => {
    router.push({
        path: `/businessViews/permission/${tab.props.name}`
    })
}
</script>
<style scoped lang="scss">
.permission-management {
    display: flex;
    flex-direction: column;
    .top {
        height: 43px;
        .tabs{
            :deep(.el-tabs__nav-scroll){
                
                .el-tabs__item{
                    width: 112px;
                    padding: 0;
                    font-weight: 600;
                    font-size: 18px;
                }
                // border-bottom: 1px solid #E8EEF5;
            }
        }
    }
    .content {
        flex: 1;
        overflow: auto;
    }   
}
</style>
  