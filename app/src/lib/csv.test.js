import { describe, it, expect } from "vitest";
import { escapeCsv, toCsv } from "./csv.js";

describe("escapeCsv", () => {
  it("valores simples ficam intactos", () => {
    expect(escapeCsv("Ana")).toBe("Ana");
    expect(escapeCsv(42)).toBe("42");
  });
  it("null/undefined → vazio", () => {
    expect(escapeCsv(null)).toBe("");
    expect(escapeCsv(undefined)).toBe("");
  });
  it("cita valores com vírgula, ponto-e-vírgula ou quebra de linha", () => {
    expect(escapeCsv("Silva, Ana")).toBe('"Silva, Ana"');
    expect(escapeCsv("a;b")).toBe('"a;b"');
    expect(escapeCsv("linha1\nlinha2")).toBe('"linha1\nlinha2"');
  });
  it("duplica aspas internas", () => {
    expect(escapeCsv('diz "olá"')).toBe('"diz ""olá"""');
  });
});

describe("toCsv", () => {
  const cols = [
    { label: "Nome", key: "name" },
    { label: "Total", get: (r) => r.a + r.b },
  ];
  it("gera cabeçalho + linhas com key e get()", () => {
    const csv = toCsv([{ name: "Ana", a: 1, b: 2 }], cols);
    expect(csv).toBe("Nome,Total\nAna,3");
  });
  it("escapa valores problemáticos nas células", () => {
    const csv = toCsv([{ name: "Silva, Ana", a: 0, b: 0 }], cols);
    expect(csv).toBe('Nome,Total\n"Silva, Ana",0');
  });
});
