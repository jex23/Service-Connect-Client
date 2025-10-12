import type { OverallSalesSummary, ProviderSalesReport, SalesDateFilter } from '../types/sales';
import { API_CONFIG } from '../constants/api';

class AdminSalesService {
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
   * Get overall sales report for all providers
   * @param filters Optional date filters (start_date, end_date)
   */
  async getOverallSalesReport(filters?: SalesDateFilter): Promise<OverallSalesSummary> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.start_date) {
        queryParams.append('start_date', filters.start_date);
      }

      if (filters?.end_date) {
        queryParams.append('end_date', filters.end_date);
      }

      const queryString = queryParams.toString();
      const url = `${this.API_BASE_URL}/api/admin/sales-report${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sales report');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      throw error;
    }
  }

  /**
   * Get detailed sales report for a specific provider
   * @param providerId Provider ID
   * @param filters Optional date filters (start_date, end_date)
   */
  async getProviderSalesReport(providerId: number, filters?: SalesDateFilter): Promise<ProviderSalesReport> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.start_date) {
        queryParams.append('start_date', filters.start_date);
      }

      if (filters?.end_date) {
        queryParams.append('end_date', filters.end_date);
      }

      const queryString = queryParams.toString();
      const url = `${this.API_BASE_URL}/api/admin/sales-report/provider/${providerId}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch provider sales report');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching provider sales report:', error);
      throw error;
    }
  }
}

export const adminSalesService = new AdminSalesService();
