import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicServicesService } from '../service/publicServicesService';
import type { Provider, PublicService, ServiceProvider } from '../types/publicServices';
import './ProviderServiceList.css';

const ProviderServiceList: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);

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

  console.log('=== RENDER DEBUG ===');
  console.log('Render state - Loading:', loading);
  console.log('Render state - Provider:', provider);
  console.log('Render state - Services count:', services.length);

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="provider-service-list-container">
        <div className="loading-state">
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    console.log('Rendering error state - no provider');
    return (
      <div className="provider-service-list-container">
        <div className="error-state">
          <h2>Provider Not Found</h2>
          <p>The requested provider could not be found.</p>
          <button onClick={handleBackClick} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering main content');
  console.log('Display name:', getDisplayName());
  console.log('Provider address:', provider.address);
  console.log('Services to render:', services);

  return (
    <div className="provider-service-list-container">
      <div className="content-wrapper">
        <header className="provider-service-list-header">
        <button onClick={handleBackClick} className="back-btn">
          ← Back to Home
        </button>
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
        <div className="provider-info">
          <h1>{getDisplayName()}</h1>
          <p className="provider-address">{provider.address}</p>
          {provider.email && (
            <a href={`mailto:${provider.email}`} className="provider-email">
              Email: {provider.email}
            </a>
          )}
        </div>
      </header>

      {provider.about && (
        <div className="provider-about">
          <h2>About</h2>
          <p>{provider.about}</p>
        </div>
      )}

      <div className="services-section">
        <h2>Services ({services.length})</h2>
        
        {services.length > 0 ? (
          <div className="services-list">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="service-item"
                onClick={() => handleServiceClick(service)}
              >
                <div className="service-header">
                  {service.has_photos && service.photos && service.photos.length > 0 && (
                    <div className="service-photo">
                      <img
                        src={service.photos[0].photo_url}
                        alt={service.service_title}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="service-main-info">
                    <h3 className="service-title">{service.service_title}</h3>
                    {service.service_description && (
                      <p className="service-description">{service.service_description}</p>
                    )}
                  </div>
                </div>
                
                <div className="service-meta">
                  <span className="service-price">{formatPrice(service.price_decimal)}</span>
                  {service.duration_minutes && (
                    <span className="service-duration">{formatDuration(service.duration_minutes)}</span>
                  )}
                  <span className="service-category">{service.category.category_name}</span>
                </div>

                <div className="service-footer">
                  <button className="service-view-btn">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-services">
            <p>This provider currently has no active services.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ProviderServiceList;