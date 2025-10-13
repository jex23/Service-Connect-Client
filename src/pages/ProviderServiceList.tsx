import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoChatbubbleEllipsesSharp } from 'react-icons/io5';
import { publicServicesService } from '../service/publicServicesService';
import { authService } from '../service/authService';
import { userReportService } from '../service/userReportService';
import type { Provider, PublicService, ServiceProvider } from '../types/publicServices';
import './ProviderServiceList.css';

const ProviderServiceList: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedService, setSelectedService] = useState<PublicService | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    report_target: 'provider' as 'provider' | 'service',
    report_type: 'service_quality' as const,
    subject: '',
    description: ''
  });

  useEffect(() => {
    console.log('=== PROVIDER SERVICE LIST COMPONENT MOUNT ===');
    console.log('providerId from URL params:', providerId);
    console.log('providerId type:', typeof providerId);
    
    if (providerId) {
      const numericId = parseInt(providerId);
      console.log('Parsed numeric ID:', numericId);
      console.log('Is valid number:', !isNaN(numericId));
      
      if (!isNaN(numericId)) {
        fetchProviderServices(numericId);
      } else {
        console.error('Invalid provider ID - not a number:', providerId);
        navigate('/');
      }
    } else {
      console.log('No provider ID provided, redirecting to home');
      navigate('/');
    }
  }, [providerId, navigate]);

  const fetchProviderServices = async (id: number) => {
    try {
      setLoading(true);
      
      console.log('=== PROVIDER SERVICE LIST DEBUG ===');
      console.log('Fetching provider services for ID:', id);
      console.log('ID type:', typeof id);
      
      // Fetch provider services
      console.log('Attempting to fetch provider services...');
      const response = await publicServicesService.getProviderServices(id, {
        active: true,
        limit: 50
      });
      
      console.log('Provider services response:', response);
      console.log('Services count:', response.services?.length || 0);
      console.log('Provider from response root:', response.provider);
      
      if (response.services && response.services.length > 0) {
        console.log('Found services for provider');
        console.log('First service:', response.services[0]);
        
        // Get provider info from response root
        const serviceProvider = response.provider;
        
        if (serviceProvider) {
          console.log('Found service provider:', serviceProvider);
          
          // Convert ServiceProvider to Provider
          const convertedProvider: Provider = {
            id: serviceProvider.id,
            business_name: serviceProvider.business_name,
            full_name: serviceProvider.full_name,
            email: serviceProvider.email || '',
            contact_number: undefined,
            address: serviceProvider.address,
            bir_id_front: null,
            bir_id_back: null,
            business_permit: null,
            image_logo: serviceProvider.image_logo || null,
            about: serviceProvider.about || null,
            is_active: true,
            created_at: null,
            updated_at: null
          };
          
          console.log('Converted provider:', convertedProvider);
          setProvider(convertedProvider);
          setServices(response.services);
          console.log('Provider and services set successfully');
        } else {
          console.error('No provider found in response root');
          setProvider(null);
          setServices([]);
        }
      } else {
        console.log('No services found for provider');
        setProvider(null);
        setServices([]);
      }
    } catch (error) {
      console.error('=== ERROR IN FETCH PROVIDER SERVICES ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Provider ID that failed:', id);
      setProvider(null);
      setServices([]);
    } finally {
      setLoading(false);
      console.log('=== PROVIDER SERVICE LIST FETCH COMPLETE ===');
      console.log('Final state - Provider:', provider);
      console.log('Final state - Services count:', services.length);
      console.log('Final state - Loading:', false);
    }
  };

  const getDisplayName = () => {
    if (!provider) return '';
    return provider.business_name || provider.full_name;
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return `₱${price.toFixed(2)}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleServiceClick = (service: PublicService) => {
    navigate(`/service/${service.id}`);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      alert('Please log in to message providers');
      navigate('/login');
      return;
    }

    const userType = authService.getStoredUserType();

    // Only users can message providers
    if (userType !== 'user') {
      alert('Only users can message providers. Please log in with a user account.');
      return;
    }

    // Navigate to chat page with provider info
    if (provider) {
      navigate('/user-chat', {
        state: {
          providerId: provider.id,
          providerName: provider.business_name || provider.full_name
        }
      });
    }
  };

  const handleReportClick = () => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      alert('Please log in to report');
      navigate('/login');
      return;
    }

    const userType = authService.getStoredUserType();

    // Only users can report
    if (userType !== 'user') {
      alert('Only users can report. Please log in with a user account.');
      return;
    }

    setShowReportModal(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    setSelectedService(null);
    setReportFormData({
      report_target: 'provider',
      report_type: 'service_quality',
      subject: '',
      description: ''
    });
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setSelectedService(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleReportFormChange = (field: string, value: string) => {
    setReportFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submitData: any = {
        provider_id: provider.id,
        report_type: reportFormData.report_type,
        subject: reportFormData.subject,
        description: reportFormData.description
      };

      // Only include service ID if reporting a service and one is selected
      if (reportFormData.report_target === 'service' && selectedService) {
        submitData.provider_service_id = selectedService.id;
      }

      await userReportService.createReport(submitData);
      setSubmitSuccess(true);

      // Close modal after a short delay
      setTimeout(() => {
        handleCloseReportModal();
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('=== RENDER DEBUG ===');
  console.log('Render state - Loading:', loading);
  console.log('Render state - Provider:', provider);
  console.log('Render state - Services count:', services.length);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="provider-service-list-container">
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
    );
  }

  if (!provider) {
    console.log('Rendering error state - no provider');
    return (
      <div className="provider-service-list-container">
        <main className="provider-main">
          <div className="empty-state">
            <h2>Provider Not Found</h2>
            <p>The requested provider could not be found.</p>
            <button onClick={handleBackClick} className="back-btn-primary">
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  console.log('Rendering main content');
  console.log('Display name:', getDisplayName());
  console.log('Provider address:', provider.address);
  console.log('Services to render:', services);

  return (
    <div className="provider-service-list-container">
      <main className="provider-main">
        {/* Back Button */}
        <button onClick={handleBackClick} className="back-btn">
          ← Back
        </button>

        {/* Provider Header Section */}
        <section className="provider-hero">
          <div className="provider-hero-content">
            {provider.image_logo && (
              <div className="provider-avatar">
                <img
                  src={provider.image_logo}
                  alt={`${getDisplayName()} logo`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="provider-details">
              <h1 className="provider-name">{getDisplayName()}</h1>
              {provider.address && (
                <div className="provider-info-item">
                  <span className="provider-label">Address:</span>
                  <span className="provider-value">{provider.address}</span>
                </div>
              )}
              {provider.email && (
                <div className="provider-info-item">
                  <span className="provider-label">Email:</span>
                  <a href={`mailto:${provider.email}`} className="provider-contact-link">
                    {provider.email}
                  </a>
                </div>
              )}
            </div>
            <div className="provider-action-buttons">
              <button
                onClick={handleMessageClick}
                className="provider-message-btn"
              >
                <IoChatbubbleEllipsesSharp size={18} />
                Message Provider
              </button>
              <button
                onClick={handleReportClick}
                className="provider-report-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Report
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        {provider.about && (
          <section className="provider-about-section">
            <h2>About</h2>
            <p>{provider.about}</p>
          </section>
        )}

        {/* Services Section */}
        <section className="services-section">
          <div className="section-header">
            <div className="section-header-left">
              <h3>Available Services</h3>
              <p>{services.length} {services.length === 1 ? 'service' : 'services'} available</p>
            </div>
          </div>

          {services.length > 0 ? (
            <div className="services-grid">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="service-card"
                  onClick={() => handleServiceClick(service)}
                >
                  {service.has_photos && service.photos && service.photos.length > 0 && (
                    <div className="service-card-image">
                      <img
                        src={service.photos[0].photo_url}
                        alt={service.service_title}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="service-card-content">
                    <h3 className="service-card-title">{service.service_title}</h3>
                    <span className="service-card-category">{service.category.category_name}</span>

                    {service.service_description && (
                      <p className="service-card-description">
                        {service.service_description.length > 120
                          ? `${service.service_description.substring(0, 120)}...`
                          : service.service_description
                        }
                      </p>
                    )}

                    <div className="service-card-footer">
                      <div className="service-card-meta">
                        {service.duration_minutes && (
                          <span className="service-duration">
                            ⏱ {formatDuration(service.duration_minutes)}
                          </span>
                        )}
                      </div>
                      <div className="service-card-price">
                        {formatPrice(service.price_decimal)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>This provider currently has no active services.</p>
            </div>
          )}
        </section>
      </main>

      {/* Report Modal */}
      {showReportModal && provider && (
        <div className="modal-overlay" onClick={handleCloseReportModal}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report Provider or Service</h3>
              <button className="modal-close" onClick={handleCloseReportModal}>×</button>
            </div>

            <form onSubmit={handleSubmitReport}>
              <div className="modal-body">
                {submitSuccess ? (
                  <div className="success-message">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <h4>Report Submitted Successfully</h4>
                    <p>Thank you for your report. Our team will review it shortly.</p>
                  </div>
                ) : (
                  <>
                    {submitError && (
                      <div className="error-message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {submitError}
                      </div>
                    )}

                    <div className="form-group">
                      <label>What would you like to report?</label>
                      <div className="report-target-selection">
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="report_target"
                            value="provider"
                            checked={reportFormData.report_target === 'provider'}
                            onChange={(e) => {
                              handleReportFormChange('report_target', e.target.value);
                              setSelectedService(null);
                            }}
                          />
                          <div className="radio-content">
                            <span className="radio-title">Report Provider</span>
                            <span className="radio-description">Report general issues with {provider.business_name || provider.full_name}</span>
                          </div>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name="report_target"
                            value="service"
                            checked={reportFormData.report_target === 'service'}
                            onChange={(e) => handleReportFormChange('report_target', e.target.value)}
                          />
                          <div className="radio-content">
                            <span className="radio-title">Report a Service</span>
                            <span className="radio-description">Report issues with a specific service</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {reportFormData.report_target === 'service' && (
                      <div className="form-group">
                        <label htmlFor="service_select">
                          Select Service <span className="required">*</span>
                        </label>
                        <select
                          id="service_select"
                          value={selectedService?.id || ''}
                          onChange={(e) => {
                            const service = services.find(s => s.id === parseInt(e.target.value));
                            setSelectedService(service || null);
                          }}
                          required={reportFormData.report_target === 'service'}
                        >
                          <option value="">Select a service</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.service_title} - {service.category.category_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <label htmlFor="report_type">
                        Report Type <span className="required">*</span>
                      </label>
                      <select
                        id="report_type"
                        value={reportFormData.report_type}
                        onChange={(e) => handleReportFormChange('report_type', e.target.value)}
                        required
                      >
                        <option value="service_quality">Service Quality</option>
                        <option value="provider_behavior">Provider Behavior</option>
                        <option value="payment_issue">Payment Issue</option>
                        <option value="cancellation">Cancellation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">
                        Subject <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={reportFormData.subject}
                        onChange={(e) => handleReportFormChange('subject', e.target.value)}
                        required
                        placeholder="Brief summary of your complaint"
                        maxLength={200}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">
                        Description <span className="required">*</span>
                      </label>
                      <textarea
                        id="description"
                        value={reportFormData.description}
                        onChange={(e) => handleReportFormChange('description', e.target.value)}
                        required
                        placeholder="Provide detailed information about your complaint..."
                        rows={6}
                      />
                    </div>
                  </>
                )}
              </div>

              {!submitSuccess && (
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseReportModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderServiceList;