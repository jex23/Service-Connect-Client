import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProviderHeader from '../components/ProviderHeader';
import ProviderSidebar from '../components/ProviderSidebar';
import { providerService } from '../service/providerService';
import type { ProviderService, ServicePhoto, ProviderServiceScheduleItem, ProviderRegisteredCategory } from '../types/providerService';
import '../components/ProviderLayout.css';
import './ProviderServiceFullDetails.css';

const ProviderServiceFullDetails: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ProviderService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<ProviderService | null>(null);
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
  const [schedules, setSchedules] = useState<ProviderServiceScheduleItem[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<ServicePhoto[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails(parseInt(serviceId));
      fetchCategories();
    } else {
      navigate('/provider-services');
    }
  }, [serviceId, navigate]);


  const fetchServiceDetails = async (id: number) => {
    try {
      setLoading(true);
      const service = await providerService.getProviderServiceDetails(id);
      setService(service);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service details');
    } finally {
      setLoading(false);
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

  const getOrderedSchedules = () => {
    if (!service || !service.schedules || service.schedules.length === 0) {
      return [];
    }

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return service.schedules.sort((a, b) => {
      return dayOrder.indexOf(a.schedule_day) - dayOrder.indexOf(b.schedule_day);
    });
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

  const handleEditService = () => {
    if (!service) return;

    console.log('=== EDIT SERVICE INITIALIZATION ===');
    console.log('Service data:', service);
    console.log('Service photos:', service.photos);
    console.log('Service schedules:', service.schedules);

    setEditingService(service);

    const newFormData = {
      service_title: service.service_title,
      service_description: service.service_description || '',
      price_decimal: service.price_decimal?.toString() || '',
      duration_minutes: service.duration_minutes?.toString() || '',
      is_active: service.is_active,
      category_id: service.category_id?.toString() || ''
    };

    console.log('Form data initialized:', newFormData);
    setFormData(newFormData);

    // Pre-fill schedules
    const formattedSchedules = service.schedules?.map(schedule => ({
      schedule_day: schedule.schedule_day,
      start_time: schedule.start_time,
      end_time: schedule.end_time
    })) || [];
    console.log('Schedules initialized:', formattedSchedules);
    setSchedules(formattedSchedules);

    // Pre-fill existing photos
    console.log('Photos initialized:', service.photos || []);
    setExistingPhotos(service.photos || []);
    setNewPhotos([]);
    setPhotosToDelete([]);
    console.log('=== EDIT INITIALIZATION COMPLETE ===');
  };

  const handleSaveService = async () => {
    if (!editingService) return;

    console.log('=== SAVE SERVICE DEBUG START (PHOTO PRESERVATION) ===');
    console.log('Editing service:', editingService);
    console.log('Form data:', formData);
    console.log('Schedules:', schedules);
    console.log('Existing photos (should be preserved):', existingPhotos);
    console.log('New photos (will be added):', newPhotos);
    console.log('Photos to delete (will be removed first):', photosToDelete);
    console.log('🔧 Strategy: Delete photos first, then add new ones separately to preserve existing');

    try {
      setSaving(true);

      // Handle photo deletions first (before the main update)
      console.log('Processing photo deletions...');
      console.log('Photos to delete count:', photosToDelete.length);
      for (const photoId of photosToDelete) {
        try {
          console.log(`Deleting photo ${photoId}...`);
          await providerService.deleteServicePhoto(editingService.id, photoId);
          console.log(`Successfully deleted photo ${photoId}`);
        } catch (err) {
          console.error(`Failed to delete photo ${photoId}:`, err);
        }
      }

      // Always use the unified admin endpoint for all updates
      // This is the ONLY endpoint that supports photo uploads
      const hasScheduleChanges = schedules.length > 0;
      const hasNewPhotos = newPhotos.length > 0;

      console.log('Has schedule changes:', hasScheduleChanges);
      console.log('Has new photos:', hasNewPhotos);
      console.log('🔧 Using unified admin endpoint (ONLY endpoint that supports photo uploads)');

      // Prepare unified update data for the admin endpoint
      const unifiedUpdateData = {
        category_id: parseInt(formData.category_id),
        service_title: formData.service_title,
        service_description: formData.service_description || undefined,
        price_decimal: formData.price_decimal ? parseFloat(formData.price_decimal) : undefined,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
        is_active: formData.is_active,
        photos: hasNewPhotos ? newPhotos : undefined,
        schedules: hasScheduleChanges ? schedules : undefined
      };

      console.log('Unified update data:', unifiedUpdateData);

      // Use the unified endpoint (ONLY way to upload photos)
      console.log('Calling updateProviderServiceWithMedia...');
      const updateResult = await providerService.updateProviderServiceWithMedia(editingService.id, unifiedUpdateData);
      console.log('Unified update result:', updateResult);

      console.log('Fetching updated service details...');
      await fetchServiceDetails(editingService.id);
      console.log('Service details refreshed, closing edit modal...');
      handleCancelEdit();
      console.log('=== SAVE SERVICE DEBUG END (PHOTO PRESERVATION) ===');
    } catch (err) {
      console.error('=== SAVE SERVICE ERROR (UNIFIED ENDPOINT) ===', err);
      alert(err instanceof Error ? err.message : 'Failed to update service');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingService(null);
    setFormData({
      service_title: '',
      service_description: '',
      price_decimal: '',
      duration_minutes: '',
      is_active: true,
      category_id: ''
    });
    setSchedules([]);
    setExistingPhotos([]);
    setNewPhotos([]);
    setPhotosToDelete([]);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSchedule = () => {
    const newSchedule = {
      schedule_day: 'Monday',
      start_time: '09:00',
      end_time: '17:00'
    };
    console.log('Adding new schedule:', newSchedule);
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
    setSchedules(prev => prev.map((schedule, i) =>
      i === index ? { ...schedule, [field]: value } : schedule
    ));
  };

  const handleNewPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      console.log('New photos selected:', files);
      setNewPhotos(files);
    }
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const markPhotoForDeletion = (photoId: number) => {
    console.log('Marking photo for deletion:', photoId);
    setPhotosToDelete(prev => {
      const updated = [...prev, photoId];
      console.log('Updated photos to delete:', updated);
      return updated;
    });
    setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const restorePhoto = (photo: ServicePhoto) => {
    setPhotosToDelete(prev => prev.filter(id => id !== photo.id));
    setExistingPhotos(prev => [...prev, photo]);
  };

  const getDeletedPhotos = () => {
    if (!service) return [];
    return service.photos?.filter(photo => photosToDelete.includes(photo.id)) || [];
  };

  const handleToggleStatus = async () => {
    if (!service) return;
    try {
      await providerService.updateProviderService(service.id, {
        is_active: !service.is_active
      });
      await fetchServiceDetails(service.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update service status');
    }
  };

  const handleDeleteService = async () => {
    if (!service) return;
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      await providerService.deleteProviderService(service.id);
      navigate('/provider-services');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="provider-layout">
        <ProviderSidebar />
        <div className="main-content">
          <ProviderHeader />
          <div className="service-full-details">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading service details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="provider-layout">
        <ProviderSidebar />
        <div className="main-content">
          <ProviderHeader />
          <div className="service-full-details">
            <div className="error-state">
              <h2>Service Not Found</h2>
              <p>{error || 'The requested service could not be found.'}</p>
              <button onClick={() => navigate('/provider-services')} className="btn btn-primary">
                Back to Services
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
        <ProviderHeader />
        <div className="service-full-details">
          {/* Header */}
          <div className="service-header">
            <div className="header-actions">
              <button onClick={() => navigate('/provider-services')} className="btn btn-secondary">
                ← Back to Services
              </button>
            </div>
            <div className="header-actions">
              <div className="service-actions">
                <button
                  className="btn btn-outline"
                  onClick={handleEditService}
                  title="Edit Service"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
                <button
                  className={`btn ${service.is_active ? 'btn-warning' : 'btn-success'}`}
                  onClick={handleToggleStatus}
                  title={service.is_active ? 'Deactivate Service' : 'Activate Service'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {service.is_active ? (
                      <path d="M10 9v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1z"></path>
                    ) : (
                      <polygon points="5,3 19,12 5,21 5,3"></polygon>
                    )}
                  </svg>
                  {service.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteService}
                  title="Delete Service"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
            <div className="service-title-section">
              <h1>{service.service_title}</h1>
              <div className="service-meta">
                <span className={`status-badge ${service.is_active ? 'active' : 'inactive'}`}>
                  {service.is_active ? '✓ Active' : '⚠ Inactive'}
                </span>
                <span className="category-badge">{service.category_name || 'Unknown Category'}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="service-content">
            {/* Left Column */}
            <div className="left-column">
              {/* Service Information */}
              <section className="info-section">
                <h2>Service Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Price</label>
                    <span className="price-value">{formatPrice(service.price_decimal)}</span>
                  </div>
                  <div className="info-item">
                    <label>Duration</label>
                    <span>{formatDuration(service.duration_minutes)}</span>
                  </div>
                  <div className="info-item">
                    <label>Category</label>
                    <span>{service.category_name || 'Unknown Category'}</span>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <span className={`status-text ${service.is_active ? 'active' : 'inactive'}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                {service.service_description && (
                  <div className="description-section">
                    <label>Description</label>
                    <p>{service.service_description}</p>
                  </div>
                )}
              </section>

              {/* Service Photos */}
              {service.has_photos && service.photos && service.photos.length > 0 && (
                <section className="photos-section">
                  <h2>Service Photos ({service.photo_count})</h2>
                  <div className="photos-gallery">
                    {service.photos.map((photo, index) => (
                      <div key={photo.id} className="photo-item">
                        <img
                          src={photo.photo_url}
                          alt={`Service photo ${index + 1}`}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Service Schedule */}
              {service.has_schedules && service.schedules && service.schedules.length > 0 && (
                <section className="schedule-section">
                  <h2>Service Schedule ({service.schedule_count} days)</h2>
                  <div className="schedule-list">
                    {getOrderedSchedules().map((schedule) => (
                      <div key={schedule.id} className="schedule-item">
                        <div className="schedule-day">{schedule.schedule_day}</div>
                        <div className="schedule-time">{schedule.start_time} - {schedule.end_time}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Additional Details */}
              <section className="additional-section">
                <h2>Additional Information</h2>
                <div className="additional-grid">
                  <div className="additional-item">
                    <label>Service ID</label>
                    <span>{service.id}</span>
                  </div>
                  <div className="additional-item">
                    <label>Provider ID</label>
                    <span>{service.provider_id}</span>
                  </div>
                  <div className="additional-item">
                    <label>Created</label>
                    <span>{service.created_at ? new Date(service.created_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  <div className="additional-item">
                    <label>Last Updated</label>
                    <span>{service.updated_at ? new Date(service.updated_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Edit Service Modal */}
          {editingService && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Edit Service</h2>
                  <button className="modal-close" onClick={handleCancelEdit}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="modal-body">
                  {/* Basic Information Section */}
                  <div className="form-section">
                    <h3 className="form-section-title">Basic Information</h3>

                    <div className="form-group">
                      <label htmlFor="category_id">Service Category</label>
                      <select
                        id="category_id"
                        value={formData.category_id}
                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                        required
                        disabled={loadingCategories}
                      >
                        <option value="">
                          {loadingCategories ? 'Loading categories...' : 'Select a category'}
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id.toString()}>
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                      {loadingCategories && (
                        <small style={{ color: '#6b7280', display: 'block', marginTop: '0.5rem' }}>Loading categories...</small>
                      )}
                      {categories.length === 0 && !loadingCategories && (
                        <small style={{ color: '#ef4444', display: 'block', marginTop: '0.5rem' }}>No registered categories found. Please register for service categories first.</small>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="service_title">Service Title</label>
                      <input
                        type="text"
                        id="service_title"
                        value={formData.service_title}
                        onChange={(e) => handleInputChange('service_title', e.target.value)}
                        placeholder="Enter service title"
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
                        placeholder="Provide a detailed description of your service..."
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
                          placeholder="Enter price (e.g., 500.00)"
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
                          placeholder="Duration in minutes (e.g., 60)"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        />
                        <span className="checkbox-text">Service is active and available for booking</span>
                      </label>
                    </div>
                  </div>

                  {/* Photo Management Section */}
                  <div className="form-section">
                    <h3 className="form-section-title">Photo Management</h3>


                    {/* Existing Photos */}
                    {existingPhotos.length > 0 && (
                      <div className="existing-photos">
                        <small className="section-label">Current Photos:</small>
                        <div className="photo-grid">
                          {existingPhotos.map((photo) => (
                            <div key={photo.id} className="photo-item-edit">
                              <img src={photo.photo_url} alt="Service photo" />
                              <button
                                type="button"
                                onClick={() => markPhotoForDeletion(photo.id)}
                                className="remove-photo-btn"
                                title="Mark for deletion"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photos marked for deletion */}
                    {getDeletedPhotos().length > 0 && (
                      <div className="deleted-photos">
                        <small className="section-label">Photos to be deleted:</small>
                        <div className="photo-list">
                          {getDeletedPhotos().map((photo) => (
                            <div key={photo.id} className="deleted-photo-item">
                              <span>Photo {photo.id}</span>
                              <button
                                type="button"
                                onClick={() => restorePhoto(photo)}
                                className="restore-photo-btn"
                              >
                                Restore
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Photo Upload */}
                    <div className="new-photos-section">
                      <small className="section-label">Add New Photos:</small>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleNewPhotoChange}
                      />
                      {newPhotos.length > 0 && (
                        <div className="selected-photos">
                          <small>{newPhotos.length} new photo(s) selected:</small>
                          <div className="photo-list">
                            {newPhotos.map((photo, index) => (
                              <div key={index} className="photo-item">
                                <span className="photo-name">{photo.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeNewPhoto(index)}
                                  className="remove-photo"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule Management Section */}
                  <div className="form-section">
                    <div className="schedule-header">
                      <label>Service Schedule</label>
                      <button
                        type="button"
                        onClick={addSchedule}
                        className="btn btn-outline btn-sm"
                      >
                        Add Schedule
                      </button>
                    </div>

                    <div className="schedule-notice">
                      <small style={{ color: '#10b981', display: 'block', marginBottom: '1rem', background: '#d1fae5', padding: '0.75rem', borderRadius: '6px', border: '1px solid #10b981' }}>
                        ✅ <strong>Note:</strong> Schedule changes will be saved along with other service updates.
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
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
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
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveService}
                    disabled={saving || !formData.service_title.trim()}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
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

export default ProviderServiceFullDetails;