import { API_CONFIG } from '../constants/api';
import type { User } from '../types/user';
import type { Provider } from '../types/provider';
import { adminUserService } from './adminUserService';
import { adminProviderService } from './adminProviderService';

class AdminVerificationService {
  private baseUrl = API_CONFIG.BASE_URL;
  private adminEndpoint = '/api/admin';

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get auth headers
  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // Get list of users pending verification
  async getUsersPendingVerification(): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/users/pending-verification`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Admin access required');
        }

        throw new Error(errorData.error || `Failed to get users pending verification: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get users pending verification');
    }
  }

  // Get list of providers pending verification
  async getProvidersPendingVerification(): Promise<Provider[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/providers/pending-verification`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Admin access required');
        }

        throw new Error(errorData.error || `Failed to get providers pending verification: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get providers pending verification');
    }
  }

  // Get specific user details
  async getUserDetails(userId: number): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/users/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Admin access required');
        } else if (response.status === 404) {
          throw new Error('User not found');
        }

        throw new Error(errorData.error || `Failed to get user details: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get user details');
    }
  }

  // Get specific provider details
  async getProviderDetails(providerId: number): Promise<Provider> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/providers/${providerId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Admin access required');
        } else if (response.status === 404) {
          throw new Error('Provider not found');
        }

        throw new Error(errorData.error || `Failed to get provider details: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get provider details');
    }
  }

  // Approve user verification
  async approveUser(userId: number): Promise<{ message: string; user: User }> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/users/${userId}/approve`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Admin access required');
        } else if (response.status === 404) {
          throw new Error('User not found');
        }

        throw new Error(errorData.error || `Failed to approve user: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to approve user');
    }
  }

  // Reject user verification by setting status to inactive
  async rejectUser(userId: number): Promise<{ message: string; user: User }> {
    try {
      const result = await adminUserService.updateUserStatus(userId, 'inactive');
      return {
        message: 'User rejected successfully',
        user: result.user
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to reject user');
    }
  }

  // Approve provider verification
  async approveProvider(providerId: number): Promise<{ message: string; provider: Provider }> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/providers/${providerId}/approve`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Admin access required');
        } else if (response.status === 404) {
          throw new Error('Provider not found');
        }

        throw new Error(errorData.error || `Failed to approve provider: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to approve provider');
    }
  }

  // Reject provider verification by setting status to inactive
  async rejectProvider(providerId: number): Promise<{ message: string; provider: Provider }> {
    try {
      const result = await adminProviderService.updateProviderStatus(providerId, 'inactive');
      return {
        message: 'Provider rejected successfully',
        provider: result.provider
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to reject provider');
    }
  }
}

export const adminVerificationService = new AdminVerificationService();
