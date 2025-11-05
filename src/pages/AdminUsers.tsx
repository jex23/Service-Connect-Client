import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../service/adminService';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import type { Admin } from '../types/admin';
import '../components/AdminLayout.css';
import './AdminUsers.css';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const adminList = await adminService.getAdminList();
      setAdmins(adminList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading admins...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/admin-home')} className="btn btn-primary">
              Back to Dashboard
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
        <AdminHeader title="Admin Management" showUserInfo={true} />

        <main className="admin-main">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2>Admin Accounts</h2>
            <p>Manage administrator accounts and permissions</p>
          </div>
        </div>

        {/* Admins Table */}
        <div className="table-container">
          <table className="admins-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.admin_id}>
                  <td>{admin.admin_id}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {admin.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">{admin.full_name}</span>
                    </div>
                  </td>
                  <td>{admin.email}</td>
                  <td>{admin.address || 'N/A'}</td>
                  <td>{admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}</td>
                  <td>
                    <span className={`status-badge ${admin.is_active ? 'active' : 'inactive'}`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(admin.date_created).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {admins.length === 0 && (
            <div className="empty-state">
              <p>No admin accounts found</p>
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default AdminUsers;
