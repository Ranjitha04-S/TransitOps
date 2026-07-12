# Frontend Integration Guide: Phase 2 (Vehicle & Driver Registries)

This guide provides UI layout ideas, API integration patterns, and layout components for the Vehicle and Driver registries.

---

## 🏢 1. Vehicle Registry UI Design Guidelines

Refer to **Screen 2: Vehicle Registry** in the Excalidraw mockup:
*   **Header**: Contains the "Vehicles" page title and an orange **"+ Add Vehicle"** action button.
*   **Filter Bar**:
    *   Dropdown for **Vehicle Type** (Options: `'All'`, `'Truck'`, `'Van'`, `'Car'`).
    *   Dropdown for **Status** (Options: `'All'`, `'Available'`, `'On Trip'`, `'In Shop'`, `'Retired'`).
    *   Dropdown for **Region** (Options: `'All'`, `'North'`, `'South'`, `'East'`, `'West'`).
    *   General Search text input.
*   **Asset Table / Cards**:
    *   Display: `Registration Number` (bold), `Name/Model`, `Type`, `Region`, `Max Capacity (kg)`, `Odometer (km)`, `Acquisition Cost`, and `Status`.
    *   Status badges should map directly to our CSS custom classes:
        *   `Available` -> Background transparent green, text `#10B981`, border `1px solid rgba(16, 185, 129, 0.3)`
        *   `On Trip` -> Background transparent blue, text `#3B82F6`, border `1px solid rgba(59, 130, 246, 0.3)`
        *   `In Shop` -> Background transparent amber, text `#F59E0B`, border `1px solid rgba(245, 158, 11, 0.3)`
        *   `Retired` -> Background transparent red, text `#EF4444`, border `1px solid rgba(239, 68, 68, 0.3)`

### Example API Request (List Vehicles with filters)
```javascript
const fetchVehicles = async (filters) => {
  // filters = { type: 'Truck', status: 'Available', region: 'North', search: '' }
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`/vehicles?${params}`);
  return response.data.vehicles;
};
```

---

## 🚛 2. Driver Registry UI Design Guidelines

Refer to **Screen 3: Drivers & Safety Profiles** in the Excalidraw mockup:
*   **Header**: Contains the "Drivers" page title and an orange **"+ Add Driver"** action button.
*   **Table Layout**:
    *   Display fields: `Driver Name`, `License Number`, `License Category`, `Expiry Date`, `Contact Number`, `Safety Score` (displayed as a badge, e.g., Green if `> 85`, Amber if `70 - 85`, Red if `< 70`), and `Status`.
*   **⚠️ Expiry Warnings**:
    *   If `isLicenseExpired === true` in the API response, display a red **"⚠️ Expired"** badge next to the driver's license expiration date to prevent the operator from dispatching them.

---

## 🛠️ Modals & Input Validation Rules

### Create/Edit Vehicle Form
*   **Registration Number**: Input pattern mask (e.g. standard regional license formats). Must be unique.
*   **Max Capacity**: Number input, minimum `1` kg.
*   **Odometer**: Number input, cannot be negative.
*   **Acquisition Cost**: Number input, required for financial analyst ROI metrics.

### Create/Edit Driver Form
*   **License Expiry Date**: Standard date picker.
*   **Safety Score**: Range input (`0 - 100`) or numeric bounds.
*   **Contact Number**: Phone number pattern formatting.
