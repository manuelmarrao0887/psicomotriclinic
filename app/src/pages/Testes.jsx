import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, Mark } from "../lib/icons.jsx";
import { Eyebrow, Card, Btn, Tag } from "../lib/ui.jsx";
import { APP_VERSION } from "../lib/constants.js";

// Plano de testes — checklist estruturado para QA smoke por fluxo.
// Estado por teste em localStorage.psm.tests.<test_id> = "pass"|"fail"|"na".
// Notas por teste em localStorage.psm.tests.notes.<test_id>.

const STORAGE_KEY_STATE = "psm.tests.state";
const STORAGE_KEY_NOTES = "psm.tests.notes";

const GROUPS = [
  {
    id: "auth",
    title: "Autenticação e sessão",
    color: "#8DBF94",
    tests: [
      { id: "T1.1", title: "Login com email/password válidos",
        steps: ["Abrir /login", "Introduzir credenciais válidas", "Submeter"],
        expect: "Redirect para o dashboard do role. Sessão persiste no refresh." },
      { id: "T1.2", title: "Login com credenciais inválidas",
        steps: ["Abrir /login", "Introduzir password errada"],
        expect: "Mensagem de erro clara. Sem redirect." },
      { id: "T1.3", title: "Login com Google",
        steps: ["Abrir /login", "Clicar Continuar com Google", "Escolher conta autorizada"],
        expect: "Perfil criado no primeiro login com role parent por defeito (ou existente)." },
      { id: "T1.4", title: "Logout limpa sessão",
        steps: ["Estar autenticado", "Menu Conta → Terminar sessão"],
        expect: "Redirect /login. Refresh mantém em /login." },
    ],
  },
  {
    id: "director",
    title: "Diretor — gestão clínica",
    color: "#E8A13C",
    tests: [
      { id: "T2.1", title: "Dashboard carrega KPIs",
        steps: ["Login como director", "Aceder /dashboard"],
        expect: "Hero + Pulso semana + Stones + InsightsPanel + Aniversários visíveis. Sem erros no console." },
      { id: "T2.2", title: "Adicionar paciente novo",
        steps: ["/pacientes → Novo", "Preencher todos os campos obrigatórios", "Guardar"],
        expect: "Aparece na lista. Grelha e agenda atualizam. Audit log regista add_patient." },
      { id: "T2.3", title: "Editar paciente existente",
        steps: ["/pacientes → clicar paciente → Editar", "Alterar dia/hora", "Guardar"],
        expect: "Agenda reflete mudança imediatamente." },
      { id: "T2.4", title: "Aprovar pedido de troca",
        steps: ["/pedidos → pedido pendente", "Aprovar"],
        expect: "Estado = aprovado. Portal do responsável mostra novidade." },
      { id: "T2.5", title: "MEU CONSULTÓRIO aparece quando profile_id linked",
        steps: ["Ligar director user a professionals.profile_id", "Refresh sidebar"],
        expect: "Nova secção MEU CONSULTÓRIO com atalho Meu financeiro." },
      { id: "T2.6", title: "Publicar anúncio",
        steps: ["/comunicacoes → Novo", "Escolher audience Responsáveis", "Guardar"],
        expect: "Anúncio visível no topo do Portal Responsável dos utilizadores desse role." },
    ],
  },
  {
    id: "pro",
    title: "Profissional — pacientes e financeiro",
    color: "#B9CDE0",
    tests: [
      { id: "T3.1", title: "Home mostra sessões de hoje",
        steps: ["Login como profissional com pacientes no dia atual", "Portal → Início"],
        expect: "Card HOJE lista sessões ordenadas por hora." },
      { id: "T3.2", title: "Registar nota de sessão",
        steps: ["Início → botão Nota na sessão", "Preencher domínios + observações", "Guardar"],
        expect: "Nota fica em session_notes. Portal do responsável mostra na timeline." },
      { id: "T3.3", title: "Marcar falta rápida",
        steps: ["Início → sessão → botão Falta"],
        expect: "Status = falta. Contador de faltas atualiza no dashboard admin." },
      { id: "T3.4", title: "Financeiro tab abre com badge de pendentes",
        steps: ["Portal → tab Financeiro (badge âmbar se houver pendentes)"],
        expect: "KPIs Total/Recebido/Pendente + distribuição Casa/você." },
      { id: "T3.5", title: "Registar pagamento novo",
        steps: ["Financeiro → Novo registo", "Paciente + mês + valor + método", "Guardar"],
        expect: "Aparece na lista. professional_id gravado no doc." },
      { id: "T3.6", title: "Toggle pago ↔ pendente",
        steps: ["Financeiro → lista → clicar chip de estado"],
        expect: "Estado alterna. paid_date atualizado quando marca pago." },
      { id: "T3.7", title: "Vista Ano / IRS",
        steps: ["Financeiro → switcher Ano / IRS"],
        expect: "3 KPIs anuais + tabela mensal + card IRS resumo." },
      { id: "T3.8", title: "Exportar CSV mensal e anual",
        steps: ["Financeiro → botão Exportar CSV nas duas vistas"],
        expect: "Download de ficheiro. Colunas corretas. Excel pt-PT abre bem." },
      { id: "T3.9", title: "Recibo imprimível",
        steps: ["Financeiro → pagamento pago → ícone clipboard → Imprimir"],
        expect: "Preview de impressão mostra apenas o recibo (CSS @media print)." },
    ],
  },
  {
    id: "parent",
    title: "Responsável — filho e comunicação",
    color: "#F5D9A8",
    tests: [
      { id: "T4.1", title: "Card filho carrega",
        steps: ["Login parent com patient linked", "Portal → Início"],
        expect: "Card com profissional, dia/hora, plano, próxima sessão." },
      { id: "T4.2", title: "Timeline de evolução",
        steps: ["Portal → Início → card EvolutionTimeline por filho"],
        expect: "3 KPIs semestrais + últimas 6 notas com progress/work/next visíveis." },
      { id: "T4.3", title: "Glossário auto-highlight",
        steps: ["Timeline → hover num termo técnico com dotted underline âmbar"],
        expect: "Popover navy mostra definição em PT." },
      { id: "T4.4", title: "Registar diário comportamento",
        steps: ["Card filho → botão Diário", "Escolher humor + eventos", "Guardar"],
        expect: "Entrada aparece nas últimas 5. Doc em behavior_diary." },
      { id: "T4.5", title: "Chat com profissional",
        steps: ["Card filho → botão Falar", "Escrever mensagem", "Enviar"],
        expect: "Mensagem em parent_messages. Portal Pro mostra card amarelo." },
      { id: "T4.6", title: "Pedir troca de horário",
        steps: ["Tab Pedidos → Novo", "Escolher filho + novo dia/hora", "Enviar"],
        expect: "Pedido em reqs com status pendente. Sidebar admin mostra badge." },
      { id: "T4.7", title: "Marcar exercício casa concluído",
        steps: ["Tab Casa → exercício atribuído → checkbox"],
        expect: "Doc em home_practice_completions. Pro vê no histórico." },
    ],
  },
  {
    id: "ui",
    title: "UI e responsividade",
    color: "#DCE7F0",
    tests: [
      { id: "T5.1", title: "ViewToggle alterna mobile/desktop",
        steps: ["Chip navy br → escolher Desktop em ecrã mobile"],
        expect: "Layout muda para sidebar sem reload. Persiste em localStorage." },
      { id: "T5.2", title: "Dark mode alterna",
        steps: ["Conta → toggle Modo escuro / claro"],
        expect: "html ganha .dark. Backgrounds e cores invertem. Persiste no refresh." },
      { id: "T5.3", title: "Print manual/recibo",
        steps: ["Manual → botão imprimir topo direito"],
        expect: "Preview mostra secção ativa. Sem sidebar/topbar." },
      { id: "T5.4", title: "PWA install",
        steps: ["Chrome → menu → Instalar como app"],
        expect: "Ícone no home screen. App abre standalone." },
      { id: "T5.5", title: "Notificações push (FCM)",
        steps: ["Conta → toggle notificações", "Autorizar no browser", "Trigger evento"],
        expect: "Notificação aparece com título + corpo." },
    ],
  },
  {
    id: "data",
    title: "Dados e segurança",
    color: "#B83A3A",
    tests: [
      { id: "T6.1", title: "Reset+seed demo",
        steps: ["Admin director → botão de reset+seed"],
        expect: "1 director + 1 pro + 1 parent + 1 patient linkados. Sem dados antigos." },
      { id: "T6.2", title: "Firestore rules bloqueiam cross-role reads",
        steps: ["Parent user tenta ler patient de outro parent via console/DevTools"],
        expect: "Permission denied." },
      { id: "T6.3", title: "Audit log regista mutações",
        steps: ["Fazer add_patient / toggle_payment / delete_payment"],
        expect: "Docs em audit collection com who_id / who_role / action / details." },
      { id: "T6.4", title: "Firestore listeners cache reduz leituras",
        steps: ["Segunda abertura da app numa sessão"],
        expect: "Dados aparecem instantaneamente (cache). Sem novas subscribes/reads no dashboard Firebase." },
      { id: "T6.5", title: "RoleSwitcher só admin",
        steps: ["Login com manuelsousamarrao@ → ver chip top-right"],
        expect: "Chip visível. Outro utilizador não vê chip mesmo em impersonation." },
    ],
  },
];

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_STATE) || "{}"); } catch { return {}; }
}
function loadNotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_NOTES) || "{}"); } catch { return {}; }
}

export default function Testes() {
  const nav = useNavigate();
  const [state, setState] = useState(loadState);
  const [notes, setNotes] = useState(loadNotes);
  const [filter, setFilter] = useState("all"); // all | untested | pass | fail | na
  const [openId, setOpenId] = useState(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state)); }, [state]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes)); }, [notes]);

  const setResult = (id, v) => setState((s) => ({ ...s, [id]: s[id] === v ? undefined : v }));
  const setNote = (id, v) => setNotes((n) => ({ ...n, [id]: v }));

  const counts = useMemo(() => {
    const flat = GROUPS.flatMap((g) => g.tests);
    return {
      total: flat.length,
      pass: flat.filter((t) => state[t.id] === "pass").length,
      fail: flat.filter((t) => state[t.id] === "fail").length,
      na: flat.filter((t) => state[t.id] === "na").length,
      untested: flat.filter((t) => !state[t.id]).length,
    };
  }, [state]);
  const passRate = Math.round(((counts.pass) / Math.max(1, counts.pass + counts.fail)) * 100);

  const showTest = (t) => {
    if (filter === "all") return true;
    if (filter === "untested") return !state[t.id];
    return state[t.id] === filter;
  };

  const resetAll = () => {
    if (!confirm("Repor todos os testes para não-testado?")) return;
    setState({});
    setNotes({});
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F9FB" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        paddingTop: "var(--safe-top)",
        background: "rgba(255,255,255,.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "1px solid rgba(234,230,221,.6)",
      }}>
        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", maxWidth: 1100, margin: "0 auto" }}>
          <button onClick={() => nav(-1)} className="ch tap-target" aria-label="Voltar" style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", color: "#152741", padding: "6px 8px", borderRadius: 8 }}>
            <Icon name="back" size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Voltar</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mark size={26} />
            <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", color: "#152741" }}>PSICOMOTRI<span style={{ fontWeight: 400 }}>CLINIC</span></span>
          </div>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px 20px" }}>
        <Eyebrow>— PLANO DE TESTES · {APP_VERSION}</Eyebrow>
        <h1 className="serif" style={{ fontSize: 40, fontWeight: 300, color: "#152741", letterSpacing: "-0.025em", lineHeight: 1.05, marginTop: 10 }}>
          Checklist de QA<span className="serif-it">.</span>
        </h1>
        <p style={{ fontSize: 15, color: "#5A5A58", marginTop: 8, maxWidth: 640, lineHeight: 1.55 }}>
          Passa em cada teste antes de promover para produção. Estado guardado localmente (localStorage). Corre em <b>{counts.total}</b> testes distribuídos por <b>{GROUPS.length}</b> secções.
        </p>
      </div>

      {/* KPIs */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <Card pad={14}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86" }}>TOTAL</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{counts.total}</div>
        </Card>
        <Card pad={14}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", fontWeight: 700, color: "#3D7A4A" }}>PASSA</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{counts.pass}</div>
        </Card>
        <Card pad={14}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", fontWeight: 700, color: "#B83A3A" }}>FALHA</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{counts.fail}</div>
        </Card>
        <Card pad={14}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", fontWeight: 700, color: "#8A8A86" }}>N/A</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{counts.na}</div>
        </Card>
        <Card pad={14}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", fontWeight: 700, color: "#E8A13C" }}>POR TESTAR</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: "#152741", marginTop: 4 }}>{counts.untested}</div>
        </Card>
        <Card pad={14}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", fontWeight: 700, color: "#152741" }}>TAXA</div>
          <div className="serif" style={{ fontSize: 26, fontWeight: 300, color: passRate >= 90 ? "#3D7A4A" : passRate >= 70 ? "#E8A13C" : "#B83A3A", marginTop: 4 }}>{isNaN(passRate) ? "—" : `${passRate}%`}</div>
        </Card>
      </div>

      {/* Filtro + reset */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, padding: 4, background: "#F5F2EC", borderRadius: 999 }}>
          {[
            { v: "all", l: "Todos" },
            { v: "untested", l: "Por testar" },
            { v: "pass", l: "Passa" },
            { v: "fail", l: "Falha" },
            { v: "na", l: "N/A" },
          ].map((x) => (
            <button key={x.v} onClick={() => setFilter(x.v)} className="ch" style={{
              padding: "6px 12px", borderRadius: 999,
              background: filter === x.v ? "#152741" : "transparent",
              color: filter === x.v ? "#F7F4EE" : "#5A5A58",
              fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
            }}>{x.l}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Btn variant="secondary" size="sm" onClick={resetAll}>Repor estado</Btn>
      </div>

      {/* Grupos */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
        {GROUPS.map((g) => {
          const visibleTests = g.tests.filter(showTest);
          if (visibleTests.length === 0) return null;
          const gPass = g.tests.filter((t) => state[t.id] === "pass").length;
          const gFail = g.tests.filter((t) => state[t.id] === "fail").length;
          return (
            <div key={g.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, paddingLeft: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: g.color }} />
                <Eyebrow>— {g.title.toUpperCase()}</Eyebrow>
                <span className="mono" style={{ fontSize: 10, color: "#8A8A86" }}>{gPass}✓ · {gFail}✗ · {g.tests.length - gPass - gFail} —</span>
              </div>
              <Card pad={0}>
                {visibleTests.map((t, i) => {
                  const st = state[t.id];
                  const open = openId === t.id;
                  return (
                    <div key={t.id} style={{ borderTop: i > 0 ? "1px solid #F5F2EC" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
                        <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".08em", fontWeight: 700, color: "#8A8A86", minWidth: 40 }}>{t.id}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <button onClick={() => setOpenId(open ? null : t.id)} className="ch" style={{
                            background: "transparent", border: "none", padding: 0, textAlign: "left",
                            fontFamily: "inherit", color: "#152741", fontSize: 14.5, fontWeight: 500,
                            cursor: "pointer",
                          }}>
                            {t.title}
                            <span className="mono" style={{ marginLeft: 8, fontSize: 10, color: "#8A8A86", fontWeight: 400 }}>{open ? "− ocultar" : "+ ver passos"}</span>
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[
                            { v: "pass", bg: "#8DBF94", c: "#FFFFFF", label: "Passa" },
                            { v: "fail", bg: "#B83A3A", c: "#FFFFFF", label: "Falha" },
                            { v: "na",   bg: "#D9D3C5", c: "#3C3C3B", label: "N/A" },
                          ].map((btn) => (
                            <button key={btn.v} onClick={() => setResult(t.id, btn.v)} className="ch" style={{
                              padding: "5px 10px", borderRadius: 999,
                              background: st === btn.v ? btn.bg : "#FFFFFF",
                              color: st === btn.v ? btn.c : "#5A5A58",
                              border: `1px solid ${st === btn.v ? btn.bg : "#EAE6DD"}`,
                              fontSize: 11, fontWeight: 600, cursor: "pointer",
                            }}>{btn.label}</button>
                          ))}
                        </div>
                      </div>
                      {open && (
                        <div style={{ padding: "0 18px 16px 60px", fontSize: 13, color: "#3C3C3B", lineHeight: 1.55 }}>
                          <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", fontWeight: 700, color: "#8A8A86", marginTop: 4, marginBottom: 6 }}>PASSOS</div>
                          <ol style={{ margin: 0, paddingLeft: 20 }}>
                            {t.steps.map((s, si) => <li key={si} style={{ marginBottom: 3 }}>{s}</li>)}
                          </ol>
                          <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", fontWeight: 700, color: "#8A8A86", marginTop: 10, marginBottom: 4 }}>RESULTADO ESPERADO</div>
                          <div style={{ padding: 10, background: "#F5F2EC", borderRadius: 8 }}>{t.expect}</div>
                          <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", fontWeight: 700, color: "#8A8A86", marginTop: 10, marginBottom: 4 }}>NOTA</div>
                          <textarea value={notes[t.id] || ""} onChange={(e) => setNote(t.id, e.target.value)} placeholder="Observações desta iteração (opcional)…" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #EAE6DD", fontSize: 13, fontFamily: "inherit", background: "#FFFFFF", minHeight: 60, resize: "vertical" }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
