import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "smartmine.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table for safety alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        vehicle_id TEXT,
        severity TEXT,
        message TEXT,
        distance REAL,
        acknowledged INTEGER DEFAULT 0,
        resolved INTEGER DEFAULT 0
    )
    """)
    
    # Table for telemetry log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        vehicle_id TEXT,
        speed REAL,
        fog_level REAL,
        risk_level TEXT,
        data_json TEXT
    )
    """)
    
    conn.commit()
    conn.close()

def log_alert(alert_id, vehicle_id, severity, message, distance):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO alerts (id, timestamp, vehicle_id, severity, message, distance, acknowledged, resolved)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0)
    """, (alert_id, timestamp, vehicle_id, severity, message, distance))
    conn.commit()
    conn.close()

def acknowledge_alert(alert_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET acknowledged = 1 WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()

def resolve_alert(alert_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET resolved = 1 WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()

def get_all_alerts(limit=50):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

init_db()
