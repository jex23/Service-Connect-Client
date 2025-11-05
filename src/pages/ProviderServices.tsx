import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderHeader from '../components/ProviderHeader';
import ProviderSidebar from '../components/ProviderSidebar';
import { providerService } from '../service/providerService';
import type { ProviderService, ProviderRegisteredCategory, ProviderServiceScheduleItem } from '../types/providerService';
import '../components/ProviderLayout.css';
import './ProviderServices.css';

const ProviderServices: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ProviderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    service_title: '',
    service_description: '',
    price_decimal: '',
    duration_minutes: '',
    is_active: true,
    category_id: ''
  });
  const [categories, setCategories] = useState<ProviderRegisteredCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [schedules, setSchedules] = useState<ProviderServiceScheduleItem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Cleanup image preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      selectedPhotos.forEach(photo => {
        if (photo instanceof File) {
          URL.revokeObjectURL(createImagePreview(photo));
        }
      });
    };
  }, [selectedPhotos]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await providerService.getProviderServices({
        include_photos: true,
        include_schedules: true
      });
      setServices(response.services || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };


  const handleViewDetails = (service: ProviderService) => {
    console.log('Navigating to service details:', service.id);
    console.log('Navigation path:', `/provider-services/${service.id}`);
    navigate(`/provider-services/${service.id}`);
  };


  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await providerService.getProviderRegisteredCategories();
      setCategories(response.registered_categories);
    } catch (err) {
      console.error('Failed to fetch registered categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCreateServiceClick = () => {
    // Show confirmation modal instead of creating directly
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    setShowConfirmModal(false);

    try {
      setSaving(true);

      console.log('=== CREATE SERVICE DEBUG START ===');
      console.log('Form data:', formData);
      console.log('Selected photos:', selectedPhotos);
      console.log('Schedules:', schedules);

      // Parse and validate data types
      const categoryId = parseInt(formData.category_id);
      const priceDecimal = formData.price_decimal ? parseFloat(formData.price_decimal) : undefined;
      const durationMinutes = formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined;
      const isActive = Boolean(formData.is_active);

      console.log('Data type validation:');
      console.log('- category_id:', categoryId, typeof categoryId);
      console.log('- price_decimal:', priceDecimal, typeof priceDecimal);
      console.log('- duration_minutes:', durationMinutes, typeof durationMinutes);
      console.log('- is_active:', isActive, typeof isActive);

      const createData = {
        category_id: categoryId,
        service_title: formData.service_title,
        service_description: formData.service_description || undefined,
        price_decimal: priceDecimal,
        duration_minutes: durationMinutes,
        is_active: isActive,
        photos: selectedPhotos.length > 0 ? selectedPhotos : undefined,
        schedules: schedules.length > 0 ? schedules : undefined
      };

      console.log('Create data:', createData);
      console.log('Calling createProviderService...');

      await providerService.createProviderService(createData);

      console.log('Service created successfully');
      await fetchServices();
      setShowAddModal(false);
      setShowSuccessModal(true);

      // Reset form data
      setSelectedPhotos([]);
      setSchedules([]);
      setFormData({
        service_title: '',
        service_description: '',
        price_decimal: '',
        duration_minutes: '',
        is_active: true,
        category_id: ''
      });

      console.log('=== CREATE SERVICE DEBUG END ===');
    } catch (err) {
      console.error('=== CREATE SERVICE ERROR ===', err);
      alert(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };

  const handleCancelCreate = () => {
    setShowAddModal(false);
    setSelectedPhotos([]);
    setSchedules([]);
    setFormData({
      service_title: '',
      service_description: '',
      price_decimal: '',
      duration_minutes: '',
      is_active: true,
      category_id: ''
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedPhotos(prev => [...prev, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const createImagePreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Schedule management functions
  const getNextAvailableDay = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const usedDays = schedules.map(schedule => schedule.schedule_day);

    // Find the first day that hasn't been used
    for (const day of daysOfWeek) {
      if (!usedDays.includes(day)) {
        return day;
      }
    }

    // If all days are used, return Monday as fallback
    return 'Monday';
  };

  const addSchedule = () => {
    // Limit to 7 schedules (one for each day of the week)
    if (schedules.length >= 7) {
      alert('Maximum of 7 schedules allowed (one for each day of the week).');
      return;
    }

    const nextDay = getNextAvailableDay();
    const newSchedule = {
      schedule_day: nextDay,
      start_time: '09:00',
      end_time: '17:00'
    };

    console.log('Adding new schedule:', newSchedule);
    console.log('Next available day:', nextDay);

    setSchedules(prev => {
      const updated = [...prev, newSchedule];
      console.log('Updated schedules:', updated);
      return updated;
    });
  };

  const removeSchedule = (index: number) => {
    setSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: string, value: string) => {
    console.log(`Updating schedule ${index}, field: ${field}, value: ${value}`);

    // If changing the day, check for duplicates
    if (field === 'schedule_day') {
      const isDayAlreadyUsed = schedules.some((schedule, i) =>
        i !== index && schedule.schedule_day === value
      );

      if (isDayAlreadyUsed) {
        alert(`${value} already has a schedule. Please choose a different day.`);
        return;
      }
    }

    setSchedules(prev => prev.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    ));
  };

  const getUsedDays = () => {
    return schedules.map(schedule => schedule.schedule_day);
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

  if (loading) {
    return (
      <div className="provider-layout">
        <ProviderSidebar />
        <div className="main-content">
          <ProviderHeader />

          {/* Full Page Loading Overlay */}
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <div className="loading-text">Loading Services</div>
              <div className="loading-subtext">
                Please wait<span className="loading-dots"></span>
              </div>
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
        <ProviderHeader />
        <div className="provider-services">
          <div className="services-header">
            <div className="header-left">
              <h1>My Services</h1>
              <p>Manage your service offerings</p>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Service
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchServices} className="btn btn-outline">
                Try Again
              </button>
            </div>
          )}

          {!error && (
            <div className="services-content">
              {services.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </div>
                  <h3>No services yet</h3>
                  <p>Start by adding your first service to attract customers</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Your First Service
                  </button>
                </div>
              ) : (
                <div className="services-grid">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="service-card"
                      onClick={() => {
                        console.log('Card clicked for service:', service.id);
                        handleViewDetails(service);
                      }}
                    >
                      <div className="service-card-header">
                        <h3 className="service-title">
                          {service.service_title || 'No title'}
                        </h3>
                        <span className={`status-badge ${service.is_active ? 'active' : 'inactive'}`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="service-card-content">
                        <p className="service-category">
                          {service.category_name || 'Unknown Category'}
                        </p>

                        {service.service_description && (
                          <p className="service-description">
                            {service.service_description.length > 100
                              ? service.service_description.substring(0, 100) + '...'
                              : service.service_description
                            }
                          </p>
                        )}

                        <div className="service-pricing">
                          <span className="service-price">{formatPrice(service.price_decimal)}</span>
                          {service.duration_minutes && (
                            <span className="service-duration">{formatDuration(service.duration_minutes)}</span>
                          )}
                        </div>

                        <div className="service-stats">
                          {service.photo_count > 0 && (
                            <span className="stat-item">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21,15 16,10 5,21"></polyline>
                              </svg>
                              {service.photo_count} photo{service.photo_count > 1 ? 's' : ''}
                            </span>
                          )}
                          {service.schedule_count > 0 && (
                            <span className="stat-item">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              {service.schedule_count} schedule{service.schedule_count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="service-card-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(service);
                          }}
                          title="View Details"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Service Modal */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Create New Service</h2>
                  <button className="modal-close" onClick={handleCancelCreate}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="category_id">Service Category *</label>
                    <select
                      id="category_id"
                      value={formData.category_id}
                      onChange={(e) => handleInputChange('category_id', e.target.value)}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                    {loadingCategories && (
                      <small style={{ color: '#6b7280' }}>Loading categories...</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="service_title">Service Title *</label>
                    <input
                      type="text"
                      id="service_title"
                      value={formData.service_title}
                      onChange={(e) => handleInputChange('service_title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="service_description">Description</label>
                    <textarea
                      id="service_description"
                      value={formData.service_description}
                      onChange={(e) => handleInputChange('service_description', e.target.value)}
                      rows={4}
                      placeholder="Describe your service..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="price_decimal">Price (₱)</label>
                      <input
                        type="number"
                        id="price_decimal"
                        value={formData.price_decimal}
                        onChange={(e) => handleInputChange('price_decimal', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="duration_minutes">Duration (minutes)</label>
                      <input
                        type="number"
                        id="duration_minutes"
                        value={formData.duration_minutes}
                        onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                        min="1"
                        placeholder="60"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="service_photos">Service Photos</label>
                    <input
                      type="file"
                      id="service_photos"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    <small style={{ color: '#6b7280', display: 'block', marginTop: '0.5rem' }}>
                      You can select multiple images. Click to add more photos to your selection.
                    </small>

                    {selectedPhotos.length > 0 && (
                      <div className="selected-photos">
                        <small style={{ fontWeight: '600', color: '#374151', marginBottom: '1rem', display: 'block' }}>
                          {selectedPhotos.length} photo(s) selected:
                        </small>

                        {/* Photo Grid Preview */}
                        <div className="photo-preview-grid">
                          {selectedPhotos.map((photo, index) => (
                            <div key={index} className="photo-preview-item">
                              <div className="photo-preview-container">
                                <img
                                  src={createImagePreview(photo)}
                                  alt={`Preview ${index + 1}`}
                                  className="photo-preview-image"
                                />
                                <button
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  className="remove-photo-preview"
                                  title="Remove photo"
                                >
                                  ×
                                </button>
                              </div>
                              <div className="photo-preview-info">
                                <span className="photo-name">{photo.name}</span>
                                <span className="photo-size">
                                  {(photo.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add More Photos Button */}
                        <div className="add-more-photos">
                          <label htmlFor="service_photos" className="btn btn-outline btn-sm add-photos-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add More Photos
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      />
                      <span className="checkbox-text">Service is active</span>
                    </label>
                  </div>

                  {/* Schedule Management Section */}
                  <div className="form-group">
                    <div className="schedule-header">
                      <div className="schedule-header-content">
                        <label>Service Schedule</label>
                        <small style={{ color: '#6b7280', fontWeight: 'normal' }}>
                          ({schedules.length}/7 days scheduled)
                        </small>
                      </div>
                      <button
                        type="button"
                        onClick={addSchedule}
                        className={`btn btn-outline btn-sm ${schedules.length >= 7 ? 'disabled' : ''}`}
                        disabled={schedules.length >= 7}
                        title={schedules.length >= 7 ? 'Maximum 7 schedules allowed' : `Add schedule for ${getNextAvailableDay()}`}
                      >
                        {schedules.length >= 7 ? 'All Days Scheduled' : `Add ${getNextAvailableDay()}`}
                      </button>
                    </div>

                    <div className="schedule-notice">
                      <small style={{ color: '#10b981', display: 'block', marginBottom: '1rem', background: '#d1fae5', padding: '0.75rem', borderRadius: '6px', border: '1px solid #10b981' }}>
                        ✅ <strong>Note:</strong> Add up to 7 schedules (one for each day). Schedules will be created along with the service.
                      </small>
                    </div>

                    {schedules.length > 0 && (
                      <div className="schedule-list-edit">
                        {schedules.map((schedule, index) => (
                          <div key={index} className="schedule-item-edit">
                            <div className="schedule-row">
                              <select
                                value={schedule.schedule_day}
                                onChange={(e) => updateSchedule(index, 'schedule_day', e.target.value)}
                                className="schedule-day-select"
                              >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                  const isUsedByOther = getUsedDays().includes(day) && day !== schedule.schedule_day;
                                  return (
                                    <option
                                      key={day}
                                      value={day}
                                      disabled={isUsedByOther}
                                      style={{
                                        color: isUsedByOther ? '#9ca3af' : '#374151',
                                        backgroundColor: isUsedByOther ? '#f3f4f6' : 'white'
                                      }}
                                    >
                                      {day}{isUsedByOther ? ' (Used)' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                              <input
                                type="time"
                                value={schedule.start_time}
                                onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                                className="schedule-time-input"
                              />
                              <span className="time-separator">to</span>
                              <input
                                type="time"
                                value={schedule.end_time}
                                onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                                className="schedule-time-input"
                              />
                              <button
                                type="button"
                                onClick={() => removeSchedule(index)}
                                className="remove-schedule-btn"
                                title="Remove schedule"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {schedules.length === 0 && (
                      <p className="no-schedules">No schedules added. Click "Add Schedule" to create one.</p>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelCreate}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateServiceClick}
                    disabled={saving || !formData.service_title.trim() || !formData.category_id}
                  >
                    Create Service
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Confirm Service Creation</h3>
                <p>Are you sure you want to create this service?</p>

                <div className="modal-actions">
                  <button
                    onClick={handleCancelConfirm}
                    disabled={saving}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmCreate}
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Creating...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="success-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3>Service Created Successfully!</h3>
                <p>Your service has been created and is now available.</p>

                <div className="modal-actions">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="btn btn-primary"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProviderServices;