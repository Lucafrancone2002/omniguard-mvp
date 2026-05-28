import { useState, useEffect } from "react";
import { makeRobot, healthToStatus } from "../utils/robot";
import { gaussian, clamp } from "../utils/math";

export function useSimulation() {
  const [robots, setRobots] = useState(() => Array.from({ length: 12 }, (_, i) => makeRobot(i)));
  const [simLog, setSimLog] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [tick, setTick] = useState(0);

  const addLog = (msg, type = "info") =>
    setSimLog(prev => [...prev.slice(-30), { msg, type, time: new Date().toLocaleTimeString() }]);

  // Live noise — aggiorna sensori e health ogni 2.5s su robot non in simulazione
  useEffect(() => {
    const iv = setInterval(() => {
      setRobots(prev => prev.map(r => {
        if (r.isSimulating) return r;
        return {
          ...r,
          health: Math.round(clamp(r.health + gaussian(0, 0.6), 15, 99)),
          lastSync: `${Math.floor(Math.random() * 9) + 1}s ago`,
          sensors: r.sensors.map(s => ({
            ...s,
            value: Math.round(clamp(s.value + gaussian(0, 1.2), 0, 100)),
          })),
        };
      }));
      setLastUpdate(new Date());
      setTick(t => t + 1);
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const startSimulation = (robot, scenario) => {
    addLog(`▶ Simulation started — ${robot.name} · ${scenario.label}`, "info");
    addLog(`📡 Monitoring ${scenario.affectedSensors.join(", ")}`, "info");

    setRobots(prev => prev.map(r => r.id !== robot.id ? r : {
      ...r,
      isSimulating: true,
      scenario: scenario.id,
      layer: scenario.layer,
      failureType: scenario.label,
      simulationStep: 0,
    }));

    let step = 0;
    const iv = setInterval(() => {
      step++;
      const progress = step / 18;

      setRobots(prev => prev.map(r => {
        if (r.id !== robot.id) return r;
        const newHealth = Math.round(Math.max(12, r.health - scenario.degradeRate * (1 + progress)));
        const newSensors = r.sensors.map(s => ({
          ...s,
          value: Math.round(clamp(
            s.value
              - (scenario.affectedSensors.includes(s.label) ? scenario.degradeRate * 2.5 * progress : 0)
              + gaussian(0, 0.8),
            5, 100
          )),
          anomaly: scenario.affectedSensors.includes(s.label) && progress > 0.3,
        }));
        const daysLeft = Math.round(Math.max(2, 28 * (1 - progress)));

        if (step === 3)  addLog(`🔍 ${scenario.affectedSensors[0]} diverging from baseline`, "detect");
        if (step === 6)  addLog(`⚠ Anomaly signature confirmed: ${scenario.label}`, "warn");
        if (step === 9)  addLog(`📊 Health dropping: ${newHealth}/100 — status: ${healthToStatus(newHealth).toUpperCase()}`, "warn");
        if (step === 12) addLog(`🚨 ALERT — Predicted failure in ~${daysLeft} days — XAI ready`, "alert");
        if (step === 15) addLog(`🛡 Recommendation: schedule maintenance for ${r.name}`, "detect");

        return {
          ...r,
          health: newHealth,
          status: healthToStatus(newHealth),
          sensors: newSensors,
          daysToFailure: daysLeft,
          simulationStep: step,
          lastSync: "live",
        };
      }));

      if (step >= 18) {
        clearInterval(iv);
        addLog(`✅ Simulation complete — failure detected in advance`, "detect");
        setRobots(prev => prev.map(r => r.id !== robot.id ? r : { ...r, isSimulating: false }));
      }
    }, 600);
  };

  const resetRobot = (id) => {
    setRobots(prev => prev.map(r => r.id !== id ? r : makeRobot(id)));
    addLog("↩ Robot reset", "info");
  };

  return { robots, simLog, lastUpdate, tick, startSimulation, resetRobot };
}
