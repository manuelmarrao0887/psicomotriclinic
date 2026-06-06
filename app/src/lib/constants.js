export const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
export const HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
];
export const AVATAR_BG = ["#DCE7F0", "#C7DDCB", "#F5D9A8", "#EFEBE2", "#B9CDE0", "#8DBF94", "#F5E5CD"];
export const MES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
export const MONTHS_2026 = MES_PT.map((m) => `${m} 2026`);
export const RL = { director: "Diretor", professional: "Profissional", parent: "Responsável", admin: "Admin" };
export const INSURANCES = ["ADSE", "SAMS", "ADM"];
export const INSURANCE_LABEL = {
  ADSE: "ADSE",
  SAMS: "SAMS",
  ADM: "Assistência de Doença Militares (ADM)",
};
// Normaliza: aceita variantes (acentos, caixa, nome longo) e devolve o código curto.
export function normalizeInsurance(s) {
  if (!s) return null;
  const v = s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  if (v === "adse") return "ADSE";
  if (v === "sams") return "SAMS";
  if (v === "adm" || v.startsWith("assistencia de doenca militares") || v.includes("militares")) return "ADM";
  return null;
}
export const CLINIC_CUT = 0.2;
export const APP_VERSION = "v2.0.0-alpha.10";

// Data/hora da última build — injectada pelo Vite em build (vite.config.js)
// Em dev é o instante em que o servidor arrancou.
// eslint-disable-next-line no-undef
const _BUILD_ISO = typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : new Date().toISOString();
export const BUILD_DATE = _BUILD_ISO;
export function formatBuildDate(iso = _BUILD_ISO) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
