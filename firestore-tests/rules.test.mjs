// Testes das regras Firestore contra o emulador. Verifica as garantias de
// segurança da Fase 0 da auditoria (RGPD): papel imutável, leitura por dono,
// confidencialidade financeira, validação de create, coleções restritas.
//
// Correr: ver README.md (precisa do emulador Firestore a correr, ou usar
// `npm test` que invoca `firebase emulators:exec`).
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES_PATH = process.env.RULES_PATH || resolve(__dirname, "..", "firestore.rules");
const PORT = Number(process.env.FIRESTORE_EMULATOR_PORT || 8080);
const rules = readFileSync(RULES_PATH, "utf8");

const env = await initializeTestEnvironment({
  projectId: "psicomotriclinic-app",
  firestore: { rules, host: "127.0.0.1", port: PORT },
});
await env.clearFirestore();

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, "profiles/parentA"), { role: "parent", email: "a@x.pt" });
  await setDoc(doc(db, "profiles/parentB"), { role: "parent", email: "b@x.pt" });
  await setDoc(doc(db, "profiles/prof1"), { role: "professional", email: "p@x.pt" });
  await setDoc(doc(db, "profiles/dir1"), { role: "director", email: "d@x.pt" });
  await setDoc(doc(db, "patients/pt1"), { name: "Kid", parent_user_ids: ["parentA"], professional_ids: ["prof1"], active: true });
  await setDoc(doc(db, "session_notes/sn1"), { patient_id: "pt1", parent_user_ids: ["parentA"], professional_ids: ["prof1"], status: "realizada" });
  await setDoc(doc(db, "payments/pay1"), { patient_id: "pt1", parent_user_ids: ["parentA"], amount: 100 });
  await setDoc(doc(db, "overheads/main"), { rent: 1000 });
  await setDoc(doc(db, "waitlist/w1"), { name: "Lead" });
  await setDoc(doc(db, "audit_log/a1"), { action: "x" });
});

const parentA = env.authenticatedContext("parentA", { email: "a@x.pt" }).firestore();
const parentB = env.authenticatedContext("parentB", { email: "b@x.pt" }).firestore();
const prof = env.authenticatedContext("prof1", { email: "p@x.pt" }).firestore();
const dir = env.authenticatedContext("dir1", { email: "d@x.pt" }).firestore();
const evil = env.authenticatedContext("evilUid", { email: "evil@x.pt" }).firestore();
const admin = env.authenticatedContext("adminUid", { email: "manuelsousamarrao@gmail.com" }).firestore();

let pass = 0, fail = 0;
async function check(name, promise) {
  try { await promise; console.log("  ✓", name); pass++; }
  catch (e) { console.log("  ✗", name, "—", e.message); fail++; }
}

console.log("PRIVILEGIOS / ROLE");
await check("parent NAO escala o proprio role para director", assertFails(updateDoc(doc(parentA, "profiles/parentA"), { role: "director" })));
await check("auto-registo como director e NEGADO", assertFails(setDoc(doc(evil, "profiles/evilUid"), { role: "director", email: "evil@x.pt" })));
await check("auto-registo como parent e PERMITIDO", assertSucceeds(setDoc(doc(evil, "profiles/evilUid"), { role: "parent", email: "evil@x.pt" })));
await check("bootstrap admin PODE criar-se director", assertSucceeds(setDoc(doc(admin, "profiles/adminUid"), { role: "director", email: "manuelsousamarrao@gmail.com" })));

console.log("LEITURA CLINICA POR DONO");
await check("parent dono LE o seu paciente", assertSucceeds(getDoc(doc(parentA, "patients/pt1"))));
await check("outro parent NAO le o paciente alheio", assertFails(getDoc(doc(parentB, "patients/pt1"))));
await check("parent dono LE a sua nota de sessao", assertSucceeds(getDoc(doc(parentA, "session_notes/sn1"))));
await check("outro parent NAO le a nota alheia", assertFails(getDoc(doc(parentB, "session_notes/sn1"))));
await check("profissional (staff) LE o paciente", assertSucceeds(getDoc(doc(prof, "patients/pt1"))));

console.log("FINANCEIRO");
await check("parent dono LE o seu pagamento", assertSucceeds(getDoc(doc(parentA, "payments/pay1"))));
await check("outro parent NAO le pagamento alheio", assertFails(getDoc(doc(parentB, "payments/pay1"))));
await check("parent NAO le o livro de custos (overheads)", assertFails(getDoc(doc(parentA, "overheads/main"))));
await check("staff LE overheads", assertSucceeds(getDoc(doc(prof, "overheads/main"))));

console.log("VALIDACAO DE CREATE");
await check("parent dono cria nota de CANCELAMENTO", assertSucceeds(setDoc(doc(parentA, "session_notes/sn_cancel"), { patient_id: "pt1", cancelled_by_user: true, status: "cancelado", parent_user_ids: ["parentA"] })));
await check("parent NAO cria nota normal", assertFails(setDoc(doc(parentA, "session_notes/sn_bad"), { patient_id: "pt1", status: "realizada", parent_user_ids: ["parentA"] })));
await check("nao-dono NAO cria nota de cancelamento", assertFails(setDoc(doc(parentB, "session_notes/sn_evil"), { patient_id: "pt1", cancelled_by_user: true, status: "cancelado", parent_user_ids: ["parentB"] })));
await check("schedule_request exige requested_by_id == uid", assertSucceeds(setDoc(doc(parentA, "schedule_requests/r1"), { requested_by_id: "parentA", patient_id: "pt1" })));
await check("schedule_request com id de outro e NEGADO", assertFails(setDoc(doc(parentA, "schedule_requests/r2"), { requested_by_id: "parentB", patient_id: "pt1" })));

console.log("COLECCOES RESTRITAS");
await check("parent NAO le waitlist", assertFails(getDoc(doc(parentA, "waitlist/w1"))));
await check("staff LE waitlist", assertSucceeds(getDoc(doc(prof, "waitlist/w1"))));
await check("parent NAO le audit_log", assertFails(getDoc(doc(parentA, "audit_log/a1"))));
await check("director LE audit_log", assertSucceeds(getDoc(doc(dir, "audit_log/a1"))));

await env.cleanup();
console.log(`\nRESULTADO: ${pass} passaram, ${fail} falharam`);
process.exit(fail === 0 ? 0 : 1);
