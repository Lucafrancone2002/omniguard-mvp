# OmniGuard — Fleet Intelligence Platform

> **Predictive maintenance SaaS for multi-brand industrial humanoid robot fleets.**  
> Detect hardware wear, software drift, and network failures days before they happen — with full XAI explainability.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-omniguard--mvp.vercel.app-1a9ed4?style=flat-square&logo=vercel)](https://omniguard-mvp.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)

---

## The Problem

Humanoid robots are entering industrial floors at scale — but fleet operators face a critical blind spot: **failures are discovered after they happen**, not before. A single offline robot on an assembly line causes cascade delays across the entire task allocation system. Existing tools are:

- **Brand-locked** — no unified view across Unitree, UBTECH, AgiBot and other OEMs
- **Reactive** — alert only on hard faults, not early-stage degradation
- **Opaque** — no explanation for why a failure is predicted

OmniGuard solves all three.

---

## What OmniGuard Does

OmniGuard monitors a fleet of humanoid robots in real time, detects failure signatures across three distinct layers, and generates explainable predictive alerts **days before catastrophic failure**.

### 3-Layer Detection Architecture

| Layer | What it catches | Detection method |
|-------|----------------|-----------------|
| **Hardware** | Actuator wear, battery degradation, IMU drift | Sensor baseline comparison + degradation curve fitting |
| **Software Drift** | Gait model divergence, vision pipeline lag | Behavioural pattern deviation from trained baseline |
| **Network / Comm** | 5G handoff failures, fleet desync cascade risk | Packet latency monitoring + heartbeat analysis |

### Key Features

- **🔍 XAI Alerts** — every alert shows the exact sensor pattern that triggered it, the failure layer, confidence score, and estimated days to failure
- **🤖 Multi-brand support** — unified telemetry across Unitree G1, UBTECH Walker S1, AgiBot A2 and any OEM brand
- **⚡ Failure Simulation** — inject realistic failure scenarios on any robot and watch OmniGuard detect them in real time
- **📊 Fleet Dashboard** — live health scores, KPI bar, and status per robot with sub-second sensor refresh
- **🧩 Component-level inspection** — drill into individual body parts (joints, battery, vision, network) with per-sensor readings
- **🛡 Severity triage** — CRITICAL / WARNING / MONITOR classification with estimated lead time

---

## Live Demo

**[omniguard-mvp.vercel.app](https://omniguard-mvp.vercel.app)**

Try the full failure simulation workflow:
1. Open the dashboard — 12 robots streaming live telemetry
2. Click **⚡ Simulate Failure** → select a robot and a failure type
3. Watch OmniGuard detect the anomaly step by step in the Detection Log
4. Open any robot card → inspect body parts, live sensors, and the XAI explanation
5. Navigate to **3-Layer Detection** to explore how each failure class is caught

---

## Architecture

OmniGuard is structured as a layered React application. After an initial monolithic prototype, the codebase was refactored into fully isolated modules:

```
src/
├── App.jsx                        # Thin orchestrator — layout, tab routing, modals
│
├── constants/
│   ├── theme.js                   # Design token palette (C)
│   ├── robots.js                  # BRANDS, LOCATIONS, SENSOR_LABELS, BODY_PARTS
│   └── failures.js                # FAILURE_SCENARIOS with degradation rates
│
├── utils/
│   ├── math.js                    # gaussian(), clamp() — pure functions
│   └── robot.js                   # healthToStatus(), makeRobot()
│
├── hooks/
│   └── useSimulation.js           # Fleet state, live noise, startSimulation, resetRobot
│
├── components/
│   ├── ui/                        # Atomic UI: StatusDot, HealthBar, LayerBadge, SeverityBadge
│   ├── RobotCard.jsx              # Fleet grid card
│   ├── RobotDetail.jsx            # Full robot inspection modal
│   ├── SimulateModal.jsx          # Failure injection wizard
│   ├── SimLog.jsx                 # Real-time detection log terminal
│   └── LayerDetection.jsx         # Interactive 3-layer detection explorer
│
└── views/
    ├── FleetView.jsx              # Fleet Overview tab
    └── AlertsView.jsx             # Active Alerts tab
```

**Design principles:**
- Constants never import from components; data flows down only
- All simulation logic is encapsulated in `useSimulation` — zero business logic in views
- UI atoms (`components/ui/`) have no state and no side effects

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Inline styles with design token palette |
| State Management | React hooks (`useState`, `useEffect`, custom hook) |
| Deployment | Vercel (auto-deploy from `main`) |
| Language | JavaScript (ES Modules) |

No external UI library, no CSS framework, no backend — intentional for demo portability and zero-dependency deployability.

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Lucafrancone2002/omniguard-mvp.git
cd omniguard-mvp

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build    # outputs to /dist
npm run preview  # serves the production build locally
```

---

## Roadmap

This repository contains the **frontend MVP** — a fully functional simulation and monitoring dashboard. The planned engineering roadmap toward a production system:

- [ ] **Real telemetry ingestion** — WebSocket bridge to robot OEM SDKs (Unitree SDK2, UBTECH API)
- [ ] **ML anomaly detection backend** — LSTM-based degradation model per sensor stream
- [ ] **Multi-fleet tenancy** — per-factory isolation with role-based access
- [ ] **Alert notification layer** — webhook / DingTalk / Feishu integration for Chinese industrial operators
- [ ] **Historical analytics** — MTBF tracking, maintenance log, cost-of-downtime reporting
- [ ] **Mobile view** — responsive layout for floor-level technician access

---

## Target Market

OmniGuard is designed for **Chinese industrial operators** deploying humanoid robot fleets at scale — factories, logistics hubs, and quality control floors running mixed OEM fleets (Unitree, UBTECH, AgiBot, Fourier Intelligence). The platform addresses the operational gap between OEM-specific monitoring tools and a unified, brand-agnostic fleet intelligence layer.

---

## Author

**Luca Francone** — [@Lucafrancone2002](https://github.com/Lucafrancone2002)
