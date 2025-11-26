# Project Blueprint

## Overview

This is a real-time GPS tracking application designed for companies to monitor their fleet of devices. The application allows users to view the status and location of their devices, manage their device inventory, and receive alerts.

## Implemented Features

### User Authentication

*   **User Registration:** Companies can create a new account to access the platform. The registration process now creates a new company and user in Firestore, with the user assigned as the owner of the company. The company name is now consistently stored under the `name` field.
*   **User Login:** Registered users can log in to the application.
*   **Data Isolation:** Each company's data is isolated, ensuring that they can only see their own devices and information. All Firestore queries for devices and company data are now filtered by the logged-in user's `companyId`.
*   **Extended `useAuth` Hook:** The `useAuth` hook now loads the user's Firestore document in addition to the Firebase Auth user. It returns the user's `companyId`, `role`, `fullName`, and `companyName`. For backward compatibility, the hook now checks for both `name` and `companyName` when fetching the company document, ensuring the name is always found.

### UI/UX

*   **Navbar:** The navigation bar now has a light background color with dark text for improved readability. It reliably displays the user's company name next to their avatar. The user menu dropdown is now only triggered when hovering over the user menu, and the "Profile" button now correctly navigates to the nested profile page.
*   **Dashboard Layout:** The main dashboard layout includes a persistent side navigation menu for consistent navigation across all dashboard pages.

### Routing

*   **Dashboard as Home:** The `DashboardPage` is now the main entry point for authenticated users.
*   **Private Routes:** All authenticated routes are protected using the `PrivateRoute` component.
*   **Nested Profile Page:** The `ProfilePage` is now a nested route within the `DashboardLayout`, ensuring the side menu remains visible.

### Device Management

*   **Device List:** Users can view a list of all their registered devices, including their name, status (Online/Offline), and battery level.
*   **Add Device:** Users can add new devices to their inventory. New devices are now correctly associated with the user's `companyId`.
*   **Device Creation Timestamp:** The `createDevice` function now adds a `createdAt` timestamp to all new devices.
*   **Enhanced Device Page UI:** The "Devices" page now features a more modern and user-friendly interface. It includes:
    *   An improved "Add Device" form with clear labels and input fields.
    *   Better visual feedback for success and error messages.
    *   A helpful empty state message when no devices are present, guiding the user to add their first device and confirming the creation of the `devices` collection.

### Dashboard

*   **Device Statistics:** The dashboard displays the total number of devices, as well as the number of online and offline devices.
*   **Alerts:** The dashboard shows the total number of alerts for the user's devices.
*   **Live Map:** A real-time map displays the location of all **online** devices.
*   **Loading and Error Handling:** The dashboard now displays a loading indicator while data is being fetched and shows an error message if there is a problem.

### History

*   **Unified History:** The "History" page now shows a complete, chronologically sorted list of both device alerts and device creation events.

### User Profile

*   **Profile Page:** Users can view their company information on the profile page, which now fetches data based on the user's `companyId`.
*   **Logout:** Users can log out of the application from the user menu.

### Firestore Helpers

*   **`src/firestore.js`:** Created a dedicated file to house all Firestore-related helper functions, promoting code reusability and maintainability.
*   **`getCompanyById(companyId)`:** Retrieves a company's data from Firestore.
*   **`getUserById(userId)`:** Retrieves a user's data from Firestore.
*   **`getDevicesByCompany(companyId)`:** Retrieves all devices associated with a specific company.
*   **`createCompany(data)`:** Creates a new company in Firestore.
*   **`createUser(data)`:** Creates a new user in Firestore.
*   **`createDevice(data)`:** Creates a new device in Firestore.
*   **`getDevicesQueryByCompany(companyId)`:** Returns a Firestore query for a company's devices, filtered by `companyId`.
*   **`getAlertsQueryByCompany(companyId)`:** Returns a Firestore query for a company's alerts, filtered by `companyId`.

## Current Task: Enforce Company-Based Data Isolation

**Objective:** Update all Firestore queries for devices and company data so they filter by the logged-in user's `companyId`.

**Completed Steps:**

1.  **Updated `src/firestore.js`:**
    *   Modified `getDevicesQueryByCompany` and `getAlertsQueryByCompany` to query by the `companyId` field instead of `userId`.
2.  **Updated `src/pages/DevicesPage.jsx`:**
    *   Ensured that when a new device is created, it is associated with the correct `companyId`.
3.  **Updated `src/pages/ProfilePage.jsx`:**
    *   The component now fetches the company's data using the `companyId` from the `useAuth` hook and displays it.
4.  **Verified Other Components:**
    *   Confirmed that `DashboardPage.jsx` and `HistoryPage.jsx` were already correctly using `companyId` for their queries.
5.  **Updated `blueprint.md`:** The project blueprint has been updated to reflect the implementation of company-based data isolation.