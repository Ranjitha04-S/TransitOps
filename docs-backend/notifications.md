# Notifications API - Backend Specifications

This document describes the backend routing and notification log models for managing operational alerts history.

---

## 🏢 1. Database Model Schema

The `Notification` table records events dispatched by compliance checks and operations dispatch actions.

### Schema Fields:
```javascript
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Low'
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});
```

---

## ⚡ 2. API Endpoints

### Fetch All Notifications
*   **Endpoint:** `GET /api/notifications`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Success Response (200 OK):**
    ```json
    {
      "notifications": [
        {
          "id": 1,
          "title": "License Expiry Alert",
          "message": "Driver David Ross's HGV Class A license expired on 2026-06-01.",
          "priority": "High",
          "read": false,
          "createdAt": "2026-07-12T10:00:00.000Z"
        }
      ]
    }
    ```

### Mark Notification as Read / Dismiss
*   **Endpoint:** `PUT /api/notifications/:id/dismiss`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Notification successfully dismissed"
    }
    ```
