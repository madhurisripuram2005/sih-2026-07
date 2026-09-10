import React from "react";
import { DemoStep } from "../types/telemetry";
import { Play, RotateCcw, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { startDemoScenario, resetDemoScenario } from "../services/api";

interface DemoTimelineModalProps {
  demoState?: DemoStep | null;
}

export const DemoTimelineModal: React.FC<DemoTimelineModalProps> = ({ demoState }) => {
  const isRunning = demoState?.is_active || false;
  const currentStep = demoState?.current_step_number || 1;
  const totalSteps = demoState?.total_steps || 14;
  const progressPct = demoState?.progress_percent || 0;

  const demoStepsList = [
    { num: 1, title: "Normal Mine Operation", fog: "5%", vis: "45.0m", risk: "SAFE" },
    { num: 2, title: "Fog Accumulation Begins", fog: "30%", vis: "24.0m", risk: "SAFE" },
    { num: 3, title: "Visibility Drops across Segment 2", fog: "60%", vis: "11.0m", risk: "CAUTION" },
    { num: 4, title: "Dumper V103 Enters Severe Fog Zone", fog: "85%", vis: "4.2m", risk: "CAUTION" },
    { num: 5, title: "Front RGB Camera Blended by Fog (Conf 18%)", fog: "88%", vis: "3.8m", risk: "HIGH RISK" },
    { num: 6, title: "77GHz mmWave Radar Detects Target (16.5m)", fog: "90%", vis: "3.5m", risk: "HIGH RISK" },
    { num: 7, title: "Thermal IR Identifies Dumper & Worker Heat Signature", fog: "90%", vis: "3.5m", risk: "HIGH RISK" },
    { num: 8, title: "Multi-Sensor Fusion Confirms Target at 11.8m", fog: "90%", vis: "3.5m", risk: "CRITICAL" },
    { num: 9, title: "Physics Risk Engine Triggers CRITICAL Alert", fog: "90%", vis: "3.5m", risk: "CRITICAL" },
    { num: 10, title: "Driver In-Cab HUD Flashes RED + Voice Speech Alert", fog: "90%", vis: "3.5m", risk: "CRITICAL" },
    { num: 11, title: "Command Center Receives Red Alert #ALT-1093", fog: "90%", vis: "3.5m", risk: "CRITICAL" },
    { num: 12, title: "Driver Applies Retarder & Decelerates to 10 km/h", fog: "90%", vis: "3.5m", risk: "CAUTION" },
    { num: 13, title: "Vehicle Ahead Advances & Following Dist Opens (26m)", fog: "70%", vis: "8.0m", risk: "SAFE" },
    { num: 14, title: "Fog Clears & System Normalizes to SAFE", fog: "10%", vis: "40.0m", risk: "SAFE" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="font-bold text-base text-slate-100 uppercase tracking-wider">
              HACKATHON DEMO SCENARIO PLAYER (14 STEPS)
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Automated Proof-of-Concept Sequence for NMDC Problem Statement 26007
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startDemoScenario}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs shadow-lg transition-all ${
              isRunning
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse"
                : "bg-cyan-600 hover:bg-cyan-500 text-white"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunning ? `RUNNING (STEP ${currentStep}/14)` : "START AUTOMATED DEMO"}</span>
          </button>

          <button
            onClick={resetDemoScenario}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 text-xs font-mono"
            title="Reset Scenario"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 font-mono">
        <div className="flex justify-between text-xs text-slate-300">
          <span>PROGRESS: {progressPct}%</span>
          <span>STEP {currentStep} OF {totalSteps}</span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Active Step Highlight Card */}
      {demoState && isRunning && (
        <div className="p-4 bg-amber-950/60 border-2 border-amber-500/80 rounded-xl space-y-2 animate-pulse shadow-xl">
          <div className="flex items-center justify-between font-mono text-xs text-amber-400 font-bold">
            <span>ACTIVE STEP #{demoState.step}: {demoState.title}</span>
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black">
              RISK: {demoState.risk_level}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100">
            {demoState.description}
          </p>
          <div className="flex gap-4 font-mono text-xs text-slate-300 pt-1 border-t border-amber-500/40">
            <span>Fog: <strong className="text-amber-400">{demoState.fog_level}%</strong></span>
            <span>Visibility: <strong className="text-cyan-400">{demoState.visibility_m}m</strong></span>
            <span>V103 Speed: <strong className="text-white">{demoState.v103_speed} km/h</strong></span>
            <span>Distance: <strong className="text-rose-400">{demoState.object_distance_m}m</strong></span>
          </div>
        </div>
      )}

      {/* 14-Step Timeline List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
        {demoStepsList.map((st) => {
          const isPast = currentStep > st.num;
          const isCurrent = isRunning && currentStep === st.num;
          return (
            <div
              key={st.num}
              className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 transition-all ${
                isCurrent
                  ? "bg-amber-950/80 border-amber-500 text-amber-200 font-bold shadow-md"
                  : (isPast ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-950 border-slate-800/80 text-slate-300")
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent ? "bg-amber-500 text-slate-950" : (isPast ? "bg-emerald-950 text-emerald-400 border border-emerald-700" : "bg-slate-800 text-slate-400")
                }`}>
                  {st.num}
                </span>
                <span className="truncate max-w-[220px]">{st.title}</span>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-400">Vis: {st.vis}</span>
                <span className={`px-1.5 py-0.5 rounded font-bold ${
                  st.risk === "CRITICAL" ? "bg-rose-950 text-rose-300" : (st.risk === "HIGH RISK" ? "bg-amber-950 text-amber-300" : "bg-emerald-950 text-emerald-300")
                }`}>
                  {st.risk}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
