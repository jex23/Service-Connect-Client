import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import { publicServicesService } from '../service/publicServicesService';
import { userService } from '../service/userService';
import ProviderCard from '../components/ProviderCard';
import type { Provider, ProvidersFilters, ServicesFilters } from '../types/publicServices';
import type { ServiceCategory } from '../types/userService';
import './Home.css';

const Home: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    fetchProviders();
    fetchServiceCategories();
  }, []);

  useEffect(() => {
    if (!initialLoad) {
      fetchProviders();
    }
  }, [searchTerm, selectedCategory]);

  const fetchServiceCategories = async () => {
    try {
      const response = await userService.getServiceCategories();
      setServiceCategories(response.categories);
    } catch (error) {
      console.error('Failed to fetch service categories:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      // Only show loading overlay on initial load
      if (initialLoad) {
        setLoading(true);
      }

      // If a category is selected, fetch services by category and extract unique providers
      if (selectedCategory !== 'all') {
        const servicesFilters: ServicesFilters = {
          active: true,
          category_id: selectedCategory,
          limit: 100, // Get more services to find providers
        };

        if (searchTerm.trim()) {
          servicesFilters.search = searchTerm.trim();
        }

        const servicesResponse = await publicServicesService.getPublicServices(servicesFilters);

        // Filter to only show active services
        const activeServices = servicesResponse.services.filter(service => service.is_active === true);

        // Extract unique providers from active services only
        const uniqueProvidersMap = new Map<number, Provider>();
        activeServices.forEach(service => {
          if (!uniqueProvidersMap.has(service.provider.id)) {
            uniqueProvidersMap.set(service.provider.id, {
              id: service.provider.id,
              business_name: service.provider.business_name,
              full_name: service.provider.full_name,
              email: service.provider.email || '',
              contact_number: null,
              address: service.provider.address,
              bir_id_front: null,
              bir_id_back: null,
              business_permit: null,
              image_logo: service.provider.image_logo || null,
              about: service.provider.about || null,
              is_active: true,
              created_at: null,
              updated_at: null,
            });
          }
        });

        setProviders(Array.from(uniqueProvidersMap.values()));
      } else {
        // No category selected, fetch all providers
        const filters: ProvidersFilters = {
          active: true,
          limit: 20,
        };

        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }

        const response = await publicServicesService.getProviders(filters);
        setProviders(response.providers);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      setProviders([]);
    } finally {
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };


  const handleProviderClick = (item: Provider | any) => {
    if ('business_name' in item) {
      navigate(`/provider/${item.id}/services`);
    }
  };

  return (
    <div className="home-container">
      {/* Full Page Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <div className="loading-text">Loading Providers</div>
            <div className="loading-subtext">
              Please wait<span className="loading-dots"></span>
            </div>
          </div>
        </div>
      )}

      <main className="home-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">Your Trusted Service Marketplace</div>
            <h1 className="hero-title">
              Discover Quality Services
              <span className="hero-title-highlight"> Near You</span>
            </h1>
            <p className="hero-subtitle">
              Connect with verified professionals and get the service you need, when you need it.
            </p>

            <div className="search-container">
              <div className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for providers, services, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {!isAuthenticated && (
              <div className="hero-cta">
                <Link to="/register" className="hero-btn primary">
                  Get Started Free
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
                <Link to="/login" className="hero-btn secondary">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Providers Section */}
        <section className="services-section">
          <div className="section-header">
            <div className="section-header-left">
              <h2>Browse Our Providers</h2>
              <p className="section-subtitle">
                {loading ? 'Loading...' : `${providers.length} professional${providers.length !== 1 ? 's' : ''} ready to serve you`}
              </p>
            </div>
            <div className="section-header-right">
              <div className="filter-label">Filter by:</div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="category-select"
              >
                <option value="all">All Categories</option>
                {serviceCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {providers.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              <h3>No providers found</h3>
              <p>Try adjusting your search or filter to find what you're looking for</p>
            </div>
          ) : (
            <div className="services-grid">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onClick={handleProviderClick}
                />
              ))}
            </div>
          )}
        </section>

        {!isAuthenticated && (
          <section className="cta-section">
            <div className="cta-background-pattern"></div>
            <div className="cta-content">
              <h2>Ready to Get Started?</h2>
              <p>Join thousands of satisfied customers who found their perfect service match</p>
              <div className="cta-actions">
                <Link to="/register" className="cta-btn primary">
                  Create Free Account
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
                <Link to="/login" className="cta-btn secondary">Sign In</Link>
              </div>
              <div className="cta-features">
                <div className="cta-feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  Free to join
                </div>
                <div className="cta-feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  No hidden fees
                </div>
                <div className="cta-feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  Cancel anytime
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;