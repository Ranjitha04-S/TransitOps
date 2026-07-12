# Backend Documentation: Phase 1 (Project Setup & Authentication with RBAC)

This document contains backend schema details, API endpoint specifications, and testing curl commands for Phase 1.

---

## 🗄️ Database Tables (MySQL via Sequelize)

### Users Table
*   **Attributes**:
    *   `id`: `INT` (PK, Auto-increment)
    *   `email`: `VARCHAR(255)` (Unique, Not Null, validated email format)
    *   `password`: `VARCHAR(255)` (Not Null, stores bcrypt hash)
    *   `role`: `ENUM('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst')` (Not Null)
    *   `createdAt`, `updatedAt`: `DATETIME`

### Drivers Table (Associated with Users)
*   **Attributes**:
    *   `id`: `INT` (PK, Auto-increment)
    *   `userId`: `INT` (FK, Nullable, links to Users table)
    *   `name`: `VARCHAR(255)` (Not Null)
    *   `licenseNumber`: `VARCHAR(255)` (Unique, Not Null)
    *   `licenseCategory`: `VARCHAR(255)` (Not Null)
    *   `licenseExpiryDate`: `DATEONLY` (Not Null)
    *   `contactNumber`: `VARCHAR(255)` (Not Null)
    *   `safetyScore`: `INT` (Not Null, default `100`, range `0-100`)
    *   `status`: `ENUM('Available', 'On Trip', 'Off Duty', 'Suspended')` (Not Null, default `Available`)

---

## 🛣️ API Endpoints

### 1. Register User
*   **URL**: `POST /api/auth/register`
*   **Headers**: `Content-Type: application/json`
*   **Body Parameters (Standard User)**:
    ```json
    {
      "email": "manager@transitops.com",
      "password": "securepassword123",
      "role": "Fleet Manager"
    }
    ```
*   **Body Parameters (Driver - automatic association)**:
    ```json
    {
      "email": "driver.alex@transitops.com",
      "password": "driverpassword123",
      "role": "Driver",
      "name": "Alex Mercer",
      "licenseNumber": "DL-1204918491",
      "licenseCategory": "Heavy Truck (Class A)",
      "licenseExpiryDate": "2027-12-31",
      "contactNumber": "+919876543210"
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": 2,
        "email": "driver.alex@transitops.com",
        "role": "Driver",
        "driver": {
          "id": 1,
          "name": "Alex Mercer",
          "licenseNumber": "DL-1204918491",
          "status": "Available"
        }
      }
    }
    ```

### 2. Login User
*   **URL**: `POST /api/auth/login`
*   **Headers**: `Content-Type: application/json`
*   **Body Parameters**:
    ```json
    {
      "email": "manager@transitops.com",
      "password": "securepassword123"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "email": "manager@transitops.com",
        "role": "Fleet Manager"
      }
    }
    ```

### 3. Get Current User Profile (Auth Checked)
*   **URL**: `GET /api/auth/me`
*   **Headers**: `Authorization: Bearer <JWT_TOKEN>`
*   **Success Response (200 OK)**:
    ```json
    {
      "user": {
        "id": 2,
        "email": "driver.alex@transitops.com",
        "role": "Driver",
        "createdAt": "2026-07-12T06:00:00.000Z",
        "updatedAt": "2026-07-12T06:00:00.000Z",
        "driver": {
          "id": 1,
          "userId": 2,
          "name": "Alex Mercer",
          "licenseNumber": "DL-1204918491",
          "licenseCategory": "Heavy Truck (Class A)",
          "licenseExpiryDate": "2027-12-31",
          "contactNumber": "+919876543210",
          "safetyScore": 100,
          "status": "Available"
        }
      }
    }
    ```

---

## 🧪 Testing with curl

### 1. Register a Fleet Manager
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@transitops.com","password":"password123","role":"Fleet Manager"}'
```

### 2. Register a Driver
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"driver.alex@transitops.com","password":"password123","role":"Driver","name":"Alex Mercer","licenseNumber":"DL-993214","licenseCategory":"HGV Class A","licenseExpiryDate":"2028-09-15","contactNumber":"+919888877777"}'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@transitops.com","password":"password123"}'
```
*(Copy the `token` string value from the JSON response output for the next step)*

### 4. Fetch Self Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <PASTE_JWT_TOKEN_HERE>"
```
