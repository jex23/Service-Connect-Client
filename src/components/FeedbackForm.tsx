import React, { useState, useEffect } from 'react';
import { feedbackService } from '../service/feedbackService';
import { authService } from '../service/authService';
import type { CreateFeedbackRequest, CompletedBookingForFeedback } from '../types/feedback';
import './FeedbackForm.css';

interface FeedbackFormProps {
  providerId: number;
  providerServiceId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  providerId,
  providerServiceId,
  onSuccess,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [completedBookings, setCompletedBookings] = useState<CompletedBookingForFeedback[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  useEffect(() => {
    fetchCompletedBookings();
  }, [providerServiceId]);

  const fetchCompletedBookings = async () => {
    try {
      setLoadingBookings(true);
      setError(null);
      const bookingsResponse = await feedbackService.getCompletedBookingsForService(providerServiceId);

      console.log('Completed bookings response:', bookingsResponse);
      console.log('Can give feedback:', bookingsResponse.can_give_feedback);
      console.log('Has completed booking:', bookingsResponse.has_completed_booking);

      // Filter bookings that don't have feedback yet
      const bookingsWithoutFeedback = bookingsResponse.bookings.filter(
        (booking) => !booking.has_feedback
      );

      console.log('Bookings without feedback:', bookingsWithoutFeedback);

      setCompletedBookings(bookingsWithoutFeedback);

      // Auto-select if only one booking
      if (bookingsWithoutFeedback.length === 1) {
        setSelectedBookingId(bookingsWithoutFeedback[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Unable to load your bookings. Please try again.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBookingId) {
      setError('Please select a booking to provide feedback for');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const feedbackData: CreateFeedbackRequest = {
        provider_id: providerId,
        provider_service_id: providerServiceId,
        booking_id: selectedBookingId,
        rating: rating,
        comment: comment.trim() || undefined
      };

      await feedbackService.createFeedback(feedbackData);
      setSuccess(true);

      // Reset form
      setRating(0);
      setComment('');
      setSelectedBookingId(null);

      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-btn ${i <= (hoverRating || rating) ? 'filled' : ''}`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  if (loadingBookings) {
    return (
      <div className="feedback-form-container">
        <div className="loading-state">Loading your bookings...</div>
      </div>
    );
  }

  if (completedBookings.length === 0) {
    return (
      <div className="feedback-form-container">
        <div className="no-bookings-state">
          <p>You don't have any completed bookings for this service that are eligible for feedback.</p>
          <p>Possible reasons:</p>
          <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
            <li>No completed bookings for this service yet</li>
            <li>You've already submitted feedback for all your completed bookings</li>
            <li>Your bookings are still pending or confirmed (not completed)</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Check the browser console for details.</p>
          {onCancel && (
            <button onClick={onCancel} className="btn-secondary">
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="feedback-form-container">
        <div className="success-state">
          <svg className="success-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3>Feedback Submitted Successfully!</h3>
          <p>Thank you for your feedback. It helps improve our services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-form-container">
      <form onSubmit={handleSubmit} className="feedback-form">
        <h3>Share Your Experience</h3>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {/* Booking Selection */}
        {completedBookings.length > 1 && (
          <div className="form-group">
            <label htmlFor="booking-select">
              Select Booking <span className="required">*</span>
            </label>
            <select
              id="booking-select"
              value={selectedBookingId || ''}
              onChange={(e) => setSelectedBookingId(Number(e.target.value))}
              required
            >
              <option value="">-- Select a completed booking --</option>
              {completedBookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.service_title} - {booking.booking_date} at {booking.booking_time}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rating */}
        <div className="form-group">
          <label>
            Rating <span className="required">*</span>
          </label>
          <div className="star-rating">
            {renderStars()}
          </div>
          {rating > 0 && (
            <div className="rating-label">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </div>
          )}
        </div>

        {/* Comment */}
        <div className="form-group">
          <label htmlFor="comment">
            Comments (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share more details about your experience..."
            rows={5}
            maxLength={1000}
          />
          <div className="char-count">
            {comment.length} / 1000 characters
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || rating === 0 || !selectedBookingId}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
