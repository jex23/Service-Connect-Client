export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  address: string;
  id_front?: string;
  id_back?: string;
  created_at: string;
  updated_at?: string;
}

export interface UpdateUserProfileRequest {
  full_name?: string;
  address?: string;
  password?: string;
  id_front?: string; // URL for JSON requests
  id_back?: string;  // URL for JSON requests
}

export interface UpdateUserProfileResponse {
  message: string;
  user: UserProfile;
  uploaded_files?: {
    id_front?: string;
    id_back?: string;
  };
}

export interface UpdateUserProfileFiles {
  id_front?: File;
  id_back?: File;
}

export interface ApiError {
  error: string;
}

export interface DeleteAccountResponse {
  message: string;
}