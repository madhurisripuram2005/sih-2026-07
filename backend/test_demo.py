import asyncio
import websockets
import json
import urllib.request

def trigger_demo():
    req = urllib.request.Request("http://127.0.0.1:8000/api/demo/start", method="POST")
    res = urllib.request.urlopen(req)
    print("Demo Trigger API Response:", res.read().decode())

async def monitor_demo():
    trigger_demo()
    uri = "ws://127.0.0.1:8000/ws/telemetry"
    async with websockets.connect(uri) as ws:
        for _ in range(16):
            msg = await ws.recv()
            data = json.loads(msg)
            demo = data.get("demo_state")
            if demo and demo.get("is_active"):
                print(f"[DEMO STEP {demo['current_step_number']}/14] {demo['title']} | Fog: {demo['fog_level']}% | Vis: {demo['visibility_m']}m | Risk: {demo['risk_level']}")
            await asyncio.sleep(0.4)

if __name__ == "__main__":
    asyncio.run(monitor_demo())
