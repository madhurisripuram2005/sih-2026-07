"""
SMARTMINE — Documentation QR Code Generator
NMDC Problem Statement ID: 26007

Generates:
1. documentation_qr_portal.png (URL to interactive web documentation)
2. documentation_qr_dossier.png (Direct plain-text complete technical dossier)
3. documentation_qr_portal.svg (Vector SVG for print / posters)
4. documentation_qr_dossier.svg (Vector SVG for print / posters)
5. smartmine_project_documentation_card.png (High-res 1400x950 presentation graphic card)
"""

import os
import socket
import qrcode
from qrcode.image.svg import SvgPathImage
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

LOCAL_IP = get_local_ip()
PORTAL_URL = f"http://{LOCAL_IP}:8000/documentation.html"

# Comprehensive structured text dossier for direct offline QR scanning
DIRECT_DOSSIER_TEXT = f"""==================================================
SMARTMINE: AI-POWERED FOG SAFETY & COLLISION AVOIDANCE
NMDC Hackathon Problem Statement ID: 26007
==================================================
Project: SMARTMINE v1.0.0 (Fleet Safety System)
Target: Open-Cast Iron Ore Mines (Fog & Blinding Safety)
Live Documentation: {PORTAL_URL}

[1] THE CRITICAL PROBLEM
During winter fog and monsoon inversions, sight drops to 3-5m.
85t-120t dumpers traveling at 25-35 km/h need 15-25m to stop.
Result: Catastrophic blind collisions, roll-overs & worker strikes.

[2] MULTI-SENSOR FUSION ARCHITECTURE
• 77 GHz mmWave Radar: FMCW Doppler pierces dense fog & dust.
• FLIR LWIR Thermal (8-14um): Detects worker & engine heat (37°C/90°C).
• AI RGB Camera: Daylight vision (degrades exponentially in fog).
• RTK DGPS & 5.9 GHz V2V: 10Hz peer telemetry (<0.5m error).
• Physics Risk Engine: Dynamic stopping distance calculation.
• In-Cab Driver HUD: Real-time visual + speech synthesized warnings.
• Central Command: 5Hz live WebSockets fleet monitoring.

[3] MATHEMATICAL FORMULAS
• Fusion Distance: d_fused = Σ(w_i * d_i) / Σ(w_i)
  w_cam = 95 * exp(-3.2 * fog) | w_rad >= 90 (dominant in fog)
• Stopping Distance: d_stop = (v * 1.5s) + [v² / (2 * μ_eff * g)]
  μ_eff = μ_base - Δμ_wet + sin(slope) - Δμ_mass
• Risk Tiers: SAFE (>2.0*d_stop) | CAUTION | WARNING | CRITICAL (<=1.0*d_stop)

[4] HARDWARE BILL OF MATERIALS (BOM)
• Edge AI: NVIDIA Jetson Orin Nano / AGX Orin (IP67)
• Radar: Continental ARS408-21 77GHz mmWave FMCW (CAN Bus)
• Thermal: FLIR Boson 640x512 LWIR Camera Core
• V2V / GPS: Cohda Wireless MK6c C-V2X + u-blox ZED-F9P RTK
• In-Cab: 7" 1000-nit CAN-bus Touch HUD + 95dB directional siren
• Per Truck Cost: ~₹2,20,000 (~$2,600 USD) vs $800,000 truck value.

[5] QUICK START & RUN
python run_app.py -> Boots FastAPI backend (:8000) & Vite frontend (:5173).
Web Docs: {PORTAL_URL}
=================================================="""

def generate_qr_codes():
    print(f"[*] Detecting local network IP: {LOCAL_IP}")
    print(f"[*] Documentation Web Portal URL: {PORTAL_URL}")

    # 1. Generate Portal URL QR (PNG)
    qr_portal = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=16,
        border=4,
    )
    qr_portal.add_data(PORTAL_URL)
    qr_portal.make(fit=True)
    img_portal = qr_portal.make_image(fill_color="#0284c7", back_color="#ffffff")
    portal_png_path = os.path.join(ROOT_DIR, "documentation_qr_portal.png")
    img_portal.save(portal_png_path)
    print(f"[+] Saved: {portal_png_path}")

    # 2. Generate Portal URL QR (SVG)
    qr_portal_svg = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=16,
        border=4,
        image_factory=SvgPathImage
    )
    qr_portal_svg.add_data(PORTAL_URL)
    qr_portal_svg.make(fit=True)
    img_portal_svg = qr_portal_svg.make_image()
    portal_svg_path = os.path.join(ROOT_DIR, "documentation_qr_portal.svg")
    img_portal_svg.save(portal_svg_path)
    print(f"[+] Saved: {portal_svg_path}")

    # 3. Generate Direct Offline Text Dossier QR (PNG)
    qr_dossier = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr_dossier.add_data(DIRECT_DOSSIER_TEXT)
    qr_dossier.make(fit=True)
    img_dossier = qr_dossier.make_image(fill_color="#0f172a", back_color="#ffffff")
    dossier_png_path = os.path.join(ROOT_DIR, "documentation_qr_dossier.png")
    img_dossier.save(dossier_png_path)
    print(f"[+] Saved: {dossier_png_path}")

    # 4. Generate Direct Offline Text Dossier QR (SVG)
    qr_dossier_svg = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
        image_factory=SvgPathImage
    )
    qr_dossier_svg.add_data(DIRECT_DOSSIER_TEXT)
    qr_dossier_svg.make(fit=True)
    img_dossier_svg = qr_dossier_svg.make_image()
    dossier_svg_path = os.path.join(ROOT_DIR, "documentation_qr_dossier.svg")
    img_dossier_svg.save(dossier_svg_path)
    print(f"[+] Saved: {dossier_svg_path}")

    # 5. Generate High-Res Presentation Card (1400 x 950 px)
    generate_presentation_card(img_portal, img_dossier)

def get_font(size, bold=False):
    font_names = [
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "arialbd.ttf" if bold else "arial.ttf",
        "tahoma.ttf",
    ]
    for name in font_names:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            pass
    return ImageFont.load_default()

def generate_presentation_card(img_portal, img_dossier):
    width = 1600
    height = 980
    card = Image.new("RGB", (width, height), color="#080c15")
    draw = ImageDraw.Draw(card)

    # Accent decorative glow borders
    draw.rectangle([(16, 16), (width - 16, height - 16)], outline="#1e293b", width=3)
    draw.rectangle([(26, 26), (width - 26, height - 26)], outline="#0ea5e9", width=1)

    # Fonts
    font_badge = get_font(18, bold=True)
    font_title = get_font(36, bold=True)
    font_subtitle = get_font(20, bold=False)
    font_section = get_font(22, bold=True)
    font_label = get_font(15, bold=True)
    font_text = get_font(14, bold=False)
    font_mono = get_font(13, bold=True)

    # Top Tag
    draw.rectangle([(60, 45), (460, 82)], fill="#0f172a", outline="#38bdf8", width=1)
    draw.text((75, 52), "NMDC HACKATHON  |  PROBLEM #26007", fill="#38bdf8", font=font_badge)

    # Title & Subtitle
    draw.text((60, 96), "SMARTMINE — COMPLETE PROJECT DOCUMENTATION", fill="#f8fafc", font=font_title)
    draw.text((60, 142), "AI-Powered Fog Safety & Mine Vehicle Collision Avoidance System", fill="#94a3b8", font=font_subtitle)

    # Divider line
    draw.line([(60, 178), (width - 60, 178)], fill="#1e293b", width=2)

    # Left Column: Features & Architecture summary
    left_x = 60
    cur_y = 200
    draw.text((left_x, cur_y), "SYSTEM ARCHITECTURE & CAPABILITIES", fill="#06b6d4", font=font_section)
    cur_y += 38

    bullets = [
        ("Multi-Sensor Fusion Node", "Fuses 77GHz Radar + FLIR Thermal IR + RGB AI + RTK DGPS."),
        ("Physics Collision Engine", "Dynamic stopping distance: slope, mass & wet haul road friction."),
        ("77 GHz mmWave FMCW", "Zero-degradation radar pierces 100% thick winter fog & dust."),
        ("FLIR LWIR Thermal Core", "Tracks human body heat (37°C) & diesel engines (85°C–120°C)."),
        ("5.9 GHz V2V Mesh + DGPS", "10 Hz inter-vehicle telemetry broadcast (<0.5m RTK positioning)."),
        ("In-Cab Driver HUD & Audio", "Real-time visual alerts + synthesized voice warnings in fog."),
        ("Central Command Center", "5 Hz WebSockets fleet telematics, automated 14-step demo."),
        ("Edge Computing Ready", "Designed for ruggedized NVIDIA Jetson Orin Nano/AGX (IP67).")
    ]

    for title, desc in bullets:
        draw.text((left_x, cur_y), f"• {title}:", fill="#38bdf8", font=font_label)
        draw.text((left_x + 230, cur_y), desc, fill="#cbd5e1", font=font_text)
        cur_y += 31

    # Formula Box on Left
    cur_y += 15
    draw.rectangle([(left_x, cur_y), (left_x + 750, cur_y + 130)], fill="#0f172a", outline="#1e293b", width=1)
    draw.text((left_x + 18, cur_y + 12), "CORE MATHEMATICAL FORMULATION", fill="#f59e0b", font=font_label)
    draw.text((left_x + 18, cur_y + 40), "• Sensor Fusion:  d_fused = Σ(w_i · d_i) / Σ(w_i)  [Radar w >= 90 in dense fog]", fill="#94a3b8", font=font_text)
    draw.text((left_x + 18, cur_y + 68), "• Stopping Dist:  d_stop = (v · 1.5s) + [v² / (2 · μ_eff · g)]", fill="#94a3b8", font=font_text)
    draw.text((left_x + 18, cur_y + 96), "• Friction Model: μ_eff = μ_base - Δμ_wet(fog) + sin(slope) - Δμ_mass", fill="#94a3b8", font=font_text)

    # Right Column: Two High-Res QR Cards
    qr_col_x1 = 860
    qr_col_x2 = 1220
    qr_y = 205
    qr_box_size = 320

    # --- QR Card 1: Web Portal ---
    draw.rectangle([(qr_col_x1, qr_y), (qr_col_x1 + qr_box_size, qr_y + 465)], fill="#0f172a", outline="#0284c7", width=2)
    draw.rectangle([(qr_col_x1, qr_y), (qr_col_x1 + qr_box_size, qr_y + 42)], fill="#0284c7")
    draw.text((qr_col_x1 + 22, qr_y + 10), "WEB DOCUMENTATION PORTAL", fill="#ffffff", font=font_label)

    qr1_resized = img_portal.resize((270, 270), Image.Resampling.LANCZOS)
    card.paste(qr1_resized, (qr_col_x1 + 25, qr_y + 56))

    draw.text((qr_col_x1 + 18, qr_y + 340), "Scan to open full web documentation", fill="#38bdf8", font=font_label)
    draw.text((qr_col_x1 + 18, qr_y + 365), "Interactive architecture, charts, BOM & API", fill="#94a3b8", font=font_text)
    draw.text((qr_col_x1 + 18, qr_y + 402), "Local Network URL:", fill="#64748b", font=font_text)
    draw.text((qr_col_x1 + 18, qr_y + 426), f"{PORTAL_URL[:34]}...", fill="#0284c7", font=font_mono)

    # --- QR Card 2: Offline Text Dossier ---
    draw.rectangle([(qr_col_x2, qr_y), (qr_col_x2 + qr_box_size, qr_y + 465)], fill="#0f172a", outline="#3b82f6", width=2)
    draw.rectangle([(qr_col_x2, qr_y), (qr_col_x2 + qr_box_size, qr_y + 42)], fill="#3b82f6")
    draw.text((qr_col_x2 + 25, qr_y + 10), "OFFLINE TECHNICAL DOSSIER", fill="#ffffff", font=font_label)

    qr2_resized = img_dossier.resize((270, 270), Image.Resampling.LANCZOS)
    card.paste(qr2_resized, (qr_col_x2 + 25, qr_y + 56))

    draw.text((qr_col_x2 + 18, qr_y + 340), "Scan for instant text dossier", fill="#60a5fa", font=font_label)
    draw.text((qr_col_x2 + 18, qr_y + 365), "100% offline — zero internet needed!", fill="#10b981", font=font_label)
    draw.text((qr_col_x2 + 18, qr_y + 402), "Contains: Specs, BOM, formulas,", fill="#94a3b8", font=font_text)
    draw.text((qr_col_x2 + 18, qr_y + 426), "sensors & 14-step scenario guide", fill="#94a3b8", font=font_text)

    # Bottom Instructions Bar
    bar_y = 730
    draw.rectangle([(60, bar_y), (width - 60, bar_y + 195)], fill="#0f172a", outline="#1e293b", width=2)
    draw.text((85, bar_y + 20), "HOW TO SCAN & ACCESS DOCUMENTATION", fill="#06b6d4", font=font_section)

    steps = [
        "1. Open Camera or any QR scanner app on your iOS / Android phone or tablet.",
        "2. Scan Left QR [Web Portal] while on the same Wi-Fi / LAN to view the full interactive dashboard documentation.",
        "3. Scan Right QR [Offline Dossier] anywhere — works offline without any internet connection or local server.",
        "4. Start SMARTMINE servers locally anytime with a single command: python run_app.py (FastAPI :8000 & Vite :5173)."
    ]

    s_y = bar_y + 60
    for step in steps:
        draw.text((85, s_y), step, fill="#cbd5e1", font=font_text)
        s_y += 30

    # Save presentation card
    card_path = os.path.join(ROOT_DIR, "smartmine_project_documentation_card.png")
    card.save(card_path, quality=95)
    print(f"[+] Saved High-Res Presentation Card: {card_path}")

if __name__ == "__main__":
    generate_qr_codes()
