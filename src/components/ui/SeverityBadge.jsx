import { C } from "../../constants/theme";

export function SeverityBadge({ days }) {
  if (!days) return null;
  const cfg = days <= 7
    ? { bg: "#fdecea", color: C.red,    label: "CRITICAL" }
    : days <= 21
    ? { bg: "#fff8e6", color: C.yellow, label: "WARNING" }
    : { bg: "#e8f4fb", color: C.accent, label: "MONITOR" };
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: 10, fontWeight: 700,
      padding: "2px 8px",
      borderRadius: 4,
      letterSpacing: "0.5px",
    }}>
      {cfg.label}
    </span>
  );
}
