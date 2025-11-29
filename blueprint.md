# Application Blueprint

## Overview

This document outlines the plan for testing the core pages of the application.

## Testing Plan

I will create and execute tests for the following pages:

*   **Live Map Page:**
    *   Verify map rendering and markers with mock data.
    *   Verify popup shows device details.
    *   Verify "View Live Device" button works.
*   **Devices Page:**
    *   Verify table with mock device data and search functionality.
    *   Verify "View Live" button works.
*   **Single Device Live Page:**
    *   Verify map is centered on the selected device.
    *   Verify info card displays device info.
    *   Verify auto-updates with mock data.
*   **Device History Page:**
    *   Verify device selector and date range picker.
    *   Verify polyline is drawn with mock historical points.
    *   Verify playback slider works.
*   **Profile Page:**
    *   Verify user and company info is correctly loaded.
    *   Verify user can edit company and personal information.

## Test Execution

I will use Vitest and React Testing Library to write and run the tests. I will create a separate test file for each page. After running the tests, I will report the PASS/FAIL status for each page and any issues found.
