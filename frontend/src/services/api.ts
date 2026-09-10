import type { TelemetryPayload } from "../types/telemetry";

const host = typeof window !== "undefined" ? (window.location.hostname || "localhost") : "localhost";
const port = typeof window !== "undefined" && window.location.port === "5173" ? "8000" : (typeof window !== "undefined" && window.location.port ? window.location.port : "8000");

const API_BASE = `http://${host}:${port}/api`;
const WS_URL = `ws://${host}:${port}/ws/telemetry`;

export class TelemetryService {
  private ws: WebSocket | null = null;
  private onMessageCallbacks: ((data: TelemetryPayload) => void)[] = [];
  private reconnectTimer: any = null;

  public connect() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log(`Connected to SMARTMINE WebSocket Telemetry Stream (${WS_URL})`);
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
        console.warn("SMARTMINE WebSocket disconnected. Retrying in 2 seconds...");
        this.reconnectTimer = setTimeout(() => this.connect(), 2000);
      };

      this.ws.onerror = (err) => {
        console.error("WebSocket error", err);
      };
    } catch (e) {
      console.error("Failed to establish WebSocket connection", e);
    }
  }

  public subscribe(callback: (data: TelemetryPayload) => void) {
    this.onMessageCallbacks.push(callback);
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter((cb) => cb !== callback);
    };
  }

  public sendCommand(cmd: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(cmd));
    }
  }
}

export const telemetryService = new TelemetryService();

export async function setFogLevel(level: number) {
  try {
    await fetch(`${API_BASE}/fog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level }),
    });
  } catch (e) {
    console.error("Failed to set fog level", e);
  }
}

export async function startDemoScenario() {
  try {
    await fetch(`${API_BASE}/demo/start`, { method: "POST" });
  } catch (e) {
    console.error("Failed to start demo scenario", e);
  }
}

export async function resetDemoScenario() {
  try {
    await fetch(`${API_BASE}/demo/reset`, { method: "POST" });
  } catch (e) {
    console.error("Failed to reset demo scenario", e);
  }
}

export async function acknowledgeAlert(alertId: string) {
  try {
    await fetch(`${API_BASE}/alerts/${alertId}/ack`, { method: "POST" });
  } catch (e) {
    console.error("Failed to ack alert", e);
  }
}

export async function resolveAlert(alertId: string) {
  try {
    await fetch(`${API_BASE}/alerts/${alertId}/resolve`, { method: "POST" });
  } catch (e) {
    console.error("Failed to resolve alert", e);
  }
}
