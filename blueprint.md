# Project Blueprint

## Overview

This document outlines the design and features of the GPS Tracker application. The UI is designed to be clean, professional, and inspired by Google Material Design and modern SaaS dashboards.

## Design Requirements

- **Background:** Light modern background (#F8FAFC)
- **Layout:** Card-based with soft shadows and rounded corners (12px radius)
- **Colors:**
  - **Primary Accent:** #2563EB
  - **Text:** #0F172A (primary), #475569 (secondary)
- **Tables:** High contrast with a clean grid and row hover effects
- **Spacing:** Consistent use of 8, 12, 20, and 32 px
- **Components:** Modular and reusable

## Navigation Layout

- **Top Navigation Bar:**
  - **Left:** Company logo
  - **Right (Logged Out):** Login / Register
  - **Right (Logged In):** "Live", "Devices", "History", "Reports", "Profile", avatar menu

## Page Canvas

- **Container:** Full viewport width, with content centered and a max-width of 1400px
- **Page Headers:** Consistent headers with a title, subtitle, and action buttons on the right

## Component Styles

- **Map:** Full-width, rounded map section with a floating device info card
- **Tables:** Clean grid, row hover effect, and status badges (green for online, gray for offline)
- **Forms:** Minimalistic inputs with rounded corners (8px), labels above the input, and clear spacing between fields
