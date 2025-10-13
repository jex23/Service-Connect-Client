import React, { useState, useEffect } from 'react';
import { userReportService } from '../service/userReportService';
import type { CustomerReport, UserReportsResponse, ReportDropdownData } from '../types/report';
import './UserReports.css';

const UserReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<UserReportsResponse | null>(null);
  const [filteredReports, setFilteredReports] = useState<CustomerReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CustomerReport | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dropdownData, setDropdownData] = useState<ReportDropdownData | null>(null);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [formData, setFormData] = useState({
    provider_id: '',
    provider_service_id: '',
    booking_id: '',
    report_type: 'service_quality' as const,
    subject: '',
    description: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (!reportsData) return;

    // Apply filters
    let filtered = [...reportsData.reports];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.report_type === typeFilter);
    }

    setFilteredReports(filtered);
  }, [reportsData, statusFilter, typeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userReportService.getUserReports();
      setReportsData(data);
      setFilteredReports(data.reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (report: CustomerReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const handleOpenCreateModal = async () => {
    setShowCreateModal(true);
    setSubmitError(null);
    setFormData({
      provider_id: '',
      provider_service_id: '',
      booking_id: '',
      report_type: 'service_quality',
      subject: '',
      description: ''
    });

    // Fetch dropdown data
    try {
      setLoadingDropdown(true);
      const data = await userReportService.getReportDropdownData();
      setDropdownData(data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to load dropdown data');
    } finally {
      setLoadingDropdown(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSubmitError(null);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Reset service and booking when provider changes
      if (field === 'provider_id') {
        newData.provider_service_id = '';
        newData.booking_id = '';
      }

      return newData;
    });
  };

  // Get services filtered by selected provider
  const getFilteredServices = () => {
    if (!dropdownData || !formData.provider_id) return [];
    return dropdownData.services.filter(
      service => service.provider_id === parseInt(formData.provider_id)
    );
  };

  // Get bookings filtered by selected provider
  const getFilteredBookings = () => {
    if (!dropdownData || !formData.provider_id) return [];
    return dropdownData.bookings.filter(
      booking => booking.provider_id === parseInt(formData.provider_id)
    );
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submitData: any = {
        provider_id: parseInt(formData.provider_id),
        report_type: formData.report_type,
        subject: formData.subject,
        description: formData.description
      };

      if (formData.provider_service_id) {
        submitData.provider_service_id = parseInt(formData.provider_service_id);
      }

      if (formData.booking_id) {
        submitData.booking_id = parseInt(formData.booking_id);
      }

      await userReportService.createReport(submitData);

      // Refresh the reports list
      await fetchReports();

      // Close modal and reset form
      handleCloseCreateModal();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
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
      <div className="user-reports-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-reports-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchReports} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-reports-container">
        <div className="page-header">
          <div>
            <h1>My Reports & Complaints</h1>
            <p>View and track your submitted reports</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Report
          </button>
        </div>

        {/* Stats */}
        {reportsData && (
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
                <p className="stat-value-small">{reportsData.total}</p>
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
                <p className="stat-value-small">{reportsData.pending_count}</p>
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
                <p className="stat-value-small">{reportsData.under_review_count}</p>
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
                <p className="stat-value-small">{reportsData.resolved_count}</p>
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
                <p className="stat-value-small">{reportsData.rejected_count}</p>
                <p className="stat-label-small">Rejected</p>
              </div>
            </div>
          </div>
        )}

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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <p>No reports found</p>
            </div>
          )}
        </div>

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
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{selectedReport.provider?.contact_number || 'N/A'}</span>
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
              </div>
            </div>
          </div>
        )}

        {/* Create Report Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={handleCloseCreateModal}>
            <div className="modal-content create-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create New Report</h3>
                <button className="modal-close" onClick={handleCloseCreateModal}>×</button>
              </div>

              <form onSubmit={handleSubmitReport}>
                <div className="modal-body">
                  {submitError && (
                    <div className="error-message">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {submitError}
                    </div>
                  )}

                  {loadingDropdown ? (
                    <div className="dropdown-loading">
                      <div className="spinner"></div>
                      <p>Loading providers and services...</p>
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label htmlFor="provider_id">
                          Provider <span className="required">*</span>
                        </label>
                        <select
                          id="provider_id"
                          value={formData.provider_id}
                          onChange={(e) => handleFormChange('provider_id', e.target.value)}
                          required
                          disabled={!dropdownData?.providers.length}
                        >
                          <option value="">Select a provider</option>
                          {dropdownData?.providers.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.business_name} - {provider.full_name}
                            </option>
                          ))}
                        </select>
                        <small className="field-hint">Select the provider you want to report</small>
                      </div>

                      <div className="form-group">
                        <label htmlFor="provider_service_id">
                          Service <span className="optional">(Optional)</span>
                        </label>
                        <select
                          id="provider_service_id"
                          value={formData.provider_service_id}
                          onChange={(e) => handleFormChange('provider_service_id', e.target.value)}
                          disabled={!formData.provider_id || getFilteredServices().length === 0}
                        >
                          <option value="">Select a service (optional)</option>
                          {getFilteredServices().map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.service_title} - ₱{service.price_decimal?.toFixed(2) || 'N/A'}
                            </option>
                          ))}
                        </select>
                        <small className="field-hint">
                          {!formData.provider_id
                            ? 'Select a provider first'
                            : getFilteredServices().length === 0
                            ? 'No services available for this provider'
                            : 'If the report is related to a specific service'}
                        </small>
                      </div>

                      <div className="form-group">
                        <label htmlFor="booking_id">
                          Booking <span className="optional">(Optional)</span>
                        </label>
                        <select
                          id="booking_id"
                          value={formData.booking_id}
                          onChange={(e) => handleFormChange('booking_id', e.target.value)}
                          disabled={!formData.provider_id || getFilteredBookings().length === 0}
                        >
                          <option value="">Select a booking (optional)</option>
                          {getFilteredBookings().map((booking) => (
                            <option key={booking.id} value={booking.id}>
                              Booking #{booking.id} - {booking.booking_date} at {booking.booking_time} ({booking.status})
                            </option>
                          ))}
                        </select>
                        <small className="field-hint">
                          {!formData.provider_id
                            ? 'Select a provider first'
                            : getFilteredBookings().length === 0
                            ? 'No bookings available for this provider'
                            : 'If the report is related to a specific booking'}
                        </small>
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label htmlFor="report_type">
                      Report Type <span className="required">*</span>
                    </label>
                    <select
                      id="report_type"
                      value={formData.report_type}
                      onChange={(e) => handleFormChange('report_type', e.target.value)}
                      required
                    >
                      <option value="service_quality">Service Quality</option>
                      <option value="provider_behavior">Provider Behavior</option>
                      <option value="payment_issue">Payment Issue</option>
                      <option value="cancellation">Cancellation</option>
                      <option value="other">Other</option>
                    </select>
                    <small className="field-hint">Select the type of complaint</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">
                      Subject <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleFormChange('subject', e.target.value)}
                      required
                      placeholder="Brief summary of your complaint"
                      maxLength={200}
                    />
                    <small className="field-hint">Brief summary of your complaint (max 200 characters)</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">
                      Description <span className="required">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      required
                      placeholder="Provide detailed information about your complaint..."
                      rows={6}
                    />
                    <small className="field-hint">Provide detailed information about your complaint</small>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseCreateModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default UserReports;
