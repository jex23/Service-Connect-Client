import { API_CONFIG } from '../constants/api';
import type { 
  PublicServicesResponse, 
  ServiceDetailResponse, 
  ServicesFilters,
  ProvidersResponse,
  ProvidersFilters
} from '../types/publicServices';

class PublicServicesAPI {
  private baseUrl = API_CONFIG.BASE_URL;

  async getPublicServices(filters?: ServicesFilters): Promise<PublicServicesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.active !== undefined) params.append('active', filters.active.toString());
        if (filters.category_id) params.append('category_id', filters.category_id.toString());
        if (filters.provider_id) params.append('provider_id', filters.provider_id.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
        if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
        if (filters.has_photos !== undefined) params.append('has_photos', filters.has_photos.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
        if (filters.sort) params.append('sort', filters.sort);
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}/api/providers/services${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch services' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching services');
    }
  }

  async getServiceDetail(serviceId: number): Promise<ServiceDetailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/providers/services/${serviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Service not found' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching service details');
    }
  }

  async getProviders(filters?: ProvidersFilters): Promise<ProvidersResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.active !== undefined) params.append('active', filters.active.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}/api/providers${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch providers' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching providers');
    }
  }

  async getProviderServices(providerId: number, filters?: Omit<ServicesFilters, 'provider_id'>): Promise<PublicServicesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.active !== undefined) params.append('active', filters.active.toString());
        if (filters.category_id) params.append('category_id', filters.category_id.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
        if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
        if (filters.has_photos !== undefined) params.append('has_photos', filters.has_photos.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
        if (filters.sort) params.append('sort', filters.sort);
      }

      const queryString = params.toString();
      const url = `${this.baseUrl}/api/providers/${providerId}/services${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch provider services' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching provider services');
    }
  }
}

export const publicServicesService = new PublicServicesAPI();