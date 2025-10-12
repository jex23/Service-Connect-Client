import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../service/adminService';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const credentials = { email, password };
      const response = await adminService.loginAdmin(credentials);

      // Store admin auth data
      adminService.storeAdminAuthData(response);

      // Dispatch custom event for auth state change
      window.dispatchEvent(new Event('authChange'));

      // Navigate to admin home
      navigate('/admin-home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Admin login failed. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  return (
    <div className="admin-login-container">
      <h1 className="admin-brand-title">Service Connect</h1>
      <div className="admin-login-card">
        <div className="admin-header">
          <div className="admin-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
            <span>Admin Access</span>
          </div>
        </div>

        <h2>Administrator Login</h2>
        <p className="admin-subtitle">
          Secure access for system administrators
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
              placeholder="Enter admin email"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter admin password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login as Administrator'}
          </button>
        </form>

        <div className="back-link">
          <Link to="/login">← Back to User Login</Link>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="error-modal-overlay" onClick={closeErrorModal}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-header">
              <h3>Login Failed</h3>
              <button className="close-modal-btn" onClick={closeErrorModal}>×</button>
            </div>
            <div className="error-modal-content">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{errorMessage}</p>
            </div>
            <div className="error-modal-actions">
              <button className="error-modal-btn" onClick={closeErrorModal}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
