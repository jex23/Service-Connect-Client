import { API_CONFIG } from '../constants/api';
import { authService } from './authService';
import type {
  CreateFeedbackRequest,
  CreateFeedbackResponse,
  CompletedBookingsResponse,
  ServiceFeedbacksResponse
} from '../types/feedback';

class FeedbackService {
  private baseUrl = API_CONFIG.BASE_URL;

  /**
   * Submit feedback for a completed booking
   * POST /api/users/feedback
   * Requires authentication (User only)
   */
  async createFeedback(feedbackData: CreateFeedbackRequest): Promise<CreateFeedbackResponse> {
    try {
      const token = authService.getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch(`${this.baseUrl}/api/users/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit feedback' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while submitting feedback');
    }
  }

  /**
   * Get all completed bookings eligible for feedback for a specific service
   * GET /api/users/feedback/completed-bookings/{provider_service_id}
   * Requires authentication (User only)
   */
  async getCompletedBookingsForService(providerServiceId: number): Promise<CompletedBookingsResponse> {
    try {
      const token = authService.getStoredToken();

      console.log('🔑 [FeedbackService] Getting completed bookings for service:', providerServiceId);
      console.log('🔑 [FeedbackService] Token exists:', !!token);

      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch(`${this.baseUrl}/api/users/feedback/completed-bookings/${providerServiceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('📥 [FeedbackService] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [FeedbackService] Error response (raw):', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Failed to fetch completed bookings' };
        }

        console.error('❌ [FeedbackService] Error data:', errorData);
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [FeedbackService] Completed bookings received:', data);
      return data;
    } catch (error) {
      console.error('❌ [FeedbackService] Exception:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching completed bookings');
    }
  }

  /**
   * Get all feedback for a specific service (Public - no authentication required)
   * GET /api/users/feedback/service/{service_id}
   */
  async getServiceFeedback(serviceId: number): Promise<ServiceFeedbacksResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/feedback/service/${serviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch service feedback' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching service feedback');
    }
  }
}

export const feedbackService = new FeedbackService();
