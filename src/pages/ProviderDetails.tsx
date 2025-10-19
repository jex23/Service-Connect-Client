import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicServicesService } from '../service/publicServicesService';
import { bookingService } from '../service/bookingService';
import ServiceCard from '../components/ServiceCard';
import type { Provider, PublicService } from '../types/publicServices';
import type { ServiceBookingRequest } from '../types/booking';
import './ProviderDetails.css';

const ProviderDetails: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Booking states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<PublicService | null>(null);
  const [bookingForm, setBookingForm] = useState<ServiceBookingRequest>({
    user_id: 1, // TODO: Get from auth context
    provider_service_id: 0,
    booking_date: '',
    booking_day: '',
    booking_time: '',
    status: 'Pending'
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    console.log('=== PROVIDER DETAILS COMPONENT MOUNT ===');
    console.log('providerId from URL params:', providerId);
    console.log('providerId type:', typeof providerId);
    
    if (providerId) {
      const numericId = parseInt(providerId);
      console.log('Parsed numeric ID:', numericId);
      console.log('Is valid number:', !isNaN(numericId));
      
      if (!isNaN(numericId)) {
        fetchProviderDetails(numericId);
      } else {
        console.error('Invalid provider ID - not a number:', providerId);
        navigate('/');
      }
    } else {
      console.log('No provider ID provided, redirecting to home');
      navigate('/');
    }
  }, [providerId, navigate]);

  const fetchProviderDetails = async (id: number) => {
    try {
      setLoading(true);
      setServicesLoading(true);
      
      console.log('=== PROVIDER DETAILS DEBUG ===');
      console.log('Fetching provider details for ID:', id);
      console.log('ID type:', typeof id);
      
      // Fetch provider services since there's no individual provider endpoint
      console.log('Attempting to fetch provider services...');
      const response = await publicServicesService.getProviderServices(id, {
        active: true,
        limit: 50
      });
      
      console.log('Provider services response:', response);
      console.log('Services count:', response.services?.length || 0);
      console.log('Provider from response root:', response.provider);
      
      if (response.services && response.services.length > 0) {
        console.log('Found services for provider. Using provider info from response root.');
        console.log('First service:', response.services[0]);
        console.log('Provider from first service:', response.services[0].provider);
        console.log('Provider from response root:', response.provider);
        
        // Check if provider info is at response root level or in service
        const serviceProvider = response.provider || response.services[0].provider;
        
        if (!serviceProvider) {
          console.error('No provider found in response root or service');
          console.log('Full response structure:', JSON.stringify(response, null, 2));
          setProvider(null);
          setServices([]);
          return;
        }
        
        console.log('Found service provider:', serviceProvider);
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
        
        // Add provider information to each service since ServiceCard expects it
        const servicesWithProvider = response.services.map(service => ({
          ...service,
          provider: serviceProvider
        }));

        // Filter to only show active services
        const activeServices = servicesWithProvider.filter(service => service.is_active === true);

        console.log('Services with provider:', servicesWithProvider);
        console.log('Active services only:', activeServices);
        setProvider(convertedProvider);
        setServices(activeServices);
        console.log('Provider set successfully from services');
      } else {
        console.log('No services found for provider. Trying general providers list...');
        
        // Try to get provider from general providers list
        const providersResponse = await publicServicesService.getProviders({
          active: true,
          limit: 100
        });
        
        console.log('General providers response:', providersResponse);
        console.log('Total providers found:', providersResponse.providers?.length || 0);
        console.log('Looking for provider with ID:', id);
        
        const foundProvider = providersResponse.providers.find(p => {
          console.log('Checking provider:', p.id, 'against target:', id, 'match:', p.id === id);
          return p.id === id;
        });
        
        if (foundProvider) {
          console.log('Found provider in general list:', foundProvider);
          setProvider(foundProvider);
        } else {
          console.log('Provider not found in general list');
          console.log('Available provider IDs:', providersResponse.providers.map(p => p.id));
          setProvider(null);
        }
        setServices([]);
      }
    } catch (error) {
      console.error('=== ERROR IN FETCH PROVIDER DETAILS ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Provider ID that failed:', id);
      setProvider(null);
      setServices([]);
    } finally {
      setLoading(false);
      setServicesLoading(false);
      console.log('=== PROVIDER DETAILS FETCH COMPLETE ===');
    }
  };

  const getDisplayName = () => {
    if (!provider) return '';
    return provider.business_name || provider.full_name;
  };

  const handleServiceClick = (item: PublicService | Provider) => {
    if ('service_title' in item) {
      // It's a PublicService
      navigate(`/service/${item.id}`);
    }
  };

  const handleBookService = (service: PublicService) => {
    setSelectedService(service);
    setBookingForm(prev => ({
      ...prev,
      provider_service_id: service.id
    }));
    setShowBookingModal(true);
    setBookingError(null);
    setBookingSuccess(false);
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const handleBookingFormChange = (field: keyof ServiceBookingRequest, value: string | number) => {
    setBookingForm(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate booking_day when booking_date changes
      if (field === 'booking_date' && typeof value === 'string') {
        updated.booking_day = getDayOfWeek(value);
      }

      return updated;
    });
    setBookingError(null);
  };

  const validateBookingForm = (): string | null => {
    if (!bookingForm.user_id) return 'User ID is required';
    if (!bookingForm.provider_service_id) return 'Service is required';
    if (!bookingForm.booking_date) return 'Booking date is required';
    if (!bookingForm.booking_day) return 'Booking day is required';
    if (!bookingForm.booking_time) return 'Booking time is required';

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(bookingForm.booking_date)) {
      return 'Booking date must be in YYYY-MM-DD format';
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(bookingForm.booking_time)) {
      return 'Booking time must be in HH:MM format';
    }

    // Validate booking day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(bookingForm.booking_day)) {
      return 'Invalid booking day';
    }

    // Validate date is not in the past
    const bookingDate = new Date(bookingForm.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return 'Booking date cannot be in the past';
    }

    return null;
  };

  const handleBookingSubmit = async () => {
    const validationError = validateBookingForm();
    if (validationError) {
      setBookingError(validationError);
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const response = await bookingService.createServiceBooking(bookingForm);
      console.log('Booking created successfully:', response);
      setBookingSuccess(true);

      // Reset form after successful booking
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setSelectedService(null);
        setBookingForm({
          user_id: 1,
          provider_service_id: 0,
          booking_date: '',
          booking_day: '',
          booking_time: '',
          status: 'Pending'
        });
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
    setBookingError(null);
    setBookingSuccess(false);
    setBookingForm({
      user_id: 1,
      provider_service_id: 0,
      booking_date: '',
      booking_day: '',
      booking_time: '',
      status: 'Pending'
    });
  };

  if (loading) {
    return (
      <div className="provider-details-container">
        <div className="loading-state">
          <p>Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-details-container">
        <div className="error-state">
          <h2>Provider Not Found</h2>
          <p>The requested provider could not be found.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-details-container">
      <header className="provider-details-header">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Home
        </button>
      </header>

      <div className="provider-details-content">
        {/* Provider Info Section */}
        <section className="provider-info-section">
          <div className="provider-header">
            {provider.image_logo && (
              <div className="provider-logo">
                <img
                  src={provider.image_logo}
                  alt={`${getDisplayName()} logo`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="provider-basic-info">
              <h1 className="provider-name">{getDisplayName()}</h1>
              <p className="provider-address">{provider.address}</p>
              {provider.email && (
                <p className="provider-contact">
                  Email: <a href={`mailto:${provider.email}`}>{provider.email}</a>
                </p>
              )}
              {provider.contact_number && (
                <p className="provider-contact">
                  Phone: <a href={`tel:${provider.contact_number}`}>{provider.contact_number}</a>
                </p>
              )}
            </div>
          </div>
          
          {provider.about && (
            <div className="provider-description">
              <h3>About</h3>
              <p>{provider.about}</p>
            </div>
          )}
        </section>

        {/* Services Section */}
        <section className="provider-services-section">
          <h2>Services Offered</h2>
          {servicesLoading ? (
            <p>Loading services...</p>
          ) : services.length > 0 ? (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-card-wrapper">
                  <ServiceCard
                    service={service}
                    compact={true}
                    onClick={handleServiceClick}
                  />
                  <button
                    className="book-service-btn"
                    onClick={() => handleBookService(service)}
                  >
                    Book This Service
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-services">
              <p>This provider currently has no active services.</p>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="provider-contact-section">
          <h3>Get in Touch</h3>
          <div className="contact-actions">
            {provider.email && (
              <button 
                className="contact-btn email-btn"
                onClick={() => {
                  window.location.href = `mailto:${provider.email}?subject=Service Inquiry`;
                }}
              >
                Send Email
              </button>
            )}
            {provider.contact_number && (
              <button 
                className="contact-btn phone-btn"
                onClick={() => {
                  window.location.href = `tel:${provider.contact_number}`;
                }}
              >
                Call Now
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="booking-modal-header">
              <h3>Book Service: {selectedService.service_title}</h3>
              <button className="close-modal-btn" onClick={closeBookingModal}>
                ×
              </button>
            </div>

            <div className="booking-modal-content">
              {bookingSuccess ? (
                <div className="booking-success">
                  <h4>✅ Booking Successful!</h4>
                  <p>Your booking has been created successfully. You will receive a confirmation shortly.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleBookingSubmit(); }}>
                  <div className="booking-form-group">
                    <label htmlFor="booking-date">Booking Date *</label>
                    <input
                      id="booking-date"
                      type="date"
                      value={bookingForm.booking_date}
                      onChange={(e) => handleBookingFormChange('booking_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="booking-form-group">
                    <label htmlFor="booking-day">Day of Week</label>
                    <input
                      id="booking-day"
                      type="text"
                      value={bookingForm.booking_day}
                      disabled
                      placeholder="Select a date first"
                    />
                  </div>

                  <div className="booking-form-group">
                    <label htmlFor="booking-time">Booking Time *</label>
                    <input
                      id="booking-time"
                      type="time"
                      value={bookingForm.booking_time}
                      onChange={(e) => handleBookingFormChange('booking_time', e.target.value)}
                      required
                    />
                  </div>

                  <div className="booking-form-group">
                    <label htmlFor="booking-status">Status</label>
                    <select
                      id="booking-status"
                      value={bookingForm.status}
                      onChange={(e) => handleBookingFormChange('status', e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {bookingError && (
                    <div className="booking-error">
                      <p>{bookingError}</p>
                    </div>
                  )}

                  <div className="booking-form-actions">
                    <button
                      type="button"
                      className="cancel-booking-btn"
                      onClick={closeBookingModal}
                      disabled={bookingLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-booking-btn"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Creating Booking...' : 'Create Booking'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetails;