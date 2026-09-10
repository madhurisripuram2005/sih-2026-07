import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws/telemetry"
    async with websockets.connect(uri) as ws:
        msg = await ws.recv()
        data = json.loads(msg)
        print("=== WEBSOCKET TELEMETRY VERIFICATION ===")
        print(f"Timestamp: {data.get('timestamp')}")
        print(f"Fog Level: {data['fog']['level_percent']}% ({data['fog']['status_badge']})")
        print(f"Visibility: {data['fog']['visibility_m']} meters")
        print(f"Host Vehicle ID: {data['host_vehicle']['id']} ({data['host_vehicle']['name']})")
        print(f"Collision Risk: {data['host_vehicle']['risk']['risk_level']}")
        print(f"Stopping Distance: {data['host_vehicle']['risk']['stopping_distance_m']}m")
        print(f"Sensor Fusion Confidence: {data['host_vehicle']['sensor_fusion']['sensor_fusion_result']['fused_confidence_percent']}%")
        print(f"V2V Broadcast Packets Count: {len(data['v2v_broadcasts'])}")
        print(f"Active KPI Vehicles: {data['kpis']['active_vehicles']} / {data['kpis']['total_vehicles']}")
        print("========================================")

if __name__ == "__main__":
    asyncio.run(test_ws())
