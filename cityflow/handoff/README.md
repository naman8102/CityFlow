# CityFlow AI — Autonomous Handoff & Continuity Guide
**Hackathon Event**: Smart India Hackathon 2026 (SIH 2026)  
**Problem Statement Code**: SIH26205  
**Team**: NEURALKNIGHTS  
**Project**: CityFlow AI — AI-Driven Urban Mobility, Resource & Logistics Intelligence  

---

## 1. PURPOSE OF THIS HANDOFF REPOSITORY
This directory (`handoff/`) ensures 100% continuity. If development is handed over to another AI model or software engineer mid-way, this folder provides exact context, component status, architectural specifications, database fallback mechanisms, and execution instructions.

---

## 2. QUICK START GUIDE FOR SUCCESSOR AI / DEVELOPER
To spin up the entire system in under 2 minutes:

### Step 1: Start the Backend
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5000
# Includes automatic in-memory DB fallback if MongoDB is not installed locally!
```

### Step 2: Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
# Note: If building on Linux after copying pre-bundled Windows node_modules, ensure native bindings:
# npm install @rolldown/binding-linux-x64-gnu
# npm run build
```

### Step 3: Verify Scenario Endpoints
- **Health Check**: `GET http://localhost:5000/api/health`
- **Scenario A (Peak Hotspot)**: `POST http://localhost:5000/api/simulation/hotspot`
- **Scenario B (Route Comparison)**: `POST http://localhost:5000/api/simulation/routes`
- **Scenario C (Green Corridor SOS)**: `POST http://localhost:5000/api/emergency/dispatch`
- **Scenario D (Logistics Load Shift)**: `POST http://localhost:5000/api/logistics/optimize`

---

## 3. FILE INVENTORY IN THIS FOLDER
- `STATUS.md`: Live checklist of all checkpoints (1 to 5), implemented modules, and pending tasks.
- `ARCHITECTURE.md`: Data contracts, AI formulations (BPR Delay, Congestion Regressor), and API schemas.
- `CHECKPOINT_LOG.md`: Chronological log of changes and milestone snapshots.
