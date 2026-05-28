import { useState, useEffect } from "react";
import { C } from "../constants/theme";
import { StatusDot } from "./ui/StatusDot";

const LAYERS = [
  {
    key: "hardware", label: "Hardware", color: C.layerHw, bg: "#fff8f2", icon: "⚙",
    desc: "Actuator wear, battery degradation, sensor drift — detectable weeks before catastrophic failure.",
    steps: [
      "Continuous sensor polling every 100ms",
      "Baseline comparison against brand-specific model",
      "Degradation curve fitting — multi-joint correlation",
      "Failure signature match → alert generated",
    ],
  },
  {
    key: "software", label: "Software Drift", color: C.layerSw, bg: "#f8f4ff", icon: "🧠",
    desc: "Control model degradation without visible malfunction — identifiable only through behavioural pattern analysis.",
    steps: [
      "Gait pattern telemetry capture",
      "Motion deviation from trained baseline",
      "Progressive drift quantification",
      "Behavioural anomaly → alert + XAI explanation",
    ],
  },
  {
    key: "network", label: "Network / Comm", color: C.layerNet, bg: "#f0f7ff", icon: "📡",
    desc: "Communication latency as early failure indicator. One offline robot disrupts task allocation for the entire fleet.",
    steps: [
      "5G packet latency monitoring",
      "Fleet coordination heartbeat check",
      "Cascade risk modelling across fleet",
      "Network failure prediction → isolation recommended",
    ],
  },
];

const ARCH_STEPS = [
  { step: "01", title: "Continuous Telemetry",  desc: "Joint torque, battery cycles, IMU readings, motor load, and comm latency streamed from all robots regardless of OEM brand." },
  { step: "02", title: "Cross-Brand Model",      desc: "Patterns matched against data from Unitree, UBTECH, AgiBot, and 5 academic labs. Every new unit improves accuracy for the entire fleet." },
  { step: "03", title: "XAI Alert Generation",   desc: "Each alert shows the exact sensor pattern that triggered it, the failure layer, confidence score, and estimated lead time." },
];

export function LayerDetection({ robots, onSelectRobot, onSimulate }) {
  const [activeLayer, setActiveLayer] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!activeLayer) return;
    setActiveStep(0);
    const t = setInterval(() => setActiveStep(s => {
      if (s >= 3) { clearInterval(t); return 3; }
      return s + 1;
    }), 900);
    return () => clearInterval(t);
  }, [activeLayer]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>3-Layer Failure Detection</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Click a layer to see how OmniGuard detects it — step by step</div>
      </div>

      {/* Layer selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {LAYERS.map(layer => {
          const layerRobots = robots.filter(r => r.layer === layer.key);
          const isActive = activeLayer?.key === layer.key;
          return (
            <div
              key={layer.key}
              onClick={() => setActiveLayer(isActive ? null : layer)}
              style={{ background: isActive ? layer.bg : "#fff", border: `2px solid ${isActive ? layer.color : C.border}`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s" }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{layer.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: layer.color, marginBottom: 6 }}>{layer.label}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, marginBottom: 12 }}>{layer.desc}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{layerRobots.length} affected</div>
                <span style={{ fontSize: 10, color: isActive ? layer.color : C.muted, fontWeight: 700 }}>{isActive ? "▲ Hide" : "▼ Explore"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive detection flow */}
      {activeLayer && (
        <div style={{ background: activeLayer.bg, border: `1px solid ${activeLayer.color}30`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: activeLayer.color, marginBottom: 16 }}>
            {activeLayer.icon} How OmniGuard detects {activeLayer.label} failures
          </div>
          <div style={{ display: "flex", gap: 0, alignItems: "flex-start", marginBottom: 20 }}>
            {activeLayer.steps.map((step, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: i <= activeStep ? activeLayer.color : "#e2eaf0",
                  color: i <= activeStep ? "#fff" : C.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, transition: "all 0.4s",
                  boxShadow: i === activeStep ? `0 0 0 4px ${activeLayer.color}30` : "none",
                }}>
                  {i < activeStep ? "✓" : i + 1}
                </div>
                {i < 3 && (
                  <div style={{ width: "100%", height: 2, background: i < activeStep ? activeLayer.color : "#e2eaf0", transition: "background 0.4s", margin: "17px 0 0 18px" }} />
                )}
                <div style={{ fontSize: 10, color: i <= activeStep ? C.text : C.muted, textAlign: "center", marginTop: 8, padding: "0 4px", lineHeight: 1.4, fontWeight: i === activeStep ? 600 : 400 }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setActiveStep(0); setTimeout(() => setActiveLayer({ ...activeLayer }), 50); }}
            style={{ padding: "7px 16px", background: activeLayer.color, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
          >
            ↺ Replay detection
          </button>

          {/* Affected robots */}
          {robots.filter(r => r.layer === activeLayer.key).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
                Robots currently affected
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {robots.filter(r => r.layer === activeLayer.key).map(r => (
                  <div
                    key={r.id}
                    onClick={() => onSelectRobot(r)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "#fff", borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer" }}
                  >
                    <StatusDot status={r.status} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                    <span style={{ fontSize: 11, color: r.daysToFailure <= 7 ? C.red : C.yellow, fontWeight: 700 }}>{r.daysToFailure}d</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Core Detection Architecture */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 }}>
          Core Detection Architecture
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {ARCH_STEPS.map(s => (
            <div key={s.step} style={{ display: "flex", gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: `${C.accent}40`, flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
