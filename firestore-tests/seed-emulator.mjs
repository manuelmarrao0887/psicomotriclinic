// Popula o emulador (Auth + Firestore) com 3 utilizadores e dados de exemplo,
// para desenvolver/testar a app contra o emulador (VITE_USE_EMULATOR=1).
//
//   # 1) emulador a correr (firebase emulators:start --only firestore,auth)
//   # 2) node seed-emulator.mjs
//   # 3) app: VITE_USE_EMULATOR=1 npm run dev  →  entrar com um dos emails abaixo
//
// Contas (password: test123):
//   dir@test.pt   (director)     prof@test.pt (professional)   pai@test.pt (parent)
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

initializeApp({ projectId: "psicomotriclinic-app" });
const auth = getAuth();
const db = getFirestore();

const uid = "dir-uid", parentUid = "parent-uid", profUid = "prof-uid";
const users = [
  { uid, email: "dir@test.pt", full_name: "Rita Palma", role: "director" },
  { uid: parentUid, email: "pai@test.pt", full_name: "Ana Silva", role: "parent" },
  { uid: profUid, email: "prof@test.pt", full_name: "Inês Mota", role: "professional" },
];
for (const u of users) {
  try { await auth.createUser({ uid: u.uid, email: u.email, password: "test123" }); }
  catch (e) { if (!/already/i.test(String(e))) throw e; }
  await db.doc(`profiles/${u.uid}`).set({ id: u.uid, email: u.email, full_name: u.full_name, role: u.role, active: true, created_at: new Date().toISOString() });
}

const owners = { parent_user_ids: [uid, parentUid], professional_ids: ["prof-ines"] };
await db.doc("professionals/prof-ines").set({ name: "Inês Mota", role_title: "Psicomotricista", avatar_initials: "IM", avatar_color: "#8DBF94", profile_id: profUid, active: true });
await db.doc("patients/pt-bea").set({ name: "Beatriz Sá", age: 6, professional_id: "prof-ines", professional_ids: ["prof-ines"], parent_user_ids: [uid, parentUid], session_type: "individual", day_of_week: "Segunda", hour: "15:00", periodicity: "Semanal", active: true });
await db.doc("patients/pt-tom").set({ name: "Tomás Reis", age: 8, professional_id: "prof-ines", professional_ids: ["prof-ines"], parent_user_ids: [uid, parentUid], session_type: "grupo", day_of_week: "Quarta", hour: "10:00", periodicity: "Semanal", active: true });
await db.doc("payments/pay1").set({ patient_id: "pt-bea", ...owners, month: "Julho 2026", amount: 160, status: "pago", paid_date: "2026-07-05", created_at: "2026-07-05T10:00:00.000Z" });
await db.doc("payments/pay2").set({ patient_id: "pt-tom", ...owners, month: "Julho 2026", amount: 120, status: "pendente", created_at: "2026-07-06T10:00:00.000Z" });
await db.doc("overheads/main").set({ rent: 1200, garage_spots: 2, garage_per_spot: 50 });
await db.doc("session_notes/sn1").set({ patient_id: "pt-bea", ...owners, date: "2026-07-13", status: "realizada", progress: "Boa evolução na coordenação motora e no esquema corporal." });
await db.doc("intervention_plans/pt-bea").set({ patient_id: "pt-bea", ...owners, area: "Coordenação motora", objectives: [{ text: "Melhorar coordenação bilateral", domain: "Motor", status: "ativo", progress: 40 }], updated_at: new Date().toISOString() });
await db.doc("announcements/ann1").set({ title: "Bem-vindos ao portal", body: "Novidades da Casa.", audience: "all", author_name: "Direção", active: true, created_at: new Date().toISOString() });

console.log("seed ok: dir@test.pt / pai@test.pt / prof@test.pt (password: test123)");
process.exit(0);
