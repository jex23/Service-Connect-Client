import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../service/adminService';
import { adminDashboardService } from '../service/adminDashboardService';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import type { Admin } from '../types/admin';
import type { DashboardSummary } from '../types/dashboard';
import '../components/AdminLayout.css';
import './AdminHome.css';

const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminProfile();
    fetchDashboardSummary();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const profile = await adminService.getAdminProfile();
      setAdmin(profile as Admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Failed to fetch admin profile:', err);
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      const summary = await adminDashboardService.getDashboardSummary();
      setDashboardSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard summary');
      console.error('Failed to fetch dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToUsers = () => {
    navigate('/admin-users');
  };

  const navigateToUserManagement = () => {
    navigate('/admin-user-management');
  };

  const navigateToProviderManagement = () => {
    navigate('/admin-provider-management');
  };

  const navigateToServiceManagement = () => {
    navigate('/admin-service-management');
  };

  const navigateToBookingManagement = () => {
    navigate('/admin-booking-management');
  };

  const navigateToCustomerReports = () => {
    navigate('/admin-customer-reports');
  };

  const navigateToSaleManagement = () => {
    navigate('/admin-sale-management');
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error || 'Failed to load admin profile'}</p>
            <button onClick={() => navigate('/admin-login')} className="btn btn-primary">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminHeader title="Dashboard" showUserInfo={true} />

        <main className="admin-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Welcome back, {admin.full_name.split(' ')[0]}!</h2>
          <p>Manage your Service Connect platform from this dashboard</p>
        </section>

        {/* Quick Stats */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Users</h3>
              <p className="stat-value">{dashboardSummary?.users.total_users ?? '-'}</p>
              <span className="stat-label">Total Users</span>
              {dashboardSummary && (
                <div className="stat-breakdown">
                  <small>Active: {dashboardSummary.users.active_users}</small>
                  <small>Pending: {dashboardSummary.users.pending_verification_users}</small>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Providers</h3>
              <p className="stat-value">{dashboardSummary?.providers.total_providers ?? '-'}</p>
              <span className="stat-label">Total Providers</span>
              {dashboardSummary && (
                <div className="stat-breakdown">
                  <small>Active: {dashboardSummary.providers.active_providers}</small>
                  <small>Pending: {dashboardSummary.providers.pending_verification_providers}</small>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Services</h3>
              <p className="stat-value">{dashboardSummary?.services.total_services ?? '-'}</p>
              <span className="stat-label">Total Services</span>
              {dashboardSummary && (
                <div className="stat-breakdown">
                  <small>Active: {dashboardSummary.services.active_services}</small>
                  <small>Inactive: {dashboardSummary.services.inactive_services}</small>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Bookings</h3>
              <p className="stat-value">{dashboardSummary?.bookings.total_bookings ?? '-'}</p>
              <span className="stat-label">Total Bookings</span>
              {dashboardSummary && (
                <div className="stat-breakdown">
                  <small>Confirmed: {dashboardSummary.bookings.confirmed_bookings}</small>
                  <small>Pending: {dashboardSummary.bookings.pending_bookings}</small>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Sales</h3>
              <p className="stat-value">
                {dashboardSummary ? `₱${dashboardSummary.sales.total_sales.toLocaleString()}` : '-'}
              </p>
              <span className="stat-label">Total Revenue</span>
              {dashboardSummary && (
                <div className="stat-breakdown">
                  <small>Paid Bookings: {dashboardSummary.sales.total_paid_bookings}</small>
                  <small>Pending: {dashboardSummary.sales.pending_payments}</small>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
          <h3>Quick Actions</h3>
          <div className="action-cards">
            <div className="action-card" onClick={navigateToUsers}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
                  <path d="M12 8v4"></path>
                  <path d="M12 16h.01"></path>
                </svg>
              </div>
              <h4>Manage Admins</h4>
              <p>View and manage admin accounts</p>
            </div>

            <div className="action-card" onClick={navigateToUserManagement}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h4>User Management</h4>
              <p>Manage user accounts and permissions</p>
            </div>

            <div className="action-card" onClick={navigateToProviderManagement}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h4>Provider Management</h4>
              <p>Manage service providers</p>
            </div>

            <div className="action-card" onClick={navigateToServiceManagement}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <h4>Service Management</h4>
              <p>Manage services and categories</p>
            </div>

            <div className="action-card" onClick={navigateToBookingManagement}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h4>Booking Management</h4>
              <p>View and manage all bookings</p>
            </div>

            <div className="action-card" onClick={navigateToCustomerReports}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18"></path>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                </svg>
              </div>
              <h4>Customer Reports</h4>
              <p>View customer reports and analytics</p>
            </div>

            <div className="action-card" onClick={navigateToSaleManagement}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h4>Sales Management</h4>
              <p>View sales data and revenue reports</p>
            </div>
          </div>
        </section>

        {/* Admin Info */}
        <section className="info-section">
          <h3>Your Profile</h3>
          <div className="info-card">
            <div className="info-row">
              <label>Full Name:</label>
              <span>{admin.full_name}</span>
            </div>
            <div className="info-row">
              <label>Email:</label>
              <span>{admin.email}</span>
            </div>
            <div className="info-row">
              <label>Role:</label>
              <span className="role-badge">{admin.role}</span>
            </div>
            {admin.address && (
              <div className="info-row">
                <label>Address:</label>
                <span>{admin.address}</span>
              </div>
            )}
            <div className="info-row">
              <label>Last Login:</label>
              <span>{admin.last_login ? new Date(admin.last_login).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="info-row">
              <label>Account Created:</label>
              <span>{new Date(admin.date_created).toLocaleDateString()}</span>
            </div>
          </div>
        </section>
      </main>
      </div>
    </div>
  );
};

export default AdminHome;
