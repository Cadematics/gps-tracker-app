
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DeviceHistoryPage from './DeviceHistoryPage';
import { useCollection } from 'react-firebase-hooks/firestore';
import { vi } from 'vitest';

// Mock the useCollection hook
vi.mock('react-firebase-hooks/firestore', () => ({
  useCollection: vi.fn(),
}));

describe('DeviceHistoryPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    useCollection.mockReset();
  });

  it('renders the component with initial state', () => {
    // Mock the return value for the 'devices' collection
    useCollection.mockReturnValue([null, true, null]);

    render(
      <MemoryRouter initialEntries={['/device-history/some-device-id']}>
        <Routes>
          <Route path="/device-history/:deviceId" element={<DeviceHistoryPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Device History')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Device:')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date:')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date:')).toBeInTheDocument();
  });
});
