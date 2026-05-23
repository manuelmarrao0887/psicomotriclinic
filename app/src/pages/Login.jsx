import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sb } from "../lib/firebase.js";
import { Mark, Icon } from "../lib/icons.jsx";
import { Eyebrow, Field, Btn } from "../lib/ui.jsx";

const ptErr = (m) => {
  const s = (m || "").toLowerCase();
  if (s.includes("already") || s.includes("in-use") || s.includes("already registered")) return "Este email já está registado. Tente entrar.";
  if (s.includes("rate limit") || s.includes("too-many")) return "Demasiadas tentativas seguidas. Aguarde alguns minutos.";
  if (s.includes("invalid-email") || (s.includes("invalid") && s.includes("email"))) return "O endereço de email não é válido.";
  if (s.includes("password") || s.includes("weak")) return "Password inválida — mínimo 6 caracteres.";
  return "Não foi possível processar. Tente novamente.";
};

export default function Login() {
  const navigate = useNavigate();
  const [v, setV] = useState(false);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [selRole, setSelRole] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setTimeout(() => setV(true), 60); }, []);

  const doLogin = async () => {
    if (!email || !pw) return;
    setBusy(true); setErr("");
    const { error } = await sb.auth.signInWithPassword({ email, password: pw });
    if (error) { setErr("Email/utilizador ou password incorretos."); setBusy(false); return; }
    setBusy(false);
    navigate("/dashboard", { replace: true });
  };

  const doRegister = async () => {
    if (!name || !email || !pw || !selRole) return;
    if (pw.length < 6) { setErr("Password: mínimo 6 caracteres."); return; }
    setBusy(true); setErr("");
    const { data, error } = await sb.auth.signUp({ email, password: pw, options: { data: { full_name: name, role: selRole } } });
    if (error) { setErr(ptErr(error.message)); setBusy(false); return; }
    setBusy(false);
    if (data?.session) navigate("/dashboard", { replace: true });
    else setMode("check");
  };

  const doGoogle = async () => {
    await sb.auth.signInWithOAuth({ provider: "google" });
  };

  const fieldSt = {
    width: "100%", padding: "13px 16px", borderRadius: 10,
    border: "1px solid #D9D3C5", fontSize: 14.5,
    background: "#FBF9F4", color: "#3C3C3B", marginBottom: 10,
  };

  return (
    <div style={{
      minHeight: "100vh", display: "grid", gridTemplateColumns: "1.05fr 1fr",
      background: "#F7F4EE", opacity: v ? 1 : 0, transition: "opacity .4s",
    }}>
      {/* LEFT — Brand panel */}
      <div style={{
        background: "#152741", color: "#F7F4EE",
        padding: "44px 56px 44px",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
      }}>
        <svg viewBox="0 0 800 800" style={{ position: "absolute", right: -160, bottom: -200, width: 780, height: 780, opacity: .18, pointerEvents: "none" }}>
          <circle cx="400" cy="120" r="50" fill="#E8A13C" />
          <circle cx="420" cy="280" r="100" fill="#8DBF94" />
          <ellipse cx="320" cy="540" rx="220" ry="150" fill="#B9CDE0" />
          <ellipse cx="480" cy="580" rx="200" ry="135" fill="#F7F4EE" />
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
          <Mark size={42} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", color: "#F7F4EE" }}>
              PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span>
            </span>
            <span className="mono" style={{ color: "rgba(247,244,238,.55)", fontSize: 9.5, marginTop: 5 }}>A CASA · CLÍNICA · FORMAÇÃO</span>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", maxWidth: 520, position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ marginBottom: 18 }}><span className="mono" style={{ color: "#E8A13C" }}>— GESTÃO CLÍNICA</span></div>
            <h1 className="serif" style={{ fontSize: 62, fontWeight: 300, lineHeight: 0.98, letterSpacing: "-0.035em", marginBottom: 20 }}>
              Uma casa<br />para o corpo<br /><span className="serif-it" style={{ color: "#E8A13C" }}>que pensa.</span>
            </h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "rgba(247,244,238,.72)", maxWidth: 430 }}>
              Plataforma de gestão para a equipa clínica e formação — agenda, casos, pagamentos e acompanhamento parental, num só sítio.
            </p>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 32, fontSize: 12.5, color: "rgba(247,244,238,.55)" }}>
          <span>acasadapsicomotricidade.pt</span>
          <span>·</span>
          <span>Brand v2.0 · 2026</span>
        </div>
      </div>

      {/* RIGHT — Auth panel */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          {mode === "login" && (
            <div className="fu">
              <Eyebrow>— ENTRAR</Eyebrow>
              <h2 className="serif" style={{ fontSize: 36, fontWeight: 300, color: "#152741", margin: "10px 0 8px", letterSpacing: "-0.025em" }}>Bem-vindo<span className="serif-it">.</span></h2>
              <p style={{ fontSize: 14.5, color: "#8A8A86", marginBottom: 28 }}>Aceda à plataforma com a sua conta.</p>

              <Field label="Email ou utilizador">
                <input type="text" placeholder="nome@email.pt  ou  utilizador" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldSt} />
              </Field>
              <Field label="Password">
                <input type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doLogin()} style={fieldSt} />
              </Field>

              {err && <div style={{ padding: "10px 12px", borderRadius: 10, background: "#F4E0E0", color: "#B83A3A", fontSize: 13, marginBottom: 12 }}>{err}</div>}

              <Btn onClick={doLogin} disabled={busy} style={{ width: "100%", padding: "13px 0" }}>{busy ? "A entrar..." : "Entrar"}</Btn>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#E5E0D4" }} />
                <span className="mono" style={{ color: "#8A8A86" }}>OU</span>
                <div style={{ flex: 1, height: 1, background: "#E5E0D4" }} />
              </div>

              <Btn variant="secondary" onClick={doGoogle} icon={<Icon name="google" size={18} />} style={{ width: "100%", padding: "12px 0" }}>Continuar com Google</Btn>

              <div style={{ textAlign: "center", marginTop: 28, fontSize: 13.5, color: "#8A8A86" }}>
                Sem conta?{" "}
                <span onClick={() => { setMode("register"); setErr(""); }} style={{ color: "#152741", fontWeight: 500, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Criar conta</span>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div className="fu">
              <Eyebrow>— NOVA CONTA</Eyebrow>
              <h2 className="serif" style={{ fontSize: 36, fontWeight: 300, color: "#152741", margin: "10px 0 8px", letterSpacing: "-0.025em" }}>Criar<span className="serif-it"> conta.</span></h2>
              <p style={{ fontSize: 14.5, color: "#8A8A86", marginBottom: 24 }}>Profissionais e famílias acompanhadas pela Casa.</p>

              <Field label="Nome completo"><input placeholder="Ana Ribeiro" value={name} onChange={(e) => setName(e.target.value)} style={fieldSt} /></Field>
              <Field label="Email ou utilizador" hint="Pode ser só um nome de utilizador, sem email">
                <input type="text" placeholder="ana@email.pt  ou  utilizador" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldSt} />
              </Field>
              <Field label="Password" hint="Mínimo 6 caracteres"><input type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} style={fieldSt} /></Field>

              <div style={{ fontSize: 12, color: "#5A5A58", marginBottom: 8, fontWeight: 500 }}>Sou…</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[{ id: "parent", l: "Responsável" }, { id: "professional", l: "Profissional" }, { id: "director", l: "Diretor" }].map((r) => (
                  <div key={r.id} onClick={() => setSelRole(r.id)} className="ch" style={{
                    padding: "14px 8px", borderRadius: 10,
                    background: selRole === r.id ? "#152741" : "#FBF9F4",
                    color: selRole === r.id ? "#F7F4EE" : "#3C3C3B",
                    border: `1px solid ${selRole === r.id ? "#152741" : "#D9D3C5"}`,
                    cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 500,
                  }}>{r.l}</div>
                ))}
              </div>

              {err && <div style={{ padding: "10px 12px", borderRadius: 10, background: "#F4E0E0", color: "#B83A3A", fontSize: 13, marginBottom: 12 }}>{err}</div>}

              <Btn onClick={doRegister} disabled={busy || !name || !email || !pw || !selRole} style={{ width: "100%", padding: "13px 0" }}>{busy ? "A criar..." : "Criar conta"}</Btn>

              <div style={{ textAlign: "center", marginTop: 24, fontSize: 13.5, color: "#8A8A86" }}>
                Já tem conta?{" "}
                <span onClick={() => { setMode("login"); setErr(""); }} style={{ color: "#152741", fontWeight: 500, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Entrar</span>
              </div>
            </div>
          )}

          {mode === "check" && (
            <div className="fu" style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: "#F5E5CD", color: "#C97A1F", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Icon name="mail" size={26} />
              </div>
              <Eyebrow>— QUASE LÁ</Eyebrow>
              <h2 className="serif" style={{ fontSize: 30, fontWeight: 300, color: "#152741", margin: "8px 0 10px" }}>Confirme o email<span className="serif-it">.</span></h2>
              <p style={{ fontSize: 14.5, color: "#8A8A86", marginBottom: 24, lineHeight: 1.6 }}>
                Enviámos um link de confirmação para <b style={{ color: "#3C3C3B" }}>{email}</b>. Abra-o para ativar a conta e depois faça login.
              </p>
              <Btn variant="secondary" onClick={() => { setMode("login"); setErr(""); setPw(""); }}>Voltar ao início</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
