# Frontend Integration Guide: Phase 4 (Maintenance Workflows)

This guide provides UI layout guidelines and validation rules for implementing the vehicle maintenance modules.

---

## 🔧 1. Maintenance Logs UI Design Guidelines

Refer to **Screen 5: Maintenance** in the Excalidraw mockup:
*   **Header**: Page title "Maintenance Log" and an orange **"+ Log Maintenance"** button.
*   **Form / Dialog Details**:
    *   Dropdown select to choose the **Vehicle** (should list all registered vehicles).
    *   **⚠️ UI Alert**: If the user selects a vehicle whose status is currently `'On Trip'`, display a warning: **"⚠️ This vehicle is currently on a trip and cannot be placed in maintenance"** and disable the submit button.
    *   Inputs: `Description` (text area), `Repair Cost (INR)` (number), `Start Date` (date picker).
*   **Logs Table / List**:
    *   Columns: `Vehicle (Reg Number)`, `Description`, `Cost (INR)`, `Start Date`, `End Date`, and `Status`.
    *   Active statuses display a glowing amber **"In Shop"** badge.
    *   Closed statuses display a gray **"Closed"** badge.

---

## ⚡ 2. Actions & Workflows

For any log row where status is `'Active'`:
*   Display a green **"🛠️ Close Log"** action button.
*   Clicking it opens a confirmation modal asking for the **End Date** (defaults to today's date).
*   On submission, calls:
    ```javascript
    const closeMaintenanceLog = async (logId, endDate) => {
      // endDate = "2026-07-12"
      const response = await axios.put(`/maintenance/${logId}/close`, { endDate });
      return response.data;
    };
    ```
*   Upon successful response, refreshes the registries to show the vehicle is back to `'Available'`.
