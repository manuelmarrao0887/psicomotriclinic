import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Mark, Icon } from "../../lib/icons.jsx";
import { Av, Btn, Card, Eyebrow, Tag, Field, Inp, Sel } from "../../lib/ui.jsx";
import { APP_VERSION, formatBuildDate, DAYS, HOURS, MONTHS_2026, MES_PT, CLINIC_CUT } from "../../lib/constants.js";
import { downloadCsv } from "../../lib/csv.js";
import { useStore } from "../../lib/store.jsx";
import ViewToggle from "../../components/ViewToggle.jsx";
import { useViewMode } from "../../lib/useViewMode.js";

// 1. Vínculo explícito do director: professionals.profile_id === user.id (preferido).
// 2. Fallback: match case-insensitive de profile.full_name → professionals.name.
function findMyProfRecord(profs, userId, fullName) {
  if (userId) {
    const byId = profs.find((p) => p.profile_id === userId);
    if (byId) return byId;
  }
  if (!fullName) return null;
  const me = fullName.toLowerCase().trim();
  return profs.find((p) => (p.name || "").toLowerCase().trim() === me)
      || profs.find((p) => (p.name || "").toLowerCase().includes(me))
      || null;
}

export default function ProfessionalPortal({ profile, onLogout, theme, setTheme }) {
  const { pts, profs, notes, announcements, users = [], homeExercises = [], homeAssignments = [], assignHomeExercise, unassignHomeExercise, parentMessages = [], replyToParent, markMessageRead, setNotificationPrefs, setForm, setModal, quickMarkFalta, pays = [], createPayment, togglePayment, deletePayment, updatePayment } = useStore();
  const meDoc = users.find((u) => u.id === profile?.id);
  const myPhoto = meDoc?.photo_url || null;
  const [tab, setTab] = useState("home"); // home | agenda | patients | finance | account

  const myProfRecord = useMemo(() => findMyProfRecord(profs, profile?.id, profile?.full_name), [profs, profile?.id, profile?.full_name]);
  const myProfId = myProfRecord?.id;

  const myPatients = useMemo(() => {
    if (!myProfId) return [];
    return pts.filter((p) => {
      const ids = p.professional_ids?.length ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
      return ids.includes(myProfId);
    });
  }, [pts, myProfId]);

  const myPatientIds = useMemo(() => new Set(myPatients.map((p) => p.id)), [myPatients]);
  const myPayments = useMemo(() => (pays || []).filter((py) => {
    if (py.professional_id) return py.professional_id === myProfId;
    return myPatientIds.has(py.patient_id);
  }), [pays, myPatientIds, myProfId]);
  const pendingCount = myPayments.filter((p) => p.status !== "pago").length;

  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayLabel = todayIdx < DAYS.length ? DAYS[todayIdx] : null;
  const todaysSessions = useMemo(() => {
    if (!todayLabel) return [];
    return myPatients
      .filter((p) => p.day_of_week === todayLabel)
      .sort((a, b) => (a.hour || "").localeCompare(b.hour || ""));
  }, [myPatients, todayLabel]);

  const initials = profile?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "P";
  const { isMobile } = useViewMode();

  const openSessionNote = (patient) => {
    setForm({
      snPatientId: patient.id,
      snDate: new Date().toISOString().slice(0, 10),
      snStatus: "realizada",
      snProf: myProfId || patient.professional_id || "",
      snDomains: [],
      snWork: "", snObs: "", snProgress: "", snNext: "",
    });
    setModal("sessionNote");
  };

  // ─────────── DESKTOP: sidebar navy + main ───────────
  if (!isMobile) {
    const unrepliedCount = (parentMessages || []).filter((m) => {
      if (m.replied_at) return false;
      const pt = myPatients.find((p) => p.id === m.patient_id);
      return !!pt;
    }).length;
    const NAV = [
      { id: "home",     label: "Início",    icon: "home",      badge: unrepliedCount },
      { id: "agenda",   label: "Agenda",    icon: "calendar",  badge: 0 },
      { id: "patients", label: "Pacientes", icon: "clipboard", badge: 0 },
      { id: "finance",  label: "Financeiro", icon: "wallet",   badge: pendingCount },
      { id: "account",  label: "Conta",     icon: "users",     badge: 0 },
    ];
    return (
      <>
        <a href="#main" className="skip-link">Saltar para o conteúdo</a>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh", background: "#F7F9FB" }}>
          <aside aria-label="Navegação" style={{ background: "#152741", color: "#F7F4EE", display: "flex", flexDirection: "column", padding: "22px 16px 18px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
            <div style={{ padding: "4px 8px 22px", borderBottom: "1px solid rgba(247,244,238,.08)", marginBottom: 14, display: "flex", alignItems: "center", gap: 11 }}>
              <Mark size={34} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span></span>
                <span className="mono" style={{ color: "rgba(247,244,238,.45)", fontSize: 9, marginTop: 4 }}>PORTAL PROFISSIONAL</span>
              </div>
            </div>

            {todaysSessions.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ padding: "6px 8px", fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "rgba(247,244,238,.42)" }}>— HOJE · {todaysSessions.length}</div>
                {todaysSessions.slice(0, 5).map((p) => {
                  const ini = (p.name || "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, fontSize: 13, color: "rgba(247,244,238,.85)" }}>
                      <Av t={ini} bg="#DCE7F0" sz={26} />
                      <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                      <span className="mono" style={{ fontSize: 9.5, color: "rgba(247,244,238,.5)" }}>{p.hour}</span>
                    </div>
                  );
                })}
                <div aria-hidden="true" style={{ height: 1, background: "rgba(247,244,238,.08)", margin: "10px 8px 4px" }} />
              </div>
            )}

            <div style={{ padding: "6px 8px 6px", fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "rgba(247,244,238,.42)" }}>— NAVEGAÇÃO</div>
            <nav style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
              {NAV.map((n) => {
                const active = tab === n.id;
                return (
                  <button key={n.id} onClick={() => setTab(n.id)} className="ch" style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 9, background: active ? "rgba(247,244,238,.08)" : "transparent", color: active ? "#F7F4EE" : "rgba(247,244,238,.78)", fontSize: 14, fontWeight: active ? 500 : 400, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", position: "relative" }}>
                    {active && <span aria-hidden="true" style={{ position: "absolute", left: -16, top: 8, bottom: 8, width: 3, background: "#E8A13C", borderRadius: "0 3px 3px 0" }} />}
                    <Icon name={n.icon} size={17} />
                    <span style={{ flex: 1 }}>{n.label}</span>
                    {n.badge > 0 && (
                      <span aria-label={`${n.badge} novidades`} style={{ fontSize: 10.5, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: "#B83A3A", color: "#fff", minWidth: 18, textAlign: "center" }}>{n.badge}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div style={{ marginTop: 12, borderTop: "1px solid rgba(247,244,238,.08)", paddingTop: 14, display: "flex", alignItems: "center", gap: 10, padding: "14px 8px 4px" }}>
              <Av t={initials} bg="#8DBF94" sz={40} color="#152741" photoUrl={myPhoto} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F7F4EE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile?.full_name || "Profissional"}</div>
                <div style={{ fontSize: 11, color: "rgba(247,244,238,.6)" }}>Profissional</div>
              </div>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="ch" aria-label={theme === "dark" ? "Modo claro" : "Modo escuro"} style={{ padding: 6, borderRadius: 8, color: "rgba(247,244,238,.72)", background: "transparent", border: "none", cursor: "pointer", display: "flex" }}><Icon name={theme === "dark" ? "sun" : "moon"} size={16} /></button>
              <button onClick={onLogout} className="ch" aria-label="Terminar sessão" style={{ padding: 6, borderRadius: 8, color: "rgba(247,244,238,.72)", background: "transparent", border: "none", cursor: "pointer", display: "flex" }}><Icon name="logout" size={16} /></button>
            </div>
            <div style={{ padding: "6px 12px 0", fontSize: 10, color: "rgba(247,244,238,.55)" }}>
              <div style={{ fontWeight: 600 }}>{APP_VERSION}</div>
              <div style={{ marginTop: 2 }}>Atualizado: {formatBuildDate()}</div>
            </div>
          </aside>

          <main id="main" style={{ padding: "28px 40px 60px", maxWidth: 1100, width: "100%", margin: "0 auto" }}>
            <div style={{ marginBottom: 22 }}>
              <Eyebrow>— PORTAL PROFISSIONAL</Eyebrow>
              <h1 className="serif" style={{ fontSize: 36, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.05, marginTop: 6 }}>
                Bem-vindo{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}<span className="serif-it">.</span>
              </h1>
              <p style={{ fontSize: 14.5, color: "#8A8A86", marginTop: 6 }}>
                {myProfId
                  ? `${myPatients.length} ${myPatients.length === 1 ? "caso atribuído" : "casos atribuídos"} · ${todaysSessions.length} ${todaysSessions.length === 1 ? "sessão hoje" : "sessões hoje"}`
                  : "Aguardar associação ao registo da equipa."}
              </p>
            </div>

            {tab === "home"     && <ProHome myProfId={myProfId} myPatients={myPatients} todaysSessions={todaysSessions} todayLabel={todayLabel} notes={notes} announcements={announcements} onSessionNote={openSessionNote} onMarkFalta={(p) => quickMarkFalta(p.id, myProfId)} parentMessages={parentMessages} replyToParent={replyToParent} markMessageRead={markMessageRead} />}
            {tab === "agenda"   && <ProAgenda myPatients={myPatients} profs={profs} />}
            {tab === "patients" && <ProPatients myPatients={myPatients} notes={notes} onSessionNote={openSessionNote} homeExercises={homeExercises} homeAssignments={homeAssignments} assignHomeExercise={assignHomeExercise} unassignHomeExercise={unassignHomeExercise} />}
            {tab === "finance"  && <ProFinance myPatients={myPatients} myPayments={myPayments} createPayment={createPayment} togglePayment={togglePayment} deletePayment={deletePayment} updatePayment={updatePayment} />}
            {tab === "account"  && <ProAccount profile={profile} onLogout={onLogout} theme={theme} setTheme={setTheme} />}
          </main>
        </div>
        <ViewToggle position="br" />
      </>
    );
  }

  // ─────────── MOBILE: top bar + bottom tab bar (original) ───────────
  return (
    <>
      <a href="#main" className="skip-link">Saltar para o conteúdo</a>

      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        paddingTop: "var(--safe-top)",
        background: "rgba(255,255,255,.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(234,230,221,.6)",
      }}>
        <div style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mark size={28} />
            <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "#152741" }}>
              PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span>
            </span>
          </div>
          <button onClick={() => setTab("account")} className="ch tap-target" aria-label="Conta" style={{ borderRadius: 999, padding: 0 }}>
            <Av t={initials} bg="#8DBF94" sz={34} color="#152741" photoUrl={myPhoto} />
          </button>
        </div>
      </header>

      <main id="main" className="portal-content" style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 16px calc(var(--tabbar-h) + var(--safe-bottom) + 24px)" }}>
        <div style={{ padding: "8px 2px 6px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <Av t={initials} bg="#8DBF94" sz={56} color="#152741" photoUrl={myPhoto} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow>— PORTAL PROFISSIONAL</Eyebrow>
            <h1 className="serif" style={{ fontSize: 28, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.08, marginTop: 6 }}>
              Bem-vindo{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}<span className="serif-it">.</span>
            </h1>
            <p style={{ fontSize: 14, color: "#8A8A86", marginTop: 4 }}>
              {myProfId
                ? `${myPatients.length} ${myPatients.length === 1 ? "caso atribuído" : "casos atribuídos"} · ${todaysSessions.length} ${todaysSessions.length === 1 ? "sessão hoje" : "sessões hoje"}`
                : "Aguardar associação ao registo da equipa."}
            </p>
          </div>
        </div>

        {tab === "home"     && <ProHome myProfId={myProfId} myPatients={myPatients} todaysSessions={todaysSessions} todayLabel={todayLabel} notes={notes} announcements={announcements} onSessionNote={openSessionNote} onMarkFalta={(p) => quickMarkFalta(p.id, myProfId)} parentMessages={parentMessages} replyToParent={replyToParent} markMessageRead={markMessageRead} />}
        {tab === "agenda"   && <ProAgenda myPatients={myPatients} profs={profs} />}
        {tab === "patients" && <ProPatients myPatients={myPatients} notes={notes} onSessionNote={openSessionNote} homeExercises={homeExercises} homeAssignments={homeAssignments} assignHomeExercise={assignHomeExercise} unassignHomeExercise={unassignHomeExercise} />}
        {tab === "finance"  && <ProFinance myPatients={myPatients} myPayments={myPayments} createPayment={createPayment} togglePayment={togglePayment} deletePayment={deletePayment} updatePayment={updatePayment} />}
        {tab === "account"  && <ProAccount profile={profile} onLogout={onLogout} theme={theme} setTheme={setTheme} />}
      </main>

      <nav className="portal-tabbar" aria-label="Navegação" style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
        paddingBottom: "var(--safe-bottom)",
        background: "rgba(255,255,255,.92)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderTop: "1px solid rgba(234,230,221,.7)",
      }}>
        <div style={{ height: "var(--tabbar-h)", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", maxWidth: 1100, margin: "0 auto" }}>
          {[
            { id: "home",     label: "Início",    icon: "home",      badge: 0 },
            { id: "agenda",   label: "Agenda",    icon: "calendar",  badge: 0 },
            { id: "patients", label: "Pacientes", icon: "clipboard", badge: 0 },
            { id: "finance",  label: "Finan.",    icon: "wallet",    badge: pendingCount },
            { id: "account",  label: "Conta",     icon: "users",     badge: 0 },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="ch tap-target"
              aria-pressed={tab === t.id}
              aria-label={t.label}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                color: tab === t.id ? "#E8A13C" : "#5A5A58",
                fontSize: 10.5, fontWeight: tab === t.id ? 600 : 500,
                position: "relative",
              }}
            >
              <Icon name={t.icon} size={22} />
              <span style={{ color: tab === t.id ? "#E8A13C" : "#5A5A58" }}>{t.label}</span>
              {t.badge > 0 && (
                <span style={{ position: "absolute", top: 4, right: "22%", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 999, background: "#B83A3A", color: "#fff", minWidth: 16, textAlign: "center" }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </nav>
      <ViewToggle position="br" />
    </>
  );
}

// ─────────── Sub-componentes ───────────

function ProHome({ myProfId, myPatients, todaysSessions, todayLabel, notes, announcements, onSessionNote, onMarkFalta, parentMessages = [], replyToParent, markMessageRead }) {
  const [replyFor, setReplyFor] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const myPatientIds = new Set(myPatients.map((p) => p.id));
  const inbox = parentMessages.filter((m) => myPatientIds.has(m.patient_id));
  const unreplied = inbox.filter((m) => !m.replied_at);
  if (!myProfId) return <NoProfRecord />;

  // Próximos: amanhã + dia seguinte
  const tomorrowIdx = ((new Date().getDay() + 6) % 7 + 1) % 7;
  const dayAfterIdx = ((new Date().getDay() + 6) % 7 + 2) % 7;
  const upcoming = [tomorrowIdx, dayAfterIdx]
    .filter((idx) => idx < DAYS.length)
    .flatMap((idx) => myPatients
      .filter((p) => p.day_of_week === DAYS[idx])
      .map((p) => ({ p, day: DAYS[idx] }))
    )
    .sort((a, b) => (a.p.hour || "").localeCompare(b.p.hour || ""));

  // Anúncios visíveis para profissionais (ativos, audience = all OR professional)
  const visibleAnn = (announcements || []).filter((a) => a.active !== false && (a.audience === "all" || a.audience === "professional" || !a.audience));

  // Aniversários dos meus pacientes — próximos 30 dias
  const birthdays = myPatients
    .map((p) => ({ p, days: daysUntilBirthday(p.birth_date), age: ageOnNext(p.birth_date) }))
    .filter((x) => x.days != null && x.days <= 30)
    .sort((a, b) => a.days - b.days);

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 16 }}>
      {visibleAnn.length > 0 && <AnnouncementsBanner items={visibleAnn} />}

      {unreplied.length > 0 && (
        <Card pad={18} style={{ background: "#FEF3C7", borderColor: "#ECC58A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Icon name="mail" size={16} color="#C97A1F" />
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: "#C97A1F" }}>MENSAGENS POR RESPONDER · {unreplied.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {unreplied.slice(0, 5).map((m) => {
              const pt = myPatients.find((p) => p.id === m.patient_id);
              return (
                <button key={m.id} onClick={() => { setReplyFor(m); markMessageRead(m.id); }} style={{ padding: 10, background: "#FFFFFF", border: "1px solid #ECC58A", borderRadius: 10, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#152741", marginBottom: 3 }}>Sobre {pt?.name || "paciente"}</div>
                  <div style={{ fontSize: 12.5, color: "#5A5A58", lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.body}</div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {replyFor && (
        <div onClick={() => setReplyFor(null)} className="modal-overlay" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} className="modal-panel" style={{ background: "#FFFFFF", borderRadius: 18, width: "100%", maxWidth: 480, padding: 22 }}>
            <Eyebrow>— RESPONDER</Eyebrow>
            <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: "#152741", marginTop: 4, marginBottom: 10 }}>
              {(myPatients.find((p) => p.id === replyFor.patient_id) || {}).name || "Mensagem"}
            </div>
            <div style={{ padding: 10, background: "#F5F2EC", borderRadius: 10, fontSize: 13, color: "#152741", marginBottom: 14, lineHeight: 1.5 }}>
              {replyFor.body}
            </div>
            <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="A sua resposta…" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FFFFFF", minHeight: 100, resize: "vertical", fontFamily: "inherit" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <Btn variant="secondary" onClick={() => setReplyFor(null)}>Fechar</Btn>
              <Btn onClick={async () => { await replyToParent(replyFor.id, replyBody); setReplyBody(""); setReplyFor(null); }} disabled={!replyBody.trim()}>Enviar resposta</Btn>
            </div>
          </div>
        </div>
      )}

      <Card pad={18}>
        <Eyebrow>— HOJE · {todayLabel?.toUpperCase()}</Eyebrow>
        {todaysSessions.length === 0 ? (
          <div style={{ marginTop: 10, fontSize: 14, color: "#8A8A86" }}>Sem sessões marcadas para hoje.</div>
        ) : (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {todaysSessions.map((p) => (
              <SessionRow key={p.id} patient={p} onSessionNote={() => onSessionNote(p)} onMarkFalta={() => onMarkFalta(p)} />
            ))}
          </div>
        )}
      </Card>

      {upcoming.length > 0 && (
        <Card pad={18}>
          <Eyebrow>— PRÓXIMOS DIAS</Eyebrow>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.map(({ p, day }) => (
              <div key={`${day}-${p.id}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #F5F2EC", borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: "#8A8A86", width: 70 }} className="mono">{day.slice(0, 3).toUpperCase()} {p.hour}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#8A8A86" }}>{p.session_type === "individual" ? "Individual" : "Grupo"}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {birthdays.length > 0 && (
        <Card pad={18}>
          <Eyebrow>— ANIVERSÁRIOS · 30 DIAS</Eyebrow>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {birthdays.slice(0, 5).map(({ p, days, age }) => {
              const d = p.birth_date ? new Date(p.birth_date) : null;
              const label = d ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}` : "";
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#FFFFFF", border: "1px solid #F5F2EC", borderRadius: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: "#F5D9A8", color: "#C97A1F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="trend" size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#8A8A86" }}>{label} · faz {age} anos · {days === 0 ? "hoje" : days === 1 ? "amanhã" : `em ${days} dias`}</div>
                  </div>
                </div>
              );
            })}
            {birthdays.length > 5 && <div style={{ fontSize: 12, color: "#8A8A86" }}>+ {birthdays.length - 5} aniversários adicionais</div>}
          </div>
        </Card>
      )}

      {/* Stats compactos */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <CompactStat label="MEUS CASOS" value={myPatients.length} accent="#8DBF94" />
        <CompactStat label="HOJE" value={todaysSessions.length} accent="#E8A13C" />
        <CompactStat label="NOTAS (30D)" value={notesByMeRecent(notes, myProfId, 30)} accent="#B9CDE0" />
      </div>
    </div>
  );
}

function daysUntilBirthday(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next.setFullYear(next.getFullYear() + 1);
  return Math.round((next - today) / 86400000);
}
function ageOnNext(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return today.getFullYear() - d.getFullYear() + 1;
}

function AnnouncementsBanner({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.slice(0, 3).map((a) => (
        <div key={a.id} style={{ padding: "14px 16px", borderRadius: 14, background: "#F5E5CD", border: "1px solid #ECC58A", color: "#C97A1F" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Icon name="mail" size={16} />
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 600 }}>DA DIREÇÃO</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#7A4A0E", marginBottom: 4 }}>{a.title}</div>
          <div style={{ fontSize: 13.5, color: "#7A4A0E", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{a.body}</div>
        </div>
      ))}
    </div>
  );
}

function notesByMeRecent(notes, myId, days) {
  if (!myId) return 0;
  const cutoff = Date.now() - days * 86400000;
  return notes.filter((n) => n.professional_id === myId && n.date && new Date(n.date).getTime() >= cutoff).length;
}

function CompactStat({ label, value, accent }) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "14px 14px 12px", border: "1px solid #EAE6DD", position: "relative", overflow: "hidden" }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />}
      <Eyebrow>{label}</Eyebrow>
      <div className="serif" style={{ fontSize: 28, fontWeight: 300, color: "#152741", lineHeight: 1, letterSpacing: "-0.025em", marginTop: 8 }}>{value}</div>
    </div>
  );
}

function SessionRow({ patient, onSessionNote, onMarkFalta }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFFFFF", border: "1px solid #F5F2EC", borderRadius: 12, flexWrap: "wrap" }}>
      <div style={{ fontSize: 13, color: "#152741", fontWeight: 600, width: 56 }} className="mono">{patient.hour}</div>
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{patient.name}</div>
        <div style={{ fontSize: 12, color: "#8A8A86", marginTop: 2 }}>
          {patient.age} anos · {patient.session_type === "individual" ? "Individual" : "Grupo"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {onMarkFalta && (
          <Btn size="sm" variant="danger" onClick={() => {
            if (confirm(`Marcar falta para ${patient.name}?`)) onMarkFalta();
          }}>Falta</Btn>
        )}
        <Btn size="sm" variant="secondary" icon={<Icon name="plus" size={13} />} onClick={onSessionNote}>Nota</Btn>
      </div>
    </div>
  );
}

function ProAgenda({ myPatients, profs }) {
  // Grelha semana × horas — versão simples (escondem-se células vazias visualmente).
  const slot = (day, hour) => myPatients.filter((p) => p.day_of_week === day && p.hour === hour);

  // Tira horas em que ninguém tem nada para reduzir scroll
  const usefulHours = HOURS.filter((h) => DAYS.some((d) => slot(d, h).length > 0));
  const finalHours = usefulHours.length > 0 ? usefulHours : HOURS;

  return (
    <div style={{ marginTop: 14 }}>
      <Card pad={0} style={{ overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `70px repeat(${DAYS.length}, minmax(120px, 1fr))`, minWidth: 600 }}>
          <div style={{ padding: "10px 8px", background: "#F5F2EC", borderBottom: "1px solid #EAE6DD" }}><Eyebrow>Hora</Eyebrow></div>
          {DAYS.map((d) => (
            <div key={d} style={{ padding: "10px 12px", background: "#F5F2EC", borderBottom: "1px solid #EAE6DD", borderLeft: "1px solid #EAE6DD" }}>
              <Eyebrow>{d.slice(0, 3)}</Eyebrow>
            </div>
          ))}
          {finalHours.map((h) => (
            <Fragment key={h}>
              <div style={{ padding: "10px 8px", borderBottom: "1px solid #F5F2EC", fontSize: 12, color: "#5A5A58", fontWeight: 500 }} className="mono">{h}</div>
              {DAYS.map((d) => {
                const items = slot(d, h);
                return (
                  <div key={d + h} style={{ padding: 6, borderLeft: "1px solid #F5F2EC", borderBottom: "1px solid #F5F2EC", minHeight: 54, background: items.length === 0 ? "transparent" : "#FFFFFF" }}>
                    {items.map((p) => (
                      <div key={p.id} style={{ padding: "5px 7px", borderRadius: 6, background: "#DCE7F0", marginBottom: 4, fontSize: 12 }}>
                        <div style={{ fontWeight: 500, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                        <div style={{ color: "#5A5A58", fontSize: 10.5, marginTop: 1 }}>{p.session_type === "individual" ? "Indiv." : "Grupo"}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ProPatients({ myPatients, notes, onSessionNote, homeExercises, homeAssignments, assignHomeExercise, unassignHomeExercise }) {
  const [search, setSearch] = useState("");
  const [assignFor, setAssignFor] = useState(null);
  const [assignForm, setAssignForm] = useState({ exercise_id: "", custom_notes: "" });
  const filtered = myPatients.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  if (myPatients.length === 0) return <NoProfRecord />;

  const doAssign = async () => {
    if (!assignFor || !assignForm.exercise_id) return;
    await assignHomeExercise(assignFor.id, assignForm.exercise_id, assignForm.custom_notes);
    setAssignFor(null);
    setAssignForm({ exercise_id: "", custom_notes: "" });
  };

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ position: "relative" }}>
        <label htmlFor="pro-search" className="sr-only">Procurar paciente</label>
        <div aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8A8A86", display: "flex" }}><Icon name="search" size={16} /></div>
        <input id="pro-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar paciente…" aria-label="Procurar paciente" style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: 12, border: "1px solid #D9D3C5", background: "#FFFFFF" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((p) => {
          const ini = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          const myNotesCount = notes.filter((n) => n.patient_id === p.id).length;
          return (
            <Card key={p.id} pad={14}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Av t={ini} bg="#DCE7F0" sz={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#152741" }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, color: "#8A8A86", marginTop: 2 }}>
                    {p.age} anos · {p.day_of_week} · {p.hour} · {p.session_type === "individual" ? "Individual" : "Grupo"}
                  </div>
                </div>
                <Tag type="default">{myNotesCount} {myNotesCount === 1 ? "nota" : "notas"}</Tag>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Btn size="sm" variant="secondary" icon={<Icon name="plus" size={13} />} onClick={() => onSessionNote(p)}>Nota de sessão</Btn>
                <Btn size="sm" variant="accent" icon={<Icon name="trend" size={13} />} onClick={() => setAssignFor(p)}>Atribuir exercício</Btn>
              </div>
              {(() => {
                const active = homeAssignments.filter((a) => a.patient_id === p.id && a.active !== false);
                if (active.length === 0) return null;
                return (
                  <div style={{ marginTop: 10, padding: 10, background: "#F5F2EC", borderRadius: 10 }}>
                    <div className="mono" style={{ fontSize: 10, color: "#8A8A86", marginBottom: 6 }}>PLANO DE CASA ATIVO · {active.length}</div>
                    {active.map((a) => {
                      const ex = homeExercises.find((x) => x.id === a.exercise_id);
                      return (
                        <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 12 }}>
                          <span style={{ color: "#152741" }}>{ex?.title || "—"}</span>
                          <button onClick={() => unassignHomeExercise(a.id)} aria-label="Remover atribuição" style={{ padding: 4, background: "transparent", border: "none", color: "#B83A3A", cursor: "pointer", display: "flex" }}><Icon name="x" size={12} /></button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>
          );
        })}
        {filtered.length === 0 && <div style={{ fontSize: 13.5, color: "#8A8A86", textAlign: "center", padding: 24 }}>Sem resultados.</div>}
      </div>

      {assignFor && (
        <div onClick={() => setAssignFor(null)} className="modal-overlay" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fu .2s ease both" }}>
          <div onClick={(e) => e.stopPropagation()} className="modal-panel" style={{ background: "#FFFFFF", borderRadius: 18, width: "100%", maxWidth: 460, padding: 22, border: "1px solid #EAE6DD", boxShadow: "0 24px 64px rgba(21,39,65,.18)" }}>
            <Eyebrow>— ATRIBUIR EXERCÍCIO</Eyebrow>
            <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: "#152741", marginTop: 4, marginBottom: 14 }}>Plano de casa · {assignFor.name}</div>
            {homeExercises.length === 0 ? (
              <div style={{ padding: 16, background: "#F5E5CD", color: "#C97A1F", borderRadius: 10, fontSize: 13 }}>
                Biblioteca vazia. Pede à direção para adicionar exercícios em /exercicios.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: "#5A5A58", marginBottom: 6, fontWeight: 500 }}>Exercício</div>
                <select value={assignForm.exercise_id} onChange={(e) => setAssignForm((f) => ({ ...f, exercise_id: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FFFFFF", marginBottom: 12, fontFamily: "inherit" }}>
                  <option value="">Selecionar…</option>
                  {homeExercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                </select>
                <div style={{ fontSize: 12, color: "#5A5A58", marginBottom: 6, fontWeight: 500 }}>Notas para o responsável (opcional)</div>
                <textarea value={assignForm.custom_notes} onChange={(e) => setAssignForm((f) => ({ ...f, custom_notes: e.target.value }))} placeholder="Ex: fazer 3× por semana, focar na coordenação…" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FFFFFF", minHeight: 80, resize: "vertical", fontFamily: "inherit", marginBottom: 12 }} />
              </>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setAssignFor(null)}>Cancelar</Btn>
              <Btn onClick={doAssign} disabled={!assignForm.exercise_id}>Atribuir</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProFinance({ myPatients, myPayments, createPayment, togglePayment, deletePayment, updatePayment }) {
  const [view, setView] = useState("mes"); // "mes" | "ano" | "recibos"
  const [month, setMonth] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ patient_id: "", month: "", amount: "", status: "pendente", method: "", notes: "" });
  const [receiptFor, setReceiptFor] = useState(null); // payment obj
  const [busy, setBusy] = useState(false);

  const months = useMemo(() => {
    const set = new Set(myPayments.map((p) => p.month).filter(Boolean));
    return Array.from(set).sort((a, b) => MONTHS_2026.indexOf(b) - MONTHS_2026.indexOf(a));
  }, [myPayments]);

  const filtered = useMemo(() => {
    const list = month ? myPayments.filter((p) => p.month === month) : myPayments;
    return [...list].sort((a, b) => (b.paid_date || "").localeCompare(a.paid_date || ""));
  }, [myPayments, month]);

  const total = filtered.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const paid  = filtered.filter((p) => p.status === "pago").reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const pend  = total - paid;
  const clinicCut = paid * CLINIC_CUT;
  const netCut = paid - clinicCut;

  const submitAdd = async () => {
    if (!addForm.patient_id || !addForm.amount || !addForm.month) return;
    setBusy(true);
    try {
      await createPayment({
        patient_id: addForm.patient_id,
        month: addForm.month,
        amount: parseFloat(addForm.amount),
        status: addForm.status,
        method: addForm.method || null,
        notes: addForm.notes || null,
      });
      setAddOpen(false);
      setAddForm({ patient_id: "", month: "", amount: "", status: "pendente", method: "", notes: "" });
    } finally {
      setBusy(false);
    }
  };

  // Agregado por mês (para vista Ano)
  const byMonth = useMemo(() => {
    const map = new Map();
    for (const p of myPayments) {
      const k = p.month || "—";
      const cur = map.get(k) || { month: k, total: 0, paid: 0, pending: 0, count: 0 };
      const amt = parseFloat(p.amount) || 0;
      cur.total += amt;
      cur.count += 1;
      if (p.status === "pago") cur.paid += amt; else cur.pending += amt;
      map.set(k, cur);
    }
    const arr = Array.from(map.values());
    arr.sort((a, b) => MONTHS_2026.indexOf(a.month) - MONTHS_2026.indexOf(b.month));
    return arr;
  }, [myPayments]);

  const yearTotal = byMonth.reduce((s, m) => s + m.paid, 0);
  const yearClinic = yearTotal * CLINIC_CUT;
  const yearNet = yearTotal - yearClinic;

  const exportCsv = () => {
    const rows = filtered.map((p) => {
      const pt = myPatients.find((x) => x.id === p.patient_id);
      return { ...p, patient_name: pt?.name || "" };
    });
    downloadCsv(`financeiro-${month || "todos"}.csv`, rows, [
      { key: "patient_name", label: "Paciente" },
      { key: "month", label: "Mês" },
      { key: "amount", label: "Valor" },
      { key: "status", label: "Estado" },
      { key: "method", label: "Método" },
      { key: "paid_date", label: "Data pag." },
      { key: "notes", label: "Notas" },
    ]);
  };

  const exportYearCsv = () => {
    downloadCsv("financeiro-anual.csv", byMonth, [
      { key: "month", label: "Mês" },
      { key: "count", label: "Nº pag." },
      { key: "total", label: "Total (€)" },
      { key: "paid", label: "Recebido (€)" },
      { key: "pending", label: "Pendente (€)" },
    ]);
  };

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Sub-view switcher */}
      <div style={{ display: "flex", gap: 6, padding: 4, background: "#F5F2EC", borderRadius: 999, alignSelf: "flex-start" }}>
        {[
          { v: "mes", l: "Mensal" },
          { v: "ano", l: "Ano / IRS" },
        ].map((x) => (
          <button key={x.v} onClick={() => setView(x.v)} className="ch" style={{
            padding: "7px 14px", borderRadius: 999,
            background: view === x.v ? "#152741" : "transparent",
            color: view === x.v ? "#F7F4EE" : "#5A5A58",
            fontSize: 12.5, fontWeight: 600,
            border: "none", cursor: "pointer",
          }}>{x.l}</button>
        ))}
      </div>

      {view === "mes" && <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <Card pad={16}>
          <div style={{ fontSize: 10.5, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86" }} className="mono">— TOTAL</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{total.toFixed(0)}€</div>
        </Card>
        <Card pad={16}>
          <div style={{ fontSize: 10.5, letterSpacing: ".14em", fontWeight: 700, color: "#8DBF94" }} className="mono">— RECEBIDO</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{paid.toFixed(0)}€</div>
        </Card>
        <Card pad={16}>
          <div style={{ fontSize: 10.5, letterSpacing: ".14em", fontWeight: 700, color: "#C97A1F" }} className="mono">— PENDENTE</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{pend.toFixed(0)}€</div>
        </Card>
      </div>

      <Card pad={16}>
        <Eyebrow>— DISTRIBUIÇÃO (RECEBIDO)</Eyebrow>
        <div style={{ marginTop: 10, fontSize: 13, color: "#3C3C3B", lineHeight: 1.6 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Espaço (Casa · {(CLINIC_CUT * 100).toFixed(0)}%)</span>
            <span style={{ fontWeight: 600 }}>{clinicCut.toFixed(2)}€</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span>Você (líquido · {((1 - CLINIC_CUT) * 100).toFixed(0)}%)</span>
            <span style={{ fontWeight: 600 }}>{netCut.toFixed(2)}€</span>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <Sel value={month} onChange={setMonth} options={months.map((m) => ({ v: m, l: m }))} placeholder="Todos os meses" />
        </div>
        <Btn variant="secondary" onClick={exportCsv} disabled={filtered.length === 0}>Exportar CSV</Btn>
        <Btn onClick={() => setAddOpen(true)} icon="plus">Novo registo</Btn>
      </div>
      </>}

      {view === "mes" && (
      <Card pad={0}>
        {filtered.length === 0 ? (
          <div style={{ padding: 24, fontSize: 14, color: "#8A8A86", textAlign: "center" }}>Sem pagamentos {month ? `em ${month}` : "registados"}.</div>
        ) : (
          <div>
            {filtered.map((p, i) => {
              const pt = myPatients.find((x) => x.id === p.patient_id);
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i > 0 ? "1px solid #F5F2EC" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pt?.name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#8A8A86", marginTop: 2 }}>
                      {p.month || "—"}{p.method ? ` · ${p.method}` : ""}{p.paid_date ? ` · ${p.paid_date}` : ""}
                    </div>
                  </div>
                  <div className="serif" style={{ fontSize: 18, fontWeight: 400, color: "#152741" }}>{parseFloat(p.amount || 0).toFixed(0)}€</div>
                  <button onClick={() => togglePayment(p)} className="ch" style={{ padding: "5px 10px", borderRadius: 999, background: p.status === "pago" ? "#8DBF94" : "#F5D9A8", color: p.status === "pago" ? "#FFFFFF" : "#5A3B10", fontSize: 11.5, fontWeight: 600, border: "none", cursor: "pointer" }}>
                    {p.status === "pago" ? "Pago" : "Pendente"}
                  </button>
                  {p.status === "pago" && (
                    <button onClick={() => setReceiptFor(p)} className="ch" aria-label="Recibo" title="Ver recibo" style={{ padding: 6, borderRadius: 8, color: "#152741", background: "transparent", border: "none", cursor: "pointer", display: "flex" }}>
                      <Icon name="clipboard" size={16} />
                    </button>
                  )}
                  <button onClick={() => { if (confirm("Eliminar pagamento?")) deletePayment(p); }} className="ch" aria-label="Eliminar" style={{ padding: 6, borderRadius: 8, color: "#B83A3A", background: "transparent", border: "none", cursor: "pointer", display: "flex" }}>
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      )}

      {view === "ano" && <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        <Card pad={16}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".14em", fontWeight: 700, color: "#8DBF94" }}>— ANO · RECEBIDO</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{yearTotal.toFixed(0)}€</div>
        </Card>
        <Card pad={16}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86" }}>— CASA ({(CLINIC_CUT * 100).toFixed(0)}%)</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{yearClinic.toFixed(0)}€</div>
        </Card>
        <Card pad={16}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".14em", fontWeight: 700, color: "#E8A13C" }}>— VOCÊ (LÍQUIDO)</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{yearNet.toFixed(0)}€</div>
        </Card>
      </div>
      <Card pad={0}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F5F2EC" }}>
          <Eyebrow>— MENSAL</Eyebrow>
          <Btn variant="secondary" size="sm" onClick={exportYearCsv} disabled={byMonth.length === 0}>Exportar CSV</Btn>
        </div>
        {byMonth.length === 0 ? (
          <div style={{ padding: 24, fontSize: 14, color: "#8A8A86", textAlign: "center" }}>Sem dados anuais.</div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr 1fr 1fr 1fr", padding: "10px 16px", background: "#F5F2EC", fontSize: 10.5, letterSpacing: ".1em", fontWeight: 700, color: "#8A8A86" }} className="mono">
              <span>MÊS</span><span style={{ textAlign: "right" }}>Nº</span><span style={{ textAlign: "right" }}>TOTAL</span><span style={{ textAlign: "right" }}>RECEBIDO</span><span style={{ textAlign: "right" }}>PENDENTE</span>
            </div>
            {byMonth.map((m) => (
              <div key={m.month} style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr 1fr 1fr 1fr", padding: "12px 16px", borderTop: "1px solid #F5F2EC", fontSize: 13, alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "#152741" }}>{m.month}</span>
                <span style={{ textAlign: "right", color: "#8A8A86" }}>{m.count}</span>
                <span style={{ textAlign: "right", color: "#152741" }}>{m.total.toFixed(0)}€</span>
                <span style={{ textAlign: "right", color: "#8DBF94", fontWeight: 600 }}>{m.paid.toFixed(0)}€</span>
                <span style={{ textAlign: "right", color: m.pending > 0 ? "#C97A1F" : "#8A8A86" }}>{m.pending.toFixed(0)}€</span>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr 1fr 1fr 1fr", padding: "14px 16px", borderTop: "2px solid #152741", background: "#F7F9FB", fontSize: 13, fontWeight: 700 }}>
              <span>TOTAL</span>
              <span style={{ textAlign: "right" }}>{byMonth.reduce((s, m) => s + m.count, 0)}</span>
              <span style={{ textAlign: "right", color: "#152741" }}>{byMonth.reduce((s, m) => s + m.total, 0).toFixed(0)}€</span>
              <span style={{ textAlign: "right", color: "#8DBF94" }}>{yearTotal.toFixed(0)}€</span>
              <span style={{ textAlign: "right", color: "#C97A1F" }}>{byMonth.reduce((s, m) => s + m.pending, 0).toFixed(0)}€</span>
            </div>
          </div>
        )}
      </Card>
      <Card pad={16}>
        <Eyebrow>— IRS</Eyebrow>
        <div style={{ marginTop: 8, fontSize: 13, color: "#3C3C3B", lineHeight: 1.55 }}>
          Rendimentos brutos recebidos: <b>{yearTotal.toFixed(2)}€</b>. Comissão paga à Casa ({(CLINIC_CUT * 100).toFixed(0)}%): {yearClinic.toFixed(2)}€. Valor líquido: <b>{yearNet.toFixed(2)}€</b>.
        </div>
        <div style={{ marginTop: 8, fontSize: 12.5, color: "#8A8A86" }}>
          Nota: os valores refletem apenas pagamentos com estado <b>pago</b>. Exportar CSV para submissão fiscal.
        </div>
      </Card>
      </>}

      {receiptFor && (() => {
        const pt = myPatients.find((x) => x.id === receiptFor.patient_id);
        return (
          <div onClick={() => setReceiptFor(null)} className="modal-overlay" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} className="modal-panel receipt-print" style={{ background: "#FFFFFF", borderRadius: 18, width: "100%", maxWidth: 520, padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                <div>
                  <Eyebrow>— RECIBO</Eyebrow>
                  <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: "#152741", marginTop: 4 }}>Casa da Psicomotricidade</div>
                  <div style={{ fontSize: 12, color: "#8A8A86", marginTop: 2 }}>Sessões de psicomotricidade</div>
                </div>
                <Mark size={44} />
              </div>
              <div style={{ borderTop: "1px solid #EAE6DD", borderBottom: "1px solid #EAE6DD", padding: "16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 13.5 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "#8A8A86", fontWeight: 700 }}>PACIENTE</div>
                  <div style={{ marginTop: 3, color: "#152741", fontWeight: 600 }}>{pt?.name || "—"}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "#8A8A86", fontWeight: 700 }}>MÊS DE REFERÊNCIA</div>
                  <div style={{ marginTop: 3, color: "#152741", fontWeight: 600 }}>{receiptFor.month || "—"}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "#8A8A86", fontWeight: 700 }}>DATA PAGAMENTO</div>
                  <div style={{ marginTop: 3, color: "#152741" }}>{receiptFor.paid_date || "—"}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "#8A8A86", fontWeight: 700 }}>MÉTODO</div>
                  <div style={{ marginTop: 3, color: "#152741" }}>{receiptFor.method || "—"}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "2px solid #152741" }}>
                <span style={{ fontSize: 13, color: "#5A5A58" }}>Valor total</span>
                <span className="serif" style={{ fontSize: 32, fontWeight: 300, color: "#152741" }}>{parseFloat(receiptFor.amount || 0).toFixed(2)}€</span>
              </div>
              {receiptFor.notes && (
                <div style={{ marginTop: 12, padding: 10, background: "#F5F2EC", borderRadius: 10, fontSize: 12.5, color: "#3C3C3B" }}>
                  <b>Nota:</b> {receiptFor.notes}
                </div>
              )}
              <div style={{ marginTop: 20, fontSize: 11, color: "#8A8A86", lineHeight: 1.55 }}>
                Documento sem valor fiscal. Para efeitos de comparticipação (ADSE / SAMS / ADM) solicite fatura-recibo à Casa.
              </div>
              <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
                <Btn variant="secondary" onClick={() => setReceiptFor(null)}>Fechar</Btn>
                <Btn onClick={() => window.print()}>Imprimir</Btn>
              </div>
            </div>
          </div>
        );
      })()}

      {addOpen && (
        <div onClick={() => setAddOpen(false)} className="modal-overlay" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} className="modal-panel" style={{ background: "#FFFFFF", borderRadius: 18, width: "100%", maxWidth: 460, padding: 22 }}>
            <Eyebrow>— PAGAMENTO</Eyebrow>
            <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: "#152741", marginTop: 4, marginBottom: 14 }}>Registar pagamento</div>
            <Field label="Paciente"><Sel value={addForm.patient_id} onChange={(v) => setAddForm((f) => ({ ...f, patient_id: v }))} options={myPatients.map((p) => ({ v: p.id, l: p.name }))} placeholder="Selecionar..." /></Field>
            <Field label="Mês"><Sel value={addForm.month} onChange={(v) => setAddForm((f) => ({ ...f, month: v }))} options={MONTHS_2026.map((m) => ({ v: m, l: m }))} placeholder="Selecionar..." /></Field>
            <Field label="Valor (€)"><Inp value={addForm.amount} onChange={(e) => setAddForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Ex: 60" inputMode="decimal" /></Field>
            <Field label="Estado"><Sel value={addForm.status} onChange={(v) => setAddForm((f) => ({ ...f, status: v }))} options={[{ v: "pendente", l: "Pendente" }, { v: "pago", l: "Pago" }]} /></Field>
            <Field label="Método (opcional)"><Sel value={addForm.method} onChange={(v) => setAddForm((f) => ({ ...f, method: v }))} options={[{ v: "Transferência", l: "Transferência" }, { v: "MB WAY", l: "MB WAY" }, { v: "Numerário", l: "Numerário" }, { v: "Multibanco", l: "Multibanco" }]} placeholder="Não definido" /></Field>
            <Field label="Notas (opcional)"><Inp value={addForm.notes} onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Ex: sessão extra" /></Field>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <Btn variant="secondary" onClick={() => setAddOpen(false)} disabled={busy}>Cancelar</Btn>
              <Btn onClick={submitAdd} disabled={busy || !addForm.patient_id || !addForm.month || !addForm.amount}>{busy ? "A guardar…" : "Guardar"}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProAccount({ profile, onLogout, theme, setTheme }) {
  const { users = [], updateMyPhoto, removeMyPhoto, setNotificationPrefs } = useStore();
  const me = users.find((u) => u.id === profile?.id);
  const myPhoto = me?.photo_url || null;
  const fileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = profile?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "P";

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) updateMyPhoto(f);
    e.target.value = "";
    setMenuOpen(false);
  };

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
      <Card pad={18}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} aria-hidden="true" />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Trocar foto"
            className="ch"
            style={{ padding: 0, background: "transparent", border: "none", position: "relative", borderRadius: 999, cursor: "pointer" }}
          >
            <Av t={initials} bg="#8DBF94" sz={56} color="#152741" photoUrl={myPhoto} />
            <span aria-hidden="true" style={{
              position: "absolute", bottom: -1, right: -1,
              width: 20, height: 20, borderRadius: 10,
              background: "#152741", color: "#8DBF94",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 2px #FFFFFF",
            }}>
              <Icon name="edit" size={10} />
            </span>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: "#152741" }}>{profile?.full_name}</div>
            <div style={{ fontSize: 12.5, color: "#8A8A86", marginTop: 2 }}>{profile?.email}</div>
            <Tag type="professional">Profissional</Tag>
          </div>
        </div>
        {menuOpen && (
          <div style={{ marginTop: 12, padding: 6, borderRadius: 12, background: "#F5F2EC", border: "1px solid #EAE6DD", display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Btn size="sm" variant="secondary" icon={<Icon name="edit" size={13} />} onClick={() => fileRef.current?.click()}>
              {myPhoto ? "Trocar" : "Carregar"} foto
            </Btn>
            {myPhoto && (
              <Btn size="sm" variant="danger" icon={<Icon name="trash" size={13} />} onClick={() => { removeMyPhoto(); setMenuOpen(false); }}>
                Remover
              </Btn>
            )}
            <Btn size="sm" variant="ghost" onClick={() => setMenuOpen(false)}>Cancelar</Btn>
          </div>
        )}
      </Card>

      <ProNotifPrefs prefs={me?.notification_prefs} onSave={setNotificationPrefs} />

      <Card pad={0}>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="ch tap-target" style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", color: "#3C3C3B", fontSize: 15, fontWeight: 500, textAlign: "left", borderBottom: "1px solid #F5F2EC" }}>
          <span style={{ color: "#5A5A58", display: "flex" }}><Icon name={theme === "dark" ? "sun" : "moon"} size={20} /></span>
          <span style={{ flex: 1 }}>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
          <Icon name="arr" size={16} color="#B9CDE0" />
        </button>
        <button onClick={() => window.open("/faq", "_blank")} className="ch tap-target" style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", color: "#3C3C3B", fontSize: 15, fontWeight: 500, textAlign: "left", borderBottom: "1px solid #F5F2EC" }}>
          <span style={{ color: "#5A5A58", display: "flex" }}><Icon name="question" size={20} /></span>
          <span style={{ flex: 1 }}>Perguntas Frequentes</span>
          <Icon name="arr" size={16} color="#B9CDE0" />
        </button>
        <button onClick={() => window.open("/privacidade", "_blank")} className="ch tap-target" style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", color: "#3C3C3B", fontSize: 15, fontWeight: 500, textAlign: "left", borderBottom: "1px solid #F5F2EC" }}>
          <span style={{ color: "#5A5A58", display: "flex" }}><Icon name="shield" size={20} /></span>
          <span style={{ flex: 1 }}>Política de Privacidade</span>
          <Icon name="arr" size={16} color="#B9CDE0" />
        </button>
        <button onClick={onLogout} className="ch tap-target" style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", color: "#B83A3A", fontSize: 15, fontWeight: 500, textAlign: "left" }}>
          <span style={{ display: "flex" }}><Icon name="logout" size={20} /></span>
          <span style={{ flex: 1 }}>Terminar sessão</span>
        </button>
      </Card>

      <div style={{ fontSize: 11, color: "#8A8A86", textAlign: "center", padding: "8px 24px 24px", lineHeight: 1.55 }}>
        <div><b style={{ color: "#5A5A58" }}>{APP_VERSION}</b></div>
        <div style={{ marginTop: 2 }}>Atualizado: {formatBuildDate()}</div>
      </div>
    </div>
  );
}

function NoProfRecord() {
  return (
    <Card pad={22} style={{ marginTop: 18, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 28, background: "#F5E5CD", color: "#C97A1F", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
        <Icon name="users" size={26} />
      </div>
      <div className="serif" style={{ fontSize: 20, fontWeight: 500, color: "#152741" }}>Conta sem registo na equipa</div>
      <p style={{ fontSize: 13.5, color: "#5A5A58", lineHeight: 1.6, marginTop: 8, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
        Não encontrámos um registo de profissional com o seu nome. Contacte a direção para associar a sua conta ao perfil de terapeuta.
      </p>
    </Card>
  );
}

function ProNotifPrefs({ prefs, onSave }) {
  const cur = prefs || { reminders: true, announcements: true, requests: true, messages: true };
  const toggle = (key) => onSave({ ...cur, [key]: !cur[key] });
  const items = [
    { key: "announcements", label: "Anúncios da direção", desc: "Comunicações internas" },
    { key: "messages",      label: "Mensagens de responsáveis", desc: "Chat parent-terapeuta" },
    { key: "reminders",     label: "Lembretes de sessão", desc: "Push do lembrete diário" },
  ];
  return (
    <Card pad={0}>
      <div style={{ padding: "12px 18px 4px" }}>
        <Eyebrow>— NOTIFICAÇÕES</Eyebrow>
      </div>
      {items.map((it) => (
        <div key={it.key} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderTop: "1px solid #F5F2EC" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#152741" }}>{it.label}</div>
            <div style={{ fontSize: 12, color: "#8A8A86" }}>{it.desc}</div>
          </div>
          <button onClick={() => toggle(it.key)} aria-pressed={!!cur[it.key]} style={{ position: "relative", width: 44, height: 26, borderRadius: 13, background: cur[it.key] ? "#8DBF94" : "#D9D3C5", border: "none", cursor: "pointer", padding: 0 }}>
            <span aria-hidden="true" style={{ position: "absolute", top: 2, left: cur[it.key] ? 20 : 2, width: 22, height: 22, borderRadius: 11, background: "#FFFFFF", transition: "left .18s", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} />
          </button>
        </div>
      ))}
    </Card>
  );
}
