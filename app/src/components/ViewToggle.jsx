import { useState } from "react";
import { Icon } from "../lib/icons.jsx";
import { useViewMode } from "../lib/useViewMode.js";

// Floating chip: alterna manualmente entre mobile/desktop view.
// null = auto (segue viewport). Override é persistido em localStorage.

export default function ViewToggle({ position = "br" }) {
  const { isMobile, override, setOverride } = useViewMode();
  const [open, setOpen] = useState(false);

  const pos = {
    br: { bottom: "calc(var(--safe-bottom) + var(--tabbar-h) + 12px)", right: 12 },
    tr: { top: "calc(var(--safe-top) + 12px)", right: 12 },
    bl: { bottom: "calc(var(--safe-bottom) + 12px)", left: 12 },
  }[position] || { bottom: 12, right: 12 };

  const OPTIONS = [
    { v: null,       l: "Automático", icon: "swap"  },
    { v: "mobile",   l: "Mobile",     icon: "home"  },
    { v: "desktop",  l: "Desktop",    icon: "menu"  },
  ];
  const active = OPTIONS.find((o) => o.v === override) || OPTIONS[0];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Alternar vista mobile/desktop"
        title={`Vista: ${active.l}${override ? "" : ` (${isMobile ? "mobile" : "desktop"})`}`}
        className="ch"
        style={{
          position: "fixed",
          ...pos,
          zIndex: 60,
          width: 42, height: 42, borderRadius: 999,
          background: "#152741", color: "#F7F4EE",
          border: "1px solid rgba(247,244,238,.15)",
          boxShadow: "0 6px 18px rgba(21,39,65,.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Icon name={isMobile ? "home" : "grid"} size={18} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 59, background: "transparent" }}
          />
          <div style={{
            position: "fixed",
            ...pos,
            transform: position === "br" || position === "tr" ? "translate(-52px, 0)" : "translate(52px, 0)",
            zIndex: 61,
            minWidth: 190,
            background: "#FFFFFF",
            border: "1px solid #EAE6DD",
            borderRadius: 12,
            boxShadow: "0 12px 30px rgba(21,39,65,.18)",
            padding: 6,
          }}>
            <div className="mono" style={{ padding: "8px 10px 6px", fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86" }}>
              — VISTA
            </div>
            {OPTIONS.map((o) => {
              const isActive = override === o.v;
              return (
                <button
                  key={String(o.v)}
                  onClick={() => { setOverride(o.v); setOpen(false); }}
                  className="ch"
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px",
                    width: "100%",
                    borderRadius: 8,
                    background: isActive ? "#F5F2EC" : "transparent",
                    color: "#152741",
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 400,
                    border: "none", cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <Icon name={o.icon} size={15} />
                  <span style={{ flex: 1 }}>{o.l}</span>
                  {isActive && <span style={{ color: "#E8A13C", fontSize: 11 }}>●</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
