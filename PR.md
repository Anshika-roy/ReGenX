# PR: ESG Compliance Radar & Anomaly Alerts

## Summary
- Add persistent ESG alerts ledger (`esg-alerts`).
- Auto-generate compliance alerts on plant intake.
- Introduce Compliance Center view with active/resolved lists.
- Add Compliance Radar widgets across dashboards.

## Changes
- Add alert ledger helpers and anomaly detection rules in `app.js`.
- Add Compliance Center UI and navigation.
- Add compliance widget styling in `styles.css`.
- Add new issue spec in `ISSUE-13.md`.

## Testing
- Manual: Complete a dispatch with low segregation score or large weight variance.
- Manual: Open Compliance Center and resolve an alert.

## Checklist
- [x] UI verified across Provider, Rider, Plant.
- [x] No console errors in normal flow.
- [x] Responsive layout preserved.
