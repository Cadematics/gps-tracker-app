import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LiveMapPage.module.css';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { useAuth } from '../hooks/useAuth';
import { getDevicesQueryByCompany, getDeviceById } from '../firestore';
import { useParams } from 'react-router-dom';

const LiveMapPage = () => {
  const { companyId } = useAuth();
  const { deviceId } = useParams();

  // Memoize the document reference to prevent re-renders
  const deviceRef = useMemo(() => (deviceId ? getDeviceById(deviceId) : null), [deviceId]);
  const [deviceSnapshot, deviceLoading, deviceError] = useDocument(deviceRef);
  
  // Memoize the query to prevent re-renders
  const devicesQuery = useMemo(() => (companyId && !deviceId ? getDevicesQueryByCompany(companyId) : null), [companyId, deviceId]);
  const [devicesSnapshot, devicesLoading, devicesError] = useCollection(devicesQuery);

  const loading = deviceId ? deviceLoading : devicesLoading;
  const error = deviceId ? deviceError : devicesError;
  
  let onlineDevices = [];

  if (deviceId && deviceSnapshot?.exists()) {
    const deviceData = deviceSnapshot.data();
    if (deviceData.isActive && deviceData.lastPosition?.lat && deviceData.lastPosition?.lng) {
      // Create an array with a single item that matches the structure of a collection doc
      onlineDevices.push({ id: deviceSnapshot.id, data: () => deviceData });
    }
  } else if (!deviceId && devicesSnapshot) {
    onlineDevices = devicesSnapshot.docs.filter(doc => doc.data().isActive && doc.data().lastPosition?.lat && doc.data().lastPosition?.lng);
  }

  // Determine the map center and zoom
  const mapCenter = onlineDevices.length > 0 
    ? [onlineDevices[0].data().lastPosition.lat, onlineDevices[0].data().lastPosition.lng] 
    : [51.505, -0.09]; // Default center
    
  const mapZoom = onlineDevices.length > 0 ? 15 : 13;

  return (
    <div className={styles.liveMapContainer}>
      <h1>Live Device Map</h1>
      {loading && <p>Loading map...</p>}
      {error && <p className={styles.errorText}>Error loading map: {error.message}</p>}
      {!loading && (
        <MapContainer center={mapCenter} zoom={mapZoom} className={styles.map}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {onlineDevices.map((doc) => {
            const device = doc.data();
            const { lat, lng, speed, battery, timestamp } = device.lastPosition;
            return (
              <Marker key={doc.id} position={[lat, lng]}>
                <Popup>
                  <b>{device.name}</b><br />
                  Speed: {speed || 'N/A'}<br />
                  Battery: {battery ? `${battery}%` : 'N/A'}<br />
                  Last Updated: {timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
};

export default LiveMapPage;
