import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderHeader from '../components/ProviderHeader';
import ProviderSidebar from '../components/ProviderSidebar';
import '../components/ProviderLayout.css';
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
          {/* Hero Section */}
          <section className="dashboard-hero">
            <div className="hero-content">
              <h1 className="hero-title">Welcome Back!</h1>
              <p className="hero-subtitle">Here's what's happening with your services today</p>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="actions-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Manage your services and bookings</p>
            </div>

            <div className="actions-grid">
              <button className="action-card primary" onClick={handleManageServices}>
                <div className="action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="action-content">
                  <h3>Manage Services</h3>
                  <p>Add, edit or remove your services</p>
                </div>
              </button>

              <button className="action-card secondary" onClick={handleViewBookings}>
                <div className="action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="action-content">
                  <h3>View Bookings</h3>
                  <p>Check upcoming appointments</p>
                </div>
              </button>

              <button className="action-card secondary" onClick={handleProfileSettings}>
                <div className="action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="action-content">
                  <h3>Profile Settings</h3>
                  <p>Update your business information</p>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProviderHomepage;
