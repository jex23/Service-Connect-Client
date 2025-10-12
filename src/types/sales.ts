// Sales Report Types

export interface ProviderSalesSummary {
  provider_id: number;
  business_name: string;
  provider_name: string;
  email: string;
  total_bookings: number;
  total_revenue: number;
  completed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
}

export interface OverallSalesSummary {
  total_providers: number;
  total_revenue: number;
  total_bookings: number;
  providers: ProviderSalesSummary[];
}

export interface BookingDetail {
  booking_id: number;
  user_name: string;
  user_email: string;
  service_title: string;
  booking_date: string | null;
  booking_time: string | null;
  price: number;
  payment_status: string;
  payment_date: string | null;
  booking_status: string;
}

export interface ProviderSalesReport {
  provider: ProviderSalesSummary;
  bookings: BookingDetail[];
}

export interface SalesDateFilter {
  start_date?: string; // YYYY-MM-DD format
  end_date?: string;   // YYYY-MM-DD format
}
