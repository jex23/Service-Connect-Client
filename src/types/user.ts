// User types for admin management
export interface User {
  id: number;
  full_name: string;
  email: string;
  address: string;
  id_front: string | null;
  id_back: string | null;
  status: 'active' | 'inactive' | 'suspended' | 'for_verification';
  created_at: string | null;
  updated_at: string | null;
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'inactive' | 'suspended' | 'for_verification';
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

export interface UserVerificationApprovalRequest {
  status: 'approved' | 'rejected';
  reason?: string;
}

export interface UserVerificationApprovalResponse {
  message: string;
  user: User;
}
