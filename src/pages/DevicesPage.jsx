import React, { useState } from 'react';
import styles from './DevicesPage.module.css';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuth } from '../hooks/useAuth';
import { createDevice, getDevicesQueryByCompany, deviceExists } from '../firestore';
import { serverTimestamp } from 'firebase/firestore';
import { FaPlus, FaSpinner, FaExclamationCircle, FaCheckCircle, FaServer } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DevicesPage = () => {
  const { companyId } = useAuth();
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isAdding, setIsAdding] = useState(false);

  const devicesQuery = companyId ? getDevicesQueryByCompany(companyId) : null;
  const [devices, loading, error] = useCollection(devicesQuery);

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
  };

  const addDevice = async (e) => {
    e.preventDefault();
    if (deviceId.trim() === '' || deviceName.trim() === '' || !companyId) {
      setFeedback({
        type: 'error',
        message: 'Please enter both a unique device ID and a name.',
      });
      return;
    }

    setIsAdding(true);

    try {
      const exists = await deviceExists(deviceId);
      if (exists) {
        setFeedback({
          type: 'error',
          message: 'A device with this ID already exists. Please use a different ID.',
        });
        setIsAdding(false);
        return;
      }

      await createDevice(deviceId, {
        deviceId: deviceId,
        companyId: companyId,
        name: deviceName,
        isActive: true,
        lastPosition: { lat: null, lng: null, speed: null, ignition: null, battery: null, timestamp: null },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      setDeviceId('');
      setDeviceName('');
      setFeedback({ type: 'success', message: 'Device added successfully!' });
    } catch (error) {
      console.error('Error adding device: ', error);
      setFeedback({
        type: 'error',
        message: 'Error adding device. Please try again.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const renderFeedback = () => {
    if (!feedback.message) return null;
    const Icon = feedback.type === 'success' ? FaCheckCircle : FaExclamationCircle;
    return (
      <div className={`${styles.feedback} ${styles[feedback.type]}`}>
        <Icon />
        <span>{feedback.message}</span>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FaServer size={50} />
      <h2>No Devices Found</h2>
      <p>Add your first device using the form above to start monitoring.</p>
    </div>
  );

  return (
    <div className={styles.devicesContainer}>
      <h1>Devices</h1>

      <form onSubmit={addDevice} className={styles.addDeviceForm}>
        <input
          type="text"
          value={deviceId}
          onChange={(e) => handleInputChange(e, setDeviceId)}
          placeholder="Enter device ID"
          aria-label="Device ID"
        />
        <input
          type="text"
          value={deviceName}
          onChange={(e) => handleInputChange(e, setDeviceName)}
          placeholder="Enter device name"
          aria-label="Device Name"
        />
        <button type="submit" disabled={isAdding}>
          {isAdding ? <><FaSpinner className={styles.spinner} /> Adding...</> : 'Add Device'}
        </button>
      </form>

      {feedback.message && renderFeedback()}

      <div className={styles.deviceListCard}>
        {loading && <p>Loading devices...</p>}
        {error && <p className={styles.errorText}>Error loading devices: {error.message}</p>}
        {!loading && !error && (
          devices?.docs.length === 0 ? renderEmptyState() : (
            <table className={styles.devicesTable}>
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Battery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices?.docs.map((doc) => {
                  const device = doc.data();
                  return (
                    <tr key={doc.id}>
                      <td>{device.deviceId}</td>
                      <td>{device.name}</td>
                      <td>
                        <span className={`${styles.status} ${device.isActive ? styles.online : styles.offline}`}>
                          {device.isActive ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td>{device.lastPosition?.battery ? `${device.lastPosition.battery}%` : 'N/A'}</td>
                      <td>
                        <Link to={`/dashboard/live/${doc.id}`} className={styles.actionLink}>
                          View Live
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
};

export default DevicesPage;
