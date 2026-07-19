import { describe, it, expect } from "vitest";
import { normalizeInsurance, INSURANCES } from "./constants.js";

describe("normalizeInsurance", () => {
  it("aceita códigos exatos (case-insensitive)", () => {
    expect(normalizeInsurance("ADSE")).toBe("ADSE");
    expect(normalizeInsurance("adse")).toBe("ADSE");
    expect(normalizeInsurance("SAMS")).toBe("SAMS");
    expect(normalizeInsurance("adm")).toBe("ADM");
  });
  it("reconhece o nome longo de ADM e variantes com acentos", () => {
    expect(normalizeInsurance("Assistência de Doença Militares")).toBe("ADM");
    expect(normalizeInsurance("seguro militares")).toBe("ADM");
  });
  it("devolve null para desconhecidos/vazios", () => {
    expect(normalizeInsurance("")).toBeNull();
    expect(normalizeInsurance(null)).toBeNull();
    expect(normalizeInsurance("Multicare")).toBeNull();
  });
  it("todos os códigos oficiais normalizam para si próprios", () => {
    for (const code of INSURANCES) expect(normalizeInsurance(code)).toBe(code);
  });
});
