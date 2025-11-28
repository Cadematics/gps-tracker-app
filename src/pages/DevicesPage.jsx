import React, { useState, useMemo } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSpinner, FaMapMarkedAlt, FaCar, FaBroadcastTower, FaClock, FaTachometerAlt, FaSearch } from 'react-icons/fa';
import { serverTimestamp } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import { getDevicesQueryByCompany, createDevice } from '../firestore';
import styles from './DevicesPage.module.css';

const formatTimestamp = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return 'N/A';
  return timestamp.toDate().toLocaleString();
};

const DevicesPage = () => {
  const { companyId } = useAuth();
  const navigate = useNavigate();

  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const query = useMemo(() => companyId ? getDevicesQueryByCompany(companyId) : null, [companyId]);
  const [devicesSnapshot, loading, error] = useCollection(query);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!deviceId || !deviceName || !companyId) {
      setFeedback({ message: 'Device ID and Name are required.', type: 'error' });
      return;
    }
    setIsAdding(true);
    try {
      await createDevice(deviceId, {
        name: deviceName,
        companyId: companyId,
        isActive: false,
        lastPosition: { lat: null, lng: null, speed: 0, ignition: false, battery: null, timestamp: null },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setFeedback({ message: 'Device added successfully!', type: 'success' });
      setDeviceId('');
      setDeviceName('');
    } catch (err) {
      setFeedback({ message: `Error: ${err.message}`, type: 'error' });
    }
    setIsAdding(false);
  };

  const filteredDevices = useMemo(() => {
    if (!devicesSnapshot) return [];
    return devicesSnapshot.docs.filter(doc => {
      const device = doc.data();
      const term = searchTerm.toLowerCase();
      return doc.id.toLowerCase().includes(term) || device.name.toLowerCase().includes(term);
    });
  }, [devicesSnapshot, searchTerm]);

  const renderDeviceList = () => {
    if (error) return <p className={styles.errorText}>Error: {error.message}</p>;
    if (filteredDevices.length === 0) return <p>No devices match your search or none found.</p>;

    return (
      <div className={styles.deviceList}>
        {filteredDevices.map((doc) => {
          const device = doc.data();
          const { speed = 0 } = device.lastPosition || {};
          return (
            <div key={doc.id} className={styles.deviceItem}>
              <div className={styles.deviceHeader}>
                <strong className={styles.deviceName}><FaCar /> {device.name}</strong>
                <span className={`${styles.status} ${device.isActive ? styles.online : styles.offline}`}>
                  {device.isActive ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className={styles.deviceDetails}>
                <p><strong>Device ID:</strong> {doc.id}</p>
                <p><FaTachometerAlt /> <strong>Speed:</strong> {speed} km/h</p>
                <p><FaClock /> <strong>Last Seen:</strong> {formatTimestamp(device.updatedAt)}</p>
              </div>
              <div className={styles.actions}>
                <button onClick={() => navigate(`/dashboard/live/${doc.id}`)} className={styles.viewLiveBtn}>
                  <FaBroadcastTower /> View Live
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
      <h1>Device Dashboard</h1>

      <div className={styles.addDeviceCard}>
        <form onSubmit={handleAddDevice} className={styles.addDeviceForm}>
          <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="New Device ID..." />
          <input type="text" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="New Device Name..." />
          <button type="submit" disabled={isAdding}>{isAdding ? <FaSpinner className={styles.spinner} /> : <FaPlus />}</button>
        </form>
        {feedback.message && <p className={`${styles.feedback} ${styles[feedback.type]}`}>{feedback.message}</p>}
      </div>

      <div className={styles.deviceListCard}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by Device ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading ? <p>Loading devices...</p> : renderDeviceList()}
      </div>
    </div>
  );
};

export default DevicesPage;
