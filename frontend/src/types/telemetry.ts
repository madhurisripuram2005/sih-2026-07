export interface Vehicle {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  speed_kmh: number;
  heading_deg: number;
  status: string;
  mass_tonnes: number;
  battery_health: number;
  risk?: RiskData;
  sensor_fusion?: SensorData;
}

export interface RiskData {
  risk_level: "SAFE" | "CAUTION" | "HIGH_RISK" | "CRITICAL";
  risk_score: number;
  object_distance_m: number;
  stopping_distance_m: number;
  reaction_distance_m: number;
  braking_distance_m: number;
  time_to_collision_sec: number;
  recommended_action: string;
  disclaimer: string;
}

export interface SensorInfo {
  status: string;
  confidence_percent: number;
  is_blinded?: boolean;
  detected_distance_m?: number;
  heat_signature_detected?: boolean;
  accuracy_m?: number;
}

export interface SensorData {
  is_simulated_data: boolean;
  label: string;
  fog_level_percent: number;
  estimated_visibility_m: number;
  sensors: {
    camera: SensorInfo;
    radar: SensorInfo;
    thermal: SensorInfo;
    gps: SensorInfo;
  };
  sensor_fusion_result: {
    fused_confidence_percent: number;
    fused_distance_m: number;
    primary_active_sensor: string;
  };
}

export interface FogData {
  level_percent: number;
  visibility_m: number;
  status_badge: "NORMAL" | "LOW" | "MODERATE" | "SEVERE" | "CRITICAL";
}

export interface KPIs {
  active_vehicles: number;
  total_vehicles: number;
  vehicles_in_warning: number;
  critical_alerts: number;
  avg_speed_kmh: number;
  avg_visibility_m: number;
  fleet_efficiency_percent: number;
  fog_level_percent: number;
  fog_status: string;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  vehicle_id: string;
  severity: "CAUTION" | "HIGH_RISK" | "CRITICAL" | "INFO";
  message: string;
  distance_m?: number;
  acknowledged: boolean;
  resolved: boolean;
}

export interface V2VPacket {
  packet_id: string;
  timestamp: string;
  sender_id: string;
  vehicle_type: string;
  speed_kmh: number;
  heading_deg: number;
  position: { x: number; y: number };
  safety_status: string;
}

export interface DemoStep {
  step: number;
  title: string;
  description: string;
  fog_level: number;
  visibility_m: number;
  v103_speed: number;
  object_distance_m: number;
  object_type: string;
  risk_level: string;
  alert_triggered: boolean;
  is_active?: boolean;
  current_step_number?: number;
  total_steps?: number;
  progress_percent?: number;
}

export interface TelemetryPayload {
  timestamp: number;
  fog: FogData;
  host_vehicle: Vehicle;
  vehicles: Vehicle[];
  v2v_broadcasts: V2VPacket[];
  alerts: AlertItem[];
  kpis: KPIs;
  demo_state?: DemoStep | null;
}
