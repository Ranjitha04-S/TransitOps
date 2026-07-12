# Backend Documentation: Phase 5 (Dashboard Analytics & Data Exports)

This document describes the analytical calculations, financial aggregation logic, and data exports in the backend.

---

## 📈 Analytical Calculations

### 1. Dashboard KPIs (`GET /api/dashboard/kpis`)
*   **Active Vehicles**: Count of vehicles where `status = 'On Trip'`.
*   **Available Vehicles**: Count of vehicles where `status = 'Available'`.
*   **Vehicles in Maintenance**: Count of vehicles where `status = 'In Shop'`.
*   **Active Trips**: Count of trips where `status = 'Dispatched'`.
*   **Pending Trips**: Count of trips where `status = 'Draft'`.
*   **Drivers On Duty**: Count of drivers where `status = 'On Trip'`.
*   **Fleet Utilization %**: Calculated as:
    $$\text{Fleet Utilization} = \frac{\text{Active Vehicles}}{\text{Total Active Fleet (Total - Retired)}} \times 100$$
    *Edge Case Handling:* If the total active fleet count is zero, returns `0%`.

### 2. Vehicle Financial ROI & Fuel Efficiency (`GET /api/dashboard/analytics`)
Runs a loop aggregating key operational metrics for each vehicle:
*   **Actual Distance Traveled**:
    $$\text{Distance} = \sum_{\text{completed trips}} (\text{endOdometer} - \text{startOdometer})$$
*   **Fuel Efficiency**:
    $$\text{Fuel Efficiency} = \frac{\text{Total Distance}}{\text{Total Fuel Consumed}}$$
    *Edge Case Handling:* If total fuel consumed is `0`, returns `0` km/L.
*   **ROI (Return on Investment)**:
    $$\text{ROI} = \frac{\text{Revenue} - \text{Expenses}}{\text{Acquisition Cost}} \times 100$$
    Where:
    *   `Revenue` = Sum of all `revenue` on completed trips for this vehicle.
    *   `Expenses` = Sum of completed `trip.fuelCost` + Sum of all `maintenance.cost` + Sum of all tolls/misc `expense.amount`.
    *   *Edge Case Handling:* If the vehicle's `acquisitionCost` is `0`, returns `0%`.

---

## 🛣️ API Endpoints

### 1. Log Toll or Miscellaneous Expense
*   **URL**: `POST /api/expenses`
*   **Body**:
    ```json
    {
      "vehicleId": 1,
      "tripId": 1,
      "type": "Toll",
      "amount": 250.00,
      "date": "2026-07-12"
    }
    ```

### 2. Export Trips Report to CSV
*   **URL**: `GET /api/reports/csv`
*   **Response**: Triggers an attachment download named `TransitOps_Trip_Report.csv`.

---

## 🧪 Testing with curl

### 1. Fetch Dashboard KPIs
```bash
curl -X GET http://localhost:5000/api/dashboard/kpis \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 2. Fetch Fleet Analytics (ROI & Fuel Efficiency)
```bash
curl -X GET http://localhost:5000/api/dashboard/analytics \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3. Log a Toll Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":1,"type":"Toll","amount":350.00,"date":"2026-07-12"}'
```

### 4. Download CSV Report
```bash
curl -X GET http://localhost:5000/api/reports/csv \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -o trips_report.csv
```
