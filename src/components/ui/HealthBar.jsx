import { C } from "../../constants/theme";

export function HealthBar({ value, height = 5 }) {
  const col = value >= 75 ? C.green : value >= 50 ? C.yellow : C.red;
  return (
    <div style={{ width: "100%", height, background: "#eaecf0", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: col, borderRadius: 3, transition: "width 0.6s ease" }} />
    </div>
  );
}
