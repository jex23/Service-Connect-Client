import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import './ProviderHeader.css';

const ProviderHeader: React.FC = () => {
  const navigate = useNavigate();
  const provider = authService.getStoredUser();
  const userType = authService.getStoredUserType();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setDropdownOpen(false);
  };

  const confirmLogout = () => {
    authService.logout();
    setShowLogoutModal(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const getProviderDisplayName = () => {
    if (!provider) return 'Provider';
    return provider.business_name || provider.full_name || 'Provider';
  };

  // Click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.provider-user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
    <header className="provider-header">
      <div className="provider-header-container">
        <Link to="/provider-homepage" className="provider-header-logo">
          Service Connect
        </Link>

        <div className="provider-header-center">
        </div>

        <nav className="provider-header-nav">
          <div className="provider-user-dropdown">
            <button
              className="provider-user-dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="provider-user-greeting">
                Welcome, {getProviderDisplayName()}
              </span>
              <svg
                className={`provider-dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
              </svg>
            </button>

            {dropdownOpen && (
              <div className="provider-dropdown-menu">
                <button
                  onClick={handleLogoutClick}
                  className="provider-dropdown-item provider-logout-item"
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
          <button className="provider-chat-icon-btn" onClick={() => navigate('/provider-chat')}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
            </svg>
          </button>
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

export default ProviderHeader;
