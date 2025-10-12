import { API_CONFIG } from '../constants/api';
import type {
  Admin,
  AdminLoginCredentials,
  AdminLoginResponse,
  AdminRegisterData,
  AdminRegisterResponse,
  AdminProfileResponse
} from '../types/admin';

class AdminService {
  private baseUrl = API_CONFIG.BASE_URL;
  private adminEndpoint = '/api/admin'; // Base admin endpoint

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

  // Admin Login
  async loginAdmin(credentials: AdminLoginCredentials): Promise<AdminLoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error(errorData.error || 'Invalid email or password');
        } else if (response.status === 403) {
          throw new Error(errorData.error || 'Account is inactive. Please contact a superadmin.');
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid credentials format');
        }

        throw new Error(errorData.error || `Login failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
  }

  // Register New Admin (Superadmin only)
  async registerAdmin(adminData: AdminRegisterData): Promise<AdminRegisterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 403) {
          throw new Error(errorData.error || 'Superadmin access required');
        } else if (response.status === 409) {
          throw new Error(errorData.error || 'Email already exists');
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Invalid admin data');
        }

        throw new Error(errorData.error || `Registration failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to register admin');
    }
  }

  // Get Admin Profile
  async getAdminProfile(): Promise<AdminProfileResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        } else if (response.status === 404) {
          throw new Error('Admin not found');
        }

        throw new Error(errorData.error || `Failed to get profile: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get admin profile');
    }
  }

  // Get List of All Admins
  async getAdminList(): Promise<Admin[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.adminEndpoint}/list`, {
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

        throw new Error(errorData.error || `Failed to get admin list: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get admin list');
    }
  }

  // Store admin auth data
  storeAdminAuthData(authResponse: AdminLoginResponse): void {
    localStorage.setItem('access_token', authResponse.access_token);
    localStorage.setItem('user', JSON.stringify(authResponse.admin));
    localStorage.setItem('userType', 'admin');
    localStorage.setItem('adminRole', authResponse.admin.role);
    localStorage.setItem('isAuthenticated', 'true');
  }

  // Get stored admin
  getStoredAdmin(): Admin | null {
    const userStr = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');

    if (userType === 'admin' && userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  // Get admin role
  getAdminRole(): string | null {
    return localStorage.getItem('adminRole');
  }

  // Check if current user is superadmin
  isSuperadmin(): boolean {
    return this.getAdminRole() === 'superadmin';
  }

  // Logout admin
  logoutAdmin(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('adminRole');
  }
}

export const adminService = new AdminService();
