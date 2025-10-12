import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { adminSalesService } from '../service/adminSalesService';
import type { OverallSalesSummary, ProviderSalesSummary, ProviderSalesReport } from '../types/sales';
import '../components/AdminLayout.css';
import './AdminSaleManagement.css';

const AdminSaleManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<OverallSalesSummary | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderSalesReport | null>(null);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loadingProvider, setLoadingProvider] = useState(false);

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async (filters?: { start_date?: string; end_date?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSalesService.getOverallSalesReport(filters);
      setSalesData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales report');
      console.error('Error fetching sales report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDateFilter = () => {
    const filters: { start_date?: string; end_date?: string } = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    fetchSalesReport(filters);
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchSalesReport();
  };

  const handleViewProviderDetails = async (provider: ProviderSalesSummary) => {
    try {
      setLoadingProvider(true);
      const filters: { start_date?: string; end_date?: string } = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;

      const providerReport = await adminSalesService.getProviderSalesReport(provider.provider_id, filters);
      setSelectedProvider(providerReport);
      setShowProviderModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to fetch provider details');
      console.error('Error fetching provider report:', err);
    } finally {
      setLoadingProvider(false);
    }
  };

  const handleCloseProviderModal = () => {
    setShowProviderModal(false);
    setSelectedProvider(null);
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading sales report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <AdminHeader title="Sales Management" showUserInfo={true} />
          <main className="admin-main">
            <div className="error-state">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={() => fetchSalesReport()} className="btn btn-primary">
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminHeader title="Sales Management" showUserInfo={true} />

        <main className="admin-main">
          <div className="page-header">
            <div>
              <h2>Sales & Revenue Report</h2>
              <p>View sales data and revenue reports for all providers</p>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="sales-stats">
            <div className="stat-card">
              <div className="stat-icon total-revenue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-value">{formatCurrency(salesData?.total_revenue || 0)}</p>
                <p className="stat-label">Total Revenue</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total-bookings">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-value">{salesData?.total_bookings || 0}</p>
                <p className="stat-label">Total Paid Bookings</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon total-providers">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-value">{salesData?.total_providers || 0}</p>
                <p className="stat-label">Active Providers</p>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="date-filter-card">
            <h3>Filter by Date Range</h3>
            <div className="date-filter-inputs">
              <div className="filter-input-group">
                <label htmlFor="start-date">Start Date</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="filter-input-group">
                <label htmlFor="end-date">End Date</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="filter-buttons">
                <button onClick={handleApplyDateFilter} className="btn btn-primary">
                  Apply Filter
                </button>
                <button onClick={handleClearDateFilter} className="btn btn-secondary">
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Provider Sales Table */}
          <div className="table-container">
            <div className="table-header">
              <h3>Sales by Provider</h3>
            </div>
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Provider</th>
                  <th>Total Revenue</th>
                  <th>Total Bookings</th>
                  <th>Completed</th>
                  <th>Pending</th>
                  <th>Cancelled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salesData?.providers.map((provider, index) => (
                  <tr key={provider.provider_id}>
                    <td>
                      <div className="rank-badge">{index + 1}</div>
                    </td>
                    <td>
                      <div className="provider-info">
                        <span className="provider-business">{provider.business_name}</span>
                        <span className="provider-name">{provider.provider_name}</span>
                        <span className="provider-email">{provider.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="revenue-amount">{formatCurrency(provider.total_revenue)}</span>
                    </td>
                    <td>
                      <span className="booking-count">{provider.total_bookings}</span>
                    </td>
                    <td>
                      <span className="status-count completed">{provider.completed_bookings}</span>
                    </td>
                    <td>
                      <span className="status-count pending">{provider.pending_bookings}</span>
                    </td>
                    <td>
                      <span className="status-count cancelled">{provider.cancelled_bookings}</span>
                    </td>
                    <td>
                      <button
                        className="btn-icon btn-view"
                        onClick={() => handleViewProviderDetails(provider)}
                        disabled={loadingProvider}
                        title="View Details"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!salesData?.providers || salesData.providers.length === 0) && (
              <div className="empty-state">
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </main>

        {/* Provider Details Modal */}
        {showProviderModal && selectedProvider && (
          <div className="modal-overlay" onClick={handleCloseProviderModal}>
            <div className="modal-content provider-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Provider Sales Details</h3>
                <button className="modal-close" onClick={handleCloseProviderModal}>×</button>
              </div>

              <div className="modal-body">
                {/* Provider Info */}
                <div className="provider-summary">
                  <div className="provider-summary-header">
                    <h4>{selectedProvider.provider.business_name}</h4>
                    <p className="provider-summary-name">{selectedProvider.provider.provider_name}</p>
                    <p className="provider-summary-email">{selectedProvider.provider.email}</p>
                  </div>

                  <div className="provider-summary-stats">
                    <div className="summary-stat">
                      <span className="summary-stat-label">Total Revenue</span>
                      <span className="summary-stat-value revenue">{formatCurrency(selectedProvider.provider.total_revenue)}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="summary-stat-label">Total Bookings</span>
                      <span className="summary-stat-value">{selectedProvider.provider.total_bookings}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="summary-stat-label">Completed</span>
                      <span className="summary-stat-value completed">{selectedProvider.provider.completed_bookings}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="summary-stat-label">Pending</span>
                      <span className="summary-stat-value pending">{selectedProvider.provider.pending_bookings}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="summary-stat-label">Cancelled</span>
                      <span className="summary-stat-value cancelled">{selectedProvider.provider.cancelled_bookings}</span>
                    </div>
                  </div>
                </div>

                {/* Bookings Table */}
                <div className="bookings-list">
                  <h4>Booking Details</h4>
                  <div className="bookings-table-container">
                    <table className="bookings-details-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Customer</th>
                          <th>Service</th>
                          <th>Date & Time</th>
                          <th>Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProvider.bookings.map((booking) => (
                          <tr key={booking.booking_id}>
                            <td>#{booking.booking_id}</td>
                            <td>
                              <div className="customer-info">
                                <span className="customer-name">{booking.user_name}</span>
                                <span className="customer-email">{booking.user_email}</span>
                              </div>
                            </td>
                            <td>{booking.service_title}</td>
                            <td>
                              <div className="booking-datetime">
                                <span className="booking-date">{booking.booking_date || 'N/A'}</span>
                                <span className="booking-time">{booking.booking_time || 'N/A'}</span>
                              </div>
                            </td>
                            <td>
                              <span className="booking-price">{formatCurrency(booking.price)}</span>
                            </td>
                            <td>
                              <span className={`status-badge ${booking.booking_status.toLowerCase()}`}>
                                {booking.booking_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {selectedProvider.bookings.length === 0 && (
                      <div className="empty-state">
                        <p>No bookings found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseProviderModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSaleManagement;
