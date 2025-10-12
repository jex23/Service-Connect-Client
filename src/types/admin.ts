// Admin Types
export interface Admin {
  admin_id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'superadmin';
  address?: string;
  date_created: string;
  date_modified: string;
  last_login?: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  message: string;
  admin: Admin;
}

export interface AdminRegisterData {
  full_name: string;
  email: string;
  password: string;
  role?: 'admin' | 'superadmin';
  address?: string;
}

export interface AdminRegisterResponse {
  message: string;
  admin: Admin;
}

export interface AdminProfileResponse {
  admin_id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'superadmin';
  address?: string;
  date_created: string;
  date_modified: string;
  last_login?: string;
  is_active: boolean;
  is_deleted: boolean;
}

export interface AdminListResponse {
  admins: Admin[];
}
