// 定义用户数据接口
export interface UserItem {
  id: string
  account: string
  userName: string
  role: string
  password: string
  createTime?: string
  updateTime?: string
}

// 搜索数据
export interface UserFilterData {
  keyword?: string
  createTimeRage: [string, string] | undefined
  updateTimeRage: [string, string] | undefined
}

// 获取用户列表参数
export interface UserListParams {
  page: number
  pageSize: number
  account?: string
  createTime?: string
  updateTime?: string
}
// 获取用户列表结果
export interface UserListResult {
  data: UserItem[]
  total: number
}
// 响应数据
export interface UserListResponse {
  data:UserItem[],
  total:number,
  page:number,
  size:number,
}
// 编辑数据
export interface EditUserItem {
  id?: string
  createTime?: string
  updateTime?: string
  account: string
  userName: string
  password: string
  role: string
}


// 设置角色tag颜色
export type RoleTagColor = 'primary' | 'success' | 'warning' | 'info' | 'danger'

// 角色列表数据
export interface RoleItem {
  id: string
  roleName: string
  roleCode: string
  description: string
  createTime: string
}
// 角色列表结果
export interface RoleListResult {
  data: RoleItem[]
  message?: string
}

// 编辑下的角色
export interface EditRoleItem {
  id?: string
  roleName: string
  roleCode?: string
  description: string
  createTime?: string
}
// 权限树节点接口
export interface PermissionNode {
  id: string
  label: string
  key: string
  parentId: string
  children?: PermissionNode[]
}
// 权限点
export interface EditPermissionItem {
  id:string
  label:string
  key:string
  parentId:string
}
// 权限点列表结果
export interface PermissionListResult {
  data: PermissionNode[]
  message?: string
}