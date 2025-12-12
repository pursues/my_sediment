<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const route = useRoute()
const menu = [
  {
    name: '模版列表',
    path: '/template-list',
    icon: 'menu-template',
    activeIcon: 'menu-template-active'
  },
  {
    name: '记忆抽取',
    path: '/memory-extract',
    icon: 'menu-extract',
    activeIcon: 'menu-extract-active'
  },
  {
    name: '文档列表',
    path: '/document-list',
    icon: 'menu-doc',
    activeIcon: 'menu-doc-active'
  },
  {
    name: '记忆图谱',
    path: '/memory-graph',
    icon: 'menu-mem',
    activeIcon: 'menu-mem-active'
  },
  {
    name: '权限管理',
    path: '/permission-management',
    icon: 'menu-permission',
    activeIcon: 'menu-permission-active'
  }
]

const activeMenuIndex = computed(() => {
  return menu.findIndex((item) => item.path === route.path)
})

const handleMenuClick = (item: any) => {
  if (item.path === route.path) return
  router.push(item.path)
}

const getImageUrl = () => {
  return new URL(`../../assets/icons/menu-extract.svg`, import.meta.url).href
}
</script>

<template>
  <div class="aside p-[16px]" :class="{ 'aside-collapsed': props.isCollapsed }">
    <div class="aside-menu w-full" :class="{ 'aside-menu-collapsed': props.isCollapsed }">
      <div
        class="aside-menu-item flex items-center cursor-pointer w-full h-[44px] mb-[8px] rounded-[8px] px-[8px] overflow-hidden"
        :class="{
          'aside-menu-item-collapsed': props.isCollapsed,
          active: route.path.includes(item.path)
        }"
        v-for="(item) in userStore.leftNavRouterList"
        :key="item.path"
        @click="handleMenuClick(item)"
      >
        <img
          class="aside-menu-item-icon w-[24px] h-[24px]"
          :src="getImageUrl()"
          alt="icon"
        />
        <div
          class="aside-menu-item-name text-[#BEBFC8] whitespace-nowrap pl-[8px]"
          :class="{ 'aside-menu-item-name-collapsed': props.isCollapsed }"
        >
          {{ item.meta?.breadcrumbName || item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.aside {
  width: 200px;
  height: 100%;
  // border-right: 1px solid #ebeef5;
  transition: all 0.2s ease;

  .aside-menu-item {
    &:hover {
      // background: #f2f2f2;
      background: linear-gradient(90deg, rgba(80,138,247) 0%, rgb(30,101,246) 100%);
      .aside-menu-item-name {
        color: #ffffff;
      }
    }
    &.active {
      background: linear-gradient(90deg, rgba(80,138,247) 0%, rgb(30,101,246) 100%);
      // background-color: #e6f4ff;
      .aside-menu-item-name {
        color: #ffffff;
        // color: var(--hc-primary);
      }
    }
  }

  &.aside-collapsed {
    width: 70px;
    padding: 16px 12px;
    .aside-header-collapsed {
      padding-left: 6px;
      // justify-content: center;
      .aside-header-name-collapsed {
        width: 0;
        display: none;
        transition: all 0.2s ease;
      }
    }
    .aside-menu-collapsed {
      .aside-menu-item-collapsed {
        width: 44px;
        transition: width 0.2s ease;
        padding-left: 10px;
        // justify-content: center;
        .aside-menu-item-name-collapsed {
          width: 0;
          display: none;
          transition: all 0.2s ease;
        }
      }
    }
  }
}
</style>
