import React, { useState } from "react";
import { Vehicle } from "../types/telemetry";
import { Truck, Battery, Search, Eye } from "lucide-react";

interface FleetTableProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vId: string) => void;
}

export const FleetTable: React.FC<FleetTableProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || v.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getBadgeClass = (riskLevel: string = "SAFE") => {
    switch (riskLevel) {
      case "CRITICAL":
        return "bg-rose-950 text-rose-300 border-rose-600 animate-pulse";
      case "HIGH_RISK":
        return "bg-amber-950 text-amber-300 border-amber-500";
      case "CAUTION":
        return "bg-yellow-950 text-yellow-300 border-yellow-600";
      default:
        return "bg-emerald-950 text-emerald-300 border-emerald-600";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 shadow-xl">
      {/* Table Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-base text-slate-100 uppercase tracking-wider">
              SMARTMINE FLEET TELEMETRY MONITOR
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Real-Time Vehicle Tracking, Collision Risk States, & Battery Diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search vehicle ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Types</option>
            <option value="Dumper">Dumpers</option>
            <option value="Excavator">Excavators</option>
            <option value="Light Vehicle">Light Vehicles</option>
            <option value="Water Tanker">Water Tankers</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <th className="p-3">Vehicle ID</th>
              <th className="p-3">Model / Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Live Speed</th>
              <th className="p-3">Location (GPS)</th>
              <th className="p-3">Mass</th>
              <th className="p-3">Collision Risk</th>
              <th className="p-3">Health</th>
              <th className="p-3 text-right">Selection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredVehicles.map((v) => {
              const isSelected = v.id === selectedVehicleId;
              const riskLevel = v.risk?.risk_level || "SAFE";
              return (
                <tr
                  key={v.id}
                  onClick={() => onSelectVehicle(v.id)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-cyan-950/60 text-white border-l-4 border-l-cyan-400"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <td className="p-3 font-bold flex items-center gap-2">
                    <span className={isSelected ? "text-cyan-300 font-black text-sm" : "text-cyan-400"}>
                      {v.id}
                    </span>
                    {isSelected && (
                      <span className="bg-cyan-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-slate-200">{v.name}</td>
                  <td className="p-3 text-slate-300">{v.type}</td>
                  <td className="p-3 font-bold text-slate-100">{v.speed_kmh.toFixed(1)} km/h</td>
                  <td className="p-3 text-slate-400">
                    X: {v.x.toFixed(1)}, Y: {v.y.toFixed(1)}
                  </td>
                  <td className="p-3 text-slate-400">{v.mass_tonnes} t</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getBadgeClass(riskLevel)}`}>
                      {riskLevel}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Battery className="w-4 h-4" />
                      <span>{v.battery_health}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVehicle(v.id);
                      }}
                      className={`px-3 py-1 rounded text-xs font-mono border transition-all flex items-center gap-1 ml-auto ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md"
                          : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isSelected ? "INSPECTING" : "Inspect"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
