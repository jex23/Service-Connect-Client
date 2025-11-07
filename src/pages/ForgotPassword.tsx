import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import './Login.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<'user' | 'provider'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage('Please enter your email address');
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword({
        email,
        account_type: accountType,
      });

      setSuccessMessage(response.message || 'Password reset OTP has been sent to your email');
      setIsSuccess(true);
      setShowModal(true);

      // Store email and account type for the reset password page
      sessionStorage.setItem('reset_email', email);
      sessionStorage.setItem('reset_account_type', accountType);

      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send OTP. Please try again.');
      setIsSuccess(false);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="login-container">
      <h1 className="brand-title">Service Connect</h1>
      <div className="login-card">
        <div className="login-tabs">
          <button
            type="button"
            className={`tab ${accountType === 'user' ? 'active' : ''}`}
            onClick={() => setAccountType('user')}
          >
            User Account
          </button>
          <button
            type="button"
            className={`tab ${accountType === 'provider' ? 'active' : ''}`}
            onClick={() => setAccountType('provider')}
          >
            Provider Account
          </button>
        </div>

        <h2>Forgot Password</h2>
        <p className="login-subtitle">
          Enter your email to receive a password reset OTP
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
          </button>
        </form>

        <div className="register-link">
          <p>Remember your password?</p>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>

      {/* Success/Error Modal */}
      {showModal && (
        <div className="error-modal-overlay" onClick={closeModal}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-header">
              <h3>{isSuccess ? 'Success' : 'Error'}</h3>
              <button className="close-modal-btn" onClick={closeModal}>×</button>
            </div>
            <div className="error-modal-content">
              <div className="error-icon">{isSuccess ? '✓' : '⚠️'}</div>
              <p className="error-message">
                {isSuccess ? successMessage : errorMessage}
              </p>
              {isSuccess && (
                <p className="error-message" style={{ fontSize: '14px', marginTop: '10px' }}>
                  Redirecting to reset password page...
                </p>
              )}
            </div>
            <div className="error-modal-actions">
              <button className="error-modal-btn" onClick={closeModal}>
                {isSuccess ? 'OK' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
