import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import './Login.css';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState<'user' | 'provider'>('user');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve email and account type from session storage
    const storedEmail = sessionStorage.getItem('reset_email');
    const storedAccountType = sessionStorage.getItem('reset_account_type');

    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (storedAccountType) {
      setAccountType(storedAccountType as 'user' | 'provider');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !otpCode || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        account_type: accountType,
        otp_code: otpCode,
        new_password: newPassword,
      });

      setSuccessMessage(response.message || 'Password reset successful! You can now login with your new password.');
      setIsSuccess(true);
      setShowModal(true);

      // Clear session storage
      sessionStorage.removeItem('reset_email');
      sessionStorage.removeItem('reset_account_type');

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to reset password. Please try again.');
      setIsSuccess(false);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (!isSuccess) {
      setErrorMessage('');
      setSuccessMessage('');
    }
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

        <h2>Reset Password</h2>
        <p className="login-subtitle">
          Enter the OTP sent to your email and create a new password
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
          <div>
            <label htmlFor="otpCode">OTP Code:</label>
            <input
              type="text"
              id="otpCode"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
          </div>
          <div>
            <label htmlFor="newPassword">New Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="register-link">
          <p>Remember your password?</p>
          <Link to="/login">Back to Login</Link>
        </div>

        <div className="register-link" style={{ marginTop: '10px' }}>
          <p>Didn't receive OTP?</p>
          <Link to="/forgot-password">Resend OTP</Link>
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
                  Redirecting to login page...
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

export default ResetPassword;
