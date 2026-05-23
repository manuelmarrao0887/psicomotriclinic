/* Icon set — DM Sans-friendly, 1.6 stroke, currentColor */
const Icon = ({ name, size = 20, color = "currentColor", strokeWidth = 1.6 }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":      return (<svg {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>);
    case "users":     return (<svg {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21v-1a5.5 5.5 0 0 1 11 0v1"/><circle cx="17" cy="9" r="2.5"/><path d="M22 19v-.5a4 4 0 0 0-6-3.5"/></svg>);
    case "shield":    return (<svg {...p}><path d="M12 21s8-3.5 8-9.5V5l-8-3-8 3v6.5C4 17.5 12 21 12 21z"/></svg>);
    case "calendar":  return (<svg {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>);
    case "clipboard":return (<svg {...p}><rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 15h6M9 19h4"/></svg>);
    case "wallet":    return (<svg {...p}><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/></svg>);
    case "swap":      return (<svg {...p}><path d="M7 16V4m0 0L4 7m3-3l3 3M17 8v12m0 0l3-3m-3 3l-3-3"/></svg>);
    case "cog":       return (<svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
    case "logout":    return (<svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>);
    case "check":     return (<svg {...p}><path d="M5 12l5 5L20 7"/></svg>);
    case "x":         return (<svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case "plus":      return (<svg {...p}><path d="M12 5v14M5 12h14"/></svg>);
    case "search":    return (<svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>);
    case "back":      return (<svg {...p}><path d="M15 18l-6-6 6-6"/></svg>);
    case "arr":       return (<svg {...p}><path d="M9 6l6 6-6 6"/></svg>);
    case "mail":      return (<svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>);
    case "copy":      return (<svg {...p}><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2"/></svg>);
    case "trash":     return (<svg {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>);
    case "bell":      return (<svg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/></svg>);
    case "trend":     return (<svg {...p}><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></svg>);
    case "clock":     return (<svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case "menu":      return (<svg {...p}><path d="M4 6h16M4 12h16M4 18h16"/></svg>);
    case "edit":      return (<svg {...p}><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>);
    case "filter":    return (<svg {...p}><path d="M3 5h18M6 12h12M10 19h4"/></svg>);
    case "google":    return (<svg width={size} height={size} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>);
    case "mark":      return (<svg width={size} height={size} viewBox="0 0 64 64" fill="none"><circle cx="32" cy="14" r="5" fill="#E8A13C"/><circle cx="32" cy="26" r="7.5" fill="#8DBF94"/><ellipse cx="26" cy="44" rx="13" ry="9" fill="#152741"/><ellipse cx="38" cy="46" rx="12" ry="8" fill="#B9CDE0"/></svg>);
    default: return null;
  }
};

window.Icon = Icon;
