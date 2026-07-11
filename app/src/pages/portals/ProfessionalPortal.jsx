import { Fragment, useMemo, useRef, useState } from "react";
import { Mark, Icon } from "../../lib/icons.jsx";
import { Av, Btn, Card, Eyebrow, Tag } from "../../lib/ui.jsx";
import { APP_VERSION, formatBuildDate, DAYS, HOURS } from "../../lib/constants.js";
import { useStore } from "../../lib/store.jsx";

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
  const { pts, profs, notes, announcements, users = [], homeExercises = [], homeAssignments = [], assignHomeExercise, unassignHomeExercise, parentMessages = [], replyToParent, markMessageRead, setNotificationPrefs, setForm, setModal, quickMarkFalta } = useStore();
  const meDoc = users.find((u) => u.id === profile?.id);
  const myPhoto = meDoc?.photo_url || null;
  const [tab, setTab] = useState("home"); // home | agenda | patients | account

  const myProfRecord = useMemo(() => findMyProfRecord(profs, profile?.id, profile?.full_name), [profs, profile?.id, profile?.full_name]);
  const myProfId = myProfRecord?.id;

  const myPatients = useMemo(() => {
    if (!myProfId) return [];
    return pts.filter((p) => {
      const ids = p.professional_ids?.length ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
      return ids.includes(myProfId);
    });
  }, [pts, myProfId]);

  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayLabel = todayIdx < DAYS.length ? DAYS[todayIdx] : null;
  const todaysSessions = useMemo(() => {
    if (!todayLabel) return [];
    return myPatients
      .filter((p) => p.day_of_week === todayLabel)
      .sort((a, b) => (a.hour || "").localeCompare(b.hour || ""));
  }, [myPatients, todayLabel]);

  const initials = profile?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "P";

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

        {tab === "home"     && <ProHome myProfId={myProfId} myPatients={myPatients} todaysSessions={todaysSessions} todayLabel={todayLabel} notes={notes} announcements={announcements} onSessionNote={openSessionNote} onMarkFalta={(p) => quickMarkFalta(p.id, myProfId)} />}
        {tab === "agenda"   && <ProAgenda myPatients={myPatients} profs={profs} />}
        {tab === "patients" && <ProPatients myPatients={myPatients} notes={notes} onSessionNote={openSessionNote} homeExercises={homeExercises} homeAssignments={homeAssignments} assignHomeExercise={assignHomeExercise} unassignHomeExercise={unassignHomeExercise} />}
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
        <div style={{ height: "var(--tabbar-h)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", maxWidth: 1100, margin: "0 auto" }}>
          {[
            { id: "home",     label: "Início",    icon: "home" },
            { id: "agenda",   label: "Agenda",    icon: "calendar" },
            { id: "patients", label: "Pacientes", icon: "clipboard" },
            { id: "account",  label: "Conta",     icon: "users" },
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
              }}
            >
              <Icon name={t.icon} size={22} />
              <span style={{ color: tab === t.id ? "#E8A13C" : "#5A5A58" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

// ─────────── Sub-componentes ───────────

function ProHome({ myProfId, myPatients, todaysSessions, todayLabel, notes, announcements, onSessionNote, onMarkFalta }) {
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

function ProAccount({ profile, onLogout, theme, setTheme }) {
  const { users = [], updateMyPhoto, removeMyPhoto } = useStore();
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

      <Card pad={0}>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="ch tap-target" style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", color: "#3C3C3B", fontSize: 15, fontWeight: 500, textAlign: "left", borderBottom: "1px solid #F5F2EC" }}>
          <span style={{ color: "#5A5A58", display: "flex" }}><Icon name={theme === "dark" ? "sun" : "moon"} size={20} /></span>
          <span style={{ flex: 1 }}>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
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
