import { useState } from "react";
import { Icon } from "./icons.jsx";

export const Eyebrow = ({ children, color = "#8A8A86" }) => (
  <span className="mono" style={{ color, fontSize: 11, fontWeight: 500 }}>{children}</span>
);

export const Av = ({ t, bg, sz = 40, color = "#152741" }) => (
  <div style={{
    width: sz, height: sz, borderRadius: sz * 0.5,
    background: bg || "#DCE7F0",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "DM Sans", fontSize: sz * 0.36, fontWeight: 600,
    color, flexShrink: 0, letterSpacing: "-0.01em",
  }}>{t}</div>
);

export const Tag = ({ children, type = "default" }) => {
  const m = {
    realizada: ["#DDEADE", "#3D7A4A"], falta: ["#F4E0E0", "#B83A3A"],
    agendada: ["#DCE7F0", "#1E3556"], pago: ["#DDEADE", "#3D7A4A"],
    pendente: ["#F5E5CD", "#C97A1F"], director: ["#EFEBE2", "#152741"],
    professional: ["#DDEADE", "#3D7A4A"], parent: ["#DCE7F0", "#1E3556"],
    admin: ["#152741", "#F7F4EE"], default: ["#EFEBE2", "#3C3C3B"],
    amber: ["#F5D9A8", "#C97A1F"], sage: ["#C7DDCB", "#3D7A4A"],
  };
  const [bg, c] = m[type] || m.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 9px", borderRadius: 99,
      fontSize: 11.5, fontWeight: 500,
      background: bg, color: c, lineHeight: 1.4,
    }}>{children}</span>
  );
};

export const Card = ({ children, style, onClick, delay = 0, pad = 22 }) => (
  <div className="ch fu" onClick={onClick} style={{
    background: "#FBF9F4", borderRadius: 14, padding: pad,
    border: "1px solid #E5E0D4",
    cursor: onClick ? "pointer" : "default",
    animationDelay: `${delay}ms`,
    transition: "border-color .15s ease, box-shadow .15s ease, transform .12s ease",
    ...style,
  }}
    onMouseEnter={onClick ? (e) => { e.currentTarget.style.borderColor = "#152741"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(21,39,65,.06)"; } : undefined}
    onMouseLeave={onClick ? (e) => { e.currentTarget.style.borderColor = "#E5E0D4"; e.currentTarget.style.boxShadow = "none"; } : undefined}
  >{children}</div>
);

export const Stat = ({ label, value, suffix, color = "#152741", bg = "#FBF9F4", trend, accent }) => (
  <div style={{
    background: bg, borderRadius: 14, padding: "22px 22px 20px",
    border: "1px solid #E5E0D4", flex: 1, position: "relative", overflow: "hidden",
  }}>
    {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />}
    <Eyebrow>{label}</Eyebrow>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
      <span className="serif" style={{ fontSize: 36, fontWeight: 300, color, lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</span>
      {suffix && <span style={{ fontFamily: "DM Sans", fontSize: 14, color: "#8A8A86", fontWeight: 500 }}>{suffix}</span>}
    </div>
    {trend && <div style={{ fontSize: 12, color: "#8A8A86", marginTop: 6 }}>{trend}</div>}
  </div>
);

export const Progress = ({ pct, color = "#152741", h = 6, bg = "#EFEBE2" }) => (
  <div style={{ height: h, borderRadius: h / 2, background: bg, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${Math.min(pct, 100)}%`,
      borderRadius: h / 2, background: color,
      transition: "width .8s cubic-bezier(.4,0,.2,1)",
    }} />
  </div>
);

export const Section = ({ eyebrow, title, sub, right }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", margin: "36px 0 18px", gap: 16 }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      {eyebrow && <div style={{ marginBottom: 6 }}><Eyebrow>{eyebrow}</Eyebrow></div>}
      <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{title}</div>
      {sub && <div style={{ fontSize: 14, color: "#8A8A86", marginTop: 4 }}>{sub}</div>}
    </div>
    {right && <div style={{ display: "flex", gap: 10 }}>{right}</div>}
  </div>
);

export const Toast = ({ msg, type = "success" }) => {
  if (!msg) return null;
  const colors = { success: ["#152741", "#F7F4EE", "#8DBF94"], error: ["#B83A3A", "#F7F4EE", "#B83A3A"], info: ["#1E3556", "#F7F4EE", "#B9CDE0"] };
  const [bg, c, bar] = colors[type] || colors.success;
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32,
      background: bg, color: c, padding: "14px 22px 14px 18px",
      borderRadius: 12, fontSize: 14, fontWeight: 500,
      zIndex: 999, boxShadow: "0 12px 36px rgba(21,39,65,.25)",
      animation: "ti .3s ease", maxWidth: 380,
      borderLeft: `3px solid ${bar}`,
      display: "flex", alignItems: "center", gap: 10,
    }}>{msg}</div>
  );
};

export const Btn = ({ children, onClick, disabled, variant = "primary", size = "md", icon, style }) => {
  const variants = {
    primary: { bg: "#152741", c: "#F7F4EE", bd: "#152741", hbg: "#1E3556" },
    secondary: { bg: "#FBF9F4", c: "#152741", bd: "#D9D3C5", hbg: "#F7F4EE" },
    ghost: { bg: "transparent", c: "#152741", bd: "transparent", hbg: "#EFEBE2" },
    accent: { bg: "#E8A13C", c: "#152741", bd: "#E8A13C", hbg: "#D89030" },
    danger: { bg: "#FBF9F4", c: "#B83A3A", bd: "#F4E0E0", hbg: "#F4E0E0" },
  };
  const v = variants[variant] || variants.primary;
  const sizes = { sm: "8px 14px", md: "11px 20px", lg: "14px 26px" };
  const fs = { sm: 13, md: 14, lg: 15 };
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="ch"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: sizes[size], borderRadius: 10,
        border: `1px solid ${v.bd}`,
        background: hover && !disabled ? v.hbg : v.bg,
        color: v.c, fontSize: fs[size], fontWeight: 500,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        whiteSpace: "nowrap", ...style,
      }}
    >{icon}{children}</button>
  );
};

export const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 12, color: "#5A5A58", marginBottom: 6, fontWeight: 500 }}>{label}</div>
    {children}
    {hint && <div style={{ fontSize: 12, color: "#8A8A86", marginTop: 5 }}>{hint}</div>}
  </div>
);

export const Inp = (props) => (
  <input {...props} style={{
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid #D9D3C5", fontSize: 14,
    background: "#FBF9F4", color: "#3C3C3B",
    transition: "border-color .15s ease, box-shadow .15s ease",
    ...(props.style || {}),
  }} />
);

export const Sel = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={{
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid #D9D3C5", fontSize: 14,
    background: "#FBF9F4", color: "#3C3C3B", appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A86' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36,
  }}>
    <option value="">{placeholder || "Selecionar..."}</option>
    {options.map((o) => (<option key={o.v} value={o.v}>{o.l}</option>))}
  </select>
);

export const Modal = ({ open, onClose, title, eyebrow, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      animation: "fu .2s ease both",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#FBF9F4", borderRadius: 18,
        width: "100%", maxWidth: width, maxHeight: "86vh",
        overflowY: "auto", animation: "ti .25s ease both",
        border: "1px solid #E5E0D4",
        boxShadow: "0 24px 64px rgba(21,39,65,.18)",
      }}>
        <div style={{ padding: "24px 28px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            {eyebrow && <div style={{ marginBottom: 8 }}><Eyebrow>{eyebrow}</Eyebrow></div>}
            <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: "#152741", lineHeight: 1.15, letterSpacing: "-0.02em" }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ padding: 6, color: "#8A8A86", borderRadius: 8, display: "flex" }} className="ch"><Icon name="x" size={20} /></button>
        </div>
        <div style={{ padding: "12px 28px 28px" }}>{children}</div>
      </div>
    </div>
  );
};
