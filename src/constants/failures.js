import { C } from "./theme";

export const FAILURE_SCENARIOS = [
  {
    id: "actuator", label: "Actuator Wear", layer: "hardware",
    description: "Progressive joint torque degradation in left knee joint.",
    affectedSensors: ["Joint Torque", "Motor Load"],
    degradeRate: 3.5, color: C.layerHw,
  },
  {
    id: "battery", label: "Battery Degradation", layer: "hardware",
    description: "Cell capacity drop in battery module 3 — thermal anomaly co-occurring.",
    affectedSensors: ["Battery Health", "Thermal °C"],
    degradeRate: 2.8, color: C.layerHw,
  },
  {
    id: "imu", label: "IMU Sensor Drift", layer: "hardware",
    description: "Inertial measurement unit losing calibration on pitch axis.",
    affectedSensors: ["IMU Drift", "Joint Torque"],
    degradeRate: 2.2, color: C.layerHw,
  },
  {
    id: "gait", label: "Gait Model Drift", layer: "software",
    description: "Control model for locomotion diverging from baseline — no visible malfunction yet.",
    affectedSensors: ["Motor Load", "IMU Drift"],
    degradeRate: 1.8, color: C.layerSw,
  },
  {
    id: "vision", label: "Vision Pipeline Lag", layer: "software",
    description: "Object detection latency spike causing reactive motion delays.",
    affectedSensors: ["Packet Loss", "Motor Load"],
    degradeRate: 2.0, color: C.layerSw,
  },
  {
    id: "network", label: "Comm Latency Spike", layer: "network",
    description: "5G handoff failure causing fleet coordination desync — cascade risk.",
    affectedSensors: ["Packet Loss", "Battery Health"],
    degradeRate: 3.0, color: C.layerNet,
  },
];
