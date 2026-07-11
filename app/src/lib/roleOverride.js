// Override de papel para conta admin — permite testar Portal Responsável /
// Profissional sem criar contas separadas. Só a conta admin pode usar.
//
// Persiste em localStorage. Emite evento "psm-role-override" para o App
// re-renderizar sem reload.

const KEY = "psm.roleOverride";
export const ROLE_OPTIONS = [
  { value: "real",         label: "Papel real (Diretor)" },
  { value: "director",     label: "Diretor" },
  { value: "professional", label: "Profissional" },
  { value: "parent",       label: "Responsável" },
];

export function getRoleOverride() {
  try { return localStorage.getItem(KEY) || "real"; } catch (_) { return "real"; }
}

export function setRoleOverride(v) {
  try {
    if (!v || v === "real") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, v);
    window.dispatchEvent(new CustomEvent("psm-role-override"));
  } catch (_) {}
}

// Aplica override ao profile em runtime. Não persiste no Firestore.
// Retorna novo profile com role modificado, ou o original se sem override.
export function applyRoleOverride(profile, adminEmail) {
  if (!profile || profile.email !== adminEmail) return profile;
  const o = getRoleOverride();
  if (!o || o === "real") return profile;
  if (!["director", "professional", "parent"].includes(o)) return profile;
  return { ...profile, role: o, _overridden: true };
}
