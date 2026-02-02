import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '../context/AuthContext';
import { updateCompany } from '../firestore';
import { uploadCompanyLogo } from '../storage';
import { sendPasswordResetEmail, verifyBeforeUpdateEmail } from 'firebase/auth'; // Updated import
import { auth } from '../firebase';

const ProfilePage = () => {
  const { user, company, companyId, loading: authLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [displayLogoUrl, setDisplayLogoUrl] = useState('');

  useEffect(() => {
    if (company && companyId) {
      setFormData({
        companyName: company.companyName || '',
        adminFullName: company.adminFullName || '',
        email: company.email || '',
        companyPhone: company.companyPhone || '',
        companyAddress: company.companyAddress || '',
      });
      // Use placeholder if companyLogoUrl is null or empty
      setDisplayLogoUrl(company.companyLogoUrl || '/placeholder.png');
    }
  }, [company, companyId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setDisplayLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    if (!companyId || !user) {
      setError('Cannot update profile: Missing user or company information.');
      return;
    }
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      let emailChangeMessage = '';
      // If email is being changed, send verification email
      if (formData.email !== user.email) {
        await verifyBeforeUpdateEmail(user, formData.email);
        emailChangeMessage = 'A verification link has been sent to your new email. Please verify to update your login email.';
      }

      let logoURL = company.companyLogoUrl;
      if (logoFile) {
        logoURL = await uploadCompanyLogo(companyId, logoFile);
      }

      const updatedData = { ...formData, companyLogoUrl: logoURL };
      await updateCompany(companyId, updatedData);

      setSuccess(`Profile updated successfully! ${emailChangeMessage}`);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      // Provide more specific feedback
      if (err.code === 'auth/requires-recent-login') {
        setError('This is a sensitive operation. Please log out and log back in before changing your email.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
      setDisplayLogoUrl(company.companyLogoUrl || '/placeholder.png'); // Revert on failure
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setSuccess(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setSuccess(`Password reset email sent to ${user.email}!`);
    } catch (err) {
      setError('Failed to send password reset email.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setLogoFile(null);
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        adminFullName: company.adminFullName || '',
        email: company.email || '',
        companyPhone: company.companyPhone || '',
        companyAddress: company.companyAddress || '',
      });
      setDisplayLogoUrl(company.companyLogoUrl || '/placeholder.png');
    }
  };

  if (authLoading) {
    return <div className={styles.centered}>Loading...</div>;
  }

  if (!companyId) {
    return <div className={styles.centered}>Company profile not found.</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1>Company Profile</h1>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <div className={styles.formContent}>
        <div className={styles.avatarContainer}>
          <img 
            src={displayLogoUrl} 
            alt="Company Logo" 
            className={styles.avatar} 
          />
          {isEditing && <input type="file" onChange={handleLogoChange} accept="image/*" />}
        </div>

        <div className={styles.formFields}>
          {Object.entries(formData).map(([key, value]) => (
            <div className={styles.formGroup} key={key}>
              <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
              {isEditing ? (
                key === 'companyAddress' ? (
                  <textarea id={key} value={value} onChange={handleInputChange} rows="3"></textarea>
                ) : (
                  <input type="text" id={key} value={value} onChange={handleInputChange} />
                )
              ) : (
                <p className={styles.staticText}>{value || 'Not set'}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {isEditing ? (
        <div className={styles.buttonGroup}>
          <button onClick={handleProfileUpdate} disabled={updating} className={styles.saveButton}>
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={handleCancelEdit} className={styles.cancelButton}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setIsEditing(true)} className={styles.editButton}>Edit Profile</button>
      )}

      <div className={styles.passwordReset}>
        <h2>Reset Password</h2>
        <p>Send a password reset link to your email address.</p>
        <button onClick={handlePasswordReset}>Send Reset Link</button>
      </div>
    </div>
  );
};

export default ProfilePage;
