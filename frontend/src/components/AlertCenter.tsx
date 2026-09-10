import React, { useState } from "react";
import { AlertItem } from "../types/telemetry";
import { AlertTriangle, AlertOctagon, CheckCircle2, ShieldCheck, Filter } from "lucide-react";
import { acknowledgeAlert, resolveAlert } from "../services/api";

interface AlertCenterProps {
  alerts: AlertItem[];
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ alerts }) => {
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === "ALL") return true;
    return a.severity === severityFilter;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return {
          bg: "bg-rose-950/80 border-rose-600 text-rose-200",
          icon: AlertOctagon,
          badge: "bg-rose-600 text-white"
        };
      case "HIGH_RISK":
        return {
          bg: "bg-amber-950/80 border-amber-500 text-amber-200",
          icon: AlertTriangle,
          badge: "bg-amber-500 text-slate-950 font-bold"
        };
      case "CAUTION":
        return {
          bg: "bg-yellow-950/50 border-yellow-600 text-yellow-200",
          icon: AlertTriangle,
          badge: "bg-yellow-500 text-slate-950 font-bold"
        };
      default:
        return {
          bg: "bg-slate-900 border-slate-800 text-slate-200",
          icon: ShieldCheck,
          badge: "bg-cyan-600 text-white"
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
            <h2 className="font-bold text-base text-slate-100 uppercase tracking-wider">
              REAL-TIME SAFETY ALERT FEED
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Automated Collision Risk Events & Multi-Sensor Alarm Feed
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-1 text-xs font-mono">
            {["ALL", "CRITICAL", "HIGH_RISK", "CAUTION"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  severityFilter === sev
                    ? "bg-cyan-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sev.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            NO ACTIVE ALERTS MATCHING CRITERIA
          </div>
        ) : (
          filteredAlerts.map((a) => {
            const style = getSeverityBadge(a.severity);
            const Icon = style.icon;
            return (
              <div
                key={a.id}
                className={`p-3.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 transition-all ${style.bg}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${style.badge}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 font-mono text-xs">
                        {a.id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        [{a.timestamp}]
                      </span>
                      <span className="bg-slate-800 text-cyan-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-700">
                        {a.vehicle_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium mt-0.5">
                      {a.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!a.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(a.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  <button
                    onClick={() => resolveAlert(a.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-mono border border-emerald-700 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
