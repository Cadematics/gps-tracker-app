import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import styles from './LiveMapPage.module.css';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../firebase';
import L from 'leaflet';

const createColoredIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const onlineIcon = createColoredIcon('green');
const offlineIcon = createColoredIcon('red');

const LiveMapPage = () => {
  const [devices, loading, error] = useCollection(collection(db, 'devices'));
  const position = [51.505, -0.09]; // Default position

  return (
    <div className={styles.liveMapContainer}>
      <h1>Live Map</h1>
      <div className={styles.mapContainer}>
        {loading && <p>Loading map...</p>}
        {error && <p>Error loading map: {error.message}</p>}
        <MapContainer center={position} zoom={2} className={styles.map}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {devices?.docs.map(doc => {
            const device = doc.data();
            if (
              !device.location ||
              typeof device.location.latitude !== 'number' ||
              typeof device.location.longitude !== 'number'
            ) {
              return null;
            }
            const devicePosition = [device.location.latitude, device.location.longitude];

            return (
              <Marker
                key={doc.id}
                position={devicePosition}
                icon={device.status === 'Online' ? onlineIcon : offlineIcon}
              >
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

export default LiveMapPage;
