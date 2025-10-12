// Service Booking Types
export interface ServiceBookingRequest {
  user_id: number;
  provider_service_id: number;
  booking_date: string; // YYYY-MM-DD format
  booking_day: string; // Monday, Tuesday, etc.
  booking_time: string; // HH:MM format
  status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface ServiceBooking {
  id: number;
  user_id: number;
  provider_id: number;
  provider_service_id: number;
  booking_date: string; // YYYY-MM-DD format
  booking_day: string;
  booking_time: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface ServiceInfo {
  id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  category?: {
    id: number;
    category_name: string;
    description?: string;
  };
}

export interface ProviderInfo {
  id: number;
  business_name?: string;
  full_name: string;
  email: string;
  address: string;
  about?: string;
}

export interface ServiceBookingResponse {
  message: string;
  booking: ServiceBooking;
  service_info: ServiceInfo;
  provider_info: ProviderInfo;
}

// Payment Status Types
export interface PaymentStatusRequest {
  booking_id: number;
  status: 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded';
  description?: string;
}

export interface PaymentStatus {
  id: number;
  booking_id: number;
  status: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface BookingInfo {
  id: number;
  booking_day: string;
  booking_time: string;
  booking_status: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  provider?: {
    id: number;
    business_name?: string;
    full_name: string;
    email: string;
  };
  service?: {
    id: number;
    service_title: string;
    price_decimal?: number;
  };
}

export interface PaymentStatusResponse {
  message: string;
  payment_status: PaymentStatus;
  booking_info: BookingInfo;
}

// Booking Calendar Types
export interface BookingCalendarEntry {
  id: number;
  booking_date: string; // YYYY-MM-DD format
  booking_day: string;
  booking_time: string;
  status: string;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  provider?: {
    id: number;
    business_name?: string;
    full_name: string;
    email: string;
    is_active: boolean;
  };
  service?: {
    id: number;
    service_title: string;
    service_description?: string;
    price_decimal?: number;
    duration_minutes?: number;
    category?: {
      id: number;
      category_name: string;
      description?: string;
    };
  };
  payment_status?: {
    id: number;
    status: string;
    description?: string;
    created_at: string;
  };
}

export interface BookingCalendarDay {
  date: string;
  bookings: BookingCalendarEntry[];
}

export type BookingCalendarResponse = BookingCalendarDay[];

// Booking Schedule Check Types
export interface BookingScheduleCheckRequest {
  provider_service_id: number;
  booking_day: string;
  date?: string; // Optional YYYY-MM-DD format
}

export interface ProviderServiceInfo {
  id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  category?: {
    id: number;
    category_name: string;
    description?: string;
  };
  provider: {
    id: number;
    business_name?: string;
    full_name: string;
    email: string;
    is_active: boolean;
  };
}

export interface ScheduleInfo {
  id: number;
  schedule_day: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface ExistingBooking {
  id: number;
  booking_date?: string;
  booking_time: string;
  status: string;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
  payment_status?: {
    id: number;
    status: string;
    description?: string;
    created_at: string;
  };
}

export interface BookingScheduleCheckResponse {
  provider_service: ProviderServiceInfo;
  schedule?: ScheduleInfo;
  available_slots: string[];
  existing_bookings: ExistingBooking[];
}

// Admin Booking Management Types
export interface AdminBookingUser {
  id: number;
  full_name: string;
  email: string;
  address: string;
  status: string;
}

export interface AdminBookingProvider {
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

export interface AdminBookingService {
  id: number;
  service_title: string;
  service_description: string;
  price_decimal: number | null;
  duration_minutes: number;
}

export interface AdminBooking {
  id: number;
  user_id: number;
  provider_id: number;
  provider_service_id: number;
  booking_date: string | null;
  booking_day: string;
  booking_time: string | null;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  created_at: string | null;
  updated_at: string | null;
  user?: AdminBookingUser;
  provider?: AdminBookingProvider;
  service?: AdminBookingService;
}

export interface UpdateAdminBookingStatusRequest {
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface UpdateAdminBookingStatusResponse {
  message: string;
  booking: AdminBooking;
}