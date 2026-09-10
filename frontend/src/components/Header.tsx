import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Play, 
  RotateCcw, 
  CloudFog, 
  Activity, 
  Truck, 
  AlertTriangle, 
  Eye, 
  Sliders, 
  Radio, 
  BarChart3, 
  Layers, 
  HelpCircle,
  Volume2,
  VolumeX,
  Target
} from "lucide-react";
import { KPIs, Vehicle } from "../types/telemetry";
import { setFogLevel, startDemoScenario, resetDemoScenario } from "../services/api";

interface HeaderProps {
  kpis?: KPIs;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
  isDemoActive?: boolean;
  demoStep?: number;
  selectedVehicle?: Vehicle;
  vehicles?: Vehicle[];
  onSelectVehicle: (vId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  kpis,
  activeTab,
  setActiveTab,
  audioEnabled,
  setAudioEnabled,
  isDemoActive,
  demoStep,
  selectedVehicle,
  vehicles = [],
  onSelectVehicle
}) => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentVehicleId = selectedVehicle?.id || "V103";
  const currentVehicleName = selectedVehicle?.name || "CAT 789D Primary Dumper";
  const currentVehicleType = selectedVehicle?.type || "Dumper";

  const navItems = [
    { id: "dashboard", label: "Command Center", icon: Activity },
    { id: "driver_hud", label: "Driver HUD", icon: Truck },
    { id: "camera_vision", label: "AI Vision Monitor", icon: Eye },
    { id: "sensor_fusion", label: "Sensor Fusion", icon: Sliders },
    { id: "fleet", label: "Fleet Telemetry", icon: Layers },
    { id: "alerts", label: "Alert Feed", icon: AlertTriangle },
    { id: "v2v", label: "V2V Stream", icon: Radio },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "about", label: "About Solution", icon: HelpCircle }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-xl">
      {/* Top Bar */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-wider text-slate-50 uppercase">
                SMARTMINE
              </h1>
              <span className="bg-slate-800 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30">
                PROTOTYPE v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              AI Fog Safety & Mine Vehicle Collision Avoidance System | NMDC 26007
            </p>
          </div>
        </div>

        {/* Global Vehicle Selector Badge */}
        <div className="flex items-center bg-cyan-950/70 border border-cyan-500/60 px-3 py-1.5 rounded-lg shadow-md">
          <Target className="w-4 h-4 text-cyan-400 mr-2 animate-pulse" />
          <div className="text-xs font-mono">
            <span className="text-cyan-400 font-bold uppercase mr-1">SELECTED VEHICLE:</span>
            <select
              value={currentVehicleId}
              onChange={(e) => onSelectVehicle(e.target.value)}
              className="bg-slate-900 text-white font-bold text-xs font-mono rounded px-2 py-0.5 border border-cyan-500/50 focus:outline-none focus:border-cyan-400"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} | {v.name} ({v.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Controls & Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Audio Alert Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              audioEnabled
                ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
            title="Toggle Voice Speech Audio Alerts"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>Voice Speech {audioEnabled ? "ON" : "OFF"}</span>
          </button>

          {/* Fog Control Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-1">
            <div className="flex items-center gap-1 px-2 text-slate-400 text-xs font-mono">
              <CloudFog className="w-4 h-4 text-cyan-400" />
              <span>FOG:</span>
            </div>
            {[
              { label: "0%", level: 5 },
              { label: "30%", level: 30 },
              { label: "60%", level: 60 },
              { label: "85%", level: 85 },
              { label: "95%", level: 95 }
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setFogLevel(f.level)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  kpis && Math.abs(kpis.fog_level_percent - f.level) < 10
                    ? "bg-cyan-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* HACKATHON DEMO CONTROLS */}
          <button
            onClick={startDemoScenario}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-semibold text-xs transition-all shadow-md ${
              isDemoActive
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-900/30"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isDemoActive ? `DEMO RUNNING (Step ${demoStep}/14)` : "START DEMO SCENARIO"}</span>
          </button>

          <button
            onClick={resetDemoScenario}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded-md transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Time & System Status */}
          <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-emerald-400 font-semibold">LIVE CONNECTED</span>
            </div>
            <span>{timeStr || "19:50:00"}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {kpis && (
        <div className="max-w-[1920px] mx-auto px-4 py-2 bg-slate-950/80 border-b border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-mono">
          <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px]">ACTIVE FLEET</span>
            <span className="text-base font-bold text-slate-100">{kpis.active_vehicles} / {kpis.total_vehicles}</span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px]">FOG LEVEL</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-amber-400">{kpis.fog_level_percent}%</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                kpis.fog_status === "CRITICAL" || kpis.fog_status === "SEVERE"
                  ? "bg-rose-950 text-rose-300 border border-rose-600/50"
                  : "bg-slate-800 text-slate-300"
              }`}>
                {kpis.fog_status}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px]">EST. VISIBILITY</span>
            <span className="text-base font-bold text-cyan-400">{kpis.avg_visibility_m} m</span>
          </div>

          <div className={`p-2 rounded border flex flex-col justify-between ${
            kpis.critical_alerts > 0
              ? "bg-rose-950/50 border-rose-600/60 text-rose-200 animate-pulse"
              : "bg-slate-900/80 border-slate-800/80"
          }`}>
            <span className="text-slate-400 text-[11px]">CRITICAL ALERTS</span>
            <span className={`text-base font-bold ${kpis.critical_alerts > 0 ? "text-rose-400" : "text-slate-300"}`}>
              {kpis.critical_alerts}
            </span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px]">VEHICLES AT RISK</span>
            <span className="text-base font-bold text-amber-400">{kpis.vehicles_in_warning}</span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px]">AVG FLEET SPEED</span>
            <span className="text-base font-bold text-slate-100">{kpis.avg_speed_kmh} km/h</span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px]">FLEET EFFICIENCY</span>
            <span className="text-base font-bold text-emerald-400">{kpis.fleet_efficiency_percent}%</span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px]">INSPECTING</span>
            <span className="text-xs font-bold text-cyan-300 truncate font-mono">{currentVehicleId} ({currentVehicleType})</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-[1920px] mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? "bg-slate-800 text-cyan-400 border-cyan-500 font-semibold"
                  : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
