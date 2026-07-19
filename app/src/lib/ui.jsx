import { useState, useId, useRef, useEffect, cloneElement, isValidElement } from "react";
import { Icon } from "./icons.jsx";

export const Eyebrow = ({ children, color = "var(--text-muted-2)" }) => (
  <span className="mono" style={{ color, fontSize: 11, fontWeight: 500 }}>{children}</span>
);

export const Av = ({ t, bg, sz = 40, color = "#152741", photoUrl }) => (
  <div style={{
    width: sz, height: sz, borderRadius: sz * 0.5,
    background: photoUrl ? `center/cover no-repeat url(${photoUrl})` : (bg || "#DCE7F0"),
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "DM Sans", fontSize: sz * 0.36, fontWeight: 600,
    color, flexShrink: 0, letterSpacing: "-0.01em",
    overflow: "hidden",
  }}>{photoUrl ? null : t}</div>
);

export const Tag = ({ children, type = "default" }) => {
  const m = {
    realizada: ["#DDEADE", "#2F6139"], falta: ["#F4E0E0", "#A82E2E"],
    agendada: ["#DCE7F0", "#1E3556"], pago: ["#DDEADE", "#2F6139"],
    pendente: ["#F5E5CD", "#8A5011"], director: ["#F5F2EC", "#152741"],
    professional: ["#DDEADE", "#2F6139"], parent: ["#DCE7F0", "#1E3556"],
    admin: ["#152741", "#F7F4EE"], default: ["#F5F2EC", "#3C3C3B"],
    amber: ["#F5D9A8", "#8A5011"], sage: ["#C7DDCB", "#2F6139"],
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
    background: "var(--surface)", borderRadius: 14, padding: pad,
    border: "1px solid var(--border)",
    cursor: onClick ? "pointer" : "default",
    animationDelay: `${delay}ms`,
    transition: "border-color .15s ease, box-shadow .15s ease, transform .12s ease",
    ...style,
  }}
    onMouseEnter={onClick ? (e) => { e.currentTarget.style.borderColor = "var(--text-strong)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(21,39,65,.06)"; } : undefined}
    onMouseLeave={onClick ? (e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; } : undefined}
  >{children}</div>
);

export const Stat = ({ label, value, suffix, color = "var(--text-strong)", bg = "var(--surface)", trend, accent }) => (
  <div style={{
    background: bg, borderRadius: 14, padding: "22px 22px 20px",
    border: "1px solid var(--border)", flex: 1, position: "relative", overflow: "hidden",
  }}>
    {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />}
    <Eyebrow>{label}</Eyebrow>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
      <span className="serif" style={{ fontSize: 36, fontWeight: 300, color, lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</span>
      {suffix && <span style={{ fontFamily: "DM Sans", fontSize: 14, color: "#6E6E68", fontWeight: 500 }}>{suffix}</span>}
    </div>
    {trend && <div style={{ fontSize: 12, color: "#6E6E68", marginTop: 6 }}>{trend}</div>}
  </div>
);

export const Progress = ({ pct, color = "#152741", h = 6, bg = "#F5F2EC" }) => (
  <div style={{ height: h, borderRadius: h / 2, background: bg, overflow: "hidden" }}>
    <div style={{
      height: "100%", width: `${Math.min(pct, 100)}%`,
      borderRadius: h / 2, background: color,
      transition: "width .8s cubic-bezier(.4,0,.2,1)",
    }} />
  </div>
);

export const Section = ({ eyebrow, title, sub, right }) => (
  <div className="section-stack" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", margin: "28px 0 16px", gap: 16 }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      {eyebrow && <div style={{ marginBottom: 6 }}><Eyebrow>{eyebrow}</Eyebrow></div>}
      <h2 className="serif" style={{ margin: 0, fontSize: 24, fontWeight: 300, color: "var(--text-strong)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{title}</h2>
      {sub && <div style={{ fontSize: 14, color: "var(--text-muted-2)", marginTop: 4 }}>{sub}</div>}
    </div>
    {right && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{right}</div>}
  </div>
);

export const Toast = ({ msg, type = "success" }) => {
  if (!msg) return null;
  const colors = { success: ["#152741", "#F7F4EE", "#8DBF94"], error: ["#B83A3A", "#F7F4EE", "#B83A3A"], info: ["#1E3556", "#F7F4EE", "#B9CDE0"] };
  const [bg, c, bar] = colors[type] || colors.success;
  const isError = type === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      style={{
        position: "fixed",
        bottom: "max(32px, calc(var(--tabbar-h) + var(--safe-bottom) + 16px))",
        right: 16, left: 16,
        background: bg, color: c, padding: "14px 22px 14px 18px",
        borderRadius: 12, fontSize: 14, fontWeight: 500,
        zIndex: 999, boxShadow: "0 12px 36px rgba(21,39,65,.25)",
        animation: "ti .3s ease", maxWidth: 380, marginLeft: "auto",
        borderLeft: `3px solid ${bar}`,
        display: "flex", alignItems: "center", gap: 10,
    }}>{msg}</div>
  );
};

export const Btn = ({ children, onClick, disabled, loading, variant = "primary", size = "md", icon, style, ...rest }) => {
  const variants = {
    primary: { bg: "var(--brand-bg)", c: "var(--brand-contrast)", bd: "var(--brand-bg)", hbg: "var(--brand-bg-hover)" },
    secondary: { bg: "var(--surface)", c: "var(--text-strong)", bd: "var(--border-strong)", hbg: "var(--surface-2)" },
    ghost: { bg: "transparent", c: "var(--text-strong)", bd: "transparent", hbg: "var(--surface-2)" },
    accent: { bg: "#E8A13C", c: "#152741", bd: "#E8A13C", hbg: "#D89030" },
    danger: { bg: "var(--surface)", c: "#B83A3A", bd: "#F4E0E0", hbg: "#F4E0E0" },
  };
  const v = variants[variant] || variants.primary;
  const sizes = { sm: "8px 14px", md: "11px 20px", lg: "14px 26px" };
  const fs = { sm: 13, md: 14, lg: 15 };
  const [hover, setHover] = useState(false);
  const isDisabled = disabled || loading;
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className="ch"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: sizes[size], borderRadius: 10,
        border: `1px solid ${v.bd}`,
        background: hover && !isDisabled ? v.hbg : v.bg,
        color: v.c, fontSize: fs[size], fontWeight: 500,
        opacity: isDisabled ? 0.6 : 1,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        whiteSpace: "nowrap", ...style,
      }}
      {...rest}
    >
      {loading && <span aria-hidden="true" className="btn-spinner" style={{ width: fs[size], height: fs[size], border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />}
      {!loading && (typeof icon === "string" ? <Icon name={icon} size={fs[size] + 2} /> : icon)}
      {children}
    </button>
  );
};

export const Field = ({ label, hint, error, children }) => {
  const id = useId();
  const hintId = hint ? id + "-hint" : undefined;
  const errId = error ? id + "-err" : undefined;
  const describedBy = [errId, hintId].filter(Boolean).join(" ") || undefined;
  // Liga <label> ao controlo (leitores de ecrã anunciam o campo) e injeta
  // aria-describedby (hint/erro) + aria-invalid quando há erro.
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || id,
        "aria-describedby": [children.props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? true : children.props["aria-invalid"],
      })
    : children;
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label htmlFor={id} style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 6, fontWeight: 500 }}>{label}</label>}
      {control}
      {error && <div id={errId} role="alert" style={{ fontSize: 12, color: "#B02A1E", marginTop: 5 }}>{error}</div>}
      {hint && <div id={hintId} style={{ fontSize: 12, color: "#6E6E68", marginTop: 5 }}>{hint}</div>}
    </div>
  );
};

export const Inp = (props) => (
  <input {...props} style={{
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid var(--border-strong)", fontSize: 14,
    background: "var(--surface)", color: "var(--text)",
    transition: "border-color .15s ease, box-shadow .15s ease",
    ...(props.style || {}),
  }} />
);

export const Sel = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={{
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid var(--border-strong)", fontSize: 14,
    background: "var(--surface)", color: "var(--text)", appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A86' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36,
  }}>
    <option value="">{placeholder || "Selecionar..."}</option>
    {options.map((o) => (<option key={o.v} value={o.v}>{o.l}</option>))}
  </select>
);

export const Modal = ({ open, onClose, title, eyebrow, children, width = 520 }) => {
  const panelRef = useRef(null);
  const titleId = useId();
  // Gestão de foco: guarda o elemento ativo, foca o painel ao abrir, faz trap
  // do Tab e restaura o foco ao fechar. Escape fecha (listener de documento, por
  // isso funciona sem clicar primeiro dentro do modal).
  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => panel
      ? [...panel.querySelectorAll('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null)
      : [];
    // Foca o primeiro campo interativo, ou o painel.
    const first = focusables()[0];
    (first || panel)?.focus?.();
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose?.(); return; }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (!els.length) return;
      const idx = els.indexOf(document.activeElement);
      if (e.shiftKey && (idx <= 0)) { e.preventDefault(); els[els.length - 1].focus(); }
      else if (!e.shiftKey && (idx === els.length - 1)) { e.preventDefault(); els[0].focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={typeof title === "string" ? titleId : undefined}
      className="modal-overlay"
      style={{
        position: "fixed", inset: 0, background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)",
        zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        animation: "fu .2s ease both",
      }}
    >
      <div ref={panelRef} onClick={(e) => e.stopPropagation()} className="modal-panel" tabIndex={-1} style={{
        background: "var(--surface)", borderRadius: 18,
        width: "100%", maxWidth: width, maxHeight: "86vh",
        overflowY: "auto", animation: "ti .25s ease both",
        border: "1px solid var(--border)", outline: "none",
        boxShadow: "0 24px 64px rgba(21,39,65,.18)",
      }}>
        <div style={{ padding: "24px 28px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            {eyebrow && <div style={{ marginBottom: 8 }}><Eyebrow>{eyebrow}</Eyebrow></div>}
            <h2 id={titleId} className="serif" style={{ margin: 0, fontSize: 24, fontWeight: 300, color: "var(--text-strong)", lineHeight: 1.15, letterSpacing: "-0.02em" }}>{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ padding: 6, color: "#6E6E68", borderRadius: 8, display: "flex" }} className="ch tap-target"><Icon name="x" size={20} /></button>
        </div>
        <div style={{ padding: "12px 28px 28px" }}>{children}</div>
      </div>
    </div>
  );
};

// Placeholder de carregamento (shimmer). Reserva espaço para evitar saltos de
// layout (CLS) enquanto os dados do Firestore chegam.
export const Skeleton = ({ w = "100%", h = 16, r = 8, style }) => (
  <span aria-hidden="true" className="skeleton" style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />
);

export const SkeletonCard = ({ lines = 3 }) => (
  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
    <Skeleton w="40%" h={12} />
    {Array.from({ length: lines }).map((_, i) => <Skeleton key={i} w={i === lines - 1 ? "70%" : "100%"} h={14} />)}
  </div>
);

// Estado vazio consistente: ícone + mensagem + ação opcional.
export const EmptyState = ({ icon = "inbox", title, message, action }) => (
  <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--text-muted-2)" }}>
    <div style={{ display: "inline-flex", width: 48, height: 48, borderRadius: 24, background: "var(--surface-2)", color: "var(--text-muted-2)", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
      <Icon name={icon} size={22} />
    </div>
    {title && <div className="serif" style={{ fontSize: 18, fontWeight: 400, color: "var(--text-strong)", marginBottom: 4 }}>{title}</div>}
    {message && <div style={{ fontSize: 13.5, maxWidth: 360, margin: "0 auto 16px" }}>{message}</div>}
    {action}
  </div>
);

export const ConfirmModal = ({ open, onClose, onConfirm, title, eyebrow, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", variant = "danger", busy = false }) => {
  if (!open) return null;
  return (
    <Modal open={open} onClose={busy ? undefined : onClose} title={title} eyebrow={eyebrow} width={460}>
      <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 22 }}>{message}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn variant="secondary" onClick={onClose} disabled={busy}>{cancelLabel}</Btn>
        <Btn variant={variant} onClick={onConfirm} loading={busy}>{confirmLabel}</Btn>
      </div>
    </Modal>
  );
};

export const Clickable = ({ children, onClick, style, className, label, ...rest }) => (
  <div
    role="button"
    tabIndex={0}
    aria-label={label}
    className={className}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(e); } }}
    style={style}
    {...rest}
  >{children}</div>
);
