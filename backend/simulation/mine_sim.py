import time
import math
import random
from .sensor_fusion import get_simulated_sensor_readings
from .risk_engine import evaluate_collision_risk
from .demo_scenario import DemoScenarioRunner

class MineSimulationEngine:
    def __init__(self):
        self.fog_level = 15.0  # Default fog 15%
        self.manual_fog_override = False
        self.demo_runner = DemoScenarioRunner()
        
        # Mine haul road map boundaries & key zones
        self.zones = {
            "PIT_A": {"name": "Iron Ore Loading Pit A", "x": 15, "y": 75, "radius": 12},
            "FOG_PASS": {"name": "Haul Pass Fog Zone", "x": 60, "y": 30, "radius": 15},
            "CRUSHER": {"name": "Primary Crusher Plant", "x": 85, "y": 70, "radius": 10},
            "HAUL_ROAD_MAIN": {"name": "Main Haul Road B", "x": 45, "y": 35, "radius": 20}
        }

        # Simulated Mine Vehicles
        self.vehicles = {
            "V101": {
                "id": "V101",
                "name": "CAT 777D Dumper",
                "type": "Dumper",
                "x": 20.0,
                "y": 70.0,
                "target_idx": 1,
                "speed_kmh": 30.0,
                "heading_deg": 45.0,
                "status": "NORMAL",
                "mass_tonnes": 90.0,
                "battery_health": 98.0
            },
            "V102": {
                "id": "V102",
                "name": "Komatsu HD785 Dumper",
                "type": "Dumper",
                "x": 58.0,
                "y": 32.0,
                "target_idx": 2,
                "speed_kmh": 22.0,
                "heading_deg": 90.0,
                "status": "CAUTION",
                "mass_tonnes": 85.0,
                "battery_health": 95.0
            },
            "V103": {
                "id": "V103",
                "name": "CAT 789D Primary Dumper",
                "type": "Dumper",
                "x": 48.0,
                "y": 34.0,
                "target_idx": 2,
                "speed_kmh": 28.0,
                "heading_deg": 85.0,
                "status": "HOST_VEHICLE",
                "mass_tonnes": 110.0,
                "battery_health": 99.0
            },
            "V104": {
                "id": "V104",
                "name": "EX-01 Hydraulic Excavator",
                "type": "Excavator",
                "x": 14.0,
                "y": 76.0,
                "target_idx": 0,
                "speed_kmh": 0.0,
                "heading_deg": 180.0,
                "status": "LOADING",
                "mass_tonnes": 140.0,
                "battery_health": 92.0
            },
            "V105": {
                "id": "V105",
                "name": "LV-02 Safety Patrol",
                "type": "Light Vehicle",
                "x": 62.0,
                "y": 28.0,
                "target_idx": 2,
                "speed_kmh": 15.0,
                "heading_deg": 110.0,
                "status": "PATROL",
                "mass_tonnes": 3.5,
                "battery_health": 100.0
            },
            "V106": {
                "id": "V106",
                "name": "WT-01 Water Tanker",
                "type": "Water Tanker",
                "x": 80.0,
                "y": 68.0,
                "target_idx": 3,
                "speed_kmh": 18.0,
                "heading_deg": 270.0,
                "status": "DUST_SUPPRESSION",
                "mass_tonnes": 45.0,
                "battery_health": 94.0
            }
        }

        # Haul road loop waypoints for movement
        self.waypoints = [
            (15.0, 75.0),  # Loading pit
            (30.0, 60.0),  # Pit Ramp
            (45.0, 35.0),  # Main haul road 1
            (60.0, 30.0),  # Fog pass
            (78.0, 45.0),  # Crusher ramp
            (85.0, 70.0),  # Crusher pit
            (45.0, 80.0)   # Return loop
        ]

        self.v2v_logs = []
        self.active_alerts = []

    def set_fog_level(self, level: float):
        self.fog_level = min(100.0, max(0.0, level))
        self.manual_fog_override = True

    def start_demo(self):
        self.demo_runner.start_demo()

    def reset_demo(self):
        self.demo_runner.reset_demo()

    def step_simulation(self, delta_sec: float = 0.5) -> dict:
        # Check if Demo Mode is running
        demo_state = self.demo_runner.update(delta_sec)
        if demo_state and demo_state.get("is_active"):
            self.fog_level = demo_state["fog_level"]
            self.vehicles["V103"]["speed_kmh"] = demo_state["v103_speed"]
            v103_object_dist = demo_state["object_distance_m"]
            v103_object_type = demo_state["object_type"]
        else:
            v103_object_dist = self._calculate_vehicle_distance("V103", "V102")
            v103_object_type = "Dumper"

        # Update vehicle positions
        self._update_vehicle_positions(delta_sec)

        # Calculate Sensor Fusion & Risk for ALL 6 vehicles dynamically
        for v_id, v in self.vehicles.items():
            if v_id == "V103":
                obj_dist = v103_object_dist
                obj_type = v103_object_type
                rel_speed = self.vehicles["V102"]["speed_kmh"]
            elif v_id == "V102":
                obj_dist = self._calculate_vehicle_distance("V102", "V105")
                obj_type = "Light Vehicle"
                rel_speed = self.vehicles["V105"]["speed_kmh"]
            elif v_id == "V101":
                obj_dist = self._calculate_vehicle_distance("V101", "V103")
                obj_type = "Dumper"
                rel_speed = self.vehicles["V103"]["speed_kmh"]
            elif v_id == "V105":
                obj_dist = self._calculate_vehicle_distance("V105", "V106")
                obj_type = "Water Tanker"
                rel_speed = self.vehicles["V106"]["speed_kmh"]
            elif v_id == "V106":
                obj_dist = self._calculate_vehicle_distance("V106", "V104")
                obj_type = "Excavator"
                rel_speed = 0.0
            else:
                obj_dist = 40.0
                obj_type = "Haul Road Barrier"
                rel_speed = 0.0

            sensor_readings = get_simulated_sensor_readings(self.fog_level, obj_dist, obj_type)
            risk_readings = evaluate_collision_risk(
                speed_kmh=v["speed_kmh"],
                object_distance_m=sensor_readings["sensor_fusion_result"]["fused_distance_m"],
                relative_speed_kmh=rel_speed,
                fog_level=self.fog_level
            )

            # Store live sensor fusion & risk objects directly on the vehicle dict
            v["sensor_fusion"] = sensor_readings
            v["risk"] = risk_readings
            v["status"] = risk_readings["risk_level"]

        host_v = self.vehicles["V103"]

        # Generate V2V broadcast packets
        v2v_packet = self._generate_v2v_packet("V103", host_v["risk"]["risk_level"])
        self.v2v_logs.insert(0, v2v_packet)
        if len(self.v2v_logs) > 30:
            self.v2v_logs.pop()

        # Update system alert feed
        self._evaluate_alerts(host_v["risk"], host_v["sensor_fusion"])

        # Build complete telemetry payload
        telemetry = {
            "timestamp": time.time(),
            "fog": {
                "level_percent": self.fog_level,
                "visibility_m": host_v["sensor_fusion"]["estimated_visibility_m"],
                "status_badge": self._get_fog_badge(self.fog_level)
            },
            "host_vehicle": host_v,
            "vehicles": list(self.vehicles.values()),
            "v2v_broadcasts": self.v2v_logs[:10],
            "alerts": self.active_alerts[:10],
            "kpis": self._calculate_kpis(),
            "demo_state": demo_state
        }

        return telemetry

    def _update_vehicle_positions(self, delta_sec: float):
        for v_id, v in self.vehicles.items():
            if v["speed_kmh"] <= 0:
                continue

            target = self.waypoints[v["target_idx"]]
            dx = target[0] - v["x"]
            dy = target[1] - v["y"]
            dist = math.hypot(dx, dy)

            if dist < 3.0:
                v["target_idx"] = (v["target_idx"] + 1) % len(self.waypoints)
                target = self.waypoints[v["target_idx"]]
                dx = target[0] - v["x"]
                dy = target[1] - v["y"]
                dist = math.hypot(dx, dy)

            if dist > 0:
                speed_units_per_sec = (v["speed_kmh"] / 10.0) * delta_sec
                move_ratio = min(1.0, speed_units_per_sec / dist)
                v["x"] += dx * move_ratio
                v["y"] += dy * move_ratio
                v["heading_deg"] = (math.degrees(math.atan2(dy, dx)) + 360) % 360

    def _calculate_vehicle_distance(self, v1_id: str, v2_id: str) -> float:
        v1 = self.vehicles[v1_id]
        v2 = self.vehicles[v2_id]
        dx = v1["x"] - v2["x"]
        dy = v1["y"] - v2["y"]
        return max(4.0, math.hypot(dx, dy) * 1.4)

    def _generate_v2v_packet(self, v_id: str, safety_status: str) -> dict:
        v = self.vehicles[v_id]
        return {
            "packet_id": f"V2V-{random.randint(1000, 9999)}",
            "timestamp": time.strftime("%H:%M:%S"),
            "sender_id": v_id,
            "vehicle_type": v["type"],
            "speed_kmh": round(v["speed_kmh"], 1),
            "heading_deg": round(v["heading_deg"], 0),
            "position": {"x": round(v["x"], 1), "y": round(v["y"], 1)},
            "safety_status": safety_status
        }

    def _evaluate_alerts(self, risk_data: dict, sensor_data: dict):
        risk_lvl = risk_data["risk_level"]
        dist = risk_data["object_distance_m"]
        
        if risk_lvl in ["CRITICAL", "HIGH_RISK"]:
            alert_id = f"ALT-{int(time.time())}"
            if not any(a["vehicle_id"] == "V103" and a["severity"] == risk_lvl for a in self.active_alerts[:3]):
                new_alert = {
                    "id": alert_id,
                    "timestamp": time.strftime("%H:%M:%S"),
                    "vehicle_id": "V103",
                    "severity": risk_lvl,
                    "message": f"Collision risk detected ahead ({dist}m) in {sensor_data['fog_level_percent']}% fog",
                    "distance_m": dist,
                    "acknowledged": False,
                    "resolved": False
                }
                self.active_alerts.insert(0, new_alert)
                if len(self.active_alerts) > 20:
                    self.active_alerts.pop()

    def _get_fog_badge(self, level: float) -> str:
        if level < 20:
            return "NORMAL"
        elif level < 45:
            return "LOW"
        elif level < 70:
            return "MODERATE"
        elif level < 88:
            return "SEVERE"
        else:
            return "CRITICAL"

    def _calculate_kpis(self) -> dict:
        active_cnt = sum(1 for v in self.vehicles.values() if v["speed_kmh"] > 0)
        critical_cnt = sum(1 for a in self.active_alerts if a["severity"] == "CRITICAL" and not a["resolved"])
        warning_cnt = sum(1 for a in self.active_alerts if a["severity"] == "HIGH_RISK" and not a["resolved"])
        avg_speed = sum(v["speed_kmh"] for v in self.vehicles.values()) / max(1, len(self.vehicles))
        
        return {
            "active_vehicles": active_cnt,
            "total_vehicles": len(self.vehicles),
            "vehicles_in_warning": warning_cnt,
            "critical_alerts": critical_cnt,
            "avg_speed_kmh": round(avg_speed, 1),
            "avg_visibility_m": round(max(3.0, 50.0 * math.exp(-2.8 * (self.fog_level / 100.0))), 1),
            "fleet_efficiency_percent": round(max(55.0, 98.0 - (self.fog_level * 0.35)), 1),
            "fog_level_percent": round(self.fog_level, 1),
            "fog_status": self._get_fog_badge(self.fog_level)
        }
