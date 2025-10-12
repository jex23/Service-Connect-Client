import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { adminServiceManagementService } from '../service/adminServiceManagement';
import type { Service } from '../types/service';
import '../components/AdminLayout.css';
import './AdminServiceManagement.css';

const AdminServiceManagement: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [adminRole, setAdminRole] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [newStatus, setNewStatus] = useState<boolean>(true);

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

    fetchServices();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...services];

    if (isActiveFilter !== 'all') {
      const isActive = isActiveFilter === 'true';
      filtered = filtered.filter(s => s.is_active === isActive);
    }

    setFilteredServices(filtered);
  }, [services, isActiveFilter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminServiceManagementService.getServices();
      setServices(data);
      setFilteredServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (service: Service) => {
    setSelectedService(service);
    setNewStatus(service.is_active);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedService(null);
    setNewStatus(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedService) return;

    // Check permissions
    if (adminRole === 'moderator' && newStatus === true) {
      alert('Moderators can only deactivate services');
      return;
    }

    try {
      setUpdatingStatus(selectedService.id);
      await adminServiceManagementService.updateServiceStatus(selectedService.id, newStatus);

      // Refresh services list
      await fetchServices();

      alert(`Service status updated to ${newStatus ? 'active' : 'inactive'}`);
      handleCloseStatusModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update service status');
      console.error('Error updating service status:', err);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStats = () => {
    return {
      total: services.length,
      active: services.filter(s => s.is_active).length,
      inactive: services.filter(s => !s.is_active).length,
    };
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading services...</p>
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
          <AdminHeader title="Service Management" showUserInfo={true} />
          <main className="admin-main">
            <div className="error-state">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={fetchServices} className="btn btn-primary">
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
        <AdminHeader title="Service Management" showUserInfo={true} />

        <main className="admin-main">
          <div className="page-header">
            <div>
              <h2>Service Management</h2>
              <p>Manage provider services and availability</p>
            </div>
          </div>

          {/* Stats */}
          <div className="service-stats">
            <div className="stat-card-small">
              <div className="stat-icon-small total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div className="stat-content-small">
                <p className="stat-value-small">{stats.total}</p>
                <p className="stat-label-small">Total Services</p>
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
          </div>

          {/* Filters */}
          <div className="service-filters">
            <div className="filter-group">
              <label htmlFor="active-filter">Status</label>
              <select
                id="active-filter"
                value={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.value)}
              >
                <option value="all">All Services</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Services Table */}
          <div className="table-container">
            <table className="services-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Provider ID</th>
                  <th>Category ID</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="service-cell">
                        <div className="service-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          </svg>
                        </div>
                        <div className="service-info">
                          <span className="service-title">{service.service_title}</span>
                          <span className="service-description">{service.service_description}</span>
                        </div>
                      </div>
                    </td>
                    <td>{service.provider_id}</td>
                    <td>{service.category_id}</td>
                    <td>₱{service.price_decimal?.toFixed(2) || 'N/A'}</td>
                    <td>{service.duration_minutes} min</td>
                    <td>
                      <span className={`status-badge ${service.is_active ? 'active' : 'inactive'}`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => navigate(`/admin-service-details/${service.id}`)}
                          title="View Details"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleOpenStatusModal(service)}
                          disabled={updatingStatus === service.id}
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

            {filteredServices.length === 0 && (
              <div className="empty-state">
                <p>No services found</p>
              </div>
            )}
          </div>
        </main>

        {/* Status Update Modal */}
        {showStatusModal && selectedService && (
          <div className="modal-overlay" onClick={handleCloseStatusModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Update Service Status</h3>
                <button className="modal-close" onClick={handleCloseStatusModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="service-info-modal">
                  <div className="service-icon-modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="service-title-modal">{selectedService.service_title}</p>
                    <p className="service-description-modal">{selectedService.service_description}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={newStatus.toString()}
                    onChange={(e) => setNewStatus(e.target.value === 'true')}
                    className="status-select"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="status-info">
                  <p><strong>Current Status:</strong> <span className={`status-badge ${selectedService.is_active ? 'active' : 'inactive'}`}>{selectedService.is_active ? 'Active' : 'Inactive'}</span></p>
                  <p><strong>New Status:</strong> <span className={`status-badge ${newStatus ? 'active' : 'inactive'}`}>{newStatus ? 'Active' : 'Inactive'}</span></p>
                </div>

                {adminRole === 'moderator' && newStatus === true && (
                  <div className="alert alert-warning">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Moderators can only deactivate services
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseStatusModal}
                  disabled={updatingStatus === selectedService.id}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus === selectedService.id || newStatus === selectedService.is_active}
                >
                  {updatingStatus === selectedService.id ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminServiceManagement;
