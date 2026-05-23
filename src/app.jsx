/* ═══ App root ═══ */
const SB_URL = 'https://biowckwcgvgjccnqelmn.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpb3dja3djZ3ZnamNjbnFlbG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyODE3NTAsImV4cCI6MjA5MDg1Nzc1MH0.rqji9jY4bMWQjBcR_NbDehI2MexhlL9jRuIUZNA6GKA';
const ADMIN_EMAIL = 'manuelsousamarrao@gmail.com';
const sb = window.supabase.createClient(SB_URL, SB_KEY);

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async (user) => {
    if (!user) return null;
    try {
      const { data } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) return data;
      const meta = user.user_metadata || {};
      const np = { id:user.id, email:user.email, full_name:meta.full_name||user.email?.split('@')[0]||'Utilizador', role:meta.role||'parent' };
      const { data:c } = await sb.from('profiles').upsert(np).select().maybeSingle();
      return c || np;
    } catch(e) {
      console.error(e);
      const meta = user.user_metadata || {};
      return { id:user.id, email:user.email, full_name:meta.full_name||'Utilizador', role:meta.role||'parent' };
    }
  };

  useEffect(() => {
    sb.auth.getSession().then(async ({data:{session}}) => {
      try { if (session?.user) setProfile(await getProfile(session.user)); } catch(e) { console.error(e); }
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data:{subscription} } = sb.auth.onAuthStateChange(async (ev, session) => {
      try {
        if (ev === 'SIGNED_IN' && session?.user) { setProfile(await getProfile(session.user)); setLoading(false); }
        else if (ev === 'SIGNED_OUT') setProfile(null);
      } catch(e) { console.error(e); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => { await sb.auth.signOut(); setProfile(null); };

  if (loading) return (
    <div style={{minHeight:"100vh", background:"#152741", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{textAlign:"center", color:"#F7F4EE"}}>
        <Mark size={56}/>
        <div className="mono" style={{color:"rgba(247,244,238,.5)", marginTop:16}}>— A CARREGAR</div>
      </div>
    </div>
  );

  if (!profile) return <Login sb={sb} ADMIN_EMAIL={ADMIN_EMAIL}/>;

  if (profile.role === "pending_director") return (
    <div style={{minHeight:"100vh", background:"#F7F4EE", display:"flex", alignItems:"center", justifyContent:"center", padding:40}}>
      <Card pad={48} style={{textAlign:"center", maxWidth:480}}>
        <div style={{width:64, height:64, borderRadius:32, background:"#F5E5CD", color:"#C97A1F", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:18}}>
          <Icon name="mail" size={26}/>
        </div>
        <Eyebrow>— EM ESPERA</Eyebrow>
        <h2 className="serif" style={{fontSize:30, fontWeight:300, color:"#152741", margin:"8px 0 12px", letterSpacing:"-0.02em"}}>Aprovação pendente<span className="serif-it">.</span></h2>
        <p style={{fontSize:14.5, color:"#8A8A86", marginBottom:24, lineHeight:1.6}}>O administrador irá analisar o seu pedido em breve.</p>
        <Btn variant="secondary" onClick={logout}>Terminar sessão</Btn>
      </Card>
    </div>
  );

  if (profile.role === "director" || profile.email === ADMIN_EMAIL)
    return <AdminPortal profile={profile} onLogout={logout} sb={sb} ADMIN_EMAIL={ADMIN_EMAIL}/>;

  return <SimplePortal role={profile.role} profile={profile} onLogout={logout}/>;
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
