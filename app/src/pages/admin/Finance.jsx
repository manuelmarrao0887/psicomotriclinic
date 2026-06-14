import { useState } from "react";
import { useStore } from "../../lib/store.jsx";
import { Btn, Card, Eyebrow, Section, Stat, Sel, Tag, Av } from "../../lib/ui.jsx";
import { Icon } from "../../lib/icons.jsx";
import { CLINIC_CUT, MONTHS_2026 } from "../../lib/constants.js";

const hasProf = (pt, id) => pt.professional_id === id || (pt.professional_ids || []).includes(id);

export default function Finance() {
  const { pays, pts, profs, over, vcosts, togglePayment, setForm, setModal } = useStore();
  const [filterMonth, setFilterMonth] = useState("todos");

  const months = Array.from(new Set(pays.map((p) => p.month))).sort();
  const filtered = filterMonth === "todos" ? pays : pays.filter((p) => p.month === filterMonth);
  const tp = filtered.reduce((a, p) => a + Number(p.amount), 0);
  const pp = filtered.filter((p) => p.status === "pago").reduce((a, p) => a + Number(p.amount), 0);
  const pend = filtered.filter((p) => p.status === "pendente");
  const clinicCut = pp * CLINIC_CUT;
  const profCut = pp - clinicCut;

  const eur = (n) => Number(n || 0).toLocaleString("pt-PT", { maximumFractionDigits: 0 });
  const rent = Number(over.rent) || 0;
  const gar = (Number(over.garage_spots) || 0) * (Number(over.garage_per_spot) || 0);
  const sortedV = [...vcosts].sort((a, b) => MONTHS_2026.indexOf(b.month) - MONTHS_2026.indexOf(a.month));
  const refMonth = filterMonth !== "todos" ? filterMonth : sortedV[0]?.month || null;
  const vc = vcosts.find((v) => v.month === refMonth) || {};
  const varTot = (Number(vc.power) || 0) + (Number(vc.water) || 0) + (Number(vc.telecom) || 0);
  const custos = rent + varTot;
  const resEspaco = gar - custos;

  return (
    <div style={{ padding: "28px 40px 60px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <div style={{ minWidth: 200 }}>
          <Sel value={filterMonth} onChange={setFilterMonth} options={[{ v: "todos", l: "Todos os meses" }, ...months.map((m) => ({ v: m, l: m }))]} />
        </div>
        <Btn icon={<Icon name="plus" size={16} />} onClick={() => { setForm({}); setModal("addPayment"); }}>Registar</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 14 }}>
        <Stat label="TOTAL FATURADO" value={tp.toLocaleString("pt-PT")} suffix="€" accent="#152741" />
        <Stat label="RECEBIDO" value={pp.toLocaleString("pt-PT")} suffix="€" accent="#8DBF94" />
        <Stat label="PENDENTE" value={(tp - pp).toLocaleString("pt-PT")} suffix="€" accent="#E8A13C" />
      </div>

      {/* Custos & rendimentos */}
      <Card pad={22} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Eyebrow>— CUSTOS & RENDIMENTOS DO ESPAÇO</Eyebrow>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" variant="secondary" icon={<Icon name="edit" size={13} />}
              onClick={() => { setForm({ rent: over.rent, garageSpots: over.garage_spots ?? 3, garagePerSpot: over.garage_per_spot }); setModal("overheads"); }}>
              Renda & garagem
            </Btn>
            <Btn size="sm" variant="primary" icon={<Icon name="plus" size={13} />}
              onClick={() => { setForm({ vcMonth: filterMonth !== "todos" ? filterMonth : "" }); setModal("varCost"); }}>
              Registar custos do mês
            </Btn>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 16 }}>
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: "#8A8A86" }}>RENDA · FIXO/MÊS</div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: "#152741", marginTop: 4, letterSpacing: "-0.02em" }}>{eur(rent)}€</div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10.5, color: "#3D7A4A" }}>GARAGEM · {Number(over.garage_spots) || 0} lugares · FIXO/MÊS</div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 300, color: "#3D7A4A", marginTop: 4, letterSpacing: "-0.02em" }}>+{eur(gar)}€</div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #F5F2EC", paddingTop: 14 }}>
          <div className="mono" style={{ fontSize: 10.5, color: "#8A8A86", marginBottom: 8 }}>CUSTOS VARIÁVEIS POR MÊS · LUZ · ÁGUA · TELECOM.</div>
          {sortedV.length === 0 ? (
            <div style={{ fontSize: 13, color: "#8A8A86" }}>Ainda sem custos registados. Use "Registar custos do mês".</div>
          ) : (
            <div>
              <div className="mono" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", fontSize: 10.5, color: "#8A8A86", padding: "2px 0" }}>
                <span>MÊS</span><span>LUZ</span><span>ÁGUA</span><span>TELECOM.</span><span>TOTAL</span>
              </div>
              {sortedV.map((v) => {
                const t = (Number(v.power) || 0) + (Number(v.water) || 0) + (Number(v.telecom) || 0);
                return (
                  <div key={v.id || v.month} style={{
                    display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
                    fontSize: 13.5, padding: "7px 0", borderTop: "1px solid #F2EEE5", alignItems: "center",
                    background: v.month === refMonth ? "#FBFAF7" : "transparent",
                  }}>
                    <span style={{ color: "#152741", fontWeight: 500 }}>{v.month}</span>
                    <span style={{ color: "#5A5A58" }}>{eur(v.power)}€</span>
                    <span style={{ color: "#5A5A58" }}>{eur(v.water)}€</span>
                    <span style={{ color: "#5A5A58" }}>{eur(v.telecom)}€</span>
                    <span style={{ color: "#152741", fontWeight: 500 }}>{eur(t)}€</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {refMonth && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F5F2EC", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: "#B83A3A" }}>CUSTOS · {refMonth}</div>
              <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: "#B83A3A", marginTop: 4, letterSpacing: "-0.02em" }}>−{eur(custos)}€</div>
              <div style={{ fontSize: 11, color: "#8A8A86", marginTop: 2 }}>renda {eur(rent)}€ + variáveis {eur(varTot)}€</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 10.5, color: "#3D7A4A" }}>RENDIMENTO GARAGEM</div>
              <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: "#3D7A4A", marginTop: 4, letterSpacing: "-0.02em" }}>+{eur(gar)}€</div>
            </div>
            <div style={{ paddingLeft: 18, borderLeft: "1px solid #F5F2EC" }}>
              <div className="mono" style={{ fontSize: 10.5, color: "#8A8A86" }}>RESULTADO DO ESPAÇO</div>
              <div className="serif" style={{ fontSize: 24, fontWeight: 300, color: resEspaco >= 0 ? "#3D7A4A" : "#B83A3A", marginTop: 4, letterSpacing: "-0.02em" }}>
                {resEspaco >= 0 ? "+" : "−"}{eur(Math.abs(resEspaco))}€
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* P&L mensal — receitas - custos = resultado líquido por mês */}
      {(() => {
        // Por mês: receita = sessões pagas + garagem fixa; custos = renda + variáveis do mês; comissão = 80% das sessões pagas para profissionais.
        const allMonths = Array.from(new Set([
          ...pays.map((p) => p.month),
          ...vcosts.map((v) => v.month),
        ])).sort((a, b) => MONTHS_2026.indexOf(b) - MONTHS_2026.indexOf(a)).slice(0, 12);
        if (allMonths.length === 0) return null;
        return (
          <Card pad={22} style={{ marginBottom: 24 }}>
            <Eyebrow>— RESULTADO DA CLÍNICA · MÊS A MÊS</Eyebrow>
            <p style={{ fontSize: 12, color: "#8A8A86", marginTop: 4, marginBottom: 14, lineHeight: 1.6 }}>
              Resultado líquido = clínica (sessões {Math.round(CLINIC_CUT * 100)}%) + garagem − renda − custos variáveis.
              Os {Math.round((1 - CLINIC_CUT) * 100)}% das sessões pagas vão para os profissionais (não contam para a clínica).
            </p>
            <div className="mono" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr", fontSize: 10.5, color: "#8A8A86", padding: "2px 0" }}>
              <span>MÊS</span>
              <span style={{ textAlign: "right" }}>SESSÕES PAGAS</span>
              <span style={{ textAlign: "right" }}>CLÍNICA {Math.round(CLINIC_CUT * 100)}%</span>
              <span style={{ textAlign: "right" }}>GARAGEM</span>
              <span style={{ textAlign: "right" }}>RENDA</span>
              <span style={{ textAlign: "right" }}>VAR.</span>
              <span style={{ textAlign: "right" }}>RESULTADO</span>
            </div>
            {allMonths.map((m) => {
              const monthPays = pays.filter((p) => p.month === m && p.status === "pago").reduce((a, p) => a + Number(p.amount), 0);
              const clinicShare = monthPays * CLINIC_CUT;
              const vc = vcosts.find((v) => v.month === m) || {};
              const varTot = (Number(vc.power) || 0) + (Number(vc.water) || 0) + (Number(vc.telecom) || 0);
              const garage = gar;
              const result = clinicShare + garage - rent - varTot;
              return (
                <div key={m} style={{
                  display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr",
                  fontSize: 13.5, padding: "8px 0", borderTop: "1px solid #F2EEE5", alignItems: "center",
                }}>
                  <span style={{ color: "#152741", fontWeight: 500 }}>{m}</span>
                  <span style={{ textAlign: "right", color: "#5A5A58" }}>{eur(monthPays)}€</span>
                  <span style={{ textAlign: "right", color: "#5A5A58" }}>{eur(clinicShare)}€</span>
                  <span style={{ textAlign: "right", color: "#3D7A4A" }}>+{eur(garage)}€</span>
                  <span style={{ textAlign: "right", color: "#B83A3A" }}>−{eur(rent)}€</span>
                  <span style={{ textAlign: "right", color: "#B83A3A" }}>−{eur(varTot)}€</span>
                  <span style={{ textAlign: "right", color: result >= 0 ? "#3D7A4A" : "#B83A3A", fontWeight: 600 }}>
                    {result >= 0 ? "+" : "−"}{eur(Math.abs(result))}€
                  </span>
                </div>
              );
            })}
          </Card>
        );
      })()}

      {/* Split */}
      <Card pad={22} style={{ marginBottom: 24 }}>
        <Eyebrow>— DISTRIBUIÇÃO DO RECEBIDO</Eyebrow>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "#8A8A86" }} className="mono">CLÍNICA · {Math.round(CLINIC_CUT * 100)}%</div>
            <div className="serif" style={{ fontSize: 30, fontWeight: 300, color: "#152741", marginTop: 4, letterSpacing: "-0.02em" }}>{clinicCut.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}€</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#8A8A86" }} className="mono">PROFISSIONAIS · {Math.round((1 - CLINIC_CUT) * 100)}%</div>
            <div className="serif" style={{ fontSize: 30, fontWeight: 300, color: "#152741", marginTop: 4, letterSpacing: "-0.02em" }}>{profCut.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}€</div>
          </div>
          <div style={{ paddingLeft: 18, borderLeft: "1px solid #F5F2EC" }}>
            <div style={{ fontSize: 11, color: "#8A8A86", marginBottom: 6 }} className="mono">NOTA</div>
            <div style={{ fontSize: 13, color: "#5A5A58", lineHeight: 1.5 }}>O profissional recebe o valor total dos responsáveis e transfere os {Math.round(CLINIC_CUT * 100)}% para a clínica.</div>
          </div>
        </div>
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #F5F2EC", display: "flex", flexDirection: "column", gap: 8 }}>
          {profs.map((pr) => {
            const ptIds = pts.filter((pt) => hasProf(pt, pr.id) && (pt.session_type === "individual")).map((p) => p.id);
            const recv = filtered.filter((p) => p.status === "pago" && ptIds.includes(p.patient_id)).reduce((a, p) => a + Number(p.amount), 0);
            const cc = recv * CLINIC_CUT;
            const pc = recv - cc;
            return (
              <div key={pr.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "6px 0", alignItems: "center", fontSize: 13.5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Av t={pr.avatar_initials} bg={pr.avatar_color} sz={28} />
                  <span style={{ color: "#152741" }}>{pr.name}</span>
                </div>
                <span style={{ color: "#5A5A58" }}>Recebido: <strong style={{ color: "#152741" }}>{recv}€</strong></span>
                <span style={{ color: "#5A5A58" }}>P/ clínica: <strong style={{ color: "#B83A3A" }}>{cc.toFixed(0)}€</strong></span>
                <span style={{ color: "#5A5A58" }}>P/ profissional: <strong style={{ color: "#3D7A4A" }}>{pc.toFixed(0)}€</strong></span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tabela pagamentos */}
      <Card pad={0}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1.2fr", padding: "14px 20px", background: "#F5F2EC", borderBottom: "1px solid #EAE6DD" }}>
          <Eyebrow>Paciente</Eyebrow><Eyebrow>Mês</Eyebrow><Eyebrow>Valor</Eyebrow><Eyebrow>Estado</Eyebrow><Eyebrow style={{ textAlign: "right" }}>Acções</Eyebrow>
        </div>
        {filtered.map((p, i) => {
          const pt = pts.find((x) => x.id === p.patient_id);
          return (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1.2fr",
              padding: "14px 20px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid #F5F2EC" : "none",
            }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#152741" }}>{pt?.name || "—"}</span>
              <span style={{ fontSize: 13.5, color: "#5A5A58" }}>{p.month}</span>
              <span className="serif" style={{ fontSize: 18, fontWeight: 300, color: "#152741", letterSpacing: "-0.02em" }}>{p.amount}€</span>
              <span>
                <button onClick={() => togglePayment(p)} className="ch" style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }} title="Clique para alternar estado">
                  <Tag type={p.status}>{p.status === "pago" ? "Pago" : "Pendente"}</Tag>
                </button>
              </span>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                {p.status === "pendente"
                  ? <Btn size="sm" variant="primary" icon={<Icon name="check" size={13} />} onClick={() => togglePayment(p)}>Marcar pago</Btn>
                  : <Btn size="sm" variant="secondary" onClick={() => togglePayment(p)}>Reverter</Btn>}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#8A8A86", fontSize: 14 }}>Sem pagamentos {filterMonth !== "todos" ? `em ${filterMonth}` : ""}.</div>}
      </Card>
    </div>
  );
}
