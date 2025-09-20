export interface ProviderCategoryRegisterRequest {
  provider_id: number;
  category_ids: number[];
}

export interface ProviderServiceRegisterRequest {
  provider_id: number;
  category_id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface ProviderServicePhotoUploadRequest {
  provider_service_id: number;
  photos: File[];
  sort_orders?: number[];
}

export interface RegisteredCategory {
  id: number;
  category_name: string;
  description?: string;
  already_registered: boolean;
}

export interface ProviderCategoryResponse {
  message: string;
  provider_id: number;
  registered_categories: RegisteredCategory[];
}

export interface ServiceCategory {
  id: number;
  category_name: string;
  description: string;
}

export interface ServiceProvider {
  id: number;
  business_name: string;
  full_name: string;
  address: string;
  about: string;
  image_logo: string;
}

export interface ServicePhoto {
  id: number;
  provider_service_id: number;
  photo_url: string;
  sort_order: number;
  created_at: string;
}

export interface ServiceSchedule {
  id: number;
  provider_service_id: number;
  schedule_day: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderService {
  id: number;
  provider_id: number;
  category_id: number;
  category_name: string;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  photos: ServicePhoto[];
  photo_count: number;
  has_photos: boolean;
  schedules: ServiceSchedule[];
  schedule_count: number;
  has_schedules: boolean;
}

export interface ProviderServiceResponse {
  message: string;
  service: ProviderService;
}


export interface FailedUpload {
  index: number;
  filename: string;
  error: string;
}

export interface ProviderServicePhotoResponse {
  message: string;
  photos: ServicePhoto[];
  total_attempted: number;
  successful_uploads: number;
  failed_uploads_count: number;
  failed_uploads?: FailedUpload[];
}

export interface ProviderServiceScheduleItem {
  schedule_day: string; // Monday, Tuesday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}

export interface ProviderServiceScheduleRequest {
  provider_service_id: number;
  schedules: ProviderServiceScheduleItem[];
}

export interface ProviderServiceSchedule {
  id: number;
  provider_service_id: number;
  schedule_day: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

export interface FailedSchedule {
  index: number;
  schedule_data: ProviderServiceScheduleItem;
  error: string;
}

export interface ProviderServiceScheduleResponse {
  message: string;
  schedules: ProviderServiceSchedule[];
  total_created: number;
  failed_schedules?: FailedSchedule[];
}

export interface ProviderServicesListResponse {
  services: ProviderService[];
  total: number;
  count: number;
}

export interface AdminProviderServicesParams {
  active?: boolean;
  category_id?: number;
  include_photos?: boolean;
  include_schedules?: boolean;
  limit?: number;
  offset?: number;
}

export interface AdminProviderServiceCreateRequest {
  category_id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  is_active?: boolean;
  photos?: File[];
  schedules?: ProviderServiceScheduleItem[];
}

export interface ProviderServiceUpdateRequest {
  service_title?: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface ProviderServiceDetailsResponse {
  message: string;
  service: ProviderService;
  photos: ServicePhoto[];
  schedules: ProviderServiceSchedule[];
}

export interface ProviderServiceCreateRequest {
  category_id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  is_active?: boolean;
}

export interface PhotoUploadRequest {
  service_id: number;
  photos: File[];
  sort_orders?: number[];
}

export interface PhotoUploadResponse {
  message: string;
  photos: ServicePhoto[];
  total_attempted: number;
  successful_uploads: number;
  failed_uploads_count: number;
  failed_uploads?: FailedUpload[];
}

export interface PhotoDeleteResponse {
  message: string;
}

export interface ServiceDeleteResponse {
  message: string;
}

export interface ProviderRegisteredCategory {
  id: number;
  category_name: string;
  description: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProviderRegisteredCategoriesResponse {
  registered_categories: ProviderRegisteredCategory[];
  total_registered: number;
}