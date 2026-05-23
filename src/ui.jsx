/* ═══ UI primitives — Casa da Psicomotricidade brand ═══ */
const { useState, useEffect, useRef, useMemo } = React;

const Mark = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="11" r="4.2" fill="#E8A13C"/>
    <circle cx="32" cy="23" r="6.8" fill="#8DBF94"/>
    <ellipse cx="25" cy="43" rx="13" ry="9" fill="#152741"/>
    <ellipse cx="38" cy="45.5" rx="12" ry="8" fill="#B9CDE0"/>
  </svg>
);

const Logo = ({ tone = "navy" }) => (
  <div style={{display:"flex",alignItems:"center",gap:12}}>
    <Mark size={36}/>
    <div style={{display:"flex",flexDirection:"column",lineHeight:1}}>
      <span style={{fontFamily:"DM Sans",fontWeight:700,fontSize:17,letterSpacing:"-0.01em",color:tone==="cream"?"#F7F4EE":"#152741"}}>PSICOMOTRI<span style={{fontWeight:400}}>CLINIC</span></span>
      <span className="mono" style={{color:tone==="cream"?"rgba(247,244,238,.5)":"#8A8A86",fontSize:9.5,marginTop:4}}>A CASA · CLÍNICA</span>
    </div>
  </div>
);

const Eyebrow = ({children, color="#8A8A86"}) => (
  <span className="mono" style={{color, fontSize:11, fontWeight:500}}>{children}</span>
);

const Av = ({ t, bg, sz = 40, color = "#152741" }) => (
  <div style={{
    width:sz, height:sz, borderRadius:sz*0.5,
    background:bg||"#DCE7F0",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"DM Sans", fontSize:sz*0.36, fontWeight:600,
    color, flexShrink:0, letterSpacing:"-0.01em"
  }}>{t}</div>
);

const Tag = ({children, type="default"}) => {
  const m = {
    realizada:["#DDEADE","#3D7A4A"],
    falta:["#F4E0E0","#B83A3A"],
    agendada:["#DCE7F0","#1E3556"],
    pago:["#DDEADE","#3D7A4A"],
    pendente:["#F5E5CD","#C97A1F"],
    director:["#EFEBE2","#152741"],
    professional:["#DDEADE","#3D7A4A"],
    parent:["#DCE7F0","#1E3556"],
    pending_director:["#F5E5CD","#C97A1F"],
    admin:["#152741","#F7F4EE"],
    default:["#EFEBE2","#3C3C3B"],
    amber:["#F5D9A8","#C97A1F"],
    sage:["#C7DDCB","#3D7A4A"],
  };
  const [bg,c] = m[type] || m.default;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"3px 9px", borderRadius:99,
      fontSize:11.5, fontWeight:500, letterSpacing:0,
      background:bg, color:c, lineHeight:1.4
    }}>{children}</span>
  );
};

const Card = ({children, style, onClick, hover, delay=0, pad=22}) => (
  <div className="ch fu" onClick={onClick} style={{
    background:"#FBF9F4",
    borderRadius:14,
    padding:pad,
    border:"1px solid #E5E0D4",
    cursor:onClick?"pointer":"default",
    animationDelay:`${delay}ms`,
    transition:"border-color .15s ease, box-shadow .15s ease, transform .12s ease",
    ...(onClick?{":hover":{borderColor:"#152741"}}:{}),
    ...style
  }}
  onMouseEnter={onClick?(e)=>{e.currentTarget.style.borderColor="#152741";e.currentTarget.style.boxShadow="0 4px 14px rgba(21,39,65,.06)";}:undefined}
  onMouseLeave={onClick?(e)=>{e.currentTarget.style.borderColor="#E5E0D4";e.currentTarget.style.boxShadow="none";}:undefined}
  >{children}</div>
);

const Stat = ({label, value, suffix, color="#152741", bg="#FBF9F4", trend, accent}) => (
  <div style={{
    background:bg, borderRadius:14, padding:"22px 22px 20px",
    border:"1px solid #E5E0D4", flex:1, position:"relative", overflow:"hidden"
  }}>
    {accent && <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent}}/>}
    <Eyebrow>{label}</Eyebrow>
    <div style={{display:"flex", alignItems:"baseline", gap:6, marginTop:10}}>
      <span className="serif" style={{fontSize:36, fontWeight:300, color, lineHeight:1, letterSpacing:"-0.03em"}}>{value}</span>
      {suffix && <span style={{fontFamily:"DM Sans",fontSize:14,color:"#8A8A86",fontWeight:500}}>{suffix}</span>}
    </div>
    {trend && <div style={{fontSize:12,color:"#8A8A86",marginTop:6}}>{trend}</div>}
  </div>
);

const Progress = ({pct, color="#152741", h=6, bg="#EFEBE2"}) => (
  <div style={{height:h, borderRadius:h/2, background:bg, overflow:"hidden"}}>
    <div style={{
      height:"100%", width:`${Math.min(pct,100)}%`,
      borderRadius:h/2, background:color,
      transition:"width .8s cubic-bezier(.4,0,.2,1)"
    }}/>
  </div>
);

const Section = ({eyebrow, title, sub, right}) => (
  <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between", margin:"36px 0 18px", gap:16}}>
    <div style={{flex:1, minWidth:0}}>
      {eyebrow && <div style={{marginBottom:6}}><Eyebrow>{eyebrow}</Eyebrow></div>}
      <div className="serif" style={{fontSize:26, fontWeight:300, color:"#152741", lineHeight:1.1, letterSpacing:"-0.02em"}}>{title}</div>
      {sub && <div style={{fontSize:14, color:"#8A8A86", marginTop:4}}>{sub}</div>}
    </div>
    {right}
  </div>
);

const Empty = ({title, text, icon}) => (
  <Card style={{textAlign:"center", padding:"40px 24px", background:"#FBF9F4"}}>
    {icon && <div style={{marginBottom:12, display:"flex", justifyContent:"center", color:"#B9CDE0"}}>{icon}</div>}
    {title && <div className="serif-it" style={{fontSize:18,color:"#152741",marginBottom:6}}>{title}</div>}
    <div style={{fontSize:13.5, color:"#8A8A86"}}>{text}</div>
  </Card>
);

const Toast = ({msg, type="success"}) => {
  if (!msg) return null;
  const colors = {success:["#152741","#F7F4EE","#8DBF94"], error:["#B83A3A","#F7F4EE","#B83A3A"], info:["#1E3556","#F7F4EE","#B9CDE0"]};
  const [bg,c,bar] = colors[type] || colors.success;
  return (
    <div style={{
      position:"fixed", bottom:32, right:32,
      background:bg, color:c, padding:"14px 22px 14px 18px",
      borderRadius:12, fontSize:14, fontWeight:500,
      zIndex:999, boxShadow:"0 12px 36px rgba(21,39,65,.25)",
      animation:"ti .3s ease", maxWidth:380,
      borderLeft:`3px solid ${bar}`,
      display:"flex", alignItems:"center", gap:10
    }}>{msg}</div>
  );
};

const Btn = ({children, onClick, disabled, variant="primary", size="md", icon, style}) => {
  const variants = {
    primary:{bg:"#152741",c:"#F7F4EE",bd:"#152741",hbg:"#1E3556"},
    secondary:{bg:"#FBF9F4",c:"#152741",bd:"#D9D3C5",hbg:"#F7F4EE"},
    ghost:{bg:"transparent",c:"#152741",bd:"transparent",hbg:"#EFEBE2"},
    accent:{bg:"#E8A13C",c:"#152741",bd:"#E8A13C",hbg:"#D89030"},
    danger:{bg:"#FBF9F4",c:"#B83A3A",bd:"#F4E0E0",hbg:"#F4E0E0"},
  };
  const v = variants[variant] || variants.primary;
  const sizes = {sm:"8px 14px", md:"11px 20px", lg:"14px 26px"};
  const fs = {sm:13, md:14, lg:15};
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={disabled?undefined:onClick}
      disabled={disabled}
      className="ch"
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{
        padding:sizes[size], borderRadius:10,
        border:`1px solid ${v.bd}`,
        background:hover && !disabled ? v.hbg : v.bg,
        color:v.c,
        fontSize:fs[size], fontWeight:500,
        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
        whiteSpace:"nowrap",
        ...style
      }}
    >
      {icon}{children}
    </button>
  );
};

const Field = ({label, hint, children}) => (
  <div style={{marginBottom:16}}>
    <div style={{fontSize:12, color:"#5A5A58", marginBottom:6, fontWeight:500, letterSpacing:0}}>{label}</div>
    {children}
    {hint && <div style={{fontSize:12, color:"#8A8A86", marginTop:5}}>{hint}</div>}
  </div>
);

const Inp = (props) => (
  <input {...props} style={{
    width:"100%", padding:"11px 14px", borderRadius:10,
    border:"1px solid #D9D3C5", fontSize:14,
    background:"#FBF9F4", color:"#3C3C3B",
    transition:"border-color .15s ease, box-shadow .15s ease",
    ...(props.style||{})
  }}/>
);

const Sel = ({value, onChange, options, placeholder}) => (
  <select value={value} onChange={e=>onChange(e.target.value)} style={{
    width:"100%", padding:"11px 14px", borderRadius:10,
    border:"1px solid #D9D3C5", fontSize:14,
    background:"#FBF9F4", color:"#3C3C3B",
    appearance:"none",
    backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8A86' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
    backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center",
    paddingRight:36
  }}>
    <option value="">{placeholder||"Selecionar..."}</option>
    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);

const SearchInput = ({value, onChange, placeholder, style}) => (
  <div style={{position:"relative", ...style}}>
    <div style={{position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#8A8A86", display:"flex"}}>
      <Icon name="search" size={16}/>
    </div>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{
      width:"100%", padding:"10px 14px 10px 40px", borderRadius:10,
      border:"1px solid #D9D3C5", fontSize:14,
      background:"#FBF9F4"
    }}/>
  </div>
);

const Modal = ({open, onClose, title, eyebrow, children, width=520}) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(21,39,65,.4)",
      backdropFilter:"blur(4px)",
      zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      animation:"fu .2s ease both"
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#FBF9F4", borderRadius:18,
        width:"100%", maxWidth:width, maxHeight:"86vh",
        overflowY:"auto", animation:"ti .25s ease both",
        border:"1px solid #E5E0D4",
        boxShadow:"0 24px 64px rgba(21,39,65,.18)"
      }}>
        <div style={{padding:"24px 28px 12px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16}}>
          <div>
            {eyebrow && <div style={{marginBottom:8}}><Eyebrow>{eyebrow}</Eyebrow></div>}
            <div className="serif" style={{fontSize:24, fontWeight:300, color:"#152741", lineHeight:1.15, letterSpacing:"-0.02em"}}>{title}</div>
          </div>
          <button onClick={onClose} style={{padding:6, color:"#8A8A86", borderRadius:8, display:"flex"}} className="ch"><Icon name="x" size={20}/></button>
        </div>
        <div style={{padding:"12px 28px 28px"}}>{children}</div>
      </div>
    </div>
  );
};

/* Decorative hero ellipses — uses brand shape system */
const HeroEllipses = ({opacity=1}) => (
  <svg viewBox="0 0 400 300" style={{position:"absolute",right:-40,top:-20,width:380,height:280,opacity,pointerEvents:"none"}}>
    <circle cx="280" cy="60" r="14" fill="#E8A13C"/>
    <circle cx="285" cy="105" r="26" fill="#8DBF94"/>
    <ellipse cx="245" cy="200" rx="58" ry="38" fill="#152741"/>
    <ellipse cx="310" cy="215" rx="55" ry="34" fill="#B9CDE0"/>
  </svg>
);

Object.assign(window, { Mark, Logo, Eyebrow, Av, Tag, Card, Stat, Progress, Section, Empty, Toast, Btn, Field, Inp, Sel, SearchInput, Modal, HeroEllipses });
