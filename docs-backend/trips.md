# Backend Documentation: Phase 3 (Trip Lifecycle & Workflows)

This document contains backend logic specifications and testing curl commands for the trip lifecycle.

---

## 🔒 Transaction Safety & Business Rules

All state transitions (`dispatch`, `complete`, `cancel`) execute inside SQL transactions. If any check fails, the transaction is rolled back completely to prevent data corruption.

### 1. Dispatch Rules (`POST /api/trips/:id/dispatch`)
Before setting the trip to `Dispatched`:
1.  **Vehicle Availability**: Verifies the assigned vehicle is in status `'Available'`.
2.  **Driver Availability**: Verifies the assigned driver is in status `'Available'`.
3.  **Driver License Expiry**: Verifies the driver's `licenseExpiryDate >= current_date`.
4.  **Cargo Weight limit**: Verifies `trip.cargoWeight <= vehicle.maxLoadCapacity`.
*   **Result**: If checks pass:
    *   Trip status -> `Dispatched`.
    *   Trip `startOdometer` gets set to `vehicle.odometer`.
    *   Vehicle status -> `On Trip`.
    *   Driver status -> `On Trip`.

### 2. Completion Rules (`POST /api/trips/:id/complete`)
Required Body: `{ "endOdometer": 1500, "fuelConsumed": 80, "fuelCost": 7200 }`
Before setting status to `Completed`:
1.  **Odometer Check**: Verifies `endOdometer >= trip.startOdometer`.
*   **Result**: If check passes:
    *   Trip status -> `Completed`.
    *   Trip `completionDate` -> `current_date`.
    *   Vehicle `odometer` -> `endOdometer`.
    *   Vehicle status -> `Available`.
    *   Driver status -> `Available`.

---

## 🛣️ API Endpoints

### 1. Create Trip Draft
*   **URL**: `POST /api/trips`
*   **Body**:
    ```json
    {
      "source": "Warehouse A",
      "destination": "Retail Outlet B",
      "vehicleId": 1,
      "driverId": 1,
      "cargoWeight": 450.00,
      "plannedDistance": 120.50,
      "revenue": 25000.00
    }
    ```

### 2. Dispatch Trip
*   **URL**: `POST /api/trips/:id/dispatch`

### 3. Complete Trip
*   **URL**: `POST /api/trips/:id/complete`
*   **Body**:
    ```json
    {
      "endOdometer": 12621.00,
      "fuelConsumed": 24.50,
      "fuelCost": 2200.00
    }
    ```

---

## 🧪 Testing with curl

### 1. Create Draft Trip
```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"source":"Syracuse Depot","destination":"Manhattan Store","vehicleId":1,"driverId":1,"cargoWeight":450.00,"plannedDistance":120.00,"revenue":18000.00}'
```

### 2. Dispatch Trip
```bash
curl -X POST http://localhost:5000/api/trips/1/dispatch \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3. Complete Trip (Logs metrics, updates odometer, releases driver & vehicle)
```bash
curl -X POST http://localhost:5000/api/trips/1/complete \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"endOdometer":12621.00,"fuelConsumed":24.50,"fuelCost":2200.00}'
```
