
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './DeviceHistoryPage.module.css';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { useCollection } from 'react-firebase-hooks/firestore';
import { getDevicesQueryByCompany } from '../firestore';

// --- Custom Icons ---

// Tiny gray dot for static history points
const staticIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHZpZXdCb3g9IjAgMCA4IDgiIGZpbGw9Im5vbmUiPgo8Y2lyY2xlIGN4PSI0IiBjeT0iNCIgcj0iNCIgZmlsbD0iIzY0NzQ4QiIvPgo8L3N2Zz4K',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});


// Larger, distinct icon for playback
const playbackIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


// Workaround for a known issue with leaflet and webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const DeviceHistoryPage = () => {
  const { deviceId } = useParams();
  const [selectedDeviceId, setSelectedDeviceId] = useState(deviceId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const mapRef = useRef();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { companyId } = useAuth();

  const [devicesSnapshot, loadingDevices, errorDevices] = useCollection(
    companyId ? getDevicesQueryByCompany(companyId) : null
  );

  const devices = devicesSnapshot ? devicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) : [];

  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedDeviceId && startDate && endDate) {
        setLoading(true);
        setError(null);
        try {
          const { data, error } = await supabase
            .from('positions')
            .select('*')
            .eq('device_id', selectedDeviceId)
            .gte('timestamp', new Date(startDate).toISOString())
            .lte('timestamp', new Date(endDate).toISOString())
            .order('timestamp', { ascending: true });

          if (error) {
            throw error;
          }
          setHistory(data);
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHistory();
  }, [selectedDeviceId, startDate, endDate]);

  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
  };

  const positions = history ? history.map(record => [record.lat, record.lng]) : [];

  useEffect(() => {
    if (mapRef.current && positions.length > 0) {
      mapRef.current.fitBounds(positions);
    }
  }, [positions]);

  useEffect(() => {
    if (mapRef.current && history.length > 0 && history[playbackIndex]) {
      const current = history[playbackIndex];
      mapRef.current.setView([current.lat, current.lng]);
    }
  }, [playbackIndex, history]);

  const currentPosition = history.length > 0 ? [history[playbackIndex].lat, history[playbackIndex].lng] : null;


  return (
    <div className={styles.container}>
      <h2>Device History</h2>
      <div className={styles.filters}>
        <label htmlFor="device-select">Select Device:</label>
        <select id="device-select" value={selectedDeviceId} onChange={handleDeviceChange}>
          <option value="">Select device…</option>
          {devices.map(d => (
            <option key={d.id} value={d.id}>
              {d.name || d.id}
            </option>
          ))}
        </select>
        <label htmlFor="start-date">Start Date:</label>
        <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <label htmlFor="end-date">End Date:</label>
        <input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>

      <MapContainer center={[51.505, -0.09]} zoom={13} ref={mapRef} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {positions.length > 0 && (
          <>
            <Polyline positions={positions} />
            {history.map((record, index) => (
              <Marker key={`static-${index}`} position={[record.lat, record.lng]} icon={staticIcon}>
                 <Popup>
                  Timestamp: {new Date(record.timestamp).toLocaleString()}
                </Popup>
              </Marker>
            ))}
            {currentPosition && (
              <Marker position={currentPosition} icon={playbackIcon}>
                <Popup>
                  Current Position: <br /> {new Date(history[playbackIndex].timestamp).toLocaleString()}
                </Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>

      {history && history.length > 0 && (
        <div className={styles.playback}>
          <label htmlFor="playback-slider">Playback:</label>
          <input
            id="playback-slider"
            type="range"
            min="0"
            max={history.length - 1}
            value={playbackIndex}
            onChange={e => setPlaybackIndex(parseInt(e.target.value, 10))}
          />
          <span>{new Date(history[playbackIndex].timestamp).toLocaleString()}</span>
        </div>
      )}

      {loading && <div>Loading history...</div>}
      {(error || errorDevices) && <div>Error: {error ? error.message : errorDevices.message}</div>}
      {loadingDevices && <div>Loading devices...</div>}
    </div>
  );
};

export default DeviceHistoryPage;
