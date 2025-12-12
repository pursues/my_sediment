<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { version } from '../package.json'
// import {getToken} from './utils/api'

onMounted(() => {
  console.info(`✨ appVersion:V${version}`)
  console.log(import.meta.env.MODE)
  console.log(import.meta.env.VITE__APP_BASE_UEL)
  // getToken({}).then(res => {
  //   console.log(res)
  // })
})
</script>

<template>
  <RouterView />
</template>

<style scoped>
</style>
