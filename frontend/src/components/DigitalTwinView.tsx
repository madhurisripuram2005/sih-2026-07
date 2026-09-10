import React from "react";
import { Vehicle } from "../types/telemetry";
import { Layers, MapPin } from "lucide-react";

interface DigitalTwinViewProps {
  vehicles: Vehicle[];
  fogLevel: number;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  vehicles,
  fogLevel,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-bold text-base text-slate-100 uppercase tracking-wider">
              MINE DIGITAL TWIN 2D TERRAIN MODEL
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Elevation Benches, Haul Road Corridors, & Dynamic Fog Volume Simulation
            </p>
          </div>
        </div>
      </div>

      <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-6 min-h-[440px] flex items-center justify-center overflow-hidden">
        {/* Isometric Benches Representation */}
        <div className="w-full max-w-3xl space-y-4">
          {/* Bench Level 3 (Crusher Ramp) */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg relative">
            <div className="text-xs font-mono text-cyan-400 font-bold flex items-center justify-between">
              <span>BENCH LEVEL 3 (ELEVATION +420m) — PRIMARY CRUSHER</span>
              <span className="text-slate-500">2 VEHICLES ACTIVE</span>
            </div>
            <div className="mt-2 flex gap-4">
              {vehicles.filter(v => v.y < 45).map(v => (
                <div key={v.id} className="bg-slate-800 p-2 rounded text-xs font-mono text-slate-200 border border-slate-700 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{v.id} ({v.type}) — {v.speed_kmh.toFixed(0)} km/h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bench Level 2 (Main Haul Road & Fog Corridor) */}
          <div className={`p-4 rounded-lg border transition-all ${
            fogLevel > 60
              ? "bg-slate-900/40 border-amber-500/60 shadow-lg shadow-amber-950/40"
              : "bg-slate-900/90 border-slate-800"
          }`}>
            <div className="text-xs font-mono text-amber-400 font-bold flex items-center justify-between">
              <span>BENCH LEVEL 2 (ELEVATION +380m) — MAIN HAUL ROAD & FOG PASS</span>
              <span className="text-amber-400">FOG DENSITY: {fogLevel}%</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-4">
              {vehicles.filter(v => v.y >= 25 && v.y <= 65).map(v => (
                <div key={v.id} className="bg-slate-800 p-2 rounded text-xs font-mono text-slate-200 border border-slate-700 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{v.id} ({v.type}) — Risk: {v.risk?.risk_level || "SAFE"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bench Level 1 (Loading Pit A) */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg relative">
            <div className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-between">
              <span>BENCH LEVEL 1 (ELEVATION +340m) — PIT A LOADING AREA</span>
              <span className="text-slate-500">EXCAVATOR EX-01</span>
            </div>
            <div className="mt-2 flex gap-4">
              {vehicles.filter(v => v.y > 65).map(v => (
                <div key={v.id} className="bg-slate-800 p-2 rounded text-xs font-mono text-slate-200 border border-slate-700 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{v.id} ({v.type})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
