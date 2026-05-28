import { C } from "../constants/theme";
import { StatusDot } from "../components/ui/StatusDot";
import { LayerBadge } from "../components/ui/LayerBadge";
import { SeverityBadge } from "../components/ui/SeverityBadge";
import { SimLog } from "../components/SimLog";

const TABLE_HEADERS = ["Robot", "Brand", "Location", "Predicted Failure", "Layer", "Lead Time", "Severity", ""];

export function AlertsView({ alerts, simLog, onSelectRobot, onSimulate }) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Active Predictive Alerts</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Click any row to inspect the robot</div>
      </div>

      {alerts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: C.muted, fontSize: 14, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
          All robots nominal<br />
          <button
            onClick={onSimulate}
            style={{ marginTop: 12, padding: "8px 18px", background: C.accent, border: "none", borderRadius: 7, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
          >
            ⚡ Simulate a failure
          </button>
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {TABLE_HEADERS.map((h, i) => (
                  <th key={i} style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.8px", textTransform: "uppercase", textAlign: "left", borderBottom: `1px solid ${C.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map(r => (
                <tr
                  key={r.id}
                  onClick={() => onSelectRobot(r)}
                  style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <StatusDot status={r.status} />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                      {r.isSimulating && (
                        <span style={{ marginLeft: 6, fontSize: 9, background: "#fff8e6", color: C.yellow, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>SIM</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: C.muted }}>{r.brand}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: C.muted }}>{r.location}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: C.text }}>{r.failureType}</td>
                  <td style={{ padding: "12px 14px" }}><LayerBadge layer={r.layer} /></td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: r.daysToFailure <= 7 ? C.red : C.yellow }}>{r.daysToFailure}d</td>
                  <td style={{ padding: "12px 14px" }}><SeverityBadge days={r.daysToFailure} /></td>
                  <td style={{ padding: "12px 14px", fontSize: 11, color: C.accent, fontWeight: 600 }}>Inspect →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SimLog entries={simLog} />
    </div>
  );
}
