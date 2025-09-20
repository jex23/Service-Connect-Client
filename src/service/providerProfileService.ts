import { API_CONFIG } from '../constants/api';
import { authService } from './authService';
import type {
  ProviderProfile,
  ProviderProfileUpdateRequest,
  ProviderProfileResponse,
  ProviderProfileUpdateResponse,
  ProviderProfileUpdateWithFilesRequest,
  ProviderDeleteResponse
} from '../types/providerProfile';

class ProviderProfileService {
  private baseUrl = API_CONFIG.BASE_URL;

  async getCurrentProviderProfile(): Promise<ProviderProfileResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/providers/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch provider profile' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching provider profile');
    }
  }

  async updateProviderProfile(updateData: ProviderProfileUpdateRequest): Promise<ProviderProfileUpdateResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/providers/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update provider profile' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating provider profile');
    }
  }

  async updateProviderProfileWithFiles(updateData: ProviderProfileUpdateWithFilesRequest): Promise<ProviderProfileUpdateResponse> {
    try {
      const token = authService.getStoredToken();
      const formData = new FormData();

      // Add text fields
      if (updateData.business_name) {
        formData.append('business_name', updateData.business_name);
      }
      if (updateData.full_name) {
        formData.append('full_name', updateData.full_name);
      }
      if (updateData.address) {
        formData.append('address', updateData.address);
      }
      if (updateData.about) {
        formData.append('about', updateData.about);
      }
      if (updateData.password) {
        formData.append('password', updateData.password);
      }

      // Add file fields
      if (updateData.bir_id_front) {
        formData.append('bir_id_front', updateData.bir_id_front);
      }
      if (updateData.bir_id_back) {
        formData.append('bir_id_back', updateData.bir_id_back);
      }
      if (updateData.business_permit) {
        formData.append('business_permit', updateData.business_permit);
      }
      if (updateData.image_logo) {
        formData.append('image_logo', updateData.image_logo);
      }

      const response = await fetch(`${this.baseUrl}/api/providers/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update provider profile' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating provider profile');
    }
  }

  async deleteProviderAccount(): Promise<ProviderDeleteResponse> {
    try {
      const token = authService.getStoredToken();
      const response = await fetch(`${this.baseUrl}/api/providers/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete provider account' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while deleting provider account');
    }
  }

}

export const providerProfileService = new ProviderProfileService();