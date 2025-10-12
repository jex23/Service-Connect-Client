import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { adminBookingService } from '../service/adminBookingService';
import type { AdminBooking } from '../types/booking';
import '../components/AdminLayout.css';
import './AdminBookingManagement.css';

const AdminBookingManagement: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [adminRole, setAdminRole] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('Pending');

  useEffect(() => {
    // Get admin role
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminRole(payload.role || 'admin');
      } catch (e) {
        console.error('Failed to parse admin token:', e);
      }
    }

    fetchBookings();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminBookingService.getBookings();
      setBookings(data);
      setFilteredBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedBooking(null);
    setNewStatus('Pending');
  };

  const handleStatusUpdate = async () => {
    if (!selectedBooking) return;

    try {
      setUpdatingStatus(selectedBooking.id);
      await adminBookingService.updateBookingStatus(selectedBooking.id, newStatus);

      // Refresh bookings list
      await fetchBookings();

      alert(`Booking status updated to ${newStatus}`);
      handleCloseStatusModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booking status');
      console.error('Error updating booking status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'Pending').length,
      confirmed: bookings.filter(b => b.status === 'Confirmed').length,
      completed: bookings.filter(b => b.status === 'Completed').length,
      cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    };
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading bookings...</p>
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
          <AdminHeader title="Booking Management" showUserInfo={true} />
          <main className="admin-main">
            <div className="error-state">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={fetchBookings} className="btn btn-primary">
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
        <AdminHeader title="Booking Management" showUserInfo={true} />

        <main className="admin-main">
          <div className="page-header">
            <div>
              <h2>All Bookings</h2>
              <p>View and manage all service bookings</p>
            </div>
          </div>

          {/* Stats */}
          <div className="booking-stats">
            <div className="stat-card-small">
              <div className="stat-icon-small total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.total}</p>
                <p className="stat-label-small">Total Bookings</p>
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
              <div className="stat-icon-small confirmed">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.confirmed}</p>
                <p className="stat-label-small">Confirmed</p>
              </div>
            </div>

            <div className="stat-card-small">
              <div className="stat-icon-small completed">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.completed}</p>
                <p className="stat-label-small">Completed</p>
              </div>
            </div>

            <div className="stat-card-small">
              <div className="stat-icon-small cancelled">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.cancelled}</p>
                <p className="stat-label-small">Cancelled</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="booking-filters">
            <div className="filter-group">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>
                      <div className="booking-cell">
                        <div className="booking-info">
                          <span className="booking-name">{booking.user?.full_name || 'N/A'}</span>
                          <span className="booking-email">{booking.user?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="booking-cell">
                        <div className="booking-info">
                          <span className="booking-name">{booking.provider?.business_name || 'N/A'}</span>
                          <span className="booking-email">{booking.provider?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="booking-cell">
                        <div className="booking-info">
                          <span className="booking-name">{booking.service?.service_title || 'N/A'}</span>
                          <span className="booking-price">₱{booking.service?.price_decimal?.toFixed(2) || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="booking-datetime">
                        <span className="booking-date">{booking.booking_date || 'N/A'}</span>
                        <span className="booking-time">{booking.booking_time || 'N/A'}</span>
                        <span className="booking-day">{booking.booking_day}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleOpenStatusModal(booking)}
                          disabled={updatingStatus === booking.id}
                          title="Edit Status"
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

            {filteredBookings.length === 0 && (
              <div className="empty-state">
                <p>No bookings found</p>
              </div>
            )}
          </div>
        </main>

        {/* Status Update Modal */}
        {showStatusModal && selectedBooking && (
          <div className="modal-overlay" onClick={handleCloseStatusModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Update Booking Status</h3>
                <button className="modal-close" onClick={handleCloseStatusModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="booking-info-modal">
                  <div className="booking-details-modal">
                    <p className="booking-id-modal">Booking #{selectedBooking.id}</p>
                    <p className="booking-service-modal">{selectedBooking.service?.service_title}</p>
                    <p className="booking-datetime-modal">
                      {selectedBooking.booking_date} at {selectedBooking.booking_time}
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled')}
                    className="status-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="status-info">
                  <p><strong>Current Status:</strong> <span className={`status-badge ${selectedBooking.status.toLowerCase()}`}>{selectedBooking.status}</span></p>
                  <p><strong>New Status:</strong> <span className={`status-badge ${newStatus.toLowerCase()}`}>{newStatus}</span></p>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseStatusModal}
                  disabled={updatingStatus === selectedBooking.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus === selectedBooking.id || newStatus === selectedBooking.status}
                >
                  {updatingStatus === selectedBooking.id ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingManagement;
