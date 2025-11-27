import React, { useMemo } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';
import { getDevicesQueryByCompany } from '../firestore';
import styles from './DashboardPage.module.css';

// --- Custom Car Icon ---
const carIcon = new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2A63EE" width="36px" height="36px"><path d="M0 0h24v24H0z" fill="none"/><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 12c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9s1.5.67 1.5 1.5S7.33 12 6.5 12zm11 0c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5S18.33 12 17.5 12zM5 8l1.5-4.5h11L19 8H5z"/></svg>`,
  className: styles.carIcon,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const DashboardPage = () => {
  const { companyId } = useAuth();
  const query = useMemo(() => companyId ? getDevicesQueryByCompany(companyId) : null, [companyId]);
  const [devicesSnapshot, loading, error] = useCollection(query);

  const stats = useMemo(() => {
    if (!devicesSnapshot) return { total: 0, online: 0, offline: 0 };
    const total = devicesSnapshot.docs.length;
    const online = devicesSnapshot.docs.filter(doc => doc.data().isActive).length;
    return {
      total,
      online,
      offline: total - online
    };
  }, [devicesSnapshot]);

  const devicesWithLocation = useMemo(() => {
    if (!devicesSnapshot) return [];
    return devicesSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.lastPosition && data.lastPosition.lat && data.lastPosition.lng;
    });
  }, [devicesSnapshot]);

  return (
    <div className={styles.dashboardContainer}>
      <h1>Dashboard</h1>
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>Total Devices<span>{stats.total}</span></div>
        <div className={styles.statCard}>Online<span>{stats.online}</span></div>
        <div className={styles.statCard}>Offline<span>{stats.offline}</span></div>
      </div>
      <div className={styles.mapCard}>
        <h2>Fleet Overview</h2>
        {loading && <p>Loading map...</p>}
        {error && <p className={styles.errorText}>Error: {error.message}</p>}
        {!loading && (
          <MapContainer center={[37.7749, -122.4194]} zoom={12} className={styles.map}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {devicesWithLocation.map(doc => {
              const device = doc.data();
              const { lat, lng } = device.lastPosition;
              const markerProps = {};
              if (device.isActive) {
                markerProps.icon = carIcon;
              }

              return (
                <Marker key={doc.id} position={[lat, lng]} {...markerProps}>
                  <Popup>
                    <b>{device.name}</b><br />
                    {device.isActive ? 'Online' : 'Offline'}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
