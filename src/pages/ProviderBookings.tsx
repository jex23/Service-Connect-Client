import React, { useState, useEffect } from 'react';
import ProviderHeader from '../components/ProviderHeader';
import ProviderSidebar from '../components/ProviderSidebar';
import { providerBookingService } from '../service/providerBookingService';
import { authService } from '../service/authService';
import type { ProviderBooking, ProviderBookingFilters } from '../types/providerBooking';
import '../components/ProviderLayout.css';
import './ProviderBookings.css';

const ProviderBookings: React.FC = () => {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProviderBookingFilters>({
    page: 1,
    limit: 10,
    sort_by: 'booking_date',
    sort_order: 'desc'
  });
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await providerBookingService.getProviderBookings();
      console.log('API Response:', response.bookings);
      setBookings(response.bookings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };


  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      await providerBookingService.updateProviderBooking(bookingId, { status: newStatus as any });
      fetchBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booking status');
    }
  };

  const handlePaymentStatusUpdate = async (bookingId: number, newPaymentStatus: string) => {
    try {
      await providerBookingService.updateProviderBooking(bookingId, {
        payment_status: newPaymentStatus as any
      });
      fetchBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update payment status');
    }
  };

  const handleFilterChange = (key: keyof ProviderBookingFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'string' ? parseInt(value) : value) // Reset to page 1 when filters change
    }));
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedBookings.length === 0) {
      alert('Please select bookings to update');
      return;
    }

    try {
      // Update each booking individually since bulk update endpoint may not be available
      for (const bookingId of selectedBookings) {
        await providerBookingService.updateProviderBooking(bookingId, { status: status as any });
      }
      setSelectedBookings([]);
      fetchBookings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update bookings');
    }
  };

  const toggleBookingSelection = (bookingId: number) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) {
      return '-';
    }
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': '#f59e0b',
      'Confirmed': '#3b82f6',
      'Completed': '#10b981',
      'Cancelled': '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'Pending': '#f59e0b',
      'Paid': '#10b981',
      'Failed': '#ef4444',
      'Cancelled': '#ef4444',
      'Refunded': '#6b7280'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="provider-layout">
        <ProviderSidebar />
        <div className="main-content">
          <ProviderHeader />

          {/* Full Page Loading Overlay */}
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <div className="loading-text">Loading Bookings</div>
              <div className="loading-subtext">
                Please wait<span className="loading-dots"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-layout">
      <ProviderSidebar />
      <div className="main-content">
        <ProviderHeader />
        <div className="provider-bookings">
          <div className="bookings-header">
            <div className="header-left">
              <h1>Bookings Management</h1>
              <p>Manage your customer bookings and appointments</p>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filters
              </button>
            </div>
          </div>


          {/* Filters */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Payment Status</label>
                  <select
                    value={filters.payment_status || ''}
                    onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                  >
                    <option value="">All Payment Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Date From</label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Date To</label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Search</label>
                  <input
                    type="text"
                    placeholder="Search by customer name or service..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedBookings.length > 0 && (
            <div className="bulk-actions">
              <span>{selectedBookings.length} booking(s) selected</span>
              <div className="bulk-buttons">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleBulkStatusUpdate('Confirmed')}
                >
                  Confirm Selected
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleBulkStatusUpdate('Rejected')}
                >
                  Reject Selected
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchBookings} className="btn btn-outline">
                Try Again
              </button>
            </div>
          )}

          {!error && (
            <div className="bookings-content">
              {bookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </div>
                  <h3>No bookings found</h3>
                  <p>You don't have any bookings yet or they don't match your current filters</p>
                </div>
              ) : (
                <div className="bookings-table">
                  <div className="table-header">
                    <div className="header-cell checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedBookings.length === bookings.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookings(bookings.map(b => b.id));
                          } else {
                            setSelectedBookings([]);
                          }
                        }}
                      />
                    </div>
                    <div className="header-cell">Customer</div>
                    <div className="header-cell">Service</div>
                    <div className="header-cell">Date & Time</div>
                    <div className="header-cell">Amount</div>
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Payment</div>
                    <div className="header-cell">Actions</div>
                  </div>

                  {bookings.map((booking) => (
                    <div key={booking.id} className="table-row">
                      <div className="table-cell checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={() => toggleBookingSelection(booking.id)}
                        />
                      </div>
                      <div className="table-cell">
                        <div className="customer-info">
                          <div className="customer-name">{booking.user_name}</div>
                          <div className="customer-email">{booking.user_email}</div>
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="service-info">
                          <div className="service-title">{booking.service_title}</div>
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="datetime-info">
                          <div className="booking-date">{formatDate(booking.booking_date)}</div>
                          <div className="booking-time">{formatTime(booking.booking_time)}</div>
                        </div>
                      </div>
                      <div className="table-cell">
                        <div className="amount">{formatCurrency(booking.price_decimal)}</div>
                      </div>
                      <div className="table-cell">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="table-cell">
                        {booking.payment_status ? (
                          <span
                            className="payment-badge"
                            style={{ backgroundColor: getPaymentStatusColor(booking.payment_status) }}
                            title={booking.payment_description || undefined}
                          >
                            {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                          </span>
                        ) : (
                          <span className="payment-badge" style={{ backgroundColor: '#6b7280' }}>
                            N/A
                          </span>
                        )}
                      </div>
                      <div className="table-cell">
                        <div className="booking-actions">
                          <div className="action-dropdowns">
                            <div className="dropdown-group">
                              <label className="dropdown-label">Status:</label>
                              <select
                                className="status-select"
                                value={booking.status}
                                onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>

                            <div className="dropdown-group">
                              <label className="dropdown-label">Payment:</label>
                              <select
                                className="payment-select"
                                value={booking.payment_status || 'Pending'}
                                onChange={(e) => handlePaymentStatusUpdate(booking.id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Failed">Failed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Refunded">Refunded</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderBookings;