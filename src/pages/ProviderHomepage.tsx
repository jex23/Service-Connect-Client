import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderHeader from '../components/ProviderHeader';
import ProviderSidebar from '../components/ProviderSidebar';
import './ProviderHomepage.css';

const ProviderHomepage: React.FC = () => {
  const navigate = useNavigate();

  const handleManageServices = () => {
    navigate('/provider-services');
  };

  const handleViewBookings = () => {
    navigate('/provider-bookings');
  };

  const handleProfileSettings = () => {
    navigate('/provider-profile');
  };

  return (
    <div className="provider-layout">
      <ProviderSidebar />
      <div className="main-content">
        <ProviderHeader />
        <div className="provider-homepage">
          <div className="provider-dashboard">
            <h1>Provider Dashboard</h1>
            <p>Welcome to your provider homepage!</p>

            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Active Services</h3>
                <p className="stat-number">0</p>
              </div>
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p className="stat-number">0</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-number">₱0</p>
              </div>
            </div>

            <div className="dashboard-actions">
              <button className="action-btn primary" onClick={handleManageServices}>
                Manage Services
              </button>
              <button className="action-btn secondary" onClick={handleViewBookings}>
                View Bookings
              </button>
              <button className="action-btn secondary" onClick={handleProfileSettings}>
                Profile Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderHomepage;