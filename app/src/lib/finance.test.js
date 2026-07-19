import { describe, it, expect } from "vitest";
import {
  sumAmounts, sumPaid, sumPending, splitClinicProf,
  garageIncome, variableTotal, pnl, irsSummary, byMonth,
} from "./finance.js";

const pays = [
  { amount: 100, status: "pago", month: "Maio 2026" },
  { amount: 60, status: "pendente", month: "Maio 2026" },
  { amount: "40", status: "pago", month: "Junho 2026" }, // string amount
  { amount: null, status: "pago", month: "Junho 2026" }, // amount inválido
];

describe("somas", () => {
  it("sumAmounts ignora valores inválidos e aceita strings", () => {
    expect(sumAmounts(pays)).toBe(200);
    expect(sumAmounts([])).toBe(0);
  });
  it("sumPaid só conta status pago", () => {
    expect(sumPaid(pays)).toBe(140);
  });
  it("sumPending só conta pendentes", () => {
    expect(sumPending(pays)).toBe(60);
  });
});

describe("splitClinicProf", () => {
  it("divide 20/80 por defeito", () => {
    expect(splitClinicProf(100)).toEqual({ clinic: 20, professional: 80 });
  });
  it("aceita cut personalizado", () => {
    expect(splitClinicProf(200, 0.25)).toEqual({ clinic: 50, professional: 150 });
  });
  it("valor inválido → 0", () => {
    expect(splitClinicProf(null)).toEqual({ clinic: 0, professional: 0 });
  });
});

describe("custos e rendimentos", () => {
  it("garageIncome = lugares × preço", () => {
    expect(garageIncome({ garage_spots: 3, garage_per_spot: 50 })).toBe(150);
    expect(garageIncome({})).toBe(0);
  });
  it("variableTotal soma luz+água+telecom", () => {
    expect(variableTotal({ power: 80, water: 20, telecom: 30 })).toBe(130);
    expect(variableTotal({})).toBe(0);
  });
});

describe("pnl", () => {
  it("net = quota clínica + (garagem − renda − variáveis)", () => {
    const r = pnl({
      payments: pays,
      over: { rent: 1000, garage_spots: 4, garage_per_spot: 50 }, // garagem 200
      vc: { power: 100, water: 50, telecom: 50 }, // var 200
    });
    expect(r.paid).toBe(140);
    expect(r.clinicCut).toBeCloseTo(28); // 140 * .2
    expect(r.profCut).toBeCloseTo(112);
    expect(r.garage).toBe(200);
    expect(r.custos).toBe(1200); // renda 1000 + var 200
    expect(r.spaceResult).toBe(-1000); // 200 - 1200
    expect(r.net).toBeCloseTo(-972); // 28 + (-1000)
  });
  it("sem argumentos não rebenta", () => {
    const r = pnl();
    expect(r.net).toBe(0);
  });
});

describe("irsSummary", () => {
  it("líquido = bruto − comissão (20%)", () => {
    expect(irsSummary(1000)).toEqual({ bruto: 1000, comissao: 200, liquido: 800 });
  });
});

describe("byMonth", () => {
  it("agrega e ordena do mês mais recente para o mais antigo", () => {
    const rows = byMonth(pays);
    expect(rows.map((r) => r.month)).toEqual(["Junho 2026", "Maio 2026"]);
    const maio = rows.find((r) => r.month === "Maio 2026");
    expect(maio).toMatchObject({ total: 160, paid: 100, pending: 60, count: 2 });
    const junho = rows.find((r) => r.month === "Junho 2026");
    expect(junho).toMatchObject({ total: 40, paid: 40, pending: 0, count: 2 });
  });
});
