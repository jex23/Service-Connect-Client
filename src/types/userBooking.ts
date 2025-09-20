export interface UserBooking {
  id: number;
  booking_date: string;
  booking_day: string;
  booking_time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at?: string;
  provider: {
    id: number;
    business_name?: string;
    full_name: string;
    email: string;
    contact_number?: string;
    address: string;
    about?: string;
    is_active: boolean;
  };
  service: {
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

export interface UserBookingFilters {
  status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  start_date?: string; // YYYY-MM-DD format
  end_date?: string; // YYYY-MM-DD format
  provider_id?: number;
  limit?: number;
  offset?: number;
}

export interface UserBookingsResponse {
  bookings: UserBooking[];
  total: number;
  pending_count: number;
  confirmed_count: number;
  completed_count: number;
  cancelled_count: number;
}

export interface BookingStatusUpdateRequest {
  booking_id: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface BookingStatusUpdateResponse {
  message: string;
  booking: UserBooking;
}