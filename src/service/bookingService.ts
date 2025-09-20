import { API_CONFIG } from '../constants/api';
import type {
  ServiceBookingRequest,
  ServiceBookingResponse,
  PaymentStatusRequest,
  PaymentStatusResponse,
  BookingCalendarResponse,
  BookingScheduleCheckRequest,
  BookingScheduleCheckResponse
} from '../types/booking';

class BookingServiceAPI {
  private baseUrl = API_CONFIG.BASE_URL;

  async createServiceBooking(bookingData: ServiceBookingRequest): Promise<ServiceBookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SERVICE_BOOKING}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Service booking failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during service booking');
    }
  }

  async createPaymentStatus(paymentData: PaymentStatusRequest): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.PAYMENT_STATUS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Payment status creation failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during payment status creation');
    }
  }

  async getBookingCalendar(params?: {
    start_date?: string;
    end_date?: string;
    user_id?: number;
    provider_id?: number;
  }): Promise<BookingCalendarResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
      if (params?.provider_id) queryParams.append('provider_id', params.provider_id.toString());

      const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.BOOKING_CALENDAR}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Booking calendar fetch failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during booking calendar fetch');
    }
  }

  async checkBookingSchedule(scheduleData: BookingScheduleCheckRequest): Promise<BookingScheduleCheckResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.BOOKING_SCHEDULE_CHECK}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Booking schedule check failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during booking schedule check');
    }
  }
}

export const bookingService = new BookingServiceAPI();