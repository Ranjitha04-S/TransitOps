# Notification Center - Frontend Documentation

This document describes the design system and interactions for the real-time operational notifications center.

---

## 🎨 Layout Specifications

*   **Trigger Component:** Header bell button (`Bell` icon in [MainLayout.jsx](file:///d:/TransitOps/client/src/components/layout/MainLayout.jsx)).
*   **Unread Indicator:** A floating red badge displaying the count of current unread alerts (e.g. `4`).
*   **Bell Dropdown Panel:**
    *   Slides/pops open directly beneath the bell icon.
    *   Features a header with title "Notifications Console" and an action button "Clear All".
    *   **Notification Rows:** Lists operations alerts, styled dynamically by severity priority:
        *   `High` (Red border, light red background) -> Driver license expirations.
        *   `Medium` (Amber border, light amber background) -> Vehicle workshop repairs checked-in.
        *   `Low` (Neutral border, neutral background) -> Dispatches and completions.
    *   Each row features a small "Dismiss" button (`x` mark) to remove it from the list.

---

## 🔔 Simulated Event Log Schema Example

The UI handles structured alerts with following schema:
```json
{
  "id": 1,
  "title": "License Expiration Alert",
  "message": "Driver David Ross (DL-1289012) license expired on 2026-06-01.",
  "priority": "High",
  "category": "compliance",
  "timestamp": "2026-07-12T10:00:00Z",
  "read": false
}
```
