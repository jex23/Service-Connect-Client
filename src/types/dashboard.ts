// Dashboard Summary Types
export interface UsersSummary {
  total_users: number;
  active_users: number;
  inactive_users: number;
  suspended_users: number;
  pending_verification_users: number;
}

export interface ProvidersSummary {
  total_providers: number;
  active_providers: number;
  inactive_providers: number;
  suspended_providers: number;
  pending_verification_providers: number;
}

export interface ServicesSummary {
  total_services: number;
  active_services: number;
  inactive_services: number;
}

export interface BookingsSummary {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
}

export interface SalesSummary {
  total_sales: number;
  total_paid_bookings: number;
  pending_payments: number;
  failed_payments: number;
}

export interface DashboardSummary {
  users: UsersSummary;
  providers: ProvidersSummary;
  services: ServicesSummary;
  bookings: BookingsSummary;
  sales: SalesSummary;
}
