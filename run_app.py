import subprocess
import sys
import os
import time
import webbrowser
import urllib.request

NODE_PATH = r"C:\Users\LENOVO\nodejs"
if os.path.exists(NODE_PATH) and NODE_PATH not in os.environ.get("PATH", ""):
    os.environ["PATH"] = NODE_PATH + ";" + os.environ.get("PATH", "")

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def main():
    print("==================================================================")
    print("  SMARTMINE - AI-Powered Fog Safety & Mine Collision Avoidance    ")
    print("  NMDC Problem Statement 26007 Prototype Launcher                ")
    print("==================================================================")

    # 1. Start Python FastAPI Backend
    print("\n[1/3] Starting FastAPI Backend on http://localhost:8000 ...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=BACKEND_DIR)

    # Wait 2 seconds for backend initialization
    time.sleep(2)

    # 2. Start Vite Frontend
    print("\n[2/3] Starting React + Vite Frontend on http://localhost:5173 ...")
    frontend_cmd = "npm run dev -- --host --port 5173"
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR, shell=True)

    # 3. Wait for Frontend to be ready before opening Chrome
    print("\n[3/3] Waiting for frontend to become ready...")
    target_url = "http://localhost:5173"
    ready = False
    for i in range(30):
        try:
            with urllib.request.urlopen("http://localhost:5173", timeout=1) as resp:
                if resp.status == 200:
                    ready = True
                    break
        except Exception:
            pass
        time.sleep(1)

    if not ready:
        print("Vite is taking longer, falling back to unified backend port 8000...")
        target_url = "http://localhost:8000"

    print(f"Launching Control Center Dashboard in Chrome ({target_url})...")
    chrome_paths = [
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    chrome_exe = next((p for p in chrome_paths if os.path.exists(p)), None)
    if chrome_exe:
        subprocess.Popen([chrome_exe, target_url])
    else:
        webbrowser.open(target_url)

    print("\n==================================================================")
    print("  SMARTMINE IS NOW RUNNING!")
    print("  - Backend REST & WebSockets: http://localhost:8000")
    print("  - Command Center Dashboard:  http://localhost:5173")
    print("  Press Ctrl+C in this terminal to stop both servers.")
    print("==================================================================")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping SMARTMINE servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
