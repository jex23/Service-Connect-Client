import type { CustomerReport, UpdateReportStatusRequest, UpdateReportStatusResponse, ReportFilters } from '../types/report';
import { API_CONFIG } from '../constants/api';

class AdminReportService {
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
   * Get list of all customer reports
   * @param filters Optional filters (user_id, provider_id, status, report_type)
   */
  async getReports(filters?: ReportFilters): Promise<CustomerReport[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.user_id) {
        queryParams.append('user_id', filters.user_id.toString());
      }

      if (filters?.provider_id) {
        queryParams.append('provider_id', filters.provider_id.toString());
      }

      if (filters?.status) {
        queryParams.append('status', filters.status);
      }

      if (filters?.report_type) {
        queryParams.append('report_type', filters.report_type);
      }

      const queryString = queryParams.toString();
      const url = `${this.API_BASE_URL}/api/admin/reports${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reports');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Get single customer report by ID
   * @param reportId Report ID
   */
  async getReportById(reportId: number): Promise<CustomerReport> {
    try {
      const url = `${this.API_BASE_URL}/api/admin/reports/${reportId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch report');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  /**
   * Update customer report status and add admin response
   * @param reportId Report ID
   * @param status New status (Pending, Under Review, Resolved, Rejected)
   * @param adminResponse Optional admin response message
   */
  async updateReportStatus(
    reportId: number,
    status: 'Pending' | 'Under Review' | 'Resolved' | 'Rejected',
    adminResponse?: string
  ): Promise<UpdateReportStatusResponse> {
    try {
      const requestBody: UpdateReportStatusRequest = { status };
      if (adminResponse) {
        requestBody.admin_response = adminResponse;
      }

      const response = await fetch(`${this.API_BASE_URL}/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update report status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }
}

export const adminReportService = new AdminReportService();
