import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { sb, ADMIN_EMAIL, fcmOnForegroundMessage } from "./lib/firebase.js";
import { Mark } from "./lib/icons.jsx";
import { StoreProvider, useStore } from "./lib/store.jsx";
import { Toast } from "./lib/ui.jsx";
import ModalsHost from "./components/ModalsHost.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import PushPermissionBanner from "./components/PushPermissionBanner.jsx";
import RoleSwitcher from "./components/RoleSwitcher.jsx";
import { applyRoleOverride, getRoleOverride } from "./lib/roleOverride.js";

// Páginas críticas (shell + login + dashboard) carregadas eagerly
import Login from "./pages/Login.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";

// Wrapper para React.lazy com auto-recovery de chunks órfãos.
//
// Cenário: utilizador tem o index.html antigo carregado e há deploy novo.
// O JS antigo tenta importar "/assets/Page-OLDHASH.js" — Vercel devolve
// 404 (ficheiro do build anterior, já removido). A SPA quebrava.
//
// Fix: na primeira falha de fetch de chunk, gravamos uma flag em
// sessionStorage e forçamos location.reload(). O reload puxa o index.html
// novo, que aponta para os hashes novos — utilizador nunca vê o erro.
// Se mesmo após reload o erro persistir (problema real, não staleness),
// deixamos o erro propagar para a ErrorBoundary.
const RELOAD_FLAG = "psm.chunk.reloaded";
function lazyWithRetry(importFn) {
  return lazy(() => importFn().catch((err) => {
    const msg = String(err?.message || err || "");
    const isChunkError = /dynamically imported module|Failed to fetch|Loading chunk|Loading CSS chunk|ChunkLoadError/i.test(msg);
    if (isChunkError && typeof window !== "undefined") {
      try {
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          window.location.reload();
          return new Promise(() => {}); // suspende para sempre — página vai recarregar
        }
      } catch (_) {}
    }
    throw err;
  }));
}

// Lazy: tudo o resto. Cada route só baixa o bundle quando o utilizador a
// abre — reduz o initial load drasticamente e responde ao aviso >500KB.
const Users = lazyWithRetry(() => import("./pages/admin/Users.jsx"));
const UserDetail = lazyWithRetry(() => import("./pages/admin/Users.jsx").then((m) => ({ default: m.UserDetail })));
const Team = lazyWithRetry(() => import("./pages/admin/Team.jsx"));
const ProfDetail = lazyWithRetry(() => import("./pages/admin/Team.jsx").then((m) => ({ default: m.ProfDetail })));
const Patients = lazyWithRetry(() => import("./pages/admin/Patients.jsx"));
const PatientDetail = lazyWithRetry(() => import("./pages/admin/Patients.jsx").then((m) => ({ default: m.PatientDetail })));
const Agenda = lazyWithRetry(() => import("./pages/admin/Agenda.jsx"));
const Finance = lazyWithRetry(() => import("./pages/admin/Finance.jsx"));
const Requests = lazyWithRetry(() => import("./pages/admin/Requests.jsx"));
const Settings = lazyWithRetry(() => import("./pages/admin/Settings.jsx"));
const AuditPage = lazyWithRetry(() => import("./pages/admin/AuditPage.jsx"));
const Announcements = lazyWithRetry(() => import("./pages/admin/Announcements.jsx"));
const Waitlist = lazyWithRetry(() => import("./pages/admin/Waitlist.jsx"));
const HomePracticeLibrary = lazyWithRetry(() => import("./pages/admin/HomePracticeLibrary.jsx"));
const Privacy = lazyWithRetry(() => import("./pages/Privacy.jsx"));
const ParentPortal = lazyWithRetry(() => import("./pages/portals/ParentPortal.jsx"));
const ProfessionalPortal = lazyWithRetry(() => import("./pages/portals/ProfessionalPortal.jsx"));
const ConfirmSession = lazyWithRetry(() => import("./pages/ConfirmSession.jsx"));
const StyleLab = lazyWithRetry(() => import("./pages/StyleLab.jsx"));

// Após render bem-sucedido das rotas, limpa a flag de reload
// (assim, próxima vez que houver chunk error, a recuperação pode disparar).
if (typeof window !== "undefined") {
  // delay para garantir que ao menos um chunk dinâmico carregou com sucesso
  setTimeout(() => { try { sessionStorage.removeItem(RELOAD_FLAG); } catch (_) {} }, 5000);
}

const themeKey = "psm.theme";

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(themeKey) || "light");
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem(themeKey, theme);
  }, [theme]);
  return [theme, setTheme];
}

function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (user) => {
    if (!user) return null;
    const meta = user.user_metadata || {};
    const fallbackRole =
      meta.role === "pending_director" ? "director" :
      meta.role || (user.email === ADMIN_EMAIL ? "director" : "parent");
    const fallback = { id: user.id, email: user.email, full_name: meta.full_name || (user.email?.split("@")[0]) || "Utilizador", role: fallbackRole };
    try {
      const res = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (res?.data) return res.data;
      const up = await sb.from("profiles").upsert(fallback).select().maybeSingle();
      return up?.data || fallback;
    } catch (_) {
      return fallback;
    }
  };

  const applyProfile = async (user) => {
    const p = await loadProfile(user);
    if (p && p.active === false) {
      await sb.auth.signOut();
      setProfile(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.replace("/login?disabled=1");
      }
      return;
    }
    setProfile(p);
  };

  useEffect(() => {
    const safety = setTimeout(() => setLoading(false), 4000);
    sb.auth.getSession().then(async ({ data: { session } }) => {
      try { if (session?.user) await applyProfile(session.user); }
      catch (e) { console.error(e); }
      clearTimeout(safety); setLoading(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (ev, session) => {
      if (ev === "SIGNED_IN" && session?.user) { await applyProfile(session.user); setLoading(false); }
      else if (ev === "SIGNED_OUT") setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => { await sb.auth.signOut(); setProfile(null); };
  return { profile, loading, logout };
}

function VisitLogger({ profile }) {
  const logged = useRef(false);
  useEffect(() => {
    try {
      if (profile?.id && !logged.current) {
        logged.current = true;
        Promise.resolve(
          sb.from("visits").insert({
            profile_id: profile.id,
            name: profile.full_name || "",
            role: profile.role || "",
            ts: new Date().toISOString(),
          })
        ).catch(() => {});
      }
    } catch (_) {}
  }, [profile]);
  return null;
}

function ToastHost() {
  const { toast } = useStore();
  if (!toast) return null;
  return <Toast msg={toast.m} type={toast.t} />;
}

// Recebe mensagens em foreground (app aberta) e mostra como toast,
// e escuta postMessage do SW para navegar quando o utilizador toca numa
// notificação enquanto a app já está aberta.
function PushListener() {
  const { show } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    let off = () => {};
    fcmOnForegroundMessage((payload) => {
      const title = payload?.data?.title || payload?.notification?.title || "Nova notificação";
      const body = payload?.data?.body || payload?.notification?.body || "";
      show(`${title}${body ? ` — ${body}` : ""}`, "info");
    }).then((u) => { off = u || (() => {}); });
    return () => off();
  }, [show]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.serviceWorker) return;
    const handler = (e) => {
      if (e.data?.type === "navigate" && typeof e.data.url === "string") {
        navigate(e.data.url);
      }
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [navigate]);
  return null;
}

function PageLoader() {
  return (
    <div style={{ minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#8A8A86" }}>
        <Mark size={36} />
        <div className="mono" style={{ marginTop: 12, fontSize: 11 }}>— A CARREGAR</div>
      </div>
    </div>
  );
}

export default function App() {
  const { profile, loading, logout } = useProfile();
  const [theme, setTheme] = useTheme();
  const location = useLocation();

  // Role override state — hooks têm de ser chamados antes de qualquer early return
  const [override, setOverride] = useState(() => getRoleOverride());
  useEffect(() => {
    const h = () => setOverride(getRoleOverride());
    window.addEventListener("psm-role-override", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("psm-role-override", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  const effectiveProfile = useMemo(
    () => applyRoleOverride(profile, ADMIN_EMAIL),
    [profile, override]
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#152741", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#F7F4EE" }}>
          <Mark size={56} />
          <div className="mono" style={{ color: "rgba(247,244,238,.5)", marginTop: 16 }}>— A CARREGAR</div>
        </div>
      </div>
    );
  }

  // Rotas públicas (não autenticado)
  if (!profile) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/login" replace state={{ from: location }} />} />
        </Routes>
      </Suspense>
    );
  }

  const isAdmin = effectiveProfile.role === "director" || (effectiveProfile.email === ADMIN_EMAIL && !effectiveProfile._overridden);
  const isProfessional = effectiveProfile.role === "professional";
  const isParent = effectiveProfile.role === "parent";

  return (
    <StoreProvider profile={effectiveProfile}>
      <VisitLogger profile={profile} />
      <PushListener />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          {isAdmin ? (
            <Routes>
              <Route path="/confirmar/:patientId/:date" element={<ConfirmSession />} />
              <Route path="/style-lab" element={<StyleLab />} />
              <Route path="/" element={<AdminLayout profile={effectiveProfile} onLogout={logout} theme={theme} setTheme={setTheme} />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="utilizadores" element={<Users />} />
                <Route path="utilizadores/:uid" element={<UserDetail />} />
                <Route path="equipa" element={<Team />} />
                <Route path="equipa/:profId" element={<ProfDetail />} />
                <Route path="pacientes" element={<Patients />} />
                <Route path="pacientes/:patientId" element={<PatientDetail />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="financeiro" element={<Finance />} />
                <Route path="pedidos" element={<Requests />} />
                <Route path="definicoes" element={<Settings theme={theme} setTheme={setTheme} />} />
                <Route path="auditoria" element={<AuditPage />} />
                <Route path="comunicacoes" element={<Announcements />} />
                <Route path="lista-espera" element={<Waitlist />} />
                <Route path="exercicios" element={<HomePracticeLibrary />} />
                <Route path="privacidade" element={<Privacy />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          ) : isProfessional ? (
            <Routes>
              <Route path="/confirmar/:patientId/:date" element={<ConfirmSession />} />
              <Route path="/style-lab" element={<StyleLab />} />
              <Route path="*" element={<ProfessionalPortal profile={effectiveProfile} onLogout={logout} theme={theme} setTheme={setTheme} />} />
            </Routes>
          ) : isParent ? (
            <Routes>
              <Route path="/confirmar/:patientId/:date" element={<ConfirmSession />} />
              <Route path="/style-lab" element={<StyleLab />} />
              <Route path="*" element={<ParentPortal profile={effectiveProfile} onLogout={logout} theme={theme} setTheme={setTheme} />} />
            </Routes>
          ) : (
            <div style={{ padding: 40, textAlign: "center" }}>
              <Mark size={48} />
              <h1 style={{ marginTop: 16, fontSize: 22, color: "#152741" }}>Papel não definido</h1>
              <p style={{ color: "#8A8A86", marginTop: 8 }}>Contacte a direção para activar o seu acesso.</p>
              <button onClick={logout} style={{ marginTop: 18, padding: "10px 18px", background: "#152741", color: "#F7F4EE", borderRadius: 10 }}>Terminar sessão</button>
            </div>
          )}
        </Suspense>
      </ErrorBoundary>
      <ModalsHost />
      <ToastHost />
      <RoleSwitcher profile={profile} />
      <PushPermissionBanner />
    </StoreProvider>
  );
}
