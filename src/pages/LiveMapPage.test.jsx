
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LiveMapPage from './LiveMapPage';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';

// Mock dependencies
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer"></div>,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({ fitBounds: vi.fn(), setView: vi.fn() }),
}));

vi.mock('react-firebase-hooks/firestore', () => ({
  useDocument: vi.fn(),
  useCollection: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ companyId: 'test-company' }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockDevices = [
  { id: 'dev1', name: 'Truck 1', lastPosition: { lat: 34.05, lng: -118.25 }, isActive: true, updatedAt: { toDate: () => new Date('2023-01-01T12:00:00Z') } },
  { id: 'dev2', name: 'Truck 2', lastPosition: { lat: 36.16, lng: -115.13 }, isActive: false, updatedAt: { toDate: () => new Date('2023-01-01T13:00:00Z') } },
];

const mockSingleDevice = {
    id: 'dev1',
    ...mockDevices[0],
    exists: () => true,
    data: () => mockDevices[0],
};

describe('LiveMapPage', () => {
  beforeEach(() => {
    useCollection.mockReset();
    useDocument.mockReset();
    mockNavigate.mockReset();
  });

  describe('All Devices View', () => {
    beforeEach(() => {
      useDocument.mockReturnValue([null, false, null]);
    });

    it('Live Map Page: Renders loading state initially', () => {
      useCollection.mockReturnValue([null, true, null]);
      render(<MemoryRouter><LiveMapPage /></MemoryRouter>);
      expect(screen.getByText('Loading map...')).toBeInTheDocument();
    });

    it('Live Map Page: Renders error state', () => {
      useCollection.mockReturnValue([null, false, { message: 'Failed to fetch' }]);
      render(<MemoryRouter><LiveMapPage /></MemoryRouter>);
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });

    it('Live Map Page: Renders map with multiple device markers and popups', () => {
      const snapshot = { docs: mockDevices.map(d => ({ id: d.id, data: () => d })) };
      useCollection.mockReturnValue([snapshot, false, null]);
      render(<MemoryRouter><LiveMapPage /></MemoryRouter>);
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(mockDevices.length);
    });

    it('Live Map Page: "View Live Device" button works', () => {
      const snapshot = { docs: mockDevices.map(d => ({ id: d.id, data: () => d })) };
      useCollection.mockReturnValue([snapshot, false, null]);
      render(<MemoryRouter><LiveMapPage /></MemoryRouter>);

      const viewLiveButtons = screen.getAllByRole('button', { name: /view live/i });
      fireEvent.click(viewLiveButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/live/dev1');
    });
  });

  describe('Single Device View', () => {
    beforeEach(() => {
      useCollection.mockReturnValue([null, false, null]);
    });

    it('Single Device Live Page: Renders loading state', () => {
      useDocument.mockReturnValue([null, true, null]);
      render(<MemoryRouter initialEntries={['/live/dev1']}><Routes><Route path="/live/:deviceId" element={<LiveMapPage />} /></Routes></MemoryRouter>);
      expect(screen.getByText('Loading map...')).toBeInTheDocument();
    });

    it('Single Device Live Page: Renders error state', () => {
        useDocument.mockReturnValue([null, false, { message: 'Failed to fetch' }]);
        render(<MemoryRouter initialEntries={['/live/dev1']}><Routes><Route path="/live/:deviceId" element={<LiveMapPage />} /></Routes></MemoryRouter>);
        expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });

    it('Single Device Live Page: Renders "device not found" message', () => {
      useDocument.mockReturnValue([{ exists: () => false }, false, null]);
      render(<MemoryRouter initialEntries={['/live/dev99']}><Routes><Route path="/live/:deviceId" element={<LiveMapPage />} /></Routes></MemoryRouter>);
      expect(screen.getByText('Device not found.')).toBeInTheDocument();
    });

    it('Single Device Live Page: Renders map centered on a single device with info card', () => {
      useDocument.mockReturnValue([mockSingleDevice, false, null]);
      render(<MemoryRouter initialEntries={['/live/dev1']}><Routes><Route path="/live/:deviceId" element={<LiveMapPage />} /></Routes></MemoryRouter>);
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      expect(screen.getByTestId('marker')).toBeInTheDocument();
      
      const infoCard = screen.getByTestId('info-card');
      expect(within(infoCard).getByText('Truck 1')).toBeInTheDocument();
      expect(within(infoCard).getByText('Status:')).toBeInTheDocument();
    });

    it('Single Device Live Page: Renders message when single device has no position', () => {
        const deviceNoPosition = { ...mockSingleDevice, lastPosition: null, data: () => ({ ...mockDevices[0], lastPosition: null }) };
        useDocument.mockReturnValue([deviceNoPosition, false, null]);
        render(<MemoryRouter initialEntries={['/live/dev1']}><Routes><Route path="/live/:deviceId" element={<LiveMapPage />} /></Routes></MemoryRouter>);
        expect(screen.getByText('This device has not reported its position yet.')).toBeInTheDocument();
    });
  });
});
