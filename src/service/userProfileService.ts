import { API_CONFIG } from '../constants/api';
import { authService } from './authService';
import type {
  UserProfile,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  UpdateUserProfileFiles,
  DeleteAccountResponse,
  ApiError
} from '../types/userProfile';

class UserProfileService {
  private baseUrl = API_CONFIG.BASE_URL;

  private getAuthHeaders() {
    const token = authService.getStoredToken();
    console.log('🔐 [UserProfileService] Retrieving token from authService:', token ? `${token.substring(0, 20)}...` : 'NULL');
    if (!token) {
      console.error('❌ [UserProfileService] No authentication token found');
    }
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    console.log('📤 [UserProfileService] Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'Bearer NULL'
    });
    return headers;
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const url = `${this.baseUrl}/api/users/me`;
      console.log('🌐 [UserProfileService] GET request to:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      console.log('📥 [UserProfileService] Response status:', response.status);
      console.log('📥 [UserProfileService] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch profile' }));
        console.error('❌ [UserProfileService] Error response data:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [UserProfileService] Successfully fetched profile');
      return data;
    } catch (error) {
      console.error('❌ [UserProfileService] Error in getUserProfile:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching profile');
    }
  }

  async updateUserProfile(updateData: UpdateUserProfileRequest, files?: UpdateUserProfileFiles): Promise<UpdateUserProfileResponse> {
    try {
      let response: Response;

      if (files && (files.id_front || files.id_back)) {
        // Use multipart/form-data for file uploads
        const formData = new FormData();

        // Add text fields
        if (updateData.full_name) formData.append('full_name', updateData.full_name);
        if (updateData.address) formData.append('address', updateData.address);
        if (updateData.password) formData.append('password', updateData.password);

        // Add files
        if (files.id_front) formData.append('id_front', files.id_front);
        if (files.id_back) formData.append('id_back', files.id_back);

        const token = authService.getStoredToken();
        response = await fetch(`${this.baseUrl}/api/users/me`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
      } else {
        // Use JSON for regular updates
        response = await fetch(`${this.baseUrl}/api/users/me`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updateData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update profile' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update stored user data
      authService.storeAuthData({
        access_token: authService.getStoredToken()!,
        user: data.user,
        message: data.message
      } as any);

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while updating profile');
    }
  }

  async deleteUserAccount(): Promise<DeleteAccountResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/me`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete account' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Clear stored auth data after successful account deletion
      authService.logout();

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while deleting account');
    }
  }

}

export const userProfileService = new UserProfileService();