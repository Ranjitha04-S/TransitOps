# Backend Documentation: Phase 2 (Vehicle & Driver Registries CRUD)

This document describes the APIs and logic for managing vehicle assets and driver registry details.

---

## 🛣️ API Endpoints

### 🏢 1. Vehicle Endpoints

#### GET All Vehicles
*   **URL**: `GET /api/vehicles`
*   **Query Parameters**:
    *   `type` (Optional: e.g. `'Van'`, `'Truck'`, `'Car'`, or `'All'`)
    *   `status` (Optional: e.g. `'Available'`, `'On Trip'`, `'In Shop'`, `'Retired'`, or `'All'`)
    *   `region` (Optional: e.g. `'North'`, `'South'`, or `'All'`)
    *   `search` (Optional: search term matching Registration Number, Name, or Model)
*   **Response (200 OK)**:
    ```json
    {
      "vehicles": [
        {
          "id": 1,
          "registrationNumber": "MH-12-AB-1234",
          "name": "Eicher Pro 2049",
          "model": "2049 Cargo",
          "type": "Truck",
          "region": "West",
          "maxLoadCapacity": "3500.00",
          "odometer": "12500.50",
          "acquisitionCost": "1500000.00",
          "status": "Available",
          "createdAt": "2026-07-12T06:40:00.000Z",
          "updatedAt": "2026-07-12T06:40:00.000Z"
        }
      ]
    }
    ```

#### POST Create Vehicle (Managers Only)
*   **URL**: `POST /api/vehicles`
*   **Body**:
    ```json
    {
      "registrationNumber": "MH-12-AB-1234",
      "name": "Eicher Pro 2049",
      "model": "2049 Cargo",
      "type": "Truck",
      "region": "West",
      "maxLoadCapacity": 3500.00,
      "odometer": 12500.50,
      "acquisitionCost": 1500000.00
    }
    ```

#### PUT Update Vehicle (Managers Only)
*   **URL**: `PUT /api/vehicles/:id`
*   **Edge Case**: Blocks updating vehicle status manually (e.g. from `'On Trip'` to `'Available'`) if the vehicle is currently dispatched to an active trip.

#### DELETE Vehicle (Managers Only)
*   **URL**: `DELETE /api/vehicles/:id`
*   **Edge Case**: Rejects request with a `400 Bad Request` if the vehicle status is currently `'On Trip'`.

---

### 🚛 2. Driver Endpoints

#### GET All Drivers
*   **URL**: `GET /api/drivers`
*   **Query Parameters**:
    *   `status` (Optional: filter status `'Available'`, `'On Trip'`, `'Off Duty'`, `'Suspended'`, or `'All'`)
    *   `search` (Optional: search term matching Name, License Number, or Contact Number)
*   **Response (200 OK)**:
    Includes a virtual computed field `isLicenseExpired` based on comparison with the system date:
    ```json
    {
      "drivers": [
        {
          "id": 1,
          "userId": 2,
          "name": "Alex Mercer",
          "licenseNumber": "DL-1204918491",
          "licenseCategory": "Heavy Truck (Class A)",
          "licenseExpiryDate": "2027-12-31",
          "contactNumber": "+919876543210",
          "safetyScore": 100,
          "status": "Available",
          "isLicenseExpired": false
        }
      ]
    }
    ```

#### POST Create Driver (Managers Only)
*   **URL**: `POST /api/drivers`

#### PUT Update Driver (Managers & Safety Officers)
*   **URL**: `PUT /api/drivers/:id`
*   **Edge Case**: Blocks manual status changes if the driver status is currently `'On Trip'`.

#### DELETE Driver (Managers Only)
*   **URL**: `DELETE /api/drivers/:id`
*   **Edge Case**: Blocks deletion if the driver's current status is `'On Trip'`.

---

## 🧪 Testing with curl

### 1. Create a Vehicle (Requires Authorization Header)
```bash
curl -X POST http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer <MANAGER_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"registrationNumber":"DL-3C-YY-9988","name":"Tata Ace Gold","model":"Ace Petrol","type":"Mini Van","region":"North","maxLoadCapacity":750.00,"odometer":540.20,"acquisitionCost":450000.00}'
```

### 2. Fetch Active Vehicles in "North" Region
```bash
curl -X GET "http://localhost:5000/api/vehicles?status=Available&region=North" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3. Edit Driver Safety Score (Requires Safety Officer or Manager JWT)
```bash
curl -X PUT http://localhost:5000/api/drivers/1 \
  -H "Authorization: Bearer <SAFETY_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"safetyScore":95}'
```
