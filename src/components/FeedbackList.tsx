import React, { useEffect, useState } from 'react';
import { feedbackService } from '../service/feedbackService';
import type { ServiceFeedbacksResponse, ServiceFeedbackItem, RatingDistribution } from '../types/feedback';
import './FeedbackList.css';

interface FeedbackListProps {
  serviceId: number;
  refreshTrigger?: number; // Can be used to trigger refresh from parent
}

const FeedbackList: React.FC<FeedbackListProps> = ({ serviceId, refreshTrigger }) => {
  const [feedbackData, setFeedbackData] = useState<ServiceFeedbacksResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, [serviceId, refreshTrigger]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feedbackService.getServiceFeedback(serviceId);
      setFeedbackData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
      setFeedbackData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderRatingDistribution = (distribution: RatingDistribution, total: number) => {
    const ratings = [5, 4, 3, 2, 1];
    return (
      <div className="rating-distribution">
        {ratings.map((rating) => {
          const count = distribution[rating as keyof RatingDistribution] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={rating} className="rating-bar-row">
              <span className="rating-number">{rating} ★</span>
              <div className="rating-bar-container">
                <div
                  className="rating-bar-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="rating-count">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="feedback-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-list-container">
        <div className="error-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!feedbackData || feedbackData.feedbacks.length === 0) {
    return (
      <div className="feedback-list-container">
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3>No Feedback Yet</h3>
          <p>Be the first to share your experience with this provider!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-list-container">
      {/* Overall Rating Summary */}
      <div className="feedback-summary">
        <div className="average-rating-section">
          <div className="average-rating-large">
            <span className="rating-number-large">{feedbackData.average_rating.toFixed(1)}</span>
            <div className="stars-large">{renderStars(Math.round(feedbackData.average_rating))}</div>
            <span className="total-reviews">{feedbackData.total} {feedbackData.total === 1 ? 'review' : 'reviews'}</span>
          </div>
          <div className="rating-distribution-section">
            {renderRatingDistribution(feedbackData.rating_distribution, feedbackData.total)}
          </div>
        </div>
      </div>

      {/* Individual Feedback Items */}
      <div className="feedback-list">
        <h3>Customer Reviews</h3>
        {feedbackData.feedbacks.map((feedback: ServiceFeedbackItem) => (
          <div key={feedback.id} className="feedback-item">
            <div className="feedback-header">
              <div className="feedback-user-info">
                <div className="user-avatar">
                  {feedback.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="user-name">{feedback.user_name}</div>
                  <div className="feedback-date">{formatDate(feedback.created_at)}</div>
                </div>
              </div>
              <div className="feedback-rating">
                {renderStars(feedback.rating)}
              </div>
            </div>

            {feedback.booking_date && (
              <div className="feedback-service">
                Booking Date: <strong>{formatDate(feedback.booking_date)}</strong>
              </div>
            )}

            {feedback.comment && (
              <div className="feedback-comment">
                {feedback.comment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;
