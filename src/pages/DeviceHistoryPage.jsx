
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './DeviceHistoryPage.module.css';
import L from 'leaflet';

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
  const [devices, setDevices] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      const { data, error } = await supabase.from('devices').select('id, name');
      if (error) {
        console.error('Error fetching devices:', error);
      } else {
        setDevices(data);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedDeviceId && startDate && endDate) {
        setLoading(true);
        setError(null);
        try {
          const { data, error } = await supabase
            .from('device_history')
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

  const currentPosition = positions[playbackIndex];

  return (
    <div className={styles.container}>
      <h2>Device History</h2>
      <div className={styles.filters}>
        <label htmlFor="device-select">Select Device:</label>
        <select id="device-select" value={selectedDeviceId} onChange={handleDeviceChange}>
          <option value="">--Select a device--</option>
          {devices.map(device => (
            <option key={device.id} value={device.id}>{device.name}</option>
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
            {currentPosition && (
              <Marker position={currentPosition}>
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
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
            onChange={e => setPlaybackIndex(parseInt(e.target.value))}
          />
          <span>{new Date(history[playbackIndex].timestamp).toLocaleString()}</span>
        </div>
      )}

      {loading && <div>Loading history...</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};

export default DeviceHistoryPage;
