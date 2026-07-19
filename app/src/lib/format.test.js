import { describe, it, expect } from "vitest";
import { initials, professionalIds, currentMonthLabel, daysUntilBirthday, ageOnNext, practiceStreak } from "./format.js";

describe("initials", () => {
  it("usa as duas primeiras palavras", () => {
    expect(initials("Ana Ribeiro Silva")).toBe("AR");
  });
  it("nome único → uma inicial", () => {
    expect(initials("Beatriz")).toBe("B");
  });
  it("trata espaços extra e vazios", () => {
    expect(initials("  ana   maria ")).toBe("AM");
    expect(initials("")).toBe("");
    expect(initials(null)).toBe("");
    expect(initials(undefined)).toBe("");
  });
});

describe("professionalIds", () => {
  it("prefere o array professional_ids", () => {
    expect(professionalIds({ professional_ids: ["a", "b"], professional_id: "c" })).toEqual(["a", "b"]);
  });
  it("cai para professional_id legado", () => {
    expect(professionalIds({ professional_id: "c" })).toEqual(["c"]);
  });
  it("array vazio cai para legado", () => {
    expect(professionalIds({ professional_ids: [], professional_id: "c" })).toEqual(["c"]);
  });
  it("sem nada → array vazio", () => {
    expect(professionalIds({})).toEqual([]);
    expect(professionalIds(null)).toEqual([]);
  });
});

describe("currentMonthLabel", () => {
  it("capitaliza o mês em pt-PT", () => {
    const label = currentMonthLabel(new Date(2026, 6, 15)); // Julho 2026
    expect(label).toMatch(/^Julho 2026$/);
  });
  it("primeiro carácter é maiúsculo", () => {
    const label = currentMonthLabel(new Date(2026, 0, 1));
    expect(label[0]).toBe(label[0].toUpperCase());
  });
});

describe("daysUntilBirthday", () => {
  it("0 quando o aniversário é hoje", () => {
    const today = new Date(2026, 5, 10);
    expect(daysUntilBirthday("2020-06-10", today)).toBe(0);
  });
  it("conta para o ano seguinte se já passou", () => {
    const today = new Date(2026, 5, 11);
    expect(daysUntilBirthday("2020-06-10", today)).toBe(364);
  });
  it("null para data inválida/ausente", () => {
    expect(daysUntilBirthday("", new Date())).toBeNull();
    expect(daysUntilBirthday("lixo", new Date())).toBeNull();
  });
});

describe("practiceStreak", () => {
  const today = new Date(2026, 6, 10); // 2026-07-10 local
  it("conta dias consecutivos até hoje", () => {
    expect(practiceStreak(["2026-07-10", "2026-07-09", "2026-07-08"], today)).toBe(3);
  });
  it("pára no primeiro buraco", () => {
    expect(practiceStreak(["2026-07-10", "2026-07-08"], today)).toBe(1);
  });
  it("0 se hoje não tem registo", () => {
    expect(practiceStreak(["2026-07-09", "2026-07-08"], today)).toBe(0);
  });
  it("aceita Set e respeita o máximo", () => {
    const all = new Set();
    for (let d = 1; d <= 10; d++) all.add(`2026-07-${String(d).padStart(2, "0")}`);
    expect(practiceStreak(all, today, 5)).toBe(5);
  });
  it("vazio → 0", () => {
    expect(practiceStreak([], today)).toBe(0);
  });
});

describe("ageOnNext", () => {
  it("idade no próximo aniversário antes de fazer anos", () => {
    const today = new Date(2026, 0, 1); // antes de Junho
    expect(ageOnNext("2020-06-10", today)).toBe(6);
  });
  it("idade no próximo aniversário depois de fazer anos", () => {
    const today = new Date(2026, 11, 31); // depois de Junho
    expect(ageOnNext("2020-06-10", today)).toBe(7);
  });
});
