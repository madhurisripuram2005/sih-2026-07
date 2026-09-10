import type { TelemetryPayload } from "../types/telemetry";
import { clientSim } from "./clientSimulation";

const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const host = typeof window !== "undefined" ? (window.location.hostname || "localhost") : "localhost";
const port = typeof window !== "undefined" && window.location.port === "5173" ? "8000" : (typeof window !== "undefined" && window.location.port ? window.location.port : "8000");

const API_BASE = `http://${host}:${port}/api`;
const WS_URL = `ws://${host}:${port}/ws/telemetry`;

export class TelemetryService {
  private ws: WebSocket | null = null;
  private onMessageCallbacks: ((data: TelemetryPayload) => void)[] = [];
  private reconnectTimer: any = null;
  private fallbackTimer: any = null;
  private isWsActive: boolean = false;

  public connect() {
    this.startFallbackSimulation();

    if (isLocalhost) {
      this.tryConnectWebSocket();
    }
  }

  private tryConnectWebSocket() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log(`Connected to SMARTMINE WebSocket Telemetry Stream (${WS_URL})`);
        this.isWsActive = true;
        this.stopFallbackSimulation();
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload: TelemetryPayload = JSON.parse(event.data);
          this.onMessageCallbacks.forEach((cb) => cb(payload));
        } catch (e) {
          console.error("Failed to parse telemetry payload", e);
        }
      };

      this.ws.onclose = () => {
        this.isWsActive = false;
        this.startFallbackSimulation();
        this.reconnectTimer = setTimeout(() => this.tryConnectWebSocket(), 3000);
      };

      this.ws.onerror = () => {
        this.isWsActive = false;
        this.startFallbackSimulation();
      };
    } catch {
      this.isWsActive = false;
      this.startFallbackSimulation();
    }
  }

  private startFallbackSimulation() {
    if (this.fallbackTimer || this.isWsActive) return;
    this.fallbackTimer = setInterval(() => {
      if (this.isWsActive) return;
      const simData = clientSim.step(0.2);
      this.onMessageCallbacks.forEach((cb) => cb(simData));
    }, 200);
  }

  private stopFallbackSimulation() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  public subscribe(callback: (data: TelemetryPayload) => void) {
    this.onMessageCallbacks.push(callback);
    callback(clientSim.step(0.0));
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter((cb) => cb !== callback);
    };
  }

  public sendCommand(cmd: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(cmd));
    }
    if (cmd.action === "set_fog") {
      clientSim.setFog(Number(cmd.level) || 15.0);
    } else if (cmd.action === "start_demo") {
      clientSim.startDemo();
    } else if (cmd.action === "reset_demo") {
      clientSim.resetDemo();
    }
  }
}

export const telemetryService = new TelemetryService();

export async function setFogLevel(level: number) {
  clientSim.setFog(level);
  if (isLocalhost) {
    try {
      await fetch(`${API_BASE}/fog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });
    } catch {}
  }
}

export async function startDemoScenario() {
  clientSim.startDemo();
  if (isLocalhost) {
    try {
      await fetch(`${API_BASE}/demo/start`, { method: "POST" });
    } catch {}
  }
}

export async function resetDemoScenario() {
  clientSim.resetDemo();
  if (isLocalhost) {
    try {
      await fetch(`${API_BASE}/demo/reset`, { method: "POST" });
    } catch {}
  }
}

export async function acknowledgeAlert(alertId: string) {
  clientSim.ackAlert(alertId);
  if (isLocalhost) {
    try {
      await fetch(`${API_BASE}/alerts/${alertId}/ack`, { method: "POST" });
    } catch {}
  }
}

export async function resolveAlert(alertId: string) {
  clientSim.resolveAlert(alertId);
  if (isLocalhost) {
    try {
      await fetch(`${API_BASE}/alerts/${alertId}/resolve`, { method: "POST" });
    } catch {}
  }
}
