<template>
  <Transition name="drawer">
    <div v-if="visible" class="container-drawer" :style="{ width: drawerWidth }">
      <!-- 抽屉内容 -->
      <div class="drawer-content">
        <!-- 头部内容 -->
        <div class="drawer-header p-[20px_20px_0_20px]">
          <slot name="header" v-if="$slots.header"></slot>
          <div class="drawer-title" v-else>
            <slot name="title">{{ title }}</slot>
          </div>
          <button class="drawer-close" @click="handleClose" v-if="showClose">
            <ElIcon :size="16" color="#909399"><Close /></ElIcon>
          </button>
        </div>

        <!-- 主体内容 -->
        <div class="drawer-body">
          <slot></slot>
        </div>

        <!-- 底部 -->
        <div v-if="$slots.footer" class="drawer-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  title?: string
  width?: string
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '600px',
  showClose: true
})

const emits = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const drawerWidth = computed(() => props.width)

const handleClose = () => {
  emits('update:visible', false)
  emits('close')
}
</script>

<style scoped lang="scss">
.container-drawer {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  z-index: 1000;
  display: flex;
}

.drawer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.drawer-content {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.drawer-header {
  width: 100%;
  display: flex;
  align-items: start;
  justify-content: space-between;
}

.drawer-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;
  color: #303133;
}

.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin: 1px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f7fa;
    color: #606266;
  }
}

.drawer-body {
  flex: 1;
  padding: 0 20px 20px;
  overflow-y: auto;
}

.drawer-footer {
  padding: 0 20px 20px;
}

// 动画效果
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from {
  transform: translateX(100%);

  .drawer-overlay {
    opacity: 0;
  }
}

.drawer-leave-to {
  transform: translateX(100%);

  .drawer-overlay {
    opacity: 0;
  }
}
</style>
