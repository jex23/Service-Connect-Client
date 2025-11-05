import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import type { User, Provider } from '../types/auth';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | Provider | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = authService.isAuthenticated();
      const user = authService.getStoredUser();
      const type = authService.getStoredUserType();

      setIsAuthenticated(authenticated);
      setCurrentUser(user);
      setUserType(type);
    };

    checkAuthStatus();

    // Listen for storage changes to update auth state
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab auth changes
    window.addEventListener('authChange', handleStorageChange);

    // Click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setDropdownOpen(false);
  };

  const confirmLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserType(null);
    setShowLogoutModal(false);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const getUserDisplayName = () => {
    if (!currentUser) return '';

    if (userType === 'provider') {
      const provider = currentUser as Provider;
      return provider.business_name || provider.full_name;
    } else {
      const user = currentUser as User;
      return user.full_name;
    }
  };

  return (
    <>
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          Service Connect
        </Link>

        <div className="header-center">
        </div>

        <nav className="header-nav">
          {isAuthenticated && currentUser ? (
            <>
              <div className="user-dropdown">
              <button
                className="user-dropdown-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="user-greeting">
                  Welcome, {getUserDisplayName()}
                </span>
                <svg
                  className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link
                    to="/"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>
                      <path d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
                    </svg>
                    Home
                  </Link>
                  {userType === 'user' && (
                    <>
                      <Link
                        to="/user-chat"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                        </svg>
                        Messages
                      </Link>
                      <Link
                        to="/user-reports"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M14 2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM5 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5Zm5 3a.5.5 0 0 1 .5.5V5h1.5a.5.5 0 0 1 0 1H10.5v1.5a.5.5 0 0 1-1 0V6H8a.5.5 0 0 1 0-1h1.5V3.5A.5.5 0 0 1 10 3Z"/>
                        </svg>
                        My Reports
                      </Link>
                    </>
                  )}
                  <Link
                    to="/user-booking"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                    </svg>
                    My Bookings
                  </Link>
                  <Link
                    to="/user-profile"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    My Profile
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button
                    onClick={handleLogoutClick}
                    className="dropdown-item logout-item"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
              </div>
              {userType === 'user' && (
                <button className="chat-icon-btn" onClick={() => navigate('/user-chat')}>
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                  </svg>
                </button>
              )}
            </>
          ) : (
            <div className="auth-buttons">
              <button
                onClick={handleLogin}
                className="header-btn login-btn"
              >
                Login
              </button>
              <Link to="/register" className="header-btn register-btn">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>

    {/* Logout Confirmation Modal */}
    {showLogoutModal && (
      <div className="modal-overlay" onClick={cancelLogout}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Confirm Logout</h3>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to logout?</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={cancelLogout}>
              No
            </button>
            <button className="btn btn-primary" onClick={confirmLogout}>
              Yes
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;