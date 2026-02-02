
import React, { useState, useMemo, useCallback } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSpinner, FaCar, FaBroadcastTower, FaClock, FaTachometerAlt, FaSearch, FaHistory, FaCopy } from 'react-icons/fa';
import { serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import { db, getDevicesQueryByCompany, createDevice } from '../firestore';
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
  const [statusFilter, setStatusFilter] = useState('All');

  const devicesQuery = useMemo(() => companyId ? getDevicesQueryByCompany(companyId) : null, [companyId]);
  const [devicesSnapshot, loading, error] = useCollection(devicesQuery);

  const getDeviceStatus = useCallback((device) => {
    const last = device.lastPosition;
    if (!last || !last.timestamp) return "Offline";
    
    const lastTime = last.timestamp.toDate ? last.timestamp.toDate() : new Date(last.timestamp);
    const now = new Date();
    const diffMs = now - lastTime;
    const diffSeconds = diffMs / 1000;
    
    if (diffSeconds <= 60) return "Online";
    return "Offline";
  }, []);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    const trimmedDeviceId = deviceId.trim();
    const trimmedDeviceName = deviceName.trim();

    if (!trimmedDeviceId || !trimmedDeviceName || !companyId) {
      setFeedback({ message: 'Device ID and Name are required.', type: 'error' });
      return;
    }
    
    setIsAdding(true);
    setFeedback({ message: '', type: '' }); // Clear previous feedback

    try {
      // Validation: Check if a device with this ID already exists for the company
      const q = query(collection(db, 'devices'), where('deviceId', '==', trimmedDeviceId), where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setFeedback({ message: 'Error: Device ID already exists in your company.', type: 'error' });
        setIsAdding(false);
        return;
      }

      // Create Device: If unique, create the new device document
      const newDeviceData = {
        deviceId: trimmedDeviceId,
        name: trimmedDeviceName,
        companyId: companyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: false,
        lastPosition: { lat: null, lng: null, speed: 0, ignition: false, battery: null, timestamp: null },
        config: { logIntervalSec: 1, batchIntervalSec: 30 }, // Added config object
      };

      // Use the user-provided deviceId as the document's unique ID
      await createDevice(trimmedDeviceId, newDeviceData);

      setFeedback({ message: 'Device added successfully!', type: 'success' });
      setDeviceId('');
      setDeviceName('');
    } catch (err) {
      console.error("Error adding device: ", err);
      setFeedback({ message: 'An unexpected error occurred. Please try again.', type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setFeedback({ message: `Copied "${text}" to clipboard.`, type: 'success' });
      setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
    }, (err) => {
      setFeedback({ message: 'Failed to copy!', type: 'error' });
    });
  };

  const filteredDevices = useMemo(() => {
    if (!devicesSnapshot) return [];
    return devicesSnapshot.docs.filter(doc => {
      const device = doc.data();
      const term = searchTerm.toLowerCase();
      
      const status = getDeviceStatus(device);
      const statusMatch = statusFilter === 'All' || status === statusFilter;

      const searchMatch = (device.deviceId && device.deviceId.toLowerCase().includes(term)) || device.name.toLowerCase().includes(term);

      return statusMatch && searchMatch;
    });
  }, [devicesSnapshot, searchTerm, statusFilter, getDeviceStatus]);

  const renderDeviceTable = () => {
    if (error) return <p className={styles.errorText}>Error: {error.message}</p>;
    if (filteredDevices.length === 0) return <p>No devices match your search or none found.</p>;

    return (
      <table className={styles.deviceTable}>
        <thead>
          <tr>
            <th>Device Name</th>
            <th>Device ID</th>
            <th>Status</th>
            <th>Speed</th>
            <th>Last Seen</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDevices.map((doc) => {
            const device = doc.data();
            const { speed = 0 } = device.lastPosition || {};
            const status = getDeviceStatus(device);
            return (
              <tr key={doc.id}>
                <td><FaCar /> {device.name}</td>
                <td>
                  {device.deviceId}
                  <button onClick={() => copyToClipboard(device.deviceId)} className={styles.copyBtn}>
                    <FaCopy />
                  </button>
                </td>
                <td>
                  <span className={`${styles.status} ${status === 'Online' ? styles.online : styles.offline}`}>
                    {status}
                  </span>
                </td>
                <td><FaTachometerAlt /> {speed} km/h</td>
                <td><FaClock /> {formatTimestamp(device.updatedAt)}</td>
                <td className={styles.actions}>
                  <button onClick={() => navigate(`/dashboard/live/${doc.id}`)} className={styles.viewLiveBtn}>
                    <FaBroadcastTower /> View Live
                  </button>
                  <button onClick={() => navigate(`/dashboard/device-history/${doc.id}`)} className={styles.viewHistoryBtn}>
                    <FaHistory /> History
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className={styles.devicesPageContainer}>
      <h1>Device Dashboard</h1>

      <div className={styles.addDeviceCard}>
        <form onSubmit={handleAddDevice} className={styles.addDeviceForm}>
          <input type="text" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="New Device ID..." required />
          <input type="text" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="New Device Name..." required />
          <button type="submit" disabled={isAdding}>{isAdding ? <FaSpinner className={styles.spinner} /> : <FaPlus />}</button>
        </form>
        {feedback.message && <p className={`${styles.feedback} ${styles[feedback.type]}`}>{feedback.message}</p>}
      </div>

      <div className={styles.deviceListCard}>
        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Device ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusFilter}
          >
            <option value="All">All</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
        {loading ? <p>Loading devices...</p> : renderDeviceTable()}
      </div>
    </div>
  );
};

export default DevicesPage;
