import type { Provider, UpdateProviderStatusRequest, UpdateProviderStatusResponse } from '../types/provider';
import { API_CONFIG } from '../constants/api';

class AdminProviderService {
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
   * Get list of all providers
   * @param filters Optional filters for status and is_active
   */
  async getProviders(filters?: { status?: string; is_active?: boolean }): Promise<Provider[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.status) {
        queryParams.append('status', filters.status);
      }

      if (filters?.is_active !== undefined) {
        queryParams.append('is_active', filters.is_active.toString());
      }

      const queryString = queryParams.toString();
      const url = `${this.API_BASE_URL}/api/admin/providers${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch providers');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }

  /**
   * Update provider status
   * @param providerId Provider ID
   * @param status New status (active, inactive, suspended)
   */
  async updateProviderStatus(
    providerId: number,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<UpdateProviderStatusResponse> {
    try {
      const requestBody: UpdateProviderStatusRequest = { status };

      const response = await fetch(`${this.API_BASE_URL}/api/admin/providers/${providerId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update provider status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating provider status:', error);
      throw error;
    }
  }
}

export const adminProviderService = new AdminProviderService();
