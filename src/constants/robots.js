export const BRANDS = ["Unitree G1", "UBTECH Walker S1", "AgiBot A2"];

export const LOCATIONS = [
  "Assembly Line A",
  "Assembly Line B",
  "Logistics Hub",
  "Quality Control",
  "Warehouse",
];

export const SENSOR_LABELS = [
  "Joint Torque",
  "Battery Health",
  "Thermal °C",
  "IMU Drift",
  "Motor Load",
  "Packet Loss",
];

export const BODY_PARTS = [
  { id: "head",     label: "Head / Vision",      sensors: ["IMU Drift"],                       icon: "👁"  },
  { id: "torso",    label: "Torso / Controller",  sensors: ["Motor Load", "Packet Loss"],       icon: "⚡"  },
  { id: "leftArm",  label: "Left Arm",            sensors: ["Joint Torque"],                    icon: "🦾" },
  { id: "rightArm", label: "Right Arm",           sensors: ["Joint Torque", "Motor Load"],      icon: "🦾" },
  { id: "battery",  label: "Battery Pack",        sensors: ["Battery Health", "Thermal °C"],   icon: "🔋" },
  { id: "leftLeg",  label: "Left Leg",            sensors: ["Joint Torque", "Motor Load"],      icon: "🦿" },
  { id: "rightLeg", label: "Right Leg",           sensors: ["Joint Torque", "IMU Drift"],       icon: "🦿" },
  { id: "network",  label: "Network / 5G",        sensors: ["Packet Loss"],                     icon: "📡" },
];
