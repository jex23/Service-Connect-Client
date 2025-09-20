export interface ProviderBooking {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  provider_id: number;
  provider_service_id: number;
  service_title: string;
  price_decimal: number | null;
  booking_date: string;
  booking_day: string;
  booking_time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
  payment_status: 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded' | null;
  payment_description: string | null;
  payment_created_at: string | null;
  payment_updated_at: string | null;
}

export interface ProviderBookingFilters {
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'booking_date' | 'created_at' | 'total_amount';
  sort_order?: 'asc' | 'desc';
}

export interface ProviderBookingsResponse {
  message: string;
  bookings: ProviderBooking[];
  total: number;
  current_page: number;
  total_pages: number;
  filters: ProviderBookingFilters;
}

export interface ProviderBookingUpdateRequest {
  status?: 'Confirmed' | 'Completed' | 'Cancelled';
  payment_status?: 'Pending' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded';
  booking_date?: string;
  booking_day?: string;
  booking_time?: string;
}

export interface ProviderBookingUpdateResponse {
  message: string;
  booking: ProviderBooking;
}

export interface ProviderBookingStatsResponse {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  in_progress_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  rejected_bookings: number;
  total_revenue: number;
  monthly_revenue: number;
  average_booking_value: number;
  completion_rate: number;
  cancellation_rate: number;
  average_rating: number;
  this_month_bookings: number;
  last_month_bookings: number;
  revenue_growth: number;
}

export interface BookingTimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  booking_id?: number;
}

export interface ProviderAvailabilityRequest {
  provider_id: number;
  service_id?: number;
  date_from: string;
  date_to: string;
}

export interface ProviderAvailabilityResponse {
  message: string;
  available_slots: BookingTimeSlot[];
  booked_slots: BookingTimeSlot[];
}

export interface ProviderEarningsResponse {
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  monthly_earnings: {
    month: string;
    earnings: number;
    bookings_count: number;
  }[];
  top_services: {
    service_id: number;
    service_title: string;
    bookings_count: number;
    total_earnings: number;
  }[];
}

export interface BookingNotification {
  id: number;
  booking_id: number;
  type: 'new_booking' | 'booking_cancelled' | 'payment_received' | 'review_received';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ProviderNotificationsResponse {
  message: string;
  notifications: BookingNotification[];
  unread_count: number;
}