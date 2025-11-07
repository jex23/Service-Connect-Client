import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicServicesService } from '../service/publicServicesService';
import { bookingService } from '../service/bookingService';
import { authService } from '../service/authService';
import { userReportService } from '../service/userReportService';
import type { ServiceDetailResponse, ServicePhoto, ServiceSchedule, ServiceCategory } from '../types/publicServices';
import type { ServiceBookingRequest, BookingCalendarResponse, BookingScheduleCheckResponse } from '../types/booking';

// Compatibility type for the transformed service data
interface TransformedService {
  id: number;
  service_title: string;
  service_description?: string;
  price_decimal?: number;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category: ServiceCategory;
  provider: {
    id: number;
    business_name?: string;
    full_name: string;
    address: string;
    about?: string;
    email?: string;
    image_logo?: string;
  };
  photos: ServicePhoto[];
  photo_count: number;
  has_photos: boolean;
  schedules: ServiceSchedule[];
  schedule_count: number;
  has_schedule: boolean;
  other_services: {
    id: number;
    service_title: string;
    price_decimal?: number;
  }[];
}
import './ServiceDetails.css';

const ServiceDetails: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<TransformedService | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Calendar state
  const [calendarData, setCalendarData] = useState<BookingCalendarResponse>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<BookingScheduleCheckResponse | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  // Month navigation state
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Booking result modal state
  const [showBookingResultModal, setShowBookingResultModal] = useState(false);
  const [bookingResultType, setBookingResultType] = useState<'success' | 'error'>('success');
  const [bookingResultMessage, setBookingResultMessage] = useState('');

  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    report_target: 'service' as 'provider' | 'service',
    report_type: 'service_quality' as const,
    subject: '',
    description: ''
  });

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails(parseInt(serviceId));
    } else {
      navigate('/');
    }

    // Check authentication
    if (authService.isAuthenticated()) {
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setIsAuthenticated(true);
        setUser(storedUser);
      }
    }
  }, [serviceId, navigate]);

  const fetchServiceDetails = async (id: number) => {
    try {
      setLoading(true);
      console.log('Fetching service details for ID:', id);
      const response = await publicServicesService.getServiceDetail(id);
      console.log('Service details response:', response);
      
      // Transform the response to match the old structure
      if (response && response.main_service) {
        const transformedService: TransformedService = {
          id: response.main_service.id,
          service_title: response.main_service.service_title,
          service_description: response.main_service.service_description,
          price_decimal: response.main_service.price_decimal,
          duration_minutes: response.main_service.duration_minutes,
          is_active: response.main_service.is_active,
          created_at: response.main_service.created_at,
          updated_at: response.main_service.updated_at,
          category: response.main_service.category,
          provider: response.provider,
          photos: response.main_service.provider_service_photos.map(photo => ({
            id: photo.id,
            photo_url: photo.photo_url,
            sort_order: photo.sort_order,
            created_at: photo.created_at
          })),
          photo_count: response.main_service.photo_count,
          has_photos: response.main_service.has_photos,
          schedules: response.main_service.schedules,
          schedule_count: response.main_service.schedule_count,
          has_schedule: response.main_service.has_schedule,
          other_services: response.provider_services
            .filter(service => service.id !== response.main_service.id)
            .map(service => ({
              id: service.id,
              service_title: service.service_title,
              price_decimal: service.price_decimal
            }))
        };
        
        console.log('Transformed service:', transformedService);
        setService(transformedService);
        
        // Also fetch calendar data for this service
        if (response.provider?.id) {
          await fetchCalendarData(response.provider.id);
        }
      } else {
        console.error('Invalid response structure:', response);
        setService(null);
      }
    } catch (error) {
      console.error('Failed to fetch service details:', error);
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async (providerId: number) => {
    try {
      setCalendarLoading(true);
      const response = await bookingService.getBookingCalendar({ 
        provider_id: providerId 
      });
      setCalendarData(response);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      setCalendarData([]);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Month navigation functions
  const goToPreviousMonth = () => {
    setCurrentCalendarMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    setSelectedCalendarDate(null); // Clear selected date when changing months
    setScheduleData(null);
  };

  const goToNextMonth = () => {
    setCurrentCalendarMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    setSelectedCalendarDate(null); // Clear selected date when changing months
    setScheduleData(null);
  };

  const goToCurrentMonth = () => {
    setCurrentCalendarMonth(new Date());
    setSelectedCalendarDate(null);
    setScheduleData(null);
  };

  // Check if a date matches the provider's schedule
  const isDateAvailable = (date: Date): boolean => {
    if (!service || !service.has_schedule || service.schedules.length === 0) {
      return false;
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return service.schedules.some(schedule => schedule.schedule_day === dayName);
  };

  // Generate calendar grid for selected month
  const generateCalendarGrid = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const calendar = [];
    const current = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        // Use local date formatting to avoid timezone issues
        const year = current.getFullYear();
        const month_num = (current.getMonth() + 1).toString().padStart(2, '0');
        const day_num = current.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month_num}-${day_num}`;
        const dayBookings = calendarData.find(d => d.date === dateStr)?.bookings || [];
        const dateObj = new Date(current);
        dateObj.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

        weekDays.push({
          date: new Date(current),
          dateStr,
          isCurrentMonth: current.getMonth() === month,
          isToday: current.toDateString() === now.toDateString(),
          isPastDate: dateObj < now, // Check if date is in the past
          bookings: dayBookings,
          isAvailable: isDateAvailable(dateObj)
        });

        current.setDate(current.getDate() + 1);
      }
      calendar.push(weekDays);

      if (current.getMonth() !== month && week >= 4) break;
    }

    return calendar;
  };

  // Handle calendar day click
  const handleCalendarDayClick = async (dateStr: string, isCurrentMonth: boolean, isPastDate: boolean) => {
    if (!isCurrentMonth || !service || isPastDate) return; // Don't allow clicking on other month dates or past dates

    setSelectedCalendarDate(dateStr);
    setScheduleLoading(true);
    
    try {
      // Parse date string parts to avoid timezone issues
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      const scheduleRequest = {
        provider_service_id: service.id,
        booking_day: dayName,
        date: dateStr
      };
      
      const response = await bookingService.checkBookingSchedule(scheduleRequest);
      setScheduleData(response);
    } catch (error) {
      console.error('Failed to fetch schedule data:', error);
      setScheduleData(null);
    } finally {
      setScheduleLoading(false);
    }
  };


  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return `₱${price.toFixed(2)}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Duration not specified';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
  };

  const getDisplayName = () => {
    if (!service) return '';
    return service.provider.business_name || service.provider.full_name;
  };

  const nextPhoto = () => {
    if (service && service.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % service.photos.length);
    }
  };

  const prevPhoto = () => {
    if (service && service.photos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + service.photos.length) % service.photos.length);
    }
  };

  const getOrderedSchedules = () => {
    if (!service || !service.has_schedule || service.schedules.length === 0) {
      return [];
    }

    // Define day order for sorting
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Sort schedules by day of week
    return service.schedules.sort((a, b) => {
      return dayOrder.indexOf(a.schedule_day) - dayOrder.indexOf(b.schedule_day);
    });
  };

  const handleBookService = () => {
    if (!isAuthenticated) {
      alert('Please login to book this service');
      navigate('/login');
      return;
    }

    if (!service?.has_schedule || service.schedules.length === 0) {
      alert('This service has no available schedule');
      return;
    }

    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    // Prevent duplicate submissions
    if (bookingLoading) {
      console.log('Booking already in progress, ignoring duplicate submission');
      return;
    }

    if (!service || !user || !selectedDate || !selectedDay || !selectedTime) {
      setBookingResultType('error');
      setBookingResultMessage('Please select a date, day and time');
      setShowBookingResultModal(true);
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData: ServiceBookingRequest = {
        user_id: user.id,
        provider_service_id: service.id,
        booking_date: selectedDate,
        booking_day: selectedDay,
        booking_time: selectedTime,
        status: 'Pending'
      };

      console.log('Creating booking:', bookingData);
      const response = await bookingService.createServiceBooking(bookingData);
      console.log('Booking response:', response);

      // Create payment status with Pending status
      const paymentData = {
        booking_id: response.booking.id,
        status: 'Pending' as const
      };

      console.log('Creating payment status:', paymentData);
      await bookingService.createPaymentStatus(paymentData);
      console.log('Payment status created successfully');

      // Show success modal
      setBookingResultType('success');
      setBookingResultMessage('Booking created successfully! The provider will contact you soon.');
      setShowBookingResultModal(true);

      // Close booking modal and reset form
      setShowBookingModal(false);
      setSelectedDate('');
      setSelectedDay('');
      setSelectedTime('');
      setSelectedCalendarDate(null);
      setScheduleData(null);

      // Refresh calendar data to show the new booking
      if (service.provider?.id) {
        await fetchCalendarData(service.provider.id);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      // Show error modal
      setBookingResultType('error');
      setBookingResultMessage(error instanceof Error ? error.message : 'Booking failed. Please try again.');
      setShowBookingResultModal(true);
    } finally {
      setBookingLoading(false);
    }
  };

  const getAvailableTimeSlots = (day: string) => {
    const schedule = service?.schedules.find(s => s.schedule_day === day);
    if (!schedule) return [];

    const slots = [];
    const startTime = new Date(`2000-01-01T${schedule.start_time}:00`);
    const endTime = new Date(`2000-01-01T${schedule.end_time}:00`);

    // Generate 30-minute slots
    for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + 30)) {
      const timeStr = time.toTimeString().substring(0, 5);
      slots.push(timeStr);
    }

    return slots;
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      alert('Please log in to report');
      navigate('/login');
      return;
    }

    const userType = authService.getStoredUserType();
    if (userType !== 'user') {
      alert('Only users can report. Please log in with a user account.');
      return;
    }

    setShowReportModal(true);
    setReportError(null);
    setReportSuccess(false);
    setReportFormData({
      report_target: 'service',
      report_type: 'service_quality',
      subject: '',
      description: ''
    });
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportError(null);
    setReportSuccess(false);
  };

  const handleReportFormChange = (field: string, value: string) => {
    setReportFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    setIsSubmittingReport(true);
    setReportError(null);

    try {
      const submitData: any = {
        provider_id: service.provider.id,
        report_type: reportFormData.report_type,
        subject: reportFormData.subject,
        description: reportFormData.description
      };

      // Only include service ID if reporting the service
      if (reportFormData.report_target === 'service') {
        submitData.provider_service_id = service.id;
      }

      await userReportService.createReport(submitData);
      setReportSuccess(true);

      // Close modal after a short delay
      setTimeout(() => {
        handleCloseReportModal();
      }, 2000);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="service-details-container">
        {/* Full Page Loading Overlay */}
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <div className="loading-text">Loading Service Details</div>
            <div className="loading-subtext">
              Please wait<span className="loading-dots"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-details-container">
        <main className="service-main">
          <div className="error-state">
            <h2>Service Not Found</h2>
            <p>The requested service could not be found.</p>
            <button onClick={() => navigate('/')} className="back-btn-primary">
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="service-details-container">
      <main className="service-main">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>

        <div className="service-details-content">
          {/* Left Column - Gallery and Schedule */}
          <div className="left-column">
          {/* Photo Gallery */}
          {service.has_photos && (
            <section className="photo-gallery">
              <div className="main-photo">
                <img
                  src={service.photos[currentPhotoIndex]?.photo_url}
                  alt={service.service_title}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-service.jpg';
                  }}
                />
                {service.photos.length > 1 && (
                  <>
                    <button className="photo-nav prev" onClick={prevPhoto}>‹</button>
                    <button className="photo-nav next" onClick={nextPhoto}>›</button>
                    <div className="photo-indicators">
                      {service.photos.map((_, index) => (
                        <button
                          key={index}
                          className={`indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                          onClick={() => setCurrentPhotoIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {service.photos.length > 1 && (
                <div className="photo-thumbnails">
                  {service.photos.map((photo, index) => (
                    <img
                      key={photo.id}
                      src={photo.photo_url}
                      alt={`${service.service_title} ${index + 1}`}
                      className={index === currentPhotoIndex ? 'active' : ''}
                      onClick={() => setCurrentPhotoIndex(index)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Schedule Information */}
          {service.has_schedule && (
            <section className="schedule-section">
              <h3>Availability Schedule</h3>
              <div className="schedule-info">
                {getOrderedSchedules().map((schedule) => (
                  <div key={schedule.id} className="schedule-group">
                    <div className="schedule-days">{schedule.schedule_day}</div>
                    <div className="schedule-time">
                      {schedule.start_time} - {schedule.end_time}
                    </div>
                  </div>
                ))}
              </div>
              <p className="schedule-note">
                Contact the provider to confirm availability and book your appointment.
              </p>
            </section>
          )}
        </div>

        {/* Right Column - Service Info */}
        <div className="right-column">
          {/* Service Title and Metadata */}
          <section className="service-header-section">
            <div className="service-category-badge">
              {service.category.category_name}
            </div>
            <h1 className="service-title">{service.service_title}</h1>
            <div className="service-meta-row">
              <div className="service-price-badge">{formatPrice(service.price_decimal)}</div>
              <div className="service-duration-badge">{formatDuration(service.duration_minutes)}</div>
            </div>
          </section>

          {/* Service Description */}
          {service.service_description && (
            <section className="service-description-section">
              <h3>Description</h3>
              <p>{service.service_description}</p>
            </section>
          )}

          {/* Provider Information */}
          <section className="provider-section">
            <h3>About the Provider</h3>
            <div className="provider-info">
              <div className="provider-info-row">
                <span className="provider-label">Name:</span>
                <span className="provider-value">{getDisplayName()}</span>
              </div>
              <div className="provider-info-row">
                <span className="provider-label">Address:</span>
                <span className="provider-value">{service.provider.address}</span>
              </div>
              {service.provider.email && (
                <div className="provider-info-row">
                  <span className="provider-label">Contact:</span>
                  <a href={`mailto:${service.provider.email}`} className="provider-value provider-email-link">
                    {service.provider.email}
                  </a>
                </div>
              )}
              {service.provider.about && (
                <div className="provider-info-row provider-about-row">
                  <span className="provider-label">About:</span>
                  <p className="provider-value provider-about-text">{service.provider.about}</p>
                </div>
              )}
            </div>
          </section>

          {/* Other Services */}
          {service.other_services.length > 0 && (
            <section className="other-services-section">
              <h3>Other Services from {getDisplayName()}</h3>
              <div className="other-services-list">
                {service.other_services.map((otherService) => (
                  <div key={otherService.id} className="other-service-item">
                    <span className="other-service-title">{otherService.service_title}</span>
                    <span className="other-service-price">
                      {formatPrice(otherService.price_decimal)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <section className="action-section">
            <button
              className="book-btn-primary"
              onClick={handleBookService}
              disabled={!service.has_schedule || service.schedules.length === 0}
            >
              {service.has_schedule && service.schedules.length > 0 ? 'Book Service' : 'No Schedule Available'}
            </button>
            <button
              className="contact-btn-secondary"
              onClick={() => {
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
                navigate('/user-chat', {
                  state: {
                    providerId: service.provider.id,
                    providerName: service.provider.business_name || service.provider.full_name
                  }
                });
              }}
            >
              Message Provider
            </button>
            <button
              className="report-btn-warning"
              onClick={handleReportClick}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Report
            </button>
          </section>
        </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="booking-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-header">
              <h3>Book Service</h3>
              <button className="close-modal" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            
            <div className="booking-modal-content">
              <div className="service-summary">
                <h4>{service.service_title}</h4>
                <p>by {getDisplayName()}</p>
                <p className="price">{formatPrice(service.price_decimal)}</p>
              </div>

              <div className="booking-form">
                {selectedDate && selectedDay && selectedTime && (
                  <div className="booking-summary-box">
                    <h4>Selected Booking</h4>
                    <div className="booking-summary-details">
                      <div className="summary-row">
                        <span className="summary-label">Date:</span>
                        <span className="summary-value">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">Time:</span>
                        <span className="summary-value">{selectedTime}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Calendar */}
                <div className="booking-calendar-section">
                  <div className="calendar-header">
                    <h4>Select Date & Time</h4>
                    <p className="calendar-instruction">Click on a date in the calendar, then select an available time slot below.</p>
                  </div>

                  {calendarLoading ? (
                    <p>Loading calendar...</p>
                  ) : (
                    <div className="calendar-grid-view">
                      <div className="calendar-month-header">
                        <button className="month-nav-btn" onClick={goToPreviousMonth}>
                          ‹
                        </button>
                        <div className="month-display">
                          <h5>{currentCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h5>
                          <button className="today-btn" onClick={goToCurrentMonth}>
                            Today
                          </button>
                        </div>
                        <button className="month-nav-btn" onClick={goToNextMonth}>
                          ›
                        </button>
                      </div>
                      <div className="calendar-grid">
                        <div className="calendar-weekdays">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="weekday-header">{day}</div>
                          ))}
                        </div>
                        <div className="calendar-days">
                          {generateCalendarGrid().map((week, weekIndex) => (
                            <div key={weekIndex} className="calendar-week">
                              {week.map((day, dayIndex) => (
                                <div
                                  key={dayIndex}
                                  className={`calendar-day-cell ${
                                    !day.isCurrentMonth ? 'other-month' : ''
                                  } ${day.isToday ? 'today' : ''} ${
                                    day.bookings.length > 0 ? 'has-bookings' : ''
                                  } ${selectedCalendarDate === day.dateStr ? 'selected' : ''} ${
                                    day.isCurrentMonth && !day.isPastDate ? 'clickable' : ''
                                  } ${day.isAvailable && day.isCurrentMonth && !day.isPastDate ? 'available-day' : ''} ${
                                    day.isPastDate ? 'past-date' : ''
                                  }`}
                                  onClick={() => handleCalendarDayClick(day.dateStr, day.isCurrentMonth, day.isPastDate)}
                                  style={{ cursor: day.isPastDate || !day.isCurrentMonth ? 'not-allowed' : 'pointer' }}
                                >
                                  <div className="day-number">{day.date.getDate()}</div>
                                  {day.bookings.length > 0 && (
                                    <div className="day-booking-indicator">
                                      <span className="booking-count">{day.bookings.length}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Time Availability for Selected Date */}
                      {selectedCalendarDate && (
                        <div className="time-availability-section">
                          <h5>
                            Time Availability for {(() => {
                              const [year, month, day] = selectedCalendarDate.split('-').map(Number);
                              const date = new Date(year, month - 1, day);
                              return date.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              });
                            })()}
                          </h5>
                          
                          {scheduleLoading ? (
                            <p>Loading schedule...</p>
                          ) : scheduleData ? (
                            scheduleData.schedule ? (
                              <div>
                                <p className="schedule-info">
                                  Available: {scheduleData.schedule.start_time} - {scheduleData.schedule.end_time}
                                </p>
                                <div className="time-slots-grid">
                                  {scheduleData.available_slots.map((timeSlot, index) => {
                                    // Handle both string and object formats
                                    let timeString: string;

                                    if (typeof timeSlot === 'string') {
                                      timeString = timeSlot;
                                    } else if (typeof timeSlot === 'object' && timeSlot !== null) {
                                      // Handle object format with time and is_available properties
                                      timeString = (timeSlot as any).time || (timeSlot as any).start_time || String(timeSlot);
                                    } else {
                                      timeString = String(timeSlot);
                                    }

                                    // A slot is booked ONLY if it exists in existing_bookings
                                    const isBooked = scheduleData.existing_bookings.some(
                                      booking => booking.booking_time === timeString
                                    );

                                    const isSelected = selectedTime === timeString && selectedDate === selectedCalendarDate;

                                    return (
                                      <div
                                        key={`${timeString}-${index}`}
                                        className={`time-slot ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => {
                                          if (!isBooked) {
                                            setSelectedTime(timeString);
                                            setSelectedDate(selectedCalendarDate);
                                            // Parse date string parts to avoid timezone issues
                                            const [year, month, day] = selectedCalendarDate.split('-').map(Number);
                                            const date = new Date(year, month - 1, day);
                                            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                                            setSelectedDay(dayName);
                                          }
                                        }}
                                      >
                                        <span className="time-text">{timeString}</span>
                                        <span className={`status-text ${isBooked ? 'booked' : isSelected ? 'selected' : 'available'}`}>
                                          {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Show existing bookings details */}
                                {scheduleData.existing_bookings.length > 0 && (
                                  <div className="existing-bookings-section">
                                    <h6>Existing Bookings:</h6>
                                    <div className="existing-bookings-list">
                                      {scheduleData.existing_bookings.map((booking) => (
                                        <div key={booking.id} className="existing-booking-item">
                                          <span className="booking-time">{booking.booking_time}</span>
                                          <span className={`booking-status ${booking.status.toLowerCase()}`}>
                                            {booking.status}
                                          </span>
                                          {booking.user && (
                                            <span className="booking-user">{booking.user.full_name}</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="no-availability">No service available on this day.</p>
                            )
                          ) : (
                            <p className="no-availability">Failed to load schedule data.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="booking-note">
                  <p><strong>Note:</strong> Your booking will be pending until the provider confirms it. You will receive a confirmation email once the provider accepts your booking.</p>
                </div>

                <div className="booking-modal-actions">
                  <button 
                    className="cancel-booking" 
                    onClick={() => setShowBookingModal(false)}
                    disabled={bookingLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="confirm-booking" 
                    onClick={handleBookingSubmit}
                    disabled={bookingLoading || !selectedDate || !selectedDay || !selectedTime}
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && service && (
        <div className="modal-overlay" onClick={handleCloseReportModal}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report Provider or Service</h3>
              <button className="modal-close" onClick={handleCloseReportModal}>×</button>
            </div>

            <form onSubmit={handleSubmitReport}>
              <div className="modal-body">
                {reportSuccess ? (
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
                    {reportError && (
                      <div className="error-message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {reportError}
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
                            onChange={(e) => handleReportFormChange('report_target', e.target.value)}
                          />
                          <div className="radio-content">
                            <span className="radio-title">Report Provider</span>
                            <span className="radio-description">Report general issues with {service.provider.business_name || service.provider.full_name}</span>
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
                            <span className="radio-title">Report Service</span>
                            <span className="radio-description">Report issues with "{service.service_title}"</span>
                          </div>
                        </label>
                      </div>
                    </div>

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

              {!reportSuccess && (
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseReportModal}
                    disabled={isSubmittingReport}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmittingReport}
                  >
                    {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Booking Result Modal */}
      {showBookingResultModal && (
        <div className="modal-overlay" onClick={() => setShowBookingResultModal(false)}>
          <div className="modal-content booking-result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{bookingResultType === 'success' ? 'Booking Confirmed' : 'Booking Failed'}</h3>
              <button className="modal-close" onClick={() => setShowBookingResultModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className={`result-message ${bookingResultType}`}>
                {bookingResultType === 'success' ? (
                  <svg className="result-icon success-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                ) : (
                  <svg className="result-icon error-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                )}
                <p className="result-text">{bookingResultMessage}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className={`btn ${bookingResultType === 'success' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowBookingResultModal(false)}
              >
                {bookingResultType === 'success' ? 'Done' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;