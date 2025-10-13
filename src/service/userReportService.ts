import type {
  UserReportsResponse,
  CustomerReport,
  CreateReportRequest,
  CreateReportResponse,
  ReportDropdownData
} from '../types/report';
import { API_CONFIG } from '../constants/api';

class UserReportService {
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
   * Get all reports submitted by the current user
   * @param filters Optional filters (status, report_type, provider_id, limit, offset)
   */
  async getUserReports(filters?: {
    status?: 'Pending' | 'Under Review' | 'Resolved' | 'Rejected';
    report_type?: 'service_quality' | 'provider_behavior' | 'payment_issue' | 'cancellation' | 'other';
    provider_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<UserReportsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.status) {
        queryParams.append('status', filters.status);
      }

      if (filters?.report_type) {
        queryParams.append('report_type', filters.report_type);
      }

      if (filters?.provider_id) {
        queryParams.append('provider_id', filters.provider_id.toString());
      }

      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      if (filters?.offset) {
        queryParams.append('offset', filters.offset.toString());
      }

      const queryString = queryParams.toString();
      const url = `${this.API_BASE_URL}/api/users/me/reports${queryString ? `?${queryString}` : ''}`;

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
      console.error('Error fetching user reports:', error);
      throw error;
    }
  }

  /**
   * Get a specific report by ID
   * @param reportId Report ID
   */
  async getUserReportById(reportId: number): Promise<CustomerReport> {
    try {
      const url = `${this.API_BASE_URL}/api/users/me/reports/${reportId}`;

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
   * Create a new report/complaint
   * @param reportData Report data
   */
  async createReport(reportData: CreateReportRequest): Promise<CreateReportResponse> {
    try {
      const url = `${this.API_BASE_URL}/api/users/me/reports`;

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create report');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  /**
   * Get dropdown data for creating reports (providers, services, bookings)
   */
  async getReportDropdownData(): Promise<ReportDropdownData> {
    try {
      const url = `${this.API_BASE_URL}/api/users/reportdetailsdropdown`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dropdown data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      throw error;
    }
  }
}

export const userReportService = new UserReportService();
