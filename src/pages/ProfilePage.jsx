import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '../hooks/useAuth';
import { getCompanyById } from '../firestore';

const ProfilePage = () => {
  const { companyId } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (companyId) {
      const fetchCompany = async () => {
        try {
          const companyData = await getCompanyById(companyId);
          setCompany(companyData);
        } catch (err) {
          setError('Failed to fetch company data.');
        }
        setLoading(false);
      };
      fetchCompany();
    }
  }, [companyId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1>Company Profile</h1>
      {company ? (
        <div>
          <p><strong>Company Name:</strong> {company.name}</p>
          {/* Add other company details here */}
        </div>
      ) : (
        <p>No company information found.</p>
      )}
    </div>
  );
};

export default ProfilePage;
