import React, { useEffect, useRef } from "react";
import { Vehicle } from "../types/telemetry";
import { AlertOctagon, AlertTriangle, ShieldCheck, Gauge, Eye, Volume2 } from "lucide-react";

interface DriverHUDProps {
  vehicle: Vehicle;
  fogLevel: number;
  audioEnabled: boolean;
}

export const DriverHUD: React.FC<DriverHUDProps> = ({
  vehicle,
  fogLevel,
  audioEnabled,
}) => {
  const lastAudioTimeRef = useRef<number>(0);
  const risk = vehicle.risk;
  const riskLevel = risk?.risk_level || "SAFE";
  const objectDist = risk?.object_distance_m || 99.0;
  const stoppingDist = risk?.stopping_distance_m || 15.0;

  // Web Speech API Voice Synthesis Alert for Selected Vehicle
  useEffect(() => {
    if (!audioEnabled) return;
    if (riskLevel === "CRITICAL" || riskLevel === "HIGH_RISK") {
      const now = Date.now();
      if (now - lastAudioTimeRef.current > 6000) {
        lastAudioTimeRef.current = now;
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const text = riskLevel === "CRITICAL"
            ? `Warning! ${vehicle.id} obstacle ahead ${objectDist.toFixed(1)} meters! Emergency Brake!`
            : `Caution! ${vehicle.id} object ahead ${objectDist.toFixed(1)} meters in fog. Slow down!`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.05;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [riskLevel, objectDist, audioEnabled, vehicle.id]);

  const getRiskTheme = () => {
    switch (riskLevel) {
      case "CRITICAL":
        return {
          bg: "bg-rose-950/90 border-rose-600 animate-critical-pulse text-rose-100",
          badge: "bg-rose-600 text-white",
          icon: AlertOctagon,
          actionBg: "bg-rose-600 text-white font-bold"
        };
      case "HIGH_RISK":
        return {
          bg: "bg-amber-950/80 border-amber-500 text-amber-100",
          badge: "bg-amber-500 text-slate-950 font-bold",
          icon: AlertTriangle,
          actionBg: "bg-amber-500 text-slate-950 font-bold"
        };
      case "CAUTION":
        return {
          bg: "bg-yellow-950/60 border-yellow-600 text-yellow-100",
          badge: "bg-yellow-500 text-slate-950 font-bold",
          icon: AlertTriangle,
          actionBg: "bg-yellow-600 text-white font-bold"
        };
      default:
        return {
          bg: "bg-slate-900 border-slate-800 text-slate-100",
          badge: "bg-emerald-600 text-white",
          icon: ShieldCheck,
          actionBg: "bg-slate-800 text-emerald-400"
        };
    }
  };

  const theme = getRiskTheme();
  const Icon = theme.icon;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Top Cab Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono text-xs uppercase font-bold tracking-wider">
              SMARTMINE IN-CAB ASSIST
            </span>
            <span className="bg-cyan-950 text-cyan-300 font-mono text-xs px-2.5 py-0.5 rounded border border-cyan-500/50 font-bold">
              VEHICLE: {vehicle.id} | {vehicle.name} ({vehicle.type})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-50 uppercase tracking-tight mt-1">
            DRIVER ASSISTANCE DISPLAY — {vehicle.id}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <div className="text-xs text-slate-400">AUDIO ALERTS</div>
            <div className={`text-xs font-bold ${audioEnabled ? "text-emerald-400" : "text-slate-500"}`}>
              {audioEnabled ? "VOICE SYNTH ACTIVE" : "MUTED"}
            </div>
          </div>
          <Volume2 className={`w-6 h-6 ${audioEnabled ? "text-emerald-400 animate-pulse" : "text-slate-600"}`} />
        </div>
      </div>

      {/* Main HUD Alert Banner */}
      <div className={`p-6 rounded-xl border-2 transition-all shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${theme.bg}`}>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${theme.badge} shadow-lg`}>
            <Icon className="w-10 h-10" />
          </div>
          <div>
            <div className="text-xs font-mono tracking-widest text-slate-300 uppercase">
              COLLISION RISK STATUS ({vehicle.id})
            </div>
            <div className="text-3xl font-black tracking-tight">
              {riskLevel.replace("_", " ")}
            </div>
            <div className="text-sm font-mono text-slate-200 mt-0.5">
              Obstacle Ahead Distance: <span className="font-bold text-white text-lg">{objectDist.toFixed(1)} m</span>
            </div>
          </div>
        </div>

        {/* Action Directive */}
        <div className={`px-6 py-4 rounded-lg text-center shadow-lg border border-white/20 ${theme.actionBg}`}>
          <div className="text-[10px] uppercase font-mono tracking-wider opacity-90">
            RECOMMENDED DRIVER DIRECTIVE
          </div>
          <div className="text-xl font-black tracking-wide mt-0.5 uppercase">
            {risk?.recommended_action || "MAINTAIN SAFE SPEED"}
          </div>
        </div>
      </div>

      {/* Live Telemetry Readout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Speedometer */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>LIVE SPEED ({vehicle.id})</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-black text-slate-50 font-mono">
              {Math.round(vehicle.speed_kmh)}
            </span>
            <span className="text-sm font-mono text-slate-400 ml-2">km/h</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-cyan-500 h-full transition-all"
              style={{ width: `${Math.min(100, (vehicle.speed_kmh / 50) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Obstacle Distance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>OBJECT AHEAD</span>
            <Eye className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className={`text-4xl font-black font-mono ${objectDist < 15 ? "text-rose-400" : "text-amber-400"}`}>
              {objectDist.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-slate-400 ml-2">meters</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Sensor: {vehicle.sensor_fusion?.sensor_fusion_result.primary_active_sensor || "Radar + Thermal"}
          </div>
        </div>

        {/* Stopping Distance Math */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>STOPPING DIST ({vehicle.mass_tonnes}t)</span>
            <span className="text-xs font-mono text-cyan-400">PHYSICS ENGINE</span>
          </div>
          <div className="my-2">
            <span className="text-4xl font-black text-slate-100 font-mono">
              {stoppingDist.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-slate-400 ml-2">meters</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Reaction ({risk?.reaction_distance_m || 11.5}m) + Brake ({risk?.braking_distance_m || 3.5}m)
          </div>
        </div>

        {/* Fog & Position */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>GPS LOCATION</span>
            <span className="text-xs font-mono text-amber-400">{fogLevel}% FOG</span>
          </div>
          <div className="my-2 font-mono">
            <div className="text-xl font-bold text-cyan-300">
              X: {vehicle.x.toFixed(1)}, Y: {vehicle.y.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Heading: {vehicle.heading_deg.toFixed(0)}°
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Visibility: <span className="text-cyan-400 font-bold">{vehicle.sensor_fusion?.estimated_visibility_m || 4.2}m</span>
          </div>
        </div>
      </div>

      {/* Safety Disclaimer Footer */}
      <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg text-center text-xs font-mono text-slate-400">
        ⚠️ <span className="font-bold text-slate-300">DRIVER ASSISTANCE PROTOTYPE:</span> Displaying live telemetry for <strong className="text-cyan-300">{vehicle.id} ({vehicle.name})</strong>. No direct autonomous vehicle actuation.
      </div>
    </div>
  );
};
