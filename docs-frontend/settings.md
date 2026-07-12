# Settings Console - Frontend Documentation

This document describes settings layout components, profile editing workflows, units toggle systems, and localized `localStorage` persistence.

---

## 🎨 Layout Specifications

*   **View Route:** `/settings` (Protected routing restricted to authenticated users).
*   **Header Section:** Contains page title "Console Settings" and a short description text.
*   **Grid layout:** Includes double-column layout dividing profile modifications and preference configuration:
    *   **Column 1: User Profile Settings Card:**
        *   Displays username, workstation email, and assigned security role.
        *   Input fields to update Username and update the security passcode Authorization Key.
    *   **Column 2: Operational Preferences Card:**
        *   Dropdown select for Distance Units (Options: `Metric (km)`, `Imperial (miles)`).
        *   Dropdown select for Capacity Units (Options: `Metric (kg)`, `Imperial (lbs)`).
        *   Dropdown select for System Currency (Options: `INR (₹)`, `USD ($)`).
        *   Dropdown select for Telemetry Reload Frequency (Options: `Real-time (10s)`, `Standard (30s)`, `Hourly (60m)`, `Manual Only`).

---

## ⚙️ Persistent Configuration (localStorage)

All operational units selection are cached on state change to browser `localStorage` under key `transitops_console_settings`:

### LocalStorage Schema Example:
```json
{
  "distanceUnit": "metric",
  "capacityUnit": "metric",
  "currency": "INR",
  "refreshInterval": 10
}
```

---

## 🛠️ Modals & Input Validation Rules

*   **Profile Username:** Must be between 2 and 50 characters.
*   **Authorization Passcode:** Passwords must be at least 6 characters. Matches standard regex validators.
