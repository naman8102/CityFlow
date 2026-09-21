# CityFlow AI — AI-Driven Urban Mobility, Resource & Logistics Intelligence
**Smart India Hackathon 2026 (SIH 2026)**  
**Problem Statement Code**: SIH26205  
**Team**: NEURALKNIGHTS  
**Continuous Handoff Protocol**: Fully Documented in [`handoff/`](./handoff/)

---

## 1. Executive Summary & Problem Scope
Conventional consumer navigation applications (such as Google Maps or Apple Maps) operate on individual selfish routing: each vehicle seeks the shortest path, inadvertently dumping traffic onto residential side-streets or compounding bottlenecks at high-density arterial intersections.

**CityFlow AI is NOT a point-to-point consumer navigation map.**  
It is an **Intelligent Urban Mobility Coordination Layer** that manages municipal road capacity, dynamically coordinates traffic signal phase durations, schedules commercial freight movement off-peak, and autonomously carves out **Green Corridors** for emergency vehicles.

---

## 2. The 4 Core Architectural Pillars

```
                     ┌──────────────────────────────────────────────┐
                     │                 CITYFLOW AI                  │
                     │          Urban Coordination Layer            │
                     └──────────────────────┬───────────────────────┘
                                            │
        ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
        ▼                   ▼                               ▼                   ▼
    1. PREDICT          2. OPTIMIZE                    3. COORDINATE        4. RESPOND
(BPR Delay Model    (Dynamic Webster Split        (Commercial Freight   (Emergency Green Wave
 & ML Regressor)     & Capacity Routing)           Off-Peak Shifting)    Signal Preemption)
```

1. **PREDICT**: Quantifies real congestion delay using the **Bureau of Public Roads (BPR)** formulation $t = t_0 [1 + \alpha (V/C)^\beta]$ and forecasts bottleneck emergence before gridlock occurs.
2. **OPTIMIZE**: Evaluates multi-route safety, distance, emissions, and delay, actively load-balancing vehicles across high-capacity arterials.
3. **COORDINATE**: Provides commercial logistics freight operators with off-peak departure windows and municipal green carbon credits to eliminate peak delivery congestion.
4. **RESPOND**: Instantly preempts intersection signals along emergency transit routes (Ambulance, Fire, Police), locking the corridor to continuous GREEN while safely holding cross-traffic on RED.

---

## 3. SIH 2026 Demonstration Scenarios

### 🟢 Scenario A: Peak Hour Hotspot Detection
- **Action**: Click `Scenario A: Peak Hour Hotspot` or `Inject Peak Surge` in the Police Command view.
- **Engine Behavior**: Ingests high vehicle volume (2,400 vph against 1,800 capacity).
- **Result**: Immediate Highway Capacity Manual **Level of Service (LOS) grade F** alert with Webster dynamic green-split recalculation (+18.5% arterial clearance).

### 🔵 Scenario B: Smart Alternative Routing
- **Action**: Click `Scenario B: Smart Alternative Routing` in the Citizen view.
- **Engine Behavior**: Calculates dual corridors between *Dr. RML Hospital* and *New Delhi Railway Station*.
- **Result**: Side-by-side trade-off comparison between Conventional Route (+22.4 min delay, LOS F) and CityFlow AI Coordinated Route (14.5 min saved, 94/100 Safety Index, lower CO₂ emissions).

### 🔴 Scenario C: Emergency Vehicle SOS (Green Corridor)
- **Action**: Click `Scenario C: Emergency Vehicle SOS` or `Trigger Ambulance SOS`.
- **Engine Behavior**: Dispatches Ambulance DL-01-EQ-8812 and calculates immediate trauma routing.
- **Result**: All traffic signals along the path turn **LOCKED GREEN with ⚡SOS badges**, cross-streets switch to RED, and telemetry tracks 8.0+ minutes saved in life-critical transit.

### 🟣 Scenario D: Logistics Freight Load Shifting
- **Action**: Click `Scenario D: Logistics Load Shifting` in the Freight portal.
- **Engine Behavior**: Analyzes heavy commercial truck fleets (Okhla to Azadpur Mandi).
- **Result**: Shifts departure from peak rush hour (09:00 AM) to off-peak slots (11:30 AM), reducing delay by 46 min, offsetting diesel idling emissions, and awarding municipal carbon points.

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Ultra-fast client interface with sub-millisecond updates |
| **Styling** | Tailwind CSS + Vanilla CSS | Futuristic dark command-center theme with glassmorphism |
| **Geospatial & Maps**| Leaflet + React-Leaflet + OSRM | Interactive OpenStreetMap tiles, custom signal icons, siren markers |
| **Icons** | Lucide React | High-tech HUD telemetry and status icons |
| **Backend API** | Node.js + Express.js | REST API controllers, live signal countdown simulation engine |
| **AI / ML Layer** | Node.js BPR Engine | Authentic Federal Highway Administration BPR delay calculations |
| **Database** | MongoDB + durable local JSON fallback | User, incident, emergency and logistics data survives restarts; MongoDB is recommended for high traffic |
| **Identity** | Signed bearer tokens + PBKDF2 password hashing | Role-aware Citizen, Police and Logistics access |

---

## 5. Quick Start Instructions

### Prerequisites
- Node.js (v18+) and npm installed.

### 1. Launch the Backend Server
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` (includes automatic in-memory DB fallback if local MongoDB is not running).*

### 2. Launch the Frontend UI
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 3. Configure durable production storage
Create `backend/.env` (never commit it):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/cityflow
AUTH_SECRET=replace-with-a-long-random-secret
```
Without MongoDB, the backend writes the same operational data to
`backend/data/cityflow-store.json`. This is a development fallback, not a
multi-instance/high-traffic database. Use MongoDB with indexes, backups, and
replica sets in production.

#### How to view your saved data
- **Local development:** open `backend/data/cityflow-store.json` in VS Code.
  Login records are in `authEvents` and accounts are in `users`; passwords are
  never stored as plain text.
- **MongoDB:** open MongoDB Compass and connect to `MONGODB_URI`, for example
  `mongodb://127.0.0.1:27017`. Select `cityflow` and inspect `users`,
  `authevents`, `incidents`, `emergencymissions`, `trafficobservations`, and
  `logisticstrips`.
- **API:** send `Authorization: Bearer <token>` after login and call
  `GET /api/auth/history`, `GET /api/traffic/observations`, or
  `GET /api/simulation/incidents/history`.

### 4. Accounts and roles
The frontend now opens on a login/sign-up screen. Passwords are PBKDF2 hashed
and never stored in plain text. Each sign-up, successful login, and failed
login is saved as an audit event (without storing passwords). An authenticated
user can read their own audit history from `GET /api/auth/history`.
Police accounts can dispatch/clear emergency
green corridors and import verified external incident records. All authenticated
roles can report incidents, request routes, and see live city state.

### 5. Incident memory and external data
Every incident stores its source (`CITIZEN`, `POLICE`, `EXTERNAL_FEED`, or
`SYSTEM`), reporter, coordinates, severity, and timestamps. The authenticated
endpoint `GET /api/simulation/incidents/history` returns history plus recurring
coordinate hotspots for future prediction. Police can submit a validated batch
from an approved traffic/police platform to
`POST /api/simulation/incidents/import` as `{ "records": [...] }`.

Do not scrape or copy data without permission. Normalize the provider's feed
into CityFlow's schema and retain its provenance before importing it.

### 6. ML training status
The checked-in model artifacts are reproducible physics-informed baseline
models, not a claim of live real-world accuracy. To train on licensed observed
data, export a CSV containing the columns used by
`backend/ml_engine/train_models.py` and run:
```bash
cd backend/ml_engine
$env:CITYFLOW_DATASET="C:\path\to\licensed-cityflow-data.csv"
python train_models.py
```
The saved metadata records `dataset_source` and `training_rows`, so operators
can distinguish observed training from the baseline. Re-train periodically
after validating data quality and measuring the holdout R².

### 7. Traffic data ingestion
CityFlow automatically stores a 30-second snapshot of its signal telemetry as
`SYSTEM_TELEMETRY` observations. This is operational telemetry, not a claim of
external live traffic truth. For licensed live data, add a TomTom key:
```env
TOMTOM_API_KEY=your-licensed-tomtom-key
```
Then create a Police account, login, and call `POST /api/traffic/sync/tomtom`.
The backend reads each managed signal's TomTom Flow Segment, stores normalized
speed/free-flow/congestion data plus the raw provider response, and exposes it
through `GET /api/traffic/observations`.

Do not scrape or copy provider data without permission. Approved providers can
be normalized to the same observation schema while retaining source metadata.

---

## 6. Project Directory Layout
```text
cityflow/
├── handoff/                          <-- Autonomous handoff & continuity folder
│   ├── README.md                     # Handoff instructions for successor AI / engineer
│   ├── STATUS.md                     # Checkpoint progress tracking (Checkpoints 1 - 5)
│   ├── ARCHITECTURE.md              # Mathematical AI models & data schemas
│   └── CHECKPOINT_LOG.md             # Change history
├── backend/
│   ├── config/db.js                  # Dual-mode MongoDB & In-Memory datastore
│   ├── controllers/
│   │   ├── simulationController.js   # Scenarios A & B: Volume surge, BPR delay, alternative routes
│   │   ├── emergencyController.js    # Scenario C: SOS dispatch & dynamic signal preemption
│   │   └── logisticsController.js    # Scenario D: Freight load shifting & carbon incentives
│   ├── models/                       # Incident, EmergencyMission, LogisticsTrip models
│   ├── routes/                       # Simulation, Emergency, and Logistics routes
│   ├── services/
│   │   ├── trafficPredictor.js       # BPR Delay Equation & Congestion Regressor
│   │   ├── osrmRoutingService.js     # OSRM router with geometric arterial fallback
│   │   └── geocodingService.js       # Metropolitan landmarks & spatial index
│   └── server.js                     # Express server & live signal phase ticker
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.jsx           # Leaflet map with pulsing signals and ambulance
│   │   │   ├── SignalController.jsx  # Live phase timer & manual/AI override controls
│   │   │   ├── RouteComparisonCard.jsx # BPR delay, LOS grade & safety cards
│   │   │   ├── ScenarioSwitcher.jsx  # 1-Click SIH Presentation Switcher
│   │   │   └── IncidentReporterModal.jsx # Citizen/Officer incident reporting
│   │   ├── pages/
│   │   │   ├── UserDashboard.jsx     # Citizen navigation
│   │   │   ├── PoliceDashboard.jsx   # Command Center & Green Corridor
│   │   │   └── LogisticsDashboard.jsx# Commercial Freight Load Shifting
│   │   ├── services/api.js           # API connector with offline fallbacks
│   │   ├── App.jsx                   # Master command layout
│   │   └── index.css                 # Dark glassmorphism & map styling
│   └── vite.config.js
└── README.md
```

---

## 7. Autonomous Handoff Protocol
As required, the [`handoff/`](./handoff/) folder maintains active state records. If another developer or AI model continues this project, they can read `handoff/STATUS.md` and `handoff/ARCHITECTURE.md` to immediately resume work without any ambiguity.
