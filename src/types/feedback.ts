// Feedback Types

export interface CreateFeedbackRequest {
  provider_id: number;
  provider_service_id: number;
  booking_id: number;
  rating: number; // 1-5
  comment?: string;
}

// Completed Bookings for Feedback
export interface CompletedBookingForFeedback {
  id: number;
  provider_id: number;
  provider_name: string;
  provider_logo?: string;
  provider_service_id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  booking_date?: string;
  booking_time?: string;
  status: string;
  has_feedback: boolean;
  feedback_id?: number;
  completed_at?: string;
}

export interface CompletedBookingsResponse {
  has_completed_booking: boolean;
  can_give_feedback: boolean;
  bookings: CompletedBookingForFeedback[];
  total: number;
  with_feedback: number;
  without_feedback: number;
}

export interface FeedbackUser {
  id: number;
  full_name: string;
  email: string;
}

export interface FeedbackProvider {
  id: number;
  business_name?: string;
  full_name: string;
  email: string;
}

export interface FeedbackService {
  id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
}

export interface FeedbackBooking {
  id: number;
  booking_date?: string;
  booking_time?: string;
  status: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  provider_id: number;
  provider_service_id: number;
  booking_id: number;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
  provider?: FeedbackProvider;
  service?: FeedbackService;
  booking?: FeedbackBooking;
}

export interface CreateFeedbackResponse {
  message: string;
  feedback: Feedback;
}

// Service-Specific Feedback Types
export interface ServiceFeedbackItem {
  id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment?: string;
  booking_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ServiceInfo {
  id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  category_name?: string;
  is_active: boolean;
}

export interface ProviderInfo {
  id: number;
  business_name?: string;
  full_name: string;
  address: string;
  image_logo?: string;
  about?: string;
}

export interface ServiceFeedbacksResponse {
  feedbacks: ServiceFeedbackItem[];
  total: number;
  average_rating: number;
  rating_distribution: RatingDistribution;
  service_info: ServiceInfo;
  provider_info: ProviderInfo;
}

// Legacy - for backward compatibility with old provider endpoint
export interface ProviderFeedbackItem {
  id: number;
  user_id: number;
  user_name: string;
  provider_id: number;
  provider_service_id: number;
  service_title: string;
  booking_id: number;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderFeedbacksResponse {
  feedbacks: ProviderFeedbackItem[];
  total: number;
  average_rating: number;
  rating_distribution: RatingDistribution;
  provider_info: ProviderInfo;
}
