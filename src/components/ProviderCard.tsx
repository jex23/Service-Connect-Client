import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChatbubbleEllipsesSharp } from 'react-icons/io5';
import { IoArrowForward } from 'react-icons/io5';
import { authService } from '../service/authService';
import type { Provider } from '../types/publicServices';
import './ProviderCard.css';

interface ProviderCardProps {
  provider: Provider;
  onClick?: (provider: Provider) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(provider);
    }
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
    navigate('/user-chat', {
      state: {
        providerId: provider.id,
        providerName: provider.business_name || provider.full_name
      }
    });
  };

  return (
    <div className="provider-card" onClick={handleClick}>
      {provider.image_logo && (
        <div className="provider-card-image">
          <img
            src={provider.image_logo}
            alt={provider.business_name}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-service.jpg';
            }}
          />
        </div>
      )}

      <div className="provider-card-actions-top">
        <div
          className="provider-icon-circle provider-message-circle"
          onClick={handleMessageClick}
        >
          <IoChatbubbleEllipsesSharp className="provider-message-icon" size={18} />
        </div>
        <div className="provider-icon-circle provider-view-circle">
          <IoArrowForward className="provider-view-icon" size={18} />
        </div>
      </div>

      <div className="provider-card-content">
        <h3 className="provider-card-title">{provider.business_name}</h3>
        <span className="provider-card-owner">by {provider.full_name}</span>

        {provider.about && (
          <p className="provider-card-description">
            {provider.about.length > 100
              ? `${provider.about.substring(0, 100)}...`
              : provider.about
            }
          </p>
        )}

        <span className="provider-card-address">{provider.address}</span>

        <div className="provider-card-footer">
          <div className="provider-card-status">
            <span className={`status-indicator ${provider.is_active ? 'active' : 'inactive'}`}></span>
            {provider.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
