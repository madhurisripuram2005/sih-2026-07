import React from "react";
import { SensorData, Vehicle } from "../types/telemetry";
import { Sliders, Eye, Radio, Flame, Navigation, Cpu, ArrowRight } from "lucide-react";

interface SensorFusionPanelProps {
  sensorData?: SensorData;
  vehicle: Vehicle;
  fogLevel: number;
}

export const SensorFusionPanel: React.FC<SensorFusionPanelProps> = ({
  sensorData,
  vehicle,
  fogLevel,
}) => {
  const sensors = sensorData?.sensors || vehicle.sensor_fusion?.sensors;
  const fusionResult = sensorData?.sensor_fusion_result || vehicle.sensor_fusion?.sensor_fusion_result;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-base text-slate-100 uppercase tracking-wider">
              MULTI-SENSOR FUSION & PERCEPTION PIPELINE
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Redundant Sensing Architecture for <strong className="text-cyan-300">{vehicle.id} ({vehicle.name})</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-cyan-950 text-cyan-300 font-mono text-xs px-2.5 py-1 rounded border border-cyan-500/50 font-bold">
            INSPECTING: {vehicle.id}
          </span>
          <span className="bg-slate-950 px-3 py-1 rounded border border-amber-500/40 text-amber-400 text-xs font-mono">
            ⚠️ SIMULATED SENSOR DATA
          </span>
        </div>
      </div>

      {/* Sensor Pipeline Flow Diagram */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
        <div className="text-xs font-mono text-cyan-400 mb-3 uppercase font-bold">
          PERCEPTION FUSION PIPELINE — VEHICLE: {vehicle.id} ({vehicle.type})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center text-xs font-mono">
          {/* Sensors Group */}
          <div className="space-y-2 bg-slate-900 p-2.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">PHYSICAL SENSORS</div>
            <div className="text-slate-200">RGB Camera ({vehicle.id})</div>
            <div className="text-slate-200">77GHz mmWave Radar</div>
            <div className="text-slate-200">FLIR Thermal IR</div>
            <div className="text-slate-200">RTK GPS & IMU</div>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-600 justify-self-center hidden md:block" />

          {/* Fusion Node */}
          <div className="bg-cyan-950/60 p-3 rounded border border-cyan-500/50 text-cyan-200">
            <Cpu className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
            <div className="font-bold">SENSOR FUSION NODE</div>
            <div className="text-[10px] text-cyan-300 mt-1">Weighted Bayesian Filtering</div>
          </div>

          <ArrowRight className="w-6 h-6 text-slate-600 justify-self-center hidden md:block" />

          {/* Risk Engine */}
          <div className="bg-amber-950/60 p-3 rounded border border-amber-500/50 text-amber-200">
            <Sliders className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <div className="font-bold">COLLISION RISK ENGINE</div>
            <div className="text-[10px] text-amber-300 mt-1">Dynamic Stopping Math ({vehicle.mass_tonnes}t)</div>
          </div>
        </div>
      </div>

      {/* Individual Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* RGB Camera */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-200">RGB CAMERA ({vehicle.id})</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">
            {sensors?.camera.confidence_percent || 90}%
          </div>
          <div className="text-xs font-mono text-slate-400">
            Confidence (Decays in Fog)
          </div>
          <div className="text-[11px] font-mono text-slate-300">
            Status: <span className={sensors?.camera.is_blinded ? "text-rose-400 font-bold" : "text-emerald-400"}>
              {sensors?.camera.status || "Active"}
            </span>
          </div>
        </div>

        {/* mmWave Radar */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-200">mmWAVE RADAR</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {sensors?.radar.confidence_percent || 94}%
          </div>
          <div className="text-xs font-mono text-slate-400">
            Target Range: {sensors?.radar.detected_distance_m || 14.5}m
          </div>
          <div className="text-[11px] font-mono text-emerald-300">
            Status: {sensors?.radar.status || "Penetrating Fog"}
          </div>
        </div>

        {/* Thermal IR */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-200">THERMAL IR</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {sensors?.thermal.confidence_percent || 88}%
          </div>
          <div className="text-xs font-mono text-slate-400">
            Heat Signature Tracking
          </div>
          <div className="text-[11px] font-mono text-amber-300">
            Status: {sensors?.thermal.status || "Active"}
          </div>
        </div>

        {/* RTK GPS */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-200">RTK DGPS / IMU</span>
            <Navigation className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-400">
            {sensors?.gps.confidence_percent || 96}%
          </div>
          <div className="text-xs font-mono text-slate-400">
            Accuracy: ±{sensors?.gps.accuracy_m || 0.6}m
          </div>
          <div className="text-[11px] font-mono text-blue-300">
            Status: {sensors?.gps.status || "RTK Fix"}
          </div>
        </div>
      </div>

      {/* Fusion Summary Footer */}
      <div className="bg-cyan-950/40 border border-cyan-500/40 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
            COMBINED FUSION CONFIDENCE ({vehicle.id})
          </div>
          <div className="text-2xl font-black font-mono text-slate-50">
            {fusionResult?.fused_confidence_percent || 96}%
          </div>
        </div>

        <div>
          <div className="text-xs font-mono text-slate-400 uppercase">
            PRIMARY USABLE SENSORS
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">
            {fusionResult?.primary_active_sensor || "Radar + Thermal IR"}
          </div>
        </div>

        <div>
          <div className="text-xs font-mono text-slate-400 uppercase">
            FUSED OBSTACLE DISTANCE
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">
            {fusionResult?.fused_distance_m || 11.8} m
          </div>
        </div>
      </div>
    </div>
  );
};
