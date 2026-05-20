import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// DATOS MAESTROS
// ─────────────────────────────────────────────
const PRODUCTS = [
  "Limpiacristales","Gel WC","Lejia azul banos","Papel Higienico paq","Gel Ducha","Champu",
  "Rec. fregona ud","Bolsa blanca","Palo fregona","Escobilla bano rec","Papel Cocina G",
  "Jabon vajillas","Pastillas lavavajillas","Quitagrasas","Cafe molido","Capsulas Nespresso",
  "Capsulas DG Classic","Filtro cafe","Te","Sal","Azucar","Aceitera","Vinagrera",
  "Estropajo azul ud","Bayetas Cocina","Abrillantador lav","Bolsa gris","Friegasuelos",
  "Detergente Ropa","Suavizante","Lejia Ropa","Bayetas Microfibra ud","Blanqueador perborato",
  "Estropajos Acero","Plumeros caja","Bolsa asp Bosh ud","Bolsa asp Moreria","Bolsa asp Fomento",
  "Guantes TM","Quitapelusa ud","Vinagre limp","Spray mopa","Jabon lagarto ud","Sal lavavajillas",
  "Escobilla bano set","Friegas madera","Trampa cuca ud","Spray cucaracha","Ajax polvo",
  "Pilas AAA ud","Pilas AA ud","Plumero clasico","Recambo cepillo","Bicarbonato"
];

const FREQUENT_APTS = [
  "ALMADEN","CARRETAS","CAVA ALTA","CONCEPCION","COSTANILLA","FOMENTO","IMPERIAL",
  "MAYOR","MONTERA","MORATIN","MORERIA","NAVAS","SAN MIGUEL","TETUAN","TORRECILLA",
  "VIRGEN DE LA PALOMA","SAN BARTOLOME"
];

const INFREQUENT_APTS = [
  "VALENCIA","OLIVAR","INFANTE","ZURBANO","ROBLEDO","MOSTENSES","ANTONIO LOPES","MORENO NIETO"
];

const PROFILES = ["Joaquin","Nanda","Cari","Vanessa"];

const PROFILE_COLORS = {
  "Joaquin": "#36D1DC",
  "Nanda":   "#f59e0b",
  "Cari":    "#ec4899",
  "Vanessa": "#8b5cf6"
};

const PROFILE_INITIALS = {
  "Joaquin": "J",
  "Nanda":   "N",
  "Cari":    "C",
  "Vanessa": "V"
};

// ─────────────────────────────────────────────
// SUPABASE
// ─────────────────────────────────────────────
function getSupabaseClient(url, key) {
  if (!url || !key) return null;
  try { return createClient(url, key); } catch { return null; }
}

function loadCreds() {
  try {
    return {
      url: localStorage.getItem("nuba_sb_url") || process.env.REACT_APP_SUPABASE_URL || "",
      key: localStorage.getItem("nuba_sb_key") || process.env.REACT_APP_SUPABASE_ANON_KEY || ""
    };
  } catch {
    return {
      url: process.env.REACT_APP_SUPABASE_URL || "",
      key: process.env.REACT_APP_SUPABASE_ANON_KEY || ""
    };
  }
}

// ─────────────────────────────────────────────
// ESTILOS GLOBALES
// ─────────────────────────────────────────────
const C = "#36D1DC";
const FONT = "'Nunito', sans-serif";

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f4f6f9; font-family: ${FONT}; }
  input:focus, textarea:focus, select:focus { outline: 2px solid ${C}; outline-offset: 0; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f0f0f0; }
  ::-webkit-scrollbar-thumb { background: #36D1DC55; border-radius: 3px; }
  .card { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .product-row:hover { background: #f8fdfe; }
  .nav-tab { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 4px; border: none; background: none; cursor: pointer; font-family: ${FONT}; color: #aaa; font-size: 11px; font-weight: 600; flex: 1; transition: color 0.2s; }
  .nav-tab.active { color: ${C}; }
  .btn-primary { background: ${C}; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; cursor: pointer; font-family: ${FONT}; font-size: 14px; transition: opacity 0.2s; }
  .btn-primary:hover { opacity: 0.88; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .urgency-btn { border: 2px solid; border-radius: 10px; padding: 12px; cursor: pointer; font-family: ${FONT}; font-weight: 700; font-size: 14px; flex: 1; transition: all 0.2s; }
  .photo-option-btn { flex: 1; padding: 14px 10px; border-radius: 10px; border: 2px solid #e0e0e0; background: white; cursor: pointer; font-family: ${FONT}; font-weight: 700; font-size: 13px; color: #555; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: all 0.2s; }
  .photo-option-btn:hover { border-color: ${C}; color: ${C}; }
  .photo-option-btn.selected { border-color: ${C}; background: #f0fdfe; color: ${C}; }
`;

// ─────────────────────────────────────────────
// ICONOS SVG
// ─────────────────────────────────────────────
const Icon = {
  stock:    (c="#aaa") => <svg width="22" height="22" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  create:   (c="#aaa") => <svg width="22" height="22" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  pending:  (c="#aaa") => <svg width="22" height="22" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  history:  (c="#aaa") => <svg width="22" height="22" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  kpi:      (c="#aaa") => <svg width="22" height="22" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  logout:   (c="#aaa") => <svg width="18" height="18" fill="none" stroke={c} strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search:   ()         => <svg width="16" height="16" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  apt:      ()         => <svg width="16" height="16" fill="none" stroke={C} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  chevDown: ()         => <svg width="16" height="16" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>,
  chevUp:   ()         => <svg width="16" height="16" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>,
  check:    ()         => <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  export:   ()         => <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  camera:   ()         => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  gallery:  ()         => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
};

// ─────────────────────────────────────────────
// HELPER: comprimir imagen antes de guardar
// ─────────────────────────────────────────────
function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────
// PANTALLA CONFIG (SALVAVIDAS)
// ─────────────────────────────────────────────
function ConfigScreen({ onConnect }) {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  function handle() {
    if (!url.trim() || !key.trim()) { setErr("Introduce ambos valores."); return; }
    try {
      localStorage.setItem("nuba_sb_url", url.trim());
      localStorage.setItem("nuba_sb_key", key.trim());
      onConnect(url.trim(), key.trim());
    } catch { setErr("No se pudo guardar."); }
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",fontFamily:FONT}}>
      <div style={{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",border:"1px solid rgba(54,209,220,0.3)",borderRadius:"20px",padding:"2.5rem 2rem",maxWidth:"420px",width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{width:"72px",height:"72px",borderRadius:"16px",background:`linear-gradient(135deg,${C},#5B86E5)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",fontSize:"2rem"}}>🏠</div>
          <h1 style={{color:C,fontSize:"1.5rem",fontWeight:"800"}}>Configuracion NUBA</h1>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.85rem",marginTop:"4px"}}>Gestion Logistica · Apartamentos</p>
        </div>
        {err && <div style={{background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:"8px",padding:"10px",color:"#fca5a5",fontSize:"0.82rem",marginBottom:"1rem",textAlign:"center"}}>{err}</div>}
        <label style={{color:"rgba(255,255,255,0.6)",fontSize:"0.78rem",display:"block",marginBottom:"4px"}}>Supabase URL</label>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://xxxx.supabase.co"
          style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(54,209,220,0.3)",borderRadius:"8px",padding:"10px",color:"white",fontSize:"0.9rem",marginBottom:"1rem"}} />
        <label style={{color:"rgba(255,255,255,0.6)",fontSize:"0.78rem",display:"block",marginBottom:"4px"}}>Anon Key</label>
        <textarea value={key} onChange={e=>setKey(e.target.value)} placeholder="eyJhbGci..." rows={3}
          style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(54,209,220,0.3)",borderRadius:"8px",padding:"10px",color:"white",fontSize:"0.82rem",marginBottom:"1.5rem",fontFamily:"monospace",resize:"vertical"}} />
        <button onClick={handle} className="btn-primary" style={{width:"100%",padding:"12px",fontSize:"1rem"}}>Conectar y Entrar</button>
        <p style={{color:"rgba(255,255,255,0.3)",fontSize:"0.7rem",textAlign:"center",marginTop:"10px"}}>Claves guardadas en localStorage</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function handle() {
    setLoading(true);
    setTimeout(() => {
      if (user === "logistica@nubagestion.es" && pass === "Nuba2026") {
        try { localStorage.setItem("nuba_logged", "1"); } catch {}
        onLogin();
      } else {
        setErr("Usuario o contrasena incorrectos.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",fontFamily:FONT}}>
      <div style={{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(20px)",border:"1px solid rgba(54,209,220,0.3)",borderRadius:"20px",padding:"2.5rem 2rem",maxWidth:"380px",width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{width:"80px",height:"80px",borderRadius:"20px",background:`linear-gradient(135deg,${C},#5B86E5)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",fontSize:"2.5rem"}}>🏠</div>
          <h1 style={{color:"white",fontSize:"1.8rem",fontWeight:"900"}}>NUBA</h1>
          <p style={{color:C,fontSize:"0.9rem",fontWeight:"600"}}>Gestion Logistica</p>
        </div>
        {err && <div style={{background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:"8px",padding:"10px",color:"#fca5a5",fontSize:"0.85rem",marginBottom:"1rem",textAlign:"center"}}>{err}</div>}
        <input type="email" value={user} onChange={e=>setUser(e.target.value)} placeholder="Usuario" onKeyDown={e=>e.key==="Enter"&&handle()}
          style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(54,209,220,0.3)",borderRadius:"8px",padding:"12px",color:"white",fontSize:"0.95rem",marginBottom:"12px"}} />
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Contrasena" onKeyDown={e=>e.key==="Enter"&&handle()}
          style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(54,209,220,0.3)",borderRadius:"8px",padding:"12px",color:"white",fontSize:"0.95rem",marginBottom:"20px"}} />
        <button onClick={handle} disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",fontSize:"1rem"}}>
          {loading ? "Accediendo..." : "Entrar →"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SELECTOR PERFIL
// ─────────────────────────────────────────────
function ProfileSelector({ onSelect }) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",fontFamily:FONT}}>
      <div style={{maxWidth:"420px",width:"100%",textAlign:"center"}}>
        <h2 style={{color:"white",fontSize:"1.5rem",fontWeight:"800",marginBottom:"6px"}}>Quien eres hoy?</h2>
        <p style={{color:"rgba(255,255,255,0.4)",fontSize:"0.9rem",marginBottom:"2rem"}}>Selecciona tu perfil para continuar</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
          {PROFILES.map(p => (
            <button key={p} onClick={()=>{ try{localStorage.setItem("nuba_profile",p);}catch{} onSelect(p); }}
              style={{background:"rgba(255,255,255,0.06)",border:`2px solid ${PROFILE_COLORS[p]}44`,borderRadius:"16px",padding:"1.5rem 1rem",cursor:"pointer",color:"white",fontWeight:"700",fontSize:"1.1rem",fontFamily:FONT,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${PROFILE_COLORS[p]}22`;e.currentTarget.style.borderColor=PROFILE_COLORS[p];}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.borderColor=`${PROFILE_COLORS[p]}44`;}}>
              <div style={{fontSize:"2.2rem",marginBottom:"8px"}}>{p==="Joaquin"?"👨‍💼":p==="Nanda"?"👩‍💼":p==="Cari"?"👩‍🔧":"👩‍💻"}</div>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 1: STOCK
// ─────────────────────────────────────────────
function StockTab({ supabase }) {
  const [view, setView] = useState("trastero");
  const [trastero, setTrastero] = useState({});
  const [aptStock, setAptStock] = useState({});
  const [selectedApt, setSelectedApt] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState({});
  const [loadingApt, setLoadingApt] = useState(false);

  useEffect(() => { fetchTrastero(); }, []);

  async function fetchTrastero() {
    const { data } = await supabase.from("trastero").select("*");
    if (data) { const m={}; data.forEach(r=>m[r.producto]=r.cantidad); setTrastero(m); }
  }

  async function fetchApt(apt) {
    setLoadingApt(true);
    const { data } = await supabase.from("stock_apartamentos").select("*").eq("apartamento", apt);
    if (data) { const m={}; data.forEach(r=>m[r.producto]=r.cantidad); setAptStock(m); }
    setLoadingApt(false);
  }

  async function adjustStock(product, delta, isApt) {
    const key = `${isApt?selectedApt:"t"}_${product}`;
    setSaving(p=>({...p,[key]:true}));
    if (!isApt) {
      const nv = Math.max(0, (trastero[product]??0) + delta);
      await supabase.from("trastero").upsert({producto:product,cantidad:nv},{onConflict:"producto"});
      setTrastero(p=>({...p,[product]:nv}));
    } else {
      const nv = Math.max(0, (aptStock[product]??0) + delta);
      await supabase.from("stock_apartamentos").upsert({apartamento:selectedApt,producto:product,cantidad:nv},{onConflict:"apartamento,producto"});
      setAptStock(p=>({...p,[product]:nv}));
    }
    setSaving(p=>({...p,[key]:false}));
  }

  const filtered = PRODUCTS.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const totalTrastero = Object.values(trastero).reduce((a,b)=>a+(b||0),0);
  const lowStock = Object.values(trastero).filter(v=>(v||0)<5).length;
  const totalApt = Object.values(aptStock).reduce((a,b)=>a+(b||0),0);

  function ProductRow({ product, qty, onPlus, onMinus, isApt }) {
    const [localQty, setLocalQty] = useState(qty);
    useEffect(()=>setLocalQty(qty),[qty]);

    async function handleInput(val) {
      const n = parseInt(val)||0;
      setLocalQty(n);
      if (!isApt) {
        await supabase.from("trastero").upsert({producto:product,cantidad:n},{onConflict:"producto"});
        setTrastero(p=>({...p,[product]:n}));
      } else {
        await supabase.from("stock_apartamentos").upsert({apartamento:selectedApt,producto:product,cantidad:n},{onConflict:"apartamento,producto"});
        setAptStock(p=>({...p,[product]:n}));
      }
    }

    return (
      <div className="product-row" style={{display:"flex",alignItems:"center",padding:"10px 16px",borderBottom:"1px solid #f0f0f0",gap:"10px"}}>
        <span style={{flex:1,fontSize:"14px",color:"#333",fontWeight:"600"}}>{product}</span>
        <button onClick={onMinus} style={{width:"32px",height:"32px",borderRadius:"50%",border:"1px solid #e0e0e0",background:"white",cursor:"pointer",fontSize:"18px",color:"#666",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
        <input type="number" min="0" value={localQty}
          onChange={e=>setLocalQty(e.target.value)}
          onBlur={e=>handleInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handleInput(e.target.value)}
          style={{width:"52px",textAlign:"center",border:"1px solid #e0e0e0",borderRadius:"8px",padding:"5px",fontSize:"15px",fontWeight:"700",color:qty===0?"#ccc":qty<3?"#ef4444":"#333",fontFamily:FONT}} />
        <button onClick={onPlus} style={{width:"32px",height:"32px",borderRadius:"50%",border:"none",background:C,cursor:"pointer",fontSize:"18px",color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
      </div>
    );
  }

  return (
    <div style={{paddingBottom:"80px"}}>
      <div style={{display:"flex",background:"white",borderRadius:"12px",padding:"4px",marginBottom:"16px",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
        <button onClick={()=>{setView("trastero");setSearch("");}} style={{flex:1,padding:"9px",borderRadius:"9px",border:"none",background:view==="trastero"?C:"transparent",color:view==="trastero"?"white":"#666",fontWeight:"700",cursor:"pointer",fontFamily:FONT,fontSize:"13px"}}>
          📦 Trastero Central
        </button>
        <button onClick={()=>{setView("apartamentos");setSearch("");setSelectedApt(null);}} style={{flex:1,padding:"9px",borderRadius:"9px",border:"none",background:view==="apartamentos"?C:"transparent",color:view==="apartamentos"?"white":"#666",fontWeight:"700",cursor:"pointer",fontFamily:FONT,fontSize:"13px"}}>
          🏠 Apartamentos
        </button>
      </div>

      {view==="trastero" && (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
            <div className="card" style={{padding:"16px"}}>
              <div style={{fontSize:"12px",color:"#888",fontWeight:"600",marginBottom:"4px"}}>Total Unidades</div>
              <div style={{fontSize:"28px",fontWeight:"900",color:"#222"}}>{totalTrastero.toLocaleString()}</div>
            </div>
            <div className="card" style={{padding:"16px"}}>
              <div style={{fontSize:"12px",color:"#ef4444",fontWeight:"600",marginBottom:"4px"}}>Stock Bajo (&lt;5)</div>
              <div style={{fontSize:"28px",fontWeight:"900",color:"#ef4444"}}>{lowStock}</div>
            </div>
          </div>
          <div className="card" style={{padding:"10px 14px",marginBottom:"12px",display:"flex",alignItems:"center",gap:"8px"}}>
            {Icon.search()}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto..."
              style={{border:"none",outline:"none",flex:1,fontSize:"14px",fontFamily:FONT,color:"#333"}} />
          </div>
          <div className="card">
            {filtered.map(p => (
              <ProductRow key={p} product={p} qty={trastero[p]??0}
                onPlus={()=>adjustStock(p,1,false)} onMinus={()=>adjustStock(p,-1,false)} isApt={false} />
            ))}
          </div>
        </>
      )}

      {view==="apartamentos" && !selectedApt && (
        <>
          <p style={{color:"#888",fontSize:"13px",marginBottom:"12px"}}>Selecciona un apartamento para ver y editar su stock</p>
          <div className="card" style={{marginBottom:"12px"}}>
            <div style={{padding:"10px 16px",borderBottom:"1px solid #f0f0f0",fontSize:"11px",fontWeight:"700",color:C,textTransform:"uppercase",letterSpacing:"0.5px"}}>Frecuentes</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:"8px",padding:"12px"}}>
              {FREQUENT_APTS.map(a=>(
                <button key={a} onClick={()=>{setSelectedApt(a);fetchApt(a);}}
                  style={{background:"#f8fdfe",border:`1px solid ${C}33`,borderRadius:"8px",padding:"10px 8px",cursor:"pointer",color:"#333",fontWeight:"700",fontSize:"12px",fontFamily:FONT,textAlign:"center"}}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{padding:"10px 16px",borderBottom:"1px solid #f0f0f0",fontSize:"11px",fontWeight:"700",color:"#aaa",textTransform:"uppercase",letterSpacing:"0.5px"}}>Infrecuentes</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:"8px",padding:"12px"}}>
              {INFREQUENT_APTS.map(a=>(
                <button key={a} onClick={()=>{setSelectedApt(a);fetchApt(a);}}
                  style={{background:"#fafafa",border:"1px solid #eee",borderRadius:"8px",padding:"10px 8px",cursor:"pointer",color:"#555",fontWeight:"700",fontSize:"12px",fontFamily:FONT,textAlign:"center"}}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {view==="apartamentos" && selectedApt && (
        <>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
            <button onClick={()=>{setSelectedApt(null);setAptStock({});setSearch("");}}
              style={{background:"white",border:"1px solid #e0e0e0",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontSize:"13px",fontWeight:"600",fontFamily:FONT,color:"#555"}}>← Volver</button>
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
              {Icon.apt()}
              <span style={{fontWeight:"800",fontSize:"16px",color:"#222"}}>{selectedApt}</span>
            </div>
          </div>
          <div className="card" style={{padding:"14px 16px",marginBottom:"12px"}}>
            <div style={{fontSize:"12px",color:"#888",fontWeight:"600"}}>Stock en {selectedApt}</div>
            <div style={{fontSize:"24px",fontWeight:"900",color:"#222"}}>{totalApt} unidades</div>
          </div>
          <div className="card" style={{padding:"10px 14px",marginBottom:"12px",display:"flex",alignItems:"center",gap:"8px"}}>
            {Icon.search()}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto..."
              style={{border:"none",outline:"none",flex:1,fontSize:"14px",fontFamily:FONT}} />
          </div>
          {loadingApt ? <div style={{textAlign:"center",padding:"2rem",color:"#aaa"}}>Cargando...</div> : (
            <div className="card">
              {filtered.map(p => (
                <ProductRow key={p} product={p} qty={aptStock[p]??0}
                  onPlus={()=>adjustStock(p,1,true)} onMinus={()=>adjustStock(p,-1,true)} isApt={true} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 2: CREAR PEDIDO (con urgencia)
// ─────────────────────────────────────────────
function CreateTab({ supabase, profile }) {
  const [apt, setApt] = useState("");
  const [urgencia, setUrgencia] = useState("baja"); // "baja" | "alta"
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const filtered = PRODUCTS.filter(p => p.toLowerCase().includes(search.toLowerCase()) && !items.find(i=>i.producto===p));

  function add(p) { setItems(prev=>[...prev,{producto:p,cantidad:1}]); setSearch(""); }
  function remove(p) { setItems(prev=>prev.filter(i=>i.producto!==p)); }
  function setQty(p,v) { setItems(prev=>prev.map(i=>i.producto===p?{...i,cantidad:parseInt(v)||1}:i)); }

  async function submit() {
    if (!apt||items.length===0) return;
    setSaving(true);
    await supabase.from("pedidos").insert({
      apartamento: apt,
      items: JSON.stringify(items),
      estado: "pendiente",
      urgencia: urgencia,
      creado_por: profile,
      creado_at: new Date().toISOString()
    });
    setSaving(false); setDone(true); setApt(""); setItems([]); setUrgencia("baja");
    setTimeout(()=>setDone(false),3000);
  }

  return (
    <div style={{paddingBottom:"80px"}}>
      {done && (
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",padding:"14px",color:"#166534",fontWeight:"700",textAlign:"center",marginBottom:"16px",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
          {Icon.check()} Pedido creado correctamente
        </div>
      )}

      {/* Apartamento */}
      <div className="card" style={{padding:"16px",marginBottom:"12px"}}>
        <label style={{fontSize:"12px",fontWeight:"700",color:"#888",display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Apartamento destino</label>
        <select value={apt} onChange={e=>setApt(e.target.value)}
          style={{width:"100%",border:"1px solid #e0e0e0",borderRadius:"8px",padding:"10px",fontSize:"14px",fontFamily:FONT,color:"#333",background:"white"}}>
          <option value="">— Seleccionar apartamento —</option>
          <optgroup label="Frecuentes">{FREQUENT_APTS.map(a=><option key={a} value={a}>{a}</option>)}</optgroup>
          <optgroup label="Infrecuentes">{INFREQUENT_APTS.map(a=><option key={a} value={a}>{a}</option>)}</optgroup>
        </select>
      </div>

      {/* URGENCIA */}
      <div className="card" style={{padding:"16px",marginBottom:"12px"}}>
        <label style={{fontSize:"12px",fontWeight:"700",color:"#888",display:"block",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Nivel de urgencia</label>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>setUrgencia("baja")} className="urgency-btn"
            style={{borderColor:urgencia==="baja"?"#22c55e":"#e0e0e0",background:urgencia==="baja"?"#f0fdf4":"white",color:urgencia==="baja"?"#16a34a":"#888"}}>
            🟢 Baja urgencia
          </button>
          <button onClick={()=>setUrgencia("alta")} className="urgency-btn"
            style={{borderColor:urgencia==="alta"?"#ef4444":"#e0e0e0",background:urgencia==="alta"?"#fef2f2":"white",color:urgencia==="alta"?"#dc2626":"#888"}}>
            🔴 Alta urgencia
          </button>
        </div>
      </div>

      {/* Productos */}
      <div className="card" style={{padding:"16px",marginBottom:"12px"}}>
        <label style={{fontSize:"12px",fontWeight:"700",color:"#888",display:"block",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Añadir producto</label>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)"}}>{Icon.search()}</div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar y añadir..."
            style={{width:"100%",border:"1px solid #e0e0e0",borderRadius:"8px",padding:"10px 10px 10px 34px",fontSize:"14px",fontFamily:FONT}} />
        </div>
        {search && (
          <div style={{border:"1px solid #e0e0e0",borderRadius:"8px",marginTop:"6px",maxHeight:"200px",overflowY:"auto",background:"white"}}>
            {filtered.slice(0,10).map(p=>(
              <div key={p} onClick={()=>add(p)}
                style={{padding:"10px 14px",cursor:"pointer",fontSize:"14px",color:"#333",borderBottom:"1px solid #f5f5f5"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f8fdfe"}
                onMouseLeave={e=>e.currentTarget.style.background="white"}>
                + {p}
              </div>
            ))}
            {filtered.length===0&&<div style={{padding:"10px 14px",color:"#aaa",fontSize:"13px"}}>Sin resultados</div>}
          </div>
        )}
      </div>

      {items.length>0 && (
        <div className="card" style={{padding:"16px"}}>
          <div style={{fontSize:"12px",fontWeight:"700",color:"#888",marginBottom:"12px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Lineas del pedido ({items.length})</div>
          {items.map(item=>(
            <div key={item.producto} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
              <span style={{flex:1,fontSize:"14px",color:"#333",fontWeight:"600"}}>{item.producto}</span>
              <input type="number" min="1" value={item.cantidad} onChange={e=>setQty(item.producto,e.target.value)}
                style={{width:"60px",border:"1px solid #e0e0e0",borderRadius:"8px",padding:"5px",textAlign:"center",fontSize:"14px",fontFamily:FONT,fontWeight:"700"}} />
              <button onClick={()=>remove(item.producto)}
                style={{background:"#fff0f0",border:"none",borderRadius:"6px",padding:"5px 8px",color:"#ef4444",cursor:"pointer",fontSize:"14px",fontWeight:"700"}}>✕</button>
            </div>
          ))}
          <button onClick={submit} disabled={!apt||saving} className="btn-primary"
            style={{width:"100%",marginTop:"16px",padding:"13px",fontSize:"15px",background:urgencia==="alta"?"#ef4444":C}}>
            {saving?"Enviando...":urgencia==="alta"?"🔴 Crear Pedido URGENTE →":"🟢 Crear Pedido →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE: SELECTOR DE FOTO (camara + galeria)
// ─────────────────────────────────────────────
function PhotoSelector({ onPhoto, preview }) {
  const cameraRef = React.useRef(null);
  const galleryRef = React.useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    onPhoto(compressed);
  }

  return (
    <div>
      <div style={{fontSize:"11px",fontWeight:"700",color:"#888",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Foto de evidencia (opcional)</div>
      {!preview ? (
        <div style={{display:"flex",gap:"10px"}}>
          {/* CAMARA */}
          <button onClick={()=>cameraRef.current.click()} className="photo-option-btn">
            {Icon.camera()}
            <span>Camara</span>
          </button>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            onChange={handleFile} style={{display:"none"}} />

          {/* GALERIA */}
          <button onClick={()=>galleryRef.current.click()} className="photo-option-btn">
            {Icon.gallery()}
            <span>Galeria</span>
          </button>
          <input ref={galleryRef} type="file" accept="image/*"
            onChange={handleFile} style={{display:"none"}} />
        </div>
      ) : (
        <div style={{position:"relative",display:"inline-block"}}>
          <img src={preview} alt="evidencia" style={{borderRadius:"10px",maxHeight:"160px",maxWidth:"100%",display:"block",border:"2px solid #e0e0e0"}} />
          <button onClick={()=>onPhoto(null)}
            style={{position:"absolute",top:"6px",right:"6px",background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",width:"24px",height:"24px",color:"white",cursor:"pointer",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 3: PEDIDOS PENDIENTES
// ─────────────────────────────────────────────
function PendingTab({ supabase, profile }) {
  const [pedidos, setPedidos] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState({});
  const [delivering, setDelivering] = useState(null);
  const [confirmQty, setConfirmQty] = useState({});
  const [assignedTo, setAssignedTo] = useState({});

  useEffect(()=>{ fetchPedidos(); },[]);

  async function fetchPedidos() {
    setLoading(true);
    const { data } = await supabase.from("pedidos").select("*").eq("estado","pendiente").order("creado_at",{ascending:false});
    if (data) setPedidos(data);
    setLoading(false);
  }

  async function entregar(pedido) {
    setDelivering(pedido.id);
    const items = JSON.parse(pedido.items||"[]");
    const quien = assignedTo[pedido.id]||profile;
    const now = new Date().toISOString();
    const foto = photos[pedido.id]||null;

    for (const item of items) {
      const qty = parseInt(confirmQty[`${pedido.id}_${item.producto}`]??item.cantidad);
      const {data:tr} = await supabase.from("trastero").select("cantidad").eq("producto",item.producto).single();
      await supabase.from("trastero").upsert({producto:item.producto,cantidad:Math.max(0,(tr?.cantidad??0)-qty)},{onConflict:"producto"});
      const {data:ap} = await supabase.from("stock_apartamentos").select("cantidad").eq("apartamento",pedido.apartamento).eq("producto",item.producto).single();
      await supabase.from("stock_apartamentos").upsert({apartamento:pedido.apartamento,producto:item.producto,cantidad:(ap?.cantidad??0)+qty},{onConflict:"apartamento,producto"});
    }

    await supabase.from("pedidos").update({
      estado: "entregado",
      entregado_por: quien,
      entregado_at: now,
      foto_evidencia: foto
    }).eq("id", pedido.id);

    setDelivering(null);
    setPedidos(p=>p.filter(x=>x.id!==pedido.id));
    setExpanded(null);
  }

  // Separar por urgencia: alta primero
  const alta = pedidos.filter(p=>p.urgencia==="alta");
  const baja = pedidos.filter(p=>p.urgencia!=="alta");
  const ordenados = [...alta, ...baja];

  if (loading) return <div style={{textAlign:"center",padding:"3rem",color:"#aaa"}}>Cargando...</div>;
  if (pedidos.length===0) return (
    <div style={{textAlign:"center",padding:"3rem"}}>
      <div style={{fontSize:"3rem",marginBottom:"12px"}}>✅</div>
      <p style={{color:"#888",fontWeight:"600",marginBottom:"12px"}}>No hay pedidos pendientes</p>
      <button onClick={fetchPedidos} style={{background:"white",border:"1px solid #e0e0e0",borderRadius:"8px",padding:"8px 16px",cursor:"pointer",fontFamily:FONT,fontWeight:"600",color:"#555"}}>↻ Actualizar</button>
    </div>
  );

  return (
    <div style={{paddingBottom:"80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <span style={{color:"#888",fontSize:"13px",fontWeight:"600"}}>{pedidos.length} pendiente{pedidos.length!==1?"s":""}</span>
          {alta.length>0 && <span style={{background:"#fef2f2",color:"#dc2626",fontSize:"11px",fontWeight:"700",padding:"2px 8px",borderRadius:"20px",border:"1px solid #fecaca"}}>🔴 {alta.length} urgente{alta.length!==1?"s":""}</span>}
        </div>
        <button onClick={fetchPedidos} style={{background:"white",border:"1px solid #e0e0e0",borderRadius:"8px",padding:"6px 12px",cursor:"pointer",fontFamily:FONT,fontSize:"12px",fontWeight:"600",color:"#555"}}>↻ Actualizar</button>
      </div>

      {ordenados.map(p=>{
        const items = JSON.parse(p.items||"[]");
        const isOpen = expanded===p.id;
        const esUrgente = p.urgencia==="alta";
        const fecha = new Date(p.creado_at).toLocaleDateString("es-ES",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});

        return (
          <div key={p.id} className="card" style={{marginBottom:"10px",overflow:"hidden",border:esUrgente?"2px solid #fecaca":"2px solid transparent"}}>
            <div onClick={()=>setExpanded(isOpen?null:p.id)} style={{padding:"14px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                  <span style={{fontWeight:"800",fontSize:"15px",color:"#222"}}>{p.apartamento}</span>
                  {esUrgente
                    ? <span style={{background:"#fef2f2",color:"#dc2626",fontSize:"11px",fontWeight:"700",padding:"2px 8px",borderRadius:"20px",border:"1px solid #fecaca"}}>🔴 URGENTE</span>
                    : <span style={{background:"#f0fdf4",color:"#16a34a",fontSize:"11px",fontWeight:"700",padding:"2px 8px",borderRadius:"20px",border:"1px solid #bbf7d0"}}>🟢 Normal</span>
                  }
                  <span style={{background:"#fff3cd",color:"#856404",fontSize:"11px",fontWeight:"700",padding:"2px 8px",borderRadius:"20px"}}>pendiente</span>
                </div>
                <div style={{fontSize:"12px",color:"#aaa",marginTop:"3px"}}>{fecha} · {items.length} producto{items.length!==1?"s":""} · por {p.creado_por}</div>
              </div>
              {isOpen?Icon.chevUp():Icon.chevDown()}
            </div>

            {isOpen && (
              <div onClick={e=>e.stopPropagation()} style={{borderTop:"1px solid #f0f0f0",padding:"14px 16px"}}>
                {/* Asignar */}
                <div style={{marginBottom:"14px"}}>
                  <div style={{fontSize:"11px",fontWeight:"700",color:"#888",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Asignar entrega a</div>
                  <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                    {PROFILES.map(pr=>(
                      <button key={pr} onClick={()=>setAssignedTo(prev=>({...prev,[p.id]:pr}))}
                        style={{padding:"6px 14px",borderRadius:"20px",border:`2px solid ${(assignedTo[p.id]||profile)===pr?PROFILE_COLORS[pr]:"#e0e0e0"}`,background:(assignedTo[p.id]||profile)===pr?`${PROFILE_COLORS[pr]}18`:"white",color:(assignedTo[p.id]||profile)===pr?PROFILE_COLORS[pr]:"#888",fontWeight:"700",cursor:"pointer",fontSize:"13px",fontFamily:FONT}}>
                        {pr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"14px"}}>
                  <thead><tr>
                    <th style={{textAlign:"left",fontSize:"11px",color:"#888",padding:"6px 0",fontWeight:"700",textTransform:"uppercase"}}>Producto</th>
                    <th style={{textAlign:"center",fontSize:"11px",color:"#888",padding:"6px 0",fontWeight:"700",textTransform:"uppercase"}}>Pedido</th>
                    <th style={{textAlign:"center",fontSize:"11px",color:"#888",padding:"6px 0",fontWeight:"700",textTransform:"uppercase"}}>Confirmar</th>
                  </tr></thead>
                  <tbody>
                    {items.map(item=>(
                      <tr key={item.producto} style={{borderBottom:"1px solid #f5f5f5"}}>
                        <td style={{padding:"8px 0",fontSize:"13px",color:"#333"}}>{item.producto}</td>
                        <td style={{textAlign:"center",color:"#aaa",fontSize:"13px"}}>{item.cantidad}</td>
                        <td style={{textAlign:"center"}}>
                          <input type="number" min="0" defaultValue={item.cantidad}
                            onChange={e=>setConfirmQty(prev=>({...prev,[`${p.id}_${item.producto}`]:e.target.value}))}
                            style={{width:"60px",border:"1px solid #e0e0e0",borderRadius:"6px",padding:"4px",textAlign:"center",fontSize:"13px",fontFamily:FONT,fontWeight:"700"}} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Foto con selector camara/galeria */}
                <div style={{marginBottom:"14px"}}>
                  <PhotoSelector
                    onPhoto={img=>setPhotos(prev=>({...prev,[p.id]:img}))}
                    preview={photos[p.id]||null}
                  />
                </div>

                <button onClick={()=>entregar(p)} disabled={delivering===p.id}
                  style={{width:"100%",background:esUrgente?"#ef4444":"#22c55e",border:"none",borderRadius:"10px",padding:"13px",color:"white",fontWeight:"700",fontSize:"15px",cursor:"pointer",fontFamily:FONT,opacity:delivering===p.id?0.6:1}}>
                  {delivering===p.id?"Procesando...":"✅ Marcar como Entregado"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 4: HISTORIAL (con fotos)
// ─────────────────────────────────────────────
function HistorialTab({ supabase }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(()=>{ fetchHistorial(); },[]);

  async function fetchHistorial() {
    setLoading(true);
    const { data } = await supabase.from("pedidos").select("*").eq("estado","entregado").order("entregado_at",{ascending:false});
    if (data) setPedidos(data);
    setLoading(false);
  }

  if (loading) return <div style={{textAlign:"center",padding:"3rem",color:"#aaa"}}>Cargando historial...</div>;
  if (pedidos.length===0) return (
    <div style={{textAlign:"center",padding:"3rem"}}>
      <div style={{fontSize:"3rem",marginBottom:"12px"}}>📋</div>
      <p style={{color:"#888",fontWeight:"600"}}>No hay entregas completadas aun</p>
    </div>
  );

  return (
    <div style={{paddingBottom:"80px"}}>
      <div style={{color:"#888",fontSize:"13px",fontWeight:"600",marginBottom:"12px"}}>{pedidos.length} entrega{pedidos.length!==1?"s":""} completada{pedidos.length!==1?"s":""}</div>
      {pedidos.map(p=>{
        const items = JSON.parse(p.items||"[]");
        const isOpen = expanded===p.id;
        const fechaEntrega = p.entregado_at ? new Date(p.entregado_at).toLocaleDateString("es-ES",{weekday:"short",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
        const prColor = PROFILE_COLORS[p.entregado_por]||C;
        const esUrgente = p.urgencia==="alta";

        return (
          <div key={p.id} className="card" style={{marginBottom:"10px",overflow:"hidden"}}>
            <div onClick={()=>setExpanded(isOpen?null:p.id)} style={{padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"#f0fdf4",border:"2px solid #86efac",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {Icon.check()}
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                  <span style={{fontWeight:"800",fontSize:"15px",color:"#222"}}>{p.apartamento}</span>
                  <span style={{background:"#f0fdf4",color:"#166534",fontSize:"11px",fontWeight:"700",padding:"2px 8px",borderRadius:"20px"}}>entregado</span>
                  {esUrgente && <span style={{background:"#fef2f2",color:"#dc2626",fontSize:"11px",fontWeight:"700",padding:"2px 8px",borderRadius:"20px"}}>🔴 urgente</span>}
                  {p.foto_evidencia && <span style={{background:"#f0f9ff",color:"#0369a1",fontSize:"11px",fontWeight:"700",padding:"2px 8px",borderRadius:"20px"}}>📷 foto</span>}
                </div>
                <div style={{fontSize:"12px",color:"#aaa",marginTop:"3px"}}>{fechaEntrega}</div>
              </div>
              {isOpen?Icon.chevUp():Icon.chevDown()}
            </div>

            {isOpen && (
              <div style={{borderTop:"1px solid #f0f0f0",padding:"14px 16px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"14px"}}>
                  <div style={{background:"#f9f9f9",borderRadius:"8px",padding:"10px"}}>
                    <div style={{fontSize:"11px",color:"#aaa",fontWeight:"600",marginBottom:"3px"}}>Solicitado por</div>
                    <div style={{fontSize:"14px",fontWeight:"700",color:"#333"}}>{p.creado_por||"—"}</div>
                  </div>
                  <div style={{background:"#f9f9f9",borderRadius:"8px",padding:"10px"}}>
                    <div style={{fontSize:"11px",color:"#aaa",fontWeight:"600",marginBottom:"3px"}}>Entregado por</div>
                    <div style={{fontSize:"14px",fontWeight:"700",color:prColor}}>{p.entregado_por||"—"}</div>
                  </div>
                </div>

                {p.creado_at && (
                  <div style={{fontSize:"12px",color:"#aaa",marginBottom:"12px"}}>
                    📅 Creado: {new Date(p.creado_at).toLocaleDateString("es-ES",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
                    {p.entregado_at && <><br/>✅ Entregado: {new Date(p.entregado_at).toLocaleDateString("es-ES",{weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</>}
                  </div>
                )}

                <div style={{fontSize:"11px",fontWeight:"700",color:"#888",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Productos entregados</div>
                {items.map(item=>(
                  <div key={item.producto} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f5f5f5",fontSize:"13px"}}>
                    <span style={{color:"#333",fontWeight:"600"}}>{item.producto}</span>
                    <span style={{color:"#888",fontWeight:"700"}}>x{item.cantidad}</span>
                  </div>
                ))}

                {/* FOTO DE EVIDENCIA */}
                {p.foto_evidencia && (
                  <div style={{marginTop:"14px"}}>
                    <div style={{fontSize:"11px",fontWeight:"700",color:"#888",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Evidencia fotografica ({items.length > 0 ? items.length : 1})</div>
                    <img src={p.foto_evidencia} alt="evidencia"
                      style={{borderRadius:"10px",maxWidth:"100%",maxHeight:"300px",display:"block",border:"2px solid #e0e0e0",cursor:"pointer"}}
                      onClick={()=>window.open(p.foto_evidencia,"_blank")}
                    />
                    <p style={{fontSize:"11px",color:"#aaa",marginTop:"6px"}}>Toca la foto para verla a tamano completo</p>
                  </div>
                )}
                {!p.foto_evidencia && (
                  <div style={{marginTop:"14px",padding:"12px",background:"#f9f9f9",borderRadius:"8px",textAlign:"center",color:"#bbb",fontSize:"13px"}}>
                    Sin foto de evidencia
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 5: KPIs
// ─────────────────────────────────────────────
function KPITab({ supabase }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("semana");

  useEffect(()=>{ fetchAll(); },[]);

  async function fetchAll() {
    setLoading(true);
    const { data } = await supabase.from("pedidos").select("*").eq("estado","entregado");
    if (data) setPedidos(data);
    setLoading(false);
  }

  function filterByPeriod(list) {
    const now = new Date();
    return list.filter(p=>{
      if (!p.entregado_at) return false;
      const d = new Date(p.entregado_at);
      if (period==="hoy") return d.toDateString()===now.toDateString();
      if (period==="semana") { const s=new Date(now); s.setDate(now.getDate()-7); return d>=s; }
      if (period==="mes") { const s=new Date(now); s.setDate(now.getDate()-30); return d>=s; }
      return true;
    });
  }

  function avgTime(list) {
    const valid = list.filter(p=>p.creado_at&&p.entregado_at);
    if (!valid.length) return null;
    const avg = valid.reduce((a,p)=>a+(new Date(p.entregado_at)-new Date(p.creado_at)),0)/valid.length;
    const h = Math.floor(avg/3600000);
    const m = Math.floor((avg%3600000)/60000);
    return `${h}h ${m}m`;
  }

  function exportCSV() {
    const rows = [["Apartamento","Urgencia","Creado por","Entregado por","Fecha creacion","Fecha entrega","Productos"]];
    filtered.forEach(p=>{
      const items = JSON.parse(p.items||"[]").map(i=>`${i.producto}(${i.cantidad})`).join("; ");
      rows.push([p.apartamento,p.urgencia||"baja",p.creado_por||"",p.entregado_por||"",p.creado_at||"",p.entregado_at||"",items]);
    });
    const csv = rows.map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="nuba_kpis.csv"; a.click();
  }

  const filtered = filterByPeriod(pedidos);
  const avg = avgTime(filtered);
  const byProfile = PROFILES.map(pr=>{
    const mine = filtered.filter(p=>p.entregado_por===pr);
    const hoy = pedidos.filter(p=>p.entregado_por===pr&&p.entregado_at&&new Date(p.entregado_at).toDateString()===new Date().toDateString());
    return { name:pr, total:mine.length, hoy:hoy.length, avg:avgTime(mine) };
  });
  const topPerformer = byProfile.reduce((a,b)=>b.total>a.total?b:a,byProfile[0]);

  if (loading) return <div style={{textAlign:"center",padding:"3rem",color:"#aaa"}}>Cargando KPIs...</div>;

  return (
    <div style={{paddingBottom:"80px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <h2 style={{fontSize:"18px",fontWeight:"800",color:"#222"}}>Panel de KPIs</h2>
        <button onClick={exportCSV} className="btn-primary" style={{display:"flex",alignItems:"center",gap:"6px",padding:"8px 14px",fontSize:"12px"}}>
          {Icon.export()} Exportar CSV
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
        <div className="card" style={{padding:"16px"}}>
          <div style={{fontSize:"12px",color:"#888",fontWeight:"600",marginBottom:"4px"}}>Total Entregas</div>
          <div style={{fontSize:"28px",fontWeight:"900",color:"#222"}}>{filtered.length}</div>
        </div>
        <div className="card" style={{padding:"16px"}}>
          <div style={{fontSize:"12px",color:"#f59e0b",fontWeight:"600",marginBottom:"4px"}}>Urgentes</div>
          <div style={{fontSize:"28px",fontWeight:"900",color:"#dc2626"}}>{filtered.filter(p=>p.urgencia==="alta").length}</div>
        </div>
      </div>

      {avg && (
        <div className="card" style={{padding:"16px",marginBottom:"12px"}}>
          <div style={{fontSize:"12px",color:"#888",fontWeight:"600",marginBottom:"4px"}}>Tiempo Medio de Cumplimiento</div>
          <div style={{fontSize:"24px",fontWeight:"900",color:C}}>{avg}</div>
        </div>
      )}

      {topPerformer && topPerformer.total>0 && (
        <div className="card" style={{padding:"16px",marginBottom:"12px",background:`linear-gradient(135deg,${C}11,${C}22)`,border:`1px solid ${C}33`}}>
          <div style={{fontSize:"11px",color:"#888",fontWeight:"700",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Top Performer</div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"50%",background:C,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"800",fontSize:"16px"}}>
              {PROFILE_INITIALS[topPerformer.name]}
            </div>
            <div>
              <div style={{fontWeight:"800",fontSize:"16px",color:"#222"}}>{topPerformer.name}</div>
              <div style={{fontSize:"12px",color:C,fontWeight:"600"}}>{topPerformer.total} entregas totales</div>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"6px",marginBottom:"16px"}}>
        {["hoy","semana","mes","todo"].map(per=>(
          <button key={per} onClick={()=>setPeriod(per)}
            style={{padding:"9px",border:"none",borderRadius:"8px",background:period===per?C:"white",color:period===per?"white":"#555",fontWeight:"700",cursor:"pointer",fontSize:"12px",fontFamily:FONT,boxShadow:period===per?"none":"0 1px 3px rgba(0,0,0,0.08)"}}>
            {per.charAt(0).toUpperCase()+per.slice(1)}
          </button>
        ))}
      </div>

      <div style={{fontSize:"12px",fontWeight:"700",color:"#888",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Estadisticas por Empleado</div>
      {byProfile.map(pr=>(
        <div key={pr.name} className="card" style={{padding:"16px",marginBottom:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",background:PROFILE_COLORS[pr.name],display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"800",fontSize:"15px"}}>
              {PROFILE_INITIALS[pr.name]}
            </div>
            <div>
              <div style={{fontWeight:"700",fontSize:"15px",color:"#222"}}>{pr.name}</div>
              <div style={{fontSize:"12px",color:"#aaa"}}>{pr.total} pedidos entregados</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
            <div style={{background:"#f9f9f9",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:"900",color:"#222"}}>{pr.hoy}</div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>Hoy</div>
            </div>
            <div style={{background:"#f9f9f9",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:"900",color:"#222"}}>{pr.total}</div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>Periodo</div>
            </div>
            <div style={{background:"#f9f9f9",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
              <div style={{fontSize:"20px",fontWeight:"900",color:"#222"}}>{pedidos.filter(x=>x.entregado_por===pr.name).length}</div>
              <div style={{fontSize:"11px",color:"#aaa",marginTop:"2px"}}>Total</div>
            </div>
          </div>
          {pr.avg&&<div style={{fontSize:"12px",color:"#888",marginTop:"10px"}}>⏱ Tiempo medio: <strong style={{color:"#333"}}>{pr.avg}</strong></div>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────
export default function App() {
  const [sbCreds, setSbCreds] = useState(() => loadCreds());
  const supabase = sbCreds.url && sbCreds.key ? getSupabaseClient(sbCreds.url, sbCreds.key) : null;

  const [loggedIn, setLoggedIn] = useState(() => {
    try { return localStorage.getItem("nuba_logged")==="1"; } catch { return false; }
  });
  const [profile, setProfile] = useState(() => {
    try { return localStorage.getItem("nuba_profile")||null; } catch { return null; }
  });
  const [tab, setTab] = useState(0);

  if (!supabase) return <ConfigScreen onConnect={(u,k)=>setSbCreds({url:u,key:k})} />;
  if (!loggedIn) return <LoginScreen onLogin={()=>setLoggedIn(true)} />;
  if (!profile) return <ProfileSelector onSelect={p=>setProfile(p)} />;

  const pc = PROFILE_COLORS[profile]||C;

  const tabs = [
    { label:"Stock",      icon:(c)=>Icon.stock(c) },
    { label:"Crear",      icon:(c)=>Icon.create(c) },
    { label:"Pendientes", icon:(c)=>Icon.pending(c) },
    { label:"Historial",  icon:(c)=>Icon.history(c) },
    { label:"KPIs",       icon:(c)=>Icon.kpi(c) },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#f4f6f9",fontFamily:FONT,maxWidth:"600px",margin:"0 auto",position:"relative"}}>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* TOP BAR */}
      <div style={{background:"white",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{width:"32px",height:"32px",borderRadius:"50%",background:`linear-gradient(135deg,${C},#5B86E5)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:"16px"}}>🏠</span>
          </div>
          <div>
            <div style={{fontWeight:"900",fontSize:"15px",color:"#222",lineHeight:1}}>NUBA</div>
            <div style={{fontSize:"10px",color:"#aaa",fontWeight:"600"}}>Apartamentos</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"50%",background:pc,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"800",fontSize:"12px"}}>
              {PROFILE_INITIALS[profile]}
            </div>
            <span style={{fontWeight:"700",fontSize:"14px",color:"#333"}}>{profile}</span>
          </div>
          <button onClick={()=>{try{localStorage.removeItem("nuba_profile");}catch{}setProfile(null);}}
            style={{background:"none",border:"1px solid #e0e0e0",borderRadius:"8px",padding:"5px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}>
            {Icon.logout("#aaa")}
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{padding:"16px"}}>
        {tab===0 && <StockTab supabase={supabase} />}
        {tab===1 && <CreateTab supabase={supabase} profile={profile} />}
        {tab===2 && <PendingTab supabase={supabase} profile={profile} />}
        {tab===3 && <HistorialTab supabase={supabase} />}
        {tab===4 && <KPITab supabase={supabase} />}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"600px",background:"white",borderTop:"1px solid #f0f0f0",display:"flex",zIndex:100,boxShadow:"0 -2px 10px rgba(0,0,0,0.06)"}}>
        {tabs.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} className={`nav-tab${tab===i?" active":""}`}>
            {t.icon(tab===i?C:"#aaa")}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Necesario para PhotoSelector
import React from "react";
