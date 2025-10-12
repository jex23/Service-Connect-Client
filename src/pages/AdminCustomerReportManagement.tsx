import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import '../components/AdminLayout.css';
import './AdminCustomerReportManagement.css';

const AdminCustomerReportManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

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

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminHeader title="Customer Reports" showUserInfo={true} />

        <main className="admin-main">
        <div className="page-header">
          <div>
            <h2>Customer Reports & Analytics</h2>
            <p>View customer reports and analytics data</p>
          </div>
        </div>

        <div className="coming-soon">
          <div className="coming-soon-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"></path>
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
            </svg>
          </div>
          <h3>Coming Soon</h3>
          <p>Customer report features are under development</p>
        </div>
      </main>
      </div>
    </div>
  );
};

export default AdminCustomerReportManagement;
