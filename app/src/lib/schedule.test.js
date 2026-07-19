import { describe, it, expect } from "vitest";
import { loadByDay, usedHours, gapsByDay, totalGaps, occupancyPct } from "./schedule.js";

const DAYS = ["Segunda", "Terça", "Quarta"];
const pts = [
  { day_of_week: "Segunda", hour: "09:00" },
  { day_of_week: "Segunda", hour: "10:00" },
  { day_of_week: "Terça", hour: "09:00" },
  { day_of_week: "Quarta", hour: null }, // hora inválida ignorada nas horas-em-uso
];

describe("loadByDay", () => {
  it("conta pacientes por dia", () => {
    expect(loadByDay(pts, DAYS)).toEqual([2, 1, 1]);
  });
});

describe("usedHours", () => {
  it("horas distintas e ordenadas, ignora vazias", () => {
    expect(usedHours(pts)).toEqual(["09:00", "10:00"]);
  });
});

describe("gapsByDay / totalGaps", () => {
  it("vaga = hora-em-uso não ocupada nesse dia", () => {
    // horas em uso: 09:00, 10:00
    // Segunda ocupa ambas → 0 vagas; Terça só 09:00 → 1 vaga (10:00);
    // Quarta nenhuma hora válida → 2 vagas
    expect(gapsByDay(pts, DAYS)).toEqual([0, 1, 2]);
    expect(totalGaps(pts, DAYS)).toBe(3);
  });
});

describe("occupancyPct", () => {
  it("ocupação = slots ocupados / capacidade", () => {
    // capacidade = 3 dias × 2 horas = 6; vagas = 3 → ocupados 3 → 50%
    expect(occupancyPct(pts, DAYS)).toBe(50);
  });
  it("sem horas em uso → 0%", () => {
    expect(occupancyPct([], DAYS)).toBe(0);
  });
});
