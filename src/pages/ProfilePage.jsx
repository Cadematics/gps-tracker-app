import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '../context/AuthContext';
import { updateCompany } from '../firestore';
import { uploadCompanyLogo } from '../storage';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

const ProfilePage = () => {
  const { user, company, companyId, setCompany } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (company) {
      setCompanyName(company.name || '');
    }
  }, [company]);

  const handleNameChange = (e) => {
    setCompanyName(e.target.value);
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let logoURL = company.logoURL;
      if (logoFile) {
        logoURL = await uploadCompanyLogo(companyId, logoFile);
      }

      await updateCompany(companyId, { name: companyName, logoURL });
      setCompany({ ...company, name: companyName, logoURL });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setSuccess('Password reset email sent!');
    } catch (err) {
      setError('Failed to send password reset email.');
    }
  };

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1>Company Profile</h1>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <div className={styles.avatarContainer}>
        <img src={company.logoURL || '/placeholder.png'} alt="Company Logo" className={styles.avatar} />
        <input type="file" onChange={handleLogoChange} />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="companyName">Company Name</label>
        <input
          type="text"
          id="companyName"
          value={companyName}
          onChange={handleNameChange}
        />
      </div>

      <button onClick={handleProfileUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update Profile'}
      </button>

      <div className={styles.passwordReset}>
        <h2>Reset Password</h2>
        <p>Send a password reset link to your email.</p>
        <button onClick={handlePasswordReset}>Send Reset Link</button>
      </div>
    </div>
  );
};

export default ProfilePage;
