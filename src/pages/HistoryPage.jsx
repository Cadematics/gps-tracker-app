import React from 'react';
import styles from './HistoryPage.module.css';
import { useAuth } from '../hooks/useAuth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { getAlertsQueryByCompany, getDevicesQueryByCompany } from '../firestore';

const HistoryPage = () => {
  const { companyId } = useAuth();
  const [alerts, loadingAlerts, errorAlerts] = useCollection(
    companyId ? getAlertsQueryByCompany(companyId) : null
  );
  const [devices, loadingDevices, errorDevices] = useCollection(
    companyId ? getDevicesQueryByCompany(companyId) : null
  );

  const history = React.useMemo(() => {
    if (!alerts || !devices) return [];

    const alertEvents = alerts.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      eventType: 'Alert',
    }));

    const deviceEvents = devices.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      eventType: 'Device Created',
      timestamp: doc.data().createdAt
    }));

    const allEvents = [...alertEvents, ...deviceEvents];

    return allEvents.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

  }, [alerts, devices]);

  if (!companyId) {
      return <div>Please log in to view history.</div>
  }

  if (loadingAlerts || loadingDevices) {
    return <div>Loading...</div>;
  }

  if (errorAlerts || errorDevices) {
    return <div>Error: {errorAlerts?.message || errorDevices?.message}</div>;
  }

  return (
    <div className={styles.historyContainer}>
      <h1>History</h1>
      <table className={styles.historyTable}>
        <thead>
          <tr>
            <th>Device</th>
            <th>Date</th>
            <th>Event</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map(event => {
              return (
                <tr key={event.id}>
                  <td>{event.name || 'Unknown Device'}</td>
                  <td>{new Date(event.timestamp?.toDate()).toLocaleString()}</td>
                  <td>{event.eventType === 'Alert' ? event.type : event.eventType}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="3">No history found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryPage;
