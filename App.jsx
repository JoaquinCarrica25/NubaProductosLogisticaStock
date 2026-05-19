import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// DATOS MAESTROS
// ─────────────────────────────────────────────
const PRODUCTS = [
  "Limpiacristales","Gel WC","Lejía azul baños","Papel Higiénico paq","Gel Ducha","Champú",
  "Rec. fregona ud","Bolsa blanca","Palo fregona","Escobilla baño rec","Papel Cocina G",
  "Jabón vajillas","Pastillas lavavajillas","Quitagrasas","Café molido","Cápsulas Nespresso",
  "Cápsulas DG Classic","Filtro café","Té","Sal","Azúcar","Aceitera","Vinagrera",
  "Estropajo azul ud","Bayetas Cocina","Abrillantador lav","Bolsa gris","Friegasuelos",
  "Detergente Ropa","Suavizante","Lejía Ropa","Bayetas Microfibra ud","Blanqueador perborato",
  "Estropajos Acero","Plumeros caja","Bolsa asp Bosh ud","Bolsa asp (Moreria)","Bolsa asp (Fomento)",
  "Guantes T/M","Quitapelusa ud","Vinagre limp","Spray mopa","Jabón lagarto ud","Sal lavavajillas",
  "Escobilla baño set","Friegas. madera","Trampa cuca ud","Spray cucaracha","Ajax polvo",
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

const ALL_APTS = [...FREQUENT_APTS, ...INFREQUENT_APTS];

const PROFILES = ["Joaquín","Nanda","Cari","Vanessa"];

const PROFILE_COLORS = {
  "Joaquín": "#36D1DC",
  "Nanda": "#f59e0b",
  "Cari": "#ec4899",
  "Vanessa": "#8b5cf6"
};

// ─────────────────────────────────────────────
// SUPABASE INIT CON SALVAVIDAS
// ─────────────────────────────────────────────
function getSupabaseClient(url, key) {
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

function loadFromLocalStorage() {
  try {
    return {
      url: localStorage.getItem("nuba_sb_url") || "",
      key: localStorage.getItem("nuba_sb_key") || "",
    };
  } catch {
    return { url: "", key: "" };
  }
}

// ─────────────────────────────────────────────
// PANTALLA CONFIGURACIÓN INICIAL (SALVAVIDAS)
// ─────────────────────────────────────────────
function ConfigScreen({ onConnect }) {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  function handleConnect() {
    if (!url.trim() || !key.trim()) {
      setError("Por favor, introduce ambos valores.");
      return;
    }
    try {
      localStorage.setItem("nuba_sb_url", url.trim());
      localStorage.setItem("nuba_sb_key", key.trim());
      onConnect(url.trim(), key.trim());
    } catch {
      setError("No se pudo guardar. Verifica los valores.");
    }
  }

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
      display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", padding:"1rem"
    }}>
      <div style={{
        background:"rgba(255,255,255,0.05)", backdropFilter:"blur(20px)",
        border:"1px solid rgba(54,209,220,0.3)", borderRadius:"1.5rem",
        padding:"2.5rem 2rem", maxWidth:"420px", width:"100%", boxShadow:"0 25px 60px rgba(0,0,0,0.5)"
      }}>
        <div style={{textAlign:"center", marginBottom:"2rem"}}>
          <div style={{
            width:"72px", height:"72px", borderRadius:"1rem",
            background:"linear-gradient(135deg,#36D1DC,#5B86E5)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 1rem", fontSize:"2rem", boxShadow:"0 8px 24px rgba(54,209,220,0.4)"
          }}>🏠</div>
          <h1 style={{color:"#36D1DC", fontSize:"1.6rem", fontWeight:"800", margin:"0 0 0.25rem"}}>
            Configuración Inicial
          </h1>
          <p style={{color:"rgba(255,255,255,0.6)", fontSize:"0.85rem", margin:0}}>
            NUBA Apartamentos · Gestión Logística
          </p>
        </div>

        <p style={{color:"rgba(255,255,255,0.75)", fontSize:"0.85rem", marginBottom:"1.5rem", lineHeight:"1.5", textAlign:"center"}}>
          Las credenciales de Supabase no están disponibles. Introdúcelas manualmente para continuar.
        </p>

        {error && (
          <div style={{
            background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.4)",
            borderRadius:"0.5rem", padding:"0.75rem", color:"#fca5a5",
            fontSize:"0.8rem", marginBottom:"1rem", textAlign:"center"
          }}>{error}</div>
        )}

        <label style={{color:"rgba(255,255,255,0.7)", fontSize:"0.8rem", display:"block", marginBottom:"0.4rem"}}>
          Supabase URL
        </label>
        <input
          value={url} onChange={e=>setUrl(e.target.value)}
          placeholder="https://xxxx.supabase.co"
          style={{
            width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(54,209,220,0.3)",
            borderRadius:"0.6rem", padding:"0.75rem", color:"white", fontSize:"0.9rem",
            marginBottom:"1rem", outline:"none", boxSizing:"border-box"
          }}
        />

        <label style={{color:"rgba(255,255,255,0.7)", fontSize:"0.8rem", display:"block", marginBottom:"0.4rem"}}>
          Supabase Anon Key
        </label>
        <textarea
          value={key} onChange={e=>setKey(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsIn..."
          rows={3}
          style={{
            width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(54,209,220,0.3)",
            borderRadius:"0.6rem", padding:"0.75rem", color:"white", fontSize:"0.85rem",
            marginBottom:"1.5rem", outline:"none", resize:"vertical", boxSizing:"border-box",
            fontFamily:"monospace"
          }}
        />

        <button
          onClick={handleConnect}
          style={{
            width:"100%", background:"linear-gradient(135deg,#36D1DC,#5B86E5)",
            border:"none", borderRadius:"0.75rem", padding:"0.9rem",
            color:"white", fontWeight:"800", fontSize:"1rem", cursor:"pointer",
            boxShadow:"0 8px 24px rgba(54,209,220,0.4)"
          }}
        >
          🔗 Conectar y Entrar
        </button>

        <p style={{color:"rgba(255,255,255,0.35)", fontSize:"0.72rem", textAlign:"center", marginTop:"1rem"}}>
          Las claves se guardan en localStorage de este dispositivo
        </p>
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setLoading(true);
    setTimeout(() => {
      if (user === "logistica@nubagestion.es" && pass === "Nuba2026") {
        onLogin();
      } else {
        setError("Credenciales incorrectas.");
        setLoading(false);
      }
    }, 500);
  }

  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
      display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", padding:"1rem"
    }}>
      <div style={{
        background:"rgba(255,255,255,0.05)", backdropFilter:"blur(20px)",
        border:"1px solid rgba(54,209,220,0.3)", borderRadius:"1.5rem",
        padding:"2.5rem 2rem", maxWidth:"400px", width:"100%", boxShadow:"0 25px 60px rgba(0,0,0,0.5)"
      }}>
        <div style={{textAlign:"center", marginBottom:"2rem"}}>
          <div style={{
            width:"80px", height:"80px", borderRadius:"1.25rem",
            background:"linear-gradient(135deg,#36D1DC,#5B86E5)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 1rem", fontSize:"2.5rem", boxShadow:"0 8px 24px rgba(54,209,220,0.4)"
          }}>🏠</div>
          <h1 style={{color:"white", fontSize:"1.8rem", fontWeight:"800", margin:"0 0 0.25rem"}}>
            NUBA
          </h1>
          <p style={{color:"#36D1DC", fontSize:"0.9rem", margin:0, fontWeight:"600"}}>
            Gestión Logística
          </p>
        </div>

        {error && (
          <div style={{
            background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.4)",
            borderRadius:"0.5rem", padding:"0.75rem", color:"#fca5a5",
            fontSize:"0.85rem", marginBottom:"1rem", textAlign:"center"
          }}>{error}</div>
        )}

        <input
          type="email" value={user} onChange={e=>setUser(e.target.value)}
          placeholder="Usuario"
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          style={{
            width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(54,209,220,0.3)",
            borderRadius:"0.6rem", padding:"0.85rem", color:"white", fontSize:"0.95rem",
            marginBottom:"1rem", outline:"none", boxSizing:"border-box"
          }}
        />
        <input
          type="password" value={pass} onChange={e=>setPass(e.target.value)}
          placeholder="Contraseña"
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          style={{
            width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(54,209,220,0.3)",
            borderRadius:"0.6rem", padding:"0.85rem", color:"white", fontSize:"0.95rem",
            marginBottom:"1.5rem", outline:"none", boxSizing:"border-box"
          }}
        />

        <button
          onClick={handleLogin} disabled={loading}
          style={{
            width:"100%", background:"linear-gradient(135deg,#36D1DC,#5B86E5)",
            border:"none", borderRadius:"0.75rem", padding:"0.9rem",
            color:"white", fontWeight:"800", fontSize:"1rem", cursor:"pointer",
            opacity:loading?0.7:1, boxShadow:"0 8px 24px rgba(54,209,220,0.4)"
          }}
        >
          {loading ? "Accediendo..." : "Entrar →"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SELECTOR DE PERFIL
// ─────────────────────────────────────────────
function ProfileSelector({ onSelect }) {
  return (
    <div style={{
      minHeight:"100vh", background:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
      display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito',sans-serif", padding:"1rem"
    }}>
      <div style={{textAlign:"center", maxWidth:"480px", width:"100%"}}>
        <h2 style={{color:"white", fontSize:"1.5rem", fontWeight:"800", marginBottom:"0.5rem"}}>
          ¿Quién eres hoy?
        </h2>
        <p style={{color:"rgba(255,255,255,0.5)", fontSize:"0.9rem", marginBottom:"2rem"}}>
          Selecciona tu perfil para continuar
        </p>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem"}}>
          {PROFILES.map(p => (
            <button key={p} onClick={()=>onSelect(p)} style={{
              background:"rgba(255,255,255,0.06)", border:`2px solid ${PROFILE_COLORS[p]}33`,
              borderRadius:"1.25rem", padding:"1.5rem 1rem", cursor:"pointer",
              transition:"all 0.2s", color:"white", fontWeight:"700", fontSize:"1.1rem",
              fontFamily:"'Nunito',sans-serif"
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.background=`${PROFILE_COLORS[p]}22`;
              e.currentTarget.style.borderColor=PROFILE_COLORS[p];
              e.currentTarget.style.transform="scale(1.04)";
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.background="rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor=`${PROFILE_COLORS[p]}33`;
              e.currentTarget.style.transform="scale(1)";
            }}>
              <div style={{fontSize:"2.5rem", marginBottom:"0.5rem"}}>
                {p==="Joaquín"?"👨‍💼":p==="Nanda"?"👩‍💼":p==="Cari"?"👩‍🔧":"👩‍💻"}
              </div>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ESTILOS COMUNES
// ─────────────────────────────────────────────
const S = {
  card: {
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(54,209,220,0.2)",
    borderRadius:"1rem", padding:"1.25rem", marginBottom:"1rem"
  },
  input: {
    background:"rgba(255,255,255,0.08)", border:"1px solid rgba(54,209,220,0.3)",
    borderRadius:"0.6rem", padding:"0.65rem 0.9rem", color:"white", fontSize:"0.9rem",
    outline:"none", width:"100%", boxSizing:"border-box", fontFamily:"'Nunito',sans-serif"
  },
  btn: (color="#36D1DC") => ({
    background:`linear-gradient(135deg,${color},${color}cc)`,
    border:"none", borderRadius:"0.6rem", padding:"0.6rem 1.1rem",
    color:"white", fontWeight:"700", cursor:"pointer", fontSize:"0.85rem",
    fontFamily:"'Nunito',sans-serif"
  }),
  btnSm: {
    background:"rgba(54,209,220,0.2)", border:"1px solid rgba(54,209,220,0.4)",
    borderRadius:"0.4rem", padding:"0.3rem 0.7rem", color:"#36D1DC",
    fontWeight:"700", cursor:"pointer", fontSize:"0.8rem", fontFamily:"'Nunito',sans-serif"
  },
  label: {color:"rgba(255,255,255,0.6)", fontSize:"0.78rem", marginBottom:"0.3rem", display:"block"},
  th: {
    color:"#36D1DC", fontSize:"0.75rem", fontWeight:"700", textTransform:"uppercase",
    padding:"0.6rem 0.75rem", textAlign:"left", borderBottom:"1px solid rgba(54,209,220,0.2)"
  },
  td: {
    padding:"0.65rem 0.75rem", color:"rgba(255,255,255,0.85)", fontSize:"0.875rem",
    borderBottom:"1px solid rgba(255,255,255,0.06)"
  }
};

// ─────────────────────────────────────────────
// TAB 1: TRASTERO BASE
// ─────────────────────────────────────────────
function TrasteroTab({ supabase }) {
  const [stock, setStock] = useState({});
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStock(); }, []);

  async function fetchStock() {
    if (!supabase) return;
    const { data } = await supabase.from("trastero").select("*");
    if (data) {
      const map = {};
      data.forEach(r => { map[r.producto] = r.cantidad; });
      setStock(map);
    }
  }

  const filtered = PRODUCTS.filter(p => p.toLowerCase().includes(search.toLowerCase()));

  async function saveEdit(product) {
    const val = parseInt(editing[product] ?? stock[product] ?? 0);
    setSaving(true);
    await supabase.from("trastero").upsert({ producto: product, cantidad: val }, { onConflict:"producto" });
    setStock(prev => ({ ...prev, [product]: val }));
    setEditing(prev => { const n={...prev}; delete n[product]; return n; });
    setSaving(false);
  }

  return (
    <div>
      <div style={{display:"flex", gap:"0.75rem", marginBottom:"1.25rem", alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Buscar producto..."
          style={{...S.input, flex:1}}
        />
        <span style={{color:"rgba(255,255,255,0.4)", fontSize:"0.8rem", whiteSpace:"nowrap"}}>
          {filtered.length} / {PRODUCTS.length}
        </span>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              <th style={S.th}>Producto</th>
              <th style={{...S.th, textAlign:"center"}}>Stock</th>
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p} style={{background: i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                <td style={{...S.td, color:"rgba(255,255,255,0.3)", fontSize:"0.75rem", width:"2rem"}}>
                  {PRODUCTS.indexOf(p)+1}
                </td>
                <td style={S.td}>{p}</td>
                <td style={{...S.td, textAlign:"center", width:"5rem"}}>
                  <input
                    type="number" min="0"
                    value={editing[p] !== undefined ? editing[p] : (stock[p] ?? 0)}
                    onChange={e => setEditing(prev => ({...prev, [p]: e.target.value}))}
                    style={{
                      ...S.input, width:"70px", textAlign:"center", padding:"0.35rem",
                      color: (stock[p]??0) < 3 ? "#f87171" : "#4ade80"
                    }}
                  />
                </td>
                <td style={{...S.td, width:"5rem"}}>
                  {editing[p] !== undefined && (
                    <button onClick={()=>saveEdit(p)} disabled={saving}
                      style={{...S.btnSm, background:"rgba(74,222,128,0.2)", borderColor:"#4ade80", color:"#4ade80"}}>
                      ✓ OK
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 2: STOCK APARTAMENTOS
// ─────────────────────────────────────────────
function StockAptTab({ supabase }) {
  const [selected, setSelected] = useState(null);
  const [aptStock, setAptStock] = useState({});
  const [loading, setLoading] = useState(false);

  async function selectApt(apt) {
    setSelected(apt);
    setLoading(true);
    const { data } = await supabase.from("stock_apartamentos")
      .select("*").eq("apartamento", apt);
    if (data) {
      const map = {};
      data.forEach(r => { map[r.producto] = r.cantidad; });
      setAptStock(map);
    }
    setLoading(false);
  }

  function AptButton({ apt, freq }) {
    const isSelected = selected === apt;
    return (
      <button onClick={()=>selectApt(apt)} style={{
        background: isSelected ? "linear-gradient(135deg,#36D1DC,#5B86E5)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${isSelected ? "#36D1DC" : freq ? "rgba(54,209,220,0.2)" : "rgba(255,255,255,0.1)"}`,
        borderRadius:"0.6rem", padding:"0.6rem 0.5rem", color:isSelected?"white":"rgba(255,255,255,0.75)",
        fontWeight:isSelected?"700":"600", cursor:"pointer", fontSize:"0.72rem",
        fontFamily:"'Nunito',sans-serif", textAlign:"center", transition:"all 0.15s"
      }}>{apt}</button>
    );
  }

  return (
    <div>
      {!selected ? (
        <div>
          <p style={{color:"rgba(255,255,255,0.5)", fontSize:"0.85rem", marginBottom:"1rem"}}>
            Elige un apartamento para ver su stock asignado
          </p>
          <p style={{color:"#36D1DC", fontSize:"0.78rem", fontWeight:"700", marginBottom:"0.5rem"}}>
            FRECUENTES ({FREQUENT_APTS.length})
          </p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:"0.5rem", marginBottom:"1.25rem"}}>
            {FREQUENT_APTS.map(a => <AptButton key={a} apt={a} freq />)}
          </div>
          <p style={{color:"rgba(255,255,255,0.4)", fontSize:"0.78rem", fontWeight:"700", marginBottom:"0.5rem"}}>
            INFRECUENTES ({INFREQUENT_APTS.length})
          </p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:"0.5rem"}}>
            {INFREQUENT_APTS.map(a => <AptButton key={a} apt={a} />)}
          </div>
        </div>
      ) : (
        <div>
          <div style={{display:"flex", gap:"0.75rem", alignItems:"center", marginBottom:"1.25rem"}}>
            <button onClick={()=>setSelected(null)} style={S.btnSm}>← Volver</button>
            <h3 style={{color:"#36D1DC", fontWeight:"800", fontSize:"1.1rem", margin:0}}>
              🏠 {selected}
            </h3>
          </div>
          {loading ? (
            <p style={{color:"rgba(255,255,255,0.5)"}}>Cargando...</p>
          ) : (
            <table style={{width:"100%", borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th style={S.th}>Producto</th>
                  <th style={{...S.th, textAlign:"center"}}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, i) => (
                  <tr key={p} style={{background: i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                    <td style={S.td}>{p}</td>
                    <td style={{
                      ...S.td, textAlign:"center", fontWeight:"700",
                      color: (aptStock[p]??0)===0 ? "rgba(255,255,255,0.25)" : "#4ade80"
                    }}>
                      {aptStock[p] ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 3: CREAR PEDIDO
// ─────────────────────────────────────────────
function CreateOrderTab({ supabase, profile }) {
  const [apt, setApt] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const filtered = PRODUCTS.filter(p =>
    p.toLowerCase().includes(search.toLowerCase()) && !items.find(i=>i.producto===p)
  );

  function addItem(product) {
    setItems(prev => [...prev, { producto: product, cantidad: 1 }]);
    setSearch("");
  }

  function updateQty(product, val) {
    setItems(prev => prev.map(i => i.producto===product ? {...i, cantidad:parseInt(val)||0} : i));
  }

  function removeItem(product) {
    setItems(prev => prev.filter(i => i.producto!==product));
  }

  async function submit() {
    if (!apt || items.length===0) return;
    setSaving(true);
    const { error } = await supabase.from("pedidos").insert({
      apartamento: apt,
      items: JSON.stringify(items),
      estado: "pendiente",
      creado_por: profile,
      creado_at: new Date().toISOString()
    });
    setSaving(false);
    if (!error) { setDone(true); setApt(""); setItems([]); setTimeout(()=>setDone(false),3000); }
  }

  return (
    <div>
      {done && (
        <div style={{
          background:"rgba(74,222,128,0.2)", border:"1px solid #4ade80",
          borderRadius:"0.75rem", padding:"1rem", color:"#4ade80",
          fontWeight:"700", textAlign:"center", marginBottom:"1rem"
        }}>
          ✅ Pedido creado correctamente
        </div>
      )}

      <div style={S.card}>
        <label style={S.label}>Apartamento destino</label>
        <select value={apt} onChange={e=>setApt(e.target.value)} style={{...S.input}}>
          <option value="">— Seleccionar apartamento —</option>
          <optgroup label="Frecuentes">
            {FREQUENT_APTS.map(a=><option key={a} value={a}>{a}</option>)}
          </optgroup>
          <optgroup label="Infrecuentes">
            {INFREQUENT_APTS.map(a=><option key={a} value={a}>{a}</option>)}
          </optgroup>
        </select>
      </div>

      <div style={S.card}>
        <label style={S.label}>Añadir producto</label>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Buscar y añadir..."
          style={S.input}
        />
        {search && (
          <div style={{
            background:"rgba(0,0,0,0.4)", border:"1px solid rgba(54,209,220,0.2)",
            borderRadius:"0.5rem", marginTop:"0.4rem", maxHeight:"200px", overflowY:"auto"
          }}>
            {filtered.slice(0,12).map(p => (
              <div key={p} onClick={()=>addItem(p)} style={{
                padding:"0.6rem 0.9rem", cursor:"pointer", color:"rgba(255,255,255,0.85)",
                fontSize:"0.875rem", borderBottom:"1px solid rgba(255,255,255,0.05)",
                transition:"background 0.1s"
              }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(54,209,220,0.15)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                + {p}
              </div>
            ))}
            {filtered.length===0 && <div style={{padding:"0.75rem",color:"rgba(255,255,255,0.3)",fontSize:"0.85rem"}}>Sin resultados</div>}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div style={S.card}>
          <p style={{color:"#36D1DC", fontWeight:"700", marginBottom:"0.75rem", fontSize:"0.9rem"}}>
            📦 Líneas del pedido ({items.length})
          </p>
          {items.map(item => (
            <div key={item.producto} style={{
              display:"flex", alignItems:"center", gap:"0.75rem",
              padding:"0.5rem 0", borderBottom:"1px solid rgba(255,255,255,0.06)"
            }}>
              <span style={{flex:1, color:"rgba(255,255,255,0.85)", fontSize:"0.875rem"}}>{item.producto}</span>
              <input type="number" min="1" value={item.cantidad}
                onChange={e=>updateQty(item.producto, e.target.value)}
                style={{...S.input, width:"70px", textAlign:"center", padding:"0.35rem"}}
              />
              <button onClick={()=>removeItem(item.producto)}
                style={{...S.btnSm, color:"#f87171", borderColor:"#f87171", background:"rgba(248,113,113,0.1)"}}>
                ✕
              </button>
            </div>
          ))}
          <button onClick={submit} disabled={!apt||saving} style={{
            ...S.btn(), marginTop:"1rem", width:"100%", padding:"0.85rem",
            opacity:(!apt||saving)?0.5:1
          }}>
            {saving ? "Enviando..." : "🚀 Crear Pedido"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 4: PEDIDOS PENDIENTES
// ─────────────────────────────────────────────
function PedidosTab({ supabase, profile }) {
  const [pedidos, setPedidos] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState({});
  const [delivering, setDelivering] = useState(null);
  const [confirmQty, setConfirmQty] = useState({});
  const [assignedTo, setAssignedTo] = useState({});

  useEffect(() => { fetchPedidos(); }, []);

  async function fetchPedidos() {
    setLoading(true);
    const { data } = await supabase.from("pedidos")
      .select("*").eq("estado","pendiente").order("creado_at", { ascending:false });
    if (data) setPedidos(data);
    setLoading(false);
  }

  function handlePhoto(id, e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(prev => ({...prev, [id]: ev.target.result}));
    reader.readAsDataURL(file);
  }

  async function entregar(pedido) {
    setDelivering(pedido.id);
    const items = JSON.parse(pedido.items || "[]");
    const now = new Date().toISOString();
    const quien = assignedTo[pedido.id] || profile;

    // Restar del trastero y sumar al apartamento
    for (const item of items) {
      const qty = parseInt(confirmQty[`${pedido.id}_${item.producto}`] ?? item.cantidad);

      // Trastero
      const { data: tr } = await supabase.from("trastero").select("cantidad").eq("producto", item.producto).single();
      const trQty = (tr?.cantidad ?? 0) - qty;
      await supabase.from("trastero").upsert({ producto: item.producto, cantidad: Math.max(0, trQty) }, { onConflict:"producto" });

      // Apartamento
      const { data: ap } = await supabase.from("stock_apartamentos")
        .select("cantidad").eq("apartamento", pedido.apartamento).eq("producto", item.producto).single();
      const apQty = (ap?.cantidad ?? 0) + qty;
      await supabase.from("stock_apartamentos").upsert(
        { apartamento: pedido.apartamento, producto: item.producto, cantidad: apQty },
        { onConflict:"apartamento,producto" }
      );
    }

    await supabase.from("pedidos").update({
      estado: "entregado",
      entregado_por: quien,
      entregado_at: now
    }).eq("id", pedido.id);

    setDelivering(null);
    setPedidos(prev => prev.filter(p=>p.id!==pedido.id));
    setExpanded(null);
  }

  if (loading) return <p style={{color:"rgba(255,255,255,0.5)"}}>Cargando pedidos...</p>;
  if (pedidos.length===0) return (
    <div style={{textAlign:"center", padding:"3rem 1rem"}}>
      <div style={{fontSize:"3rem", marginBottom:"0.75rem"}}>✅</div>
      <p style={{color:"rgba(255,255,255,0.5)"}}>No hay pedidos pendientes</p>
      <button onClick={fetchPedidos} style={S.btnSm}>↻ Actualizar</button>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem"}}>
        <span style={{color:"rgba(255,255,255,0.5)", fontSize:"0.85rem"}}>{pedidos.length} pendientes</span>
        <button onClick={fetchPedidos} style={S.btnSm}>↻ Actualizar</button>
      </div>

      {pedidos.map(p => {
        const items = JSON.parse(p.items || "[]");
        const isOpen = expanded === p.id;
        const fecha = new Date(p.creado_at).toLocaleDateString("es-ES", {day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});

        return (
          <div key={p.id} style={{...S.card, cursor:"pointer"}} onClick={()=>setExpanded(isOpen?null:p.id)}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <span style={{color:"#36D1DC", fontWeight:"800", fontSize:"0.95rem"}}>
                  🏠 {p.apartamento}
                </span>
                <span style={{color:"rgba(255,255,255,0.4)", fontSize:"0.75rem", marginLeft:"0.75rem"}}>
                  {fecha}
                </span>
                <div style={{color:"rgba(255,255,255,0.5)", fontSize:"0.78rem", marginTop:"0.2rem"}}>
                  {items.length} producto{items.length!==1?"s":""} · por {p.creado_por}
                </div>
              </div>
              <span style={{color:"rgba(255,255,255,0.4)", fontSize:"1.2rem"}}>{isOpen?"▲":"▼"}</span>
            </div>

            {isOpen && (
              <div onClick={e=>e.stopPropagation()} style={{marginTop:"1rem", borderTop:"1px solid rgba(54,209,220,0.15)", paddingTop:"1rem"}}>
                
                {/* Asignar */}
                <div style={{marginBottom:"1rem"}}>
                  <label style={S.label}>👤 Asignar entrega a</label>
                  <div style={{display:"flex", gap:"0.5rem", flexWrap:"wrap"}}>
                    {PROFILES.map(pr => (
                      <button key={pr} onClick={()=>setAssignedTo(prev=>({...prev,[p.id]:pr}))}
                        style={{
                          ...S.btnSm,
                          background: (assignedTo[p.id]||profile)===pr ? `${PROFILE_COLORS[pr]}33` : "transparent",
                          borderColor: (assignedTo[p.id]||profile)===pr ? PROFILE_COLORS[pr] : "rgba(255,255,255,0.2)",
                          color: (assignedTo[p.id]||profile)===pr ? PROFILE_COLORS[pr] : "rgba(255,255,255,0.5)"
                        }}>
                        {pr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items con cantidad confirmada */}
                <table style={{width:"100%", borderCollapse:"collapse", marginBottom:"1rem"}}>
                  <thead>
                    <tr>
                      <th style={S.th}>Producto</th>
                      <th style={{...S.th, textAlign:"center"}}>Pedido</th>
                      <th style={{...S.th, textAlign:"center"}}>Confirmar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.producto}>
                        <td style={S.td}>{item.producto}</td>
                        <td style={{...S.td, textAlign:"center", color:"rgba(255,255,255,0.5)"}}>{item.cantidad}</td>
                        <td style={{...S.td, textAlign:"center"}}>
                          <input type="number" min="0" max={item.cantidad}
                            defaultValue={item.cantidad}
                            onChange={e=>setConfirmQty(prev=>({...prev,[`${p.id}_${item.producto}`]:e.target.value}))}
                            style={{...S.input, width:"65px", textAlign:"center", padding:"0.3rem"}}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Foto evidencia */}
                <div style={{marginBottom:"1rem"}}>
                  <label style={S.label}>📸 Foto de evidencia (opcional)</label>
                  <input type="file" accept="image/*" capture="environment"
                    onChange={e=>handlePhoto(p.id, e)}
                    style={{color:"rgba(255,255,255,0.7)", fontSize:"0.82rem"}}
                  />
                  {photoPreview[p.id] && (
                    <img src={photoPreview[p.id]} alt="preview"
                      style={{marginTop:"0.75rem", borderRadius:"0.5rem", maxHeight:"150px", maxWidth:"100%", display:"block"}}
                    />
                  )}
                </div>

                <button
                  onClick={()=>entregar(p)}
                  disabled={delivering===p.id}
                  style={{
                    ...S.btn("#22c55e"), width:"100%", padding:"0.85rem",
                    opacity:delivering===p.id?0.6:1
                  }}>
                  {delivering===p.id ? "Procesando..." : "✅ Marcar como Entregado"}
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
// APP PRINCIPAL
// ─────────────────────────────────────────────
export default function App() {
  const [sbCreds, setSbCreds] = useState(() => {
    const env_url = process.env.REACT_APP_SUPABASE_URL;
    const env_key = process.env.REACT_APP_SUPABASE_ANON_KEY;
    if (env_url && env_key) return { url: env_url, key: env_key };
    return loadFromLocalStorage();
  });

  const supabase = sbCreds.url && sbCreds.key ? getSupabaseClient(sbCreds.url, sbCreds.key) : null;

  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState(0);

  const tabs = [
    { label:"Trastero Base", icon:"📦" },
    { label:"Stock Apts", icon:"🏠" },
    { label:"Crear Pedido", icon:"➕" },
    { label:"Pendientes", icon:"🚚" }
  ];

  // SALVAVIDAS: sin credenciales → pantalla de configuración
  if (!supabase) {
    return <ConfigScreen onConnect={(url, key)=>setSbCreds({ url, key })} />;
  }

  if (!loggedIn) return <LoginScreen onLogin={()=>setLoggedIn(true)} />;
  if (!profile) return <ProfileSelector onSelect={p=>setProfile(p)} />;

  const profileColor = PROFILE_COLORS[profile] || "#36D1DC";

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#0d1b2a 0%,#1a2f42 50%,#0d1b2a 100%)",
      fontFamily:"'Nunito',sans-serif",
      color:"white"
    }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* TOP BAR */}
      <div style={{
        background:"rgba(13,27,42,0.9)", backdropFilter:"blur(12px)",
        borderBottom:"1px solid rgba(54,209,220,0.15)",
        padding:"0.75rem 1rem",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        position:"sticky", top:0, zIndex:100
      }}>
        <div style={{display:"flex", alignItems:"center", gap:"0.6rem"}}>
          <div style={{
            width:"32px", height:"32px", borderRadius:"0.5rem",
            background:"linear-gradient(135deg,#36D1DC,#5B86E5)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem"
          }}>🏠</div>
          <span style={{fontWeight:"900", fontSize:"1rem", color:"white"}}>NUBA</span>
        </div>

        <div style={{display:"flex", alignItems:"center", gap:"0.5rem"}}>
          <div style={{
            background:`${profileColor}22`, border:`1px solid ${profileColor}55`,
            borderRadius:"2rem", padding:"0.3rem 0.85rem",
            color:profileColor, fontWeight:"700", fontSize:"0.82rem"
          }}>
            {profile==="Joaquín"?"👨‍💼":profile==="Nanda"?"👩‍💼":profile==="Cari"?"👩‍🔧":"👩‍💻"} {profile}
          </div>
          <button onClick={()=>{setProfile(null);}} style={{
            background:"transparent", border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:"0.4rem", padding:"0.3rem 0.6rem", color:"rgba(255,255,255,0.5)",
            cursor:"pointer", fontSize:"0.75rem", fontFamily:"'Nunito',sans-serif"
          }}>⇄</button>
        </div>
      </div>

      {/* TABS NAV */}
      <div style={{
        display:"flex", borderBottom:"1px solid rgba(54,209,220,0.15)",
        background:"rgba(0,0,0,0.2)", overflowX:"auto"
      }}>
        {tabs.map((t,i) => (
          <button key={i} onClick={()=>setTab(i)} style={{
            flex:"1 0 auto", padding:"0.9rem 0.75rem",
            background:"transparent",
            borderBottom: tab===i ? "2px solid #36D1DC" : "2px solid transparent",
            color: tab===i ? "#36D1DC" : "rgba(255,255,255,0.45)",
            fontWeight: tab===i ? "800" : "600",
            cursor:"pointer", fontSize:"0.78rem", whiteSpace:"nowrap",
            fontFamily:"'Nunito',sans-serif", border:"none",
            borderBottomWidth:"2px", borderBottomStyle:"solid",
            borderBottomColor: tab===i ? "#36D1DC" : "transparent",
            transition:"all 0.2s"
          }}>
            <span style={{display:"block", fontSize:"1.1rem", marginBottom:"0.15rem"}}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{padding:"1.25rem 1rem", maxWidth:"800px", margin:"0 auto"}}>
        {tab===0 && <TrasteroTab supabase={supabase} />}
        {tab===1 && <StockAptTab supabase={supabase} />}
        {tab===2 && <CreateOrderTab supabase={supabase} profile={profile} />}
        {tab===3 && <PedidosTab supabase={supabase} profile={profile} />}
      </div>
    </div>
  );
}
