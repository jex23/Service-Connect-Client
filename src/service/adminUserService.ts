import type { User, UpdateUserStatusRequest, UpdateUserStatusResponse } from '../types/user';
import { API_CONFIG } from '../constants/api';

class AdminUserService {
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
   * Get list of all users
   * @param filters Optional filters for status
   */
  async getUsers(filters?: { status?: string }): Promise<User[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.status) {
        queryParams.append('status', filters.status);
      }

      const queryString = queryParams.toString();
      const url = `${this.API_BASE_URL}/api/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Update user status
   * @param userId User ID
   * @param status New status (active, inactive, suspended)
   */
  async updateUserStatus(
    userId: number,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<UpdateUserStatusResponse> {
    try {
      const requestBody: UpdateUserStatusRequest = { status };

      const response = await fetch(`${this.API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
}

export const adminUserService = new AdminUserService();
