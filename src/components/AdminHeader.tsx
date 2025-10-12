import React, { useState, useEffect } from 'react';
import { adminService } from '../service/adminService';
import type { Admin } from '../types/admin';
import './AdminHeader.css';

interface AdminHeaderProps {
  title: string;
  showUserInfo?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, showUserInfo = false }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    if (showUserInfo) {
      fetchAdminProfile();
    }
  }, [showUserInfo]);

  const fetchAdminProfile = async () => {
    try {
      const profile = await adminService.getAdminProfile();
      setAdmin(profile as Admin);
    } catch (err) {
      console.error('Failed to fetch admin profile:', err);
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1>{title}</h1>
      </div>
      <div className="admin-header-right">
        {showUserInfo && admin && (
          <div className="admin-user-info">
            <span className="admin-name">{admin.full_name}</span>
            <span className="admin-role-badge">{admin.role}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
