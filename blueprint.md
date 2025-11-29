# Application Blueprint

## Overview

This application is a real-time GPS tracking platform designed to monitor and manage a fleet of devices. It provides a web-based interface for visualizing device locations, viewing historical data, and managing device information. The system is built using React for the frontend and Firebase/Supabase for the backend, ensuring real-time data synchronization and a responsive user experience.

## Implemented Features & Design

This section documents the project's current state, including all styles, designs, and features from the initial version to the latest update.

### Core Architecture
- **Frontend:** React with Vite, using functional components and hooks.
- **Backend:** Firebase (Firestore) for real-time device data and user authentication. Supabase for storing historical position data.
- **Routing:** `react-router-dom` for navigating between pages.
- **Real-time Data:** `react-firebase-hooks` for live updates from Firestore.
- **Styling:** CSS Modules for component-scoped styles, with a modern and clean design aesthetic. Font Awesome icons enhance the UI's clarity.

### Page-by-Page Breakdown

#### 1. Dashboard (`/dashboard`)
- **Purpose:** Provides a high-level overview of the entire fleet.
- **Features:**
    - **Statistics Cards:** Displays the total number of devices, as well as the count of "Online" and "Offline" devices.
    - **Real-time Status Logic:** The online/offline counts are now accurate. A device is considered "Online" if its last position timestamp was updated within the last 60 seconds. This logic is shared with the Devices page.
    - **Fleet Overview Map:** A Leaflet map that shows the last known location of all active devices. Online devices are marked with a custom car icon.

#### 2. Devices Page (`/dashboard/devices`)
- **Purpose:** A detailed list for managing all registered devices.
- **Features:**
    - **Device Table:** Displays all devices with their Name, ID, Status, Speed, and Last Seen timestamp.
    - **Dynamic Real-time Status:** The "Status" column is no longer based on a static `isActive` flag. It is now dynamically computed based on the `lastPosition.timestamp`. This provides an accurate, real-time reflection of a device's connectivity.
    - **Copy Device ID:** A "Copy" button (`<FaCopy />`) has been added next to each device ID, allowing users to quickly copy it to their clipboard with visual feedback.
    - **Search & Filter:** Users can perform a text search on device names/IDs and filter the list by "All," "Online," or "Offline" status.
    - **Device Actions:** Each device has "View Live" and "History" buttons for quick navigation.
    - **Add New Device:** A form allows for the registration of new devices.

#### 3. Device History Page (`/dashboard/device-history/:deviceId`)
- **Purpose:** To review the historical travel data for a specific device.
- **Features:**
    - **Date & Device Selection:** Users can select a device and a date range to query its history.
    - **Map Visualization:** A Leaflet map displays the device's path as a polyline.
    - **Playback Control:** A slider allows the user to step through the device's journey point by point.
    - **Date Filter Bug Fix:** The query logic has been corrected to ensure the end date of the filter is inclusive of the entire selected day, preventing data from being missed.

#### 4. Live Map Page (`/dashboard/live/:deviceId`)
- **Purpose:** To track a single device in real-time.
- **Features:**
    - The map automatically centers on the device's latest position.
    - An information card displays key metrics like speed and battery level.
    - The view updates automatically as new data arrives from Firestore.

### Authentication
- **Auth Flow:** A complete authentication system with pages for Login, Registration, and Profile management.
- **Context API:** `AuthContext` provides user and company information throughout the application.
- **Protected Routes:** `PrivateRoute` ensures that only authenticated users can access the dashboard and related pages.

## Last Completed Task

The primary goal of the last session was to improve the accuracy and usability of the device status display.

**Plan & Steps Executed:**
1.  **Analyze Status Logic:** Investigated the status calculation on the `DevicesPage` and `DashboardPage`.
2.  **Implement Dynamic Status:** Refactored both pages to use a `getDeviceStatus` function that calculates the status based on `lastPosition.timestamp`.
3.  **Fix History Filter:** Corrected a bug in the `DeviceHistoryPage` date filter to make it inclusive.
4.  **Add Copy ID Feature:** Added a copy-to-clipboard button on the `DevicesPage` for better usability.
5.  **Update Blueprint:** This document was updated to reflect all the new changes and the current state of the application.
