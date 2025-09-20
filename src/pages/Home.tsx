import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import { publicServicesService } from '../service/publicServicesService';
import ServiceCard from '../components/ServiceCard';
import type { Provider, ProvidersFilters } from '../types/publicServices';
import './Home.css';

const Home: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [searchTerm]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const filters: ProvidersFilters = {
        active: true,
        limit: 20,
      };

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      const response = await publicServicesService.getProviders(filters);
      setProviders(response.providers);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };


  const handleProviderClick = (item: Provider | any) => {
    if ('business_name' in item) {
      navigate(`/provider/${item.id}/services`);
    }
  };

  return (
    <div className="home-container">
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
            <h3>Available Providers</h3>
            <p>{loading ? 'Loading...' : `${providers.length} providers found`}</p>
          </div>

          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="service-card-skeleton"></div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="empty-state">
              <p>No providers found. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="services-grid">
              {providers.map((provider) => (
                <ServiceCard
                  key={provider.id}
                  provider={provider}
                  compact={false}
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