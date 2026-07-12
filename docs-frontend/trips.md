# Frontend Integration Guide: Phase 3 (Trip Lifecycle & Workflows)

This guide provides UI layout guidelines and validation rules for implementing trip dispatches, draft states, and completion modals.

---

## 🗺️ 1. Trip Registry & Active Dispatches

Refer to **Screen 4: Trip Dispatcher** in the Excalidraw mockup:
*   **Trip Dashboard**: Displays a summary of dispatches categorized by status (`Draft`, `Dispatched`, `Completed`, `Cancelled`).
*   **"Create Trip" Form / Wizard**:
    *   Dropdown fields to select a **Vehicle** and a **Driver**.
    *   **⚠️ Frontend Optimization**: Only populate these select inputs with vehicles and drivers whose status is `'Available'` (fetch this using `GET /api/vehicles?status=Available` and `GET /api/drivers?status=Available`).
*   **Warnings display on Form**:
    *   If the user enters a `Cargo Weight` greater than the selected vehicle's capacity, block submission and show: **"⚠️ Cargo weight exceeds max vehicle capacity"**.
    *   If the selected driver has `isLicenseExpired: true` in their profile, block submission and show: **"❌ Cannot dispatch: Driver license is expired"**.

---

## ⚡ 2. Trip State Action Workflows

For any selected trip, display actions based on its current `status`:

### Draft Trips
*   Display a blue **"🚀 Dispatch Trip"** button.
*   Clicking it calls `POST /api/trips/:id/dispatch` to lock the vehicle and driver to 'On Trip' status.

### Dispatched Trips
*   Display a green **"✅ Complete Trip"** button and a red **"❌ Cancel Dispatch"** button.
*   Clicking **Complete Trip** triggers the **Completion Modal** (described below).
*   Clicking **Cancel Dispatch** calls `POST /api/trips/:id/cancel` (releases vehicle/driver and marks trip as Cancelled).

---

## 📝 3. Trip Completion Modal

When the user clicks **Complete Trip**, open a modal with the following inputs:
1.  **Start Odometer** (Disabled input, displaying the trip's `startOdometer` for reference).
2.  **Final Odometer Reading** (Number input).
    *   *Validation:* Must be greater than or equal to `startOdometer`.
3.  **Fuel Consumed (Liters)** (Number input).
4.  **Fuel Cost (INR)** (Number input).

### Completion Submission Request
```javascript
const handleCompleteTrip = async (tripId, data) => {
  try {
    // data = { endOdometer: 12500, fuelConsumed: 45, fuelCost: 4000 }
    const response = await axios.post(`/trips/${tripId}/complete`, data);
    alert("Trip completed and assets released successfully!");
  } catch (error) {
    alert(error.response?.data?.message || "Error completing trip");
  }
};
```
