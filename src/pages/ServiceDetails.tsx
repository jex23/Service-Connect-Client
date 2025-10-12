import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicServicesService } from '../service/publicServicesService';
import { bookingService } from '../service/bookingService';
import { authService } from '../service/authService';
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

        weekDays.push({
          date: new Date(current),
          dateStr,
          isCurrentMonth: current.getMonth() === month,
          isToday: current.toDateString() === now.toDateString(),
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
  const handleCalendarDayClick = async (dateStr: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !service) return; // Don't allow clicking on other month dates
    
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
    if (!service || !user || !selectedDate || !selectedDay || !selectedTime) {
      alert('Please select a date, day and time');
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

      alert('Booking created successfully! The provider will contact you soon.');
      setShowBookingModal(false);
      setSelectedDate('');
      setSelectedDay('');
      setSelectedTime('');
    } catch (error) {
      console.error('Booking failed:', error);
      alert(error instanceof Error ? error.message : 'Booking failed. Please try again.');
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
                <div className="form-group">
                  <label htmlFor="bookingDate">Select Date:</label>
                  <input
                    type="date"
                    id="bookingDate"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]} // Today or later
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      // Auto-set the day based on selected date
                      if (e.target.value) {
                        const date = new Date(e.target.value);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                        setSelectedDay(dayName);
                      } else {
                        setSelectedDay('');
                      }
                      setSelectedTime(''); // Reset time when date changes
                    }}
                    required
                  />
                </div>

                {selectedDate && (
                  <div className="form-group">
                    <label htmlFor="bookingDay">Day of Week:</label>
                    <input
                      type="text"
                      id="bookingDay"
                      value={selectedDay}
                      readOnly
                      className="readonly-input"
                    />
                  </div>
                )}

                {selectedDay && (
                  <div className="form-group">
                    <label htmlFor="bookingTime">Select Time:</label>
                    <select
                      id="bookingTime"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                    >
                      <option value="">Choose a time</option>
                      {getAvailableTimeSlots(selectedDay).map((timeSlot) => (
                        <option key={timeSlot} value={timeSlot}>
                          {timeSlot}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Booking Calendar */}
                <div className="booking-calendar-section">
                  <div className="calendar-header">
                    <h4>Booking Calendar</h4>
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
                                    day.isCurrentMonth ? 'clickable' : ''
                                  } ${day.isAvailable && day.isCurrentMonth ? 'available-day' : ''}`}
                                  onClick={() => handleCalendarDayClick(day.dateStr, day.isCurrentMonth)}
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
                                  {scheduleData.available_slots.map((timeSlot) => {
                                    const isBooked = scheduleData.existing_bookings.some(
                                      booking => booking.booking_time === timeSlot
                                    );
                                    return (
                                      <div
                                        key={timeSlot}
                                        className={`time-slot ${isBooked ? 'booked' : 'available'}`}
                                        onClick={() => {
                                          if (!isBooked) {
                                            setSelectedTime(timeSlot);
                                            setSelectedDate(selectedCalendarDate);
                                            // Parse date string parts to avoid timezone issues
                                            const [year, month, day] = selectedCalendarDate.split('-').map(Number);
                                            const date = new Date(year, month - 1, day);
                                            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                                            setSelectedDay(dayName);
                                          }
                                        }}
                                      >
                                        <span className="time-text">{timeSlot}</span>
                                        <span className={`status-text ${isBooked ? 'booked' : 'available'}`}>
                                          {isBooked ? 'Booked' : 'Available'}
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
    </div>
  );
};

export default ServiceDetails;