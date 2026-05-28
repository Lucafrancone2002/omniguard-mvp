import { useRef, useEffect } from "react";

const TYPE_COLOR = {
  alert:  "#ff6b6b",
  warn:   "#ffd166",
  detect: "#06d6a0",
};

export function SimLog({ entries }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div style={{ background: "#0f1923", borderRadius: 10, padding: "14px 16px", marginTop: 16, fontFamily: "'Courier New',monospace" }}>
      <div style={{ fontSize: 10, color: "#4a7a5a", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
        OmniGuard Detection Log
      </div>
      <div ref={ref} style={{ maxHeight: 130, overflowY: "auto" }}>
        {entries.map((e, i) => (
          <div key={i} style={{ fontSize: 11, color: TYPE_COLOR[e.type] ?? "#7ecbff", marginBottom: 3, lineHeight: 1.5 }}>
            <span style={{ color: "#3a5a4a", marginRight: 8 }}>[{e.time}]</span>
            {e.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
