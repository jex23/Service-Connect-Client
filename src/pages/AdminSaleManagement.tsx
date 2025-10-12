import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import '../components/AdminLayout.css';
import './AdminUserManagement.css';

const AdminSaleManagement: React.FC = () => {
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
        <AdminHeader title="Sales Management" showUserInfo={true} />

        <main className="admin-main">
        <div className="page-header">
          <div>
            <h2>Sales & Revenue</h2>
            <p>View and manage sales data and revenue reports</p>
          </div>
        </div>

        <div className="coming-soon">
          <div className="coming-soon-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h3>Coming Soon</h3>
          <p>Sales management features are under development</p>
        </div>
      </main>
      </div>
    </div>
  );
};

export default AdminSaleManagement;
