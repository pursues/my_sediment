<template>
  <div class="document-view">
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 左侧按钮组 -->
      <div class="toolbar-left">
        <div
          class="custom-btn cursor-pointer rounded-[6px] bg-[#1677FF] text-center h-[32px] p-0 text-[14px]"
        >
          <input
            type="file"
            id="upload-btn"
            name="upload-btn"
            ref="uploadFileRef"
            :accept="allowedExtensions.map(item => `.${item}`).join(',')"
            multiple
            hidden
            @input="handleFileSelect"
          />
          <label
            for="upload-btn"
            class="upload-btn cursor-pointer text-[#ffffff] custom-btn block flex items-center h-full px-[15px] py-[5px]"
          >
            <el-icon><Upload /></el-icon>
            <span class="h-[22px] font-family-[PingFangSC-Regular] ml-[8px]">上传文档</span>
          </label>
        </div>
      </div>
      <!-- 右侧搜索区域 -->
      <div class="toolbar-right">
      </div>
    </div>
    <!-- 表格 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        class="template-table"
        height="100%"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="fileName" label="文件名称" min-width="200">
          <template #default="scope">
            <div class="file-info">
              <img :src="getFileIcon(scope.row.fileName)" alt="word" class="file-icon" />
              <div class="file-details">
                <div class="file-name">{{ scope.row.fileName }}</div>
                <div class="file-size">{{ scope.row.fileSize }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              size="small"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="creator" label="上传者" width="150" />
        
        <el-table-column prop="uploadTime" label="上传时间" width="200" />

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'failed'"
              link
              type="primary"
              @click="handleRetry(scope.row)"
            >
              重新上传
            </el-button>
            <el-button
              v-if="scope.row.status === 'uploading' || scope.row.status === 'waiting'"
              link
              type="primary"
              @click="handleCancelUpload(scope.row)"
            >
              取消上传
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-container">
              <img src="@/assets/icons/no-data.svg" alt="no-data" />
              <div class="empty-content">
                <span>暂无文档，请</span>
                <div
                  class="custom-btn cursor-pointer"
                >
                  <input
                    type="file"
                    id="upload-btn"
                    name="upload-btn"
                    ref="uploadFileRef"
                    :accept="allowedExtensions.map(item => `.${item}`).join(',')"
                    multiple
                    hidden
                    @input="handleFileSelect"
                  />
                  <label
                    for="upload-btn"
                    class="cursor-pointer block no-data-upload"
                  >上传文档
                  </label>
                </div>
              </div>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ComponentSize } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { getStatusType, getStatusText } from '@/store/document'
import wordIcon from '@/assets/icons/word.svg'
import pdfIcon from '@/assets/icons/pdf.svg'
import pptIcon from '@/assets/icons/ppt.svg'
import xlsxIcon from '@/assets/icons/xlsx.svg'
import useFileUpload,{ allowedExtensions } from './useFileUpload'


export type DocumentStatus = 'waiting' | 'uploading' | 'failed'| 'editing' | 'parsing' | 'success'  | 'parse_failed'

export interface DocumentItem {
  id: string
  fileName: string
  fileSize: string
  fileType?: string
  status: DocumentStatus
  creator: string
  uploadTime: string

}

// 上传文档相关更改表格数据

const {
  uploadFileRef,//上传文件的ref
  handleFileSelect,//选择文件
  handleCancelUpload,//取消上传
  handleRetry,//重新上传
} = useFileUpload({
  // 更新列表数据
  updateDataList: () => {
    // 上传全部走完，刷新列表数据
    loadData()
  },
  // 添加上传文件到表格
  addItemsToTable: (items: DocumentItem[]) => {
    tableData.value = [...items, ...tableData.value]
    total.value = tableData.value.length
  },
  // 删除表格中的文件
  removeItemFromTable: (id: string) => {
    tableData.value = tableData.value.filter(item => item.id !== id)
  },
  // 更新表格中的文件
  updateItemById: (id: string, updates: Partial<DocumentItem>) => {
    const item = tableData.value.find(item => item.id === id)
    if (item) {
      Object.assign(item, updates)
    }
  },
  // 自定义扩展
  custTomeEvent: (event: string) => {
    console.log(event)
  }
})


// 响应式数据
const loading = ref(false)

// 表格数据
const tableData = ref<DocumentItem[]>([])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const gotoPage = ref(1)
const size = ref<ComponentSize>('default')


// 模拟数据
const mockData: DocumentItem[] = [
  {
    id: '1',
    fileName: '白水系统作业指导书.doc',
    fileSize: '32.2MB',
    status: 'success',
    creator: '徐之琪',
    uploadTime: '2025-07-13 12:00:00'
  },
  {
    id: '2',
    fileName: '白水系统作业指导书.doc',
    fileSize: '32.2MB',
    status: 'editing',
    creator: '雨奇',
    uploadTime: '2025-07-11 16:12:00'
  },
  {
    id: '3',
    fileName: 'html渲染作业指导书.xlsx',
    fileSize: '32.2MB',
    status: 'success',
    creator: '简泽浩',
    uploadTime: '2025-07-12 12:00:00'
  },
  {
    id: '4',
    fileName: '白水系统作业指导书.doc',
    fileSize: '32.2MB',
    status: 'parsing',
    creator: '简泽浩',
    uploadTime: '2025-07-12 12:00:00'
  },
  {
    id: '5',
    fileName: '白水系统作业指导书.doc',
    fileSize: '32.2MB',
    status: 'failed',
    creator: '雨奇',
    uploadTime: '2025-07-11 16:12:00'
  },
  {
    id: '6',
    fileName: '白水系统作业指导书.pptx',
    fileSize: '32.2MB',
    status: 'success',
    creator: '简泽浩',
    uploadTime: '2025-07-12 12:00:00'
  },
  {
    id: '7',
    fileName: '白水系统作业指导书.doc',
    fileSize: '32.2MB',
    status: 'parse_failed',
    creator: '简泽浩',
    uploadTime: '2025-07-12 12:00:00'
  },
  {
    id: '8',
    fileName: '技术规范文档V2.0.pdf',
    fileSize: '28.5MB',
    status: 'success',
    creator: '徐之琪',
    uploadTime: '2025-07-10 09:30:00'
  },
  {
    id: '10',
    fileName: '系统架构设计图.pdf',
    fileSize: '45.2MB',
    status: 'parsing',
    creator: '简泽浩',
    uploadTime: '2025-07-08 16:45:00'
  },
]


// 设置文件图标
const getFileIcon = (fileName: string) => {

  switch(fileName.split('.').pop()?.toLowerCase()){
    case 'pdf':
      return pdfIcon
    case 'ppt':
    case 'pptx':
      return pptIcon
    case 'xls':
    case 'xlsx':
      return xlsxIcon
    case 'doc':
    case 'docx':
      return wordIcon
    default:
  }
}




// 分页功能
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadData()
}

// 监听跳转页数变化
watch(gotoPage, (newVal) => {
  if (newVal && newVal !== currentPage.value) {
    currentPage.value = newVal
    loadData()
  }
})

// 数据加载
const loadData = async () => {

  // 应用筛选条件
  let filteredData = [...mockData]
  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  tableData.value = filteredData.slice(start, end)
  total.value = filteredData.length
  
}

// 组件挂载
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.document-view {
  background-color: #fff;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  .toolbar {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    background: white;
    border-radius: 8px;

    .toolbar-left {
      display: flex;
      gap: 8px;
      .el-button{
        margin-left: 0;
      }
    }

    .toolbar-right {
      width: 280px;
    }
  }

  .table-container {
    flex: 1;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .file-icon {
        font-size: 20px;
        color: #1890ff;
      }

      .file-details {
        .file-name {
          font-weight: 500;
          color: #262626;
          margin-bottom: 4px;
        }

        .file-size {
          font-size: 12px;
          color: #8c8c8c;
        }
      }
    }
    .empty-container{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      .empty-content{
        display: flex;
        align-items: center;
        justify-content: center;
        height: 44px;
        font-size: 14px;
        .no-data-upload{
          color: #1677FF;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: right;
    margin-top: 16px;
  }
}

:deep(.el-table__inner-wrapper:before){
  display: none;
}
:deep(.el-message-box__content){
  padding: 16px 16px 30px 16px;
}
</style>
