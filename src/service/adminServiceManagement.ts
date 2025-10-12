import type { Service, UpdateServiceStatusRequest, UpdateServiceStatusResponse } from '../types/service';
import { API_CONFIG } from '../constants/api';

class AdminServiceManagementService {
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
   * Get list of all services with full details
   * @param filters Optional filters for provider_id, category_id, and is_active
   */
  async getServices(filters?: { provider_id?: number; category_id?: number; is_active?: boolean }): Promise<Service[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.provider_id) {
        queryParams.append('provider_id', filters.provider_id.toString());
      }

      if (filters?.category_id) {
        queryParams.append('category_id', filters.category_id.toString());
      }

      if (filters?.is_active !== undefined) {
        queryParams.append('is_active', filters.is_active.toString());
      }

      const queryString = queryParams.toString();
      const url = `${this.API_BASE_URL}/api/admin/services${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch services');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Get single service by ID with full details
   * @param serviceId Service ID
   */
  async getServiceById(serviceId: number): Promise<Service> {
    try {
      const services = await this.getServices();
      const service = services.find(s => s.id === serviceId);

      if (!service) {
        throw new Error('Service not found');
      }

      return service;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  /**
   * Update service active status
   * @param serviceId Service ID
   * @param isActive New active status (true or false)
   */
  async updateServiceStatus(
    serviceId: number,
    isActive: boolean
  ): Promise<UpdateServiceStatusResponse> {
    try {
      const requestBody: UpdateServiceStatusRequest = { is_active: isActive };

      const response = await fetch(`${this.API_BASE_URL}/api/admin/services/${serviceId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update service status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating service status:', error);
      throw error;
    }
  }
}

export const adminServiceManagementService = new AdminServiceManagementService();
