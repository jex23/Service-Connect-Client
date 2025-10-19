import type { DashboardSummary } from '../types/dashboard';
import { API_CONFIG } from '../constants/api';

class AdminDashboardService {
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
   * Get dashboard summary with all statistics
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/admin/dashboard/summary`, {
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

        throw new Error(errorData.error || `Failed to get dashboard summary: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get dashboard summary');
    }
  }
}

export const adminDashboardService = new AdminDashboardService();
