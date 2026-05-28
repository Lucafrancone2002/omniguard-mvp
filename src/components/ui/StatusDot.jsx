import { C } from "../../constants/theme";

export function StatusDot({ status }) {
  const col = status === "nominal" ? C.green : status === "watch" ? C.yellow : C.red;
  return (
    <span style={{
      display: "inline-block",
      width: 8, height: 8,
      borderRadius: "50%",
      background: col,
      marginRight: 5,
      flexShrink: 0,
      boxShadow: `0 0 0 3px ${col}22`,
    }} />
  );
}
