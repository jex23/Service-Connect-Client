import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { adminUserService } from '../service/adminUserService';
import type { User } from '../types/user';
import '../components/AdminLayout.css';
import './AdminUserManagement.css';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [adminRole, setAdminRole] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'suspended'>('active');

  useEffect(() => {
    // Get admin role
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminRole(payload.role || 'admin');
      } catch (e) {
        console.error('Failed to parse admin token:', e);
      }
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...users];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminUserService.getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (user: User) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedUser(null);
    setNewStatus('active');
  };

  const handleStatusUpdate = async () => {
    if (!selectedUser) return;

    // Check permissions
    if (adminRole === 'moderator' && newStatus !== 'inactive') {
      alert('Moderators can only set status to inactive');
      return;
    }

    if (adminRole === 'admin' && newStatus === 'suspended') {
      alert('Only superadmins can suspend users');
      return;
    }

    try {
      setUpdatingStatus(selectedUser.id);
      await adminUserService.updateUserStatus(selectedUser.id, newStatus);

      // Refresh users list
      await fetchUsers();

      alert(`User status updated to ${newStatus}`);
      handleCloseStatusModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user status');
      console.error('Error updating user status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
    };
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
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
          <AdminHeader title="User Management" showUserInfo={true} />
          <main className="admin-main">
            <div className="error-state">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={fetchUsers} className="btn btn-primary">
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminHeader title="User Management" showUserInfo={true} />

        <main className="admin-main">
          <div className="page-header">
            <div>
              <h2>Customer Accounts</h2>
              <p>Manage customer accounts and status</p>
            </div>
          </div>

          {/* Stats */}
          <div className="user-stats">
            <div className="stat-card-small">
              <div className="stat-icon-small total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.total}</p>
                <p className="stat-label-small">Total Users</p>
              </div>
            </div>

            <div className="stat-card-small">
              <div className="stat-icon-small active">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.active}</p>
                <p className="stat-label-small">Active</p>
              </div>
            </div>

            <div className="stat-card-small">
              <div className="stat-icon-small inactive">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.inactive}</p>
                <p className="stat-label-small">Inactive</p>
              </div>
            </div>

            <div className="stat-card-small">
              <div className="stat-icon-small suspended">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.suspended}</p>
                <p className="stat-label-small">Suspended</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="user-filters">
            <div className="filter-group">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{user.full_name}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.address || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleOpenStatusModal(user)}
                          disabled={updatingStatus === user.id}
                          title="Edit Status"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <p>No users found</p>
              </div>
            )}
          </div>
        </main>

        {/* Status Update Modal */}
        {showStatusModal && selectedUser && (
          <div className="modal-overlay" onClick={handleCloseStatusModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Update User Status</h3>
                <button className="modal-close" onClick={handleCloseStatusModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="user-info-modal">
                  <div className="user-avatar">
                    {selectedUser.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="user-name-modal">{selectedUser.full_name}</p>
                    <p className="user-email-modal">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'active' | 'inactive' | 'suspended')}
                    className="status-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    {(adminRole === 'superadmin') && (
                      <option value="suspended">Suspended</option>
                    )}
                  </select>
                </div>

                <div className="status-info">
                  <p><strong>Current Status:</strong> <span className={`status-badge ${selectedUser.status}`}>{selectedUser.status}</span></p>
                  <p><strong>New Status:</strong> <span className={`status-badge ${newStatus}`}>{newStatus}</span></p>
                </div>

                {adminRole === 'moderator' && newStatus !== 'inactive' && (
                  <div className="alert alert-warning">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Moderators can only set status to inactive
                  </div>
                )}

                {adminRole === 'admin' && newStatus === 'suspended' && (
                  <div className="alert alert-warning">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Only superadmins can suspend users
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseStatusModal}
                  disabled={updatingStatus === selectedUser.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus === selectedUser.id || newStatus === selectedUser.status}
                >
                  {updatingStatus === selectedUser.id ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
