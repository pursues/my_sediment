import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DocumentItem } from '@/types/document'

export const useUploadStore = defineStore('uploadData', () => {
  // 存储所有上传中的文件，key 为 kbId，value 为该知识库下的文件列表
  // 或者直接存储所有文件，带有 kbId 属性？
  // 为了方便管理，我们可以用 Map<kbId, DocumentItem[]> 或者直接一个扁平数组
  // 这里使用 Map<kbId, DocumentItem[]> 结构，方便按 kbId 获取
  const uploadingFilesMap = ref<Map<string, DocumentItem[]>>(new Map())

  // 获取指定 kbId 的上传文件
  const getFilesByKbId = (kbId: string) => {
    return uploadingFilesMap.value.get(kbId) || []
  }

  // 添加文件
  const addFiles = (kbId: string, files: DocumentItem[]) => {
    const currentFiles = uploadingFilesMap.value.get(kbId) || []
    // 去重逻辑：如果 id 相同，保留新的（或者旧的？通常是新的）
    // 这里简单直接合并，因为 id 是随机生成的
    // 但为了防止重复添加，可以使用 Map
    const fileMap = new Map(currentFiles.map(f => [f.id, f]))
    files.forEach(f => fileMap.set(f.id, f))
    
    uploadingFilesMap.value.set(kbId, Array.from(fileMap.values()))
  }

  // 更新文件状态
  const updateFile = (kbId: string, fileId: string, updates: Partial<DocumentItem>) => {
    const files = uploadingFilesMap.value.get(kbId)
    if (files) {
      const file = files.find(f => f.id === fileId)
      if (file) {
        Object.assign(file, updates)
      }
    }
  }

  // 移除文件
  const removeFiles = (kbId: string, fileIds: string[]) => {
    const files = uploadingFilesMap.value.get(kbId)
    if (files) {
      const newFiles = files.filter(f => !fileIds.includes(f.id))
      if (newFiles.length > 0) {
        uploadingFilesMap.value.set(kbId, newFiles)
      } else {
        uploadingFilesMap.value.delete(kbId)
      }
    }
  }

  // 清空指定 kbId 的所有文件
  const clearFiles = (kbId: string) => {
    uploadingFilesMap.value.delete(kbId)
  }

  return {
    uploadingFilesMap,
    getFilesByKbId,
    addFiles,
    updateFile,
    removeFiles,
    clearFiles
  }
})
