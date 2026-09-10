import React, { useState, useEffect } from "react";
import { TelemetryPayload, Vehicle } from "./types/telemetry";
import { telemetryService } from "./services/api";

import { Header } from "./components/Header";
import { MineMapCanvas } from "./components/MineMapCanvas";
import { CameraFeedVisualizer } from "./components/CameraFeedVisualizer";
import { DriverHUD } from "./components/DriverHUD";
import { FleetTable } from "./components/FleetTable";
import { AlertCenter } from "./components/AlertCenter";
import { SensorFusionPanel } from "./components/SensorFusionPanel";
import { V2VPanel } from "./components/V2VPanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { DigitalTwinView } from "./components/DigitalTwinView";
import { DemoTimelineModal } from "./components/DemoTimelineModal";
import { AboutSolutionModal } from "./components/AboutSolutionModal";

export function App() {
  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("V103");

  useEffect(() => {
    // Establish WebSocket connection
    telemetryService.connect();
    const unsubscribe = telemetryService.subscribe((payload) => {
      setTelemetry(payload);
    });
    return () => unsubscribe();
  }, []);

  const defaultVehicle: Vehicle = {
    id: "V103",
    name: "CAT 789D Primary Dumper",
    type: "Dumper",
    x: 48.0,
    y: 34.0,
    speed_kmh: 28.0,
    heading_deg: 85.0,
    status: "HOST_VEHICLE",
    mass_tonnes: 110.0,
    battery_health: 99.0
  };

  const vehicles: Vehicle[] = telemetry?.vehicles || [defaultVehicle];

  // Dynamic Selected Vehicle: Derives live telemetry for selectedVehicleId directly from latest WebSocket payload
  const selectedVehicle: Vehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || defaultVehicle;

  const fogLevel = telemetry?.fog.level_percent || 15.0;
  const isDemoActive = telemetry?.demo_state?.is_active || false;
  const demoStep = telemetry?.demo_state?.current_step_number || 1;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans flex flex-col">
      {/* Header with Global Selected Vehicle Indicator & Selector */}
      <Header
        kpis={telemetry?.kpis}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        isDemoActive={isDemoActive}
        demoStep={demoStep}
        selectedVehicle={selectedVehicle}
        vehicles={vehicles}
        onSelectVehicle={setSelectedVehicleId}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 space-y-4">
        {/* Banner if Demo Mode is active */}
        {isDemoActive && (
          <div className="mb-2">
            <DemoTimelineModal demoState={telemetry?.demo_state} />
          </div>
        )}

        {/* Tab 1: Command Center Main Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Live Mine Map (7 cols) */}
              <div className="lg:col-span-7 h-[500px]">
                <MineMapCanvas
                  vehicles={vehicles}
                  fogLevel={fogLevel}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={setSelectedVehicleId}
                />
              </div>

              {/* Right Column: AI Front Camera Visualizer (5 cols) */}
              <div className="lg:col-span-5 h-[500px]">
                <CameraFeedVisualizer
                  hostVehicle={selectedVehicle}
                  fogLevel={fogLevel}
                />
              </div>
            </div>

            {/* Bottom Row: Alert Feed & Fleet Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5">
                <AlertCenter alerts={telemetry?.alerts || []} />
              </div>
              <div className="lg:col-span-7">
                <FleetTable
                  vehicles={vehicles}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={setSelectedVehicleId}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Driver Assistance HUD */}
        {activeTab === "driver_hud" && (
          <DriverHUD
            vehicle={selectedVehicle}
            fogLevel={fogLevel}
            audioEnabled={audioEnabled}
          />
        )}

        {/* Tab 3: AI Vision Monitor */}
        {activeTab === "camera_vision" && (
          <div className="h-[650px]">
            <CameraFeedVisualizer
              hostVehicle={selectedVehicle}
              fogLevel={fogLevel}
            />
          </div>
        )}

        {/* Tab 4: Sensor Fusion Panel */}
        {activeTab === "sensor_fusion" && (
          <SensorFusionPanel
            sensorData={selectedVehicle.sensor_fusion}
            vehicle={selectedVehicle}
            fogLevel={fogLevel}
          />
        )}

        {/* Tab 5: Fleet Telemetry */}
        {activeTab === "fleet" && (
          <FleetTable
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
          />
        )}

        {/* Tab 6: Alert Feed */}
        {activeTab === "alerts" && (
          <AlertCenter alerts={telemetry?.alerts || []} />
        )}

        {/* Tab 7: V2V Stream */}
        {activeTab === "v2v" && (
          <V2VPanel packets={telemetry?.v2v_broadcasts || []} />
        )}

        {/* Tab 8: Analytics */}
        {activeTab === "analytics" && (
          <AnalyticsPanel />
        )}

        {/* Tab 9: Digital Twin */}
        {activeTab === "digital_twin" && (
          <DigitalTwinView
            vehicles={vehicles}
            fogLevel={fogLevel}
          />
        )}

        {/* Tab 10: About Solution */}
        {activeTab === "about" && (
          <AboutSolutionModal />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-2.5 text-center text-xs font-mono text-slate-400">
        SMARTMINE — AI-Powered Fog Safety & Mine Vehicle Collision Avoidance System | NMDC Problem Statement 26007 | Selected Vehicle: <strong className="text-cyan-300">{selectedVehicle.id} ({selectedVehicle.name})</strong>
      </footer>
    </div>
  );
}

export default App;
