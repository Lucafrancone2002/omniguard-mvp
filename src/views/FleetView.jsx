import { C } from "../constants/theme";
import { RobotCard } from "../components/RobotCard";
import { SimLog } from "../components/SimLog";

export function FleetView({ robots, tick, simLog, onSelectRobot, onResetRobot }) {
  const resetCandidates = robots.filter(r => r.scenario && !r.isSimulating);

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Fleet Health Overview</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            Click any robot to inspect components, sensors, and XAI alerts
          </div>
        </div>
        <div style={{ fontSize: 11, color: C.muted }}>Sync #{tick}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
        {robots.map(r => <RobotCard key={r.id} robot={r} onSelect={onSelectRobot} />)}
      </div>

      {resetCandidates.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {resetCandidates.map(r => (
            <button
              key={r.id}
              onClick={() => onResetRobot(r.id)}
              style={{ padding: "6px 14px", background: "#f0f2f5", border: `1px solid ${C.border}`, borderRadius: 7, cursor: "pointer", fontSize: 12, color: C.muted, fontWeight: 600 }}
            >
              ↩ Reset {r.name}
            </button>
          ))}
        </div>
      )}

      <SimLog entries={simLog} />
    </div>
  );
}
