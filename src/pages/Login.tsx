import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'provider'>('user');
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
      let response;

      if (loginType === 'user') {
        response = await authService.loginUser(credentials);
      } else {
        response = await authService.loginProvider(credentials);
      }

      console.log('📦 [Login] Full response object:', response);
      console.log('📦 [Login] Response keys:', Object.keys(response));
      console.log('✅ [Login] Successfully retrieved bearer token:', response.token || response.accessToken || response.access_token);

      authService.storeAuthData(response);

      // Dispatch custom event for auth state change
      window.dispatchEvent(new Event('authChange'));

      if (loginType === 'provider') {
        navigate('/provider-homepage');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed. Please try again.');
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
    <div className="login-container">
      <h1 className="brand-title">Service Connect</h1>
      <div className="login-card">
        <div className="login-tabs">
          <button 
            type="button"
            className={`tab ${loginType === 'user' ? 'active' : ''}`}
            onClick={() => setLoginType('user')}
          >
            User Login
          </button>
          <button 
            type="button"
            className={`tab ${loginType === 'provider' ? 'active' : ''}`}
            onClick={() => setLoginType('provider')}
          >
            Provider Login
          </button>
        </div>
        
        <h2>Welcome Back</h2>
        <p className="login-subtitle">
          Login as {loginType === 'user' ? 'a customer' : 'a service provider'}
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
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="forgot-password-link" style={{ textAlign: 'right', marginBottom: '15px' }}>
            <Link to="/forgot-password" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : `Login as ${loginType === 'user' ? 'Customer' : 'Provider'}`}
          </button>
        </form>
        
        <div className="register-link">
          <p>Don't have an account?</p>
          <Link to="/register">Sign up here</Link>
        </div>

        <div className="admin-login-link">
          <Link to="/admin-login" className="admin-link">
            Admin Login
          </Link>
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

export default Login;