import { useMemo, useRef, useState } from "react";
import { Mark, Icon } from "../../lib/icons.jsx";
import { Av, Btn, Card, Eyebrow, Tag, Progress, Field, Inp, Sel } from "../../lib/ui.jsx";
import { APP_VERSION, formatBuildDate, DAYS, HOURS } from "../../lib/constants.js";
import { useStore } from "../../lib/store.jsx";
import { sb } from "../../lib/firebase.js";
import GlossaryText from "../../components/GlossaryText.jsx";

// 1. Verifica parent_user_ids (vínculo explícito feito pelo director — preferido).
// 2. Fallback: match case-insensitive entre profile.full_name e
//    parent_mother/parent_father do paciente.
function isMyChild(patient, parentName, parentUserId) {
  if (parentUserId && Array.isArray(patient.parent_user_ids) && patient.parent_user_ids.includes(parentUserId)) {
    return true;
  }
  if (!parentName) return false;
  const p = parentName.toLowerCase().trim();
  const m = (patient.parent_mother || "").toLowerCase();
  const f = (patient.parent_father || "").toLowerCase();
  return (m && m.includes(p)) || (f && f.includes(p)) || (p && (p.includes(m) || p.includes(f)));
}

// Próxima ocorrência de "Segunda 14:00" — para mostrar "em 2 dias" estilo iOS
function nextOccurrence(dayLabel, hour) {
  if (!dayLabel || !hour) return null;
  const dayIdx = DAYS.indexOf(dayLabel); // 0..4 (Seg..Sex)
  if (dayIdx === -1) return null;
  const [hh, mm] = hour.split(":").map(Number);
  const now = new Date();
  const today = (now.getDay() + 6) % 7; // 0=Seg .. 6=Dom
  let delta = dayIdx - today;
  // Se for o mesmo dia mas já passou a hora, avança para a próxima semana
  if (delta === 0) {
    const sameDayAt = new Date(now); sameDayAt.setHours(hh || 0, mm || 0, 0, 0);
    if (sameDayAt < now) delta = 7;
  } else if (delta < 0) {
    delta += 7;
  }
  const next = new Date(now); next.setDate(now.getDate() + delta); next.setHours(hh || 0, mm || 0, 0, 0);
  return next;
}

function humanWhen(d) {
  if (!d) return "—";
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const days = Math.round(diffMs / 86400000);
  if (days <= 0) return "hoje";
  if (days === 1) return "amanhã";
  if (days < 7) return `em ${days} dias`;
  return `em ${days} dias`;
}

export default function ParentPortal({ profile, onLogout, theme, setTheme }) {
  const { pts, profs, plans, notes, pays, reqs, announcements, users = [], homeExercises = [], homeAssignments = [], homeCompletions = [], markCompletion, parentMessages = [], sendParentMessage, addBehaviorEntry, behaviorDiary = [], setNotificationPrefs, show } = useStore();
  const meDoc = users.find((u) => u.id === profile?.id);
  const myPhoto = meDoc?.photo_url || null;
  const [tab, setTab] = useState("home"); // home | sessions | requests | account
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ patient_id: "", new_day: "", new_hour: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const myChildren = useMemo(
    () => pts.filter((p) => isMyChild(p, profile?.full_name, profile?.id)),
    [pts, profile?.full_name, profile?.id]
  );

  // Meus pedidos (ordenados pelos mais recentes)
  const myRequests = useMemo(() => {
    const childIds = new Set(myChildren.map((c) => c.id));
    return (reqs || [])
      .filter((r) => r.requested_by_id === profile?.id || (r.patient_id && childIds.has(r.patient_id)))
      .sort((a, b) => (new Date(b.created_at || 0) - new Date(a.created_at || 0)));
  }, [reqs, myChildren, profile?.id]);

  // Anúncios visíveis para responsáveis
  const visibleAnnouncements = useMemo(() =>
    (announcements || []).filter((a) => a.active !== false && (a.audience === "all" || a.audience === "parent" || !a.audience)),
  [announcements]);

  // Notificações: pedidos recém-resolvidos desde a última visita (em localStorage)
  const lastSeenKey = `psm.parent.lastSeen.${profile?.id || "anon"}`;
  const lastSeen = (typeof window !== "undefined" ? localStorage.getItem(lastSeenKey) : null) || "0";
  const lastSeenTs = Number(lastSeen) || 0;
  const recentlyResolved = myRequests.filter((r) => {
    if (r.status !== "aprovado" && r.status !== "recusado") return false;
    const ts = new Date(r.updated_at || r.created_at || 0).getTime();
    return ts > lastSeenTs;
  });
  const markAllSeen = () => {
    try { localStorage.setItem(lastSeenKey, String(Date.now())); } catch (_) {}
  };

  const submitRequest = async () => {
    if (!requestForm.patient_id || !requestForm.new_day || !requestForm.new_hour) {
      show("Preencha paciente, dia e hora pretendidos.", "error");
      return;
    }
    setSubmitting(true);
    const child = pts.find((p) => p.id === requestForm.patient_id);
    const { error } = await sb.from("schedule_requests").insert({
      patient_id: requestForm.patient_id,
      patient_name: child?.name || "",
      requested_by_id: profile?.id || null,
      requested_by_name: profile?.full_name || "",
      from_day: child?.day_of_week || "",
      from_hour: child?.hour || "",
      new_day: requestForm.new_day,
      new_hour: requestForm.new_hour,
      reason: requestForm.reason || "",
      status: "pendente",
    });
    setSubmitting(false);
    if (error) { show("Não foi possível enviar o pedido.", "error"); return; }
    show("Pedido enviado à direção.");
    setRequestForm({ patient_id: "", new_day: "", new_hour: "", reason: "" });
    setRequestOpen(false);
  };

  const initials = profile?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "R";

  return (
    <>
      <a href="#main" className="skip-link">Saltar para o conteúdo</a>

      {/* TOP BAR */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        paddingTop: "var(--safe-top)",
        background: "rgba(255,255,255,.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(234,230,221,.6)",
      }}>
        <div style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mark size={28} />
            <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em", color: "#152741" }}>
              PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span>
            </span>
          </div>
          <button onClick={() => setTab("account")} className="ch tap-target" aria-label="Conta" style={{ borderRadius: 999, padding: 0 }}>
            <Av t={initials} bg="#E8A13C" sz={34} color="#152741" photoUrl={myPhoto} />
          </button>
        </div>
      </header>

      <main id="main" className="portal-content" style={{ maxWidth: 720, margin: "0 auto", padding: "12px 16px calc(var(--tabbar-h) + var(--safe-bottom) + 24px)" }}>
        {/* Large title */}
        <div style={{ padding: "8px 2px 6px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <Av t={initials} bg="#E8A13C" sz={56} color="#152741" photoUrl={myPhoto} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow>— PORTAL RESPONSÁVEL</Eyebrow>
            <h1 className="serif" style={{ fontSize: 28, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.08, marginTop: 6 }}>
              Olá, {profile?.full_name?.split(" ")[0] || "—"}<span className="serif-it">.</span>
            </h1>
            <p style={{ fontSize: 14, color: "#8A8A86", marginTop: 4 }}>
              {myChildren.length === 0 ? "Nenhum filho associado à sua conta." : `${myChildren.length} ${myChildren.length === 1 ? "filho acompanhado" : "filhos acompanhados"} pela Casa.`}
            </p>
          </div>
        </div>

        {tab === "home" && <HomeTab profile={profile} myChildren={myChildren} profs={profs} plans={plans} notes={notes} pays={pays} announcements={visibleAnnouncements} recentlyResolved={recentlyResolved} onAck={markAllSeen} onRequest={() => setRequestOpen(true)} addBehaviorEntry={addBehaviorEntry} behaviorDiary={behaviorDiary} sendParentMessage={sendParentMessage} parentMessages={parentMessages} />}
        {tab === "practice" && <PracticeTab myChildren={myChildren} homeExercises={homeExercises} homeAssignments={homeAssignments} homeCompletions={homeCompletions} markCompletion={markCompletion} />}
        {tab === "requests" && <RequestsTab myChildren={myChildren} myRequests={myRequests} onNew={() => setRequestOpen(true)} onOpen={() => markAllSeen()} />}
        {tab === "account" && <AccountTab profile={profile} onLogout={onLogout} theme={theme} setTheme={setTheme} setNotificationPrefs={setNotificationPrefs} users={users} />}
      </main>

      {/* BOTTOM TAB BAR */}
      <nav className="portal-tabbar" aria-label="Navegação" style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
        paddingBottom: "var(--safe-bottom)",
        background: "rgba(255,255,255,.92)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderTop: "1px solid rgba(234,230,221,.7)",
      }}>
        <div style={{ height: "var(--tabbar-h)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", maxWidth: 720, margin: "0 auto" }}>
          {[
            { id: "home",     label: "Início",  icon: "home" },
            { id: "practice", label: "Casa",    icon: "trend" },
            { id: "requests", label: "Pedidos", icon: "swap",  badge: recentlyResolved.length },
            { id: "account",  label: "Conta",   icon: "users" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id === "requests") markAllSeen(); }}
              className="ch tap-target"
              aria-pressed={tab === t.id}
              aria-label={t.label + (t.badge ? ` (${t.badge} novidades)` : "")}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                color: tab === t.id ? "#E8A13C" : "#5A5A58",
                fontSize: 10.5, fontWeight: tab === t.id ? 600 : 500,
                position: "relative",
              }}
            >
              <div style={{ position: "relative" }}>
                <Icon name={t.icon} size={22} />
                {t.badge > 0 && (
                  <span aria-hidden="true" style={{
                    position: "absolute", top: -3, right: -8,
                    minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8,
                    background: "#B83A3A", color: "#fff", fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                  }}>{t.badge}</span>
                )}
              </div>
              <span style={{ color: tab === t.id ? "#E8A13C" : "#5A5A58" }}>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modal: pedido de troca de horário */}
      {requestOpen && (
        <div className="modal-overlay" onClick={() => setRequestOpen(false)} role="dialog" aria-modal="true" aria-label="Pedido de troca de horário" style={{ position: "fixed", inset: 0, background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fu .2s ease both" }}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ background: "#FFFFFF", borderRadius: 18, width: "100%", maxWidth: 460, maxHeight: "86vh", overflowY: "auto", animation: "ti .25s ease both", border: "1px solid #EAE6DD", boxShadow: "0 24px 64px rgba(21,39,65,.18)" }}>
            <div style={{ padding: "24px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <Eyebrow>— PEDIDO</Eyebrow>
                <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: "#152741", marginTop: 4 }}>Troca de horário</div>
              </div>
              <button onClick={() => setRequestOpen(false)} aria-label="Fechar" className="ch tap-target" style={{ padding: 6, borderRadius: 8, color: "#8A8A86" }}><Icon name="x" size={20} /></button>
            </div>
            <div style={{ padding: "8px 24px 24px" }}>
              <Field label="Filho">
                <Sel value={requestForm.patient_id} onChange={(v) => setRequestForm((f) => ({ ...f, patient_id: v }))} options={myChildren.map((c) => ({ v: c.id, l: c.name }))} placeholder="Selecionar..." />
              </Field>
              <Field label="Novo dia">
                <Sel value={requestForm.new_day} onChange={(v) => setRequestForm((f) => ({ ...f, new_day: v }))} options={DAYS.map((d) => ({ v: d, l: d }))} placeholder="Selecionar..." />
              </Field>
              <Field label="Nova hora">
                <Sel value={requestForm.new_hour} onChange={(v) => setRequestForm((f) => ({ ...f, new_hour: v }))} options={HOURS.map((h) => ({ v: h, l: h }))} placeholder="Selecionar..." />
              </Field>
              <Field label="Motivo (opcional)">
                <Inp value={requestForm.reason} onChange={(e) => setRequestForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Ex: nova rotina escolar" />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <Btn variant="secondary" onClick={() => setRequestOpen(false)} disabled={submitting}>Cancelar</Btn>
                <Btn onClick={submitRequest} disabled={submitting}>{submitting ? "A enviar…" : "Enviar pedido"}</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────── Sub-componentes (tabs) ───────────

function HomeTab({ myChildren, profs, plans, notes, pays, announcements, recentlyResolved, onAck, onRequest, addBehaviorEntry, behaviorDiary, sendParentMessage, parentMessages }) {
  const [diaryFor, setDiaryFor] = useState(null);
  const [chatFor, setChatFor] = useState(null);
  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Notificações de pedidos resolvidos */}
      {recentlyResolved && recentlyResolved.length > 0 && (
        <Card pad={16} style={{ background: "#DCE7F0", borderColor: "#B9CDE0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Icon name="check" size={16} color="#1E3556" />
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: "#1E3556" }}>NOVIDADES</span>
          </div>
          <div style={{ fontSize: 14, color: "#152741", fontWeight: 500, marginBottom: 4 }}>
            {recentlyResolved.length} {recentlyResolved.length === 1 ? "pedido foi respondido" : "pedidos foram respondidos"}
          </div>
          <div style={{ fontSize: 12.5, color: "#5A5A58", marginBottom: 10 }}>
            Veja o estado actual no separador <b>Pedidos</b>.
          </div>
          <Btn size="sm" variant="secondary" onClick={onAck}>Marcar como visto</Btn>
        </Card>
      )}

      {/* Anúncios da direção */}
      {announcements && announcements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {announcements.slice(0, 3).map((a) => (
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
      )}

      {myChildren.length === 0 ? (
        <NoChildrenHelp />
      ) : (
        myChildren.map((child) => <ChildCard key={child.id} child={child} profs={profs} plans={plans} notes={notes} pays={pays} onRequest={onRequest} onOpenDiary={() => setDiaryFor(child)} onOpenChat={() => setChatFor(child)} />)
      )}

      {diaryFor && <DiaryModal child={diaryFor} onClose={() => setDiaryFor(null)} onSave={async (d) => { await addBehaviorEntry(diaryFor.id, d); setDiaryFor(null); }} recent={behaviorDiary.filter((x) => x.patient_id === diaryFor.id).slice(0, 5)} />}
      {chatFor && <ChatModal child={chatFor} profs={profs} onClose={() => setChatFor(null)} onSend={async (body) => { const ids = chatFor.professional_ids?.length ? chatFor.professional_ids : (chatFor.professional_id ? [chatFor.professional_id] : []); await sendParentMessage(chatFor.id, ids[0], body); }} messages={parentMessages.filter((m) => m.patient_id === chatFor.id)} />}
    </div>
  );
}

function DiaryModal({ child, onClose, onSave, recent }) {
  const [mood, setMood] = useState(3);
  const [sleep, setSleep] = useState("");
  const [events, setEvents] = useState([]);
  const [concerns, setConcerns] = useState("");
  const MOODS = ["😞", "😕", "😐", "🙂", "😄"];
  const EVENT_TAGS = ["Boa noite de sono", "Birra", "Nova conquista", "Escola difícil", "Doença", "Mudança rotina"];
  const toggleEvent = (t) => setEvents((e) => e.includes(t) ? e.filter((x) => x !== t) : [...e, t]);

  return (
    <div onClick={onClose} className="modal-overlay" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} className="modal-panel" style={{ background: "#FFFFFF", borderRadius: 18, width: "100%", maxWidth: 480, padding: 22, maxHeight: "86vh", overflow: "auto" }}>
        <Eyebrow>— DIÁRIO DE COMPORTAMENTO</Eyebrow>
        <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: "#152741", marginTop: 4, marginBottom: 14 }}>Hoje · {child.name}</div>

        <div style={{ fontSize: 12, color: "#5A5A58", marginBottom: 8, fontWeight: 500 }}>Humor</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "space-between" }}>
          {MOODS.map((m, i) => (
            <button key={i} onClick={() => setMood(i + 1)} aria-label={`Humor ${i + 1}`} style={{ flex: 1, padding: 10, fontSize: 24, borderRadius: 10, border: `2px solid ${mood === i + 1 ? "#E8A13C" : "#EAE6DD"}`, background: mood === i + 1 ? "#FEF3C7" : "#FFFFFF", cursor: "pointer" }}>{m}</button>
          ))}
        </div>

        <Field label="Horas de sono"><Inp type="number" value={sleep} onChange={(e) => setSleep(e.target.value)} placeholder="Ex: 10" /></Field>

        <div style={{ fontSize: 12, color: "#5A5A58", marginBottom: 6, fontWeight: 500 }}>Eventos notáveis</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {EVENT_TAGS.map((t) => (
            <button key={t} onClick={() => toggleEvent(t)} style={{ padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: "pointer", border: `1px solid ${events.includes(t) ? "#152741" : "#D9D3C5"}`, background: events.includes(t) ? "#152741" : "#FFFFFF", color: events.includes(t) ? "#F7F4EE" : "#152741", fontFamily: "inherit" }}>{t}</button>
          ))}
        </div>

        <Field label="Preocupações (opcional)">
          <textarea value={concerns} onChange={(e) => setConcerns(e.target.value)} placeholder="Algo que gostaria que o terapeuta soubesse antes da próxima sessão…" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FFFFFF", minHeight: 70, resize: "vertical", fontFamily: "inherit" }} />
        </Field>

        {recent.length > 0 && (
          <div style={{ marginTop: 14, padding: 10, background: "#F5F2EC", borderRadius: 10 }}>
            <div className="mono" style={{ fontSize: 10, color: "#8A8A86", marginBottom: 6 }}>ÚLTIMAS ENTRADAS · {recent.length}</div>
            {recent.map((r) => (
              <div key={r.id} style={{ fontSize: 11.5, color: "#5A5A58", padding: "3px 0" }}>
                <b style={{ color: "#152741" }}>{r.date}</b> · {MOODS[(r.mood || 3) - 1]}
                {r.sleep_hours && <span> · {r.sleep_hours}h sono</span>}
                {r.notable_events?.length > 0 && <span> · {r.notable_events.join(", ")}</span>}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
          <Btn onClick={() => onSave({ mood, sleep_hours: sleep ? parseFloat(sleep) : null, notable_events: events, concerns })}>Guardar</Btn>
        </div>
      </div>
    </div>
  );
}

function ChatModal({ child, profs, onClose, onSend, messages }) {
  const [body, setBody] = useState("");
  const ids = child.professional_ids?.length ? child.professional_ids : (child.professional_id ? [child.professional_id] : []);
  const pr = profs.find((x) => x.id === ids[0]);
  const unrepliedActive = messages.some((m) => !m.replied_at);

  return (
    <div onClick={onClose} className="modal-overlay" role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(21,39,65,.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} className="modal-panel" style={{ background: "#FFFFFF", borderRadius: 18, width: "100%", maxWidth: 500, padding: 22, maxHeight: "86vh", overflow: "auto" }}>
        <Eyebrow>— MENSAGEM AO TERAPEUTA</Eyebrow>
        <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: "#152741", marginTop: 4, marginBottom: 4 }}>Sobre {child.name}</div>
        <div style={{ fontSize: 12.5, color: "#8A8A86", marginBottom: 14 }}>Para {pr?.name || "profissional"}. Resposta em até 48h em dias úteis.</div>

        {messages.length > 0 && (
          <div style={{ marginBottom: 14, maxHeight: 260, overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.slice(0, 10).map((m) => (
              <div key={m.id}>
                <div style={{ padding: "8px 12px", background: "#F5F2EC", borderRadius: "12px 12px 12px 3px", fontSize: 13, color: "#152741", maxWidth: "85%" }}>
                  {m.body}
                  <div style={{ fontSize: 10, color: "#8A8A86", marginTop: 4 }}>{m.created_at ? new Date(m.created_at).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</div>
                </div>
                {m.reply && (
                  <div style={{ padding: "8px 12px", background: "#DCE7F0", borderRadius: "12px 12px 3px 12px", fontSize: 13, color: "#152741", maxWidth: "85%", marginLeft: "15%", marginTop: 4 }}>
                    {m.reply}
                    <div style={{ fontSize: 10, color: "#5A6473", marginTop: 4 }}>Terapeuta · {m.replied_at ? new Date(m.replied_at).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {unrepliedActive ? (
          <div style={{ padding: 12, background: "#F5E5CD", color: "#C97A1F", borderRadius: 10, fontSize: 12.5, lineHeight: 1.5 }}>
            Aguarde a resposta ao seu último pedido antes de enviar outro. Rate limit: 1 mensagem por vez.
          </div>
        ) : (
          <>
            <Field label="Nova mensagem">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Descreva a questão em 2-3 frases…" maxLength={500} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #D9D3C5", fontSize: 14, background: "#FFFFFF", minHeight: 90, resize: "vertical", fontFamily: "inherit" }} />
            </Field>
            <div style={{ fontSize: 11, color: "#8A8A86", marginBottom: 10 }}>{body.length}/500</div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <Btn variant="secondary" onClick={onClose}>Fechar</Btn>
          {!unrepliedActive && (
            <Btn onClick={async () => { await onSend(body); setBody(""); onClose(); }} disabled={!body.trim()}>Enviar</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function ChildCard({ child, profs, plans, notes, pays, onRequest, onOpenDiary, onOpenChat }) {
  const ids = (child.professional_ids?.length ? child.professional_ids : (child.professional_id ? [child.professional_id] : []));
  const profNames = ids.map((id) => profs.find((x) => x.id === id)?.name).filter(Boolean);
  const plan = plans.find((p) => p.patient_id === child.id);
  const childNotes = notes.filter((n) => n.patient_id === child.id).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);
  const childPays = pays.filter((p) => p.patient_id === child.id).slice(0, 2);
  const next = nextOccurrence(child.day_of_week, child.hour);
  const ini = child.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Card pad={0} style={{ overflow: "hidden" }}>
      {/* Header com nome + próxima sessão */}
      <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #F5F2EC" }}>
        <Av t={ini} bg="#DCE7F0" sz={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 300, color: "#152741", letterSpacing: "-0.02em" }}>{child.name}</div>
          <div style={{ fontSize: 13, color: "#8A8A86", marginTop: 2 }}>
            {child.age} anos · {child.session_type === "individual" ? "Individual" : "Grupo"}
          </div>
        </div>
      </div>

      {/* Próxima sessão */}
      <div style={{ padding: 16, borderBottom: "1px solid #F5F2EC" }}>
        <Eyebrow>— PRÓXIMA SESSÃO</Eyebrow>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#152741" }}>{child.day_of_week} · {child.hour}</div>
            <div style={{ fontSize: 12.5, color: "#8A8A86", marginTop: 2 }}>Com {profNames.join(" · ") || "—"}</div>
          </div>
          <Tag type="agendada">{humanWhen(next)}</Tag>
        </div>
      </div>

      {/* Plano de intervenção (resumo) */}
      {plan && (
        <div style={{ padding: 16, borderBottom: "1px solid #F5F2EC" }}>
          <Eyebrow>— PLANO DE INTERVENÇÃO</Eyebrow>
          {plan.area && <div style={{ fontSize: 14, color: "#152741", marginTop: 6, fontWeight: 500 }}>{plan.area}</div>}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {(plan.objectives || []).slice(0, 4).map((o, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, color: "#3C3C3B", lineHeight: 1.4, flex: 1 }}>{o.text}</div>
                  <span className="mono" style={{ fontSize: 11, color: "#5A5A58" }}>{o.progress || 0}%</span>
                </div>
                <Progress pct={o.progress || 0} color={o.status === "atingido" ? "#3D7A4A" : "#152741"} />
              </div>
            ))}
            {(plan.objectives || []).length > 4 && (
              <div style={{ fontSize: 12, color: "#8A8A86" }}>+ {(plan.objectives || []).length - 4} objetivos adicionais</div>
            )}
          </div>
        </div>
      )}

      {/* Últimas notas (resumo) */}
      {childNotes.length > 0 && (
        <div style={{ padding: 16, borderBottom: "1px solid #F5F2EC" }}>
          <Eyebrow>— ÚLTIMAS SESSÕES</Eyebrow>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
            {childNotes.map((n) => (
              <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid #F5F2EC" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, color: "#152741", fontWeight: 500 }}>{n.date && new Date(n.date).toLocaleDateString("pt-PT")}</div>
                  {n.progress && <div style={{ fontSize: 12.5, color: "#5A5A58", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.progress}</div>}
                </div>
                <Tag type={n.status === "realizada" ? "realizada" : n.status === "falta" ? "falta" : "default"}>
                  {n.status === "realizada" ? "Realizada" : n.status === "falta" ? "Falta" : "Cancelada"}
                </Tag>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagamentos */}
      {childPays.length > 0 && (
        <div style={{ padding: 16, borderBottom: "1px solid #F5F2EC" }}>
          <Eyebrow>— PAGAMENTOS</Eyebrow>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {childPays.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5, padding: "6px 0" }}>
                <span style={{ color: "#5A5A58" }}>{p.month}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#152741", fontWeight: 500 }}>{p.amount}€</span>
                  <Tag type={p.status}>{p.status === "pago" ? "Pago" : "Pendente"}</Tag>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA pedir troca */}
      <div style={{ padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          <Btn size="sm" variant="secondary" icon={<Icon name="edit" size={12} />} onClick={onOpenDiary}>Diário</Btn>
          <Btn size="sm" variant="secondary" icon={<Icon name="mail" size={12} />} onClick={onOpenChat}>Falar</Btn>
          <Btn size="sm" variant="secondary" icon={<Icon name="swap" size={12} />} onClick={onRequest}>Troca</Btn>
        </div>
      </div>
    </Card>
  );
}

function SessionsTab({ myChildren, profs, notes }) {
  if (myChildren.length === 0) return <NoChildrenHelp />;
  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
      {myChildren.map((child) => {
        const childNotes = notes.filter((n) => n.patient_id === child.id).sort((a, b) => (a.date < b.date ? 1 : -1));
        return (
          <Card key={child.id} pad={16}>
            <div className="serif" style={{ fontSize: 17, fontWeight: 500, color: "#152741", marginBottom: 6 }}>{child.name}</div>
            {childNotes.length === 0 ? (
              <div style={{ fontSize: 13, color: "#8A8A86" }}>Sem sessões registadas ainda.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {childNotes.slice(0, 10).map((n) => {
                  const pr = profs.find((x) => x.id === n.professional_id);
                  return (
                    <div key={n.id} style={{ padding: 12, borderRadius: 12, background: "#FFFFFF", border: "1px solid #F5F2EC" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13.5, color: "#152741", fontWeight: 600 }}>{n.date && new Date(n.date).toLocaleDateString("pt-PT")}</span>
                        <Tag type={n.status === "realizada" ? "realizada" : n.status === "falta" ? "falta" : "default"}>
                          {n.status === "realizada" ? "Realizada" : n.status === "falta" ? "Falta" : "Cancelada"}
                        </Tag>
                      </div>
                      {pr && <div style={{ fontSize: 12, color: "#8A8A86" }}>{pr.name}</div>}
                      {n.progress && <div style={{ fontSize: 13, color: "#3C3C3B", marginTop: 6, lineHeight: 1.5 }}><GlossaryText text={n.progress} /></div>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function RequestsTab({ myChildren, myRequests, onNew }) {
  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
      <Card pad={20}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: "#152741" }}>Pedidos de troca</div>
            <p style={{ fontSize: 13, color: "#8A8A86", marginTop: 2 }}>Histórico e estado dos seus pedidos</p>
          </div>
          <Btn icon={<Icon name="plus" size={14} />} onClick={onNew} disabled={myChildren.length === 0}>Novo pedido</Btn>
        </div>
        {myChildren.length === 0 && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: "#8A8A86" }}>Sem filhos associados — não é possível abrir pedido.</div>
        )}
      </Card>

      {myRequests && myRequests.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myRequests.map((r) => {
            const created = r.created_at ? new Date(r.created_at) : null;
            const tagType = r.status === "aprovado" ? "realizada" : r.status === "recusado" ? "falta" : "pendente";
            const statusLabel = r.status === "aprovado" ? "Aprovado" : r.status === "recusado" ? "Recusado" : "Pendente";
            return (
              <Card key={r.id} pad={14}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#152741" }}>{r.patient_name || "Pedido"}</div>
                    {created && <div style={{ fontSize: 12, color: "#8A8A86", marginTop: 2 }}>{created.toLocaleDateString("pt-PT")}</div>}
                  </div>
                  <Tag type={tagType}>{statusLabel}</Tag>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, flexWrap: "wrap" }}>
                  <span className="mono" style={{ padding: "3px 8px", borderRadius: 6, background: "#F4E0E0", color: "#B83A3A" }}>{r.from_day} · {r.from_hour}</span>
                  <Icon name="arr" size={12} color="#8A8A86" />
                  <span className="mono" style={{ padding: "3px 8px", borderRadius: 6, background: "#DDEADE", color: "#3D7A4A" }}>{r.new_day} · {r.new_hour}</span>
                </div>
                {r.reason && (
                  <div className="serif-it" style={{ fontSize: 13, color: "#5A5A58", marginTop: 8, paddingLeft: 10, borderLeft: "2px solid #F5F2EC" }}>"{r.reason}"</div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AccountTab({ profile, onLogout, theme, setTheme }) {
  const { users = [], updateMyPhoto, removeMyPhoto, setNotificationPrefs } = useStore();
  const me = users.find((u) => u.id === profile?.id);
  const myPhoto = me?.photo_url || null;
  const fileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = profile?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "R";

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) updateMyPhoto(f);
    e.target.value = "";
    setMenuOpen(false);
  };

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
      <Card pad={18}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} aria-hidden="true" />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Trocar foto"
            className="ch"
            style={{ padding: 0, background: "transparent", border: "none", position: "relative", borderRadius: 999, cursor: "pointer" }}
          >
            <Av t={initials} bg="#E8A13C" sz={56} color="#152741" photoUrl={myPhoto} />
            <span aria-hidden="true" style={{
              position: "absolute", bottom: -1, right: -1,
              width: 20, height: 20, borderRadius: 10,
              background: "#152741", color: "#E8A13C",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 2px #FFFFFF",
            }}>
              <Icon name="edit" size={10} />
            </span>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: "#152741" }}>{profile?.full_name}</div>
            <div style={{ fontSize: 12.5, color: "#8A8A86", marginTop: 2 }}>{profile?.email}</div>
            <Tag type="parent">Responsável</Tag>
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

      <NotifPrefs prefs={me?.notification_prefs} onSave={setNotificationPrefs} />

      <Card pad={0}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="ch tap-target"
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", color: "#3C3C3B", fontSize: 15, fontWeight: 500, textAlign: "left", borderBottom: "1px solid #F5F2EC" }}
        >
          <span style={{ color: "#5A5A58", display: "flex" }}><Icon name={theme === "dark" ? "sun" : "moon"} size={20} /></span>
          <span style={{ flex: 1 }}>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
          <Icon name="arr" size={16} color="#B9CDE0" />
        </button>
        <button
          onClick={() => window.open("/privacidade", "_blank")}
          className="ch tap-target"
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", color: "#3C3C3B", fontSize: 15, fontWeight: 500, textAlign: "left", borderBottom: "1px solid #F5F2EC" }}
        >
          <span style={{ color: "#5A5A58", display: "flex" }}><Icon name="shield" size={20} /></span>
          <span style={{ flex: 1 }}>Política de Privacidade</span>
          <Icon name="arr" size={16} color="#B9CDE0" />
        </button>
        <button
          onClick={onLogout}
          className="ch tap-target"
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", color: "#B83A3A", fontSize: 15, fontWeight: 500, textAlign: "left" }}
        >
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

function NoChildrenHelp() {
  return (
    <Card pad={22} style={{ marginTop: 18, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 28, background: "#F5E5CD", color: "#C97A1F", display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
        <Icon name="clipboard" size={26} />
      </div>
      <div className="serif" style={{ fontSize: 20, fontWeight: 500, color: "#152741" }}>Nenhum filho associado</div>
      <p style={{ fontSize: 13.5, color: "#5A5A58", lineHeight: 1.6, marginTop: 8, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
        Não encontrámos um paciente em que o seu nome esteja registado como pai ou mãe. Contacte a direção para activar o seu acesso aos dados dos seus filhos.
      </p>
    </Card>
  );
}

function PracticeTab({ myChildren, homeExercises, homeAssignments, homeCompletions, markCompletion }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  if (myChildren.length === 0) return <div style={{ padding: 24, fontSize: 13, color: "#8A8A86", textAlign: "center" }}>Nenhum filho associado.</div>;
  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 18 }}>
      {myChildren.map((child) => {
        const mine = homeAssignments.filter((a) => a.patient_id === child.id && a.active !== false);
        return (
          <Card key={child.id} pad={18}>
            <div className="serif" style={{ fontSize: 20, fontWeight: 300, color: "#152741", marginBottom: 12 }}>{child.name}</div>
            {mine.length === 0 ? (
              <div style={{ fontSize: 13, color: "#8A8A86" }}>Ainda sem exercícios atribuídos. O terapeuta atribui após a sessão.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mine.map((a) => {
                  const ex = homeExercises.find((x) => x.id === a.exercise_id);
                  if (!ex) return null;
                  const doneToday = homeCompletions.some((c) => c.patient_id === child.id && c.exercise_id === a.exercise_id && c.date === todayISO);
                  const streak = calcStreak(homeCompletions, child.id, a.exercise_id);
                  return (
                    <div key={a.id} style={{ padding: 12, background: "#FFFFFF", border: "1px solid #EAE6DD", borderRadius: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#152741" }}>{ex.title}</div>
                          <div style={{ fontSize: 12, color: "#8A8A86", marginTop: 2 }}>
                            {ex.suggested_frequency} · {ex.duration_seconds || 60}s
                            {streak > 1 && <span style={{ marginLeft: 8, color: "#E8A13C", fontWeight: 600 }}>{streak}d seguidos</span>}
                          </div>
                        </div>
                      </div>
                      {ex.description && <div style={{ fontSize: 12.5, color: "#5A5A58", marginTop: 8, lineHeight: 1.5 }}>{ex.description}</div>}
                      {ex.video_url && (
                        <a href={ex.video_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#E8A13C", textDecoration: "underline", display: "inline-block", marginTop: 8 }}>Ver vídeo demo →</a>
                      )}
                      {a.custom_notes && <div style={{ fontSize: 12, color: "#5A5A58", marginTop: 8, padding: "6px 10px", background: "#F5F2EC", borderRadius: 8, fontStyle: "italic" }}>Terapeuta: {a.custom_notes}</div>}
                      <div style={{ marginTop: 10 }}>
                        {doneToday ? (
                          <Tag type="realizada">Feito hoje</Tag>
                        ) : (
                          <Btn size="sm" variant="primary" onClick={() => markCompletion(child.id, a.exercise_id)}>Marcar feito hoje</Btn>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
function NotifPrefs({ prefs, onSave }) {
  const cur = prefs || { reminders: true, announcements: true, requests: true };
  const toggle = (key) => onSave({ ...cur, [key]: !cur[key] });
  const items = [
    { key: "reminders", label: "Lembretes de sessão", desc: "Push do lembrete diário 18h" },
    { key: "announcements", label: "Anúncios da direção", desc: "Novidades e comunicações" },
    { key: "requests", label: "Estado de pedidos", desc: "Aprovado / recusado" },
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
          <button onClick={() => toggle(it.key)} aria-pressed={!!cur[it.key]} style={{ position: "relative", width: 44, height: 26, borderRadius: 13, background: cur[it.key] ? "#E8A13C" : "#D9D3C5", border: "none", cursor: "pointer", padding: 0, transition: "background .18s" }}>
            <span aria-hidden="true" style={{ position: "absolute", top: 2, left: cur[it.key] ? 20 : 2, width: 22, height: 22, borderRadius: 11, background: "#FFFFFF", transition: "left .18s", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} />
          </button>
        </div>
      ))}
    </Card>
  );
}

function calcStreak(completions, patientId, exerciseId) {
  const dates = new Set(completions.filter((c) => c.patient_id === patientId && c.exercise_id === exerciseId).map((c) => c.date));
  let streak = 0;
  const cur = new Date();
  while (streak < 60) {
    const iso = cur.toISOString().slice(0, 10);
    if (!dates.has(iso)) break;
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}
