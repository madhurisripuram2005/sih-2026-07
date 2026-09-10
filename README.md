# SMARTMINE — AI-Powered Fog Safety & Mine Vehicle Collision Avoidance System

**NMDC Hackathon Problem Statement ID:** 26007  
**Project Title:** SMARTMINE — AI-Powered Fog Safety & Mine Vehicle Collision Avoidance System  
**Version:** 1.0.0 (Proof-of-Concept Prototype)

---

## 1. PROJECT OVERVIEW

During severe winter fog and monsoon thermal inversions in open-cast iron ore mines, human haul-truck drivers experience extreme visual blinding, reducing visibility to **3–5 meters**. Standard heavy dumpers ($85\text{t}–120\text{t}$ payload) moving at $25–35\text{ km/h}$ require $15–25\text{ meters}$ of stopping distance, creating severe collision risks with excavators, light patrol vehicles, and workers.

**SMARTMINE** solves this by integrating:
- **RGB Camera + AI Computer Vision**: Bounding box object classification.
- **77 GHz mmWave Radar**: Pierces fog particulates to measure exact target distance and relative velocity.
- **FLIR Thermal IR**: Identifies human body heat and diesel engine heat signatures through dense fog.
- **RTK DGPS & V2V Mesh (5.9 GHz)**: Broadcasts 10 Hz telemetry between fleet vehicles.
- **Physics Collision Risk Engine**: Dynamically calculates stopping distance based on speed, mass, slope grade, and wet haul-road friction.
- **Command Center Dashboard & Driver In-Cab HUD**: Real-time fleet monitoring, voice speech synthesis audio alerts, and automated 14-step demo scenario player.

---

## 2. PREREQUISITES

To run SMARTMINE locally on your machine, ensure you have:
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & **npm**

---

## 3. INSTALLATION & SETUP

### Step 1: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 4. HOW TO RUN THE APPLICATION

### Single-Command Launcher (Recommended)
From the root directory of the project, run:

```bash
python run_app.py
```

This automated launcher will:
1. Boot the Python FastAPI backend server on `http://localhost:8000`.
2. Boot the React + Vite frontend server on `http://localhost:5173`.
3. Open the **SmartMine Command Center** in your default web browser!

---

## 5. DASHBOARD & SYSTEM URLS

- **Command Center Dashboard**: [http://localhost:5173](http://localhost:5173) *(or [http://localhost:8000](http://localhost:8000))*
- **Backend REST API & WebSockets**: [http://localhost:8000/api/status](http://localhost:8000/api/status)

---

## 6. HACKATHON DEMO & FEATURE GUIDE

### Automated 14-Step Hackathon Scenario Player
Click the prominent **"START DEMO SCENARIO"** button in the header bar.
Observe the automated 14-step progression on the live timeline:
1. **Normal Mine Operation**: Clear weather, fleet moving nominally.
2. **Fog Onset**: Fog increases across Main Haul Road Segment 2.
3. **Visibility Decrease**: Visibility drops to 11 meters.
4. **Dumper V103 Enters Fog Pass**: Visibility drops to 4.2 meters ($85\%$ fog).
5. **Camera Degradation**: RGB camera blinded ($18\%$ confidence).
6. **Radar Detection**: $77\text{ GHz}$ mmWave Radar pierces fog and detects target at $16.5\text{m}$.
7. **Thermal IR Confirmation**: FLIR Thermal IR identifies engine & worker heat signatures.
8. **Sensor Fusion Node**: Merges Radar + Thermal + V2V signals ($11.8\text{m}$ fused distance, $96\%$ confidence).
9. **Collision Risk Escalation**: Physics Risk Engine calculates stopping distance ($14.2\text{m} > 11.8\text{m}$). Risk jumps to **CRITICAL**.
10. **Driver HUD Speech Alert**: In-cab HUD flashes red and speaks audio warning: *"Warning! Dumper ahead 11.8 meters in severe fog!"*.
11. **Command Center Red Alert**: Control room receives Red Alert `#ALT-1093`.
12. **Driver Deceleration**: Vehicle slows down to $10\text{ km/h}$.
13. **Hazard Clearing**: Preceding vehicle advances ($26\text{m}$ following distance).
14. **System Normalization**: Fog dissipates and risk returns to **SAFE**.

### System-Wide Vehicle Inspection
- Click **"Inspect"** on any vehicle in the **Fleet Telemetry Table** (or click a marker on the **Live Mine Map**, or use the **Header Vehicle Selector**).
- The entire dashboard (AI Front Camera Visualizer, Driver In-Cab HUD, Sensor Fusion Perception Panel, Mine Map marker) will dynamically switch to that selected vehicle (`V101`, `V102`, `V103`, `V104`, `V105`, `V106`) while continuously receiving live WebSockets telemetry updates!

---

## 7. PROTOTYPE SIMULATION & SAFETY DISCLAIMERS

- **Simulated Components**: Sensor data, fog particulate opacity, vehicle GPS movement vectors, and V2V wireless packet broadcasts are realistically modeled in software for proof-of-concept demonstration.
- **Safety Disclaimer**: SMARTMINE is a driver-assistance proof-of-concept prototype for NMDC Problem Statement 26007. It provides driver collision warnings and does not perform direct autonomous vehicle brake actuation. Real-world mine vehicle deployment requires ISO 26262 functional safety certification.
