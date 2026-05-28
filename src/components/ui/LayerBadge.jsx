import { C } from "../../constants/theme";

const LAYER_CFG = {
  hardware: { bg: "#fff3e8", color: C.layerHw, label: "Hardware" },
  software: { bg: "#f2effe", color: C.layerSw, label: "Software Drift" },
  network:  { bg: "#e8f4fb", color: C.layerNet, label: "Network" },
};

export function LayerBadge({ layer }) {
  if (!layer) return null;
  const cfg = LAYER_CFG[layer];
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: 10, fontWeight: 700,
      padding: "2px 7px",
      borderRadius: 4,
      letterSpacing: "0.4px",
      textTransform: "uppercase",
    }}>
      {cfg.label}
    </span>
  );
}
