import type { AdminBooking, UpdateAdminBookingStatusRequest, UpdateAdminBookingStatusResponse } from '../types/booking';
import { API_CONFIG } from '../constants/api';

class AdminBookingService {
  private API_BASE_URL = API_CONFIG.BASE_URL;

  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Get list of all bookings with full details
   * @param filters Optional filters for user_id, provider_id, status, and booking_date
   */
  async getBookings(filters?: { user_id?: number; provider_id?: number; status?: string; booking_date?: string }): Promise<AdminBooking[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.user_id) {
        queryParams.append('user_id', filters.user_id.toString());
      }

      if (filters?.provider_id) {
        queryParams.append('provider_id', filters.provider_id.toString());
      }

      if (filters?.status) {
        queryParams.append('status', filters.status);
      }

      if (filters?.booking_date) {
        queryParams.append('booking_date', filters.booking_date);
      }

      const queryString = queryParams.toString();
      const url = `${this.API_BASE_URL}/api/admin/bookings${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  /**
   * Get single booking by ID with full details
   * @param bookingId Booking ID
   */
  async getBookingById(bookingId: number): Promise<AdminBooking> {
    try {
      const url = `${this.API_BASE_URL}/api/admin/bookings/${bookingId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch booking');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   * @param bookingId Booking ID
   * @param status New status (Pending, Confirmed, Completed, Cancelled)
   */
  async updateBookingStatus(
    bookingId: number,
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  ): Promise<UpdateAdminBookingStatusResponse> {
    try {
      const requestBody: UpdateAdminBookingStatusRequest = { status };

      const response = await fetch(`${this.API_BASE_URL}/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
}

export const adminBookingService = new AdminBookingService();
