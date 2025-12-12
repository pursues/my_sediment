
// 筛选选项类型定义
export interface FilterOption {
  label: string
  value: string
  type: 'select' | 'multiple-select' | 'input' | 'date-range'
  options?: {
    label: string
    value: string
    tagType?: 'primary' | 'success' | 'info' | 'warning' | 'danger' | ''
  }[]
}