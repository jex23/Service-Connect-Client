// Service types for admin management
export interface ServiceProvider {
  id: number;
  business_name: string;
  full_name: string;
  email: string;
  contact_number: string;
  address: string;
  image_logo: string | null;
  about: string | null;
  is_active: boolean;
  status: string;
}

export interface ServiceCategory {
  id: number;
  category_name: string;
  description: string | null;
}

export interface ServicePhoto {
  id: number;
  photo_url: string;
  sort_order: number;
}

export interface ServiceSchedule {
  id: number;
  schedule_day: string;
  start_time: string | null;
  end_time: string | null;
}

export interface Service {
  id: number;
  provider_id: number;
  category_id: number;
  service_title: string;
  service_description: string;
  price_decimal: number | null;
  duration_minutes: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  provider?: ServiceProvider;
  category?: ServiceCategory;
  photos?: ServicePhoto[];
  schedules?: ServiceSchedule[];
}

export interface UpdateServiceStatusRequest {
  is_active: boolean;
}

export interface UpdateServiceStatusResponse {
  message: string;
  service: Service;
}
