# CityFlow AI — System Architecture & Data Specifications
**Project**: CityFlow AI (SIH 2026 - SIH26205)  
**Team**: NEURALKNIGHTS  

---

## 1. High-Level Architecture

```
                                  [ User / Citizen Dashboard ]
                                  [ Police Command Center    ]
                                  [ Logistics Freight Portal ]
                                                │
                                                ▼
                                    React 18 + Leaflet UI
                                                │
                                          REST APIs / JSON
                                                │
                                                ▼
                             Node.js + Express.js API Layer
                       ┌────────────────────────┼────────────────────────┐
                       ▼                        ▼                        ▼
               Traffic AI Engine       Routing & Geocoding      Scenario Controllers
             (BPR Delay & Regressor)      (OSRM + Fallback)     (A: Hotspot, B: Routes,
                       │                        │               C: Emergency Corridor,
                       │                        │               D: Freight Shifter)
                       └────────────────────────┼────────────────────────┘
                                                │
                                                ▼
                                   Dual-Mode Database Layer
                             (MongoDB with In-Memory Fallback)
```

---

## 2. Mathematical AI Models

### 2.1 Bureau of Public Roads (BPR) Delay Function
$$t = t_0 \left[1 + \alpha \left(\frac{V}{C}\right)^\beta\right]$$
Where:
- $t$: Actual travel time on the road segment
- $t_0$: Free-flow travel time (distance / speed limit)
- $V$: Traffic Volume (vehicles per hour)
- $C$: Practical road capacity (vehicles per hour)
- $\alpha$: 0.15 (standard FHWA calibration constant)
- $\beta$: 4.0 (congestion sensitivity exponent)

### 2.2 Congestion Risk Probability
$$\text{Risk} = \min(1.0, 0.45 \cdot (V/C) + 0.25 \cdot \text{WeatherFactor} + 0.20 \cdot \text{TimeOfDayFactor} + 0.10 \cdot \text{IncidentDensity})$$

---

## 3. Database Entities & Schemas

### Incident Model
- `id` (String)
- `title` (String)
- `type`: `ACCIDENT` | `CONGESTION` | `CONSTRUCTION` | `HAZARD`
- `severity`: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`
- `location`: `{ lat: Number, lng: Number, address: String }`
- `reportedAt` (Date)
- `status`: `ACTIVE` | `RESOLVED`
- `affectedRadiusMeters` (Number)

### EmergencyMission Model
- `id` (String)
- `vehicleType`: `AMBULANCE` | `FIRE_TRUCK` | `POLICE`
- `vehicleNumber` (String)
- `origin`: `{ lat: Number, lng: Number, name: String }`
- `destination`: `{ lat: Number, lng: Number, name: String }`
- `currentLocation`: `{ lat: Number, lng: Number }`
- `status`: `DISPATCHED` | `EN_ROUTE` | `ARRIVED` | `CANCELLED`
- `preemptedSignals`: Array of Signal IDs locked to `GREEN`
- `timeSavedSeconds` (Number)

### LogisticsTrip Model
- `id` (String)
- `fleetCompany` (String)
- `cargoType` (String)
- `requestedDeparture`: (Date / ISO string)
- `suggestedDeparture`: (Date / ISO string)
- `isShifted` (Boolean)
- `originalDelayMinutes` (Number)
- `optimizedDelayMinutes` (Number)
- `carbonSavedKg` (Number)
