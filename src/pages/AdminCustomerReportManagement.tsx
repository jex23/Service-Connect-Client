import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { adminReportService } from '../service/adminReportService';
import type { CustomerReport } from '../types/report';
import '../components/AdminLayout.css';
import './AdminCustomerReportManagement.css';

const AdminCustomerReportManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<CustomerReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CustomerReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CustomerReport | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Under Review' | 'Resolved' | 'Rejected'>('Pending');
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [updatingReport, setUpdatingReport] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...reports];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.report_type === typeFilter);
    }

    setFilteredReports(filtered);
  }, [reports, statusFilter, typeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminReportService.getReports();
      setReports(data);
      setFilteredReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'Pending').length,
      underReview: reports.filter(r => r.status === 'Under Review').length,
      resolved: reports.filter(r => r.status === 'Resolved').length,
      rejected: reports.filter(r => r.status === 'Rejected').length,
    };
  };

  const handleViewDetails = (report: CustomerReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const handleOpenResponseModal = (report: CustomerReport) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAdminResponse(report.admin_response || '');
    setShowResponseModal(true);
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setSelectedReport(null);
    setNewStatus('Pending');
    setAdminResponse('');
  };

  const handleUpdateReport = async () => {
    if (!selectedReport) return;

    try {
      setUpdatingReport(selectedReport.id);
      await adminReportService.updateReportStatus(
        selectedReport.id,
        newStatus,
        adminResponse || undefined
      );

      // Refresh reports list
      await fetchReports();

      alert(`Report status updated to ${newStatus}`);
      handleCloseResponseModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update report');
      console.error('Error updating report:', err);
    } finally {
      setUpdatingReport(null);
    }
  };

  const formatReportType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading reports...</p>
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
          <AdminHeader title="Customer Reports" showUserInfo={true} />
          <main className="admin-main">
            <div className="error-state">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={fetchReports} className="btn btn-primary">
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminHeader title="Customer Reports" showUserInfo={true} />

        <main className="admin-main">
          <div className="page-header">
            <div>
              <h2>Customer Reports & Complaints</h2>
              <p>View and manage customer reports and complaints</p>
            </div>
          </div>

          {/* Stats */}
          <div className="report-stats">
            <div className="stat-card-small">
              <div className="stat-icon-small total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.total}</p>
                <p className="stat-label-small">Total Reports</p>
              </div>
            </div>

            <div className="stat-card-small">
              <div className="stat-icon-small pending">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.pending}</p>
                <p className="stat-label-small">Pending</p>
              </div>
            </div>

            <div className="stat-card-small">
              <div className="stat-icon-small under-review">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.underReview}</p>
                <p className="stat-label-small">Under Review</p>
              </div>
            </div>

            <div className="stat-card-small">
              <div className="stat-icon-small resolved">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.resolved}</p>
                <p className="stat-label-small">Resolved</p>
              </div>
            </div>

            <div className="stat-card-small">
              <div className="stat-icon-small rejected">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.rejected}</p>
                <p className="stat-label-small">Rejected</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="report-filters">
            <div className="filter-group">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="type-filter">Report Type</label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="service_quality">Service Quality</option>
                <option value="provider_behavior">Provider Behavior</option>
                <option value="payment_issue">Payment Issue</option>
                <option value="cancellation">Cancellation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Reports Table */}
          <div className="table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>#{report.id}</td>
                    <td>
                      <div className="report-cell">
                        <div className="report-info">
                          <span className="report-name">{report.user?.full_name || 'N/A'}</span>
                          <span className="report-email">{report.user?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="report-cell">
                        <div className="report-info">
                          <span className="report-name">{report.provider?.business_name || 'N/A'}</span>
                          <span className="report-email">{report.provider?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge ${report.report_type}`}>
                        {formatReportType(report.report_type)}
                      </span>
                    </td>
                    <td>
                      <div className="report-subject">
                        {report.subject}
                      </div>
                    </td>
                    <td>
                      <span className="report-date">{formatDate(report.created_at)}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${report.status.toLowerCase().replace(' ', '-')}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => handleViewDetails(report)}
                          title="View Details"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleOpenResponseModal(report)}
                          disabled={updatingReport === report.id}
                          title="Update Status"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReports.length === 0 && (
              <div className="empty-state">
                <p>No reports found</p>
              </div>
            )}
          </div>
        </main>

        {/* Detail Modal */}
        {showDetailModal && selectedReport && (
          <div className="modal-overlay" onClick={handleCloseDetailModal}>
            <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Report Details</h3>
                <button className="modal-close" onClick={handleCloseDetailModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <h4>Report Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Report ID:</span>
                      <span className="detail-value">#{selectedReport.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type:</span>
                      <span className={`type-badge ${selectedReport.report_type}`}>
                        {formatReportType(selectedReport.report_type)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${selectedReport.status.toLowerCase().replace(' ', '-')}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{formatDate(selectedReport.created_at)}</span>
                    </div>
                    {selectedReport.resolved_at && (
                      <div className="detail-item">
                        <span className="detail-label">Resolved:</span>
                        <span className="detail-value">{formatDate(selectedReport.resolved_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Subject</h4>
                  <p className="detail-text">{selectedReport.subject}</p>
                </div>

                <div className="detail-section">
                  <h4>Description</h4>
                  <p className="detail-text">{selectedReport.description}</p>
                </div>

                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{selectedReport.user?.full_name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedReport.user?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Provider Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Business:</span>
                      <span className="detail-value">{selectedReport.provider?.business_name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Contact:</span>
                      <span className="detail-value">{selectedReport.provider?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {selectedReport.service && (
                  <div className="detail-section">
                    <h4>Service Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Service:</span>
                        <span className="detail-value">{selectedReport.service.service_title}</span>
                      </div>
                      {selectedReport.service.price_decimal && (
                        <div className="detail-item">
                          <span className="detail-label">Price:</span>
                          <span className="detail-value">₱{selectedReport.service.price_decimal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedReport.booking && (
                  <div className="detail-section">
                    <h4>Booking Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Booking ID:</span>
                        <span className="detail-value">#{selectedReport.booking.id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{selectedReport.booking.booking_date || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{selectedReport.booking.booking_time || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReport.admin_response && (
                  <div className="detail-section">
                    <h4>Admin Response</h4>
                    <p className="detail-text admin-response">{selectedReport.admin_response}</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseDetailModal}>
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleCloseDetailModal();
                    handleOpenResponseModal(selectedReport);
                  }}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Response Modal */}
        {showResponseModal && selectedReport && (
          <div className="modal-overlay" onClick={handleCloseResponseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Update Report Status</h3>
                <button className="modal-close" onClick={handleCloseResponseModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="report-info-modal">
                  <div className="report-details-modal">
                    <p className="report-id-modal">Report #{selectedReport.id}</p>
                    <p className="report-subject-modal">{selectedReport.subject}</p>
                    <p className="report-type-modal">{formatReportType(selectedReport.report_type)}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'Pending' | 'Under Review' | 'Resolved' | 'Rejected')}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="admin-response">Admin Response</label>
                  <textarea
                    id="admin-response"
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="admin-response-textarea"
                    rows={5}
                    placeholder="Enter your response to the customer..."
                  />
                </div>

                <div className="status-info">
                  <p><strong>Current Status:</strong> <span className={`status-badge ${selectedReport.status.toLowerCase().replace(' ', '-')}`}>{selectedReport.status}</span></p>
                  <p><strong>New Status:</strong> <span className={`status-badge ${newStatus.toLowerCase().replace(' ', '-')}`}>{newStatus}</span></p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseResponseModal}
                  disabled={updatingReport === selectedReport.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateReport}
                  disabled={updatingReport === selectedReport.id}
                >
                  {updatingReport === selectedReport.id ? 'Updating...' : 'Update Report'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomerReportManagement;
