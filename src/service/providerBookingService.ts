import { API_CONFIG } from '../constants/api';
import { authService } from './authService';
import type {
  ProviderBooking,
  ProviderBookingFilters,
  ProviderBookingsResponse,
  ProviderBookingUpdateRequest,
  ProviderBookingUpdateResponse,
  ProviderBookingStatsResponse,
  ProviderAvailabilityRequest,
  ProviderAvailabilityResponse,
  ProviderEarningsResponse,
  ProviderNotificationsResponse
} from '../types/providerBooking';

class ProviderBookingService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getProviderBookings(providerId?: number, filters?: ProviderBookingFilters): Promise<ProviderBookingsResponse> {
    try {
      const token = authService.getStoredToken();
      const url = `${this.baseUrl}/api/providers/me/provider/mybookings`;
      console.log('Calling endpoint:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch provider bookings' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const bookings = await response.json();
      console.log('Raw API Response:', bookings);
      // Return in the expected format for compatibility
      return {
        message: 'Bookings retrieved successfully',
        bookings: bookings,
        total: bookings.length,
        current_page: 1,
        total_pages: 1,
        filters: filters || {}
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching provider bookings');
    }
  }

  async getProviderBookingDetails(bookingId: number): Promise<{ message: string; booking: ProviderBooking }> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/providers/me/provider/mybookings/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch booking details' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const booking = await response.json();
      return {
        message: 'Booking retrieved successfully',
        booking: booking
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching booking details');
    }
  }

  async updateProviderBooking(bookingId: number, updateData: ProviderBookingUpdateRequest): Promise<ProviderBookingUpdateResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/providers/me/provider/mybookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update booking' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const booking = await response.json();
      return {
        message: 'Booking updated successfully',
        booking: booking
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating booking');
    }
  }

  async getProviderBookingStats(providerId: number): Promise<ProviderBookingStatsResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/provider/${providerId}/booking-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch booking stats' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching booking stats');
    }
  }

  async getProviderAvailability(availabilityData: ProviderAvailabilityRequest): Promise<ProviderAvailabilityResponse> {
    try {
      const token = authService.getStoredToken();
      const queryParams = new URLSearchParams({
        date_from: availabilityData.date_from,
        date_to: availabilityData.date_to,
      });

      if (availabilityData.service_id) {
        queryParams.append('service_id', availabilityData.service_id.toString());
      }

      const response = await fetch(
        `${this.baseUrl}/api/provider/${availabilityData.provider_id}/availability?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch availability' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching availability');
    }
  }

  async getProviderEarnings(providerId: number): Promise<ProviderEarningsResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/provider/${providerId}/earnings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch earnings' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching earnings');
    }
  }

  async getProviderNotifications(providerId: number): Promise<ProviderNotificationsResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/provider/${providerId}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch notifications' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching notifications');
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<{ message: string }> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/provider/notification/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to mark notification as read' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while marking notification as read');
    }
  }

  async bulkUpdateBookingStatus(bookingIds: number[], status: string): Promise<{ message: string; updated_count: number }> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/provider/bookings/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_ids: bookingIds,
          status: status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to bulk update bookings' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while bulk updating bookings');
    }
  }
}

export const providerBookingService = new ProviderBookingService();