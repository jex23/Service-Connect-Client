import React, { useEffect, useState } from 'react';
import { userBookingService } from '../service/userBookingService';
import type { UserBooking, UserBookingFilters } from '../types/userBooking';
import './UserBooking.css';

const UserBooking: React.FC = () => {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    pending_count: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [cancellationModal, setCancellationModal] = useState<{
    isOpen: boolean;
    booking: UserBooking | null;
    reason: string;
  }>({
    isOpen: false,
    booking: null,
    reason: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const filters: UserBookingFilters = {
        limit: 50
      };

      if (selectedStatus && selectedStatus !== 'All') {
        filters.status = selectedStatus as any;
      }

      const response = await userBookingService.getUserBookings(filters);
      console.log('API Response:', response);
      console.log('Bookings data:', response.bookings);
      setBookings(response.bookings);

      // Set stats from the response
      setStats({
        total: response.total,
        pending_count: response.pending_count,
        confirmed_count: response.confirmed_count,
        completed_count: response.completed_count,
        cancelled_count: response.cancelled_count
      });
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellationModal.booking) return;

    try {
      await userBookingService.updateBookingStatus({
        booking_id: cancellationModal.booking.id,
        status: 'Cancelled'
      });
      setCancellationModal({ isOpen: false, booking: null, reason: '' });
      fetchBookings();
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6366f1';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return `₱${price.toFixed(2)}`;
  };

  const statusOptions = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

  return (
    <div className="user-booking-container">
      <div className="booking-header">
        <h1>My Bookings</h1>
        <p>Manage your service bookings</p>
      </div>

      {stats && (
        <div className="booking-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pending_count}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.confirmed_count}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completed_count}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      )}

      <div className="booking-filters">
        <div className="filter-section">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="status-select"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="booking-results">
        {loading ? (
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Provider</th>
                  <th>Date & Time</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Booked On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="skeleton-row">
                    <td><div className="skeleton-cell skeleton-service"></div></td>
                    <td><div className="skeleton-cell skeleton-provider"></div></td>
                    <td><div className="skeleton-cell skeleton-datetime"></div></td>
                    <td><div className="skeleton-cell skeleton-price"></div></td>
                    <td><div className="skeleton-cell skeleton-duration"></div></td>
                    <td><div className="skeleton-cell skeleton-status"></div></td>
                    <td><div className="skeleton-cell skeleton-payment"></div></td>
                    <td><div className="skeleton-cell skeleton-booked"></div></td>
                    <td><div className="skeleton-cell skeleton-actions"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No bookings found</h3>
            <p>You haven't made any bookings yet or no bookings match your filter.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Provider</th>
                  <th>Date & Time</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Booked On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  console.log('Booking data:', booking);
                  console.log('Provider data:', booking.provider);
                  console.log('Service data:', booking.service);
                  return (
                    <tr key={booking.id}>
                      <td>
                        <div className="service-cell">
                          <div className="service-title">{booking.service?.service_title || 'Unknown Service'}</div>
                          <div className="service-description">{booking.service?.service_description || 'No description'}</div>
                        </div>
                      </td>
                      <td className="provider-cell">
                        {booking.provider?.business_name || booking.provider?.full_name || 'Unknown Provider'}
                      </td>
                      <td>
                        <div className="datetime-cell">
                          <div className="date-value">{formatDate(booking.booking_date)}</div>
                          <div className="time-value">{booking.booking_time}</div>
                        </div>
                      </td>
                      <td className="price-cell">{formatPrice(booking.service?.price_decimal)}</td>
                      <td className="duration-cell">
                        {booking.service?.duration_minutes ? `${booking.service.duration_minutes} min` : '-'}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.payment_status ? (
                          <span
                            className="payment-badge"
                            style={{ color: booking.payment_status.status === 'Paid' ? '#10b981' : '#f59e0b' }}
                          >
                            {booking.payment_status.status}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="booked-date-cell">{formatDate(booking.created_at)}</td>
                      <td className="actions-cell">
                        {booking.status === 'Pending' && (
                          <button
                            onClick={() => setCancellationModal({
                              isOpen: true,
                              booking,
                              reason: ''
                            })}
                            className="cancel-btn-table"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {cancellationModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel this booking for "{cancellationModal.booking?.service?.service_title || 'this service'}"?</p>

            <div className="form-group">
              <label htmlFor="cancellation-reason">Reason for cancellation (optional):</label>
              <textarea
                id="cancellation-reason"
                value={cancellationModal.reason}
                onChange={(e) => setCancellationModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide a reason for cancellation..."
                rows={4}
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setCancellationModal({ isOpen: false, booking: null, reason: '' })}
                className="secondary-btn"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="danger-btn"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBooking;