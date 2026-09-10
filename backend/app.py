import asyncio
import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional

from simulation.mine_sim import MineSimulationEngine
from database import log_alert, acknowledge_alert, resolve_alert, get_all_alerts

app = FastAPI(
    title="SMARTMINE API",
    description="AI-Powered Fog Safety & Mine Vehicle Collision Avoidance System for NMDC Problem Statement 26007",
    version="1.0.0"
)

# Enable CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Simulation Engine
sim = MineSimulationEngine()

class FogUpdateRequest(BaseModel):
    level: float

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# Background task for live simulation broadcast loop (5 Hz)
async def simulation_broadcast_loop():
    while True:
        try:
            telemetry_data = sim.step_simulation(delta_sec=0.2)
            await manager.broadcast(telemetry_data)
        except Exception as e:
            print(f"Simulation loop error: {e}")
        await asyncio.sleep(0.2)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_broadcast_loop())

@app.get("/api/status")
def get_status():
    return {
        "status": "OPERATIONAL",
        "system": "SMARTMINE COMMAND CENTER",
        "problem_statement": "NMDC 26007 - Mine Vehicle Safety in Fog",
        "active_websocket_clients": len(manager.active_connections)
    }

@app.get("/api/vehicles")
def get_vehicles():
    telemetry = sim.step_simulation(0.0)
    return telemetry["vehicles"]

@app.get("/api/alerts")
def get_alerts():
    db_alerts = get_all_alerts()
    return {"live_alerts": sim.active_alerts, "historical_alerts": db_alerts}

@app.post("/api/alerts/{alert_id}/ack")
def ack_alert(alert_id: str):
    acknowledge_alert(alert_id)
    for alert in sim.active_alerts:
        if alert["id"] == alert_id:
            alert["acknowledged"] = True
    return {"status": "SUCCESS", "alert_id": alert_id}

@app.post("/api/alerts/{alert_id}/resolve")
def res_alert(alert_id: str):
    resolve_alert(alert_id)
    sim.active_alerts = [a for a in sim.active_alerts if a["id"] != alert_id]
    return {"status": "SUCCESS", "alert_id": alert_id}

@app.post("/api/fog")
def set_fog(req: FogUpdateRequest):
    sim.set_fog_level(req.level)
    return {"status": "SUCCESS", "new_fog_level": req.level}

@app.post("/api/demo/start")
def start_demo():
    sim.start_demo()
    return {"status": "SUCCESS", "message": "14-step automated hackathon demo started"}

@app.post("/api/demo/reset")
def reset_demo():
    sim.reset_demo()
    return {"status": "SUCCESS", "message": "Demo reset to normal simulation state"}

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open & receive optional control messages from client
            data = await websocket.receive_text()
            try:
                cmd = json.loads(data)
                if cmd.get("action") == "set_fog":
                    sim.set_fog_level(float(cmd.get("level", 15.0)))
                elif cmd.get("action") == "start_demo":
                    sim.start_demo()
                elif cmd.get("action") == "reset_demo":
                    sim.reset_demo()
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Documentation & QR Code Endpoints
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_HTML = os.path.join(ROOT_DIR, "PROJECT_DOCUMENTATION.html")
CARD_IMG = os.path.join(ROOT_DIR, "smartmine_project_documentation_card.png")
QR_PORTAL_PNG = os.path.join(ROOT_DIR, "documentation_qr_portal.png")
QR_PORTAL_SVG = os.path.join(ROOT_DIR, "documentation_qr_portal.svg")
QR_DOSSIER_PNG = os.path.join(ROOT_DIR, "documentation_qr_dossier.png")
QR_DOSSIER_SVG = os.path.join(ROOT_DIR, "documentation_qr_dossier.svg")

@app.get("/documentation")
@app.get("/documentation.html")
async def serve_docs():
    if os.path.exists(DOCS_HTML):
        return FileResponse(DOCS_HTML, media_type="text/html")
    raise HTTPException(status_code=404, detail="Documentation not found")

@app.get("/documentation_qr_portal.png")
async def serve_qr_portal_png():
    if os.path.exists(QR_PORTAL_PNG):
        return FileResponse(QR_PORTAL_PNG, media_type="image/png")
    raise HTTPException(status_code=404, detail="QR image not found")

@app.get("/documentation_qr_portal.svg")
async def serve_qr_portal_svg():
    if os.path.exists(QR_PORTAL_SVG):
        return FileResponse(QR_PORTAL_SVG, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="QR image not found")

@app.get("/documentation_qr_dossier.png")
async def serve_qr_dossier_png():
    if os.path.exists(QR_DOSSIER_PNG):
        return FileResponse(QR_DOSSIER_PNG, media_type="image/png")
    raise HTTPException(status_code=404, detail="QR image not found")

@app.get("/documentation_qr_dossier.svg")
async def serve_qr_dossier_svg():
    if os.path.exists(QR_DOSSIER_SVG):
        return FileResponse(QR_DOSSIER_SVG, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="QR image not found")

@app.get("/smartmine_project_documentation_card.png")
async def serve_card_png():
    if os.path.exists(CARD_IMG):
        return FileResponse(CARD_IMG, media_type="image/png")
    raise HTTPException(status_code=404, detail="Card image not found")

# Mount frontend dist static files if built
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
