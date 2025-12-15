import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, DocumentItem } from '@/types/document'
import { uploadDocument } from '@/api'
import { useUploadStore } from '@/store/uploadData'

// 允许上传的文件类型
export const allowedExtensions = ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx']

//存在 store 中的 文件夹 Id，目的是为了在上传中区分存储文件
const kbId = ref('kbId')

// 定义回调函数接口
interface FileUploadCallbacks {
  updateDataList: () => void // 更新列表数据
  addItemsToTable: (items: DocumentItem[]) => void // 添加上传文件到表格
  removeItemFromTable: (id: string) => void // 删除表格中的文件
  updateItemById: (id: string, updates: Partial<DocumentItem>) => void // 更新表格中的文件
  custTomeEvent: (event: string) => void // 自定义事件
}

// 获取当前时间，格式为YYYY-MM-DD HH:mm:ss
export function getCurrentTime() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19)
}
// 随机生成文件id
export const createFileHash = () => {
  if (window.crypto?.randomUUID != null) {
    return crypto.randomUUID(); // 现代浏览器首选方案
  }
  
  // 后备方案：时间戳 + 高强度随机数（兼容旧浏览器）
  const timestamp = Date.now().toString(36);
  const randomBuf = new Uint8Array(6);
  crypto.getRandomValues(randomBuf);
  const randomStr = Array.from(randomBuf, (n) => n.toString(36)).join('');
  return `${timestamp}-${randomStr}`;

};


export default function useFileUpload(callbacks: FileUploadCallbacks) {

  const uploadStore = useUploadStore()

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  // 上传相关
  const uploadFileRef = ref<HTMLInputElement | null>(null)
  
  // 最大并发上传数
  const MAX_CONCURRENT_UPLOADS = 10

  // 上传队列
  const uploadQueue = ref<UploadFile[]>([])

  // 正在上传的文件
  const activeUploads = ref<Set<string>>(new Set())


  // 初始化上传文件列表
  const initialFileList = (selectedFiles: File[]) => {
    const uploadFiles = selectedFiles.map((file) => ({
      file,
      name: file.name,
      type: file.name.split('.')[file.name.split('.').length - 1] as (typeof allowedExtensions)[number],
      size: String(file.size),
      status: 'waiting' as const,
      createdAt: getCurrentTime(),
      id: createFileHash(),
      creator: userInfo.userName || '眸子的色彩',// 当前登录人，****************联调之后，需要传入当前登录人**************//
      uploadController: new AbortController()
    }))
    return uploadFiles
  }

  // 检查文件类型和大小
  const checkFiles = (uploadFiles: UploadFile[]): Ref<{ validFiles: UploadFile[]; invalidFilesTypeMessage: string; invalidFilesSizeMessage: string }> => {
    const invalidFilesType: string[] = uploadFiles.filter((fileItem) => {
      return !allowedExtensions.includes(fileItem.type!)
    }).map((fileItem) => fileItem.name)
    
    const invalidFilesSize: string[] = uploadFiles
      .filter((fileItem) => allowedExtensions.includes(fileItem.file.type))
      .filter((fileItem) => fileItem.file.size > 20 * 1024 * 1024)
      .map((fileItem) => fileItem.name)

    const validFiles = uploadFiles.filter((fileItem) =>{
      return  !invalidFilesType.includes(fileItem.name) 
        && !invalidFilesSize.includes(fileItem.name)
    })

    const invalidFilesTypeMessage = invalidFilesType.length ? invalidFilesType.join('、') : ''
    const invalidFilesSizeMessage = invalidFilesSize.length ? invalidFilesSize.join('、') : ''
    return ref({ validFiles, invalidFilesTypeMessage, invalidFilesSizeMessage })
  }



   
  // 上传文档
  const handleFileSelect = (event: Event) => {

    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    const initialFiles = initialFileList([...event.target.files ?? []])
    const checkResult =  checkFiles(initialFiles)
    // 判断是否存在无效文件类型 ,目前没限制大小，默认20M
    if (checkResult.value.invalidFilesTypeMessage ) {
      ElMessage.error(`${checkResult.value.invalidFilesTypeMessage}文件类型不支持`)
      return
    }
    // 重置文件
    resetFile()

    // 将上传文件添加到上传队列中
    uploadQueue.value = checkResult.value.validFiles

    // 将上传文件添加到表格数据开头
    callbacks.addItemsToTable(checkResult.value.validFiles as DocumentItem[]);

    processQueue()

  }
  
  // 处理上传队列
  const processQueue = async () => {
    // 获取 store 中已存在的文件
    const existingStoreFiles = uploadStore.getFilesByKbId(kbId.value) || []

    const newStoreItems: DocumentItem[] = []

    // 如果上传队列中的文件数量小于最大并发上传数，则继续上传
    while (activeUploads.value.size < MAX_CONCURRENT_UPLOADS && uploadQueue.value.length > 0) {
      // 拿到上传队列中的第一个文件，并从上传队列中移除此文件
      const task = uploadQueue.value.shift()!
      // 将文件添加到正在上传的文件集合中
      activeUploads.value.add(task.id)

      // 更新状态为上传中
      task.status = 'uploading'
      // 传回上级，更新表格数据
      callbacks.updateItemById(task.id, {status:'uploading'})


      //找到当前文件夹
      const existingFile = existingStoreFiles.find(f => f.id === task.id)
      if (existingFile) {
          // 如果文件已存在，更新状态为上传中
          uploadStore.updateFile(kbId.value, task.id, { status: 'uploading' })
            // 确保 file 对象存在, 理论上 retry 时 task.file 应该是有值的
      } else {
            // 如果是新文件，准备添加到 store
          newStoreItems.push({
              id: task.id,
              name: task.name,
              size: task.size,
              status: task.status,
              createdAt: task.createdAt,
              type: task.type,
              creator: task.creator,
              // @ts-ignore 将 file 对象存入 store (Runtime only)，用于重试
              file: task.file 
          } as DocumentItem)
      }
      // 批量添加新文件到 store
      if (newStoreItems.length > 0) {
          uploadStore.addFiles(kbId.value, newStoreItems)
      }



      // 每个任务独立处理，完成后自动触发后续任务
      handleUpload(task).finally(() => {

        // 单个任务完成后立即触发队列检查
        processQueue()
        
        // 检查是否所有上传任务都已完成，已完成则可以更新列表数据
        if(uploadQueue.value.length === 0 && activeUploads.value.size === 0){
          // ElMessage.success('文档全部上传完成，刷新mock数据')

          callbacks.updateDataList();
        }
      })
    }

  }
  // 上传文件
  const handleUpload = async (task: UploadFile) => {
    try{

      const { data, message } = await uploadDocument(task.file!,task.uploadController)
      // console.log(res)

      // const { failed_uploads, successful_uploads, files_map } = res.data.data;

      //修改状态
      const newStatus = data.status  //? 'parsing' : 'failed';
      callbacks.updateItemById(task.id, {status:newStatus});
      // 更新 store 中的状态
      uploadStore.updateFile(kbId.value, task.id, { status: newStatus })

      // 成功的话，将初始前端设置的文件id改为上传成功后正式的文件ID
      if(data.id){
        //从正在上传的文件集合中移除当前文件
        activeUploads.value.delete(task.id)
        // 传回上级，更新表格数据
        callbacks.updateItemById(task.id, { id: data.id });
        // 更新 store 中的 id 
        uploadStore.updateFile(kbId.value, task.id, { id: data.id })
      }else {
        // 如果上传失败，则提示失败原因
        ElMessage.error(message)
      }
    } catch(error){
      // ElMessage.error('上传接口未联调')
      // 将状态改为上传失败
      callbacks.updateItemById(task.id, {status:'failed'})
      // 更新 store 中的状态
      uploadStore.updateFile(kbId.value, task.id, { status: 'failed' })
    }
  }

  // 检查当前文件夹是否所有上传任务都完成
  const checkUploadCompletion = () => {
    // 如果上传队列中的文件数量小于最大并发上传数，则继续上传
    if (uploadQueue.value.length === 0) {
      // 更新列表数据
      callbacks.updateDataList()
    }
  }
  
  // 重置文件
  const resetFile = () => {
    if(uploadFileRef.value){
      uploadFileRef.value.value = ''
    }
  }
  // 取消上传 ，说明是当前区间内的上传，所以用UploadFile类型
  const handleCancelUpload = (fileItem: UploadFile) => {
    // 从队列中移除当前文件夹的任务
    uploadQueue.value = uploadQueue.value.filter(task => 
      !(task.id === fileItem.id)
    )
    // 取消正在上传的任务
    if (activeUploads.value.has(fileItem.id)) {
      fileItem.uploadController?.abort()
      activeUploads.value.delete(fileItem.id)
    }
    // 取消之后还需要将文件从表格数据中移除
    callbacks.removeItemFromTable(fileItem.id)
    // 从 store 中移除文件
    uploadStore.removeFiles(kbId.value, [fileItem.id])
  }
  // 重新上传文档,说明是当前区间内的上传，所以用UploadFile类型
  const handleRetry = (fileItem: UploadFile) => {
    const retryTask:UploadFile = {
      ...fileItem,
      status: 'waiting',
    }
    uploadQueue.value.push(retryTask)
    processQueue()
  }


  return {
    uploadFileRef,
    MAX_CONCURRENT_UPLOADS,
    uploadQueue,
    activeUploads,
    handleFileSelect,
    processQueue,
    handleUpload,
    checkUploadCompletion,
    resetFile,
    handleCancelUpload,
    handleRetry,
  }

}
