// 定义角色类型
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

// 定义角色记录接口
export interface UserRoleRecord {
  id?: string;
  user_id: string;
  role_id: string;
  created_at?: string;
}
