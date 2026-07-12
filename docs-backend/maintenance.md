# Backend Documentation: Phase 4 (Maintenance Workflows)

This document details the APIs and business logic for vehicle maintenance scheduling and tracking.

---

## 🔒 Business Rule Constraints

1.  **Trip Active Check**: A vehicle cannot be set to maintenance if it is currently in status `'On Trip'`.
2.  **Atomic Toggle**:
    *   Creating an active maintenance log changes the vehicle's status to `'In Shop'` and removes it from the list of available dispatch selections.
    *   Closing the active maintenance log restores the vehicle status to `'Available'` (unless the vehicle has been marked as `'Retired'`).
3.  **Date Validation**: The close `endDate` cannot precede the `startDate`.

---

## 🛣️ API Endpoints

### 1. Log Maintenance Record (Managers Only)
*   **URL**: `POST /api/maintenance`
*   **Body**:
    ```json
    {
      "vehicleId": 1,
      "description": "Engine Oil Change & Filter Replacement",
      "cost": 4500.00,
      "startDate": "2026-07-12"
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
      "message": "Maintenance record created and vehicle status set to In Shop",
      "log": {
        "id": 1,
        "vehicleId": 1,
        "description": "Engine Oil Change & Filter Replacement",
        "cost": "4500.00",
        "startDate": "2026-07-12",
        "status": "Active",
        "createdAt": "2026-07-12T06:50:00.000Z",
        "updatedAt": "2026-07-12T06:50:00.000Z"
      }
    }
    ```

### 2. Close Active Maintenance Log (Managers Only)
*   **URL**: `PUT /api/maintenance/:id/close`
*   **Body (Optional)**:
    ```json
    {
      "endDate": "2026-07-13"
    }
    ```
*   *(If `endDate` is omitted, defaults to the current system date)*

### 3. Fetch All Maintenance Logs
*   **URL**: `GET /api/maintenance`
*   **Query Parameters**:
    *   `status` (Optional: `'Active'` or `'Closed'`)
    *   `vehicleId` (Optional: filter logs by specific vehicle)

---

## 🧪 Testing with curl

### 1. Place Vehicle in Shop (Fails if vehicle is on trip)
```bash
curl -X POST http://localhost:5000/api/maintenance \
  -H "Authorization: Bearer <MANAGER_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":1,"description":"Replace front brake pads","cost":2800.00,"startDate":"2026-07-12"}'
```

### 2. Close Maintenance Log (Restores vehicle to Available)
```bash
curl -X PUT http://localhost:5000/api/maintenance/1/close \
  -H "Authorization: Bearer <MANAGER_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"endDate":"2026-07-12"}'
```
