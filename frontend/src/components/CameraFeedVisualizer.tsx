import React, { useState, useRef, useEffect } from "react";
import { Vehicle } from "../types/telemetry";
import { Eye, ShieldAlert, Radio, Flame, Cpu } from "lucide-react";

interface CameraFeedVisualizerProps {
  hostVehicle: Vehicle;
  fogLevel: number;
}

export const CameraFeedVisualizer: React.FC<CameraFeedVisualizerProps> = ({
  hostVehicle,
  fogLevel,
}) => {
  const [viewMode, setViewMode] = useState<"RGB" | "THERMAL" | "RADAR" | "FUSION">("FUSION");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const risk = hostVehicle.risk;
  const fusion = hostVehicle.sensor_fusion;
  const objectDist = risk?.object_distance_m || 25.0;
  const riskLevel = risk?.risk_level || "SAFE";

  // Dynamic target object label based on which vehicle is being inspected
  const getTargetLabel = () => {
    switch (hostVehicle.id) {
      case "V102":
        return "LV-02 PATROL";
      case "V101":
        return "V103 DUMPER";
      case "V105":
        return "WT-01 TANKER";
      case "V104":
        return "LOADING DUMPER";
      case "V106":
        return "EXCAVATOR EX-01";
      default:
        return "V102 DUMPER";
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderCameraFeed = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, w, h);

      if (viewMode === "RADAR") {
        // ----------------------------------------------------
        // 77 GHz RADAR SCOPE VIEW
        // ----------------------------------------------------
        ctx.fillStyle = "#030712";
        ctx.fillRect(0, 0, w, h);

        // Concentric Radar Rings
        ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
        ctx.lineWidth = 1.5;
        const centerX = w / 2;
        const centerY = h - 20;

        [80, 160, 240, 320].forEach((r) => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, Math.PI, Math.PI * 2);
          ctx.stroke();
        });

        // Radar Sweep Cone
        ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, 340, Math.PI * 1.25, Math.PI * 1.75);
        ctx.closePath();
        ctx.fill();

        // Target Plot
        const targetY = centerY - (objectDist / 50.0) * 300;
        ctx.fillStyle = riskLevel === "CRITICAL" ? "#EF4444" : (riskLevel === "HIGH_RISK" ? "#F59E0B" : "#10B981");
        ctx.beginPath();
        ctx.arc(centerX, targetY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Blip Pulsing Ring
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, targetY, 20, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#10B981";
        ctx.font = "bold 12px monospace";
        ctx.fillText(`RADAR LOCK [${getTargetLabel()}]: ${objectDist.toFixed(1)}m`, centerX + 26, targetY + 4);

        return;
      }

      // ----------------------------------------------------
      // RGB / THERMAL / FUSION CAMERA CANVAS RENDER
      // ----------------------------------------------------
      if (viewMode === "THERMAL") {
        // Thermal IR Palette
        ctx.fillStyle = "#0A0518";
        ctx.fillRect(0, 0, w, h);

        // Haul Road Outline in Thermal
        ctx.fillStyle = "#160B2E";
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h);
        ctx.lineTo(w * 0.45, h * 0.55);
        ctx.lineTo(w * 0.55, h * 0.55);
        ctx.lineTo(w * 0.7, h);
        ctx.closePath();
        ctx.fill();

        // Hot Engine Signature
        const targetScale = Math.max(0.3, 1.0 - objectDist / 60.0);
        const objW = 140 * targetScale;
        const objH = 100 * targetScale;
        const objX = w * 0.5 - objW / 2;
        const objY = h * 0.58 - objH / 2;

        const heatGrad = ctx.createRadialGradient(
          objX + objW * 0.5,
          objY + objH * 0.5,
          5,
          objX + objW * 0.5,
          objY + objH * 0.5,
          objW * 0.7
        );
        heatGrad.addColorStop(0, "#FFFFFF");
        heatGrad.addColorStop(0.3, "#F59E0B");
        heatGrad.addColorStop(0.7, "#DC2626");
        heatGrad.addColorStop(1, "rgba(79, 70, 229, 0)");

        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(objX + objW * 0.5, objY + objH * 0.5, objW * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Thermal Worker Heat Signature
        const workerX = objX - 45;
        const workerY = objY + 20;
        const workerGrad = ctx.createRadialGradient(workerX, workerY, 2, workerX, workerY, 15);
        workerGrad.addColorStop(0, "#FFFFFF");
        workerGrad.addColorStop(0.5, "#F43F5E");
        workerGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = workerGrad;
        ctx.beginPath();
        ctx.arc(workerX, workerY, 15, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Normal RGB Visual Camera Feed
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(0, 0, w, h * 0.55);

        // Mine Pit Terraces
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.moveTo(0, h * 0.35);
        ctx.lineTo(w * 0.4, h * 0.45);
        ctx.lineTo(w, h * 0.3);
        ctx.lineTo(w, h * 0.55);
        ctx.lineTo(0, h * 0.55);
        ctx.closePath();
        ctx.fill();

        // Dirt Haul Road
        ctx.fillStyle = "#0F172A";
        ctx.beginPath();
        ctx.moveTo(w * 0.2, h);
        ctx.lineTo(w * 0.44, h * 0.55);
        ctx.lineTo(w * 0.56, h * 0.55);
        ctx.lineTo(w * 0.8, h);
        ctx.closePath();
        ctx.fill();

        // Haul Road Edge Markers
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w * 0.22, h);
        ctx.lineTo(w * 0.45, h * 0.55);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.78, h);
        ctx.lineTo(w * 0.55, h * 0.55);
        ctx.stroke();

        // Render Preceding Target Vehicle Ahead
        const targetScale = Math.max(0.25, 1.0 - objectDist / 55.0);
        const objW = 160 * targetScale;
        const objH = 110 * targetScale;
        const objX = w * 0.5 - objW / 2;
        const objY = h * 0.57 - objH / 2;

        ctx.fillStyle = "#475569";
        ctx.fillRect(objX, objY, objW, objH * 0.7);
        ctx.fillStyle = "#E2E8F0";
        ctx.fillRect(objX + objW * 0.2, objY + objH * 0.1, objW * 0.6, objH * 0.3);

        ctx.fillStyle = "#020617";
        ctx.fillRect(objX - 10 * targetScale, objY + objH * 0.5, 20 * targetScale, 40 * targetScale);
        ctx.fillRect(objX + objW - 10 * targetScale, objY + objH * 0.5, 20 * targetScale, 40 * targetScale);

        // Worker Hazard on Road Side
        const workerX = objX - 40 * targetScale;
        const workerY = objY + 30 * targetScale;
        ctx.fillStyle = "#EA580C";
        ctx.fillRect(workerX, workerY, 12 * targetScale, 22 * targetScale);
        ctx.fillStyle = "#FDE047";
        ctx.beginPath();
        ctx.arc(workerX + 6 * targetScale, workerY - 3 * targetScale, 5 * targetScale, 0, Math.PI * 2);
        ctx.fill();

        // Fog Overlay
        if (fogLevel > 5) {
          const fogAlpha = Math.min(0.95, (fogLevel / 100.0) * 0.96);
          ctx.fillStyle = `rgba(203, 213, 225, ${fogAlpha})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // AI Detection Bounding Box
      const targetScale = Math.max(0.25, 1.0 - objectDist / 55.0);
      const objW = 160 * targetScale;
      const objH = 110 * targetScale;
      const objX = w * 0.5 - objW / 2;
      const objY = h * 0.57 - objH / 2;

      const boxColor = riskLevel === "CRITICAL" ? "#EF4444" : (riskLevel === "HIGH_RISK" ? "#F59E0B" : "#10B981");

      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(objX - 8, objY - 8, objW + 16, objH + 16);

      ctx.fillStyle = boxColor;
      ctx.fillRect(objX - 8, objY - 34, objW + 16, 26);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 11px monospace";
      const cameraConf = fusion?.sensors.camera.confidence_percent || 90;
      ctx.fillText(
        `[${getTargetLabel()}] Dist: ${objectDist.toFixed(1)}m | Risk: ${riskLevel}`,
        objX - 4,
        objY - 17
      );

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 10px monospace";
      ctx.fillText(
        `AI Conf: ${fusion?.sensor_fusion_result.fused_confidence_percent || 95}% (Cam: ${cameraConf}%)`,
        objX - 4,
        objY + objH + 24
      );
    };

    renderCameraFeed();
  }, [hostVehicle, fogLevel, viewMode, objectDist, riskLevel, fusion]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full shadow-lg">
      {/* Header Bar */}
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
            FRONT CAMERA & SENSOR FUSION MONITOR
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
            INSPECTING: {hostVehicle.id} ({hostVehicle.name})
          </span>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-xs font-mono">
          {[
            { id: "FUSION", label: "FUSION OVERLAY", icon: Cpu },
            { id: "RGB", label: "RGB CAMERA", icon: Eye },
            { id: "THERMAL", label: "THERMAL IR", icon: Flame },
            { id: "RADAR", label: "RADAR SCOPE", icon: Radio }
          ].map((m) => {
            const Icon = m.icon;
            const active = viewMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id as any)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                  active
                    ? "bg-cyan-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Video Frame */}
      <div className="relative flex-1 min-h-[380px] bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={440}
          className="w-full h-full object-contain"
        />

        {/* Simulated Camera Overlay Watermark */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded border border-slate-800 text-[11px] font-mono text-slate-300 space-y-0.5">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>REC // {hostVehicle.id} ({hostVehicle.name}) CAM-01</span>
          </div>
          <div>MODE: {viewMode} FEED</div>
          <div className="text-[10px] text-amber-400">SIMULATED SENSOR DATA</div>
        </div>

        {/* Dynamic Fog Warning Pill */}
        {fogLevel > 60 && (
          <div className="absolute top-3 right-3 bg-rose-950/90 border border-rose-600 text-rose-200 px-3 py-1.5 rounded font-mono text-xs flex items-center gap-2 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>OPTICAL BLINDING: FOG {fogLevel}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
