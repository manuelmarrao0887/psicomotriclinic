import { useEffect, useState } from "react";
import { sb } from "../../lib/firebase.js";
import { Eyebrow, Card, Stat, Section } from "../../lib/ui.jsx";

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

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [profs, setProfs] = useState([]);
  const [pts, setPts] = useState([]);

  useEffect(() => {
    (async () => {
      const [u, v, p, pa] = await Promise.all([
        sb.from("profiles").select("*"),
        sb.from("visits").select("*").order("created_at", { ascending: false }).limit(2000),
        sb.from("professionals").select("*").eq("active", true),
        sb.from("patients").select("*").eq("active", true),
      ]);
      setUsers(u.data || []);
      setVisits(v.data || []);
      setProfs(p.data || []);
      setPts(pa.data || []);
    })();
  }, []);

  const now = Date.now();
  const ts = (v) => new Date(v.ts || v.created_at || 0).getTime();
  const since = (ms) => visits.filter((v) => now - ts(v) <= ms);
  const activeUsers = users.filter((u) => u.active !== false).length;
  const active24 = new Set(since(24 * 36e5).map((v) => v.profile_id)).size;

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

      <Section eyebrow="— EM CONSTRUÇÃO" title="Mais widgets a caminho" sub="P&L mensal, aniversários, alertas, KPI por profissional…" />
      <Card pad={22}>
        <div style={{ fontSize: 13.5, color: "#8A8A86", lineHeight: 1.6 }}>
          Esta é a nova versão do Hub (Vite + React Router) — está a ser construída em paralelo com a versão atual.
          As próximas iterações vão migrar as restantes páginas (Utilizadores, Equipa, Pacientes, Agenda, Financeiro, Pedidos, Definições) e adicionar
          o conjunto completo de funcionalidades clínicas (notas de sessão, plano de intervenção, anamnese), compliance (RGPD, auditoria) e plataforma (PWA, lembretes, MB WAY).
        </div>
      </Card>
    </div>
  );
}
