import React from "react";
import { V2VPacket } from "../types/telemetry";
import { Radio, Wifi } from "lucide-react";

interface V2VPanelProps {
  packets: V2VPacket[];
}

export const V2VPanel: React.FC<V2VPanelProps> = ({ packets }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h2 className="font-bold text-base text-slate-100 uppercase tracking-wider">
              VEHICLE-TO-VEHICLE (V2V) BROADCAST STREAM
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Dedicated Short-Range Communications (DSRC / C-V2X 5.9 GHz Telemetry Packets)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded border border-emerald-700">
          <Wifi className="w-4 h-4" />
          <span>V2V MESH ACTIVE (10 Hz)</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {packets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            WAITING FOR V2V PACKETS...
          </div>
        ) : (
          packets.map((p) => (
            <div
              key={p.packet_id}
              className="p-3 bg-slate-950 border border-slate-800 rounded-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-cyan-400">{p.packet_id}</span>
                <span className="text-slate-500">[{p.timestamp}]</span>
                <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-bold">
                  {p.sender_id} ({p.vehicle_type})
                </span>
              </div>

              <div className="flex items-center gap-4 text-slate-300">
                <span>Speed: <strong className="text-white">{p.speed_kmh} km/h</strong></span>
                <span>Pos: ({p.position.x}, {p.position.y})</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.safety_status === "CRITICAL"
                    ? "bg-rose-950 text-rose-300 border border-rose-600"
                    : (p.safety_status === "HIGH_RISK" ? "bg-amber-950 text-amber-300" : "bg-emerald-950 text-emerald-300")
                }`}>
                  {p.safety_status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
