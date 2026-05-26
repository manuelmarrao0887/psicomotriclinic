import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section, Tag } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";
import { ADMIN_EMAIL } from "../../lib/firebase.js";
import { APP_VERSION, formatBuildDate } from "../../lib/constants.js";
import { downloadCsv } from "../../lib/csv.js";
import { RELEASE_NOTES } from "../../lib/releaseNotes.js";

export default function Settings({ theme, setTheme }) {
  const { setForm, setModal, pts, profs, pays, notes, plans, anamneses, users, show } = useStore();
  const navigate = useNavigate();

  const exports = [
    {
      label: "Pacientes (CSV)",
      run: () => downloadCsv("pacientes.csv", pts, [
        { key: "name", label: "Nome" }, { key: "age", label: "Idade" },
        { key: "birth_date", label: "Data nasc." },
        { label: "Profissional principal", get: (r) => profs.find((p) => p.id === r.professional_id)?.name || "" },
        { key: "session_type", label: "Tipo" },
        { key: "day_of_week", label: "Dia" }, { key: "hour", label: "Hora" },
        { key: "periodicity", label: "Periodicidade" },
        { key: "parent_mother", label: "Mãe" }, { key: "parent_father", label: "Pai" },
        { key: "nif", label: "NIF" }, { key: "doctor", label: "Médico" },
        { key: "insurance_name", label: "Seguro" }, { key: "insurance_number", label: "Nº seguro" },
      ]),
    },
    {
      label: "Pagamentos (CSV)",
      run: () => downloadCsv("pagamentos.csv", pays, [
        { label: "Paciente", get: (r) => pts.find((p) => p.id === r.patient_id)?.name || "" },
        { key: "month", label: "Mês" }, { key: "amount", label: "Valor (€)" },
        { key: "status", label: "Estado" }, { key: "paid_date", label: "Data pagamento" },
      ]),
    },
    {
      label: "Profissionais (CSV)",
      run: () => downloadCsv("profissionais.csv", profs, [
        { key: "name", label: "Nome" }, { key: "role_title", label: "Função" },
        { key: "active", label: "Ativo" }, { key: "created_at", label: "Criado em" },
      ]),
    },
    {
      label: "Notas de sessão (CSV)",
      run: () => downloadCsv("notas-sessao.csv", notes, [
        { label: "Paciente", get: (r) => pts.find((p) => p.id === r.patient_id)?.name || "" },
        { key: "date", label: "Data" }, { key: "status", label: "Estado" },
        { label: "Profissional", get: (r) => profs.find((p) => p.id === r.professional_id)?.name || "" },
        { label: "Domínios", get: (r) => (r.domains || []).join(" | ") },
        { key: "work_done", label: "Trabalho realizado" },
        { key: "observations", label: "Observações" },
        { key: "progress", label: "Evolução" }, { key: "next_plan", label: "Próximo plano" },
      ]),
    },
    {
      label: "Utilizadores (CSV)",
      run: () => downloadCsv("utilizadores.csv", users, [
        { key: "full_name", label: "Nome" }, { key: "email", label: "Email/utilizador" },
        { key: "role", label: "Papel" }, { key: "active", label: "Ativo" }, { key: "created_at", label: "Criado em" },
      ]),
    },
  ];

  const actions = [
    { t: "Convidar utilizador",      d: "Criar conta e enviar credenciais de acesso", ic: "mail",      ac: "#EFEBE2", m: "invite" },
    { t: "Adicionar profissional",   d: "Registar novo terapeuta na equipa",          ic: "users",     ac: "#C7DDCB", m: "addProf" },
    { t: "Novo paciente",            d: "Abrir caso clínico e definir horário",       ic: "clipboard", ac: "#DCE7F0", m: "addPatient" },
    { t: "Registar pagamento",       d: "Recibo emitido ou cobrança pendente",        ic: "wallet",    ac: "#F5D9A8", m: "addPayment" },
    { t: "Alterar a minha password", d: "Definir uma nova password para a sua conta", ic: "shield",    ac: "#B9CDE0", m: "myPassword" },
  ];

  return (
    <div className="page-pad" style={{ padding: "28px 40px 60px" }}>
      <Section eyebrow="— ACÇÕES RÁPIDAS" title="O que queres fazer?" />
      <div className="settings-actions" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {actions.map((a, i) => (
          <Card key={a.m} delay={i * 40} pad={22} onClick={() => { setForm({}); setModal(a.m); }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: a.ac, color: "#152741", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={a.ic} size={22} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#152741" }}>{a.t}</div>
                <div style={{ fontSize: 13, color: "#8A8A86", marginTop: 3 }}>{a.d}</div>
              </div>
              <div style={{ color: "#B9CDE0" }}><Icon name="arr" size={16} /></div>
            </div>
          </Card>
        ))}
      </div>

      <Section eyebrow="— DADOS" title="Exportar para CSV" sub="Para contabilidade, backup, ou abrir no Excel/Sheets" />
      <Card pad={22}>
        <div className="settings-actions" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
          {exports.map((e) => (
            <Btn key={e.label} variant="secondary" icon={<Icon name="copy" size={14} />} onClick={() => { e.run(); show(`Exportado: ${e.label}`); }}>
              {e.label}
            </Btn>
          ))}
        </div>
      </Card>

      <Section eyebrow="— APARÊNCIA" title="Visual" />
      <Card pad={22}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#152741" }}>Modo escuro</div>
            <div style={{ fontSize: 13, color: "#8A8A86", marginTop: 3 }}>Alternar entre tema claro e escuro.</div>
          </div>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="ch" aria-label="Alternar modo escuro" style={{
            width: 52, height: 30, borderRadius: 15, border: "none", cursor: "pointer", padding: 3,
            background: theme === "dark" ? "#152741" : "#D9D3C5",
            display: "flex", alignItems: "center",
            justifyContent: theme === "dark" ? "flex-end" : "flex-start",
            transition: "background .2s",
          }}>
            <span style={{ width: 24, height: 24, borderRadius: 12, background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", color: "#152741" }}>
              <Icon name={theme === "dark" ? "shield" : "home"} size={13} />
            </span>
          </button>
        </div>
      </Card>

      <Section eyebrow="— SEGURANÇA & RGPD" title="Auditoria e privacidade" />
      <div className="settings-actions" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        <Card pad={22} onClick={() => navigate("/auditoria")}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "#DCE7F0", color: "#152741", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="shield" size={22} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#152741" }}>Log de auditoria</div>
              <div style={{ fontSize: 13, color: "#8A8A86", marginTop: 3 }}>Quem fez o quê, quando. Registos das ações.</div>
            </div>
            <div style={{ color: "#B9CDE0" }}><Icon name="arr" size={16} /></div>
          </div>
        </Card>
        <Card pad={22} onClick={() => window.open("/privacidade", "_blank")}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "#EFEBE2", color: "#152741", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="mail" size={22} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#152741" }}>Política de Privacidade</div>
              <div style={{ fontSize: 13, color: "#8A8A86", marginTop: 3 }}>RGPD: como tratamos os dados. Abre em nova aba.</div>
            </div>
            <div style={{ color: "#B9CDE0" }}><Icon name="arr" size={16} /></div>
          </div>
        </Card>
      </div>

      <Section eyebrow="— NOTAS DE VERSÃO" title="Release notes" sub="Histórico do que foi adicionado, alterado e removido em cada versão" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {RELEASE_NOTES.map((r, i) => (
          <ReleaseNoteCard key={r.version} note={r} defaultOpen={i === 0} />
        ))}
      </div>

      <Section eyebrow="— SISTEMA" title="Sobre" />
      <Card pad={26}>
        <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          <div><Eyebrow>VERSÃO</Eyebrow><div style={{ fontSize: 15, color: "#152741", marginTop: 6, fontWeight: 500 }}>{APP_VERSION}</div></div>
          <div><Eyebrow>ATUALIZADO</Eyebrow><div style={{ fontSize: 15, color: "#152741", marginTop: 6, fontWeight: 500 }}>{formatBuildDate()}</div></div>
          <div><Eyebrow>ADMINISTRADOR</Eyebrow><div style={{ fontSize: 15, color: "#152741", marginTop: 6, fontWeight: 500, wordBreak: "break-all" }}>{ADMIN_EMAIL}</div></div>
          <div><Eyebrow>WEB</Eyebrow><div style={{ fontSize: 15, color: "#152741", marginTop: 6, fontWeight: 500 }}>acasadapsicomotricidade.pt</div></div>
        </div>
      </Card>
    </div>
  );
}

function ReleaseNoteCard({ note, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const { added = [], changed = [], removed = [] } = note;
  const count = added.length + changed.length + removed.length;

  return (
    <Card pad={0} style={{ overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="ch tap-target"
        aria-expanded={open}
        style={{
          width: "100%", padding: "16px 18px",
          display: "flex", alignItems: "center", gap: 14,
          background: "transparent", textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#152741" }}>{note.version}</span>
            <span className="mono" style={{ fontSize: 10.5, color: "#8A8A86" }}>{note.date}</span>
            <Tag type="default">{count} {count === 1 ? "alteração" : "alterações"}</Tag>
          </div>
          <div style={{ fontSize: 14, color: "#3C3C3B", lineHeight: 1.4 }}>{note.title}</div>
        </div>
        <span aria-hidden="true" style={{ color: "#8A8A86", transition: "transform .2s", transform: open ? "rotate(90deg)" : "rotate(0deg)", display: "flex" }}>
          <Icon name="arr" size={18} />
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #EFEBE2" }}>
          {added.length > 0 && (
            <ReleaseSection eyebrow="— ADICIONADO" items={added} color="#3D7A4A" bg="#DDEADE" />
          )}
          {changed.length > 0 && (
            <ReleaseSection eyebrow="— ALTERADO" items={changed} color="#C97A1F" bg="#F5E5CD" />
          )}
          {removed.length > 0 && (
            <ReleaseSection eyebrow="— REMOVIDO" items={removed} color="#B83A3A" bg="#F4E0E0" />
          )}
        </div>
      )}
    </Card>
  );
}

function ReleaseSection({ eyebrow, items, color, bg }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 99, background: bg, color, fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", marginBottom: 10 }}>
        {eyebrow}
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((line, i) => (
          <li key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "#3C3C3B", lineHeight: 1.55 }}>
            <span aria-hidden="true" style={{ color, marginTop: 4, flexShrink: 0 }}>•</span>
            <span style={{ flex: 1 }}>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
