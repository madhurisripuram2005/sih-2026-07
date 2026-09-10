import React, { useRef, useEffect } from "react";
import { Vehicle } from "../types/telemetry";

interface MineMapCanvasProps {
  vehicles: Vehicle[];
  fogLevel: number;
  selectedVehicleId: string | null;
  onSelectVehicle: (vId: string) => void;
}

export const MineMapCanvas: React.FC<MineMapCanvasProps> = ({
  vehicles,
  fogLevel,
  selectedVehicleId,
  onSelectVehicle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderMap = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Dark Mine Terrain Background
      ctx.fillStyle = "#0B101D";
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = "#131E32";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const toPx = (pctX: number, pctY: number) => ({
        x: (pctX / 100) * width,
        y: (pctY / 100) * height,
      });

      // 2. Mine Zones
      const pit = toPx(15, 75);
      ctx.fillStyle = "rgba(180, 83, 9, 0.15)";
      ctx.strokeStyle = "rgba(217, 119, 6, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pit.x, pit.y, width * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 11px monospace";
      ctx.fillText("PIT A (LOADING)", pit.x - 45, pit.y - width * 0.13);

      const crusher = toPx(85, 70);
      ctx.fillStyle = "rgba(14, 165, 233, 0.15)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.beginPath();
      ctx.arc(crusher.x, crusher.y, width * 0.10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#38BDF8";
      ctx.fillText("CRUSHER PLANT", crusher.x - 40, crusher.y - width * 0.11);

      // 3. Haul Road Corridors
      const waypoints = [
        toPx(15, 75),
        toPx(30, 60),
        toPx(45, 35),
        toPx(60, 30),
        toPx(78, 45),
        toPx(85, 70),
        toPx(45, 80),
      ];

      ctx.strokeStyle = "#1E293B";
      ctx.lineWidth = 26;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      waypoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      waypoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Fog Zone Overlay
      if (fogLevel > 10) {
        const fogPass = toPx(60, 30);
        const fogRadius = (width * 0.18) * (fogLevel / 100.0);
        const grad = ctx.createRadialGradient(
          fogPass.x,
          fogPass.y,
          5,
          fogPass.x,
          fogPass.y,
          fogRadius
        );
        const alpha = Math.min(0.75, (fogLevel / 100.0) * 0.8);
        grad.addColorStop(0, `rgba(203, 213, 225, ${alpha})`);
        grad.addColorStop(0.6, `rgba(148, 163, 184, ${alpha * 0.6})`);
        grad.addColorStop(1, "rgba(148, 163, 184, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fogPass.x, fogPass.y, fogRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#E2E8F0";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`SEVERE FOG ZONE (${Math.round(fogLevel)}%)`, fogPass.x - 60, fogPass.y - fogRadius - 8);
      }

      // 5. Render Vehicles
      vehicles.forEach((v) => {
        const pos = toPx(v.x, v.y);
        const isSelected = v.id === selectedVehicleId;
        const riskLevel = v.risk?.risk_level || "SAFE";

        // Selection / Proximity Halo
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSelected ? 26 : 18, 0, Math.PI * 2);
        if (isSelected) {
          ctx.fillStyle = "rgba(6, 182, 212, 0.35)";
          ctx.strokeStyle = "#06B6D4";
          ctx.lineWidth = 3;
        } else if (riskLevel === "CRITICAL") {
          ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
          ctx.strokeStyle = "#EF4444";
          ctx.lineWidth = 1.5;
        } else if (riskLevel === "HIGH_RISK") {
          ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
          ctx.strokeStyle = "#F59E0B";
          ctx.lineWidth = 1.5;
        } else {
          ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
          ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
          ctx.lineWidth = 1;
        }
        ctx.fill();
        ctx.stroke();

        // Direction Vector Line
        const angleRad = (v.heading_deg * Math.PI) / 180;
        const arrowLen = 24;
        const endX = pos.x + Math.cos(angleRad) * arrowLen;
        const endY = pos.y + Math.sin(angleRad) * arrowLen;

        ctx.strokeStyle = isSelected ? "#38BDF8" : "#94A3B8";
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Vehicle Body Dot
        ctx.fillStyle = isSelected ? "#0284C7" : (v.type === "Excavator" ? "#D97706" : "#334155");
        ctx.strokeStyle = isSelected ? "#38BDF8" : "#E2E8F0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSelected ? 9 : 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = isSelected ? "#38BDF8" : "#FFFFFF";
        ctx.font = isSelected ? "bold 11px monospace" : "bold 10px monospace";
        ctx.fillText(`${v.id}${isSelected ? " [SELECTED]" : ""}`, pos.x + 14, pos.y - 4);

        ctx.fillStyle = "#94A3B8";
        ctx.font = "9px monospace";
        ctx.fillText(`${Math.round(v.speed_kmh)} km/h`, pos.x + 14, pos.y + 8);
      });
    };

    renderMap();
  }, [vehicles, fogLevel, selectedVehicleId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = (clickX / canvas.width) * 100;
    const pctY = (clickY / canvas.height) * 100;

    let nearest: Vehicle | null = null;
    let minDist = 999;

    vehicles.forEach((v) => {
      const d = Math.hypot(v.x - pctX, v.y - pctY);
      if (d < 8 && d < minDist) {
        minDist = d;
        nearest = v;
      }
    });

    if (nearest) {
      onSelectVehicle((nearest as Vehicle).id);
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex flex-col">
      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            OPEN CAST IRON ORE MINE — LIVE HAUL ROAD MAP
          </h2>
        </div>
        <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
          SELECTED: {selectedVehicleId || "V103"}
        </span>
      </div>

      <div className="relative flex-1 min-h-[420px] w-full bg-slate-950">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Map Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
          <div className="font-bold text-cyan-400 mb-1">MAP LEGEND</div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 border border-cyan-300"></span>
            <span>Selected Vehicle Marker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-600 border border-amber-400"></span>
            <span>Excavator (EX-01)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-300"></span>
            <span>Mine Fleet Vehicles</span>
          </div>
        </div>
      </div>
    </div>
  );
};
