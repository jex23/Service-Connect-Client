import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { adminServiceManagementService } from '../service/adminServiceManagement';
import type { Service } from '../types/service';
import '../components/AdminLayout.css';
import './AdminServiceDetails.css';

const AdminServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchServiceDetails(parseInt(id));
    }
  }, [id]);

  const fetchServiceDetails = async (serviceId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminServiceManagementService.getServiceById(serviceId);
      setService(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service details');
      console.error('Error fetching service details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin-service-management');
  };

  const handleNextPhoto = () => {
    if (service?.photos && service.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % service.photos!.length);
    }
  };

  const handlePrevPhoto = () => {
    if (service?.photos && service.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + service.photos!.length) % service.photos!.length);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading service details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <AdminHeader title="Service Details" showUserInfo={true} />
          <main className="admin-main">
            <div className="error-state">
              <h2>Error</h2>
              <p>{error || 'Service not found'}</p>
              <button onClick={handleBack} className="btn btn-primary">
                Back to Services
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminHeader title="Service Details" showUserInfo={true} />

        <main className="admin-main">
          <div className="page-header">
            <button onClick={handleBack} className="btn btn-back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Services
            </button>
          </div>

          <div className="service-details-container">
            {/* Service Header */}
            <div className="service-header-card">
              <div className="service-header-content">
                <div className="service-header-info">
                  <h1>{service.service_title}</h1>
                  <span className={`status-badge ${service.is_active ? 'active' : 'inactive'}`}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="service-meta">
                  <div className="meta-item">
                    <span className="meta-label">Price:</span>
                    <span className="meta-value">₱{service.price_decimal?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Duration:</span>
                    <span className="meta-value">{service.duration_minutes} minutes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Photos */}
            {service.photos && service.photos.length > 0 && (
              <div className="service-photos-card">
                <h2>Service Photos</h2>
                <div className="photo-gallery">
                  <div className="photo-main">
                    <img
                      src={service.photos[currentPhotoIndex].photo_url}
                      alt={`Service photo ${currentPhotoIndex + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                      }}
                    />
                    {service.photos.length > 1 && (
                      <>
                        <button className="photo-nav prev" onClick={handlePrevPhoto}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button className="photo-nav next" onClick={handleNextPhoto}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  {service.photos.length > 1 && (
                    <div className="photo-thumbnails">
                      {service.photos.map((photo, index) => (
                        <div
                          key={photo.id}
                          className={`photo-thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                          onClick={() => setCurrentPhotoIndex(index)}
                        >
                          <img
                            src={photo.photo_url}
                            alt={`Thumbnail ${index + 1}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=N/A';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Description */}
            <div className="service-info-card">
              <h2>Description</h2>
              <p>{service.service_description}</p>
            </div>

            {/* Provider Information */}
            {service.provider && (
              <div className="provider-card">
                <h2>Provider Information</h2>
                <div className="provider-content">
                  {service.provider.image_logo && (
                    <div className="provider-logo">
                      <img
                        src={service.provider.image_logo}
                        alt={service.provider.business_name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Logo';
                        }}
                      />
                    </div>
                  )}
                  <div className="provider-details">
                    <div className="provider-row">
                      <span className="label">Business Name:</span>
                      <span className="value">{service.provider.business_name}</span>
                    </div>
                    <div className="provider-row">
                      <span className="label">Contact Person:</span>
                      <span className="value">{service.provider.full_name}</span>
                    </div>
                    <div className="provider-row">
                      <span className="label">Email:</span>
                      <span className="value">{service.provider.email}</span>
                    </div>
                    <div className="provider-row">
                      <span className="label">Contact Number:</span>
                      <span className="value">{service.provider.contact_number}</span>
                    </div>
                    <div className="provider-row">
                      <span className="label">Address:</span>
                      <span className="value">{service.provider.address}</span>
                    </div>
                    {service.provider.about && (
                      <div className="provider-row">
                        <span className="label">About:</span>
                        <span className="value">{service.provider.about}</span>
                      </div>
                    )}
                    <div className="provider-row">
                      <span className="label">Status:</span>
                      <span className={`status-badge ${service.provider.status}`}>
                        {service.provider.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Information */}
            {service.category && (
              <div className="category-card">
                <h2>Category</h2>
                <div className="category-content">
                  <div className="category-row">
                    <span className="label">Category Name:</span>
                    <span className="value">{service.category.category_name}</span>
                  </div>
                  {service.category.description && (
                    <div className="category-row">
                      <span className="label">Description:</span>
                      <span className="value">{service.category.description}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Schedule */}
            {service.schedules && service.schedules.length > 0 && (
              <div className="schedule-card">
                <h2>Service Schedule</h2>
                <div className="schedule-list">
                  {service.schedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-item">
                      <span className="schedule-day">{schedule.schedule_day}</span>
                      <span className="schedule-time">
                        {schedule.start_time} - {schedule.end_time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Metadata */}
            <div className="metadata-card">
              <h2>Additional Information</h2>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="label">Service ID:</span>
                  <span className="value">{service.id}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Provider ID:</span>
                  <span className="value">{service.provider_id}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Category ID:</span>
                  <span className="value">{service.category_id}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Created:</span>
                  <span className="value">
                    {service.created_at ? new Date(service.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="label">Last Updated:</span>
                  <span className="value">
                    {service.updated_at ? new Date(service.updated_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminServiceDetails;
