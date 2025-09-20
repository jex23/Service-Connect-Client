export interface ServicePhoto {
  id: number;
  photo_url: string;
  sort_order: number;
  created_at: string;
}

export interface ServiceSchedule {
  id: number;
  schedule_day: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at?: string;
}

export interface ServiceCategory {
  id: number;
  category_name: string;
  description?: string;
}

export interface ServiceProvider {
  id: number;
  business_name?: string;
  full_name: string;
  address: string;
  about?: string;
  email?: string;
  image_logo?: string;
}

export interface PublicService {
  id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category: ServiceCategory;
  provider: ServiceProvider;
  photos: ServicePhoto[];
  photo_count: number;
  has_photos: boolean;
  schedules: ServiceSchedule[];
  schedule_count: number;
  has_schedule: boolean;
}

export interface PublicServicesResponse {
  provider?: ServiceProvider; // Added for getProviderServices endpoint
  services: PublicService[];
  total: number;
  count: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ServiceDetailResponse {
  main_service: {
    id: number;
    provider_id: number;
    category_id: number;
    service_title: string;
    service_description?: string;
    price_decimal?: number;
    duration_minutes?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category: ServiceCategory;
    provider_service_photos: {
      id: number;
      provider_service_id: number;
      photo_url: string;
      sort_order: number;
      created_at: string;
    }[];
    photo_count: number;
    has_photos: boolean;
    schedules: ServiceSchedule[];
    schedule_count: number;
    has_schedule: boolean;
  };
  provider: {
    id: number;
    business_name?: string;
    full_name: string;
    address: string;
    about?: string;
    email?: string;
    image_logo?: string;
  };
  provider_services: {
    id: number;
    provider_id: number;
    category_id: number;
    service_title: string;
    service_description?: string;
    price_decimal?: number;
    duration_minutes?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category: ServiceCategory;
    provider_service_photos: {
      id: number;
      provider_service_id: number;
      photo_url: string;
      sort_order: number;
      created_at: string;
    }[];
    photo_count: number;
    has_photos: boolean;
    schedules: ServiceSchedule[];
    schedule_count: number;
    has_schedule: boolean;
  }[];
  provider_services_count: number;
  requested_service_id: number;
  provider_id: number;
}

export interface Provider {
  id: number;
  business_name?: string;
  full_name: string;
  email: string;
  contact_number?: string;
  address: string;
  bir_id_front: string | null;
  bir_id_back: string | null;
  business_permit: string | null;
  image_logo: string | null;
  about: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProvidersResponse {
  providers: Provider[];
  total: number;
  count: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ProvidersFilters {
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ServicesFilters {
  active?: boolean;
  category_id?: number;
  provider_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  has_photos?: boolean;
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'name_asc' | 'name_desc';
}