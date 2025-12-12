<script setup lang="ts">
import BreadCrumb from '../BreadCrumb/index.vue'
import collapseIcon from '../../assets/icons/icon-collapse.svg'
import expandIcon from '../../assets/icons/icon-expand.svg'
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['toggleCollapse'])

const toggleCollapse = () => {
  emit('toggleCollapse')
}
</script>

<template>
  <div class="header pl-[16px] pr-[28px]">
    <div class="header-left flex items-center gap-[16px]">
      <div class="collapsed-icon">
        <img
          v-show="!props.isCollapsed"
          class="cursor-pointer h-[20px] w-[20px]"
          :src="collapseIcon"
          alt="collapse"
          @click="toggleCollapse"
        />
        <img
          v-show="props.isCollapsed"
          class="cursor-pointer h-[20px] w-[20px]"
          :src="expandIcon"
          alt="expand"
          @click="toggleCollapse"
        />
      </div>
      <BreadCrumb />
    </div>
  </div>
</template>

<style scoped lang="scss">
.header {
  width: 100%;
  height: 64px;
  border-bottom: 1px solid #E4E7ED;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
