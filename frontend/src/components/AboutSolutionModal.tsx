import React from "react";
import { HelpCircle, Cpu, Radio, ShieldCheck, Layers, Cpu as Chip } from "lucide-react";

export const AboutSolutionModal: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 shadow-xl max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-600/20 border border-cyan-500/40 rounded-xl text-cyan-400">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-50 uppercase tracking-wide">
                SMARTMINE — PROOF OF CONCEPT OVERVIEW
              </h2>
              <span className="bg-cyan-950 text-cyan-300 font-mono text-xs px-2.5 py-0.5 rounded border border-cyan-500/40">
                PROBLEM ID: 26007
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              NMDC Hackathon: Safe & Efficient Operation of Mine Vehicles in Fog & Low-Visibility Conditions in Open Cast Iron Ore Mines
            </p>
          </div>
        </div>
      </div>

      {/* Problem & Solution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Problem Breakdown */}
        <div className="bg-rose-950/30 border border-rose-600/40 p-4 rounded-xl space-y-2">
          <div className="font-bold text-rose-400 uppercase text-sm flex items-center gap-2">
            <span>🔴 THE MINING PROBLEM</span>
          </div>
          <p className="text-slate-200 leading-relaxed">
            During heavy winter mornings and monsoon thermal inversions, dense fog reduces haul-road visibility in open-cast iron ore mines down to <strong>3 to 5 meters</strong>.
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-1 pt-1">
            <li>Human dumper operators cannot visually see slow-moving excavators or workers.</li>
            <li>Heavy haul trucks (85t–120t payload) require 15m–25m stopping distance at 30 km/h.</li>
            <li>High risk of catastrophic collisions and complete haulage shutdown.</li>
          </ul>
        </div>

        {/* SMARTMINE Solution */}
        <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl space-y-2">
          <div className="font-bold text-emerald-400 uppercase text-sm flex items-center gap-2">
            <span>🟢 THE SMARTMINE SOLUTION</span>
          </div>
          <p className="text-slate-200 leading-relaxed">
            A multi-sensor redundant perception and V2V network integrated with an AI Collision Risk Engine and Central Command Center.
          </p>
          <ul className="list-disc list-inside text-slate-300 space-y-1 pt-1">
            <li><strong>RGB Camera + YOLO AI:</strong> Classifies objects when visible.</li>
            <li><strong>77 GHz mmWave Radar:</strong> Pierces dense fog particles without loss of range.</li>
            <li><strong>FLIR Thermal IR:</strong> Detects engine and human body heat signatures.</li>
            <li><strong>V2V Mesh (5.9 GHz):</strong> Broadcasts 10Hz position vectors between fleet vehicles.</li>
          </ul>
        </div>
      </div>

      {/* Hardware Implementation Roadmap */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
        <div className="font-bold text-cyan-400 uppercase text-sm flex items-center gap-2">
          <Chip className="w-5 h-5" />
          <span>REAL-HARDWARE INTEGRATION ROADMAP FOR DEPLOYMENT</span>
        </div>
        <p className="text-slate-300">
          This prototype demonstrates the software architecture and perception logic. In production, physical hardware modules can be directly interfaced:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <div className="font-bold text-slate-200">1. Edge Processing</div>
            <div className="text-slate-400 text-[11px] mt-0.5">NVIDIA Jetson Orin Nano / AGX Orin for real-time OpenCV & TensorRT inference.</div>
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <div className="font-bold text-slate-200">2. mmWave Radar</div>
            <div className="text-slate-400 text-[11px] mt-0.5">77-79 GHz automotive FMCW Radar over CAN Bus (ISO 11898).</div>
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <div className="font-bold text-slate-200">3. Thermal IR Camera</div>
            <div className="text-slate-400 text-[11px] mt-0.5">FLIR Boson LWIR Thermal core connected via GMSL2 / Ethernet.</div>
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <div className="font-bold text-slate-200">4. V2V Hardware</div>
            <div className="text-slate-400 text-[11px] mt-0.5">Cohda Wireless / Quectel C-V2X 5.9 GHz DSRC Transceiver.</div>
          </div>
        </div>
      </div>

      {/* Prototype & Certification Disclaimer */}
      <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 text-amber-300 font-mono text-xs">
        <strong>⚠️ HACKATHON PROTOTYPE DISCLAIMER:</strong> This application utilizes simulated sensor streams and simplified physics models to demonstrate proof-of-concept feasibility for NMDC Problem Statement 26007. Real-world mine vehicle deployment requires ISO 26262 functional safety certification and extensive field validation.
      </div>
    </div>
  );
};
