import { C } from "../constants/theme";
import { BODY_PARTS } from "../constants/robots";
import { StatusDot } from "./ui/StatusDot";
import { HealthBar } from "./ui/HealthBar";
import { LayerBadge } from "./ui/LayerBadge";
import { SeverityBadge } from "./ui/SeverityBadge";

function partHealth(robot, part) {
  const relevant = robot.sensors.filter(s => part.sensors.includes(s.label));
  if (relevant.length === 0) return 90;
  return Math.round(relevant.reduce((a, s) => a + s.value, 0) / relevant.length);
}

function partStatus(h) { return h >= 75 ? "nominal" : h >= 50 ? "watch" : "alert"; }
function partColor(h)  { return h >= 75 ? C.green : h >= 50 ? C.yellow : C.red; }

export function RobotDetail({ robot, onClose, onSimulate }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(10,20,40,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: C.surface, borderRadius: 16, padding: 28, width: "100%", maxWidth: 620, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: `1px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>Robot Detail</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{robot.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{robot.brand} · {robot.location}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => { onClose(); onSimulate(robot); }}
              style={{ padding: "7px 14px", background: C.red, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
            >
              ⚡ Simulate Failure
            </button>
            <button
              onClick={onClose}
              style={{ background: "#f0f2f5", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 13, color: C.muted, fontWeight: 600 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Overall health */}
        <div style={{
          background: robot.status === "alert" ? "#fdecea" : robot.status === "watch" ? "#fff8e6" : "#f0fdf6",
          border: `1px solid ${robot.status === "alert" ? "#f5c6c6" : robot.status === "watch" ? "#fde68a" : "#bbf7d0"}`,
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 4 }}>Overall Health Score</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: robot.health >= 75 ? C.green : robot.health >= 50 ? C.yellow : C.red, lineHeight: 1 }}>
              {robot.health}<span style={{ fontSize: 14, fontWeight: 500, color: C.muted }}>/100</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 6 }}>
              <StatusDot status={robot.status} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: "capitalize" }}>{robot.status}</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>Uptime: <strong>{robot.uptime}%</strong></div>
            <div style={{ fontSize: 11, color: C.muted }}>Last sync: {robot.lastSync}</div>
          </div>
        </div>

        {/* Body parts */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 12 }}>
            Mechanical & System Components
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {BODY_PARTS.map(part => {
              const h = partHealth(robot, part);
              const st = partStatus(h);
              const col = partColor(h);
              return (
                <div key={part.id} style={{
                  background: st === "alert" ? "#fdecea" : st === "watch" ? "#fff8e6" : "#f8fafc",
                  border: `1px solid ${st === "alert" ? "#f5c6c6" : st === "watch" ? "#fde68a" : C.border}`,
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 16 }}>{part.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{part.label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: col }}>{h}</span>
                  </div>
                  <HealthBar value={h} height={4} />
                  <div style={{ marginTop: 6, fontSize: 10, color: C.muted }}>{part.sensors.join(" · ")}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live sensors */}
        <div style={{ marginBottom: robot.failureType ? 20 : 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 12 }}>
            Live Sensor Readings
          </div>
          {robot.sensors.map((s, i) => (
            <div key={i} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: s.anomaly ? 700 : 400, color: s.anomaly ? C.red : C.text }}>
                  {s.label}{s.anomaly ? " ⚠" : ""}
                </span>
                <span style={{ fontSize: 11, color: s.anomaly ? C.red : C.muted, fontWeight: 600 }}>{s.value}%</span>
              </div>
              <div style={{ height: 6, background: "#eaecf0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${s.value}%`, height: "100%",
                  background: s.anomaly ? C.red : C.accent,
                  borderRadius: 3, opacity: s.anomaly ? 1 : 0.4,
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* XAI alert */}
        {robot.failureType && (
          <div style={{ background: "#fdecea", border: "1px solid #f5c6c6", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                XAI — Predicted Failure
              </span>
              <SeverityBadge days={robot.daysToFailure} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{robot.failureType}</div>
            {robot.daysToFailure && (
              <div style={{ fontSize: 12, color: "#a03030", marginBottom: 8 }}>
                Estimated lead time: <strong>{robot.daysToFailure} days</strong>
              </div>
            )}
            <LayerBadge layer={robot.layer} />
            <div style={{ marginTop: 10, background: "#f0f7ff", borderLeft: `3px solid ${C.accent}`, borderRadius: "0 6px 6px 0", padding: "10px 12px", fontSize: 11, color: "#1a3a5c", lineHeight: 1.6 }}>
              <strong>Why this alert: </strong>
              {robot.sensors.filter(s => s.anomaly).length > 0
                ? `Anomalous readings in ${robot.sensors.filter(s => s.anomaly).map(s => s.label).join(", ")}. Pattern matches "${robot.failureType}" with ${(88 + Math.random() * 8).toFixed(1)}% confidence.`
                : `Early-stage drift detected consistent with "${robot.failureType}" onset.`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
