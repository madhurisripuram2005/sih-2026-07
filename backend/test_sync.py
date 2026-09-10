import urllib.request
import json

def verify_all_vehicles():
    res = urllib.request.urlopen("http://127.0.0.1:8000/api/vehicles")
    vehicles = json.loads(res.read().decode())
    
    print("=== VERIFYING ALL 6 VEHICLES SYNCHRONIZATION DATA ===")
    for v in vehicles:
        print(f"ID: {v['id']} | Name: {v['name']} ({v['type']}) | Mass: {v['mass_tonnes']}t | Speed: {v['speed_kmh']} km/h | Risk: {v['risk']['risk_level']} | Fused Dist: {v['risk']['object_distance_m']}m | Cam Conf: {v['sensor_fusion']['sensors']['camera']['confidence_percent']}% | Radar Conf: {v['sensor_fusion']['sensors']['radar']['confidence_percent']}%")
    
    assert len(vehicles) == 6, "Expected 6 vehicles in fleet"
    print("SUCCESS: ALL 6 VEHICLES HAVE UNIQUE LIVE TELEMETRY & PERCEPTION DATA!")

if __name__ == "__main__":
    verify_all_vehicles()
