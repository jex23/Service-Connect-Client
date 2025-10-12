import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderHeader from '../components/ProviderHeader';
import ProviderSidebar from '../components/ProviderSidebar';
import '../components/ProviderLayout.css';
import './ProviderHomepage.css';

interface DashboardStats {
  activeServices: number;
  totalBookings: number;
  revenue: number;
  pendingRequests: number;
}

const ProviderHomepage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeServices: 0,
    totalBookings: 0,
    revenue: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

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

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <div className="loading-text">Loading Dashboard</div>
              <div className="loading-subtext">
                Please wait<span className="loading-dots"></span>
              </div>
            </div>
          </div>
        )}

        <div className="provider-homepage">
          {/* Hero Section */}
          <section className="dashboard-hero">
            <div className="hero-content">
              <h1 className="hero-title">Welcome Back!</h1>
              <p className="hero-subtitle">Here's what's happening with your services today</p>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-label">Active Services</h3>
                  <p className="stat-value">{stats.activeServices}</p>
                  <p className="stat-change positive">Ready to book</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-label">Total Bookings</h3>
                  <p className="stat-value">{stats.totalBookings}</p>
                  <p className="stat-change neutral">All time</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-label">Total Revenue</h3>
                  <p className="stat-value">₱{stats.revenue.toLocaleString()}</p>
                  <p className="stat-change neutral">Lifetime earnings</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-label">Pending Requests</h3>
                  <p className="stat-value">{stats.pendingRequests}</p>
                  <p className="stat-change neutral">Awaiting response</p>
                </div>
              </div>
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
