import { useState, useEffect, useRef } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const BRANDS = ["Unitree G1", "UBTECH Walker S1", "AgiBot A2"];
const LOCATIONS = ["Assembly Line A", "Assembly Line B", "Logistics Hub", "Quality Control", "Warehouse"];

const FAILURE_SCENARIOS = [
  {
    id: "actuator",
    label: "Actuator Wear",
    layer: "hardware",
    description: "Progressive joint torque degradation in left knee — classic mechanical wear pattern.",
    affectedSensors: ["Joint Torque", "Motor Load"],
    degradeRate: 3.5,
    color: "#e07b2a",
  },
  {
    id: "battery",
    label: "Battery Degradation",
    layer: "hardware",
    description: "Cell capacity drop in battery module 3 — thermal anomaly co-occurring.",
    affectedSensors: ["Battery Health", "Thermal Δ"],
    degradeRate: 2.8,
    color: "#e07b2a",
  },
  {
    id: "imu",
    label: "IMU Sensor Drift",
    layer: "hardware",
    description: "Inertial measurement unit losing calibration on pitch axis.",
    affectedSensors: ["IMU Drift", "Joint Torque"],
    degradeRate: 2.2,
    color: "#e07b2a",
  },
  {
    id: "gait",
    label: "Gait Model Drift",
    layer: "software",
    description: "Control model for locomotion diverging from baseline — no visible malfunction yet.",
    affectedSensors: ["Motor Load", "IMU Drift"],
    degradeRate: 1.8,
    color: "#7c5fc7",
  },
  {
    id: "vision",
    label: "Vision Pipeline Lag",
    layer: "software",
    description: "Object detection latency spike causing reactive motion delays.",
    affectedSensors: ["Packet Loss", "Motor Load"],
    degradeRate: 2.0,
    color: "#7c5fc7",
  },
  {
    id: "network",
    label: "Comm Latency Spike",
    layer: "network",
    description: "5G handoff failure causing fleet coordination desync — cascade risk.",
    affectedSensors: ["Packet Loss", "Battery Health"],
    degradeRate: 3.0,
    color: "#1a9ed4",
  },
];

const SENSOR_LABELS = ["Joint Torque", "Battery Health", "Thermal Δ", "IMU Drift", "Motor Load", "Packet Loss"];

const C = {
  bg: "#f7f8fa", surface: "#ffffff", border: "#e4e8ef",
  text: "#1a2233", muted: "#7a8599", accent: "#1a9ed4",
  green: "#18a96a", yellow: "#e6a817", red: "#d94040",
  layerHw: "#e07b2a", layerSw: "#7c5fc7", layerNet: "#1a9ed4",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function gaussian(mean, std) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function healthToStatus(h) {
  return h >= 75 ? "nominal" : h >= 50 ? "watch" : "alert";
}

function makeRobot(id) {
  const health = Math.round(Math.max(72, Math.min(98, gaussian(85, 6))));
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
    sensors: SENSOR_LABELS.map(label => ({ label, value: Math.round(gaussian(82, 8)), anomaly: false })),
    uptime: (97 + Math.random() * 2.5).toFixed(1),
    lastSync: "2s ago",
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const col = status === "nominal" ? C.green : status === "watch" ? C.yellow : C.red;
  return <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:col, marginRight:5, flexShrink:0, boxShadow:`0 0 0 3px ${col}22` }} />;
}

function HealthBar({ value }) {
  const col = value >= 75 ? C.green : value >= 50 ? C.yellow : C.red;
  return (
    <div style={{ width:"100%", height:5, background:"#eaecf0", borderRadius:3, overflow:"hidden" }}>
      <div style={{ width:`${value}%`, height:"100%", background:col, borderRadius:3, transition:"width 0.6s ease" }} />
    </div>
  );
}

function LayerBadge({ layer }) {
  if (!layer) return null;
  const cfg = {
    hardware: { bg:"#fff3e8", color:C.layerHw, label:"Hardware" },
    software: { bg:"#f2effe", color:C.layerSw, label:"Software Drift" },
    network:  { bg:"#e8f4fb", color:C.layerNet, label:"Network" },
  }[layer];
  return <span style={{ background:cfg.bg, color:cfg.color, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, letterSpacing:"0.4px", textTransform:"uppercase" }}>{cfg.label}</span>;
}

function SeverityBadge({ days }) {
  if (!days) return null;
  const cfg = days <= 7
    ? { bg:"#fdecea", color:C.red,    label:"CRITICAL" }
    : days <= 21
    ? { bg:"#fff8e6", color:C.yellow, label:"WARNING" }
    : { bg:"#e8f4fb", color:C.accent, label:"MONITOR" };
  return <span style={{ background:cfg.bg, color:cfg.color, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, letterSpacing:"0.5px" }}>{cfg.label}</span>;
}

// ── Simulate Failure Modal ────────────────────────────────────────────────────
function SimulateModal({ robots, onStart, onClose }) {
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const availableRobots = robots.filter(r => !r.isSimulating);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,40,0.5)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div style={{ background:C.surface, borderRadius:16, padding:32, maxWidth:640, width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", border:`1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:4 }}>Demo Tool</div>
            <div style={{ fontSize:20, fontWeight:800, color:C.text }}>Simulate Failure Scenario</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>Watch OmniGuard detect and predict the failure in real time</div>
          </div>
          <button onClick={onClose} style={{ background:"#f0f2f5", border:"none", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13, color:C.muted, fontWeight:600 }}>✕</button>
        </div>

        {/* Step 1 — Pick robot */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:10 }}>Step 1 — Select Target Robot</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
            {availableRobots.map(r => (
              <div key={r.id} onClick={() => setSelectedRobot(r)}
                style={{ padding:"10px 12px", borderRadius:8, border:`2px solid ${selectedRobot?.id === r.id ? C.accent : C.border}`, cursor:"pointer", background: selectedRobot?.id === r.id ? "#f0f7ff" : "#fff", transition:"all 0.15s" }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{r.name}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{r.brand}</div>
                <div style={{ fontSize:10, color:C.muted }}>{r.location}</div>
                <div style={{ marginTop:6 }}><HealthBar value={r.health} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2 — Pick scenario */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:10 }}>Step 2 — Choose Failure Type</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:8 }}>
            {FAILURE_SCENARIOS.map(s => (
              <div key={s.id} onClick={() => setSelectedScenario(s)}
                style={{ padding:"12px 14px", borderRadius:8, border:`2px solid ${selectedScenario?.id === s.id ? s.color : C.border}`, cursor:"pointer", background: selectedScenario?.id === s.id ? `${s.color}10` : "#fff", transition:"all 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <LayerBadge layer={s.layer} />
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:3 }}>{s.label}</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{s.description}</div>
                <div style={{ marginTop:6, fontSize:10, color:C.muted }}>
                  Sensors: <span style={{ color:s.color, fontWeight:600 }}>{s.affectedSensors.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"10px 20px", border:`1px solid ${C.border}`, borderRadius:8, background:"#fff", cursor:"pointer", fontSize:13, color:C.muted, fontWeight:600 }}>Cancel</button>
          <button
            disabled={!selectedRobot || !selectedScenario}
            onClick={() => { onStart(selectedRobot, selectedScenario); onClose(); }}
            style={{ padding:"10px 24px", border:"none", borderRadius:8, background: (!selectedRobot || !selectedScenario) ? "#ccc" : C.accent, color:"#fff", cursor: (!selectedRobot || !selectedScenario) ? "not-allowed" : "pointer", fontSize:13, fontWeight:700, transition:"background 0.15s" }}>
            ▶ Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
}

// ── XAI Panel ─────────────────────────────────────────────────────────────────
function XAIPanel({ robot, onClose }) {
  const scenario = robot.scenario ? FAILURE_SCENARIOS.find(s => s.id === robot.scenario) : null;
  const triggeredSensors = robot.sensors.filter(s => s.anomaly);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,20,40,0.45)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div style={{ background:C.surface, borderRadius:14, padding:32, maxWidth:560, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.15)", border:`1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:11, color:C.muted, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:4 }}>XAI — Explainable Alert</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.text }}>{robot.name}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{robot.brand} · {robot.location}</div>
          </div>
          <button onClick={onClose} style={{ background:"#f0f2f5", border:"none", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13, color:C.muted, fontWeight:600 }}>Close</button>
        </div>

        {/* Failure prediction box */}
        <div style={{ background:"#fdecea", border:`1px solid #f5c6c6`, borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.red, letterSpacing:"0.8px", textTransform:"uppercase" }}>Predicted Failure</span>
            <SeverityBadge days={robot.daysToFailure} />
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>{robot.failureType}</div>
          {robot.daysToFailure && <div style={{ fontSize:12, color:"#a03030" }}>Estimated lead time: <strong>{robot.daysToFailure} days</strong></div>}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
          <span style={{ fontSize:12, color:C.muted }}>Failure layer:</span>
          <LayerBadge layer={robot.layer} />
          {robot.isSimulating && <span style={{ fontSize:10, background:"#fff8e6", color:C.yellow, padding:"2px 8px", borderRadius:4, fontWeight:700 }}>SIMULATING</span>}
        </div>

        {/* Sensor bars */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"1.2px", textTransform:"uppercase", marginBottom:12 }}>Sensor Pattern That Triggered This Alert</div>
          {robot.sensors.map((s, i) => (
            <div key={i} style={{ marginBottom:9 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:11, fontWeight: s.anomaly ? 700 : 400, color: s.anomaly ? C.red : C.text }}>{s.label}{s.anomaly ? " ⚠" : ""}</span>
                <span style={{ fontSize:11, color: s.anomaly ? C.red : C.muted, fontWeight:600 }}>{s.value}%</span>
              </div>
              <div style={{ height:6, background:"#eaecf0", borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${s.value}%`, height:"100%", background: s.anomaly ? C.red : C.accent, borderRadius:3, opacity: s.anomaly ? 1 : 0.35, transition:"width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div style={{ background:"#f0f7ff", borderLeft:`3px solid ${C.accent}`, borderRadius:"0 8px 8px 0", padding:"12px 14px", fontSize:12, color:"#1a3a5c", lineHeight:1.65 }}>
          <strong>Why this alert was generated: </strong>
          {triggeredSensors.length > 0
            ? `Anomalous readings detected in ${triggeredSensors.map(s => s.label).join(", ")}. These patterns match the pre-failure signature for "${robot.failureType}" with ${(88 + Math.random() * 8).toFixed(1)}% model confidence, based on cross-brand degradation training data (Unitree + UBTECH + AgiBot + 5 academic labs).`
            : `Early-stage behavioural drift detected across multiple sensor channels. Pattern consistent with "${robot.failureType}" onset — below threshold for human detection but within OmniGuard's predictive window.`
          }
        </div>
      </div>
    </div>
  );
}

// ── Robot Card ────────────────────────────────────────────────────────────────
function RobotCard({ robot, onSelect }) {
  const borderCol = robot.status === "alert" ? C.red : robot.status === "watch" ? C.yellow : C.border;
  const isClickable = robot.status !== "nominal";
  return (
    <div onClick={() => isClickable && onSelect(robot)}
      style={{ background:C.surface, border:`1px solid ${borderCol}`, borderRadius:10, padding:"14px 16px", cursor: isClickable ? "pointer" : "default", transition:"box-shadow 0.15s, transform 0.15s", boxShadow: robot.status === "alert" ? "0 0 0 3px #d9404018" : "0 1px 4px rgba(0,0,0,0.06)", position:"relative" }}
      onMouseEnter={e => { if(isClickable){ e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.transform="translateY(-1px)"; }}}
      onMouseLeave={e => { e.currentTarget.style.boxShadow=robot.status==="alert"?"0 0 0 3px #d9404018":"0 1px 4px rgba(0,0,0,0.06)"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      {robot.isSimulating && (
        <div style={{ position:"absolute", top:8, right:8, width:7, height:7, borderRadius:"50%", background:C.yellow, animation:"pulse 1s infinite" }} />
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", marginBottom:2 }}>
            <StatusDot status={robot.status} />
            <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{robot.name}</span>
          </div>
          <div style={{ fontSize:10, color:C.muted, paddingLeft:13 }}>{robot.brand}</div>
        </div>
        <span style={{ fontSize:20, fontWeight:800, color: robot.health>=75 ? C.green : robot.health>=50 ? C.yellow : C.red }}>{robot.health}</span>
      </div>
      <HealthBar value={robot.health} />
      <div style={{ marginTop:8, fontSize:10, color:C.muted }}>{robot.location}</div>
      {robot.layer && (
        <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:6 }}>
          <LayerBadge layer={robot.layer} />
          {robot.daysToFailure && <span style={{ fontSize:10, color:C.muted }}>{robot.daysToFailure}d</span>}
        </div>
      )}
      {isClickable && <div style={{ marginTop:8, fontSize:10, color:C.accent, fontWeight:600 }}>View XAI →</div>}
    </div>
  );
}

// ── Simulation Log ────────────────────────────────────────────────────────────
function SimLog({ entries }) {
  const ref = useRef(null);
  useEffect(() => { if(ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [entries]);
  if(entries.length === 0) return null;
  return (
    <div style={{ background:"#0f1923", borderRadius:10, padding:"14px 16px", marginTop:16, fontFamily:"'Courier New', monospace" }}>
      <div style={{ fontSize:10, color:"#4a7a5a", letterSpacing:"1px", textTransform:"uppercase", marginBottom:8 }}>OmniGuard Detection Log</div>
      <div ref={ref} style={{ maxHeight:140, overflowY:"auto" }}>
        {entries.map((e, i) => (
          <div key={i} style={{ fontSize:11, color: e.type==="alert" ? "#ff6b6b" : e.type==="warn" ? "#ffd166" : e.type==="detect" ? "#06d6a0" : "#7ecbff", marginBottom:3, lineHeight:1.5 }}>
            <span style={{ color:"#3a5a4a", marginRight:8 }}>[{e.time}]</span>{e.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function OmniGuardMVP() {
  const [robots, setRobots] = useState(() => Array.from({ length:12 }, (_, i) => makeRobot(i)));
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [activeTab, setActiveTab] = useState("fleet");
  const [showSimModal, setShowSimModal] = useState(false);
  const [tick, setTick] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [simLog, setSimLog] = useState([]);

  const addLog = (msg, type="info") => {
    const time = new Date().toLocaleTimeString();
    setSimLog(prev => [...prev.slice(-30), { msg, type, time }]);
  };

  // Live telemetry noise
  useEffect(() => {
    const interval = setInterval(() => {
      setRobots(prev => prev.map(r => {
        if(r.isSimulating) return r; // simulation handles its own update
        return {
          ...r,
          health: Math.round(Math.max(15, Math.min(99, r.health + gaussian(0, 0.6)))),
          lastSync: `${Math.floor(Math.random()*9)+1}s ago`,
          sensors: r.sensors.map(s => ({ ...s, value: Math.round(Math.max(0, Math.min(100, s.value + gaussian(0,1.2)))) })),
        };
      }));
      setLastUpdate(new Date());
      setTick(t => t+1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Simulation engine
  const startSimulation = (robot, scenario) => {
    addLog(`▶ Simulation started — ${robot.name} · ${scenario.label}`, "info");
    addLog(`📡 Telemetry collection active — monitoring ${scenario.affectedSensors.join(", ")}`, "info");

    setRobots(prev => prev.map(r => r.id !== robot.id ? r : {
      ...r, isSimulating:true, scenario:scenario.id,
      layer:scenario.layer, failureType:scenario.label,
      simulationStep:0,
    }));

    let step = 0;
    const maxSteps = 18;

    const simInterval = setInterval(() => {
      step++;
      const progress = step / maxSteps;

      setRobots(prev => prev.map(r => {
        if(r.id !== robot.id) return r;

        const newHealth = Math.round(Math.max(12, r.health - scenario.degradeRate * (1 + progress)));
        const newStatus = healthToStatus(newHealth);

        // Update sensors
        const newSensors = r.sensors.map(s => {
          const isAffected = scenario.affectedSensors.includes(s.label);
          const degradation = isAffected ? scenario.degradeRate * 2.5 * progress : 0;
          return {
            ...s,
            value: Math.round(Math.max(5, Math.min(100, s.value - degradation + gaussian(0, 0.8)))),
            anomaly: isAffected && progress > 0.3,
          };
        });

        const daysLeft = Math.round(Math.max(2, 28 * (1 - progress)));

        // Log milestones
        if(step === 3) addLog(`🔍 ${scenario.affectedSensors[0]} readings diverging from baseline — pattern analysis initiated`, "detect");
        if(step === 6) addLog(`⚠ Anomaly signature confirmed: ${scenario.label} — cross-brand model match >85%`, "warn");
        if(step === 9) addLog(`📊 Health score dropping: ${newHealth}/100 — status: ${newStatus.toUpperCase()}`, "warn");
        if(step === 12) addLog(`🚨 ALERT GENERATED — Predicted failure in ~${daysLeft} days — XAI explanation ready`, "alert");
        if(step === 15) addLog(`🛡 Recommendation: schedule maintenance for ${r.name} before next peak cycle`, "detect");

        return {
          ...r, health:newHealth, status:newStatus,
          sensors:newSensors, daysToFailure:daysLeft,
          simulationStep:step, lastSync:"live",
        };
      }));

      if(step >= maxSteps) {
        clearInterval(simInterval);
        addLog(`✅ Simulation complete — ${robot.name} failure predicted and detected ${Math.round(28 * (1-step/maxSteps) + 2)} days before occurrence`, "detect");
        setRobots(prev => prev.map(r => r.id !== robot.id ? r : { ...r, isSimulating:false }));
      }
    }, 600);
  };

  const resetRobot = (robotId) => {
    setRobots(prev => prev.map(r => r.id !== robotId ? r : makeRobot(robotId)));
    addLog("↩ Robot reset to nominal state", "info");
  };

  const alerts = robots.filter(r => r.status !== "nominal" && r.failureType);
  const nominal = robots.filter(r => r.status === "nominal").length;
  const watch   = robots.filter(r => r.status === "watch").length;
  const alertCount = robots.filter(r => r.status === "alert").length;
  const avgHealth = Math.round(robots.reduce((a,r) => a+r.health, 0) / robots.length);

  const Tab = ({ id, label, count }) => (
    <button onClick={() => setActiveTab(id)} style={{ padding:"8px 16px", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight: activeTab===id ? 700 : 500, color: activeTab===id ? C.accent : C.muted, background:"transparent", borderBottom:`2px solid ${activeTab===id ? C.accent : "transparent"}`, transition:"all 0.15s" }}>
      {label}
      {count !== undefined && <span style={{ marginLeft:6, background: count>0 ? (id==="alerts"?C.red:C.accent) : "#eaecf0", color: count>0?"#fff":C.muted, borderRadius:10, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{count}</span>}
    </button>
  );

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:C.text }}>

      {/* Top bar */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, background:`linear-gradient(135deg,${C.accent},#18a96a)`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff" }}>OG</div>
          <div>
            <span style={{ fontSize:15, fontWeight:800, color:C.text, letterSpacing:"-0.3px" }}>OmniGuard</span>
            <span style={{ fontSize:11, color:C.muted, marginLeft:8 }}>Fleet Intelligence Platform</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => setShowSimModal(true)} style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 16px", background:C.red, border:"none", borderRadius:8, color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700, letterSpacing:"0.3px" }}>
            ⚡ Simulate Failure
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.green }} />
            <span style={{ fontSize:11, color:C.muted }}>Live · {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div style={{ fontSize:11, color:C.muted, background:"#f0f2f5", padding:"4px 10px", borderRadius:6 }}>Foxconn Longhua · Floor 3</div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"12px 24px", display:"flex", gap:32, overflowX:"auto" }}>
        {[
          { label:"Fleet Size",      value:robots.length,  unit:"robots" },
          { label:"Avg Health",      value:avgHealth,      unit:"/ 100", color: avgHealth>=70?C.green:C.yellow },
          { label:"Nominal",         value:nominal,        unit:"units",  color:C.green },
          { label:"Watch",           value:watch,          unit:"units",  color:C.yellow },
          { label:"Alert",           value:alertCount,     unit:"units",  color:alertCount>0?C.red:C.muted },
          { label:"Fleet Uptime",    value:"99.7",         unit:"%",      color:C.green },
          { label:"Model Accuracy",  value:"94.8",         unit:"%",      color:C.accent },
        ].map((kpi,i) => (
          <div key={i} style={{ borderRight: i<6 ? `1px solid ${C.border}` : "none", paddingRight:32, flexShrink:0 }}>
            <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:2 }}>{kpi.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:kpi.color||C.text, lineHeight:1 }}>
              {kpi.value}<span style={{ fontSize:11, fontWeight:500, color:C.muted, marginLeft:2 }}>{kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 24px", display:"flex", gap:4 }}>
        <Tab id="fleet"  label="Fleet Overview" />
        <Tab id="alerts" label="Active Alerts" count={alerts.length} />
        <Tab id="layers" label="3-Layer Detection" />
      </div>

      {/* Content */}
      <div style={{ padding:24, maxWidth:1200, margin:"0 auto" }}>

        {/* FLEET */}
        {activeTab === "fleet" && (
          <div>
            <div style={{ marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>Fleet Health Overview</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Click any non-nominal robot to see XAI explanation · Yellow dot = simulation in progress</div>
              </div>
              <div style={{ fontSize:11, color:C.muted }}>Sync #{tick}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:12 }}>
              {robots.map(r => <RobotCard key={r.id} robot={r} onSelect={setSelectedRobot} />)}
            </div>
            {/* Reset buttons for simulated robots */}
            {robots.some(r => r.scenario) && (
              <div style={{ marginTop:16, display:"flex", gap:8, flexWrap:"wrap" }}>
                {robots.filter(r => r.scenario && !r.isSimulating).map(r => (
                  <button key={r.id} onClick={() => resetRobot(r.id)} style={{ padding:"6px 14px", background:"#f0f2f5", border:`1px solid ${C.border}`, borderRadius:7, cursor:"pointer", fontSize:12, color:C.muted, fontWeight:600 }}>
                    ↩ Reset {r.name}
                  </button>
                ))}
              </div>
            )}
            <SimLog entries={simLog} />
          </div>
        )}

        {/* ALERTS */}
        {activeTab === "alerts" && (
          <div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:700 }}>Active Predictive Alerts</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Failures predicted before occurrence — click any row for XAI breakdown</div>
            </div>
            {alerts.length === 0 ? (
              <div style={{ textAlign:"center", padding:48, color:C.muted, fontSize:14, background:C.surface, borderRadius:12, border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:24, marginBottom:8 }}>✓</div>
                All robots nominal — no active alerts
                <div style={{ marginTop:12 }}>
                  <button onClick={() => setShowSimModal(true)} style={{ padding:"8px 18px", background:C.accent, border:"none", borderRadius:7, color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700 }}>⚡ Simulate a failure to see alerts here</button>
                </div>
              </div>
            ) : (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["Robot","Brand","Location","Predicted Failure","Layer","Lead Time","Severity",""].map((h,i) => (
                        <th key={i} style={{ padding:"10px 14px", fontSize:10, fontWeight:700, color:C.muted, letterSpacing:"0.8px", textTransform:"uppercase", textAlign:"left", borderBottom:`1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map(r => (
                      <tr key={r.id} onClick={() => setSelectedRobot(r)} style={{ borderBottom:`1px solid ${C.border}`, cursor:"pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background="transparent"}
                      >
                        <td style={{ padding:"12px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center" }}>
                            <StatusDot status={r.status} />
                            <span style={{ fontSize:13, fontWeight:700 }}>{r.name}</span>
                            {r.isSimulating && <span style={{ marginLeft:6, fontSize:9, background:"#fff8e6", color:C.yellow, padding:"1px 5px", borderRadius:3, fontWeight:700 }}>SIM</span>}
                          </div>
                        </td>
                        <td style={{ padding:"12px 14px", fontSize:12, color:C.muted }}>{r.brand}</td>
                        <td style={{ padding:"12px 14px", fontSize:12, color:C.muted }}>{r.location}</td>
                        <td style={{ padding:"12px 14px", fontSize:12, color:C.text }}>{r.failureType}</td>
                        <td style={{ padding:"12px 14px" }}><LayerBadge layer={r.layer} /></td>
                        <td style={{ padding:"12px 14px", fontSize:13, fontWeight:700, color: r.daysToFailure<=7?C.red:C.yellow }}>{r.daysToFailure}d</td>
                        <td style={{ padding:"12px 14px" }}><SeverityBadge days={r.daysToFailure} /></td>
                        <td style={{ padding:"12px 14px", fontSize:11, color:C.accent, fontWeight:600 }}>XAI →</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <SimLog entries={simLog} />
          </div>
        )}

        {/* 3-LAYER */}
        {activeTab === "layers" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700 }}>3-Layer Failure Detection</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>OmniGuard monitors hardware, software, and network failure simultaneously across all brands</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
              {[
                { key:"hardware", label:"Hardware",       color:C.layerHw, bg:"#fff8f2", icon:"⚙", desc:"Actuator wear, battery degradation, sensor drift — detectable weeks before catastrophic failure." },
                { key:"software", label:"Software Drift", color:C.layerSw, bg:"#f8f4ff", icon:"🧠", desc:"Control model degradation without visible malfunction — identifiable only through behavioural pattern analysis." },
                { key:"network",  label:"Network / Comm", color:C.layerNet, bg:"#f0f7ff", icon:"📡", desc:"Communication latency as early failure indicator. One offline robot disrupts task allocation for the entire fleet." },
              ].map(layer => {
                const layerRobots = robots.filter(r => r.layer === layer.key);
                return (
                  <div key={layer.key} style={{ background:layer.bg, border:`1px solid ${layer.color}30`, borderRadius:12, padding:20 }}>
                    <div style={{ fontSize:22, marginBottom:8 }}>{layer.icon}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:layer.color, marginBottom:6 }}>{layer.label}</div>
                    <div style={{ fontSize:12, color:C.muted, lineHeight:1.6, marginBottom:14 }}>{layer.desc}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:8 }}>Affected Units ({layerRobots.length})</div>
                    {layerRobots.length === 0
                      ? <div style={{ fontSize:12, color:C.green }}>✓ No anomalies detected</div>
                      : layerRobots.map(r => (
                        <div key={r.id} onClick={() => setSelectedRobot(r)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 10px", background:"#fff", borderRadius:7, marginBottom:5, cursor:"pointer", border:`1px solid ${C.border}` }}>
                          <div style={{ display:"flex", alignItems:"center" }}>
                            <StatusDot status={r.status} />
                            <span style={{ fontSize:12, fontWeight:600 }}>{r.name}</span>
                          </div>
                          <span style={{ fontSize:11, color:r.daysToFailure<=7?C.red:C.yellow, fontWeight:700 }}>{r.daysToFailure}d</span>
                        </div>
                      ))
                    }
                  </div>
                );
              })}
            </div>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.muted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:14 }}>How OmniGuard Detects Failures</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                {[
                  { step:"01", title:"Continuous Telemetry", desc:"Joint torque, battery cycles, IMU readings, motor load, and comm latency streamed in real time from all robots regardless of OEM brand." },
                  { step:"02", title:"Cross-Brand Model",    desc:"Degradation patterns matched against a dataset trained on Unitree, UBTECH, AgiBot, and academic lab data. Every new unit improves accuracy for the entire fleet." },
                  { step:"03", title:"XAI Alert Generation", desc:"Each alert includes the exact sensor pattern that triggered it, the failure layer, confidence score, and estimated lead time — interpretable by safety teams." },
                ].map(s => (
                  <div key={s.step} style={{ display:"flex", gap:12 }}>
                    <div style={{ fontSize:18, fontWeight:800, color:`${C.accent}40`, flexShrink:0 }}>{s.step}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:4 }}>{s.title}</div>
                      <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <SimLog entries={simLog} />
          </div>
        )}
      </div>

      {showSimModal && <SimulateModal robots={robots} onStart={startSimulation} onClose={() => setShowSimModal(false)} />}
      {selectedRobot && <XAIPanel robot={robots.find(r=>r.id===selectedRobot.id)||selectedRobot} onClose={() => setSelectedRobot(null)} />}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing:border-box; }
        body { margin:0; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#f0f2f5; }
        ::-webkit-scrollbar-thumb { background:#ccd0d8; border-radius:3px; }
      `}</style>
    </div>
  );
}
