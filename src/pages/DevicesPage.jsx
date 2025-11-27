import React, { useState, useMemo, useCallback } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSpinner, FaMapMarkedAlt, FaCarBattery, FaStreetView, FaClock } from 'react-icons/fa';
import { serverTimestamp } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import { getDevicesQueryByCompany, createDevice } from '../firestore';
import styles from './DevicesPage.module.css';

// --- Helper Function for Timestamps ---
const formatTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) {
    return 'N/A';
  }
  return timestamp.toDate().toLocaleString();
};

const DevicesPage = () => {
  const { user, companyId } = useAuth();
  const navigate = useNavigate();
  
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const query = useMemo(() => companyId ? getDevicesQueryByCompany(companyId) : null, [companyId]);
  const [devicesSnapshot, loading, error] = useCollection(query);

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  const addDevice = async (e) => {
    e.preventDefault();
    if (!deviceId || !deviceName || !companyId) {
      setFeedback({ message: 'Device ID and Name are required.', type: 'error' });
      return;
    }

    setIsAdding(true);
    setFeedback({ message: '', type: '' });

    try {
      const deviceData = {
        name: deviceName,
        companyId: companyId,
        isActive: false,
        lastPosition: {
          lat: null,
          lng: null,
          speed: 0,
          ignition: false,
          battery: null,
          timestamp: null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await createDevice(deviceId, deviceData);
      setFeedback({ message: 'Device added successfully!', type: 'success' });
      setDeviceId('');
      setDeviceName('');
    } catch (error) {
      console.error("Error adding device:", error);
      setFeedback({ message: `Error: ${error.message}`, type: 'error' });
    }
    setIsAdding(false);
  };

  const renderFeedback = useCallback(() => {
    return <p className={`${styles.feedback} ${styles[feedback.type]}`}>{feedback.message}</p>;
  }, [feedback]);

  const renderDeviceList = () => {
    if (error) {
      return <p className={styles.errorText}>Error loading devices: {error.message}</p>;
    }

    if (!devicesSnapshot || devicesSnapshot.empty) {
      return (
        <div className={styles.emptyState}>
          <p>No devices found. Add one above to get started.</p>
        </div>
      );
    }

    return (
      <div className={styles.deviceList}>
        {devicesSnapshot.docs.map((doc) => {
          const device = doc.data();
          const { lat, lng } = device.lastPosition || {};
          return (
            <div key={doc.id} className={styles.deviceItem}>
                <strong className={styles.deviceName}>{device.name}</strong>
                <span className={`${styles.status} ${device.isActive ? styles.online : styles.offline}`}>
                  {device.isActive ? 'Online' : 'Offline'}
                </span>
                <span className={styles.deviceDetailItem}><FaClock /> {formatTimestamp(device.updatedAt)}</span>
                <span className={styles.deviceDetailItem}><FaStreetView /> {lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'N/A'}</span>
                <span className={styles.deviceDetailItem}><FaCarBattery /> {device.lastPosition?.battery ? `${device.lastPosition.battery}%` : 'N/A'}</span>
                <div className={styles.actions}>
                  <button onClick={() => navigate(`/map/${doc.id}`)} className={styles.viewLiveBtn}>
                    <FaMapMarkedAlt /> View Live
                  </button>
                </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.devicesPageContainer}>
      <div className={styles.header}>
        <h1>Device Dashboard</h1>
      </div>

      <div className={styles.addDeviceCard}>
        <form onSubmit={addDevice} className={styles.addDeviceForm}>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => handleInputChange(e, setDeviceId)}
            placeholder="New Device ID..."
          />
          <input
            type="text"
            value={deviceName}
            onChange={(e) => handleInputChange(e, setDeviceName)}
            placeholder="New Device Name..."
          />
          <button type="submit" disabled={isAdding}>
            {isAdding ? <FaSpinner className={styles.spinner} /> : <FaPlus />}
          </button>
        </form>
        {feedback.message && renderFeedback()}
      </div>

      <div className={styles.deviceListCard}>
        {loading ? <p>Loading devices...</p> : renderDeviceList()}
      </div>
    </div>
  );
};

export default DevicesPage;