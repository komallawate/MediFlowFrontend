# MediFlow Frontend — React

## Quick Start
```bash
npm install
npm start
```
App runs on http://localhost:3000 and proxies API calls to http://localhost:8080.

## Unique Features
- **Digital OPD Token** — MF-001 style tokens issued per appointment
- **Smart Wait Estimator** — Real-time estimated wait based on doctor avg time
- **Step-by-step Booking Wizard** — Guided 5-step appointment flow
- **Live Queue Board** — Auto-refreshes every 15s with queue progress
- **Patient Code Lookup** — Instant search by MF-XXXXX code
- **Department Workload Cards** — Visual cards per doctor with live stats
- **Role-aware UI** — Admin / Doctor / Receptionist roles

## Pages
| Route | Page |
|---|---|
| /login | Login |
| /dashboard | Live stats + dept queue |
| /patients/new | Register patient |
| /appointments | 5-step booking wizard |
| /queue | Live OPD queue management |
| /doctors | Doctor availability toggle |
| /prescriptions | Issue & view prescriptions |
