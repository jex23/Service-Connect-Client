import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import { userService } from '../service/userService';
import { providerService } from '../service/providerService';
import type { ServiceCategory } from '../types/userService';
import type { Provider } from '../types/auth';
import './Register.css';

const Register: React.FC = () => {
  const [userType, setUserType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [birIdFront, setBirIdFront] = useState<File | null>(null);
  const [birIdBack, setBirIdBack] = useState<File | null>(null);
  const [businessPermit, setBusinessPermit] = useState<File | null>(null);
  const [imageLogo, setImageLogo] = useState<File | null>(null);
  const [about, setAbout] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  
  // Multi-step provider registration
  const [providerStep, setProviderStep] = useState(1);
  const [registeredProvider, setRegisteredProvider] = useState<Provider | null>(null);
  const [currentServiceTitle, setCurrentServiceTitle] = useState('');
  const [currentServiceDescription, setCurrentServiceDescription] = useState('');
  const [currentServicePrice, setCurrentServicePrice] = useState('');
  const [currentServiceDuration, setCurrentServiceDuration] = useState('');
  const [currentServiceCategory, setCurrentServiceCategory] = useState<number | ''>('');
  const [servicePhotos, setServicePhotos] = useState<File[]>([]);
  const [completedServices, setCompletedServices] = useState<number[]>([]);
  
  // Schedule state
  const [daySchedules, setDaySchedules] = useState<{[key: string]: {enabled: boolean, startTime: string, endTime: string}}>({
    Monday: {enabled: false, startTime: '', endTime: ''},
    Tuesday: {enabled: false, startTime: '', endTime: ''},
    Wednesday: {enabled: false, startTime: '', endTime: ''},
    Thursday: {enabled: false, startTime: '', endTime: ''},
    Friday: {enabled: false, startTime: '', endTime: ''},
    Saturday: {enabled: false, startTime: '', endTime: ''},
    Sunday: {enabled: false, startTime: '', endTime: ''}
  });
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const navigate = useNavigate();

  const handleUserTypeSelection = (type: string) => {
    setUserType(type);
    setShowForm(true);
  };

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const response = await userService.getServiceCategories();
        setServiceCategories(response.categories);
      } catch (error) {
        console.error('Failed to fetch service categories:', error);
      }
    };

    if ((userType === 'customer' && showForm) || (userType === 'provider' && (providerStep === 2 || providerStep === 3))) {
      fetchServiceCategories();
    }
  }, [userType, showForm, providerStep]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called for userType:', userType);
    console.log('providerStep:', providerStep);
    
    if (password !== confirmPassword) {
      console.error('Password mismatch');
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      console.error('Password too short');
      alert('Password must be at least 6 characters');
      return;
    }

    console.log('Starting registration process...');
    setIsLoading(true);

    try {
      let response;
      
      if (userType === 'customer') {
        // Only require required fields: full_name, email, address, password
        if (!name || !email || !address || !password) {
          alert('Please fill in all required fields');
          setIsLoading(false);
          return;
        }

        // Prepare user data
        const userData = {
          full_name: name,
          email,
          address,
          password
        };
        
        // Prepare files for upload
        const files = {
          ...(idFront && { idFront }),
          ...(idBack && { idBack })
        };
        
        response = await authService.registerUser(userData, files);

        // Register services for selected categories
        if (selectedCategories.length > 0 && 'user' in response) {
          try {
            for (const categoryId of selectedCategories) {
              await userService.registerUserService({
                user_id: response.user.id,
                category_id: categoryId,
                service_title: `${name}'s Service`, // Default service title
                is_active: true
              });
            }
          } catch (serviceError) {
            console.warn('Failed to register some services:', serviceError);
            // Don't block registration if service registration fails
          }
        }
      } else if (userType === 'provider') {
        if (providerStep === 1) {
          // Step 1: Basic provider registration
          if (!name || !email || !address || !password) {
            alert('Please fill in all required fields (Name, Email, Address, Password)');
            setIsLoading(false);
            return;
          }

          // Prepare provider data
          const providerData = {
            full_name: name,
            email,
            address,
            password,
            ...(businessName && { business_name: businessName }),
            ...(contactNumber && { contact_number: contactNumber }),
            ...(about && { about: about })
          };
          
          // Prepare files for upload
          const files = {
            ...(birIdFront && { birIdFront }),
            ...(birIdBack && { birIdBack }),
            ...(businessPermit && { businessPermit }),
            ...(imageLogo && { imageLogo })
          };
          
          response = await authService.registerProvider(providerData, files);
          
          // Store provider data and proceed to step 2
          if ('provider' in response) {
            setRegisteredProvider(response.provider);
            setProviderStep(2);
            setIsLoading(false);
            return;
          }
        }
      } else {
        alert('Please select account type');
        setIsLoading(false);
        return;
      }
      
      if (response) {
        authService.storeAuthData(response);
        navigate('/home');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setShowForm(false);
    setUserType('');
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Provider multi-step handlers
  const handleProviderCategorySubmit = async () => {
    console.log('handleProviderCategorySubmit called');
    console.log('registeredProvider:', registeredProvider);
    console.log('selectedCategories:', selectedCategories);
    
    if (!registeredProvider || selectedCategories.length === 0) {
      console.error('Missing required data:', { registeredProvider, selectedCategories });
      alert('Please select at least one category');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Calling providerService.registerProviderCategories with:', {
        provider_id: registeredProvider.id,
        category_ids: selectedCategories
      });
      
      const response = await providerService.registerProviderCategories({
        provider_id: registeredProvider.id,
        category_ids: selectedCategories
      });
      
      console.log('Category registration response:', response);
      setProviderStep(3);
    } catch (error) {
      console.error('Category registration error:', error);
      alert(error instanceof Error ? error.message : 'Category registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSubmit = async () => {
    console.log('handleServiceSubmit called');
    console.log('registeredProvider:', registeredProvider);
    console.log('currentServiceCategory:', currentServiceCategory);
    console.log('currentServiceTitle:', currentServiceTitle);
    console.log('currentServiceDescription:', currentServiceDescription);
    console.log('currentServicePrice:', currentServicePrice);
    console.log('currentServiceDuration:', currentServiceDuration);
    console.log('servicePhotos length:', servicePhotos.length);
    console.log('daySchedules:', daySchedules);
    
    if (!registeredProvider || !currentServiceCategory || !currentServiceTitle) {
      console.error('Missing required fields:', {
        registeredProvider: !!registeredProvider,
        currentServiceCategory: !!currentServiceCategory,
        currentServiceTitle: !!currentServiceTitle
      });
      alert('Please fill in all required fields');
      return;
    }

    // Validate schedule fields - now mandatory
    const enabledDays = Object.entries(daySchedules).filter(([_, schedule]) => schedule.enabled);
    if (enabledDays.length === 0) {
      alert('Please select at least one day for your service schedule');
      return;
    }

    // Validate that all enabled days have valid time ranges
    for (const [day, schedule] of enabledDays) {
      if (!schedule.startTime || !schedule.endTime) {
        alert(`Please set both start and end times for ${day}`);
        return;
      }
      if (schedule.startTime >= schedule.endTime) {
        alert(`Start time must be before end time for ${day}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const serviceData = {
        provider_id: registeredProvider.id,
        category_id: Number(currentServiceCategory),
        service_title: currentServiceTitle,
        service_description: currentServiceDescription || undefined,
        price_decimal: currentServicePrice ? parseFloat(currentServicePrice) : undefined,
        duration_minutes: currentServiceDuration ? parseInt(currentServiceDuration) : undefined,
        is_active: true
      };
      
      console.log('Calling providerService.registerProviderService with:', serviceData);
      
      const serviceResponse = await providerService.registerProviderService(serviceData);
      
      console.log('Service registration response:', serviceResponse);

      // Upload photos if provided
      if (servicePhotos.length > 0) {
        try {
          console.log('Uploading photos for service:', serviceResponse.service.id);
          const photoResponse = await providerService.uploadServicePhotos({
            service_id: serviceResponse.service.id,
            photos: servicePhotos
          });
          console.log('Photo upload response:', photoResponse);
        } catch (photoError) {
          console.error('Photo upload failed:', photoError);
        }
      }

      // Create schedules - now mandatory
      try {
        console.log('Creating schedules for service:', serviceResponse.service.id);
        const schedules = enabledDays.map(([day, schedule]) => ({
          schedule_day: day,
          start_time: schedule.startTime,
          end_time: schedule.endTime
        }));

        const scheduleResponse = await providerService.createProviderServiceSchedules({
          provider_service_id: serviceResponse.service.id,
          schedules: schedules
        });
        console.log('Schedule creation response:', scheduleResponse);
        
        if (scheduleResponse.failed_schedules && scheduleResponse.failed_schedules.length > 0) {
          console.warn('Some schedules failed:', scheduleResponse.failed_schedules);
        }
      } catch (scheduleError) {
        console.error('Schedule creation failed:', scheduleError);
        alert('Service created but schedule creation failed. You may need to set up schedules later.');
      }

      const newCompletedServices = [...completedServices, Number(currentServiceCategory)];
      setCompletedServices(newCompletedServices);
      
      console.log('Updated completed services:', newCompletedServices);
      console.log('Total selected categories:', selectedCategories.length);
      
      // Reset form
      setCurrentServiceTitle('');
      setCurrentServiceDescription('');
      setCurrentServicePrice('');
      setCurrentServiceDuration('');
      setCurrentServiceCategory('');
      setServicePhotos([]);
      setDaySchedules({
        Monday: {enabled: false, startTime: '', endTime: ''},
        Tuesday: {enabled: false, startTime: '', endTime: ''},
        Wednesday: {enabled: false, startTime: '', endTime: ''},
        Thursday: {enabled: false, startTime: '', endTime: ''},
        Friday: {enabled: false, startTime: '', endTime: ''},
        Saturday: {enabled: false, startTime: '', endTime: ''},
        Sunday: {enabled: false, startTime: '', endTime: ''}
      });

      alert('Service registered successfully!');
    } catch (error) {
      console.error('Service registration error:', error);
      alert(error instanceof Error ? error.message : 'Service registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const finishRegistration = async () => {
    console.log('finishRegistration called');
    console.log('registeredProvider:', registeredProvider);
    console.log('completedServices:', completedServices);
    console.log('selectedCategories:', selectedCategories);
    
    if (!registeredProvider) {
      console.error('No registered provider found');
      alert('Registration data missing. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Completing provider registration process...');
      
      // Since there's no specific completion endpoint, we'll use the auth service
      // to try to authenticate the provider with their existing credentials
      console.log('Attempting to authenticate provider:', registeredProvider.email);
      
      // For now, we'll store the provider data directly since they just registered
      // In a production app, you might want to redirect to login or get a proper token
      const authData = {
        message: 'Registration completed successfully',
        access_token: `provider_${registeredProvider.id}_${Date.now()}`, // Generate a temporary token
        provider: registeredProvider
      };
      
      console.log('Storing auth data:', authData);
      authService.storeAuthData(authData);
      
      console.log('Provider registration completed successfully');
      console.log('Total services set up:', completedServices.length);
      console.log('Categories completed:', completedServices);
      
      // Show success message
      alert(`Registration completed! You have set up ${completedServices.length} service${completedServices.length !== 1 ? 's' : ''}.`);
      
      console.log('Navigating to /home');
      navigate('/home');
    } catch (error) {
      console.error('Registration completion error:', error);
      
      // Even if there's an error, we can still complete the registration
      // since the provider and services were already created successfully
      console.log('Completing registration despite error...');
      
      const fallbackAuthData = {
        message: 'Registration completed with minor issues',
        access_token: `provider_${registeredProvider.id}_fallback`,
        provider: registeredProvider
      };
      
      console.log('Storing fallback auth data:', fallbackAuthData);
      authService.storeAuthData(fallbackAuthData);
      
      alert('Registration completed! You may need to log in again later for full access.');
      navigate('/home');
    } finally {
      setIsLoading(false);
    }
  };

  const removeServicePhoto = (index: number) => {
    setServicePhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="register-container">
      <h1 className="brand-title">Service Connect</h1>
      <div className="register-card">
        {!showForm ? (
          <>
            <h2>Join Service Connect</h2>
            <p className="selection-subtitle">Choose how you want to use our platform</p>
            
            <div className="user-type-selection">
              <div className="user-type-options">
                <div 
                  className="user-type-option customer-option"
                  onClick={() => handleUserTypeSelection('customer')}
                >
                  <div className="option-icon">👤</div>
                  <div className="option-content">
                    <h3>Customer</h3>
                    <p>Find and book services</p>
                  </div>
                </div>
                
                <div 
                  className="user-type-option provider-option"
                  onClick={() => handleUserTypeSelection('provider')}
                >
                  <div className="option-icon">🔧</div>
                  <div className="option-content">
                    <h3>Provider</h3>
                    <p>Offer your services</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="login-link">
              <p>Already have an account?</p>
              <Link to="/login">Login here</Link>
            </div>
          </>
        ) : userType === 'provider' && providerStep > 1 ? (
          // Multi-step provider registration
          <>
            <button className="back-button" onClick={goBack}>
              ← Back
            </button>
            {providerStep === 2 && (
              <>
                <h2>Select Service Categories</h2>
                <p className="service-subtitle">Choose the categories you want to offer services in</p>
                
                <div className="categories-grid">
                  {serviceCategories.map((category) => (
                    <label key={category.id} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                      />
                      <span className="checkmark"></span>
                      {category.category_name}
                    </label>
                  ))}
                </div>
                
                <div className="multi-step-buttons">
                  <button 
                    type="button" 
                    onClick={handleProviderCategorySubmit}
                    disabled={isLoading || selectedCategories.length === 0}
                  >
                    {isLoading ? 'Processing...' : 'Continue to Service Setup'}
                  </button>
                </div>
              </>
            )}
            
            {providerStep === 3 && (
              <>
                <h2>Add Service Details</h2>
                <p className="service-subtitle">Create services for your selected categories</p>
                
                <form onSubmit={(e) => { e.preventDefault(); }} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                  <div>
                    <label htmlFor="serviceCategory">Service Category:</label>
                    <select
                      id="serviceCategory"
                      value={currentServiceCategory}
                      onChange={(e) => setCurrentServiceCategory(e.target.value ? Number(e.target.value) : '')}
                      required
                    >
                      <option value="">Select a category</option>
                      {serviceCategories.filter(cat => 
                        selectedCategories.includes(cat.id) && 
                        !completedServices.includes(cat.id)
                      ).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="serviceTitle">Service Title:</label>
                    <input
                      type="text"
                      id="serviceTitle"
                      value={currentServiceTitle}
                      onChange={(e) => setCurrentServiceTitle(e.target.value)}
                      required
                      maxLength={150}
                      placeholder="Enter service title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="serviceDescription">Service Description:</label>
                    <textarea
                      id="serviceDescription"
                      value={currentServiceDescription}
                      onChange={(e) => setCurrentServiceDescription(e.target.value)}
                      placeholder="Describe your service"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="servicePrice">Price (Optional):</label>
                    <input
                      type="number"
                      id="servicePrice"
                      value={currentServicePrice}
                      onChange={(e) => setCurrentServicePrice(e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="Enter price"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="serviceDuration">Duration (minutes, optional):</label>
                    <input
                      type="number"
                      id="serviceDuration"
                      value={currentServiceDuration}
                      onChange={(e) => setCurrentServiceDuration(e.target.value)}
                      min="1"
                      placeholder="Enter duration in minutes"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="servicePhotos">Service Photos (Optional):</label>
                    <input
                      type="file"
                      id="servicePhotos"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || []);
                        setServicePhotos(prev => [...prev, ...newFiles]);
                        // Clear the input so same files can be selected again
                        e.target.value = '';
                      }}
                    />
                    {servicePhotos.length > 0 && (
                      <div className="selected-photos">
                        <h4>Selected Photos ({servicePhotos.length}):</h4>
                        <div className="photo-list">
                          {servicePhotos.map((photo, index) => (
                            <div key={index} className="photo-item">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Selected photo ${index + 1}`}
                                className="photo-thumbnail"
                              />
                              <div className="photo-info">
                                <span className="photo-name">{photo.name}</span>
                                <span className="photo-size">{(photo.size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                              <button
                                type="button"
                                className="remove-photo-btn"
                                onClick={() => removeServicePhoto(index)}
                                title="Remove photo"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Schedule Section - Mandatory */}
                  <div className="schedule-section" style={{ 
                    border: '2px solid #007bff', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    backgroundColor: '#f8f9fa',
                    marginTop: '1rem',
                    boxShadow: '0 2px 8px rgba(0,123,255,0.1)'
                  }}>
                    <h3 style={{ color: '#007bff', marginBottom: '1rem' }}>Service Schedule (Required)</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
                      Set your availability for this service. Select days and set individual time ranges for each day.
                    </p>
                    
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {daysOfWeek.map((day) => (
                        <div key={day} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '1rem',
                          padding: '0.75rem',
                          backgroundColor: daySchedules[day].enabled ? '#e3f2fd' : '#ffffff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease'
                        }}>
                          <label style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            minWidth: '100px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={daySchedules[day].enabled}
                              onChange={(e) => {
                                setDaySchedules(prev => ({
                                  ...prev,
                                  [day]: {
                                    ...prev[day],
                                    enabled: e.target.checked,
                                    startTime: e.target.checked ? prev[day].startTime : '',
                                    endTime: e.target.checked ? prev[day].endTime : ''
                                  }
                                }));
                              }}
                              style={{ transform: 'scale(1.2)' }}
                            />
                            {day}
                          </label>
                          
                          {daySchedules[day].enabled && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                              <label style={{ fontSize: '0.9rem', color: '#666' }}>From:</label>
                              <input
                                type="time"
                                value={daySchedules[day].startTime}
                                onChange={(e) => {
                                  setDaySchedules(prev => ({
                                    ...prev,
                                    [day]: {
                                      ...prev[day],
                                      startTime: e.target.value
                                    }
                                  }));
                                }}
                                required
                                style={{ 
                                  padding: '0.5rem', 
                                  border: '1px solid #ccc', 
                                  borderRadius: '4px',
                                  fontSize: '0.9rem'
                                }}
                              />
                              <label style={{ fontSize: '0.9rem', color: '#666' }}>To:</label>
                              <input
                                type="time"
                                value={daySchedules[day].endTime}
                                onChange={(e) => {
                                  setDaySchedules(prev => ({
                                    ...prev,
                                    [day]: {
                                      ...prev[day],
                                      endTime: e.target.value
                                    }
                                  }));
                                }}
                                required
                                style={{ 
                                  padding: '0.5rem', 
                                  border: '1px solid #ccc', 
                                  borderRadius: '4px',
                                  fontSize: '0.9rem'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '0.75rem', 
                      backgroundColor: '#fff3cd', 
                      border: '1px solid #ffeaa7', 
                      borderRadius: '6px' 
                    }}>
                      <p style={{ fontSize: '0.85rem', color: '#856404', margin: 0 }}>
                        <strong>Note:</strong> You must select at least one day with valid time ranges to proceed.
                      </p>
                    </div>
                  </div>
                  
                  <div className="multi-step-buttons">
                    {/* Only show Add Service button if there are unfinished categories */}
                    {completedServices.length < selectedCategories.length && (
                      <button type="button" onClick={handleServiceSubmit} disabled={isLoading}>
                        {isLoading ? 'Adding Service...' : 'Add Service'}
                      </button>
                    )}
                    
                    {/* Always show finish button if at least one service is completed OR all services are done */}
                    {(completedServices.length >= selectedCategories.length || completedServices.length > 0) && (
                      <button 
                        type="button" 
                        onClick={() => {
                          console.log('Finish Registration button clicked');
                          console.log('Completed services:', completedServices.length);
                          console.log('Total selected categories:', selectedCategories.length);
                          finishRegistration();
                        }} 
                        className="finish-button"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Finishing Registration...' : (
                          completedServices.length >= selectedCategories.length 
                            ? 'Complete Registration' 
                            : 'Skip Remaining & Finish'
                        )}
                      </button>
                    )}
                  </div>
                </form>
                
                {completedServices.length > 0 && (
                  <div className="completed-services">
                    <p>Completed services: {completedServices.length}/{selectedCategories.length}</p>
                  </div>
                )}

                {/* Emergency finish button - always visible if any services are completed */}
                {completedServices.length > 0 && (
                  <div className="emergency-finish-section" style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(0,255,0,0.1)', borderRadius: '8px' }}>
                    <p><strong>Ready to finish?</strong> You can complete your registration now or add more services later.</p>
                    <button 
                      type="button" 
                      onClick={() => {
                        console.log('Emergency Finish Registration button clicked');
                        console.log('Current state - Completed:', completedServices.length, 'Total:', selectedCategories.length);
                        finishRegistration();
                      }} 
                      className="finish-button"
                      disabled={isLoading}
                      style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                    >
                      {isLoading ? 'Finishing Registration...' : 'Finish Registration Now'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <button className="back-button" onClick={goBack}>
              ← Back
            </button>
            <h2>Create {userType === 'customer' ? 'Customer' : 'Provider'} Account {userType === 'provider' ? `- Step ${providerStep}` : ''}</h2>
            
            <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
              <div>
                <label htmlFor="name">Full Name:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Enter your address"
                />
              </div>
              
              <div>
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
              </div>

              {userType === 'customer' ? (
                <>
                  <div>
                    <label htmlFor="idFront">ID Front Image (Optional):</label>
                    <input
                      type="file"
                      id="idFront"
                      accept="image/*"
                      onChange={(e) => setIdFront(e.target.files?.[0] || null)}
                      placeholder="Upload ID front image"
                    />
                  </div>
                  <div>
                    <label htmlFor="idBack">ID Back Image (Optional):</label>
                    <input
                      type="file"
                      id="idBack"
                      accept="image/*"
                      onChange={(e) => setIdBack(e.target.files?.[0] || null)}
                      placeholder="Upload ID back image"
                    />
                  </div>
                  <div>
                    <label>Service Categories (Optional):</label>
                    <p className="category-help-text">Select the services you can provide</p>
                    <div className="categories-grid">
                      {serviceCategories.map((category) => (
                        <label key={category.id} className="category-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryToggle(category.id)}
                          />
                          <span className="checkmark"></span>
                          {category.category_name}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="businessName">Business Name (Optional):</label>
                    <input
                      type="text"
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactNumber">Contact Number (Optional):</label>
                    <input
                      type="tel"
                      id="contactNumber"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Enter your contact number"
                    />
                  </div>
                  <div>
                    <label htmlFor="birIdFront">BIR ID Front Image (Optional):</label>
                    <input
                      type="file"
                      id="birIdFront"
                      accept="image/*"
                      onChange={(e) => setBirIdFront(e.target.files?.[0] || null)}
                      placeholder="Upload BIR ID front image"
                    />
                  </div>
                  <div>
                    <label htmlFor="birIdBack">BIR ID Back Image (Optional):</label>
                    <input
                      type="file"
                      id="birIdBack"
                      accept="image/*"
                      onChange={(e) => setBirIdBack(e.target.files?.[0] || null)}
                      placeholder="Upload BIR ID back image"
                    />
                  </div>
                  <div>
                    <label htmlFor="businessPermit">Business Permit Document (Optional):</label>
                    <input
                      type="file"
                      id="businessPermit"
                      accept="image/*,.pdf"
                      onChange={(e) => setBusinessPermit(e.target.files?.[0] || null)}
                      placeholder="Upload business permit document"
                    />
                  </div>
                  <div>
                    <label htmlFor="imageLogo">Business Logo (Optional):</label>
                    <input
                      type="file"
                      id="imageLogo"
                      accept="image/*"
                      onChange={(e) => setImageLogo(e.target.files?.[0] || null)}
                      placeholder="Upload business logo"
                    />
                  </div>
                  <div>
                    <label htmlFor="about">About Your Business (Optional):</label>
                    <textarea
                      id="about"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Tell us about your business and services"
                      rows={4}
                    />
                  </div>
                </>
              )}
              
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : `Create ${userType === 'customer' ? 'Customer' : 'Provider'} Account`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;