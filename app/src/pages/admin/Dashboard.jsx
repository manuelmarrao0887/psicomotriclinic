import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Av } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";
import { DAYS, HOURS, MES_PT, CLINIC_CUT } from "../../lib/constants.js";

/* ── Briefing de gestão ──────────────────────────────────────────────
   Responde a uma pergunta: "como está a clínica hoje, e o que precisa de
   mim?". A leitura assenta no modelo da agenda — sessões recorrentes
   semanais por paciente (day_of_week + hour). A barra de proporção é a
   assinatura: equilíbrio, como as pedras empilhadas do logótipo.
   Tokens "Brand Aligned": paper #FFFFFF · linha #EAEE… (#EAE6DD) ·
   inset #F5F2EC — combinam com o dark-mode em index.css.
──────────────────────────────────────────────────────────────────── */

const PAPER = "#FFFFFF", LINE = "#EAE6DD", INSET = "#F5F2EC";
const INK = "#152741", SUB = "#8A8A86", BODY = "#5A5A58";

const pad = (n) => String(n).padStart(2, "0");
const localISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const WEEKDAY = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

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
  return new Date().getFullYear() - d.getFullYear() + 1;
}

export default function Dashboard() {
  const { profile, profs, pts, notes = [], pays = [], reqs = [], visits = [], users = [], waitlist = [] } = useStore();
  const meDoc = users.find((u) => u.id === profile?.id);
  const myPhoto = meDoc?.photo_url || null;
  const myInitials = (profile?.full_name || "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const navigate = useNavigate();

  // entrada das barras (uma vez; reduced-motion neutraliza a transição no CSS)
  const [grown, setGrown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrown(true), 60); return () => clearTimeout(t); }, []);

  const now = new Date();
  const jsDay = now.getDay();                       // 0 Dom … 6 Sáb
  const todayIdx = jsDay === 0 ? -1 : jsDay - 1;    // índice em DAYS (Seg=0…Sex=4); -1 = fim-de-semana
  const todayISO = localISO(now);
  const firstName = (profile?.full_name || "").trim().split(" ")[0] || "";
  const greet = now.getHours() < 13 ? "Bom dia" : now.getHours() < 20 ? "Boa tarde" : "Boa noite";

  // ── Pulso da semana: carga recorrente por dia útil ──
  const loadByDay = DAYS.map((d) => pts.filter((p) => p.day_of_week === d).length);
  const maxLoad = Math.max(1, ...loadByDay);
  const weekTotal = loadByDay.reduce((a, b) => a + b, 0);
  const todaySessions = todayIdx >= 0 ? loadByDay[todayIdx] : 0;

  // ── Sessões registadas: hoje / esta semana ──
  const monday = new Date(now);
  monday.setDate(now.getDate() + (jsDay === 0 ? -6 : 1 - jsDay));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23, 59, 59, 999);
  const inWeek = (iso) => { const d = new Date(`${iso}T00:00:00`); return d >= monday && d <= sunday; };

  const weekNotes = notes.filter((n) => n.date && inWeek(n.date));
  const cnt = (s) => weekNotes.filter((n) => n.status === s).length;
  const wkRealizadas = cnt("realizada");
  const wkFaltas = cnt("falta");
  const wkCancel = cnt("cancelado");
  const wkRegistos = wkRealizadas + wkFaltas + wkCancel;
  const presenca = wkRegistos ? Math.round((wkRealizadas / wkRegistos) * 100) : null;

  const todayDone = notes.filter((n) => n.date === todayISO && n.status === "realizada").length;
  const faltasHoje = notes.filter((n) => n.date === todayISO && n.status === "falta").length;

  // ── Financeiro do mês corrente ──
  const monthLabel = `${MES_PT[now.getMonth()]} ${now.getFullYear()}`;
  const monthPays = pays.filter((p) => p.month === monthLabel);
  const paidSum = monthPays.filter((p) => p.status === "pago").reduce((a, p) => a + (+p.amount || 0), 0);
  const pendSum = monthPays.filter((p) => p.status === "pendente").reduce((a, p) => a + (+p.amount || 0), 0);
  const eur = (n) => n.toLocaleString("pt-PT", { maximumFractionDigits: 0 }) + " €";

  // ── Pendências (só aparecem se > 0) ──
  const pedidosPend = reqs.filter((r) => r.status !== "aprovado" && r.status !== "recusado").length;
  const pagosPend = pays.filter((p) => p.status === "pendente").length;
  const isDirector = profile?.role === "director";
  const visits24 = visits.filter((v) => Date.now() - new Date(v.ts || v.created_at || 0).getTime() <= 24 * 36e5).length;

  const attn = [
    pedidosPend && { label: pedidosPend === 1 ? "1 pedido por aprovar" : `${pedidosPend} pedidos por aprovar`, icon: "swap", to: "/pedidos", tone: "#E8A13C" },
    pagosPend && { label: pagosPend === 1 ? "1 pagamento pendente" : `${pagosPend} pagamentos pendentes`, icon: "wallet", to: "/financeiro", tone: "#C97A1F" },
    faltasHoje && { label: faltasHoje === 1 ? "1 falta hoje" : `${faltasHoje} faltas hoje`, icon: "warn", to: "/agenda", tone: "#B83A3A" },
  ].filter(Boolean);

  // ── Aniversários nos próximos 30 dias ──
  const birthdays = pts
    .map((p) => ({ p, days: daysUntilBirthday(p.birth_date), age: ageOnNext(p.birth_date) }))
    .filter((x) => x.days != null && x.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  // Pedras de identidade — ordem e cor seguem a pilha do logótipo (amber→sage→sky→navy)
  const STONES = [
    { label: "Pacientes", value: pts.length, foot: "casos ativos", color: "#E8A13C", to: "/pacientes" },
    { label: "Equipa", value: profs.length, foot: "profissionais", color: "#8DBF94", to: "/equipa" },
    { label: "Sessões / semana", value: weekTotal, foot: "agenda recorrente", color: "#B9CDE0", to: "/agenda" },
    isDirector
      ? { label: "Visitas (24h)", value: visits24, foot: "acessos à plataforma", color: INK, to: null }
      : { label: "Realizadas", value: wkRealizadas, foot: "sessões esta semana", color: INK, to: "/agenda" },
  ];

  return (
    <div className="page-pad fu" style={{ padding: "28px 40px 64px" }}>

      {/* ── HERO: briefing de hoje + pulso da semana ── */}
      <section className="dash-hero" style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 18, padding: "26px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
          <Av t={myInitials} bg="#E8A13C" sz={64} color="#152741" photoUrl={myPhoto} />
          <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mono" style={{ color: SUB, fontSize: 11 }}>
            {WEEKDAY[jsDay].toUpperCase()} · {pad(now.getDate())} {MES_PT[now.getMonth()].toUpperCase()}
          </div>
          <h2 className="serif" style={{ fontSize: 32, color: INK, letterSpacing: "-0.025em", lineHeight: 1.05, marginTop: 8 }}>
            {greet}{firstName ? `, ${firstName}` : ""}.
          </h2>
          <p style={{ fontSize: 15, color: BODY, marginTop: 8, lineHeight: 1.5 }}>
            {todayIdx < 0 ? (
              <>Fim de semana — sem sessões agendadas. A semana fecha com{" "}
                <strong className="tnum" style={{ color: INK, fontWeight: 600 }}>{wkRealizadas}</strong> sessões realizadas.</>
            ) : todaySessions === 0 ? (
              <>Sem sessões marcadas para hoje.</>
            ) : (
              <><strong className="tnum" style={{ color: INK, fontWeight: 600 }}>{todaySessions}</strong>{" "}
                {todaySessions === 1 ? "sessão" : "sessões"} hoje
                {todayDone > 0 && <> · <span className="tnum" style={{ color: "#3D7A4A", fontWeight: 600 }}>{todayDone}</span> já realizadas</>}
                {faltasHoje > 0 && <> · <span className="tnum" style={{ color: "#B83A3A", fontWeight: 600 }}>{faltasHoje}</span> {faltasHoje === 1 ? "falta" : "faltas"}</>}
              </>
            )}
          </p>

          {attn.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {attn.map((a) => (
                <button key={a.label} onClick={() => navigate(a.to)} className="ch tap-target"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "7px 12px 7px 10px", borderRadius: 99,
                    background: INSET, border: `1px solid ${LINE}`,
                    fontSize: 13, fontWeight: 500, color: INK,
                  }}>
                  <span style={{ display: "flex", color: a.tone }}><Icon name={a.icon} size={15} /></span>
                  {a.label}
                  <Icon name="arr" size={13} color="#B9CDE0" />
                </button>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Pulso da semana — assinatura: carga recorrente por dia útil, hoje aceso */}
        <div role="img" aria-label={`Carga semanal por dia: ${DAYS.map((d, i) => `${d} ${loadByDay[i]}`).join(", ")}`} style={{ minWidth: 236 }}>
          <div className="mono" style={{ color: SUB, fontSize: 10, marginBottom: 10 }}>— PULSO DA SEMANA</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 96 }}>
            {DAYS.map((d, i) => {
              const isToday = i === todayIdx;
              const h = 14 + (loadByDay[i] / maxLoad) * 74;
              return (
                <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                  <div className="tnum" style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? INK : SUB }}>{loadByDay[i]}</div>
                  <div className="pulse-bar" aria-hidden="true" style={{
                    width: "100%", borderRadius: 6, height: grown ? h : 14,
                    background: isToday ? "#E8A13C" : "#B9CDE0",
                    boxShadow: isToday ? "0 4px 12px rgba(232,161,60,.35)" : "none",
                  }} />
                  <div className="mono" style={{ fontSize: 9.5, color: isToday ? INK : "#A8A8A0", fontWeight: isToday ? 600 : 400 }}>
                    {d.slice(0, 3).toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOJE widget: sessões + alertas em 2 col ── */}
      <TodayWidget pts={pts} profs={profs} notes={notes} pays={pays} reqs={reqs} todayIdx={todayIdx} todayISO={todayISO} navigate={navigate} />

      {/* ── Fila de pedras: totais de identidade ── */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginTop: 14 }}>
        {STONES.map((s) => {
          const clickable = !!s.to;
          return (
            <div key={s.label}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-label={clickable ? `${s.label}: ${s.value}` : undefined}
              onClick={clickable ? () => navigate(s.to) : undefined}
              onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(s.to); } } : undefined}
              className={clickable ? "ch" : undefined}
              style={{
                background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14,
                padding: "18px 18px 16px", position: "relative", overflow: "hidden",
                cursor: clickable ? "pointer" : "default",
              }}>
              <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
              <div className="mono" style={{ fontSize: 10.5, color: SUB }}>{s.label.toUpperCase()}</div>
              <div className="serif tnum" style={{ fontSize: 38, color: INK, lineHeight: 1, marginTop: 12, letterSpacing: "-0.03em" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: SUB, marginTop: 7 }}>{s.foot}</div>
            </div>
          );
        })}
      </div>

      {/* ── Duas colunas: equilíbrio (esquerda) + pessoas (direita) ── */}
      <div className="dash-cols" style={{ marginTop: 14 }}>

        {/* Coluna principal — o equilíbrio da clínica */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Presença da semana */}
          <Panel>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: SUB }}>— ESTA SEMANA</div>
                <div className="serif" style={{ fontSize: 20, color: INK, marginTop: 6, letterSpacing: "-0.02em" }}>Presença nas sessões</div>
              </div>
              {presenca != null && (
                <div className="serif tnum" style={{ fontSize: 30, color: INK, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {presenca}<span style={{ fontSize: 16, color: SUB }}>%</span>
                </div>
              )}
            </div>
            {wkRegistos === 0 ? (
              <EmptyLine icon="clock" text="Ainda sem registos de sessão esta semana. Aparecem aqui à medida que a equipa preenche." />
            ) : (
              <>
                <BalanceBar grown={grown} segments={[
                  { v: wkRealizadas, color: "#8DBF94", label: "Realizadas" },
                  { v: wkFaltas, color: "#B83A3A", label: "Faltas" },
                  { v: wkCancel, color: "#D9D3C5", label: "Canceladas" },
                ]} />
                <div style={{ display: "flex", gap: 22, marginTop: 14, flexWrap: "wrap" }}>
                  <Legend color="#8DBF94" label="Realizadas" value={wkRealizadas} />
                  <Legend color="#B83A3A" label="Faltas" value={wkFaltas} />
                  <Legend color="#D9D3C5" label="Canceladas" value={wkCancel} ring />
                </div>
              </>
            )}
          </Panel>

          {/* Financeiro do mês */}
          <Panel>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: SUB }}>— {monthLabel.toUpperCase()}</div>
                <div className="serif" style={{ fontSize: 20, color: INK, marginTop: 6, letterSpacing: "-0.02em" }}>Recebido vs. pendente</div>
              </div>
              <button onClick={() => navigate("/financeiro")} className="ch" style={{ fontSize: 13, fontWeight: 500, color: INK, display: "inline-flex", alignItems: "center", gap: 5 }}>
                Financeiro <Icon name="arr" size={14} color="#B9CDE0" />
              </button>
            </div>
            {paidSum + pendSum === 0 ? (
              <EmptyLine icon="wallet" text={`Sem pagamentos registados em ${monthLabel}.`} />
            ) : (
              <>
                <BalanceBar grown={grown} segments={[
                  { v: paidSum, color: "#3D7A4A", label: "Recebido" },
                  { v: pendSum, color: "#F5D9A8", label: "Pendente" },
                ]} />
                <div style={{ display: "flex", gap: 22, marginTop: 14, flexWrap: "wrap" }}>
                  <Legend color="#3D7A4A" label="Recebido" value={eur(paidSum)} />
                  <Legend color="#F5D9A8" label="Pendente" value={eur(pendSum)} ring />
                </div>
              </>
            )}
          </Panel>
        </div>

        {/* Coluna lateral — pessoas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <InsightsPanel pts={pts} profs={profs} pays={pays} notes={notes} waitlist={waitlist} navigate={navigate} />
        <Panel>
          <div className="mono" style={{ fontSize: 10.5, color: SUB }}>— PRÓXIMOS 30 DIAS</div>
          <div className="serif" style={{ fontSize: 20, color: INK, marginTop: 6, marginBottom: 16, letterSpacing: "-0.02em" }}>Aniversários</div>
          {birthdays.length === 0 ? (
            <EmptyLine icon="calendar" text="Sem aniversários nos próximos 30 dias." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {birthdays.map(({ p, days, age }) => {
                const ini = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                const d = p.birth_date ? new Date(p.birth_date) : null;
                const dm = d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` : "";
                const when = days === 0 ? "hoje" : days === 1 ? "amanhã" : `em ${days} dias`;
                const open = () => navigate(`/pacientes/${p.id}`);
                return (
                  <div key={p.id} role="button" tabIndex={0}
                    aria-label={`Abrir ficha de ${p.name}, faz ${age} anos ${when}`}
                    className="ch"
                    onClick={open}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 8px", borderRadius: 10, cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = INSET; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                    <Av t={ini} bg={days === 0 ? "#F5D9A8" : "#DCE7F0"} sz={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: SUB, marginTop: 1 }}>{dm} · faz {age}</div>
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", color: days === 0 ? "#C97A1F" : SUB }}>{when}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
        </div>
      </div>
    </div>
  );
}

function InsightsPanel({ pts, profs, pays, notes, waitlist, navigate }) {
  const now = new Date();
  const months = [0, 1, 2].map((back) => {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    return `${MES_PT[d.getMonth()]} ${d.getFullYear()}`;
  }).reverse();
  const mrrByMonth = months.map((m) => (pays || []).filter((p) => p.month === m && p.status === "pago").reduce((s, p) => s + (+p.amount || 0), 0));
  const mrr3 = mrrByMonth.reduce((s, v) => s + v, 0) / 3;
  const curMrr = mrrByMonth[mrrByMonth.length - 1];
  const prevMrr = mrrByMonth[mrrByMonth.length - 2] || 0;
  const growth = prevMrr > 0 ? ((curMrr - prevMrr) / prevMrr) * 100 : null;

  // Vagas: slots (day × hour) da grelha semanal que não estão ocupados por
  // nenhum patient.day_of_week+hour. Só conta horas em uso pela clínica (as
  // horas que já têm algum paciente em algum dia).
  const usedHours = Array.from(new Set(pts.map((p) => p.hour).filter(Boolean))).sort();
  const busyByDay = DAYS.map((d) => new Set(pts.filter((p) => p.day_of_week === d).map((p) => p.hour)));
  const gapsByDay = DAYS.map((d, i) => usedHours.filter((h) => !busyByDay[i].has(h)).length);
  const totalGaps = gapsByDay.reduce((s, v) => s + v, 0);

  // Top-3 profs por receita do último mês
  const curMonth = months[months.length - 1];
  const revByProf = new Map();
  (pays || []).filter((p) => p.month === curMonth && p.status === "pago").forEach((p) => {
    let profId = p.professional_id;
    if (!profId) {
      const pt = pts.find((x) => x.id === p.patient_id);
      profId = pt?.professional_id || pt?.professional_ids?.[0] || null;
    }
    if (!profId) return;
    revByProf.set(profId, (revByProf.get(profId) || 0) + (+p.amount || 0));
  });
  const topProfs = Array.from(revByProf.entries())
    .map(([profId, v]) => ({ prof: profs.find((x) => x.id === profId), v }))
    .filter((x) => x.prof)
    .sort((a, b) => b.v - a.v)
    .slice(0, 3);

  // Auto-match waitlist: sugestões simples
  // Para cada waitlist entry activa, mostra "N vagas potenciais em X profissionais"
  const activeWait = (waitlist || []).filter((w) => (w.status || "new") === "new" || w.status === "contacted").slice(0, 3);
  const suggestions = activeWait.map((w) => ({
    entry: w,
    gaps: totalGaps,
  }));

  return (
    <>
    <div style={{ background: "#FFFFFF", border: "1px solid #EAE6DD", borderRadius: 14, padding: 20 }}>
      <div className="mono" style={{ fontSize: 10.5, color: "#8A8A86" }}>— INSIGHTS</div>
      <div className="serif" style={{ fontSize: 20, color: "#152741", marginTop: 6, marginBottom: 14, letterSpacing: "-0.02em" }}>Pulso do trimestre</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ padding: 12, background: "#F5F2EC", borderRadius: 10 }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86" }}>MRR MÉDIO 3M</div>
          <div className="serif tnum" style={{ fontSize: 22, fontWeight: 300, color: "#152741", marginTop: 4 }}>{mrr3.toFixed(0)}€</div>
        </div>
        <div style={{ padding: 12, background: "#F5F2EC", borderRadius: 10 }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86" }}>CRESCIMENTO M/M</div>
          <div className="serif tnum" style={{ fontSize: 22, fontWeight: 300, color: growth != null && growth < 0 ? "#B83A3A" : "#3D7A4A", marginTop: 4 }}>
            {growth == null ? "—" : `${growth > 0 ? "+" : ""}${growth.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {topProfs.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86", marginBottom: 8 }}>TOP · {curMonth.toUpperCase()}</div>
          {topProfs.map((t, i) => {
            const netCut = t.v * (1 - CLINIC_CUT);
            return (
              <div key={t.prof.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderTop: i === 0 ? "none" : "1px dashed #EAE6DD" }}>
                <span className="serif" style={{ fontSize: 16, color: "#8A8A86", width: 20 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.prof.name}</span>
                <span className="tnum" style={{ fontSize: 13, color: "#152741", fontWeight: 600 }}>{t.v.toFixed(0)}€</span>
                <span className="tnum" style={{ fontSize: 11, color: "#8A8A86" }}>({netCut.toFixed(0)}€)</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Vagas por dia */}
      <div style={{ marginTop: 16 }}>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86", marginBottom: 8 }}>VAGAS POTENCIAIS</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span className="tnum" style={{ fontSize: 11, color: "#152741", fontWeight: 600 }}>{gapsByDay[i]}</span>
              <div style={{ width: "100%", background: gapsByDay[i] > 0 ? "#8DBF94" : "#EAE6DD", borderRadius: 4, height: Math.max(4, gapsByDay[i] * 6) }} />
              <span className="mono" style={{ fontSize: 9, color: "#8A8A86" }}>{d.slice(0, 3).toUpperCase()}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: "#8A8A86", marginTop: 8 }}>
          {totalGaps === 0 ? "Sem vagas — grelha cheia." : `${totalGaps} slots livres na grelha semanal (com base nas horas em uso).`}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: "#F5E5CD", borderRadius: 10, border: "1px solid #ECC58A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Icon name="clock" size={14} color="#C97A1F" />
            <span className="mono" style={{ fontSize: 10, letterSpacing: ".12em", fontWeight: 700, color: "#C97A1F" }}>LISTA DE ESPERA · {suggestions.length}</span>
          </div>
          <div style={{ fontSize: 13, color: "#7A4A0E", lineHeight: 1.5, marginBottom: 8 }}>
            {suggestions[0].gaps > 0
              ? `Existem ${suggestions[0].gaps} vagas potenciais para os primeiros ${suggestions.length} contactos.`
              : "Sem vagas atuais para os contactos em espera."}
          </div>
          <button onClick={() => navigate("/lista-espera")} className="ch" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "6px 10px", borderRadius: 8,
            background: "#FFFFFF", border: "1px solid #ECC58A",
            fontSize: 12, fontWeight: 600, color: "#7A4A0E", cursor: "pointer",
          }}>Ver lista <Icon name="arr" size={12} /></button>
        </div>
      )}
    </div>
    </>
  );
}

/* ── Painel base (tokens Brand Aligned; combina com o dark-mode) ── */
function Panel({ children }) {
  return (
    <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 16, padding: 22 }}>{children}</div>
  );
}

/* ── Barra de proporção — a assinatura (equilíbrio) ── */
function BalanceBar({ segments, grown }) {
  const total = segments.reduce((a, s) => a + (s.v || 0), 0) || 1;
  return (
    <div style={{ display: "flex", height: 12, borderRadius: 99, overflow: "hidden", background: INSET, gap: 2 }}>
      {segments.filter((s) => s.v > 0).map((s) => (
        <div key={s.label} className="bal-seg" title={`${s.label}: ${s.v}`}
          style={{ width: grown ? `${(s.v / total) * 100}%` : "0%", background: s.color, height: "100%" }} />
      ))}
    </div>
  );
}

function Legend({ color, label, value, ring }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: color, border: ring ? "1px solid #C9C2B2" : "none" }} />
      <span style={{ fontSize: 12.5, color: BODY }}>{label}</span>
      <span className="tnum" style={{ fontSize: 13, fontWeight: 600, color: INK }}>{value}</span>
    </div>
  );
}

function EmptyLine({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", color: SUB, fontSize: 13.5 }}>
      <span style={{ display: "flex", color: "#B9CDE0" }}><Icon name={icon} size={18} /></span>
      {text}
    </div>
  );
}

function TodayWidget({ pts, profs, notes, pays, reqs, todayIdx, todayISO, navigate }) {
  const todayLabel = todayIdx >= 0 ? DAYS[todayIdx] : null;
  const todaySessions = todayLabel ? pts.filter((p) => p.day_of_week === todayLabel).sort((a, b) => (a.hour || "").localeCompare(b.hour || "")) : [];

  // Aniversários -3d/+3d
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const birthdaysSoon = pts.map((p) => {
    if (!p.birth_date) return null;
    const d = new Date(p.birth_date);
    if (isNaN(d)) return null;
    const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    if (next < today) next.setFullYear(next.getFullYear() + 1);
    const days = Math.round((next - today) / 86400000);
    return days <= 3 ? { p, days } : null;
  }).filter(Boolean).sort((a, b) => a.days - b.days);

  const pendReqs = (reqs || []).filter((r) => r.status === "pendente" || !r.status);
  const overduePays = (pays || []).filter((p) => p.status === "pendente").slice(0, 5);
  const notesToday = (notes || []).filter((n) => n.date === todayISO);
  const faltas = notesToday.filter((n) => n.status === "falta");

  const alerts = [
    ...birthdaysSoon.map((b) => ({ icon: "trend", label: `${b.p.name} faz anos ${b.days === 0 ? "hoje" : b.days === 1 ? "amanhã" : `em ${b.days}d`}`, tone: "#C97A1F", bg: "#F5E5CD", to: `/pacientes/${b.p.id}` })),
    ...pendReqs.map((r) => ({ icon: "swap", label: `${r.patient_name || "Pedido"} — troca pendente`, tone: "#1E3556", bg: "#DCE7F0", to: "/pedidos" })),
    ...faltas.map((n) => ({ icon: "warn", label: `Falta: ${(pts.find((p) => p.id === n.patient_id) || {}).name || "?"}`, tone: "#B83A3A", bg: "#F4E0E0", to: `/pacientes/${n.patient_id}` })),
    ...overduePays.slice(0, 3).map((p) => ({ icon: "wallet", label: `${(pts.find((x) => x.id === p.patient_id) || {}).name || "?"} — ${p.month} por cobrar`, tone: "#C97A1F", bg: "#F5E5CD", to: "/financeiro" })),
  ];

  return (
    <section style={{ background: "#FFFFFF", border: "1px solid #EAE6DD", borderRadius: 18, padding: "22px 24px", marginTop: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="today-grid">
        <div>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "#8A8A86", marginBottom: 10 }}>— SESSÕES DE HOJE</div>
          {todaySessions.length === 0 ? (
            <div style={{ fontSize: 14, color: "#8A8A86" }}>{todayLabel ? "Sem sessões marcadas para hoje." : "Fim de semana."}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflow: "auto" }}>
              {todaySessions.slice(0, 8).map((p) => {
                const ids = p.professional_ids?.length ? p.professional_ids : (p.professional_id ? [p.professional_id] : []);
                const pr = profs.find((x) => x.id === ids[0]);
                const done = notesToday.some((n) => n.patient_id === p.id && n.status === "realizada");
                return (
                  <button key={p.id} onClick={() => navigate(`/pacientes/${p.id}`)} className="ch" style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 10,
                    background: done ? "#F5F2EC" : "transparent",
                    border: "1px solid #EAE6DD", textAlign: "left", cursor: "pointer",
                  }}>
                    <div className="mono" style={{ fontSize: 11, color: "#5A5A58", fontWeight: 600, width: 48 }}>{p.hour}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "#152741", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: "#8A8A86" }}>{pr?.name || "—"}</div>
                    </div>
                    {done && <span style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 99, background: "#DDEADE", color: "#3D7A4A", fontWeight: 600 }}>OK</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".12em", color: "#8A8A86", marginBottom: 10 }}>— A ATENDER</div>
          {alerts.length === 0 ? (
            <div style={{ fontSize: 14, color: "#8A8A86" }}>Tudo em ordem.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflow: "auto" }}>
              {alerts.slice(0, 10).map((a, i) => (
                <button key={i} onClick={() => navigate(a.to)} className="ch" style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 10,
                  background: a.bg, color: a.tone,
                  border: "none", textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 500,
                }}>
                  <span style={{ display: "flex" }}><Icon name={a.icon} size={14} /></span>
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width:899.98px){.today-grid{grid-template-columns:1fr!important;gap:16px!important;}}`}</style>
    </section>
  );
}
