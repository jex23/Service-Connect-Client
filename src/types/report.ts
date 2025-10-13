// Customer Report Types

export interface ReportUser {
  id: number;
  full_name: string;
  email: string;
  address: string;
  status: string;
}

export interface ReportProvider {
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

export interface ReportService {
  id: number;
  service_title: string;
  service_description: string;
  price_decimal: number | null;
  duration_minutes: number;
}

export interface ReportBooking {
  id: number;
  booking_date: string | null;
  booking_time: string | null;
  status: string;
}

export interface CustomerReport {
  id: number;
  user_id: number;
  provider_id: number;
  provider_service_id: number | null;
  booking_id: number | null;
  report_type: 'service_quality' | 'provider_behavior' | 'payment_issue' | 'cancellation' | 'other';
  subject: string;
  description: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Rejected';
  admin_response: string | null;
  admin_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  resolved_at: string | null;
  user?: ReportUser;
  provider?: ReportProvider;
  service?: ReportService;
  booking?: ReportBooking;
}

export interface UpdateReportStatusRequest {
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Rejected';
  admin_response?: string;
}

export interface UpdateReportStatusResponse {
  message: string;
  report: {
    id: number;
    status: string;
    admin_response: string | null;
    admin_id: number | null;
    resolved_at: string | null;
  };
}

export interface ReportFilters {
  user_id?: number;
  provider_id?: number;
  status?: 'Pending' | 'Under Review' | 'Resolved' | 'Rejected';
  report_type?: 'service_quality' | 'provider_behavior' | 'payment_issue' | 'cancellation' | 'other';
}

// User Reports Response Types
export interface UserReportsResponse {
  reports: CustomerReport[];
  total: number;
  pending_count: number;
  under_review_count: number;
  resolved_count: number;
  rejected_count: number;
}

export interface CreateReportRequest {
  provider_id: number;
  provider_service_id?: number;
  booking_id?: number;
  report_type: 'service_quality' | 'provider_behavior' | 'payment_issue' | 'cancellation' | 'other';
  subject: string;
  description: string;
}

export interface CreateReportResponse {
  message: string;
  report: CustomerReport;
}

// Report Dropdown Data Types
export interface DropdownProvider {
  id: number;
  business_name: string;
  full_name: string;
  email: string;
  contact_number: string;
  address: string;
  status: string;
}

export interface DropdownService {
  id: number;
  provider_id: number;
  category_id: number;
  service_title: string;
  service_description: string;
  price_decimal: number | null;
  duration_minutes: number;
}

export interface DropdownBooking {
  id: number;
  user_id: number;
  provider_id: number;
  provider_service_id: number;
  booking_date: string | null;
  booking_day: string;
  booking_time: string | null;
  status: string;
  created_at: string | null;
}

export interface ReportDropdownData {
  providers: DropdownProvider[];
  services: DropdownService[];
  bookings: DropdownBooking[];
}
