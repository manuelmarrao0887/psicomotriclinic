import { useMemo, useRef, useState } from "react";
import { Mark, Icon } from "../../lib/icons.jsx";
import { Av, Btn, Card, Eyebrow, Tag, Progress, Field, Inp, Sel } from "../../lib/ui.jsx";
import { APP_VERSION, formatBuildDate, DAYS, HOURS } from "../../lib/constants.js";
import { useStore } from "../../lib/store.jsx";
import { sb } from "../../lib/firebase.js";

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
  const { pts, profs, plans, notes, pays, reqs, announcements, users = [], show } = useStore();
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

      <main id="main" style={{ maxWidth: 720, margin: "0 auto", padding: "12px 16px calc(var(--tabbar-h) + var(--safe-bottom) + 24px)" }}>
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

        {tab === "home" && <HomeTab profile={profile} myChildren={myChildren} profs={profs} plans={plans} notes={notes} pays={pays} announcements={visibleAnnouncements} recentlyResolved={recentlyResolved} onAck={markAllSeen} onRequest={() => setRequestOpen(true)} />}
        {tab === "sessions" && <SessionsTab myChildren={myChildren} profs={profs} notes={notes} />}
        {tab === "requests" && <RequestsTab myChildren={myChildren} myRequests={myRequests} onNew={() => setRequestOpen(true)} onOpen={() => markAllSeen()} />}
        {tab === "account" && <AccountTab profile={profile} onLogout={onLogout} theme={theme} setTheme={setTheme} />}
      </main>

      {/* BOTTOM TAB BAR */}
      <nav aria-label="Navegação" style={{
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
            { id: "sessions", label: "Sessões", icon: "calendar" },
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

function HomeTab({ myChildren, profs, plans, notes, pays, announcements, recentlyResolved, onAck, onRequest }) {
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
        myChildren.map((child) => <ChildCard key={child.id} child={child} profs={profs} plans={plans} notes={notes} pays={pays} onRequest={onRequest} />)
      )}
    </div>
  );
}

function ChildCard({ child, profs, plans, notes, pays, onRequest }) {
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
        <Btn variant="secondary" icon={<Icon name="swap" size={14} />} onClick={onRequest} style={{ width: "100%" }}>Pedir troca de horário</Btn>
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
                      {n.progress && <div style={{ fontSize: 13, color: "#3C3C3B", marginTop: 6, lineHeight: 1.5 }}>{n.progress}</div>}
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
  const { users = [], updateMyPhoto, removeMyPhoto } = useStore();
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
