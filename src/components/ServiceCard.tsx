import React from 'react';
import type { PublicService } from '../types/publicServices';
import './ServiceCard.css';

interface ServiceCardProps {
  service: PublicService;
  onClick?: (service: PublicService) => void;
  compact?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, compact = false }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(service);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price on request';
    return `₱${price.toFixed(2)}`;
  };

  const getDisplayName = () => {
    return service.provider.business_name || service.provider.full_name;
  };

  const getMainPhoto = () => {
    return service.photos.find(photo => photo.sort_order === 0) || service.photos[0];
  };

  const formatSchedule = () => {
    if (!service.has_schedule || service.schedules.length === 0) {
      return null;
    }

    // Get today's day name
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find today's schedule
    const todaySchedule = service.schedules.find(schedule => 
      schedule.schedule_day === today
    );

    if (todaySchedule) {
      return `Today ${todaySchedule.start_time}-${todaySchedule.end_time}`;
    }

    // If no schedule for today, find the next available day
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = dayOrder.indexOf(today);
    
    // Look for the next available day starting from tomorrow
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7;
      const nextDay = dayOrder[nextDayIndex];
      const nextSchedule = service.schedules.find(schedule => 
        schedule.schedule_day === nextDay
      );
      
      if (nextSchedule) {
        const dayName = i === 1 ? 'Tomorrow' : nextSchedule.schedule_day.substring(0, 3);
        return `${dayName} ${nextSchedule.start_time}-${nextSchedule.end_time}`;
      }
    }

    // Fallback to first available schedule
    const firstSchedule = service.schedules[0];
    return `${firstSchedule.schedule_day.substring(0, 3)} ${firstSchedule.start_time}-${firstSchedule.end_time}`;
  };

  if (compact) {
    return (
      <div className="service-card compact" onClick={handleClick}>
        {service.has_photos && (
          <div className="service-image-compact">
            <img 
              src={getMainPhoto()?.photo_url} 
              alt={service.service_title}
              onError={(e) => {
                e.currentTarget.src = '/placeholder-service.jpg';
              }}
            />
          </div>
        )}
        
        <div className="service-content-compact">
          <div className="service-top">
            <h4 className="service-title-compact">{service.service_title}</h4>
            <span className="service-price-compact">{formatPrice(service.price_decimal)}</span>
          </div>
          
          <div className="service-bottom">
            <span className="provider-name-compact">by {getDisplayName()}</span>
            <span className="service-category-compact">{service.category.category_name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-card" onClick={handleClick}>
      {service.has_photos && (
        <div className="service-image">
          <img 
            src={getMainPhoto()?.photo_url} 
            alt={service.service_title}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-service.jpg';
            }}
          />
          {service.photo_count > 1 && (
            <div className="photo-count">+{service.photo_count - 1}</div>
          )}
        </div>
      )}
      
      <div className="service-content">
        <div className="service-header">
          <h3 className="service-title">{service.service_title}</h3>
          <span className="service-category">{service.category.category_name}</span>
        </div>
        
        {service.service_description && (
          <p className="service-description">
            {service.service_description.length > 80 
              ? `${service.service_description.substring(0, 80)}...` 
              : service.service_description
            }
          </p>
        )}
        
        <div className="service-provider">
          <span className="provider-name">by {getDisplayName()}</span>
        </div>

        {service.has_schedule && (
          <div className="service-schedule">
            <span className="schedule-info">📅 {formatSchedule()}</span>
          </div>
        )}
        
        <div className="service-footer">
          <span className="service-price">{formatPrice(service.price_decimal)}</span>
          <button className="view-details-btn">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;