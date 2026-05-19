# 🚨 [CRITICAL] Issue #13: ESG Compliance Radar & Anomaly Alerts

Deploy a real-time compliance radar that flags anomalous ESG activity, detects audit risks, and provides a unified alert center across all roles.

---

## 🎯 Objective
- Create a persistent **ESG Alerts Ledger** (`localStorage: esg-alerts`).
- Detect anomalies on completed dispatches (weight variance, low segregation, integrity risk).
- Add a **Compliance Center** view accessible to Provider, Rider, and Plant.
- Render compact **Compliance Radar** widgets in dashboards.

---

## ✅ Core Requirements
- **Alert Schema**
  - `{ id, orderId, type, severity, message, ts, resolved }`
- **Anomaly Detection**
  - Weight variance > 25%
  - Segregation score < 60
  - Integrity score < 60
- **UI**
  - Compliance Center view with Active/Resolved lists
  - Glassmorphic cards with severity badges
  - Resolve and clear actions

---

## 🧠 Proposed Modules
- `src/app.js` — alert ledger, anomaly generation, view rendering
- `src/styles.css` — compliance UI styling

---

## ✅ Quality Standards (Exceptional)
- Full **JSDoc** on new helpers
- Zero console errors
- Responsive layout across roles
- Glassmorphism + micro-animations

---

## ✅ Acceptance Criteria
- Alerts auto-generate after plant intake confirmation.
- Compliance Center shows accurate counts and resolved state.
- Compliance Radar widget appears on Provider/Rider/Plant dashboards.
