export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  full_name: string;
  email: string;
  address: string;
  password: string;
  id_front?: string;
  id_back?: string;
}

export interface ProviderRegisterRequest {
  business_name?: string;
  full_name: string;
  email: string;
  contact_number?: string;
  address: string;
  password: string;
  bir_id_front?: string;
  bir_id_back?: string;
  business_permit?: string;
  image_logo?: string;
  about?: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  address: string;
  id_front?: string;
  id_back?: string;
  user_type: string;
}

export interface Provider {
  id: number;
  business_name?: string;
  full_name: string;
  email: string;
  contact_number?: string;
  address: string;
  bir_id_front?: string;
  bir_id_back?: string;
  business_permit?: string;
  image_logo?: string;
  about?: string;
  is_active: boolean;
  user_type: string;
}

export interface UserAuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface ProviderAuthResponse {
  message: string;
  access_token: string;
  provider: Provider;
}

export interface ApiError {
  message: string;
  status?: number;
}

export type AuthResponse = UserAuthResponse | ProviderAuthResponse;

// Password Reset Types
export interface ForgotPasswordRequest {
  email: string;
  account_type: 'user' | 'provider';
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  account_type: 'user' | 'provider';
  otp_code: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}