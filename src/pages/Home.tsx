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

        // Extract unique providers from services
        const uniqueProvidersMap = new Map<number, Provider>();
        servicesResponse.services.forEach(service => {
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
          <h2 className="hero-title">Find Services Near You</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </section>

        {/* Providers Section */}
        <section className="services-section">
          <div className="section-header">
            <div className="section-header-left">
              <h3>Available Providers</h3>
              <p>{loading ? 'Loading...' : `${providers.length} providers found`}</p>
            </div>
            <div className="section-header-right">
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
              <p>No providers found. Try adjusting your search.</p>
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
            <div className="cta-content">
              <h3>Ready to Connect?</h3>
              <p>Join Service Connect to book services or offer your own</p>
              <div className="cta-actions">
                <Link to="/register" className="cta-btn primary">Get Started</Link>
                <Link to="/login" className="cta-btn secondary">Sign In</Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;