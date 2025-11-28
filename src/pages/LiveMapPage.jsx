import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import 'leaflet/dist/leaflet.css';

import { useAuth } from '../context/AuthContext';
import { getDevicesQueryByCompany, getDeviceById } from '../firestore';
import styles from './LiveMapPage.module.css';

const FitBounds = ({ devices }) => {
  const map = useMap();
  React.useEffect(() => {
    const validDevices = devices.filter(d => d.lat && d.lng);
    if (validDevices.length > 0) {
      map.fitBounds(validDevices.map(d => [d.lat, d.lng]));
    }
  }, [devices, map]);
  return null;
};

const CenterMap = ({ position }) => {
  const map = useMap();
  React.useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
};

const LiveMapPage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { companyId } = useAuth();

  // Hooks for fetching data
  const singleDeviceQuery = useMemo(() => (deviceId ? getDeviceById(deviceId) : null), [deviceId]);
  const [deviceSnapshot, deviceLoading, deviceError] = useDocument(singleDeviceQuery);

  const allDevicesQuery = useMemo(() => (!deviceId && companyId ? getDevicesQueryByCompany(companyId) : null), [deviceId, companyId]);
  const [allDevicesSnapshot, allDevicesLoading, allDevicesError] = useCollection(allDevicesQuery);

  const loading = deviceLoading || allDevicesLoading;
  const error = deviceError || allDevicesError;

  // Memoize device data
  const device = useMemo(() => (deviceSnapshot?.exists() ? { id: deviceSnapshot.id, ...deviceSnapshot.data() } : null), [deviceSnapshot]);
  const allDevices = useMemo(() => (allDevicesSnapshot ? allDevicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) : []), [allDevicesSnapshot]);

  if (loading) return <div className={styles.centeredMessage}>Loading map...</div>;
  if (error) return <div className={styles.centeredMessage}>Error: {error.message}</div>;
  if (deviceId && !device) return <div className={styles.centeredMessage}>Device not found.</div>;

  const hasPosition = device?.lastPosition?.lat && device?.lastPosition?.lng;

  const renderInfoCard = () => {
    if (!device) return null;
    return (
      <div className={styles.infoCard}>
        <h3>{device.name}</h3>
        <p><strong>Status:</strong> {device.isActive ? 'Online' : 'Offline'}</p>
        <p><strong>Speed:</strong> {device.lastPosition?.speed || 0} km/h</p>
        <p><strong>Last Seen:</strong> {device.updatedAt?.toDate()?.toLocaleString() || 'N/A'}</p>
      </div>
    );
  };

  return (
    <div className={styles.mapPageContainer}>
      {deviceId && renderInfoCard()}
      <MapContainer center={[37.77, -122.41]} zoom={12} className={styles.mapContainer}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

        {deviceId ? (
          hasPosition && (
            <Marker position={[device.lastPosition.lat, device.lastPosition.lng]}>
              <Popup>{device.name}</Popup>
            </Marker>
          )
        ) : (
          allDevices.map(d => (
            d.lastPosition?.lat && d.lastPosition?.lng && (
              <Marker key={d.id} position={[d.lastPosition.lat, d.lastPosition.lng]}>
                <Popup>
                  <h4>{d.name}</h4>
                  <button className={styles.popupBtn} onClick={() => navigate(`/dashboard/live/${d.id}`)}>
                    View Live
                  </button>
                </Popup>
              </Marker>
            )
          ))
        )}

        {deviceId && hasPosition && <CenterMap position={[device.lastPosition.lat, device.lastPosition.lng]} />}
        {!deviceId && <FitBounds devices={allDevices.map(d => d.lastPosition)} />}
		
      </MapContainer>
      {deviceId && !hasPosition && <div className={styles.centeredMessage}>This device has not reported its position yet.</div>}
    </div>
  );
};

export default LiveMapPage;
