import { BRANDS, LOCATIONS, SENSOR_LABELS } from "../constants/robots";
import { gaussian, clamp } from "./math";

export function healthToStatus(h) {
  return h >= 75 ? "nominal" : h >= 50 ? "watch" : "alert";
}

export function makeRobot(id) {
  const health = Math.round(clamp(gaussian(85, 6), 72, 98));
  return {
    id,
    name: `${BRANDS[id % BRANDS.length].split(" ")[0]}-${String(id + 1).padStart(2, "0")}`,
    brand: BRANDS[id % BRANDS.length],
    location: LOCATIONS[id % LOCATIONS.length],
    health,
    status: "nominal",
    layer: null,
    failureType: null,
    scenario: null,
    daysToFailure: null,
    simulationStep: 0,
    isSimulating: false,
    sensors: SENSOR_LABELS.map(label => ({ label, value: Math.round(gaussian(83, 7)), anomaly: false })),
    uptime: (97 + Math.random() * 2.5).toFixed(1),
    lastSync: "2s ago",
  };
}
