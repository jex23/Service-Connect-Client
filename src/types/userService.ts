export interface UserServiceRegisterRequest {
  user_id: number;
  category_id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  is_active?: boolean;
}

export interface UserService {
  id: number;
  user_id: number;
  category_id: number;
  category_name: string;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserServiceResponse {
  message: string;
  service: UserService;
}

export interface ServiceCategory {
  id: number;
  category_name: string;
  description?: string;
  is_active: boolean;
}

export interface ServiceCategoriesResponse {
  categories: ServiceCategory[];
}