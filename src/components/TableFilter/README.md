# TableFilter 组件

一个通用的表格筛选器组件，支持多种筛选类型，可根据配置动态渲染。

## 功能特性

- 🎯 **动态配置**：通过 `filterOptions` 配置筛选器类型和选项
- 🔄 **多种类型**：支持单选、多选、输入框、日期范围等筛选类型
- 📱 **响应式布局**：自动适配不同屏幕尺寸
- 🧹 **数据清理**：自动过滤空值，只传递有效的筛选条件
- 🔄 **重置功能**：支持一键重置所有筛选条件

## 支持的筛选类型

| 类型 | 说明 | 初始值 |
|------|------|--------|
| `select` | 单选下拉框 | `''` |
| `multiple-select` | 多选下拉框 | `[]` |
| `input` | 文本输入框 | `''` |
| `date-range` | 日期范围选择器 | `undefined` |

## Props

### filterOptions

筛选选项配置数组，每个选项包含以下属性：

### modelValue (v-model)

支持v-model双向绑定，用于外部控制表单数据：

```vue
<TableFilter 
  v-model="filterData"
  :filter-options="filterOptions"
  @filter="handleFilter"
/>
```

```typescript
interface FilterOption {
  label: string        // 显示标签
  value: string        // 字段名（用于formData的key）
  type: 'select' | 'multiple-select' | 'input' | 'date-range'  // 筛选类型
  options?: {          // 选项列表（select和multiple-select类型需要）
    label: string
    value: string
    tagType?: 'primary' | 'success' | 'info' | 'warning' | 'danger' | ''  // 标签样式类型（仅multiple-select有效）
  }[]
}
```

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `filter` | `filterData: Record<string, any>` | 点击筛选按钮时触发，返回筛选数据 |
| `close` | - | 点击取消按钮时触发 |
| `update:modelValue` | `value: Record<string, any>` | v-model更新事件 |

## 使用示例

### 基础用法

```vue
<template>
  <el-dialog v-model="showFilter" title="筛选条件" width="800px">
    <TableFilter 
      v-model="filterData"
      :filter-options="filterOptions"
      @filter="handleFilter"
      @close="showFilter = false"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import TableFilter from '@/components/TableFilter/index.vue'

// 筛选数据，支持外部控制
const filterData = ref<Record<string, any>>({
  status: '',
  username: '',
  roles: [],
  permissions: [],
  createTime: undefined
})

const filterOptions = ref([
  {
    label: '状态',
    value: 'status',
    type: 'select',
    options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]
  },
  {
    label: '用户名',
    value: 'username',
    type: 'input'
  },
  {
    label: '角色',
    value: 'roles',
    type: 'multiple-select',
    options: [
      { label: '管理员', value: 'admin', tagType: 'primary' },
      { label: '用户', value: 'user', tagType: 'success' },
      { label: '访客', value: 'guest', tagType: 'info' }
    ]
  },
  {
    label: '权限',
    value: 'permissions',
    type: 'multiple-select',
    options: [
      { label: '读取', value: 'read', tagType: 'success' },
      { label: '写入', value: 'write', tagType: 'warning' },
      { label: '删除', value: 'delete', tagType: 'danger' }
    ]
  },
  {
    label: '创建时间',
    value: 'createTime',
    type: 'date-range'
  }
])

const handleFilter = (filterData: Record<string, any>) => {
  console.log('筛选数据:', filterData)
  // 调用API进行数据筛选
  // await fetchData(filterData)
}
</script>
```

### 筛选数据结构

根据不同的筛选类型，返回的数据结构如下：

```typescript
// 示例筛选数据
{
  status: 'active',                    // select类型：字符串
  username: 'john',                    // input类型：字符串
  roles: ['admin', 'user'],           // multiple-select类型：字符串数组
  createTime: ['2024-01-01', '2024-12-31']  // date-range类型：字符串数组
}
```

## 注意事项

1. **选项配置**：`select` 和 `multiple-select` 类型必须提供 `options` 数组
2. **字段名唯一性**：每个筛选选项的 `value` 必须唯一
3. **空值过滤**：组件会自动过滤掉空值，只传递有效的筛选条件
4. **响应式更新**：当 `filterOptions` 发生变化时，组件会自动重新生成表单数据结构
5. **标签样式**：`tagType` 属性在 `options` 数组的每个选项中设置，仅对 `multiple-select` 类型有效，支持 `primary`、`success`、`info`、`warning`、`danger` 五种样式

## 样式定制

组件使用 Element Plus 的样式系统，可以通过以下方式定制样式：

```scss
// 自定义筛选器样式
.search-form {
  .filter-form {
    // 自定义表单项样式
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
    
    // 自定义标签样式
    :deep(.el-form-item__label) {
      font-size: 14px;
      color: #606266;
    }
  }
}
``` 