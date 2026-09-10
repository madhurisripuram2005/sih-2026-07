class DemoScenarioRunner:
    def __init__(self):
        self.is_active = False
        self.current_step = 0
        self.total_steps = 14
        self.step_timer = 0.0
        self.step_duration = 3.0  # 3 seconds per step for clean hackathon presentation

        self.steps_data = [
            {
                "step": 1,
                "title": "Normal Mine Operation",
                "description": "Clear weather conditions across open-cast haul roads. Fleet operating at nominal speeds.",
                "fog_level": 5.0,
                "visibility_m": 45.0,
                "v103_speed": 34.0,
                "object_distance_m": 85.0,
                "object_type": "Dumper",
                "risk_level": "SAFE",
                "alert_triggered": False
            },
            {
                "step": 2,
                "title": "Fog Begins to Accumulate",
                "description": "Thermal moisture inversion creates localized fog pockets near Pit Ramp B.",
                "fog_level": 30.0,
                "visibility_m": 24.0,
                "v103_speed": 32.0,
                "object_distance_m": 60.0,
                "object_type": "Dumper",
                "risk_level": "SAFE",
                "alert_triggered": False
            },
            {
                "step": 3,
                "title": "Visibility Decreases",
                "description": "Fog density rises sharply across Main Haul Road Segment 2. Driver visibility drops.",
                "fog_level": 60.0,
                "visibility_m": 11.0,
                "v103_speed": 29.0,
                "object_distance_m": 35.0,
                "object_type": "Dumper",
                "risk_level": "CAUTION",
                "alert_triggered": True
            },
            {
                "step": 4,
                "title": "Dumper V103 Enters Dense Fog Zone",
                "description": "Dumper V103 enters severe fog bank. Ambient light scattering blinds human driver.",
                "fog_level": 85.0,
                "visibility_m": 4.2,
                "v103_speed": 28.0,
                "object_distance_m": 22.0,
                "object_type": "Dumper",
                "risk_level": "CAUTION",
                "alert_triggered": True
            },
            {
                "step": 5,
                "title": "RGB Camera Confidence Drops",
                "description": "Visual front camera confidence plummets from 94% to 18%. Optical sensing blinded.",
                "fog_level": 88.0,
                "visibility_m": 3.8,
                "v103_speed": 28.0,
                "object_distance_m": 18.0,
                "object_type": "Dumper",
                "risk_level": "HIGH_RISK",
                "alert_triggered": True
            },
            {
                "step": 6,
                "title": "mmWave Radar Detects Obstacle",
                "description": "77 GHz mmWave Radar pierces dense fog particles, picking up echo at 16.5m (94% conf).",
                "fog_level": 90.0,
                "visibility_m": 3.5,
                "v103_speed": 28.0,
                "object_distance_m": 16.5,
                "object_type": "Dumper",
                "risk_level": "HIGH_RISK",
                "alert_triggered": True
            },
            {
                "step": 7,
                "title": "Thermal IR Camera Confirms Heat Signature",
                "description": "FLIR Thermal sensor identifies engine heat signature of Dumper V102 & worker near road.",
                "fog_level": 90.0,
                "visibility_m": 3.5,
                "v103_speed": 28.0,
                "object_distance_m": 14.0,
                "object_type": "Worker",
                "risk_level": "HIGH_RISK",
                "alert_triggered": True
            },
            {
                "step": 8,
                "title": "Sensor Fusion Confirms Target Position",
                "description": "Sensor Fusion Engine merges Radar + Thermal + V2V signals. Unified obstacle distance: 11.8m.",
                "fog_level": 90.0,
                "visibility_m": 3.5,
                "v103_speed": 28.0,
                "object_distance_m": 11.8,
                "object_type": "Dumper",
                "risk_level": "CRITICAL",
                "alert_triggered": True
            },
            {
                "step": 9,
                "title": "Collision Risk Jumps to CRITICAL",
                "description": "Physics Risk Engine calculates stopping distance (14.2m @ 28 km/h). Distance (11.8m) < Stopping Distance!",
                "fog_level": 90.0,
                "visibility_m": 3.5,
                "v103_speed": 28.0,
                "object_distance_m": 11.8,
                "object_type": "Dumper",
                "risk_level": "CRITICAL",
                "alert_triggered": True
            },
            {
                "step": 10,
                "title": "Driver HUD Displays Visual & Speech Warning",
                "description": "In-cab Driver Assistance HUD flashes RED alert. Voice synthesizer: 'CRITICAL COLLISION RISK! VEHICLE AHEAD 11.8 METERS!'",
                "fog_level": 90.0,
                "visibility_m": 3.5,
                "v103_speed": 28.0,
                "object_distance_m": 11.8,
                "object_type": "Dumper",
                "risk_level": "CRITICAL",
                "alert_triggered": True
            },
            {
                "step": 11,
                "title": "Control Room Receives Critical Red Alert",
                "description": "SmartMine Command Center receives immediate telemetry alert #ALT-1093. Vehicle highlighted on map.",
                "fog_level": 90.0,
                "visibility_m": 3.5,
                "v103_speed": 28.0,
                "object_distance_m": 11.8,
                "object_type": "Dumper",
                "risk_level": "CRITICAL",
                "alert_triggered": True
            },
            {
                "step": 12,
                "title": "Driver Applies Retarder & Vehicle Slows",
                "description": "Operator responds to directive 'APPLY RETARDER'. Vehicle decelerates safely to 10 km/h.",
                "fog_level": 90.0,
                "visibility_m": 3.5,
                "v103_speed": 10.0,
                "object_distance_m": 14.5,
                "object_type": "Dumper",
                "risk_level": "CAUTION",
                "alert_triggered": True
            },
            {
                "step": 13,
                "title": "Vehicle Ahead Moves & Distance Opens",
                "description": "Preceding Dumper V102 advances past intersection. Following distance increases to 26.0m.",
                "fog_level": 70.0,
                "visibility_m": 8.0,
                "v103_speed": 15.0,
                "object_distance_m": 26.0,
                "object_type": "Dumper",
                "risk_level": "SAFE",
                "alert_triggered": False
            },
            {
                "step": 14,
                "title": "System Normalizes & Hazard Cleared",
                "description": "Fog clears. All telemetry normalized. Critical event logged for safety audit compliance.",
                "fog_level": 10.0,
                "visibility_m": 40.0,
                "v103_speed": 25.0,
                "object_distance_m": 70.0,
                "object_type": "Dumper",
                "risk_level": "SAFE",
                "alert_triggered": False
            }
        ]

    def start_demo(self):
        self.is_active = True
        self.current_step = 0
        self.step_timer = 0.0

    def reset_demo(self):
        self.is_active = False
        self.current_step = 0
        self.step_timer = 0.0

    def update(self, delta_time: float) -> dict:
        if not self.is_active:
            return None

        self.step_timer += delta_time
        if self.step_timer >= self.step_duration:
            self.step_timer = 0.0
            self.current_step += 1

            if self.current_step >= len(self.steps_data):
                # Demo complete
                self.is_active = False
                return self.steps_data[-1]

        step_info = self.steps_data[min(self.current_step, len(self.steps_data) - 1)]
        return {
            **step_info,
            "is_active": self.is_active,
            "current_step_number": self.current_step + 1,
            "total_steps": self.total_steps,
            "progress_percent": round(((self.current_step + 1) / self.total_steps) * 100.0, 1)
        }
