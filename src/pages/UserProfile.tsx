import React, { useEffect, useState } from 'react';
import { userProfileService } from '../service/userProfileService';
import type {
  UserProfile,
  UpdateUserProfileRequest,
  UpdateUserProfileFiles
} from '../types/userProfile';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'documents' | 'danger'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState<UpdateUserProfileRequest>({});
  const [passwordForm, setPasswordForm] = useState<UpdateUserProfileRequest>({
    password: ''
  });
  const [documentFiles, setDocumentFiles] = useState<UpdateUserProfileFiles>({});
  const [previewUrls, setPreviewUrls] = useState<{id_front?: string, id_back?: string}>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await userProfileService.getUserProfile();
      setProfile(userProfile);
      setProfileForm({
        full_name: userProfile.full_name,
        address: userProfile.address
      });

      // Set initial preview URLs if documents exist
      if (userProfile.id_front || userProfile.id_back) {
        setPreviewUrls({
          id_front: userProfile.id_front,
          id_back: userProfile.id_back
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await userProfileService.updateUserProfile(profileForm);
      setProfile(response.user);
      setIsEditing(false);
      // Dispatch auth change event to update header
      window.dispatchEvent(new Event('authChange'));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.password) {
      alert('Please enter a new password');
      return;
    }
    try {
      const updateData = {
        full_name: profile?.full_name,
        address: profile?.address,
        password: passwordForm.password
      };
      const response = await userProfileService.updateUserProfile(updateData);
      setProfile(response.user);
      setPasswordForm({ password: '' });
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: 'id_front' | 'id_back') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file (PNG, JPG, JPEG, GIF, or PDF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setDocumentFiles(prev => ({ ...prev, [docType]: file }));

      // Create preview URL for images only
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => ({ ...prev, [docType]: url }));
      }
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentFiles.id_front && !documentFiles.id_back) {
      alert('Please select at least one document to upload');
      return;
    }

    try {
      const response = await userProfileService.updateUserProfile({}, documentFiles);
      setProfile(response.user);
      setDocumentFiles({});

      // Update preview URLs with new uploaded URLs
      if (response.uploaded_files) {
        setPreviewUrls(prev => ({
          ...prev,
          ...response.uploaded_files
        }));
      }

      // Dispatch auth change event to update header
      window.dispatchEvent(new Event('authChange'));
      alert('Documents uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload documents:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload documents');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }

    try {
      await userProfileService.deleteUserAccount();
      // The service will handle logout and auth state clearing
      window.dispatchEvent(new Event('authChange'));
      alert('Account deleted successfully. You will be redirected to the homepage.');
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete account');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <h2>Failed to load profile</h2>
        <button onClick={fetchProfile} className="retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="profile-info">
          <h1>{profile.full_name}</h1>
          <p className="profile-email">{profile.email}</p>
          <p className="profile-member-since">
            Member since {formatDate(profile.created_at)}
          </p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button
          className={`tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
        <button
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          ID Documents
        </button>
        <button
          className={`tab ${activeTab === 'danger' ? 'active' : ''}`}
          onClick={() => setActiveTab('danger')}
        >
          Danger Zone
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="tab-header">
              <h2>Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="edit-btn"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    value={profileForm.full_name || ''}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    value={profileForm.address || ''}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-display">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Full Name</label>
                    <span>{profile.full_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{profile.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Address</label>
                    <span>{profile.address}</span>
                  </div>
                  {profile.id_front && (
                    <div className="info-item">
                      <label>ID Document (Front)</label>
                      <span>Uploaded</span>
                    </div>
                  )}
                  {profile.id_back && (
                    <div className="info-item">
                      <label>ID Document (Back)</label>
                      <span>Uploaded</span>
                    </div>
                  )}
                  <div className="info-item">
                    <label>Last Updated</label>
                    <span>{profile.updated_at ? formatDate(profile.updated_at) : 'Not updated'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <div className="security-tab">
            <h2>Change Password</h2>

            <form onSubmit={handlePasswordChange} className="password-form">
              <p className="password-note">
                Enter your new password below. This will update your account password.
              </p>

              <div className="form-group">
                <label htmlFor="new_password">New Password</label>
                <input
                  type="password"
                  id="new_password"
                  value={passwordForm.password || ''}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <button type="submit" className="change-password-btn">Change Password</button>
            </form>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-tab">
            <h2>ID Documents</h2>
            <p className="documents-note">
              Upload your ID documents for verification. Supported formats: PNG, JPG, JPEG, GIF, PDF (Max 5MB each)
            </p>

            <div className="documents-grid">
              <div className="document-section">
                <h3>ID Front</h3>
                {previewUrls.id_front ? (
                  <div className="document-preview">
                    {previewUrls.id_front.endsWith('.pdf') ? (
                      <div className="pdf-preview">
                        <span>📄 PDF Document</span>
                        <a href={previewUrls.id_front} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      </div>
                    ) : (
                      <img src={previewUrls.id_front} alt="ID Front" className="document-image" />
                    )}
                  </div>
                ) : (
                  <div className="document-placeholder">
                    <span>No document uploaded</span>
                  </div>
                )}

                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.gif,.pdf"
                  onChange={(e) => handleFileChange(e, 'id_front')}
                  id="id_front_input"
                  className="file-input"
                />
                <label htmlFor="id_front_input" className="file-upload-btn">
                  Choose ID Front
                </label>
              </div>

              <div className="document-section">
                <h3>ID Back</h3>
                {previewUrls.id_back ? (
                  <div className="document-preview">
                    {previewUrls.id_back.endsWith('.pdf') ? (
                      <div className="pdf-preview">
                        <span>📄 PDF Document</span>
                        <a href={previewUrls.id_back} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      </div>
                    ) : (
                      <img src={previewUrls.id_back} alt="ID Back" className="document-image" />
                    )}
                  </div>
                ) : (
                  <div className="document-placeholder">
                    <span>No document uploaded</span>
                  </div>
                )}

                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.gif,.pdf"
                  onChange={(e) => handleFileChange(e, 'id_back')}
                  id="id_back_input"
                  className="file-input"
                />
                <label htmlFor="id_back_input" className="file-upload-btn">
                  Choose ID Back
                </label>
              </div>
            </div>

            {(documentFiles.id_front || documentFiles.id_back) && (
              <div className="upload-actions">
                <button onClick={handleDocumentUpload} className="upload-btn">
                  Upload Documents
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="danger-tab">
            <h2>Danger Zone</h2>
            <div className="danger-section">
              <h3>Delete Account</h3>
              <p className="danger-warning">
                ⚠️ <strong>Warning:</strong> This action cannot be undone. Deleting your account will permanently remove all your data, bookings, and associated files.
              </p>

              <div className="delete-confirmation">
                <label htmlFor="delete_confirmation">
                  Type "DELETE" to confirm account deletion:
                </label>
                <input
                  type="text"
                  id="delete_confirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE here"
                  className="delete-input"
                />
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteConfirmation !== 'DELETE'}
                className="delete-account-btn"
              >
                Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Account Deletion</h3>
            <p>
              Are you absolutely sure you want to delete your account? This action cannot be undone and will:
            </p>
            <ul>
              <li>Permanently delete all your personal information</li>
              <li>Cancel all your active bookings</li>
              <li>Remove all uploaded documents</li>
              <li>Delete your account history</li>
            </ul>

            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="secondary-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="danger-btn"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;