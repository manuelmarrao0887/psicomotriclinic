// Lógica financeira pura (sem React/Firestore) — extraída de Finance.jsx e
// ProFinance para poder ser testada (ver finance.test.js). Money math sem testes
// = bugs latentes; estas funções são a fonte única de verdade dos cálculos.
import { CLINIC_CUT, MONTHS_2026 } from "./constants.js";

const num = (v) => Number(v) || 0;

export const sumAmounts = (payments = []) =>
  payments.reduce((s, p) => s + num(p.amount), 0);

export const sumPaid = (payments = []) =>
  payments.filter((p) => p.status === "pago").reduce((s, p) => s + num(p.amount), 0);

export const sumPending = (payments = []) =>
  payments.filter((p) => p.status === "pendente").reduce((s, p) => s + num(p.amount), 0);

// Divisão clínica/profissional sobre um valor pago.
export function splitClinicProf(paidAmount, cut = CLINIC_CUT) {
  const clinic = num(paidAmount) * cut;
  return { clinic, professional: num(paidAmount) - clinic };
}

// Rendimento da garagem (lugares × preço por lugar).
export const garageIncome = (over = {}) =>
  num(over.garage_spots) * num(over.garage_per_spot);

// Custos variáveis do mês (luz + água + telecom).
export const variableTotal = (vc = {}) =>
  num(vc.power) + num(vc.water) + num(vc.telecom);

// P&L consolidado de um conjunto de pagamentos + custos.
// net = quota da clínica + (garagem − renda − custos variáveis).
export function pnl({ payments = [], over = {}, vc = {}, cut = CLINIC_CUT } = {}) {
  const total = sumAmounts(payments);
  const paid = sumPaid(payments);
  const pending = sumPending(payments);
  const { clinic: clinicCut, professional: profCut } = splitClinicProf(paid, cut);
  const garage = garageIncome(over);
  const rent = num(over.rent);
  const varTot = variableTotal(vc);
  const custos = rent + varTot;
  const spaceResult = garage - custos;
  return { total, paid, pending, clinicCut, profCut, garage, rent, varTot, custos, spaceResult, net: clinicCut + spaceResult };
}

// Resumo de IRS do profissional: bruto recebido, comissão paga à Casa, líquido.
export function irsSummary(paidTotal, cut = CLINIC_CUT) {
  const bruto = num(paidTotal);
  const comissao = bruto * cut;
  return { bruto, comissao, liquido: bruto - comissao };
}

// Agregação por mês, ordenada pelo calendário (MONTHS_2026), mais recente 1º.
export function byMonth(payments = []) {
  const map = new Map();
  for (const p of payments) {
    const m = p.month || "—";
    if (!map.has(m)) map.set(m, { month: m, total: 0, paid: 0, pending: 0, count: 0 });
    const row = map.get(m);
    row.total += num(p.amount);
    row.count += 1;
    if (p.status === "pago") row.paid += num(p.amount);
    if (p.status === "pendente") row.pending += num(p.amount);
  }
  return [...map.values()].sort((a, b) => MONTHS_2026.indexOf(b.month) - MONTHS_2026.indexOf(a.month));
}
