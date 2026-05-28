import { useState, useEffect } from "react";
import { C } from "./constants/theme";
import { useSimulation } from "./hooks/useSimulation";
import { RobotDetail } from "./components/RobotDetail";
import { SimulateModal } from "./components/SimulateModal";
import { LayerDetection } from "./components/LayerDetection";
import { FleetView } from "./views/FleetView";
import { AlertsView } from "./views/AlertsView";

function Tab({ id, label, count, activeTab, onSelect }) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onSelect(id)}
      style={{
        padding: "8px 16px",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? C.accent : C.muted,
        background: "transparent",
        borderBottom: `2px solid ${isActive ? C.accent : "transparent"}`,
        transition: "all 0.15s",
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          marginLeft: 6,
          background: count > 0 ? (id === "alerts" ? C.red : C.accent) : "#eaecf0",
          color: count > 0 ? "#fff" : C.muted,
          borderRadius: 10,
          padding: "1px 7px",
          fontSize: 10,
          fontWeight: 700,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function App() {
  const { robots, simLog, lastUpdate, tick, startSimulation, resetRobot } = useSimulation();
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [showSimModal, setShowSimModal] = useState(false);
  const [simPreselect, setSimPreselect] = useState(null);
  const [activeTab, setActiveTab] = useState("fleet");

  // Keep detail panel in sync with live robot state
  useEffect(() => {
    if (!selectedRobot) return;
    const updated = robots.find(r => r.id === selectedRobot.id);
    if (updated) setSelectedRobot(updated);
  }, [robots]);

  const alerts     = robots.filter(r => r.status !== "nominal" && r.failureType);
  const nominal    = robots.filter(r => r.status === "nominal").length;
  const watch      = robots.filter(r => r.status === "watch").length;
  const alertCount = robots.filter(r => r.status === "alert").length;
  const avgHealth  = Math.round(robots.reduce((a, r) => a + r.health, 0) / robots.length);

  const openSimModal = (preselect = null) => { setSimPreselect(preselect); setShowSimModal(true); };
  const closeSimModal = () => { setShowSimModal(false); setSimPreselect(null); };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text }}>

      {/* ── Topbar ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${C.accent},#18a96a)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>OG</div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>OmniGuard</span>
            <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>Fleet Intelligence Platform</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => openSimModal()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: C.red, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
          >
            ⚡ Simulate Failure
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />
            <span style={{ fontSize: 11, color: C.muted }}>Live · {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div style={{ fontSize: 11, color: C.muted, background: "#f0f2f5", padding: "4px 10px", borderRadius: 6 }}>
            Foxconn Longhua · Floor 3
          </div>
        </div>
      </div>

      {/* ── KPI bar ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", gap: 32, overflowX: "auto" }}>
        {[
          { label: "Fleet Size",     value: robots.length, unit: "robots" },
          { label: "Avg Health",     value: avgHealth,     unit: "/ 100", color: avgHealth >= 70 ? C.green : C.yellow },
          { label: "Nominal",        value: nominal,       unit: "units",  color: C.green },
          { label: "Watch",          value: watch,         unit: "units",  color: C.yellow },
          { label: "Alert",          value: alertCount,    unit: "units",  color: alertCount > 0 ? C.red : C.muted },
          { label: "Fleet Uptime",   value: "99.7",        unit: "%",      color: C.green },
          { label: "Model Accuracy", value: "94.8",        unit: "%",      color: C.accent },
        ].map((k, i) => (
          <div key={i} style={{ borderRight: i < 6 ? `1px solid ${C.border}` : "none", paddingRight: 32, flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 2 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color ?? C.text, lineHeight: 1 }}>
              {k.value}<span style={{ fontSize: 11, fontWeight: 500, color: C.muted, marginLeft: 2 }}>{k.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 24px", display: "flex", gap: 4 }}>
        <Tab id="fleet"  label="Fleet Overview"    activeTab={activeTab} onSelect={setActiveTab} />
        <Tab id="alerts" label="Active Alerts"     activeTab={activeTab} onSelect={setActiveTab} count={alerts.length} />
        <Tab id="layers" label="3-Layer Detection" activeTab={activeTab} onSelect={setActiveTab} />
      </div>

      {/* ── Content ── */}
      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        {activeTab === "fleet" && (
          <FleetView
            robots={robots}
            tick={tick}
            simLog={simLog}
            onSelectRobot={setSelectedRobot}
            onResetRobot={resetRobot}
          />
        )}
        {activeTab === "alerts" && (
          <AlertsView
            alerts={alerts}
            simLog={simLog}
            onSelectRobot={setSelectedRobot}
            onSimulate={() => openSimModal()}
          />
        )}
        {activeTab === "layers" && (
          <LayerDetection
            robots={robots}
            onSelectRobot={setSelectedRobot}
            onSimulate={r => openSimModal(r)}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {selectedRobot && (
        <RobotDetail
          robot={robots.find(r => r.id === selectedRobot.id) ?? selectedRobot}
          onClose={() => setSelectedRobot(null)}
          onSimulate={r => { setSelectedRobot(null); openSimModal(r); }}
        />
      )}
      {showSimModal && (
        <SimulateModal
          robots={robots}
          preselected={simPreselect}
          onStart={startSimulation}
          onClose={closeSimModal}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f0f2f5; }
        ::-webkit-scrollbar-thumb { background: #ccd0d8; border-radius: 3px; }
      `}</style>
    </div>
  );
}
