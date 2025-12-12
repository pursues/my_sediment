import request,{type ApiResponse } from '@/utils/net'
import type { 
  UserListParams, 
  UserListResponse, 
  UserListResult,
  RoleListResult,
  UserItem,
  EditUserItem,
  RoleItem,
  EditRoleItem,
  EditPermissionItem,
  PermissionListResult
} from '@/types/permission'




// 获取用户列表数据
export const getUserList = async (params: UserListParams): Promise<UserListResult> => {
  const response = await request<ApiResponse<UserListResponse>>({
    url: '/user/list',
    method: 'POST',
    params
  })
  // 提取实际需要的数据，只返回data和total
  const result = response.data.data
  return {
    data: result.data,
    total: result.total
  }
}
// 批量删除用户
export const batchDeleteUser = async (params: string[]): Promise<{data:boolean,message:string}> => {
  return request({
    url: '/user/batchDelete',
    method: 'POST',
    params
  })
}
// 修改用户
export const updateUser = async (params: UserItem): Promise<{data:boolean,message:string}> => {
  return request({
    url: '/user/update',
    method: 'POST',
    params
  })
}
// 添加用户
export const addUser = async (params: EditUserItem): Promise<{data:boolean,message:string}> => {
  return request({
    url: '/user/add',
    method: 'POST',
    params
  })
}

// 获取角色数据
export const getRoleData = async (): Promise<RoleListResult> => {
  const response = await request<ApiResponse<RoleListResult>>({
    url: '/role/list',
    method: 'get'
  })
  return response.data.data
}
// 添加角色
export const addRole = async (params: EditRoleItem): Promise<{data:boolean,message:string}> => {
  return request({
    url: '/role/add',
    method: 'POST',
    params
  })
}
// 修改角色
export const updateRole = async (params: RoleItem): Promise<{data:boolean,message:string}> => {
  return request({
    url: '/role/update',
    method: 'POST',
    params
  })
}
// 删除角色
export const deleteRole = async (id: string): Promise<{data:boolean,message:string}> => {
  return request({
    url: `/role/delete/${id}`,
    method: 'GET',
  })
}
// 获取权限点数据
export const getPermissionData = async (): Promise<PermissionListResult> => {
  const response = await request<ApiResponse<PermissionListResult>>({
    url: '/permission/list',
    method: 'get'
  })
  return response.data.data
}
// 权限点数据增加
export const addPermission = async (params: EditPermissionItem): Promise<{data:boolean,message:string}> => {
  return request({
    url: '/permission/add',
    method: 'POST',
    params
  })
}

// 保存用户权限
export const saveUserPermission = async (params: {roleId:string,permissionIds:string[]}): Promise<{data:boolean,message:string}> => {
  return request({
    url: '/permission/saveUserPermission',
    method: 'POST',
    params
  })
}