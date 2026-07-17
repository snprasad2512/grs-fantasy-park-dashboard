# 🎢 GRS Fantasy Park — Maintenance Management & Energy Dashboard

An enterprise-grade, **Role-Based Maintenance & Energy Meter Management System** designed specifically for **GRS Fantasy Park** operations. Built with a responsive, glassmorphic dark-theme UI and client-side AI OCR extraction.

![Version](https://img.shields.io/badge/Version-v4.5_Enterprise-a855f7?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-22c55e?style=for-the-badge)
![AI OCR](https://img.shields.io/badge/AI_OCR-Tesseract.js-22d3ee?style=for-the-badge)

---

## ✨ Key Enterprise Features

### 🔐 4-Tier Role-Based Access Control (RBAC)
All portals are accessible via unified tab switching directly from the login screen:
- **👑 Administrator (`ADM-001`)**: Full user account CRUD (`Active`/`Suspended`), 20+ Energy Meter locations management, system dump, and global activity monitoring.
- **👔 Operations Manager (`MGR-001`)**: Week-over-Week (`▲ kWh / ▼ kWh`) energy consumption KPI comparison, submission reviews/approvals with feedback notes, multi-period visual charts (`Daily`, `Weekly`, `Monthly`, `Yearly`), and one-click **Excel (`SheetJS`)** & **Official PDF (`html2pdf`)** exports.
- **🔍 Supervisor (`SUP-001`)**: Dedicated verification queue with instant side-by-side **Photo Verification Modal**, verification stamping (`Verified (Sup)`), and period analytics.
- **⚡ Technician (`TECH-001` - `TECH-004`)**: Mobile-first **Energy Meter Management Module** supporting:
  - Categorized dropdown meter selection across zones (`Thrill Valley`, `Aqua World`, `Food Court`, `Kids Fantasy Land`, `Mystic Zone`, `Common Infrastructure`).
  - Real-time camera viewfinder or gallery image upload.
  - **AI OCR Engine (`Tesseract.js`)**: Automatic digital reading extraction from meter photos with real-time progress feedback.
  - Automatic net consumption (`▲ kWh`) calculation against historical readings.

---

## 🚀 Quick Start & Running Locally

Because the application uses modern CDNs (`Tesseract.js`, `Chart.js`, `SheetJS`, `html2pdf.js`), it should be served via a local HTTP server.

### Option 1: Included PowerShell Server (Windows)
Run the built-in PowerShell server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Open your browser and navigate to **`http://localhost:8080`**.

### Option 2: Node (`http-server`) or Python
```bash
# Node
npx http-server -p 8080

# Python
python -m http.server 8080
```

---

## 🔑 Default Demo Credentials
*(Password for all accounts: **`pass123`**)*

| Role | User ID | Name | Title |
| :--- | :--- | :--- | :--- |
| **Admin** | `ADM-001` | Suresh Menon | System Administrator |
| **Manager** | `MGR-001` | Anitha Desai | Senior Operations Manager |
| **Manager** | `MGR-002` | Karthik Rao | Facility & Energy Manager |
| **Supervisor** | `SUP-001` | Deepa Nair | Park Maintenance Supervisor |
| **Supervisor** | `SUP-002` | Vikram Singh | Electrical Supervisor |
| **Technician** | `TECH-001` | Rajesh Kumar | Senior Electrical Tech |
| **Technician** | `TECH-002` | Priya Sharma | HVAC & Power Tech |
| **Technician** | `TECH-003` | Arun Venkat | Ride & Water Grid Tech |

---

## 🛠️ Technology Stack
- **Core**: Vanilla HTML5, CSS3 (Modern Glassmorphism & HSL/Hex variables), JavaScript ES6+ (Client-side state & `localStorage` persistence).
- **AI OCR Engine**: `Tesseract.js v5` (Neural network character recognition).
- **Data Visualization**: `Chart.js v4` (Responsive bar/line charts with multi-axis support).
- **Spreadsheet Export**: `SheetJS (XLSX) v0.18`.
- **Document Export**: `html2pdf.bundle.js` (Instant PDF rendering and formatting).

---
*Developed for GRS Fantasy Park Engineering & Maintenance Division.*
