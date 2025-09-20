import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ProviderSidebar.css';

const ProviderSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/provider-homepage',
    },
    {
      id: 'services',
      label: 'My Services',
      icon: '🔧',
      path: '/provider-services',
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: '📅',
      path: '/provider-bookings',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      path: '/provider-profile',
    },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`provider-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={toggleSidebar}>
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.path)}
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="help-section">
            <p className="help-text">Need help?</p>
            <button className="help-btn">Contact Support</button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProviderSidebar;