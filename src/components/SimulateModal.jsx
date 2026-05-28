import { useState } from "react";
import { C } from "../constants/theme";
import { FAILURE_SCENARIOS } from "../constants/failures";
import { HealthBar } from "./ui/HealthBar";
import { LayerBadge } from "./ui/LayerBadge";

export function SimulateModal({ robots, preselected, onStart, onClose }) {
  const [selRobot, setSelRobot] = useState(preselected ?? null);
  const [selScenario, setSelScenario] = useState(null);
  const available = robots.filter(r => !r.isSimulating);
  const ready = selRobot && selScenario;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(10,20,40,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: C.surface, borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)", border: `1px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "24px 28px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Simulate Failure Scenario</div>
            <button onClick={onClose} style={{ background: "#f0f2f5", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: C.muted, fontWeight: 600 }}>✕</button>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>
            Watch OmniGuard detect and predict the failure in real time
          </div>
        </div>

        <div style={{ padding: "0 28px" }}>
          {/* Step 1 */}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
            Step 1 — Select Target Robot
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
            {available.map(r => (
              <div
                key={r.id}
                onClick={() => setSelRobot(r)}
                style={{
                  padding: "10px 12px", borderRadius: 8,
                  border: `2px solid ${selRobot?.id === r.id ? C.accent : C.border}`,
                  cursor: "pointer",
                  background: selRobot?.id === r.id ? "#f0f7ff" : "#fff",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.name}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{r.brand}</div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 5 }}>{r.location}</div>
                <HealthBar value={r.health} height={4} />
              </div>
            ))}
          </div>

          {/* Step 2 */}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
            Step 2 — Choose Failure Type
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
            {FAILURE_SCENARIOS.map(s => (
              <div
                key={s.id}
                onClick={() => setSelScenario(s)}
                style={{
                  padding: "12px 14px", borderRadius: 8,
                  border: `2px solid ${selScenario?.id === s.id ? s.color : C.border}`,
                  cursor: "pointer",
                  background: selScenario?.id === s.id ? `${s.color}12` : "#fff",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ marginBottom: 4 }}><LayerBadge layer={s.layer} /></div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 5 }}>{s.description}</div>
                <div style={{ fontSize: 10, color: C.muted }}>
                  Sensors: <span style={{ color: s.color, fontWeight: 600 }}>{s.affectedSensors.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, justifyContent: "flex-end", background: C.surface, borderRadius: "0 0 16px 16px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", border: `1px solid ${C.border}`, borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: C.muted, fontWeight: 600 }}>
            Cancel
          </button>
          <button
            disabled={!ready}
            onClick={() => { onStart(selRobot, selScenario); onClose(); }}
            style={{ padding: "10px 24px", border: "none", borderRadius: 8, background: ready ? C.accent : "#ccc", color: "#fff", cursor: ready ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, transition: "background 0.15s" }}
          >
            ▶ Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
