import { C } from "../constants/theme";
import { StatusDot } from "./ui/StatusDot";
import { HealthBar } from "./ui/HealthBar";
import { LayerBadge } from "./ui/LayerBadge";

export function RobotCard({ robot, onSelect }) {
  const borderCol = robot.status === "alert" ? C.red : robot.status === "watch" ? C.yellow : C.border;
  const baseShadow = robot.status === "alert" ? "0 0 0 3px #d9404018" : "0 1px 4px rgba(0,0,0,0.06)";

  return (
    <div
      onClick={() => onSelect(robot)}
      style={{
        background: C.surface,
        border: `1px solid ${borderCol}`,
        borderRadius: 10,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, transform 0.15s",
        boxShadow: baseShadow,
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = baseShadow;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {robot.isSimulating && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 7, height: 7, borderRadius: "50%",
          background: C.yellow, animation: "pulse 1s infinite",
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <StatusDot status={robot.status} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{robot.name}</span>
          </div>
          <div style={{ fontSize: 10, color: C.muted, paddingLeft: 13 }}>{robot.brand}</div>
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: robot.health >= 75 ? C.green : robot.health >= 50 ? C.yellow : C.red }}>
          {robot.health}
        </span>
      </div>

      <HealthBar value={robot.health} />
      <div style={{ marginTop: 8, fontSize: 10, color: C.muted }}>{robot.location}</div>

      {robot.layer && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <LayerBadge layer={robot.layer} />
          {robot.daysToFailure && (
            <span style={{ fontSize: 10, color: C.muted }}>{robot.daysToFailure}d</span>
          )}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 10, color: C.accent, fontWeight: 600 }}>Click for details →</div>
    </div>
  );
}
