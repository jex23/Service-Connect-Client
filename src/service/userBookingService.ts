import { API_CONFIG } from '../constants/api';
import { authService } from './authService';
import type {
  UserBooking,
  UserBookingFilters,
  UserBookingsResponse,
  BookingStatusUpdateRequest,
  BookingStatusUpdateResponse
} from '../types/userBooking';

class UserBookingService {
  private baseUrl = API_CONFIG.BASE_URL;

  private getAuthHeaders() {
    const token = authService.getStoredToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getUserBookings(filters?: UserBookingFilters): Promise<UserBookingsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.provider_id) params.append('provider_id', filters.provider_id.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}/api/users/me/bookings${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch bookings' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching bookings');
    }
  }

  async updateBookingStatus(updateData: BookingStatusUpdateRequest): Promise<BookingStatusUpdateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/me/bookings`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update booking status' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating booking status');
    }
  }

}

export const userBookingService = new UserBookingService();