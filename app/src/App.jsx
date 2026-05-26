import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { sb, ADMIN_EMAIL } from "./lib/firebase.js";
import { Mark } from "./lib/icons.jsx";
import { StoreProvider, useStore } from "./lib/store.jsx";
import { Toast } from "./lib/ui.jsx";
import ModalsHost from "./components/ModalsHost.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Login from "./pages/Login.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Users, { UserDetail } from "./pages/admin/Users.jsx";
import Team, { ProfDetail } from "./pages/admin/Team.jsx";
import Patients, { PatientDetail } from "./pages/admin/Patients.jsx";
import Agenda from "./pages/admin/Agenda.jsx";
import Finance from "./pages/admin/Finance.jsx";
import Requests from "./pages/admin/Requests.jsx";
import Settings from "./pages/admin/Settings.jsx";
import AuditPage from "./pages/admin/AuditPage.jsx";
import Announcements from "./pages/admin/Announcements.jsx";
import Privacy from "./pages/Privacy.jsx";
import ParentPortal from "./pages/portals/ParentPortal.jsx";
import ProfessionalPortal from "./pages/portals/ProfessionalPortal.jsx";

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

export default function App() {
  const { profile, loading, logout } = useProfile();
  const [theme, setTheme] = useTheme();
  const location = useLocation();

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
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="*" element={<Navigate to="/login" replace state={{ from: location }} />} />
      </Routes>
    );
  }

  const isAdmin = profile.role === "director" || profile.email === ADMIN_EMAIL;
  const isProfessional = profile.role === "professional";
  const isParent = profile.role === "parent";

  // Rotas privadas — store + modals + toast à raiz para todos os portais.
  return (
    <StoreProvider profile={profile}>
      <VisitLogger profile={profile} />
      <ErrorBoundary>
        {isAdmin ? (
          <Routes>
            <Route path="/" element={<AdminLayout profile={profile} onLogout={logout} theme={theme} setTheme={setTheme} />}>
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
              <Route path="privacidade" element={<Privacy />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        ) : isProfessional ? (
          <ProfessionalPortal profile={profile} onLogout={logout} theme={theme} setTheme={setTheme} />
        ) : isParent ? (
          <ParentPortal profile={profile} onLogout={logout} theme={theme} setTheme={setTheme} />
        ) : (
          // Papel não reconhecido — fallback
          <div style={{ padding: 40, textAlign: "center" }}>
            <Mark size={48} />
            <h1 style={{ marginTop: 16, fontSize: 22, color: "#152741" }}>Papel não definido</h1>
            <p style={{ color: "#8A8A86", marginTop: 8 }}>Contacte a direção para activar o seu acesso.</p>
            <button onClick={logout} style={{ marginTop: 18, padding: "10px 18px", background: "#152741", color: "#F7F4EE", borderRadius: 10 }}>Terminar sessão</button>
          </div>
        )}
      </ErrorBoundary>
      <ModalsHost />
      <ToastHost />
    </StoreProvider>
  );
}
