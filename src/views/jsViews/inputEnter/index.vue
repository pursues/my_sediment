<template>
  <div class="input-enter">
    <inputEnter />
    <img src="./inputEnter.png" alt="">
  </div>
</template>

<script setup lang="ts">
import inputEnter from './input.vue'
</script>
<style scoped>
.input-enter {
  width: 100%;
  height: 100%;
  background-color: #141414;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
</style>