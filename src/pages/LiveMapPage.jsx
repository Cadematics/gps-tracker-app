import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LiveMapPage.module.css';

// --- Mock Data ---
const mockDevices = [
  {
    id: "DEV001",
    name: "Truck 1",
    lat: 37.7749,
    lng: -122.4194,
    speed: 45,
    status: "moving",
    lastSeen: "2025-11-22T14:00:00Z",
  },
  {
    id: "DEV002",
    name: "Van A",
    lat: 37.7840,
    lng: -122.4090,
    speed: 0,
    status: "idle",
    lastSeen: "2025-11-22T13:58:00Z",
  },
  {
    id: "DEV003",
    name: "Bike 3",
    lat: 37.7640,
    lng: -122.4290,
    speed: 22,
    status: "moving",
    lastSeen: "2025-11-22T13:59:00Z",
  },
];

// --- Auto-fit Component ---
const FitBounds = ({ devices }) => {
    const map = useMap();
    useEffect(() => {
        if (!devices || devices.length === 0) return;
        const bounds = L.latLngBounds(devices.map(device => [device.lat, device.lng]));
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [devices, map]);
    return null;
};

const LiveMapPage = () => {
  const defaultPosition = [37.7749, -122.4194]; // San Francisco

  const handleViewDevice = (deviceId) => {
    console.log(`Open device ${deviceId}`);
  };

  return (
    <div className={styles.mapContainer}>
      <MapContainer center={defaultPosition} zoom={13} className={styles.map}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mockDevices.map(device => (
          <Marker key={device.id} position={[device.lat, device.lng]}>
            <Popup>
              <div className={styles.popupContent}>
                <h4>{device.name}</h4>
                <p><strong>Status:</strong> {device.status}</p>
                <p><strong>Speed:</strong> {device.speed} mph</p>
                <p><strong>Last Seen:</strong> {new Date(device.lastSeen).toLocaleString()}</p>
                <button
                  className={styles.popupBtn}
                  onClick={() => handleViewDevice(device.id)}
                >
                  View Live Device
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds devices={mockDevices} />
      </MapContainer>
    </div>
  );
};

export default LiveMapPage;
