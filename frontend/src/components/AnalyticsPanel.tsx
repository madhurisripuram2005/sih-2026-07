import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { BarChart3 } from "lucide-react";

export const AnalyticsPanel: React.FC = () => {
  // Simulated analytics data
  const visibilityTrendData = [
    { time: "08:00", fog: 10, visibility: 42, avgSpeed: 34 },
    { time: "09:00", fog: 25, visibility: 30, avgSpeed: 31 },
    { time: "10:00", fog: 65, visibility: 12, avgSpeed: 24 },
    { time: "11:00", fog: 90, visibility: 4, avgSpeed: 16 },
    { time: "12:00", fog: 85, visibility: 5, avgSpeed: 18 },
    { time: "13:00", fog: 40, visibility: 22, avgSpeed: 28 },
    { time: "14:00", fog: 15, visibility: 40, avgSpeed: 33 },
  ];

  const sensorDegradationData = [
    { fogLevel: "0%", camera: 95, radar: 96, thermal: 92 },
    { fogLevel: "20%", camera: 80, radar: 95, thermal: 90 },
    { fogLevel: "40%", camera: 52, radar: 95, thermal: 88 },
    { fogLevel: "60%", camera: 26, radar: 94, thermal: 86 },
    { fogLevel: "80%", camera: 10, radar: 93, thermal: 84 },
    { fogLevel: "100%", camera: 3, radar: 92, thermal: 82 },
  ];

  const incidentsBySeverity = [
    { name: "CAUTION", count: 18 },
    { name: "HIGH RISK", count: 9 },
    { name: "CRITICAL", count: 3 },
    { name: "RESOLVED", count: 28 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-bold text-base text-slate-100 uppercase tracking-wider">
              SMARTMINE SAFETY & OPERATIONAL ANALYTICS
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Visibility vs Speed Correlation, Sensor Reliability Curves, & Safety Incident Log
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Visibility & Fleet Speed */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
            FOG SEVERITY VS FLEET SPEED TREND
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visibilityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                <Legend />
                <Line type="monotone" dataKey="fog" name="Fog Level (%)" stroke="#F59E0B" strokeWidth={2} />
                <Line type="monotone" dataKey="visibility" name="Visibility (m)" stroke="#06B6D4" strokeWidth={2} />
                <Line type="monotone" dataKey="avgSpeed" name="Avg Speed (km/h)" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sensor Reliability vs Fog */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
            SENSOR DEGRADATION CURVES IN FOG
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorDegradationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="fogLevel" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                <Legend />
                <Line type="monotone" dataKey="camera" name="RGB Camera (%)" stroke="#EF4444" strokeWidth={2.5} />
                <Line type="monotone" dataKey="radar" name="mmWave Radar (%)" stroke="#10B981" strokeWidth={2.5} />
                <Line type="monotone" dataKey="thermal" name="Thermal IR (%)" stroke="#F59E0B" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incident Severity */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 lg:col-span-2">
          <div className="text-xs font-mono text-amber-400 font-bold uppercase">
            COLLISION ALERTS BY SEVERITY (TODAY)
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsBySeverity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                <Bar dataKey="count" name="Alert Count" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
