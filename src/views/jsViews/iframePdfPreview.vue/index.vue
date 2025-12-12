<template>
  <div class="pdf-preview">
    <PdfPreview :pdf-url="pdfUrl" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PdfPreview from './IframePdfPreview.vue'

// 文件url
const pdfUrl = ref('/invoice.pdf')


  
</script>

<style scoped lang="scss">
.pdf-preview {
  width: 100%;
  height: 100%;
}
</style>