import { useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Eyebrow, Card, Stat, Section, Av } from "../../lib/ui.jsx";

const PERIODS = [
  { l: "Última hora",  ms: 36e5 },
  { l: "Últimas 12h",  ms: 12 * 36e5 },
  { l: "Últimas 24h",  ms: 24 * 36e5 },
  { l: "Última semana", ms: 7 * 24 * 36e5 },
  { l: "Último mês",   ms: 30 * 24 * 36e5 },
  { l: "2 meses",      ms: 60 * 24 * 36e5 },
  { l: "6 meses",      ms: 182 * 24 * 36e5 },
  { l: "1 ano",        ms: 365 * 24 * 36e5 },
];

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
  let age = today.getFullYear() - d.getFullYear() + 1;
  const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) age = today.getFullYear() - d.getFullYear() + 1;
  return age;
}

export default function Dashboard() {
  const { users, visits, profs, pts } = useStore();
  const navigate = useNavigate();

  const now = Date.now();
  const ts = (v) => new Date(v.ts || v.created_at || 0).getTime();
  const since = (ms) => visits.filter((v) => now - ts(v) <= ms);
  const activeUsers = users.filter((u) => u.active !== false).length;
  const active24 = new Set(since(24 * 36e5).map((v) => v.profile_id)).size;

  // Aniversários — pacientes nos próximos 30 dias
  const birthdays = pts
    .map((p) => ({ p, days: daysUntilBirthday(p.birth_date), age: ageOnNext(p.birth_date) }))
    .filter((x) => x.days != null && x.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 8 }}>
        <Stat label="UTILIZADORES" value={activeUsers} accent="#8DBF94" trend="contas ativas" />
        <Stat label="PROFISSIONAIS" value={profs.length} accent="#B9CDE0" />
        <Stat label="PACIENTES" value={pts.length} accent="#E8A13C" trend="casos ativos" />
        <Stat label="VISITAS (24H)" value={since(24 * 36e5).length} accent="#152741" trend={`${active24} distintos`} />
      </div>

      <Section eyebrow="— ATIVIDADE" title="Visitas por período" sub="Acessos à plataforma ao longo do tempo" />
      <Card pad={22}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {PERIODS.map((p) => (
            <div key={p.l}>
              <div className="mono" style={{ fontSize: 10.5, color: "#8A8A86" }}>{p.l.toUpperCase()}</div>
              <div className="serif" style={{ fontSize: 28, fontWeight: 300, color: "#152741", marginTop: 4, letterSpacing: "-0.02em" }}>
                {since(p.ms).length}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Section eyebrow="— PESSOAS" title="Aniversários nos próximos 30 dias" sub="Pacientes que fazem anos em breve" />
      <Card pad={22}>
        {birthdays.length === 0 ? (
          <div style={{ fontSize: 13.5, color: "#8A8A86" }}>Sem aniversários nos próximos 30 dias.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {birthdays.map(({ p, days, age }) => {
              const ini = p.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
              const d = p.birth_date ? new Date(p.birth_date) : null;
              const label = d ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}` : "";
              return (
                <div key={p.id} className="ch" onClick={() => navigate(`/pacientes/${p.id}`)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: 12, borderRadius: 10, background: "#FBF9F4", border: "1px solid #EFEBE2", cursor: "pointer",
                }}>
                  <Av t={ini} bg="#F5D9A8" sz={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#152741" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#8A8A86", marginTop: 2 }}>
                      {label} · faz {age} anos · {days === 0 ? "hoje" : days === 1 ? "amanhã" : `em ${days} dias`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
