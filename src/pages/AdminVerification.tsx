import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import { adminVerificationService } from '../service/adminVerificationService';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import type { User } from '../types/user';
import type { Provider } from '../types/provider';
import '../components/AdminLayout.css';
import './AdminVerification.css';

type VerificationTab = 'users' | 'providers';

const AdminVerification: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<VerificationTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [viewingImage, setViewingImage] = useState<{ url: string; title: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultModal, setResultModal] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
    title: string;
  }>({ show: false, type: 'success', message: '', title: '' });

  useEffect(() => {
    // Check if user is admin
    const userType = authService.getStoredUserType();
    if (userType !== 'admin') {
      navigate('/admin-login');
      return;
    }

    fetchVerifications();
  }, [navigate]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both users and providers pending verification
      const [usersData, providersData] = await Promise.all([
        adminVerificationService.getUsersPendingVerification(),
        adminVerificationService.getProvidersPendingVerification()
      ]);

      setUsers(usersData);
      setProviders(providersData);
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    setProcessing(true);
    try {
      await adminVerificationService.approveUser(userId);
      // Remove the approved user from the list
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUser(null);
      setResultModal({
        show: true,
        type: 'success',
        title: 'Success',
        message: 'User approved successfully'
      });
    } catch (error) {
      console.error('Failed to approve user:', error);
      setResultModal({
        show: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to approve user'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectUser = async (userId: number) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    setProcessing(true);
    try {
      await adminVerificationService.rejectUser(userId, reason || undefined);
      // Remove the rejected user from the list
      setUsers(users.filter(u => u.id !== userId));
      setSelectedUser(null);
      setResultModal({
        show: true,
        type: 'success',
        title: 'Success',
        message: 'User rejected successfully'
      });
    } catch (error) {
      console.error('Failed to reject user:', error);
      setResultModal({
        show: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to reject user'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveProvider = async (providerId: number) => {
    setProcessing(true);
    try {
      await adminVerificationService.approveProvider(providerId);
      // Remove the approved provider from the list
      setProviders(providers.filter(p => p.id !== providerId));
      setSelectedProvider(null);
      setResultModal({
        show: true,
        type: 'success',
        title: 'Success',
        message: 'Provider approved successfully'
      });
    } catch (error) {
      console.error('Failed to approve provider:', error);
      setResultModal({
        show: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to approve provider'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectProvider = async (providerId: number) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    setProcessing(true);
    try {
      await adminVerificationService.rejectProvider(providerId, reason || undefined);
      // Remove the rejected provider from the list
      setProviders(providers.filter(p => p.id !== providerId));
      setSelectedProvider(null);
      setResultModal({
        show: true,
        type: 'success',
        title: 'Success',
        message: 'Provider rejected successfully'
      });
    } catch (error) {
      console.error('Failed to reject provider:', error);
      setResultModal({
        show: true,
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to reject provider'
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDocument = (url: string, title: string) => {
    setViewingImage({ url, title });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <AdminHeader title="Verification Management" showUserInfo={true} />

        <main className="admin-main">
          <div className="verification-content-wrapper">
            <div className="verification-intro">
              <p>Review and verify user and provider registrations</p>
            </div>

            <div className="verification-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Users
          {users.length > 0 && <span className="tab-badge">{users.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === 'providers' ? 'active' : ''}`}
          onClick={() => setActiveTab('providers')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Providers
          {providers.length > 0 && <span className="tab-badge">{providers.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading verifications...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>Error Loading Verifications</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchVerifications}>
            Retry
          </button>
        </div>
      ) : (
        <div className="verification-content">
          {activeTab === 'users' && (
            <div className="users-verification">
              {users.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <h3>No Pending User Verifications</h3>
                  <p>All user registrations have been reviewed</p>
                </div>
              ) : (
                <div className="verification-grid">
                  {users.map(user => (
                    <div key={user.id} className="verification-card">
                      <div className="card-header">
                        <div className="user-avatar">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <h3>{user.full_name}</h3>
                          <p className="user-email">{user.email}</p>
                        </div>
                      </div>
                      <div className="card-details">
                        <div className="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>{user.address || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>Registered: {formatDate(user.created_at)}</span>
                        </div>
                        {(user.id_front || user.id_back) && (
                          <div className="detail-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                            <span>ID Documents: {[user.id_front ? 'Front' : null, user.id_back ? 'Back' : null].filter(Boolean).join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn btn-view"
                          onClick={() => setSelectedUser(user)}
                        >
                          View Details
                        </button>
                        <button
                          className="btn btn-approve"
                          onClick={() => handleApproveUser(user.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Approve
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => handleRejectUser(user.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="providers-verification">
              {providers.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <h3>No Pending Provider Verifications</h3>
                  <p>All provider registrations have been reviewed</p>
                </div>
              ) : (
                <div className="verification-grid">
                  {providers.map(provider => (
                    <div key={provider.id} className="verification-card">
                      <div className="card-header">
                        <div className="user-avatar provider">
                          {provider.business_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <h3>{provider.business_name}</h3>
                          <p className="user-email">{provider.email}</p>
                          <p className="owner-name">Owner: {provider.full_name}</p>
                        </div>
                      </div>
                      <div className="card-details">
                        <div className="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                          <span>{provider.contact_number || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>{provider.address || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>Registered: {formatDate(provider.created_at)}</span>
                        </div>
                      </div>
                      <div className="documents-section">
                        <h4>Documents</h4>
                        <div className="documents-grid">
                          {provider.bir_id_front && (
                            <div className="document-item">
                              <span>BIR ID (Front)</span>
                              <button
                                className="view-doc-btn"
                                onClick={() => handleViewDocument(provider.bir_id_front!, 'BIR ID (Front)')}
                              >
                                View
                              </button>
                            </div>
                          )}
                          {provider.bir_id_back && (
                            <div className="document-item">
                              <span>BIR ID (Back)</span>
                              <button
                                className="view-doc-btn"
                                onClick={() => handleViewDocument(provider.bir_id_back!, 'BIR ID (Back)')}
                              >
                                View
                              </button>
                            </div>
                          )}
                          {provider.business_permit && (
                            <div className="document-item">
                              <span>Business Permit</span>
                              <button
                                className="view-doc-btn"
                                onClick={() => handleViewDocument(provider.business_permit!, 'Business Permit')}
                              >
                                View
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          className="btn btn-view"
                          onClick={() => setSelectedProvider(provider)}
                        >
                          View Details
                        </button>
                        <button
                          className="btn btn-approve"
                          onClick={() => handleApproveProvider(provider.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Approve
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => handleRejectProvider(provider.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-row">
                  <label>Full Name:</label>
                  <span>{selectedUser.full_name}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <label>Address:</label>
                  <span>{selectedUser.address || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Registration Date:</label>
                  <span>{formatDate(selectedUser.created_at)}</span>
                </div>
              </div>
              {(selectedUser.id_front || selectedUser.id_back) && (
                <div className="documents-preview">
                  <h3>ID Documents</h3>
                  <div className="preview-grid">
                    {selectedUser.id_front && (
                      <div className="preview-item">
                        <label>ID (Front)</label>
                        <img
                          src={selectedUser.id_front}
                          alt="ID Front"
                          onClick={() => handleViewDocument(selectedUser.id_front!, 'ID (Front)')}
                        />
                      </div>
                    )}
                    {selectedUser.id_back && (
                      <div className="preview-item">
                        <label>ID (Back)</label>
                        <img
                          src={selectedUser.id_back}
                          alt="ID Back"
                          onClick={() => handleViewDocument(selectedUser.id_back!, 'ID (Back)')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-approve" onClick={() => handleApproveUser(selectedUser.id)}>
                Approve User
              </button>
              <button className="btn btn-reject" onClick={() => handleRejectUser(selectedUser.id)}>
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="modal-overlay" onClick={() => setSelectedProvider(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Provider Details</h2>
              <button className="modal-close" onClick={() => setSelectedProvider(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-row">
                  <label>Business Name:</label>
                  <span>{selectedProvider.business_name}</span>
                </div>
                <div className="detail-row">
                  <label>Owner Name:</label>
                  <span>{selectedProvider.full_name}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{selectedProvider.email}</span>
                </div>
                <div className="detail-row">
                  <label>Contact Number:</label>
                  <span>{selectedProvider.contact_number || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Address:</label>
                  <span>{selectedProvider.address || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Registration Date:</label>
                  <span>{formatDate(selectedProvider.created_at)}</span>
                </div>
              </div>
              <div className="documents-preview">
                <h3>Documents</h3>
                <div className="preview-grid">
                  {selectedProvider.bir_id_front && (
                    <div className="preview-item">
                      <label>BIR ID (Front)</label>
                      <img
                        src={selectedProvider.bir_id_front}
                        alt="BIR ID Front"
                        onClick={() => handleViewDocument(selectedProvider.bir_id_front!, 'BIR ID (Front)')}
                      />
                    </div>
                  )}
                  {selectedProvider.bir_id_back && (
                    <div className="preview-item">
                      <label>BIR ID (Back)</label>
                      <img
                        src={selectedProvider.bir_id_back}
                        alt="BIR ID Back"
                        onClick={() => handleViewDocument(selectedProvider.bir_id_back!, 'BIR ID (Back)')}
                      />
                    </div>
                  )}
                  {selectedProvider.business_permit && (
                    <div className="preview-item">
                      <label>Business Permit</label>
                      <img
                        src={selectedProvider.business_permit}
                        alt="Business Permit"
                        onClick={() => handleViewDocument(selectedProvider.business_permit!, 'Business Permit')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-approve" onClick={() => handleApproveProvider(selectedProvider.id)}>
                Approve Provider
              </button>
              <button className="btn btn-reject" onClick={() => handleRejectProvider(selectedProvider.id)}>
                Reject Provider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="modal-overlay image-viewer-overlay" onClick={() => setViewingImage(null)}>
          <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-viewer-header">
              <h2>{viewingImage.title}</h2>
              <button className="modal-close" onClick={() => setViewingImage(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="image-viewer-body">
              <img src={viewingImage.url} alt={viewingImage.title} />
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner Overlay */}
      {processing && (
        <div className="modal-overlay processing-overlay">
          <div className="processing-spinner">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal.show && (
        <div className="modal-overlay" onClick={() => setResultModal({ ...resultModal, show: false })}>
          <div className="modal-content result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{resultModal.title}</h2>
              <button className="modal-close" onClick={() => setResultModal({ ...resultModal, show: false })}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className={`result-icon ${resultModal.type}`}>
                {resultModal.type === 'success' ? (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="9 12 11 14 15 10"></polyline>
                  </svg>
                ) : (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
              </div>
              <p className="result-message">{resultModal.message}</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setResultModal({ ...resultModal, show: false })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminVerification;
