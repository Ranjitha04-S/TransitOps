# Settings API - Backend Specifications

This document describes the backend routes, database fields, and schemas for managing workstation preferences and profile details.

---

## 🏢 1. Database Model Additions

We can persist settings configuration in a database table or serialize them directly inside the `Users` profiles record.

### User Settings Schema Mapping:
```javascript
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true
  }
});
```

---

## ⚡ 2. API Endpoints

### Update User Profile Settings
*   **Endpoint:** `PUT /api/auth/profile`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Request Body:**
    ```json
    {
      "displayName": "Ranjitha S",
      "password": "newsecurepassword123"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Profile settings updated successfully",
      "user": {
        "email": "manager@transitops.com",
        "displayName": "Ranjitha S"
      }
    }
    ```
