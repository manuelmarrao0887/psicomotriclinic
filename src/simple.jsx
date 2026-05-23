/* ═══ Simple portal — for parent / professional roles ═══ */
const SimplePortal = ({ role, profile, onLogout }) => (
  <div style={{minHeight:"100vh", background:"#F7F4EE", display:"flex", flexDirection:"column"}}>
    <div style={{padding:"22px 40px", borderBottom:"1px solid #E5E0D4", background:"#FBF9F4", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
      <Logo/>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13.5,fontWeight:500,color:"#152741"}}>{profile?.full_name}</div>
          <div style={{fontSize:11.5,color:"#8A8A86"}}>{window.RL[role]}</div>
        </div>
        <Av t={profile?.full_name?.split(" ").map(w=>w[0]).join("").slice(0,2)||"?"} bg="#DCE7F0"/>
        <button onClick={onLogout} className="ch" style={{padding:8, color:"#5A5A58",display:"flex",borderRadius:8}}><Icon name="logout" size={18}/></button>
      </div>
    </div>

    <div style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:40}}>
      <Card pad={48} style={{textAlign:"center", maxWidth:520, position:"relative", overflow:"hidden"}}>
        <HeroEllipses opacity={0.12}/>
        <div style={{position:"relative",zIndex:1}}>
          <div style={{marginBottom:14, display:"flex", justifyContent:"center"}}><Mark size={56}/></div>
          <Eyebrow>— BEM-VINDA</Eyebrow>
          <div className="serif" style={{fontSize:38, fontWeight:300, color:"#152741", margin:"10px 0 16px", letterSpacing:"-0.025em"}}>
            Olá, {profile?.full_name?.split(" ")[0]}<span className="serif-it">.</span>
          </div>
          <div style={{fontSize:15, color:"#5A5A58", marginBottom:20, lineHeight:1.6}}>
            Sessão iniciada como <Tag type={role}>{window.RL[role]}</Tag>
          </div>
          <p className="serif-it" style={{fontSize:16, color:"#8A8A86", marginBottom:28, lineHeight:1.5}}>
            "Cuidar é acompanhar."
          </p>
          <div style={{padding:"14px 18px", background:"#F7F4EE", borderRadius:10, fontSize:13.5, color:"#5A5A58", marginBottom:20}}>
            Portal {role==="parent"?"familiar":"profissional"} em desenvolvimento.<br/>Em breve: agenda pessoal, sessões e acompanhamento.
          </div>
          <Btn variant="secondary" onClick={onLogout}>Terminar sessão</Btn>
        </div>
      </Card>
    </div>
  </div>
);

window.SimplePortal = SimplePortal;
