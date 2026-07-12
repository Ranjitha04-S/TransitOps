# 🚛 TransitOps — Smart Transport Operations Platform

> A full-stack, role-based fleet management system built for the hackathon. Manage vehicles, drivers, trips, maintenance, expenses, and analytics — all in one place.

---

## 🖥️ Live Demo Accounts

| Role | Email | Password |
|---|---|---|
| Fleet Manager | `manager@transitops.com` | `password123` |
| Driver | `driver@transitops.com` | `password123` |
| Safety Officer | `safety@transitops.com` | `password123` |
| Financial Analyst | `finance@transitops.com` | `password123` |

---

## 📋 Table of Contents

- [What We Built](#what-we-built)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Role-Based Access Control](#role-based-access-control)
- [Business Rules & Safety Guards](#business-rules--safety-guards)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## 🏗️ What We Built

**TransitOps** is a **Smart Transport Operations Platform** — a comprehensive fleet management system that enables transport companies to:

- Register and manage a fleet of vehicles (trucks, vans, cars)
- Onboard and track drivers with license compliance monitoring
- Create, dispatch, complete, and cancel trips with full status tracking
- Log vehicle maintenance with automatic status locking/unlocking
- Track toll and miscellaneous expenses per vehicle
- Analyze fleet ROI, fuel efficiency, and financial performance
- Export trip reports as CSV
- All secured by **Role-Based Access Control (RBAC)** — every role sees only what they are allowed to see and do

The platform is built with a clean **MVC (Model-View-Controller)** architecture on the backend and a **Redux-powered React SPA** on the frontend.

---

## ⚙️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **Sequelize ORM** | Database queries and model definitions |
| **MySQL (via XAMPP)** | Production database |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **json2csv** | CSV report generation |
| **dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI component framework |
| **Redux Toolkit** | Global state management |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Icon library |
| **Vite** | Build tool & dev server |

---

## ✨ Features

### 1. 🔐 Authentication & Security
- Secure login with **bcrypt-hashed passwords**
- **JWT tokens** issued with the user's role embedded in the payload
- Every protected API endpoint enforces **server-side role checks** via `authenticateToken` and `verifyRole` middleware
- RBAC is enforced **both on the backend AND the frontend** — not just hidden buttons, but actual 403 responses for unauthorized API calls

### 2. 🚗 Vehicle Registry
- Full **CRUD** — Create, Read, Update, Delete vehicles
- Fields: Registration Number, Manufacturer, Model, Type (Truck/Van/Car), Region, Max Load Capacity, Odometer, Acquisition Cost
- **Unique registration number constraint** — prevents duplicates
- Filter by type, status, and region; full-text search
- Vehicle status badge: `Available` | `On Trip` | `In Shop` | `Retired`

### 3. 👤 Driver Registry
- Full **CRUD** for driver profiles
- Fields: Name, Email, License Number, License Category, License Expiry Date, Contact Number, Safety Score (0–100)
- **Expired license detection** — shows animated `EXPIRED` badge
- Safety score color-coded: Green (86–100), Yellow (70–85), Red (0–69)
- Driver status: `Available` | `On Trip` | `Suspended`

### 4. 📍 Trip Lifecycle Management
- Full trip lifecycle: `Draft` → `Dispatched` → `Completed` | `Cancelled`
- Create trip drafts with source, destination, vehicle, driver, cargo weight, planned distance, and revenue
- **Atomic status cascades** using SQL transactions:
  - On Dispatch: Vehicle → `On Trip`, Driver → `On Trip`
  - On Complete/Cancel: Vehicle → `Available`, Driver → `Available`
- Odometer auto-updates on trip completion
- Fuel consumption and cost recorded at completion

### 5. 🔧 Maintenance Logging
- Create maintenance records linked to a vehicle
- On creation → Vehicle automatically locked to `In Shop`
- On closure → Vehicle automatically released to `Available`
- Full cost tracking per maintenance job

### 6. 💰 Fuel & Expenses
- Dedicated Expenses module for Toll and miscellaneous costs
- Linked to a specific vehicle (and optionally a trip)
- Summary cards: Total Expenses, Total Records, Toll Expenses
- Accessible to Fleet Manager and Financial Analyst

### 7. 📊 Reports & Analytics
- Per-vehicle financial report: Revenue, Expenses, Net Profit, ROI %, Total Distance, Fuel Efficiency
- **ROI Formula**: `(Revenue − (Maintenance + Fuel)) / Acquisition Cost × 100`
- **Fuel Efficiency**: `Total Distance / Total Fuel Consumed`
- Visual ROI bar chart (pure CSS — no external chart library needed)
- CSV export of all trip data
- Summary KPI cards: Total Revenue, Net Profit, Fleet Distance, Avg Fleet ROI

### 8. 🎲 Demo Data Simulator
- **Fleet Manager** can click `Load Demo Data` on the Dashboard to instantly generate 15 realistic historical trips
- Instantly populates the analytics table and KPI cards for a live, impressive hackathon demo

---

## 👥 Role-Based Access Control

Each role sees a different navigation, different buttons, and gets different data.

| Module | Fleet Manager | Driver | Safety Officer | Financial Analyst |
|---|---|---|---|---|
| **Dashboard** | Full KPIs + Load Demo Data | Own KPIs only | Compliance KPIs | Cost/ROI KPIs |
| **Vehicle Registry** | Full CRUD | Read-only | Read-only | Read-only |
| **Driver Registry** | Full CRUD | Read-only (own profile) | Edit (safety score) | No access |
| **Trip Management** | Create/Dispatch/Complete/Cancel | Create/Dispatch own trips | View-only | View-only |
| **Maintenance** | Full CRUD | No access | View-only | View-only |
| **Expenses** | Full access + Log | No access | No access | Full access + Log |
| **Reports** | Full access + CSV export | No access | Compliance view | Full access + CSV export |
| **Sidebar Nav** | All modules | Dashboard, Registries, Trips | Dashboard, Registries, Maintenance, Trips, Reports | Dashboard, Registries, Trips, Expenses, Reports |

---

## 🛡️ Business Rules & Safety Guards

All rules are enforced **server-side** in the Express API — the frontend shows friendly warnings, but the backend is the source of truth.

| Rule | Endpoint | What Happens |
|---|---|---|
| **Cargo overweight** | `POST /trips/:id/dispatch` | 400 error if cargo > vehicle max capacity |
| **Double-booking** | `POST /trips/:id/dispatch` | 400 error if vehicle or driver status ≠ `Available` |
| **Expired license** | `POST /trips/:id/dispatch` | 400 error if driver license is past expiry date |
| **In Shop = no dispatch** | `POST /trips/:id/dispatch` | 400 error if vehicle status is `In Shop` |
| **Cannot maintain On Trip vehicle** | `POST /maintenance` | 400 error if vehicle status is `On Trip` |
| **Cannot delete active driver** | `DELETE /drivers/:id` | 400 error if driver is currently `On Trip` |
| **Cannot delete On Trip vehicle** | `DELETE /vehicles/:id` | 400 error if vehicle is `On Trip` |
| **Unique registration** | `POST /vehicles` | 409 error if registration already exists |
| **Duplicate email** | `POST /auth/register` | 409 error if email already registered |

---

## 📁 Project Structure

```
TransitOps/
├── client/                         # React Frontend (Vite)
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx     # JWT auth, login, logout
│       ├── redux/
│       │   ├── store.js
│       │   ├── dashboardSlice.js   # KPIs, analytics, expenses, CSV, simulate
│       │   ├── registriesSlice.js  # Vehicle & Driver CRUD
│       │   ├── tripsSlice.js       # Trip lifecycle
│       │   └── maintenanceSlice.js # Maintenance logs
│       ├── pages/
│       │   ├── Login.jsx           # Multi-role login with quick-fill
│       │   ├── Dashboard.jsx       # KPIs, Fleet ROI table, Load Demo Data
│       │   ├── Registries.jsx      # Vehicle & Driver tables with Edit/Delete
│       │   ├── Trips.jsx           # Trip dispatcher and lifecycle manager
│       │   ├── Maintenance.jsx     # Maintenance log viewer and creator
│       │   ├── Expenses.jsx        # Expense tracker with vehicle dropdown
│       │   └── Reports.jsx         # Analytics, ROI chart, CSV export
│       ├── components/
│       │   ├── common/             # Badge, Button, Card, DataTable, Modal, Input, Select
│       │   └── layout/
│       │       └── MainLayout.jsx  # Role-aware sidebar navigation
│       └── App.jsx                 # Route definitions with RBAC guards
│
└── server/                         # Express Backend (Node.js)
    ├── config/
    │   └── database.js             # Sequelize MySQL connection
    ├── models/
    │   ├── index.js                # Model associations
    │   ├── User.js                 # Auth users (all roles)
    │   ├── Vehicle.js              # Fleet vehicles
    │   ├── Driver.js               # Driver profiles
    │   ├── Trip.js                 # Trip records
    │   ├── MaintenanceLog.js       # Repair logs
    │   └── Expense.js              # Toll & misc expenses
    ├── controllers/
    │   ├── authController.js       # Login, register, /me
    │   ├── vehicleController.js    # Vehicle CRUD
    │   ├── driverController.js     # Driver CRUD
    │   ├── tripController.js       # Trip lifecycle with safety guards
    │   ├── maintenanceController.js# Maintenance create/close
    │   ├── expenseController.js    # Expense CRUD
    │   ├── dashboardController.js  # KPIs, analytics, ROI, simulate
    │   └── reportsController.js    # CSV export
    ├── routes/
    │   ├── auth.js                 # /api/auth/*
    │   ├── vehicles.js             # /api/vehicles/*
    │   ├── drivers.js              # /api/drivers/*
    │   ├── trips.js                # /api/trips/*
    │   ├── maintenance.js          # /api/maintenance/*
    │   ├── expenses.js             # /api/expenses/*
    │   ├── dashboard.js            # /api/dashboard/*
    │   └── reports.js              # /api/reports/*
    ├── middleware/
    │   └── auth.js                 # authenticateToken + verifyRole
    ├── migrations/
    │   └── *.js                    # Sequelize table migrations
    ├── seeders/
    │   └── seed.js                 # Initial demo data seeder
    ├── mockDb.js                   # In-memory fallback (no DB required)
    └── server.js                   # App entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- XAMPP (for MySQL) **or** deploy with a cloud MySQL provider

### 1. Clone the repository
```bash
git clone https://github.com/Ranjitha04-S/TransitOps.git
cd TransitOps
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=transitops
DB_USER=root
DB_PASSWORD=
JWT_SECRET=transitops_secret_key_2026_super_secure_hash
PORT=5000
USE_MOCK=false
```

> **Hackathon tip**: Set `USE_MOCK=true` to skip the database entirely and use pre-loaded in-memory demo data. The app works 100% without a database!

### 3. Set up the database (if not using mock mode)
```bash
# Start XAMPP MySQL, then:
node migrate.js       # Create all tables
node seeders/seed.js  # Insert demo users and data
```

### 4. Start the backend
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 5. Set up and start the frontend
```bash
cd ../client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 6. Open the app
Navigate to `http://localhost:5173` and log in with any of the demo accounts listed above.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login and get JWT | Public |
| POST | `/api/auth/register` | Register new user | Public |
| GET | `/api/auth/me` | Get current user profile | Any role |

### Vehicles
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/vehicles` | List all vehicles (filterable) | Any role |
| GET | `/api/vehicles/:id` | Get single vehicle | Any role |
| POST | `/api/vehicles` | Register new vehicle | Fleet Manager |
| PUT | `/api/vehicles/:id` | Update vehicle | Fleet Manager |
| DELETE | `/api/vehicles/:id` | Delete vehicle | Fleet Manager |

### Drivers
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/drivers` | List all drivers (filterable) | Any role |
| GET | `/api/drivers/:id` | Get single driver | Any role |
| POST | `/api/drivers` | Register new driver | Fleet Manager |
| PUT | `/api/drivers/:id` | Update driver | Fleet Manager, Safety Officer |
| DELETE | `/api/drivers/:id` | Delete driver | Fleet Manager |

### Trips
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/trips` | List all trips | Any role |
| GET | `/api/trips/:id` | Get single trip | Any role |
| POST | `/api/trips` | Create trip draft | Fleet Manager, Driver |
| POST | `/api/trips/:id/dispatch` | Dispatch trip (runs all guards) | Fleet Manager, Driver |
| POST | `/api/trips/:id/complete` | Complete trip | Fleet Manager, Driver |
| POST | `/api/trips/:id/cancel` | Cancel trip | Fleet Manager, Driver |

### Maintenance
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/maintenance` | List all maintenance logs | Any role |
| POST | `/api/maintenance` | Create maintenance entry | Fleet Manager |
| PUT | `/api/maintenance/:id/close` | Close maintenance log | Fleet Manager |

### Expenses
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/expenses` | List all expenses | Any role |
| POST | `/api/expenses` | Log new expense | Fleet Manager, Financial Analyst |

### Dashboard & Reports
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/dashboard/kpis` | Fleet KPI summary | Any role |
| GET | `/api/dashboard/analytics` | Per-vehicle ROI & financials | Any role |
| POST | `/api/dashboard/simulate` | Generate demo trip data | Fleet Manager |
| GET | `/api/reports/csv` | Download trips CSV | Fleet Manager, Financial Analyst |

---

## 🗃️ Database Schema

```
Users ──────────────── Drivers (one-to-one via userId)
                           │
                           ▼
Vehicles ◄──── Trips ─────► Drivers
   │              │
   │              ▼
   │           Expenses (linked to trip)
   │
   ▼
MaintenanceLogs
   │
   ▼
Expenses (standalone vehicle costs)
```

### Key Relationships
- A **Trip** belongs to one **Vehicle** and one **Driver**
- A **Driver** belongs to one **User** (for login)
- A **MaintenanceLog** belongs to one **Vehicle**
- An **Expense** belongs to one **Vehicle** and optionally one **Trip**

---

## 👩‍💻 Team

Built for the **Smart Transport Operations Hackathon 2026**.

- **Ranjitha S** — Full Stack Development

---

## 📄 License

MIT License — free to use and modify.
