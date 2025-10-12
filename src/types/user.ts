// User types for admin management
export interface User {
  id: number;
  full_name: string;
  email: string;
  address: string;
  id_front: string | null;
  id_back: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string | null;
  updated_at: string | null;
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserStatusResponse {
  message: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    status: string;
  };
}
