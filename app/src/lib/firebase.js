// Firebase + adaptador `sb` (mesma API do projeto legacy para facilitar migração).
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updatePassword as fbUpdatePassword,
  updateProfile,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { getMessaging, getToken, onMessage, isSupported as messagingIsSupported, deleteToken } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyBGQGSSGthbIMUxHDefwWlarNR7c_Vjd3E",
  authDomain: "psicomotriclinic-app.firebaseapp.com",
  projectId: "psicomotriclinic-app",
  storageBucket: "psicomotriclinic-app.firebasestorage.app",
  messagingSenderId: "114979101363",
  appId: "1:114979101363:web:7e66962c231e12a66c2ec6",
};

export const ADMIN_EMAIL = "manuelsousamarrao@gmail.com";

const app = initializeApp(firebaseConfig);
const _auth = getAuth(app);
const _db = getFirestore(app);

const _toEmail = (v) =>
  (v || "").includes("@") ? (v || "").trim() : `${(v || "").trim().toLowerCase()}@psicomotriclinic.local`;
const _wrapUser = (u) =>
  u ? { id: u.uid, email: u.email, user_metadata: { full_name: u.displayName || undefined } } : null;
const _session = (u) => (u ? { user: _wrapUser(u) } : null);

const _authReady = new Promise((res) => {
  const off = onAuthStateChanged(_auth, (u) => {
    off();
    res(u);
  });
});

class _Q {
  constructor(coll) {
    this.c = coll;
    this.w = [];
    this.o = null;
    this.l = null;
    this.s = false;
    this.op = "select";
    this.p = null;
    this.idEq = undefined;
  }
  select() { return this; }
  insert(p) { this.op = "insert"; this.p = p; return this; }
  update(p) { this.op = "update"; this.p = p; return this; }
  upsert(p) { this.op = "upsert"; this.p = p; return this; }
  delete() { this.op = "delete"; return this; }
  eq(col, val) { if (col === "id") this.idEq = val; this.w.push([col, val]); return this; }
  order(col, opt) { this.o = [col, opt && opt.ascending === false ? -1 : 1]; return this; }
  limit(n) { this.l = n; return this; }
  maybeSingle() { this.s = true; return this; }
  single() { this.s = true; return this; }
  then(res, rej) { return this._run().then(res, rej); }
  catch(rej) { return this._run().then(undefined, rej); }
  finally(fn) { return this._run().finally(fn); }
  _match(r) { return this.w.every(([c, v]) => r[c] === v); }
  async _run() {
    try {
      const col = collection(_db, this.c);
      if (this.op === "insert") {
        const body = { created_at: new Date().toISOString(), ...this.p };
        delete body.id;
        const ref = await addDoc(col, body);
        const s = await getDoc(ref);
        return { data: { id: ref.id, ...s.data() }, error: null };
      }
      if (this.op === "upsert") {
        if (this.p.id) {
          const id = this.p.id;
          await setDoc(doc(_db, this.c, id), { created_at: new Date().toISOString(), ...this.p }, { merge: true });
          const s = await getDoc(doc(_db, this.c, id));
          const row = { id, ...s.data() };
          return { data: this.s ? row : [row], error: null };
        }
        const ref = await addDoc(col, { created_at: new Date().toISOString(), ...this.p });
        const s = await getDoc(ref);
        const row = { id: ref.id, ...s.data() };
        return { data: this.s ? row : [row], error: null };
      }
      if (this.op === "update") {
        if (this.idEq !== undefined) {
          await updateDoc(doc(_db, this.c, this.idEq), this.p);
          return { data: null, error: null };
        }
        const snap = await getDocs(col);
        const ds = snap.docs.filter((d) => this._match({ id: d.id, ...d.data() }));
        await Promise.all(ds.map((d) => updateDoc(d.ref, this.p)));
        return { data: null, error: null };
      }
      if (this.op === "delete") {
        if (this.idEq !== undefined) {
          await deleteDoc(doc(_db, this.c, this.idEq));
          return { data: null, error: null };
        }
        const snap = await getDocs(col);
        const ds = snap.docs.filter((d) => this._match({ id: d.id, ...d.data() }));
        await Promise.all(ds.map((d) => deleteDoc(d.ref)));
        return { data: null, error: null };
      }
      // select
      if (this.s && this.idEq !== undefined) {
        const s = await getDoc(doc(_db, this.c, this.idEq));
        return { data: s.exists() ? { id: s.id, ...s.data() } : null, error: null };
      }
      const snap = await getDocs(col);
      let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => this._match(r));
      if (this.o) {
        const [k, dir] = this.o;
        rows.sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir);
      }
      if (this.l != null) rows = rows.slice(0, this.l);
      return { data: this.s ? rows[0] || null : rows, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message, code: e.code } };
    }
  }
}

export const sb = {
  from: (t) => new _Q(t),
  auth: {
    signInWithPassword: async ({ email, password }) => {
      try {
        await signInWithEmailAndPassword(_auth, _toEmail(email), password);
        return { error: null };
      } catch (e) {
        return { error: { message: e.message, code: e.code } };
      }
    },
    signUp: async ({ email, password, options }) => {
      try {
        const meta = (options && options.data) || {};
        email = _toEmail(email);
        const cred = await createUserWithEmailAndPassword(_auth, email, password);
        if (meta.full_name) {
          try { await updateProfile(cred.user, { displayName: meta.full_name }); } catch (_) {}
        }
        const role = meta.role === "pending_director" ? "director" : meta.role || "parent";
        await setDoc(
          doc(_db, "profiles", cred.user.uid),
          {
            id: cred.user.uid,
            email,
            full_name: meta.full_name || email.split("@")[0],
            role,
            created_at: new Date().toISOString(),
          },
          { merge: true }
        );
        return { data: { user: _wrapUser(cred.user), session: _session(cred.user) }, error: null };
      } catch (e) {
        return { data: { user: null, session: null }, error: { message: e.message, code: e.code } };
      }
    },
    signInWithOAuth: async ({ provider }) => {
      try {
        if (provider === "google") await signInWithPopup(_auth, new GoogleAuthProvider());
        return { error: null };
      } catch (e) {
        return { error: { message: e.message, code: e.code } };
      }
    },
    getSession: async () => {
      const u = await _authReady;
      return { data: { session: _session(u || _auth.currentUser) }, error: null };
    },
    onAuthStateChange: (cb) => {
      const off = onAuthStateChanged(_auth, (u) => cb(u ? "SIGNED_IN" : "SIGNED_OUT", _session(u)));
      return { data: { subscription: { unsubscribe: off } } };
    },
    signOut: async () => {
      try { await fbSignOut(_auth); return { error: null }; }
      catch (e) { return { error: { message: e.message } }; }
    },
    updatePassword: async (newPw) => {
      try {
        if (!_auth.currentUser) return { error: { message: "Sessão não encontrada" } };
        await fbUpdatePassword(_auth.currentUser, newPw);
        return { error: null };
      } catch (e) {
        return { error: { message: e.message, code: e.code } };
      }
    },
  },
};

// ───── FCM (Push Notifications) ────────────────────────────────────────
// VAPID public key — gerada em Firebase Console → Project Settings → Cloud
// Messaging → Web Push certificates. Configurar como VITE_FCM_VAPID_KEY em
// Vercel (Environment Variables) e em .env.local para dev.
export const FCM_VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || "";

let _messaging = null;
let _messagingInitTried = false;

async function _initMessaging() {
  if (_messagingInitTried) return _messaging;
  _messagingInitTried = true;
  try {
    const supported = await messagingIsSupported();
    if (!supported) return null;
    _messaging = getMessaging(app);
    return _messaging;
  } catch (_) { return null; }
}

// Resultado: { token } ou { error: { code, message } }.
// Códigos possíveis: "unsupported", "no-vapid", "permission-denied",
// "permission-default", "sw-not-ready", "token-fail".
export async function fcmRequestPermissionAndToken() {
  if (!FCM_VAPID_KEY) return { error: { code: "no-vapid", message: "Servidor não configurado para push (VAPID em falta)." } };
  const messaging = await _initMessaging();
  if (!messaging) return { error: { code: "unsupported", message: "Este browser não suporta notificações." } };

  if (typeof Notification === "undefined") return { error: { code: "unsupported", message: "Notificações não disponíveis." } };
  let perm = Notification.permission;
  if (perm === "default") perm = await Notification.requestPermission();
  if (perm !== "granted") return { error: { code: "permission-" + perm, message: "Permissão negada." } };

  // Garante que o nosso sw.js está activo antes de pedir token.
  let swReg;
  try {
    swReg = await navigator.serviceWorker.ready;
  } catch (_) {
    return { error: { code: "sw-not-ready", message: "Service worker indisponível." } };
  }

  try {
    const token = await getToken(messaging, { vapidKey: FCM_VAPID_KEY, serviceWorkerRegistration: swReg });
    if (!token) return { error: { code: "token-fail", message: "Não foi possível obter token." } };
    return { token };
  } catch (e) {
    return { error: { code: "token-fail", message: e?.message || "Falha ao obter token." } };
  }
}

// Apaga o token actual deste device (usado em disablePush).
export async function fcmDeleteToken() {
  const messaging = await _initMessaging();
  if (!messaging) return { ok: false };
  try { await deleteToken(messaging); return { ok: true }; }
  catch (_) { return { ok: false }; }
}

// Subscreve mensagens em foreground (app aberta) — chamada uma vez na App.
export async function fcmOnForegroundMessage(cb) {
  const messaging = await _initMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, cb);
}

// Guarda/remove o token no profile do utilizador (array — multi-device).
export async function fcmSaveTokenToProfile(uid, token) {
  if (!uid || !token) return;
  try {
    await updateDoc(doc(_db, "profiles", uid), {
      fcm_tokens: arrayUnion(token),
      push_enabled_at: new Date().toISOString(),
    });
  } catch (e) {
    // perfil pode não existir como doc concreto; cria
    try {
      await setDoc(doc(_db, "profiles", uid), {
        fcm_tokens: [token],
        push_enabled_at: new Date().toISOString(),
      }, { merge: true });
    } catch (_) {}
  }
}

export async function fcmRemoveTokenFromProfile(uid, token) {
  if (!uid || !token) return;
  try {
    await updateDoc(doc(_db, "profiles", uid), {
      fcm_tokens: arrayRemove(token),
    });
  } catch (_) {}
}

// Estado actual sem pedir permissão (para UI saber se já está activo).
export function fcmCurrentPermission() {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}
