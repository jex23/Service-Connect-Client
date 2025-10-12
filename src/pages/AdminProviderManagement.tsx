import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { adminProviderService } from '../service/adminProviderService';
import type { Provider } from '../types/provider';
import '../components/AdminLayout.css';
import './AdminProviderManagement.css';

const AdminProviderManagement: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [adminRole, setAdminRole] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
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

    fetchProviders();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...providers];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (isActiveFilter !== 'all') {
      const isActive = isActiveFilter === 'true';
      filtered = filtered.filter(p => p.is_active === isActive);
    }

    setFilteredProviders(filtered);
  }, [providers, statusFilter, isActiveFilter]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminProviderService.getProviders();
      setProviders(data);
      setFilteredProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setNewStatus(provider.status);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedProvider(null);
    setNewStatus('active');
  };

  const handleStatusUpdate = async () => {
    if (!selectedProvider) return;

    // Check permissions
    if (adminRole === 'moderator' && newStatus !== 'inactive') {
      alert('Moderators can only set status to inactive');
      return;
    }

    if (adminRole === 'admin' && newStatus === 'suspended') {
      alert('Only superadmins can suspend providers');
      return;
    }

    try {
      setUpdatingStatus(selectedProvider.id);
      await adminProviderService.updateProviderStatus(selectedProvider.id, newStatus);

      // Refresh providers list
      await fetchProviders();

      alert(`Provider status updated to ${newStatus}`);
      handleCloseStatusModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update provider status');
      console.error('Error updating provider status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStats = () => {
    return {
      total: providers.length,
      active: providers.filter(p => p.status === 'active').length,
      inactive: providers.filter(p => p.status === 'inactive').length,
      suspended: providers.filter(p => p.status === 'suspended').length,
    };
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading providers...</p>
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
          <AdminHeader title="Provider Management" showUserInfo={true} />
          <main className="admin-main">
            <div className="error-state">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={fetchProviders} className="btn btn-primary">
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
        <AdminHeader title="Provider Management" showUserInfo={true} />

        <main className="admin-main">
          <div className="page-header">
            <div>
              <h2>Service Providers</h2>
              <p>Manage provider accounts and approvals</p>
            </div>
          </div>

          {/* Stats */}
          <div className="provider-stats">
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
                <p className="stat-label-small">Total Providers</p>
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
          <div className="provider-filters">
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

            <div className="filter-group">
              <label htmlFor="active-filter">Account Status</label>
              <select
                id="active-filter"
                value={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.value)}
              >
                <option value="all">All Accounts</option>
                <option value="true">Active Accounts</option>
                <option value="false">Inactive Accounts</option>
              </select>
            </div>
          </div>

          {/* Providers Table */}
          <div className="table-container">
            <table className="providers-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.map((provider) => (
                  <tr key={provider.id}>
                    <td>
                      <div className="provider-cell">
                        <div className="provider-avatar">
                          {provider.image_logo ? (
                            <img src={provider.image_logo} alt={provider.business_name} />
                          ) : (
                            provider.business_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="provider-info">
                          <span className="provider-name">{provider.full_name}</span>
                          <span className="provider-business">{provider.business_name}</span>
                        </div>
                      </div>
                    </td>
                    <td>{provider.email}</td>
                    <td>{provider.contact_number}</td>
                    <td>{provider.address || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${provider.status}`}>
                        {provider.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${provider.is_active ? 'active' : 'inactive'}`}>
                        {provider.is_active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleOpenStatusModal(provider)}
                          disabled={updatingStatus === provider.id}
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

            {filteredProviders.length === 0 && (
              <div className="empty-state">
                <p>No providers found</p>
              </div>
            )}
          </div>
        </main>

        {/* Status Update Modal */}
        {showStatusModal && selectedProvider && (
          <div className="modal-overlay" onClick={handleCloseStatusModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Update Provider Status</h3>
                <button className="modal-close" onClick={handleCloseStatusModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="provider-info-modal">
                  <div className="provider-avatar">
                    {selectedProvider.image_logo ? (
                      <img src={selectedProvider.image_logo} alt={selectedProvider.business_name} />
                    ) : (
                      selectedProvider.business_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="provider-name-modal">{selectedProvider.full_name}</p>
                    <p className="provider-business-modal">{selectedProvider.business_name}</p>
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
                  <p><strong>Current Status:</strong> <span className={`status-badge ${selectedProvider.status}`}>{selectedProvider.status}</span></p>
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
                    Only superadmins can suspend providers
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseStatusModal}
                  disabled={updatingStatus === selectedProvider.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus === selectedProvider.id || newStatus === selectedProvider.status}
                >
                  {updatingStatus === selectedProvider.id ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProviderManagement;
