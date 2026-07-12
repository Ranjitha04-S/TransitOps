# Frontend Integration Guide: Phase 5 (Dashboard & Reports)

This guide provides UI layout guidelines and integration instructions for the Dashboard, Expense Logging, and Analytics reporting screens.

---

## 📊 1. Dashboard View (Screen 1)

Refer to **Screen 1: Dashboard** in the Excalidraw mockup:
*   **KPI Panel (7 Cards Grid)**:
    *   `Active Vehicles` (Blue)
    *   `Available Vehicles` (Green)
    *   `In Maintenance` (Amber)
    *   `Active Trips` (Purple)
    *   `Pending Trips` (Soft Slate)
    *   `Drivers On Duty` (Indigo)
    *   `Fleet Utilization` (Percentage with custom visual ring or progress bar)
*   **Filter Panel**:
    *   Add filters at the top of the dashboard to let users filter the KPI counts by vehicle type, active status, and region.

### API Integration Example
```javascript
const fetchKPIs = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`/dashboard/kpis?${params}`);
  return response.data; // Returns activeVehicles, availableVehicles, etc.
};
```

---

## 💰 2. Fuel & Expense Management (Screen 6)

Refer to **Screen 6: Fuel & Expense Management** in the Excalidraw mockup:
*   **Split View / Tabs**:
    *   **Toll & Misc Expenses**: Displays a list of logged expenses.
    *   **Action Button**: Orange **"+ Add Expense"** opens a modal.
*   **Modal Form Inputs**:
    *   Dropdown select for **Vehicle**.
    *   Dropdown select for **Trip** (Optional: list active/completed trips for the selected vehicle).
    *   Dropdown select for **Expense Type** (Options: `'Toll'`, `'Other'`).
    *   `Amount (INR)` (number input).
    *   `Date` (date picker).

---

## 📈 3. Reports & Analytics Screen (Screen 7)

Refer to **Screen 7: Reports & Analytics** in the Excalidraw mockup:
*   **Charts Grid**:
    *   Use the `Recharts` library (already installed in dependencies) to render a **Bar Chart** of **Vehicle ROI %** and a **Line Chart** of **Fuel Efficiency (km/L)**.
    *   X-Axis: `registrationNumber`
    *   Y-Axis: `roi` / `fuelEfficiency`
*   **Export Component**:
    *   Include a primary orange button: **"📥 Export CSV Report"**.
    *   *Implementation:* Directs the browser or window context to download:
        ```javascript
        window.open('http://localhost:5000/api/reports/csv', '_blank');
        ```
