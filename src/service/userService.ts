import { API_CONFIG } from '../constants/api';
import type { 
  UserServiceRegisterRequest,
  UserServiceResponse,
  ServiceCategoriesResponse
} from '../types/userService';

class UserServiceAPI {
  private baseUrl = API_CONFIG.BASE_URL;

  async registerUserService(serviceData: UserServiceRegisterRequest): Promise<UserServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USER_SERVICE_REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Service registration failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during service registration');
    }
  }

  async getServiceCategories(): Promise<ServiceCategoriesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SERVICE_CATEGORIES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch service categories' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching service categories');
    }
  }
}

export const userService = new UserServiceAPI();