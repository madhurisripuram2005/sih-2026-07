import type { TelemetryPayload, Vehicle, KPIs, AlertItem, V2VPacket, DemoStep } from "../types/telemetry";

const WAYPOINTS = [
  { x: 15.0, y: 75.0 },
  { x: 30.0, y: 60.0 },
  { x: 45.0, y: 35.0 },
  { x: 60.0, y: 30.0 },
  { x: 78.0, y: 45.0 },
  { x: 85.0, y: 70.0 },
  { x: 45.0, y: 80.0 },
];

export class ClientSimulationEngine {
  private fogLevel = 15.0;
  private demoActive = false;
  private demoStep = 1;
  private demoTimer = 0;
  private alerts: AlertItem[] = [];

  private vehicles: (Vehicle & { targetIdx: number })[] = [
    {
      id: "V101",
      name: "CAT 777D Dumper",
      type: "Dumper",
      x: 20.0,
      y: 70.0,
      targetIdx: 1,
      speed_kmh: 30.0,
      heading_deg: 45.0,
      status: "NORMAL",
      mass_tonnes: 90.0,
      battery_health: 98.0,
    },
    {
      id: "V102",
      name: "Komatsu HD785 Dumper",
      type: "Dumper",
      x: 58.0,
      y: 32.0,
      targetIdx: 2,
      speed_kmh: 22.0,
      heading_deg: 90.0,
      status: "CAUTION",
      mass_tonnes: 85.0,
      battery_health: 95.0,
    },
    {
      id: "V103",
      name: "CAT 789D Primary Dumper",
      type: "Dumper",
      x: 48.0,
      y: 34.0,
      targetIdx: 2,
      speed_kmh: 28.0,
      heading_deg: 85.0,
      status: "HOST_VEHICLE",
      mass_tonnes: 110.0,
      battery_health: 99.0,
    },
    {
      id: "V104",
      name: "EX-01 Hydraulic Excavator",
      type: "Excavator",
      x: 14.0,
      y: 76.0,
      targetIdx: 0,
      speed_kmh: 0.0,
      heading_deg: 180.0,
      status: "LOADING",
      mass_tonnes: 140.0,
      battery_health: 92.0,
    },
    {
      id: "V105",
      name: "LV-02 Safety Patrol",
      type: "Light Vehicle",
      x: 62.0,
      y: 28.0,
      targetIdx: 2,
      speed_kmh: 15.0,
      heading_deg: 110.0,
      status: "PATROL",
      mass_tonnes: 3.5,
      battery_health: 100.0,
    },
    {
      id: "V106",
      name: "WT-01 Water Tanker",
      type: "Water Tanker",
      x: 80.0,
      y: 68.0,
      targetIdx: 3,
      speed_kmh: 18.0,
      heading_deg: 270.0,
      status: "DUST_SUPPRESSION",
      mass_tonnes: 45.0,
      battery_health: 94.0,
    },
  ];

  public setFog(level: number) {
    this.fogLevel = Math.max(0, Math.min(100, level));
  }

  public startDemo() {
    this.demoActive = true;
    this.demoStep = 1;
    this.demoTimer = 0;
  }

  public resetDemo() {
    this.demoActive = false;
    this.demoStep = 1;
    this.fogLevel = 15.0;
  }

  public ackAlert(id: string) {
    const a = this.alerts.find((al) => al.id === id);
    if (a) a.acknowledged = true;
  }

  public resolveAlert(id: string) {
    this.alerts = this.alerts.filter((al) => al.id !== id);
  }

  public step(dt: number): TelemetryPayload {
    if (this.demoActive) {
      this.demoTimer += dt;
      if (this.demoTimer > 4.0) {
        this.demoTimer = 0;
        this.demoStep = this.demoStep < 14 ? this.demoStep + 1 : 1;
      }
      if (this.demoStep >= 2 && this.demoStep <= 10) {
        this.fogLevel = Math.min(88, this.fogLevel + 4.0);
      } else if (this.demoStep >= 12) {
        this.fogLevel = Math.max(15, this.fogLevel - 5.0);
      }
    }

    // Move moving vehicles along waypoints
    for (const v of this.vehicles) {
      if (v.speed_kmh > 0) {
        const target = WAYPOINTS[v.targetIdx];
        const dx = target.x - v.x;
        const dy = target.y - v.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2.0) {
          v.targetIdx = (v.targetIdx + 1) % WAYPOINTS.length;
        } else {
          const moveDist = v.speed_kmh * 0.2778 * dt * 0.1;
          v.x += (dx / dist) * moveDist;
          v.y += (dy / dist) * moveDist;
          v.heading_deg = (Math.atan2(dy, dx) * 180) / Math.PI;
        }
      }
    }

    const host = this.vehicles.find((v) => v.id === "V103") || this.vehicles[2];
    const visibility = Math.max(3.0, 150.0 * (1.0 - this.fogLevel / 100.0));

    // Dynamic Sensor Fusion for each vehicle
    const vehiclesWithSensors: Vehicle[] = this.vehicles.map((v) => {
      const isBlinded = this.fogLevel > 60.0;
      const camConf = Math.max(10, Math.round(98 - this.fogLevel * 0.9));
      const radarDist = v.id === "V103" ? (this.demoActive && this.demoStep >= 6 && this.demoStep <= 11 ? 11.8 : 24.5) : 32.0;
      const stoppingDist = Math.round(v.speed_kmh * 0.2778 * 1.2 + ((v.speed_kmh * 0.2778) ** 2) / (2 * 9.81 * 0.4));
      const isCritical = v.id === "V103" && this.demoActive && this.demoStep >= 9 && this.demoStep <= 11;
      const isCaution = this.fogLevel > 50.0 || (v.id === "V103" && this.demoActive && this.demoStep >= 6);

      const riskLevel = isCritical ? "CRITICAL" : isCaution ? "HIGH_RISK" : "SAFE";

      return {
        ...v,
        risk: {
          risk_level: riskLevel,
          risk_score: isCritical ? 94 : isCaution ? 68 : 15,
          object_distance_m: radarDist,
          stopping_distance_m: stoppingDist,
          reaction_distance_m: Math.round(v.speed_kmh * 0.2778 * 1.2),
          braking_distance_m: Math.round(((v.speed_kmh * 0.2778) ** 2) / (2 * 9.81 * 0.4)),
          time_to_collision_sec: +(radarDist / Math.max(1, v.speed_kmh * 0.2778)).toFixed(1),
          recommended_action: isCritical ? "EMERGENCY RETARDER BRAKING" : isCaution ? "DECELERATE TO 15 KM/H" : "MAINTAIN NOMINAL SPEED",
          disclaimer: "Simulated Physics Risk Model — Prototype Only",
        },
        sensor_fusion: {
          is_simulated_data: true,
          label: "77GHz Radar + FLIR Thermal + AI Cam",
          fog_level_percent: this.fogLevel,
          estimated_visibility_m: Math.round(visibility),
          sensors: {
            camera: { status: isBlinded ? "DEGRADED" : "NOMINAL", confidence_percent: camConf, is_blinded: isBlinded },
            radar: { status: "ACTIVE", confidence_percent: 97, detected_distance_m: radarDist },
            thermal: { status: "ACTIVE", confidence_percent: 94, heat_signature_detected: true },
            gps: { status: "RTK_FIX", confidence_percent: 99, accuracy_m: 0.08 },
          },
          sensor_fusion_result: {
            fused_confidence_percent: 96,
            fused_distance_m: radarDist,
            primary_active_sensor: isBlinded ? "77 GHz mmWave Radar + Thermal IR" : "Triple-Sensor Fusion",
          },
        },
      };
    });

    // Add alert if critical
    if (this.demoActive && this.demoStep === 9 && !this.alerts.some((a) => a.id === "ALT-1093")) {
      this.alerts.unshift({
        id: "ALT-1093",
        timestamp: new Date().toLocaleTimeString(),
        vehicle_id: "V103",
        severity: "CRITICAL",
        message: "COLLISION RISK: Heavy Dumper ahead within stopping distance!",
        distance_m: 11.8,
        acknowledged: false,
        resolved: false,
      });
    }

    const hostWithSensors = vehiclesWithSensors.find((v) => v.id === "V103") || vehiclesWithSensors[2];

    const kpis: KPIs = {
      active_vehicles: 6,
      total_vehicles: 6,
      vehicles_in_warning: this.fogLevel > 60 ? 2 : 0,
      critical_alerts: this.alerts.filter((a) => a.severity === "CRITICAL" && !a.resolved).length,
      avg_speed_kmh: 22.5,
      avg_visibility_m: Math.round(visibility),
      fleet_efficiency_percent: Math.max(60, Math.round(100 - this.fogLevel * 0.35)),
      fog_level_percent: Math.round(this.fogLevel),
      fog_status: this.fogLevel > 70 ? "CRITICAL" : this.fogLevel > 40 ? "SEVERE" : "MODERATE",
    };

    const v2v_broadcasts: V2VPacket[] = this.vehicles.slice(0, 3).map((v) => ({
      packet_id: `PKT-${v.id}-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().slice(11, 19),
      sender_id: v.id,
      vehicle_type: v.type,
      speed_kmh: v.speed_kmh,
      heading_deg: v.heading_deg,
      position: { x: +v.x.toFixed(1), y: +v.y.toFixed(1) },
      safety_status: v.id === "V103" && this.demoActive && this.demoStep >= 9 ? "BRAKING_CRITICAL" : "NOMINAL",
    }));

    const demoState: DemoStep | null = this.demoActive
      ? {
          step: this.demoStep,
          title: `Step ${this.demoStep}: Scenario Phase ${this.demoStep}`,
          description: `Demonstrating sensor fusion behavior in fog conditions (Step ${this.demoStep} of 14).`,
          fog_level: this.fogLevel,
          visibility_m: Math.round(visibility),
          v103_speed: hostWithSensors.speed_kmh,
          object_distance_m: 11.8,
          object_type: "CAT Dumper",
          risk_level: this.demoStep >= 9 ? "CRITICAL" : "SAFE",
          alert_triggered: this.demoStep >= 9,
          is_active: true,
          current_step_number: this.demoStep,
          total_steps: 14,
          progress_percent: Math.round((this.demoStep / 14) * 100),
        }
      : null;

    return {
      timestamp: Date.now(),
      fog: {
        level_percent: this.fogLevel,
        visibility_m: Math.round(visibility),
        status_badge: this.fogLevel > 70 ? "CRITICAL" : this.fogLevel > 40 ? "SEVERE" : "MODERATE",
      },
      host_vehicle: hostWithSensors,
      vehicles: vehiclesWithSensors,
      v2v_broadcasts,
      alerts: this.alerts,
      kpis,
      demo_state: demoState,
    };
  }
}

export const clientSim = new ClientSimulationEngine();
