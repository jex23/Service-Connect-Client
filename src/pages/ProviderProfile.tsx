import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar';
import { providerProfileService } from '../service/providerProfileService';
import { providerService } from '../service/providerService';
import { authService } from '../service/authService';
import type { ProviderProfile, ProviderProfileUpdateRequest, ProviderProfileUpdateWithFilesRequest } from '../types/providerProfile';
import '../components/ProviderLayout.css';
import './ProviderProfile.css';

const ProviderProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'documents' | 'services' | 'security' | 'danger'>('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProviderProfileUpdateRequest>({});
  const [fileData, setFileData] = useState<{
    bir_id_front?: File;
    bir_id_back?: File;
    business_permit?: File;
    image_logo?: File;
  }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await providerService.getProviderServices({
        include_photos: true,
        include_schedules: true
      });
      setServices(response.services || []);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Free';
    return `₱${price.toLocaleString()}`;
  };

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return 'No duration set';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const handleViewServiceDetails = (service: any) => {
    setSelectedService(service);
  };

  const handleCloseServiceDetails = () => {
    setSelectedService(null);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await providerProfileService.getCurrentProviderProfile();
      setProfile(response);
      setFormData({
        business_name: response.business_name,
        full_name: response.full_name,
        address: response.address,
        about: response.about
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Check if we have files to upload
      const hasFiles = Object.keys(fileData).some(key => fileData[key as keyof typeof fileData]);

      let response;
      if (hasFiles) {
        // Use multipart form data for file uploads
        const updateWithFiles: ProviderProfileUpdateWithFilesRequest = {
          ...formData,
          ...fileData
        };
        response = await providerProfileService.updateProviderProfileWithFiles(updateWithFiles);
      } else {
        // Use JSON for text-only updates
        response = await providerProfileService.updateProviderProfile(formData);
      }

      setProfile(response);
      setIsEditing(false);
      setFileData({});
      setSuccessMessage(response.message || 'Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        business_name: profile.business_name,
        full_name: profile.full_name,
        address: profile.address,
        about: profile.about
      });
    }
    setFileData({});
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleInputChange = (field: keyof ProviderProfileUpdateRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: 'bir_id_front' | 'bir_id_back' | 'business_permit' | 'image_logo', file: File | null) => {
    setFileData(prev => ({
      ...prev,
      [field]: file || undefined
    }));
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      await providerProfileService.deleteProviderAccount();

      // Clear auth data and redirect
      authService.logout();
      window.dispatchEvent(new Event('authChange'));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="provider-layout">
        <ProviderSidebar />
        <div className="main-content">
          {/* Full Page Loading Overlay */}
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <div className="loading-text">Loading Profile</div>
              <div className="loading-subtext">
                Please wait<span className="loading-dots"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="provider-layout">
        <ProviderSidebar />
        <div className="main-content">
          <div className="provider-profile">
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchProfile} className="btn btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="provider-layout">
        <ProviderSidebar />
        <div className="main-content">
          <div className="provider-profile">
            <div className="error-state">
              <p>Profile not found</p>
              <button onClick={fetchProfile} className="btn btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-layout">
      <ProviderSidebar />
      <div className="main-content">
        <div className="provider-profile">
          <div className="profile-header">
            <div className="profile-page-info">
              <div className="profile-page-avatar">
                {profile.image_logo ? (
                  <img src={profile.image_logo} alt="Business Logo" />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.business_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="profile-details">
                <h1>{profile.business_name}</h1>
                <p className="full-name">{profile.full_name}</p>
                <p className="email">{profile.email}</p>
                <div className="status-info">
                  <span className={`status-badge ${profile.is_active ? 'active' : 'inactive'}`}>
                    {profile.is_active ? '✓ Active' : '⚠ Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
            </div>
          )}

          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Info
            </button>
            <button
              className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </button>
            <button
              className={`tab ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Services
            </button>
            <button
              className={`tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
            <button
              className={`tab ${activeTab === 'danger' ? 'active' : ''}`}
              onClick={() => setActiveTab('danger')}
            >
              Account Settings
            </button>
          </div>

          <div className="profile-content">
            {activeTab === 'basic' && (
              <div className="tab-content">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="business_name">Business Name *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="business_name"
                        value={formData.business_name || ''}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        required
                      />
                    ) : (
                      <div className="form-value">{profile.business_name}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="full_name">Full Name *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="full_name"
                        value={formData.full_name || ''}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        required
                      />
                    ) : (
                      <div className="form-value">{profile.full_name}</div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Address</label>
                    {isEditing ? (
                      <textarea
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <div className="form-value">{profile.address || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="about">About Business</label>
                    {isEditing ? (
                      <textarea
                        id="about"
                        value={formData.about || ''}
                        onChange={(e) => handleInputChange('about', e.target.value)}
                        rows={4}
                        placeholder="Tell us about your business..."
                      />
                    ) : (
                      <div className="form-value">{profile.about || 'No description provided'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <div className="form-value">{profile.email}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="tab-content">
                <h3>Documents</h3>
                <p>Upload or update your business documents</p>

                <div className="documents-grid">
                  <div className="document-item">
                    <h4>Business Logo</h4>
                    {profile.image_logo ? (
                      <div className="document-preview">
                        <img src={profile.image_logo} alt="Business Logo" />
                        <p>Current logo</p>
                      </div>
                    ) : (
                      <p className="no-document">No logo uploaded</p>
                    )}
                    {isEditing && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('image_logo', e.target.files?.[0] || null)}
                      />
                    )}
                  </div>

                  <div className="document-item">
                    <h4>BIR ID (Front)</h4>
                    {profile.bir_id_front ? (
                      <div className="document-preview">
                        <img src={profile.bir_id_front} alt="BIR ID Front" />
                        <p>Current document</p>
                      </div>
                    ) : (
                      <p className="no-document">Not uploaded</p>
                    )}
                    {isEditing && (
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('bir_id_front', e.target.files?.[0] || null)}
                      />
                    )}
                  </div>

                  <div className="document-item">
                    <h4>BIR ID (Back)</h4>
                    {profile.bir_id_back ? (
                      <div className="document-preview">
                        <img src={profile.bir_id_back} alt="BIR ID Back" />
                        <p>Current document</p>
                      </div>
                    ) : (
                      <p className="no-document">Not uploaded</p>
                    )}
                    {isEditing && (
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('bir_id_back', e.target.files?.[0] || null)}
                      />
                    )}
                  </div>

                  <div className="document-item">
                    <h4>Business Permit</h4>
                    {profile.business_permit ? (
                      <div className="document-preview">
                        <img src={profile.business_permit} alt="Business Permit" />
                        <p>Current document</p>
                      </div>
                    ) : (
                      <p className="no-document">Not uploaded</p>
                    )}
                    {isEditing && (
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange('business_permit', e.target.files?.[0] || null)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="tab-content">
                <h3>My Services</h3>
                {servicesLoading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading services...</p>
                  </div>
                ) : services.length === 0 ? (
                  <div className="empty-state">
                    <p>No services found. You can add services from the Services page.</p>
                  </div>
                ) : (
                  <div className="services-grid">
                    {services.map((service) => (
                      <div key={service.id} className="service-card" onClick={() => handleViewServiceDetails(service)}>
                        <div className="service-card-header">
                          <h4>{service.service_title}</h4>
                          <span className={`status-badge ${service.is_active ? 'active' : 'inactive'}`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="service-card-content">
                          <p className="service-category">{service.category_name}</p>
                          <p className="service-description">
                            {service.service_description ?
                              (service.service_description.length > 100 ?
                                service.service_description.substring(0, 100) + '...' :
                                service.service_description) :
                              'No description'
                            }
                          </p>
                          <div className="service-details">
                            <span className="service-price">{formatPrice(service.price_decimal)}</span>
                            {service.duration_minutes && (
                              <span className="service-duration">{formatDuration(service.duration_minutes)}</span>
                            )}
                          </div>
                          <div className="service-stats">
                            {service.photo_count > 0 && (
                              <span className="stat-item">
                                📷 {service.photo_count} photo{service.photo_count > 1 ? 's' : ''}
                              </span>
                            )}
                            {service.schedule_count > 0 && (
                              <span className="stat-item">
                                📅 {service.schedule_count} schedule{service.schedule_count > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="tab-content">
                <h3>Security Settings</h3>
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  {isEditing ? (
                    <input
                      type="password"
                      id="password"
                      value={formData.password || ''}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Leave blank to keep current password"
                      minLength={6}
                    />
                  ) : (
                    <div className="form-value">••••••••••••</div>
                  )}
                  <small>Minimum 6 characters. Leave blank to keep current password.</small>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="tab-content">
                <h3>Account Settings</h3>
                <div className="danger-zone">
                  <h4>Delete Account</h4>
                  <p className="danger-warning">
                    ⚠️ <strong>Warning:</strong> This action cannot be undone. This will permanently delete your provider account and all associated data including services, bookings, and uploaded documents.
                  </p>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn btn-danger"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="modal-overlay">
          <div className="modal-content detail-modal">
            <div className="modal-header">
              <h2>{selectedService.service_title}</h2>
              <button className="modal-close" onClick={handleCloseServiceDetails}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body detail-body">
              <div className="detail-section">
                <h3>Service Information</h3>
                <div className="detail-grid">
                  <div className="detail-field">
                    <label>Category</label>
                    <span>{selectedService.category_name || 'Unknown Category'}</span>
                  </div>
                  <div className="detail-field">
                    <label>Price</label>
                    <span>{formatPrice(selectedService.price_decimal)}</span>
                  </div>
                  <div className="detail-field">
                    <label>Duration</label>
                    <span>{formatDuration(selectedService.duration_minutes)}</span>
                  </div>
                  <div className="detail-field">
                    <label>Status</label>
                    <span className={`detail-status ${selectedService.is_active ? 'active' : 'inactive'}`}>
                      {selectedService.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="detail-field full-width">
                    <label>Description</label>
                    <span>{selectedService.service_description || 'No description provided'}</span>
                  </div>
                </div>
              </div>

              {selectedService.has_photos && selectedService.photos && selectedService.photos.length > 0 && (
                <div className="detail-section">
                  <h3>Service Photos ({selectedService.photo_count})</h3>
                  <div className="photos-gallery">
                    {selectedService.photos.map((photo: any, index: number) => (
                      <div key={photo.id} className="photo-thumbnail">
                        <img src={photo.photo_url} alt={`Service photo ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedService.has_schedules && selectedService.schedules && selectedService.schedules.length > 0 && (
                <div className="detail-section">
                  <h3>Service Schedule ({selectedService.schedule_count} days)</h3>
                  <div className="schedule-list">
                    {selectedService.schedules.map((schedule: any) => (
                      <div key={schedule.id} className="schedule-item">
                        <span className="schedule-day">{schedule.schedule_day}</span>
                        <span className="schedule-time">{schedule.start_time} - {schedule.end_time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Additional Information</h3>
                <div className="detail-grid">
                  <div className="detail-field">
                    <label>Created</label>
                    <span>{selectedService.created_at ? new Date(selectedService.created_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  <div className="detail-field">
                    <label>Last Updated</label>
                    <span>{selectedService.updated_at ? new Date(selectedService.updated_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  <div className="detail-field">
                    <label>Service ID</label>
                    <span>{selectedService.id}</span>
                  </div>
                  <div className="detail-field">
                    <label>Provider ID</label>
                    <span>{selectedService.provider_id}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseServiceDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Account Deletion</h3>
            <p>
              Are you absolutely sure you want to delete your provider account? This action cannot be undone and will:
            </p>
            <ul>
              <li>Permanently delete all your business information</li>
              <li>Remove all your services and service photos</li>
              <li>Cancel all active bookings</li>
              <li>Delete all uploaded documents (BIR ID, business permit, etc.)</li>
              <li>Remove your account history and data</li>
            </ul>

            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="btn btn-danger"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;