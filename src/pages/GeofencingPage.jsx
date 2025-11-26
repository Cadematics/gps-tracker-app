import React from 'react';
import styles from './GeofencingPage.module.css';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';

const GeofencingPage = () => {
  const polygon = [
    [51.515, -0.09],
    [51.52, -0.1],
    [51.52, -0.12],
  ];

  return (
    <div className={styles.geofencingContainer}>
      <h1>Geofencing</h1>
      <div className={styles.mapContainer}>
        <MapContainer
          center={[51.515, -0.1]}
          zoom={13}
          className={styles.map}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Polygon positions={polygon} />
        </MapContainer>
      </div>
    </div>
  );
};

export default GeofencingPage;
