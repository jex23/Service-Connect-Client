import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../service/adminService';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import type { Admin, AdminRegisterData } from '../types/admin';
import '../components/AdminLayout.css';
import './AdminUsers.css';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [formData, setFormData] = useState<AdminRegisterData>({
    full_name: '',
    email: '',
    password: '',
    role: 'admin',
    address: ''
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if current user is superadmin
    setIsSuperadmin(adminService.isSuperadmin());
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

  const handleAddAdmin = () => {
    setShowAddModal(true);
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role: 'admin',
      address: ''
    });
    setErrorMessage(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role: 'admin',
      address: ''
    });
    setErrorMessage(null);
  };

  const handleInputChange = (field: keyof AdminRegisterData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.email || !formData.password) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      await adminService.registerAdmin(formData);

      setSuccessMessage('Admin account created successfully!');
      handleCloseModal();
      fetchAdmins(); // Refresh the list

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create admin account');
    } finally {
      setSaving(false);
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
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {successMessage}
          </div>
        )}

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2>Admin Accounts</h2>
            <p>Manage administrator accounts and permissions</p>
          </div>
          {isSuperadmin && (
            <button onClick={handleAddAdmin} className="btn btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Admin
            </button>
          )}
        </div>

        {/* Admins Table */}
        <div className="table-container">
          <table className="admins-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
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
                  <td>
                    <span className={`role-badge ${admin.role}`}>
                      {admin.role}
                    </span>
                  </td>
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

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Admin</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmitAdmin}>
              <div className="modal-body">
                {errorMessage && (
                  <div className="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {errorMessage}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="full_name">Full Name *</label>
                  <input
                    type="text"
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value as 'admin' | 'superadmin')}
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminUsers;
