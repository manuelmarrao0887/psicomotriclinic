/* ═══ Admin portal — desktop layout ═══ */
const DAYS = ["Segunda","Terça","Quarta","Quinta","Sexta"];
const HOURS = ["09:00","10:00","11:00","14:00","15:00","16:00","17:00"];
const AREAS = ["Regulação emocional","Regulação tónica","Organização espacial","Coordenação motora","Lateralidade","Esquema corporal","Relaxação","Motricidade fina","Dinâmica relacional","Cooperação corporal","Atenção e concentração","Grafomotricidade"];
const AVATAR_BG = ["#DCE7F0","#C7DDCB","#F5D9A8","#EFEBE2","#B9CDE0","#8DBF94","#F5E5CD"];
const RL = {director:"Diretora",professional:"Profissional",parent:"Pai/Mãe",pending_director:"Pendente",admin:"Admin"};

const Sidebar = ({active, onChange, profile, onLogout, badges}) => {
  const items = [
    {id:"dashboard", label:"Dashboard", icon:"home"},
    {id:"users", label:"Utilizadores", icon:"shield", badge:badges.users},
    {id:"team", label:"Equipa", icon:"users"},
    {id:"patients", label:"Pacientes", icon:"clipboard"},
    {id:"agenda", label:"Agenda", icon:"calendar"},
    {id:"finance", label:"Financeiro", icon:"wallet"},
    {id:"requests", label:"Pedidos de troca", icon:"swap", badge:badges.requests},
    {id:"settings", label:"Definições", icon:"cog"},
  ];

  return (
    <aside style={{
      width:260, background:"#152741", color:"#F7F4EE",
      display:"flex", flexDirection:"column",
      padding:"22px 16px 18px",
      borderRight:"1px solid rgba(247,244,238,.06)",
      position:"sticky", top:0, height:"100vh", overflowY:"auto"
    }}>
      <div style={{padding:"4px 8px 22px", borderBottom:"1px solid rgba(247,244,238,.08)", marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <Mark size={36}/>
          <div style={{display:"flex",flexDirection:"column",lineHeight:1}}>
            <span style={{fontFamily:"DM Sans",fontWeight:700,fontSize:15.5,letterSpacing:"-0.01em"}}>PSICOMOTRI<span style={{fontWeight:400}}>CLINIC</span></span>
            <span className="mono" style={{color:"rgba(247,244,238,.45)",fontSize:9,marginTop:4}}>HUB · ADMIN</span>
          </div>
        </div>
      </div>

      <div style={{padding:"0 6px 8px"}}><Eyebrow color="rgba(247,244,238,.4)">— NAVEGAÇÃO</Eyebrow></div>
      <nav style={{display:"flex",flexDirection:"column",gap:2,flex:1}}>
        {items.map(it => {
          const isActive = active === it.id;
          return (
            <button key={it.id} onClick={()=>onChange(it.id)} className="ch" style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"10px 12px", borderRadius:9,
              background:isActive?"rgba(247,244,238,.08)":"transparent",
              color:isActive?"#F7F4EE":"rgba(247,244,238,.65)",
              fontSize:14, fontWeight:isActive?500:400,
              textAlign:"left", border:"none", cursor:"pointer",
              position:"relative"
            }}
            onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="rgba(247,244,238,.04)";}}
            onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}
            >
              {isActive && <span style={{position:"absolute",left:-16,top:8,bottom:8,width:3,background:"#E8A13C",borderRadius:"0 3px 3px 0"}}/>}
              <span style={{display:"flex",color:isActive?"#E8A13C":"rgba(247,244,238,.5)"}}><Icon name={it.icon} size={18}/></span>
              <span style={{flex:1}}>{it.label}</span>
              {it.badge>0 && <span style={{background:"#E8A13C",color:"#152741",fontSize:11,fontWeight:600,minWidth:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px"}}>{it.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{padding:"14px 12px", borderTop:"1px solid rgba(247,244,238,.08)", marginTop:14, display:"flex",alignItems:"center",gap:12}}>
        <Av t={profile?.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2)||"A"} bg="#E8A13C" sz={36} color="#152741"/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13.5, fontWeight:500, color:"#F7F4EE", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{profile?.full_name||"Admin"}</div>
          <div style={{fontSize:11.5, color:"rgba(247,244,238,.5)"}}>{profile?.role==="director"?"Diretora":"Admin"}</div>
        </div>
        <button onClick={onLogout} className="ch" style={{padding:7, borderRadius:8, color:"rgba(247,244,238,.55)", display:"flex"}}
          onMouseEnter={e=>e.currentTarget.style.color="#F7F4EE"} onMouseLeave={e=>e.currentTarget.style.color="rgba(247,244,238,.55)"}
          title="Terminar sessão"><Icon name="logout" size={18}/></button>
      </div>
    </aside>
  );
};

const Topbar = ({title, eyebrow, sub, right}) => (
  <div style={{
    padding:"32px 40px 24px",
    borderBottom:"1px solid #E5E0D4",
    background:"#F7F4EE",
    display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24
  }}>
    <div>
      {eyebrow && <div style={{marginBottom:8}}><Eyebrow>{eyebrow}</Eyebrow></div>}
      <h1 className="serif" style={{fontSize:36, fontWeight:300, color:"#152741", letterSpacing:"-0.025em", lineHeight:1.05}}>{title}</h1>
      {sub && <p style={{fontSize:14.5, color:"#8A8A86", marginTop:6}}>{sub}</p>}
    </div>
    {right && <div style={{display:"flex",gap:10}}>{right}</div>}
  </div>
);

const AdminPortal = ({ profile, onLogout, sb, ADMIN_EMAIL }) => {
  const [tab, setTab] = useState("dashboard");
  const [sub, setSub] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [users, setUsers] = useState([]);
  const [profs, setProfs] = useState([]);
  const [pts, setPts] = useState([]);
  const [sess, setSess] = useState([]);
  const [pays, setPays] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [selUser, setSelUser] = useState(null);
  const [selProf, setSelProf] = useState(null);
  const [search, setSearch] = useState("");
  const [inviteResult, setInviteResult] = useState(null);

  const show = (m, t="success") => { setToast({m,t}); setTimeout(()=>setToast(null),3000); };
  const copyText = (t) => { navigator.clipboard?.writeText(t).then(()=>show("Copiado para a área de transferência")).catch(()=>{}); };

  const load = async () => {
    try {
      const [r1,r2,r3,r4,r5,r6] = await Promise.all([
        sb.from('profiles').select('*').order('created_at',{ascending:false}),
        sb.from('professionals').select('*').eq('active',true).order('name'),
        sb.from('patients').select('*').eq('active',true).order('name'),
        sb.from('sessions').select('*').order('date',{ascending:false}).limit(200),
        sb.from('payments').select('*').order('created_at',{ascending:false}),
        sb.from('schedule_requests').select('*').eq('status','pendente'),
      ]);
      setUsers(r1.data||[]); setProfs(r2.data||[]); setPts(r3.data||[]); setSess(r4.data||[]); setPays(r5.data||[]); setReqs(r6.data||[]);
    } catch(e) { console.error(e); }
  };
  useEffect(() => { load(); }, []);

  // demo data fallback if Supabase tables empty
  const demoFallback = users.length === 0 && profs.length === 0;
  const dProfs = demoFallback ? [
    {id:"p1", name:"Ana Ribeiro", role_title:"Psicomotricista · Coordenação", avatar_initials:"AR", avatar_color:"#C7DDCB"},
    {id:"p2", name:"Sofia Mendes", role_title:"Psicomotricista", avatar_initials:"SM", avatar_color:"#DCE7F0"},
    {id:"p3", name:"Tiago Faria", role_title:"Terapeuta Ocupacional", avatar_initials:"TF", avatar_color:"#F5D9A8"},
    {id:"p4", name:"Beatriz Lopes", role_title:"Psicóloga Clínica", avatar_initials:"BL", avatar_color:"#EFEBE2"},
  ] : profs;
  const dPts = demoFallback ? [
    {id:"a", name:"Maria S.", age:8, professional_id:"p1", session_type:"individual", day_of_week:"Segunda", hour:"10:00", intervention_area:"Regulação emocional"},
    {id:"b", name:"João P.", age:6, professional_id:"p1", session_type:"individual", day_of_week:"Terça", hour:"15:00", intervention_area:"Coordenação motora"},
    {id:"c", name:"Inês M.", age:10, professional_id:"p2", session_type:"individual", day_of_week:"Quarta", hour:"11:00", intervention_area:"Atenção e concentração"},
    {id:"d", name:"Tomás R.", age:7, professional_id:"p2", session_type:"individual", day_of_week:"Sexta", hour:"16:00", intervention_area:"Lateralidade"},
    {id:"e", name:"Grupo A", age:8, professional_id:"p3", session_type:"grupo", day_of_week:"Quinta", hour:"17:00", intervention_area:"Cooperação corporal"},
    {id:"f", name:"Lia V.", age:5, professional_id:"p4", session_type:"individual", day_of_week:"Segunda", hour:"14:00", intervention_area:"Motricidade fina"},
    {id:"g", name:"Diogo C.", age:9, professional_id:"p1", session_type:"individual", day_of_week:"Quinta", hour:"09:00", intervention_area:"Grafomotricidade"},
    {id:"h", name:"Clara F.", age:11, professional_id:"p3", session_type:"individual", day_of_week:"Terça", hour:"17:00", intervention_area:"Esquema corporal"},
  ] : pts;
  const dSess = demoFallback ? [
    ...Array(74).fill(0).map((_,i)=>({id:"s"+i, status:"realizada", patient_id:["a","b","c","d","f","g","h"][i%7], date:"2026-04"})),
    ...Array(7).fill(0).map((_,i)=>({id:"f"+i, status:"falta", patient_id:["a","b","c"][i%3], date:"2026-04"})),
    ...Array(28).fill(0).map((_,i)=>({id:"a"+i, status:"agendada", patient_id:["a","b","d","f"][i%4], date:"2026-05"})),
  ] : sess;
  const dUsers = demoFallback ? [
    {id:"u1", full_name:"Ana Ribeiro", email:"ana@acasa.pt", role:"director", created_at:"2026-01-10"},
    {id:"u2", full_name:"Sofia Mendes", email:"sofia@acasa.pt", role:"professional"},
    {id:"u3", full_name:"Tiago Faria", email:"tiago@acasa.pt", role:"professional"},
    {id:"u4", full_name:"Família Silva", email:"silva@email.pt", role:"parent"},
    {id:"u5", full_name:"Família Pereira", email:"pereira@email.pt", role:"parent"},
    {id:"u6", full_name:"Beatriz Lopes", email:"beatriz@acasa.pt", role:"pending_director"},
  ] : users;
  const dReqs = demoFallback ? [
    {id:"r1", professional_id:"p2", patient_id:"c", from_schedule:"Quarta 11:00", to_schedule:"Quinta 11:00", reason:"Conflito recorrente com reunião de equipa.", status:"pendente"},
    {id:"r2", professional_id:"p1", patient_id:"b", from_schedule:"Terça 15:00", to_schedule:"Quinta 15:00", reason:"Pedido da família por motivos escolares.", status:"pendente"},
  ] : reqs;
  const dPays = demoFallback ? [
    {id:"y1", patient_id:"a", amount:220, status:"pago", month:"Abril 2026"},
    {id:"y2", patient_id:"b", amount:220, status:"pago", month:"Abril 2026"},
    {id:"y3", patient_id:"c", amount:220, status:"pendente", month:"Abril 2026"},
    {id:"y4", patient_id:"f", amount:220, status:"pendente", month:"Abril 2026"},
    {id:"y5", patient_id:"d", amount:220, status:"pago", month:"Abril 2026"},
    {id:"y6", patient_id:"g", amount:220, status:"pago", month:"Abril 2026"},
  ] : pays;

  const realized = dSess.filter(s => s.status==="realizada");
  const rev = (() => { let t=0; realized.forEach(s=>{const p=dPts.find(x=>x.id===s.patient_id); if (p?.session_type==="individual") t+=55; else t+=150;}); return t; })();
  const cr = Math.round(rev*0.2), pr = Math.round(rev*0.8), net = cr - 1500;
  const occ = Math.round((realized.length/188)*100);
  const tp = dPays.reduce((a,p)=>a+Number(p.amount),0);
  const pp = dPays.filter(p=>p.status==="pago").reduce((a,p)=>a+Number(p.amount),0);
  const pend = dPays.filter(p=>p.status==="pendente");
  const pendU = dUsers.filter(u=>u.role==="pending_director");

  const changeRole = async (uid, r) => {
    if (!demoFallback) await sb.from('profiles').update({role:r}).eq('id',uid);
    show(r==="director"?"Aprovado como Diretora":"Papel atualizado"); await load();
    if (selUser?.id===uid) setSelUser(p=>({...p, role:r}));
  };
  const removeUser = async (uid) => { if(!demoFallback) await sb.from('profiles').delete().eq('id',uid); show("Utilizador removido"); setSub(null); await load(); };
  const addProf = async () => {
    if (!form.name) return;
    const ini = form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    if (!demoFallback) await sb.from('professionals').insert({name:form.name, role_title:form.role||'Psicomotricista', avatar_initials:ini, avatar_color:AVATAR_BG[profs.length%AVATAR_BG.length]});
    setModal(null); setForm({}); show("Profissional adicionado"); await load();
  };
  const addPatient = async () => {
    if (!form.name||!form.age||!form.prof||!form.day||!form.hour||!form.area) return;
    if (!demoFallback) await sb.from('patients').insert({name:form.name, age:parseInt(form.age), professional_id:form.prof, session_type:'individual', day_of_week:form.day, hour:form.hour, periodicity:'Semanal', intervention_area:form.area, start_date:new Date().toISOString().slice(0,7)});
    setModal(null); setForm({}); show("Paciente criado"); await load();
  };
  const addPayment = async () => {
    if (!form.pt||!form.amount) return;
    if (!demoFallback) await sb.from('payments').insert({patient_id:form.pt, month:'Maio 2026', amount:parseFloat(form.amount), status:form.paySt||'pendente', paid_date:form.paySt==='pago'?new Date().toISOString().slice(0,10):null});
    setModal(null); setForm({}); show("Pagamento registado"); await load();
  };
  const inviteUser = async () => {
    if (!form.invName||!form.invEmail||!form.invRole) return;
    const tempPw = 'Psico'+Math.random().toString(36).slice(2,8)+'!';
    if (demoFallback) {
      setInviteResult({email:form.invEmail, pw:tempPw, role:form.invRole, name:form.invName});
      show("Conta criada"); return;
    }
    const {data, error} = await sb.auth.signUp({email:form.invEmail, password:tempPw, options:{data:{full_name:form.invName, role:form.invRole}}});
    if (error) { show("Erro: "+error.message,"error"); return; }
    if (data?.user) {
      await sb.from('profiles').upsert({id:data.user.id, email:form.invEmail, full_name:form.invName, role:form.invRole});
      if (form.invRole==='professional') {
        const ini = form.invName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
        await sb.from('professionals').insert({name:form.invName, role_title:'Psicomotricista', avatar_initials:ini, avatar_color:AVATAR_BG[profs.length%AVATAR_BG.length], profile_id:data.user.id});
      }
    }
    setInviteResult({email:form.invEmail, pw:tempPw, role:form.invRole, name:form.invName});
    show("Conta criada"); await load();
  };

  /* ─── DASHBOARD ─── */
  const Dashboard = () => (
    <div style={{padding:"28px 40px 60px"}}>
      {/* Hero revenue card */}
      <div style={{
        background:"#152741", borderRadius:18, padding:"32px 36px",
        color:"#F7F4EE", position:"relative", overflow:"hidden", marginBottom:16
      }}>
        <HeroEllipses opacity={0.18}/>
        <div style={{position:"relative", zIndex:1, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:32}}>
          <div style={{flex:1}}>
            <Eyebrow color="rgba(247,244,238,.5)">— RECEITA · ABRIL 2026</Eyebrow>
            <div style={{display:"flex", alignItems:"baseline", gap:10, marginTop:14, marginBottom:18}}>
              <span className="serif" style={{fontSize:64, fontWeight:300, letterSpacing:"-0.04em", lineHeight:1}}>{rev.toLocaleString("pt-PT")}</span>
              <span style={{fontSize:24, fontFamily:"Fraunces", fontWeight:300, color:"rgba(247,244,238,.6)"}}>€</span>
              <span style={{fontSize:13, color:"rgba(247,244,238,.55)", marginLeft:14}}>bruta</span>
            </div>
            <div style={{display:"flex", gap:36}}>
              <div><div style={{fontSize:11, color:"rgba(247,244,238,.5)", letterSpacing:0.05, textTransform:"uppercase", marginBottom:4}}>Clínica · 20%</div><div style={{fontSize:18, fontWeight:500}}>{cr.toLocaleString("pt-PT")}€</div></div>
              <div style={{width:1, background:"rgba(247,244,238,.1)"}}/>
              <div><div style={{fontSize:11, color:"rgba(247,244,238,.5)", letterSpacing:0.05, textTransform:"uppercase", marginBottom:4}}>Profissionais · 80%</div><div style={{fontSize:18, fontWeight:500}}>{pr.toLocaleString("pt-PT")}€</div></div>
              <div style={{width:1, background:"rgba(247,244,238,.1)"}}/>
              <div><div style={{fontSize:11, color:"rgba(247,244,238,.5)", letterSpacing:0.05, textTransform:"uppercase", marginBottom:4}}>Resultado líquido</div><div style={{fontSize:18, fontWeight:600, color:net>=0?"#8DBF94":"#E8A13C"}}>{net>=0?"+":""}{net.toLocaleString("pt-PT")}€</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, marginBottom:8}}>
        <Stat label="REALIZADAS" value={realized.length} color="#152741" accent="#8DBF94"/>
        <Stat label="FALTAS" value={dSess.filter(s=>s.status==="falta").length} color="#152741" accent="#B83A3A"/>
        <Stat label="AGENDADAS" value={dSess.filter(s=>s.status==="agendada").length} color="#152741" accent="#B9CDE0"/>
        <Stat label="OCUPAÇÃO" value={occ} suffix="%" color="#152741" accent="#E8A13C" trend={`${realized.length} de 188 sessões`}/>
      </div>

      {/* 2-col content */}
      <div style={{display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:18, marginTop:24}}>
        {/* Left: Profissionais */}
        <div>
          <Section eyebrow="— EQUIPA" title="Profissionais" sub="Casos ativos por terapeuta"
            right={<Btn variant="secondary" size="sm" icon={<Icon name="arr" size={14}/>} onClick={()=>setTab("team")}>Ver equipa</Btn>}/>
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {dProfs.map((p,i) => {
              const pP = dPts.filter(pt=>pt.professional_id===p.id);
              const pSReal = dSess.filter(s=>pP.some(pt=>pt.id===s.patient_id) && s.status==="realizada").length;
              return (
                <Card key={p.id} delay={i*40} pad={18} onClick={()=>{setSelProf(p);setSub("prof");}}>
                  <div style={{display:"flex", alignItems:"center", gap:14}}>
                    <Av t={p.avatar_initials} bg={p.avatar_color} sz={44}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15, fontWeight:500, color:"#152741"}}>{p.name}</div>
                      <div style={{fontSize:13, color:"#8A8A86", marginTop:2}}>{p.role_title}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div className="serif" style={{fontSize:22, fontWeight:300, color:"#152741", lineHeight:1}}>{pP.length}</div>
                      <div style={{fontSize:11, color:"#8A8A86", marginTop:2}}>casos · {pSReal} realizadas</div>
                    </div>
                    <div style={{color:"#B9CDE0"}}><Icon name="arr" size={16}/></div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div>
          <Section eyebrow="— OPERACIONAL" title="Estado da clínica"/>
          <Card pad={20} style={{marginBottom:12}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:10}}>
              <span style={{fontSize:14, fontWeight:500, color:"#152741"}}>Ocupação geral</span>
              <span className="serif" style={{fontSize:22, fontWeight:300, color:"#152741", letterSpacing:"-0.02em"}}>{occ}<span style={{fontSize:13,color:"#8A8A86"}}>%</span></span>
            </div>
            <Progress pct={occ} color="#8DBF94" h={6}/>
            <div style={{fontSize:12, color:"#8A8A86", marginTop:8}}>{realized.length} de 188 sessões mensais</div>
          </Card>
          <Card pad={20} style={{marginBottom:12}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:10}}>
              <span style={{fontSize:14, fontWeight:500, color:"#152741"}}>Cobrança</span>
              <span className="serif" style={{fontSize:22, fontWeight:300, color:"#152741"}}>{tp>0?Math.round(pp/tp*100):0}<span style={{fontSize:13,color:"#8A8A86"}}>%</span></span>
            </div>
            <Progress pct={tp>0?pp/tp*100:0} color={tp>0&&pp/tp>=.8?"#8DBF94":"#E8A13C"} h={6}/>
            <div style={{fontSize:12, color:"#8A8A86", marginTop:8}}>{pp.toLocaleString("pt-PT")}€ recebidos · {(tp-pp).toLocaleString("pt-PT")}€ pendentes</div>
          </Card>

          {pend.length>0 && (
            <Card pad={20} style={{borderLeft:"3px solid #E8A13C"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <Eyebrow color="#C97A1F">— PENDENTES ({pend.length})</Eyebrow>
                <Btn variant="ghost" size="sm" onClick={()=>setTab("finance")}>Ver tudo</Btn>
              </div>
              {pend.slice(0,4).map(p => {
                const pt = dPts.find(x=>x.id===p.patient_id);
                return (
                  <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderTop:"1px solid #EFEBE2",alignItems:"center"}}>
                    <span style={{fontSize:13.5, color:"#3C3C3B"}}>{pt?.name||"—"}</span>
                    <span style={{fontSize:13.5, fontWeight:600, color:"#C97A1F"}}>{p.amount}€</span>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </div>

      <Section eyebrow="— FINANCEIRO" title="Resultado mensal"/>
      <Card pad={26}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:0, alignItems:"center"}}>
          <div style={{paddingRight:24, borderRight:"1px solid #EFEBE2"}}>
            <Eyebrow>+ ENTRADAS</Eyebrow>
            <div className="serif" style={{fontSize:30, fontWeight:300, color:"#152741", marginTop:6, letterSpacing:"-0.02em"}}>{rev.toLocaleString("pt-PT")}€</div>
            <div style={{fontSize:12, color:"#8A8A86", marginTop:4}}>Sessões realizadas</div>
          </div>
          <div style={{padding:"0 24px", borderRight:"1px solid #EFEBE2"}}>
            <Eyebrow>− PROFISSIONAIS</Eyebrow>
            <div className="serif" style={{fontSize:30, fontWeight:300, color:"#152741", marginTop:6, letterSpacing:"-0.02em"}}>{pr.toLocaleString("pt-PT")}€</div>
            <div style={{fontSize:12, color:"#8A8A86", marginTop:4}}>80% · pagamento à equipa</div>
          </div>
          <div style={{padding:"0 24px", borderRight:"1px solid #EFEBE2"}}>
            <Eyebrow>− CUSTOS FIXOS</Eyebrow>
            <div className="serif" style={{fontSize:30, fontWeight:300, color:"#152741", marginTop:6, letterSpacing:"-0.02em"}}>1.500€</div>
            <div style={{fontSize:12, color:"#8A8A86", marginTop:4}}>Renda do espaço</div>
          </div>
          <div style={{paddingLeft:24}}>
            <Eyebrow color="#C97A1F">= RESULTADO</Eyebrow>
            <div className="serif" style={{fontSize:34, fontWeight:300, color:net>=0?"#3D7A4A":"#B83A3A", marginTop:6, letterSpacing:"-0.025em"}}>{net>=0?"+":""}{net.toLocaleString("pt-PT")}€</div>
            <div style={{fontSize:12, color:"#8A8A86", marginTop:4}}>Margem da clínica</div>
          </div>
        </div>
      </Card>
    </div>
  );

  /* ─── USERS ─── */
  const Users = () => {
    const filtered = dUsers.filter(u=>!search||u.full_name?.toLowerCase().includes(search.toLowerCase())||u.email?.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{padding:"28px 40px 60px"}}>
        {pendU.length>0 && (
          <>
            <Section eyebrow="— EM ESPERA" title={`Aguardam aprovação · ${pendU.length}`} sub="Pedidos de acesso como Diretora"/>
            <div style={{display:"flex", flexDirection:"column", gap:10}}>
              {pendU.map((u,i) => (
                <Card key={u.id} delay={i*40} pad={20} style={{borderLeft:"3px solid #E8A13C"}}>
                  <div style={{display:"flex", alignItems:"center", gap:16}}>
                    <Av t={u.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2)} bg="#F5E5CD" color="#C97A1F"/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15, fontWeight:500, color:"#152741"}}>{u.full_name}</div>
                      <div style={{fontSize:13, color:"#8A8A86"}}>{u.email}</div>
                    </div>
                    <Tag type="pending_director">Pendente</Tag>
                    <Btn variant="primary" size="sm" icon={<Icon name="check" size={14}/>} onClick={()=>changeRole(u.id,"director")}>Aprovar</Btn>
                    <Btn variant="secondary" size="sm" onClick={()=>changeRole(u.id,"parent")}>Recusar</Btn>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        <Section eyebrow="— DIRETÓRIO" title={`Todos os utilizadores · ${dUsers.length}`}
          right={<>
            <SearchInput value={search} onChange={setSearch} placeholder="Procurar nome, email…" style={{width:280}}/>
            <Btn icon={<Icon name="plus" size={16}/>} onClick={()=>{setForm({});setInviteResult(null);setModal("invite");}}>Convidar</Btn>
          </>}/>

        <Card pad={0}>
          <div style={{display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 80px", padding:"14px 20px", borderBottom:"1px solid #E5E0D4", background:"#EFEBE2"}}>
            <Eyebrow>Nome</Eyebrow><Eyebrow>Email</Eyebrow><Eyebrow>Papel</Eyebrow><Eyebrow>Estado</Eyebrow><div/>
          </div>
          {filtered.map((u,i) => (
            <div key={u.id} className="ch" onClick={()=>{setSelUser(u);setSub("user-detail");}} style={{
              display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 80px", padding:"14px 20px",
              borderBottom: i<filtered.length-1?"1px solid #EFEBE2":"none",
              alignItems:"center", cursor:"pointer"
            }}
            onMouseEnter={e=>e.currentTarget.style.background="#F7F4EE"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <Av t={u.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2)||"?"} bg={u.role==="director"?"#EFEBE2":u.role==="professional"?"#C7DDCB":"#DCE7F0"} sz={36}/>
                <span style={{fontSize:14, fontWeight:500, color:"#152741"}}>{u.full_name||"—"}</span>
              </div>
              <span style={{fontSize:13.5, color:"#5A5A58"}}>{u.email}</span>
              <span><Tag type={u.role}>{RL[u.role]||u.role}</Tag></span>
              <span style={{fontSize:13, color:u.role==="pending_director"?"#C97A1F":"#3D7A4A"}}>● {u.role==="pending_director"?"Pendente":"Ativo"}</span>
              <div style={{textAlign:"right",color:"#B9CDE0"}}><Icon name="arr" size={14}/></div>
            </div>
          ))}
          {filtered.length===0 && <div style={{padding:40,textAlign:"center",color:"#8A8A86",fontSize:14}}>Sem resultados.</div>}
        </Card>
      </div>
    );
  };

  /* ─── USER DETAIL ─── */
  const UserDetail = () => (
    <div style={{padding:"28px 40px 60px"}}>
      <button onClick={()=>setSub(null)} className="ch" style={{display:"flex",alignItems:"center",gap:6,fontSize:13.5,color:"#5A5A58",marginBottom:18,padding:"6px 0"}}><Icon name="back" size={16}/> Voltar a utilizadores</button>
      <div style={{display:"grid", gridTemplateColumns:"320px 1fr", gap:24}}>
        <Card pad={28} style={{textAlign:"center", height:"fit-content"}}>
          <Av t={selUser.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2)} bg={selUser.role==="director"?"#EFEBE2":"#DCE7F0"} sz={88}/>
          <div className="serif" style={{fontSize:24, fontWeight:300, color:"#152741", marginTop:16, letterSpacing:"-0.02em"}}>{selUser.full_name}</div>
          <div style={{fontSize:13.5, color:"#8A8A86", marginTop:4}}>{selUser.email}</div>
          <div style={{marginTop:14}}><Tag type={selUser.role}>{RL[selUser.role]}</Tag></div>
          {selUser.email!==profile?.email && (
            <div style={{marginTop:24, paddingTop:20, borderTop:"1px solid #EFEBE2"}}>
              <Btn variant="danger" size="sm" icon={<Icon name="trash" size={14}/>} onClick={()=>{if(confirm("Remover este utilizador?")) removeUser(selUser.id);}} style={{width:"100%"}}>Remover utilizador</Btn>
            </div>
          )}
        </Card>
        <div>
          <Section eyebrow="— PERMISSÕES" title="Alterar papel" sub="Define o nível de acesso da plataforma"/>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10}}>
            {["parent","professional","director"].map(r => (
              <Card key={r} pad={18} onClick={()=>changeRole(selUser.id,r)} style={{
                cursor:"pointer", textAlign:"center",
                background:selUser.role===r?"#152741":"#FBF9F4",
                borderColor:selUser.role===r?"#152741":"#E5E0D4",
              }}>
                <div style={{color:selUser.role===r?"#E8A13C":"#152741", marginBottom:8, display:"flex",justifyContent:"center"}}>
                  <Icon name={r==="director"?"shield":r==="professional"?"users":"home"} size={22}/>
                </div>
                <div style={{fontSize:14.5, fontWeight:500, color:selUser.role===r?"#F7F4EE":"#152741"}}>{RL[r]}</div>
                {selUser.role===r && <div className="mono" style={{color:"#E8A13C", marginTop:6}}>— ATIVO</div>}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── PROF DETAIL ─── */
  const ProfDetail = () => {
    const p = selProf;
    const pP = dPts.filter(pt=>pt.professional_id===p.id);
    const pS = dSess.filter(s=>pP.some(pt=>pt.id===s.patient_id) && s.status==="realizada");
    let iE=0, gE=0;
    pS.forEach(s=>{const pt=dPts.find(x=>x.id===s.patient_id); if (pt?.session_type==="individual") iE+=55*0.8; else gE+=150*0.4;});
    return (
      <div style={{padding:"28px 40px 60px"}}>
        <button onClick={()=>setSub(null)} className="ch" style={{display:"flex",alignItems:"center",gap:6,fontSize:13.5,color:"#5A5A58",marginBottom:18,padding:"6px 0"}}><Icon name="back" size={16}/> Voltar</button>
        <div style={{display:"grid", gridTemplateColumns:"320px 1fr", gap:24}}>
          <Card pad={28} style={{textAlign:"center", height:"fit-content"}}>
            <Av t={p.avatar_initials} bg={p.avatar_color} sz={88}/>
            <div className="serif" style={{fontSize:24, fontWeight:300, color:"#152741", marginTop:16, letterSpacing:"-0.02em"}}>{p.name}</div>
            <div style={{fontSize:13.5, color:"#8A8A86", marginTop:4}}>{p.role_title}</div>
            <div style={{marginTop:14}}><Tag type="professional">Ativo</Tag></div>
          </Card>
          <div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24}}>
              <Stat label="CASOS" value={pP.length} accent="#B9CDE0"/>
              <Stat label="REALIZADAS" value={pS.length} accent="#8DBF94"/>
              <Stat label="GANHOS" value={(iE+gE).toFixed(0)} suffix="€" accent="#E8A13C"/>
            </div>
            <Section eyebrow="— ACOMPANHAMENTO" title="Casos ativos"/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {pP.map((pt,i) => (
                <Card key={pt.id} delay={i*40} pad={16}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:3, height:36, background:"#8DBF94", borderRadius:2}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14.5, fontWeight:500, color:"#152741"}}>{pt.name} <span style={{color:"#8A8A86", fontWeight:400}}>· {pt.age} anos</span></div>
                      <div style={{fontSize:13, color:"#8A8A86", marginTop:2}}>{pt.intervention_area}</div>
                    </div>
                    <div className="mono" style={{color:"#5A5A58"}}>{pt.day_of_week.slice(0,3).toUpperCase()} · {pt.hour}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ─── TEAM ─── */
  const Team = () => (
    <div style={{padding:"28px 40px 60px"}}>
      <Section eyebrow="— EQUIPA" title={`Profissionais · ${dProfs.length}`} sub="Terapeutas em atividade na Casa"
        right={<Btn icon={<Icon name="plus" size={16}/>} onClick={()=>{setForm({});setModal("addProf");}}>Adicionar profissional</Btn>}/>
      <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:14}}>
        {dProfs.map((p,i) => {
          const pP = dPts.filter(pt=>pt.professional_id===p.id);
          return (
            <Card key={p.id} delay={i*40} pad={22} onClick={()=>{setSelProf(p);setSub("prof");}}>
              <div style={{display:"flex", alignItems:"flex-start", gap:16}}>
                <Av t={p.avatar_initials} bg={p.avatar_color} sz={56}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:16, fontWeight:500, color:"#152741"}}>{p.name}</div>
                  <div style={{fontSize:13, color:"#8A8A86", marginTop:3}}>{p.role_title}</div>
                  <div style={{display:"flex",gap:18,marginTop:14}}>
                    <div><div className="serif" style={{fontSize:22,fontWeight:300,color:"#152741",lineHeight:1}}>{pP.length}</div><div style={{fontSize:11,color:"#8A8A86",marginTop:2}}>casos</div></div>
                    <div><div className="serif" style={{fontSize:22,fontWeight:300,color:"#152741",lineHeight:1}}>{pP.filter(p=>p.session_type==="individual").length}</div><div style={{fontSize:11,color:"#8A8A86",marginTop:2}}>individuais</div></div>
                  </div>
                </div>
                <div style={{color:"#B9CDE0"}}><Icon name="arr" size={16}/></div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  /* ─── PATIENTS ─── */
  const Patients = () => {
    const filtered = dPts.filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{padding:"28px 40px 60px"}}>
        <Section eyebrow="— CASOS" title={`Pacientes · ${dPts.length}`} sub="Acompanhamentos em curso"
          right={<>
            <SearchInput value={search} onChange={setSearch} placeholder="Procurar paciente…" style={{width:260}}/>
            <Btn icon={<Icon name="plus" size={16}/>} onClick={()=>{setForm({});setModal("addPatient");}}>Novo paciente</Btn>
          </>}/>
        <Card pad={0}>
          <div style={{display:"grid", gridTemplateColumns:"2fr 80px 2fr 2fr 1.2fr 1fr", padding:"14px 20px", background:"#EFEBE2", borderBottom:"1px solid #E5E0D4"}}>
            <Eyebrow>Paciente</Eyebrow><Eyebrow>Idade</Eyebrow><Eyebrow>Profissional</Eyebrow><Eyebrow>Área</Eyebrow><Eyebrow>Horário</Eyebrow><Eyebrow>Tipo</Eyebrow>
          </div>
          {filtered.map((pt,i) => {
            const pr = dProfs.find(p=>p.id===pt.professional_id);
            return (
              <div key={pt.id} style={{
                display:"grid", gridTemplateColumns:"2fr 80px 2fr 2fr 1.2fr 1fr",
                padding:"14px 20px", alignItems:"center",
                borderBottom: i<filtered.length-1?"1px solid #EFEBE2":"none",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36, height:36, borderRadius:18, background:"#DCE7F0", color:"#152741", display:"flex",alignItems:"center",justifyContent:"center", fontWeight:500, fontSize:13}}>{pt.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                  <span style={{fontSize:14, fontWeight:500, color:"#152741"}}>{pt.name}</span>
                </div>
                <span style={{fontSize:13.5, color:"#5A5A58"}}>{pt.age}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>{pr && <><Av t={pr.avatar_initials} bg={pr.avatar_color} sz={26}/><span style={{fontSize:13.5,color:"#3C3C3B"}}>{pr.name}</span></>}</div>
                <span style={{fontSize:13, color:"#5A5A58"}}>{pt.intervention_area}</span>
                <span className="mono" style={{color:"#5A5A58"}}>{pt.day_of_week.slice(0,3).toUpperCase()} · {pt.hour}</span>
                <span><Tag type={pt.session_type==="individual"?"sage":"amber"}>{pt.session_type==="individual"?"Individual":"Grupo"}</Tag></span>
              </div>
            );
          })}
        </Card>
      </div>
    );
  };

  /* ─── AGENDA ─── */
  const Agenda = () => {
    const slot = (day, hour) => dPts.filter(p=>p.day_of_week===day && p.hour===hour);
    return (
      <div style={{padding:"28px 40px 60px"}}>
        <Section eyebrow="— SEMANA" title="Agenda · Maio 2026" sub="Horários fixos da clínica"
          right={<><Btn variant="secondary" size="sm">Hoje</Btn><Btn variant="secondary" size="sm" icon={<Icon name="filter" size={14}/>}>Filtrar</Btn></>}/>
        <Card pad={0}>
          <div style={{display:"grid", gridTemplateColumns:`90px repeat(${DAYS.length}, 1fr)`}}>
            <div style={{padding:"14px 12px", background:"#EFEBE2", borderBottom:"1px solid #E5E0D4"}}><Eyebrow>Hora</Eyebrow></div>
            {DAYS.map(d => <div key={d} style={{padding:"14px 16px", background:"#EFEBE2", borderBottom:"1px solid #E5E0D4", borderLeft:"1px solid #E5E0D4"}}><Eyebrow>{d}</Eyebrow></div>)}
            {HOURS.map(h => (
              <React.Fragment key={h}>
                <div style={{padding:"14px 12px", borderBottom:"1px solid #EFEBE2", color:"#5A5A58", fontSize:13, fontWeight:500}} className="mono">{h}</div>
                {DAYS.map(d => {
                  const items = slot(d, h);
                  return (
                    <div key={d+h} style={{padding:8, borderLeft:"1px solid #EFEBE2", borderBottom:"1px solid #EFEBE2", minHeight:62, background: items.length===0?"transparent":"#FBF9F4"}}>
                      {items.map(p => {
                        const pr = dProfs.find(x=>x.id===p.professional_id);
                        return (
                          <div key={p.id} style={{padding:"7px 9px", borderRadius:7, background:pr?.avatar_color||"#DCE7F0", marginBottom:4, fontSize:12}}>
                            <div style={{fontWeight:500, color:"#152741"}}>{p.name}</div>
                            <div style={{color:"#5A5A58", fontSize:11, marginTop:1}}>{pr?.name?.split(" ")[0]} · {p.intervention_area.split(" ")[0]}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  /* ─── FINANCE ─── */
  const Finance = () => (
    <div style={{padding:"28px 40px 60px"}}>
      <Section eyebrow="— FINANCEIRO" title="Pagamentos · Abril 2026" sub="Recibos emitidos e cobranças pendentes"
        right={<Btn icon={<Icon name="plus" size={16}/>} onClick={()=>{setForm({});setModal("addPayment");}}>Registar</Btn>}/>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24}}>
        <Stat label="TOTAL FATURADO" value={tp.toLocaleString("pt-PT")} suffix="€" accent="#152741"/>
        <Stat label="RECEBIDO" value={pp.toLocaleString("pt-PT")} suffix="€" accent="#8DBF94"/>
        <Stat label="PENDENTE" value={(tp-pp).toLocaleString("pt-PT")} suffix="€" accent="#E8A13C"/>
      </div>
      <Card pad={0}>
        <div style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", padding:"14px 20px", background:"#EFEBE2", borderBottom:"1px solid #E5E0D4"}}>
          <Eyebrow>Paciente</Eyebrow><Eyebrow>Mês</Eyebrow><Eyebrow>Valor</Eyebrow><Eyebrow>Estado</Eyebrow>
        </div>
        {dPays.map((p,i) => {
          const pt = dPts.find(x=>x.id===p.patient_id);
          return (
            <div key={p.id} style={{
              display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr",
              padding:"14px 20px", alignItems:"center",
              borderBottom: i<dPays.length-1?"1px solid #EFEBE2":"none"
            }}>
              <span style={{fontSize:14, fontWeight:500, color:"#152741"}}>{pt?.name||"—"}</span>
              <span style={{fontSize:13.5, color:"#5A5A58"}}>{p.month||"Abril 2026"}</span>
              <span className="serif" style={{fontSize:18, fontWeight:300, color:"#152741", letterSpacing:"-0.02em"}}>{p.amount}€</span>
              <span><Tag type={p.status}>{p.status==="pago"?"Pago":"Pendente"}</Tag></span>
            </div>
          );
        })}
      </Card>
    </div>
  );

  /* ─── REQUESTS ─── */
  const Requests = () => (
    <div style={{padding:"28px 40px 60px"}}>
      <Section eyebrow="— PEDIDOS" title={`Trocas de horário · ${dReqs.length}`} sub="Pedidos pendentes da equipa"/>
      {dReqs.length===0 && <Empty title="Tudo em ordem" text="Sem pedidos de troca pendentes." icon={<Icon name="check" size={32}/>}/>}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {dReqs.map((r,i) => {
          const pr = dProfs.find(p=>p.id===r.professional_id);
          const pt = dPts.find(p=>p.id===r.patient_id);
          return (
            <Card key={r.id} delay={i*60} pad={22}>
              <div style={{display:"flex", alignItems:"center", gap:18}}>
                {pr && <Av t={pr.avatar_initials} bg={pr.avatar_color} sz={48}/>}
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <span style={{fontSize:15, fontWeight:500, color:"#152741"}}>{pr?.name||"—"}</span>
                    <Tag type="pendente">Pendente</Tag>
                  </div>
                  <div style={{fontSize:13.5, color:"#5A5A58", marginBottom:8}}>Paciente: <strong style={{color:"#152741"}}>{pt?.name||"—"}</strong></div>
                  <div style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>
                    <span style={{padding:"4px 10px", borderRadius:6, background:"#F4E0E0", color:"#B83A3A"}} className="mono">{r.from_schedule}</span>
                    <Icon name="arr" size={14} color="#8A8A86"/>
                    <span style={{padding:"4px 10px", borderRadius:6, background:"#DDEADE", color:"#3D7A4A"}} className="mono">{r.to_schedule}</span>
                  </div>
                  {r.reason && <div className="serif-it" style={{fontSize:14, color:"#5A5A58", marginTop:10, paddingLeft:12, borderLeft:"2px solid #B9CDE0"}}>"{r.reason}"</div>}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Btn variant="primary" icon={<Icon name="check" size={14}/>} onClick={async()=>{if(!demoFallback)await sb.from('schedule_requests').update({status:'aprovado'}).eq('id',r.id);show("Aprovado");await load();}}>Aprovar</Btn>
                  <Btn variant="secondary" onClick={async()=>{if(!demoFallback)await sb.from('schedule_requests').update({status:'recusado'}).eq('id',r.id);show("Recusado","error");await load();}}>Recusar</Btn>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  /* ─── SETTINGS ─── */
  const Settings = () => (
    <div style={{padding:"28px 40px 60px"}}>
      <Section eyebrow="— PREFERÊNCIAS" title="Definições" sub="Configurações da plataforma e da clínica"/>
      <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14}}>
        {[
          {t:"Convidar utilizador",d:"Criar conta e enviar credenciais de acesso",ic:"mail",ac:"#EFEBE2",m:"invite"},
          {t:"Adicionar profissional",d:"Registar novo terapeuta na equipa",ic:"users",ac:"#C7DDCB",m:"addProf"},
          {t:"Novo paciente",d:"Abrir caso clínico e definir horário",ic:"clipboard",ac:"#DCE7F0",m:"addPatient"},
          {t:"Registar pagamento",d:"Recibo emitido ou cobrança pendente",ic:"wallet",ac:"#F5D9A8",m:"addPayment"},
        ].map((a,i) => (
          <Card key={a.m} delay={i*40} pad={22} onClick={()=>{setForm({});setInviteResult(null);setModal(a.m);}}>
            <div style={{display:"flex", gap:16, alignItems:"center"}}>
              <div style={{width:52,height:52,borderRadius:12,background:a.ac,color:"#152741",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name={a.ic} size={22}/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:15, fontWeight:500, color:"#152741"}}>{a.t}</div>
                <div style={{fontSize:13, color:"#8A8A86", marginTop:3}}>{a.d}</div>
              </div>
              <div style={{color:"#B9CDE0"}}><Icon name="arr" size={16}/></div>
            </div>
          </Card>
        ))}
      </div>

      <Section eyebrow="— SISTEMA" title="Sobre"/>
      <Card pad={26}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
          <div><Eyebrow>VERSÃO</Eyebrow><div style={{fontSize:15,color:"#152741",marginTop:6,fontWeight:500}}>Brand v1.0 · Hub 2026.05</div></div>
          <div><Eyebrow>ADMINISTRADOR</Eyebrow><div style={{fontSize:15,color:"#152741",marginTop:6,fontWeight:500}}>{ADMIN_EMAIL}</div></div>
          <div><Eyebrow>WEB</Eyebrow><div style={{fontSize:15,color:"#152741",marginTop:6,fontWeight:500}}>acasadapsicomotricidade.pt</div></div>
        </div>
      </Card>
    </div>
  );

  // Map titles
  const titles = {
    dashboard:{e:"— VISÃO GERAL", t:"Dashboard", s:"Estado da clínica em tempo real"},
    users:{e:"— ACESSOS", t:"Utilizadores", s:"Gestão de contas e papéis"},
    team:{e:"— EQUIPA", t:"Profissionais", s:"Terapeutas e coordenação"},
    patients:{e:"— CLÍNICA", t:"Pacientes", s:"Casos em acompanhamento"},
    agenda:{e:"— TEMPO", t:"Agenda semanal", s:"Distribuição de sessões"},
    finance:{e:"— FINANCEIRO", t:"Pagamentos", s:"Recibos e cobranças"},
    requests:{e:"— OPERACIONAL", t:"Pedidos de troca", s:"Aprovações pendentes"},
    settings:{e:"— SISTEMA", t:"Definições", s:"Preferências e ações"},
  };

  let content, title;
  if (sub === "user-detail") { content = <UserDetail/>; title = {e:"— DETALHE", t:selUser?.full_name||"Utilizador", s:""}; }
  else if (sub === "prof") { content = <ProfDetail/>; title = {e:"— PROFISSIONAL", t:selProf?.name||"", s:selProf?.role_title}; }
  else { title = titles[tab]; content = ({dashboard:<Dashboard/>,users:<Users/>,team:<Team/>,patients:<Patients/>,agenda:<Agenda/>,finance:<Finance/>,requests:<Requests/>,settings:<Settings/>})[tab]; }

  return (
    <div style={{display:"flex", minHeight:"100vh", background:"#F7F4EE"}}>
      <Sidebar active={tab} onChange={(t)=>{setTab(t);setSub(null);setSearch("");}} profile={profile} onLogout={onLogout} badges={{requests:dReqs.length, users:pendU.length}}/>
      <main style={{flex:1, minWidth:0}}>
        {!sub && title && <Topbar eyebrow={title.e} title={title.t} sub={title.s}/>}
        {content}
      </main>

      <Toast msg={toast?.m} type={toast?.t}/>

      {/* Modals */}
      <Modal open={modal==="invite"} onClose={()=>{setModal(null);setInviteResult(null);}} title={inviteResult?"Conta criada":"Convidar utilizador"} eyebrow="— NOVO ACESSO">
        {!inviteResult ? (
          <>
            <Field label="Nome completo"><Inp placeholder="Ex: João Silva" value={form.invName||""} onChange={e=>setForm(f=>({...f,invName:e.target.value}))}/></Field>
            <Field label="Email"><Inp type="email" placeholder="joao@email.pt" value={form.invEmail||""} onChange={e=>setForm(f=>({...f,invEmail:e.target.value}))}/></Field>
            <Field label="Papel"><Sel value={form.invRole||""} onChange={v=>setForm(f=>({...f,invRole:v}))} options={[{v:"professional",l:"Profissional"},{v:"parent",l:"Pai / Mãe"},{v:"director",l:"Diretora"}]}/></Field>
            <div style={{marginTop:18, display:"flex", gap:10, justifyContent:"flex-end"}}>
              <Btn variant="secondary" onClick={()=>setModal(null)}>Cancelar</Btn>
              <Btn onClick={inviteUser} disabled={!form.invName||!form.invEmail||!form.invRole}>Criar conta</Btn>
            </div>
          </>
        ) : (
          <>
            <div style={{padding:"14px 16px", background:"#DDEADE", borderRadius:10, color:"#3D7A4A", fontSize:13.5, marginBottom:18, display:"flex",alignItems:"center",gap:10}}>
              <Icon name="check" size={18}/> Conta criada com sucesso. Partilhe as credenciais com o utilizador.
            </div>
            <div style={{background:"#F7F4EE", borderRadius:10, padding:18, marginBottom:16, border:"1px solid #E5E0D4"}}>
              <div style={{marginBottom:14}}><Eyebrow>EMAIL</Eyebrow><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}><span style={{fontSize:14.5, color:"#152741"}}>{inviteResult.email}</span><button onClick={()=>copyText(inviteResult.email)} className="ch" style={{color:"#5A5A58", padding:4,display:"flex"}}><Icon name="copy" size={16}/></button></div></div>
              <div style={{marginBottom:14}}><Eyebrow>PASSWORD TEMPORÁRIA</Eyebrow><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}><span style={{fontFamily:"JetBrains Mono", fontSize:14, color:"#152741"}}>{inviteResult.pw}</span><button onClick={()=>copyText(inviteResult.pw)} className="ch" style={{color:"#5A5A58", padding:4,display:"flex"}}><Icon name="copy" size={16}/></button></div></div>
              <div><Eyebrow>PAPEL</Eyebrow><div style={{marginTop:6}}><Tag type={inviteResult.role}>{RL[inviteResult.role]}</Tag></div></div>
            </div>
            <div style={{display:"flex", gap:10, justifyContent:"flex-end"}}>
              <Btn variant="secondary" onClick={()=>copyText(`Olá ${inviteResult.name}, a sua conta na Psicomotriclinic está pronta. Email: ${inviteResult.email} · Password: ${inviteResult.pw}`)}>Copiar mensagem</Btn>
              <Btn onClick={()=>{setModal(null);setInviteResult(null);}}>Concluir</Btn>
            </div>
          </>
        )}
      </Modal>

      <Modal open={modal==="addProf"} onClose={()=>setModal(null)} title="Adicionar profissional" eyebrow="— NOVA EQUIPA">
        <Field label="Nome"><Inp placeholder="Ex: Maria Santos" value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></Field>
        <Field label="Função"><Sel value={form.role||"Psicomotricista"} onChange={v=>setForm(f=>({...f,role:v}))} options={[{v:"Psicomotricista",l:"Psicomotricista"},{v:"Terapeuta Ocupacional",l:"Terapeuta Ocupacional"},{v:"Psicólogo/a",l:"Psicólogo/a"}]}/></Field>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:14}}>
          <Btn variant="secondary" onClick={()=>setModal(null)}>Cancelar</Btn>
          <Btn onClick={addProf} disabled={!form.name}>Adicionar</Btn>
        </div>
      </Modal>

      <Modal open={modal==="addPatient"} onClose={()=>setModal(null)} title="Novo paciente" eyebrow="— NOVO CASO">
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
          <Field label="Nome"><Inp placeholder="Ex: Maria S." value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></Field>
          <Field label="Idade"><Inp type="number" placeholder="12" value={form.age||""} onChange={e=>setForm(f=>({...f,age:e.target.value}))}/></Field>
        </div>
        <Field label="Profissional"><Sel value={form.prof||""} onChange={v=>setForm(f=>({...f,prof:v}))} options={dProfs.map(p=>({v:p.id,l:p.name}))}/></Field>
        <Field label="Área de intervenção"><Sel value={form.area||""} onChange={v=>setForm(f=>({...f,area:v}))} options={AREAS.map(a=>({v:a,l:a}))}/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Dia"><Sel value={form.day||""} onChange={v=>setForm(f=>({...f,day:v}))} options={DAYS.map(d=>({v:d,l:d}))}/></Field>
          <Field label="Hora"><Sel value={form.hour||""} onChange={v=>setForm(f=>({...f,hour:v}))} options={HOURS.map(h=>({v:h,l:h}))}/></Field>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:14}}>
          <Btn variant="secondary" onClick={()=>setModal(null)}>Cancelar</Btn>
          <Btn onClick={addPatient} disabled={!form.name||!form.age||!form.prof||!form.area||!form.day||!form.hour}>Criar caso</Btn>
        </div>
      </Modal>

      <Modal open={modal==="addPayment"} onClose={()=>setModal(null)} title="Registar pagamento" eyebrow="— FINANCEIRO">
        <Field label="Paciente"><Sel value={form.pt||""} onChange={v=>setForm(f=>({...f,pt:v}))} options={dPts.map(p=>({v:p.id,l:p.name}))}/></Field>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="Valor (€)"><Inp type="number" placeholder="220" value={form.amount||""} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></Field>
          <Field label="Estado"><Sel value={form.paySt||"pendente"} onChange={v=>setForm(f=>({...f,paySt:v}))} options={[{v:"pago",l:"Pago"},{v:"pendente",l:"Pendente"}]}/></Field>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:14}}>
          <Btn variant="secondary" onClick={()=>setModal(null)}>Cancelar</Btn>
          <Btn onClick={addPayment} disabled={!form.pt||!form.amount}>Registar</Btn>
        </div>
      </Modal>
    </div>
  );
};

window.AdminPortal = AdminPortal;
window.RL = RL;
