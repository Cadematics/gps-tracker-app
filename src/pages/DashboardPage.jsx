import React from 'react';
import styles from './DashboardPage.module.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useAuth } from '../hooks/useAuth';
import { getDevicesQueryByCompany, getAlertsQueryByCompany } from '../firestore';

const DashboardPage = () => {
  const { companyId } = useAuth();

  const devicesQuery = companyId ? getDevicesQueryByCompany(companyId) : null;
  const alertsQuery = companyId ? getAlertsQueryByCompany(companyId) : null;

  const [devices, loadingDevices, errorDevices] = useCollection(devicesQuery);
  const [alerts, loadingAlerts, errorAlerts] = useCollection(alertsQuery);

  const onlineDevices = devices?.docs.filter(doc => doc.data().status === 'Online').length || 0;
  const offlineDevices = devices?.docs.length - onlineDevices || 0;

  if (loadingDevices || loadingAlerts) {
    return <div>Loading...</div>;
  }

  if (errorDevices || errorAlerts) {
    return <div>Error: {errorDevices?.message || errorAlerts?.message}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
          <h3>Total Devices</h3>
          <p>{devices?.docs.length || 0}</p>
        </div>
        <div className={styles.statBox}>
          <h3>Online</h3>
          <p>{onlineDevices}</p>
        </div>
        <div className={styles.statBox}>
          <h3>Offline</h3>
          <p>{offlineDevices}</p>
        </div>
        <div className={styles.statBox}>
          <h3>Alerts</h3>
          <p>{alerts?.docs.length || 0}</p>
        </div>
      </div>
      <div className={styles.mapContainer}>
        <MapContainer center={[51.505, -0.09]} zoom={13} className={styles.map}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {devices?.docs.map(doc => {
            const device = doc.data();
            if (device.status !== 'Online' || !device.latitude || !device.longitude) return null;
            return (
              <Marker key={doc.id} position={[device.latitude, device.longitude]}>
                <Popup>
                  {device.name}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
