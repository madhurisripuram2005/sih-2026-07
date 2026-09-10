import math
import random

def get_simulated_sensor_readings(fog_level: float, actual_distance_m: float, object_type: str = "Dumper") -> dict:
    """
    Computes simulated sensor confidence values based on atmospheric fog density.
    Demonstrates that visual cameras degrade in heavy fog while Radar & Thermal maintain usability.
    
    All values are clearly tagged as SIMULATED SENSOR DATA.
    """
    fog_ratio = min(1.0, max(0.0, fog_level / 100.0))

    # 1. Front RGB Camera
    # Exponential degradation as fog density increases
    camera_base_conf = 95.0
    camera_conf = max(5.0, camera_base_conf * math.exp(-3.2 * fog_ratio))
    camera_status = "Active - High Performance" if camera_conf > 70 else ("Degraded - Fog Obstruction" if camera_conf > 30 else "Impaired - Zero Visibility")

    # 2. mmWave Radar / LiDAR Sensor
    # Unaffected by moisture droplets in fog
    radar_noise = (random.random() - 0.5) * 0.4
    radar_conf = max(88.0, 95.0 - (fog_ratio * 3.0) + (random.random() * 2.0))
    radar_distance = max(0.5, actual_distance_m + radar_noise)
    radar_status = "Active - Penetrating Fog"

    # 3. Thermal IR Camera
    # High thermal contrast for living workers (body heat) and active diesel engine blocks
    thermal_base = 92.0 if object_type in ["Worker", "Human", "Dumper", "Excavator"] else 75.0
    thermal_conf = max(65.0, thermal_base - (fog_ratio * 8.0) + (random.random() * 2.0))
    thermal_status = "Active - Heat Signature Tracked"

    # 4. GPS & IMU Telemetry (Differential RTK GPS)
    gps_accuracy_m = 0.5 + (fog_ratio * 0.4)
    gps_conf = 96.0 - (fog_ratio * 2.0)
    gps_status = "RTK Fix - Active"

    # 5. Multi-Sensor Fusion Node
    # Bayesian / Weighted fusion logic prioritizing high-confidence sensors
    weights_sum = camera_conf + radar_conf + thermal_conf + gps_conf
    fused_distance = (
        (camera_conf * actual_distance_m) +
        (radar_conf * radar_distance) +
        (thermal_conf * actual_distance_m) +
        (gps_conf * actual_distance_m)
    ) / weights_sum

    fused_confidence = max(radar_conf, thermal_conf) * 0.98

    # Estimated visibility distance in meters based on fog level
    estimated_visibility_m = max(3.0, round(50.0 * math.exp(-2.8 * fog_ratio), 1))

    return {
        "is_simulated_data": True,
        "label": "SIMULATED SENSOR DATA",
        "fog_level_percent": round(fog_level, 1),
        "estimated_visibility_m": estimated_visibility_m,
        "sensors": {
            "camera": {
                "status": camera_status,
                "confidence_percent": round(camera_conf, 1),
                "is_blinded": camera_conf < 25.0
            },
            "radar": {
                "status": radar_status,
                "confidence_percent": round(radar_conf, 1),
                "detected_distance_m": round(radar_distance, 2)
            },
            "thermal": {
                "status": thermal_status,
                "confidence_percent": round(thermal_conf, 1),
                "heat_signature_detected": True if object_type in ["Worker", "Dumper", "Excavator"] else False
            },
            "gps": {
                "status": gps_status,
                "confidence_percent": round(gps_conf, 1),
                "accuracy_m": round(gps_accuracy_m, 2)
            }
        },
        "sensor_fusion_result": {
            "fused_confidence_percent": round(fused_confidence, 1),
            "fused_distance_m": round(fused_distance, 2),
            "primary_active_sensor": "Radar + Thermal" if camera_conf < 40 else "RGB Camera + Radar"
        }
    }
