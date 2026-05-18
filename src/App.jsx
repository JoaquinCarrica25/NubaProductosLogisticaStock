import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';

// ─── PALETA Y ESTILOS GLOBALES ────────────────────────────────────────────────
const T = '#1A8FA0'; // Turquesa principal (ajustado a un turquesa más oscuro para contraste)
const TB = '#14737F'; // Turquesa hover/borde
const TBKG = '#E6F7F9'; // Turquesa bg suave

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #F5F6F8; color: #1C1C1E; -webkit-font-smoothing: antialiased; }
  :root {
    --turquesa: #1A8FA0;
    --turquesa-hover: #14737F;
    --turquesa-bg: #E6F7F9;
    --turquesa-border: #9DD8E0;
    --bg: #F5F6F8;
    --white: #FFFFFF;
    --gray-100: #F0F1F3;
    --gray-200: #E4E6EA;
    --gray-400: #9EA3AD;
    --gray-600: #6B7280;
    --gray-800: #374151;
    --black: #1C1C1E;
    --danger: #DC3545;
    --danger-bg: #FFF0F0;
    --success: #198754;
    --success-bg: #F0FBF4;
    --warning: #D97706;
    --warning-bg: #FFFBF0;
    --radius: 12px;
    --radius-sm: 8px;
    --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
  }
  input, select, textarea, button { font-family: inherit; }
  button { cursor: pointer; }
  input:focus, select:focus, textarea:focus { outline: none; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
  .scrollbar-thin::-webkit-scrollbar { width: 4px; }
  .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 4px; }
`;

// ─── DATOS LOCALES (FALLBACK OFFLINE) ─────────────────────────────────────────
const PERFILES = ['Joaquín', 'Nanda', 'Cari', 'Vanessa'];
const PERFILES_INICIALES = { Joaquín: 'JO', Nanda: 'NA', Cari: 'CA', Vanessa: 'VA' };

const PRODUCTOS_FALLBACK = [
  'Limpiacristales','Gel WC','Lejía azul baños','Papel Higiénico paq','Gel Ducha','Champú',
  'Rec. fregona ud','Bolsa blanca','Palo fregona','Escobilla baño rec','Papel Cocina G',
  'Jabón vajillas','Pastillas lavavajillas','Quitagrasas','Café molido','Cápsulas Nespresso',
  'Cápsulas DG Classic','Filtro café','Té','Sal','Azúcar','Aceitera','Vinagrera',
  'Estropajo azul ud','Bayetas Cocina','Abrillantador lav','Bolsa gris','Friegasuelos',
  'Detergente Ropa','Suavizante','Lejía Ropa','Bayetas Microfibra ud','Blanqueador perborato',
  'Estropajos Acero','Plumeros caja','Bolsa asp Bosh ud','Bolsa asp (Moreria)',
  'Bolsa asp (Fomento)','Guantes T/M','Quitapelusa ud','Vinagre limp','Spray mopa',
  'Jabón lagarto ud','Sal lavavajillas','Escobilla baño set','Friegas. madera',
  'Trampa cuca ud','Spray cucaracha','Ajax polvo','Pilas AAA ud','Pilas AA ud',
  'Plumero clasico','Recambo cepillo','Bicarbonato'
];

const APARTAMENTOS_FRECUENTES = [
  'ALMADEN','CARRETAS','CAVA ALTA','CONCEPCION','COSTANILLA','FOMENTO','IMPERIAL',
  'MAYOR','MONTERA','MORATIN','MORERIA','NAVAS','SAN MIGUEL','TETUAN','TORRECILLA',
  'VIRGEN DE LA PALOMA','SAN BARTOLOME'
];
const APARTAMENTOS_MENOS = [
  'VALENCIA','OLIVAR','INFANTE','ZURBANO','ROBLEDO','MOSTENSES','ANTONIO LOPES','MORENO NIETO'
];
const TODOS_APARTAMENTOS = [...APARTAMENTOS_FRECUENTES, ...APARTAMENTOS_MENOS];

// ─── COMPONENTES UI ───────────────────────────────────────────────────────────

function Badge({ children, color = 'turquesa', size = 'sm' }) {
  const palettes = {
    turquesa: { bg: TBKG, color: TB, border: '#9DD8E0' },
    success:  { bg: '#F0FBF4', color: '#198754', border: '#A3D9B8' },
    warning:  { bg: '#FFFBF0', color: '#D97706', border: '#FCD68A' },
    danger:   { bg: '#FFF0F0', color: '#DC3545', border: '#FFCDD2' },
    gray:     { bg: '#F0F1F3', color: '#6B7280', border: '#E4E6EA' },
  };
  const p = palettes[color] || palettes.gray;
  const fontSize = size === 'xs' ? '11px' : '12px';
  const padding = size === 'xs' ? '2px 7px' : '3px 10px';
  return (
    <span style={{
      display: 'inline-block', fontSize, fontWeight: 500, padding,
      background: p.bg, color: p.color, border: `1px solid ${p.border}`,
      borderRadius: 20, whiteSpace: 'nowrap'
    }}>
      {children}
    </span>
  );
}

function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid ${TBKG}`,
      borderTopColor: T, borderRadius: '50%',
      animation: 'spin 0.7s linear infinite', display: 'inline-block'
    }} />
  );
}

function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: ['#F0FBF4','#198754','#A3D9B8'], danger: ['#FFF0F0','#DC3545','#FFCDD2'], info: [TBKG, T, '#9DD8E0'] };
  const [bg, fg, bo] = colors[type] || colors.info;
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: bg, color: fg, border: `1px solid ${bo}`,
      borderRadius: 10, padding: '12px 20px', fontWeight: 500, fontSize: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10,
      animation: 'slideUp 0.25s ease'
    }}>
      <span>{type === 'success' ? '✓' : type === 'danger' ? '✗' : 'ℹ'}</span>
      {msg}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: fg, fontWeight: 700, fontSize: 16, cursor: 'pointer', marginLeft: 4 }}>×</button>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text', required, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>{label}{required && <span style={{ color: T }}> *</span>}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{
          height: 40, border: '1px solid #E4E6EA', borderRadius: 8, padding: '0 12px',
          fontSize: 14, color: '#1C1C1E', background: '#fff', transition: 'border 0.15s',
          ...style
        }}
        onFocus={e => e.target.style.borderColor = T}
        onBlur={e => e.target.style.borderColor = '#E4E6EA'}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required, placeholder = 'Seleccionar…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>{label}{required && <span style={{ color: T }}> *</span>}</label>}
      <select
        value={value} onChange={onChange} required={required}
        style={{
          height: 40, border: '1px solid #E4E6EA', borderRadius: 8, padding: '0 12px',
          fontSize: 14, color: value ? '#1C1C1E' : '#9EA3AD', background: '#fff', transition: 'border 0.15s',
          appearance: 'none', cursor: 'pointer',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
        }}
        onFocus={e => e.target.style.borderColor = T}
        onBlur={e => e.target.style.borderColor = '#E4E6EA'}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

function Card({ children, style, padding = '20px' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #E4E6EA',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding, ...style
    }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, loading, style, type = 'button' }) {
  const variants = {
    primary:   { bg: T, color: '#fff', border: T, hover: TB },
    secondary: { bg: '#fff', color: '#374151', border: '#E4E6EA', hover: '#F0F1F3' },
    danger:    { bg: '#fff', color: '#DC3545', border: '#FFCDD2', hover: '#FFF0F0' },
    success:   { bg: '#198754', color: '#fff', border: '#198754', hover: '#166840' },
    ghost:     { bg: 'transparent', color: '#6B7280', border: 'transparent', hover: '#F0F1F3' },
  };
  const v = variants[variant] || variants.primary;
  const sizes = { sm: { h: 32, px: 12, fs: 13 }, md: { h: 38, px: 16, fs: 14 }, lg: { h: 44, px: 20, fs: 15 } };
  const s = sizes[size] || sizes.md;
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, fontWeight: 500, fontFamily: 'DM Sans',
        background: hovered ? v.hover : v.bg, color: v.color,
        border: `1px solid ${v.border}`, borderRadius: 9,
        display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all 0.15s',
        opacity: (disabled || loading) ? 0.55 : 1, cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        ...style
      }}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

// ─── PESTAÑA 1: STOCK GENERAL ─────────────────────────────────────────────────
function StockGeneral({ toast }) {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState('');

  const fetchProductos = useCallback(async () => {
    const { data, error } = await supabase.from('productos').select('*').order('nombre');
    if (!error && data) setProductos(data);
    else setProductos(PRODUCTOS_FALLBACK.map((n, i) => ({ id: i, nombre: n, stock_general: 0 })));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProductos();
    // Suscripción en tiempo real
    const channel = supabase.channel('productos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, fetchProductos)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchProductos]);

  const saveStock = async (id) => {
    const val = parseInt(editVal, 10);
    if (isNaN(val) || val < 0) return;
    const { error } = await supabase.from('productos').update({ stock_general: val }).eq('id', id);
    if (error) { toast('Error al guardar el stock', 'danger'); return; }
    toast('Stock actualizado ✓', 'success');
    setEditingId(null);
  };

  const filtered = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Stock General — Trastero Base</h2>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>{productos.length} productos · Haz clic en una cantidad para editarla</p>
        </div>
        <div style={{
          background: TBKG, color: T, border: `1px solid #9DD8E0`,
          borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 500
        }}>
          🟢 Sincronizado en tiempo real
        </div>
      </div>

      <div style={{ marginBottom: 16, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9EA3AD', fontSize: 16 }}>🔍</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar producto…"
          style={{
            width: '100%', height: 40, border: '1px solid #E4E6EA', borderRadius: 9,
            padding: '0 12px 0 36px', fontSize: 14, background: '#fff'
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#F5F6F8', borderBottom: '1px solid #E4E6EA' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#6B7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#6B7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Producto</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 500, color: '#6B7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 500, color: '#6B7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 500, color: '#6B7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Editar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => {
              const isEditing = editingId === p.id;
              const stockOk = p.stock_general > 10;
              const stockWarn = p.stock_general > 0 && p.stock_general <= 10;
              const stockZero = p.stock_general === 0;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #F0F1F3', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '10px 14px', color: '#9EA3AD', fontSize: 12 }}>{idx + 1}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 400 }}>{p.nombre}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    {isEditing ? (
                      <input
                        type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                        min={0} autoFocus
                        style={{
                          width: 70, height: 32, border: `1.5px solid ${T}`, borderRadius: 6,
                          textAlign: 'center', fontSize: 14, padding: '0 8px'
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') saveStock(p.id); if (e.key === 'Escape') setEditingId(null); }}
                      />
                    ) : (
                      <span style={{ fontWeight: 600, fontFamily: 'DM Mono', fontSize: 15 }}>{p.stock_general}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    {stockOk && <Badge color="success" size="xs">Disponible</Badge>}
                    {stockWarn && <Badge color="warning" size="xs">Bajo</Badge>}
                    {stockZero && <Badge color="danger" size="xs">Agotado</Badge>}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <Btn size="sm" variant="primary" onClick={() => saveStock(p.id)}>✓</Btn>
                        <Btn size="sm" variant="secondary" onClick={() => setEditingId(null)}>✗</Btn>
                      </div>
                    ) : (
                      <Btn size="sm" variant="ghost" onClick={() => { setEditingId(p.id); setEditVal(String(p.stock_general)); }}>✏️</Btn>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9EA3AD' }}>No se encontraron productos</div>
        )}
      </div>
    </div>
  );
}

// ─── PESTAÑA 2: STOCK POR APARTAMENTO ────────────────────────────────────────
function StockApartamento({ toast }) {
  const [selected, setSelected] = useState(null);
  const [productos, setProductos] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apartamentosData, setApartamentosData] = useState([]);

  useEffect(() => {
    supabase.from('apartamentos').select('*').order('nombre').then(({ data }) => {
      if (data) setApartamentosData(data);
    });
    supabase.from('productos').select('*').order('nombre').then(({ data }) => {
      if (data) setProductos(data);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    const load = async () => {
      const { data } = await supabase
        .from('stock_apartamento')
        .select('*, productos(nombre)')
        .eq('apartamento_id', selected.id);
      setStockData(data || []);
      setLoading(false);
    };
    load();
    const channel = supabase.channel(`stock-apto-${selected.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_apartamento',
        filter: `apartamento_id=eq.${selected.id}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [selected]);

  const aFrecuentes = apartamentosData.filter(a => a.frecuencia === 'frecuente');
  const aMenos      = apartamentosData.filter(a => a.frecuencia === 'menos_frecuente');

  const renderGrid = (list, title) => (
    <>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#9EA3AD', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, marginTop: 4 }}>{title}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8, marginBottom: 16 }}>
        {list.map(a => (
          <button key={a.id} onClick={() => setSelected(a)}
            style={{
              padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              border: selected?.id === a.id ? `2px solid ${T}` : '1.5px solid #E4E6EA',
              background: selected?.id === a.id ? TBKG : '#fff', color: selected?.id === a.id ? T : '#374151',
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center'
            }}
          >
            {a.nombre}
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Stock por Apartamento</h2>
      <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20 }}>Selecciona un apartamento para ver su inventario actual</p>

      {renderGrid(aFrecuentes.length ? aFrecuentes : APARTAMENTOS_FRECUENTES.map((n,i) => ({id:i,nombre:n,frecuencia:'frecuente'})), 'Frecuentes')}
      {renderGrid(aMenos.length ? aMenos : APARTAMENTOS_MENOS.map((n,i) => ({id:9+i,nombre:n,frecuencia:'menos_frecuente'})), 'Menos frecuentes')}

      {selected && (
        <Card style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: T }}>{selected.nombre}</h3>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Inventario actual en este apartamento</p>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={28} /></div>
          ) : stockData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9EA3AD' }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>📦</p>
              <p>Sin stock registrado para este apartamento</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {stockData.filter(s => s.cantidad > 0).map(s => (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 14px', background: '#F9FAFB', borderRadius: 8, fontSize: 13
                }}>
                  <span>{s.productos?.nombre}</span>
                  <span style={{ fontWeight: 600, fontFamily: 'DM Mono', color: T }}>{s.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── PESTAÑA 3: CREAR PEDIDO ──────────────────────────────────────────────────
function CrearPedido({ perfilActivo, toast }) {
  const [solicitante, setSolicitante] = useState(perfilActivo || '');
  const [apartamento, setApartamento] = useState('');
  const [items, setItems] = useState([{ productoId: '', nombre: '', cantidad: 1 }]);
  const [productos, setProductos] = useState([]);
  const [apartamentosData, setApartamentosData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchItem, setSearchItem] = useState({});

  useEffect(() => {
    setSolicitante(perfilActivo || '');
    supabase.from('productos').select('*').order('nombre').then(({ data }) => setProductos(data || []));
    supabase.from('apartamentos').select('*').order('nombre').then(({ data }) => setApartamentosData(data || []));
  }, [perfilActivo]);

  const addItem = () => setItems([...items, { productoId: '', nombre: '', cantidad: 1 }]);

  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx, field, val) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: val };
    setItems(next);
  };

  const handleSubmit = async () => {
    if (!solicitante) { toast('Selecciona quién realiza el pedido', 'danger'); return; }
    if (!apartamento) { toast('Selecciona el apartamento de destino', 'danger'); return; }
    const validItems = items.filter(i => i.productoId && i.cantidad > 0);
    if (validItems.length === 0) { toast('Añade al menos un producto', 'danger'); return; }

    setLoading(true);

    // Buscar el ID del apartamento
    const apto = apartamentosData.find(a => a.nombre === apartamento);
    const apartamento_id = apto?.id || null;

    const { data: pedido, error: pErr } = await supabase.from('pedidos').insert({
      solicitante, apartamento_id, estado: 'pendiente'
    }).select().single();

    if (pErr) { toast('Error al crear el pedido', 'danger'); setLoading(false); return; }

    const itemsData = validItems.map(i => ({
      pedido_id: pedido.id,
      producto_id: i.productoId,
      cantidad_solicitada: parseInt(i.cantidad, 10),
    }));

    const { error: iErr } = await supabase.from('pedido_items').insert(itemsData);
    if (iErr) { toast('Error al guardar los ítems', 'danger'); setLoading(false); return; }

    toast(`Pedido #${pedido.numero_pedido} creado y enviado ✓`, 'success');
    setApartamento('');
    setItems([{ productoId: '', nombre: '', cantidad: 1 }]);
    setLoading(false);
  };

  const productosFiltrados = (search) => {
    if (!search) return productos.slice(0, 8);
    return productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase())).slice(0, 8);
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Crear Pedido</h2>
      <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 24 }}>Completa los campos para enviar un pedido al almacén</p>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Datos del pedido</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Select
            label="Quién realiza el pedido" value={solicitante}
            onChange={e => setSolicitante(e.target.value)}
            options={PERFILES} required
          />
          <Select
            label="Apartamento de destino"
            value={apartamento} onChange={e => setApartamento(e.target.value)}
            options={apartamentosData.length ? apartamentosData.map(a => a.nombre) : TODOS_APARTAMENTOS}
            required
          />
        </div>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ítems del pedido</p>
          <Btn size="sm" variant="secondary" onClick={addItem}>+ Añadir ítem</Btn>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  value={searchItem[idx] !== undefined ? searchItem[idx] : item.nombre}
                  onChange={e => {
                    setSearchItem(s => ({ ...s, [idx]: e.target.value }));
                    updateItem(idx, 'nombre', e.target.value);
                    updateItem(idx, 'productoId', '');
                  }}
                  placeholder="Buscar producto…"
                  style={{
                    width: '100%', height: 38, border: '1px solid #E4E6EA', borderRadius: 8,
                    padding: '0 12px', fontSize: 14, background: '#fff'
                  }}
                />
                {(searchItem[idx] !== undefined && searchItem[idx].length > 0 && !item.productoId) && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff',
                    border: '1px solid #E4E6EA', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                    zIndex: 100, maxHeight: 220, overflowY: 'auto'
                  }}>
                    {productosFiltrados(searchItem[idx]).map(p => (
                      <div key={p.id}
                        onClick={() => {
                          updateItem(idx, 'productoId', p.id);
                          updateItem(idx, 'nombre', p.nombre);
                          setSearchItem(s => ({ ...s, [idx]: undefined }));
                        }}
                        style={{
                          padding: '9px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #F0F1F3'
                        }}
                        onMouseEnter={e => e.target.style.background = TBKG}
                        onMouseLeave={e => e.target.style.background = '#fff'}
                      >
                        {p.nombre}
                        <span style={{ float: 'right', color: '#9EA3AD', fontFamily: 'DM Mono', fontSize: 12 }}>{p.stock_general} uds</span>
                      </div>
                    ))}
                    {productosFiltrados(searchItem[idx]).length === 0 && (
                      <div style={{ padding: '12px 14px', color: '#9EA3AD', fontSize: 13 }}>Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
              <input
                type="number" min={1} value={item.cantidad}
                onChange={e => updateItem(idx, 'cantidad', e.target.value)}
                style={{
                  width: 70, height: 38, border: '1px solid #E4E6EA', borderRadius: 8,
                  padding: '0 10px', fontSize: 14, textAlign: 'center'
                }}
              />
              {items.length > 1 && (
                <Btn size="sm" variant="danger" onClick={() => removeItem(idx)}>✕</Btn>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Btn variant="primary" size="lg" onClick={handleSubmit} loading={loading}>
            📦 Enviar pedido
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── PESTAÑA 4: PEDIDOS PENDIENTES ────────────────────────────────────────────
function PedidosPendientes({ perfilActivo, toast }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);
  const [entregaData, setEntregaData] = useState({});
  const [apartamentosMap, setApartamentosMap] = useState({});
  const [tab, setTab] = useState('pendientes');

  const fetchPedidos = useCallback(async () => {
    const estado = tab;
    const { data } = await supabase
      .from('pedidos')
      .select('*, apartamentos(nombre), pedido_items(*, productos(nombre, stock_general))')
      .eq('estado', estado)
      .order('created_at', { ascending: false });
    setPedidos(data || []);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    fetchPedidos();
    const channel = supabase.channel('pedidos-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, fetchPedidos)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchPedidos]);

  const handleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
    if (!entregaData[id]) {
      const now = new Date();
      setEntregaData(d => ({
        ...d, [id]: {
          repartidor: perfilActivo || '',
          cantidades: {},
          fotoFile: null,
          fotoPreview: null,
          fechaHora: now.toISOString().slice(0, 16),
        }
      }));
    }
  };

  const updateEntrega = (pedidoId, field, val) =>
    setEntregaData(d => ({ ...d, [pedidoId]: { ...d[pedidoId], [field]: val } }));

  const handleFoto = (pedidoId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => updateEntrega(pedidoId, 'fotoPreview', e.target.result);
    reader.readAsDataURL(file);
    updateEntrega(pedidoId, 'fotoFile', file);
  };

  const marcarEntregado = async (pedido) => {
    const d = entregaData[pedido.id];
    if (!d?.repartidor) { toast('Selecciona quién lleva el pedido', 'danger'); return; }
    setSaving(pedido.id);

    let evidencia_url = null;

    // Subir foto a Supabase Storage
    if (d.fotoFile) {
      const ext = d.fotoFile.name.split('.').pop();
      const path = `pedido-${pedido.numero_pedido}-${Date.now()}.${ext}`;
      const { data: upData, error: upErr } = await supabase.storage
        .from('evidencias-pedidos')
        .upload(path, d.fotoFile, { cacheControl: '3600', upsert: false });
      if (!upErr && upData) {
        const { data: urlData } = supabase.storage.from('evidencias-pedidos').getPublicUrl(path);
        evidencia_url = urlData.publicUrl;
      }
    }

    // Actualizar cantidades entregadas en items
    for (const item of pedido.pedido_items) {
      const cant = parseInt(d.cantidades[item.id] ?? item.cantidad_solicitada, 10);
      await supabase.from('pedido_items').update({ cantidad_entregada: cant }).eq('id', item.id);

      // Descontar del stock general y sumar al apartamento
      if (!isNaN(cant) && cant > 0) {
        // Actualizar stock_general
        await supabase.rpc('decrementar_stock_producto', {
          p_producto_id: item.producto_id, p_cantidad: cant
        }).catch(() => {});

        // Upsert stock_apartamento
        await supabase.from('stock_apartamento').upsert({
          apartamento_id: pedido.apartamento_id,
          producto_id: item.producto_id,
          cantidad: cant,
        }, { onConflict: 'apartamento_id,producto_id', ignoreDuplicates: false });
      }
    }

    // Marcar pedido como entregado
    const { error } = await supabase.from('pedidos').update({
      estado: 'entregado',
      repartidor: d.repartidor,
      fecha_entrega: new Date(d.fechaHora).toISOString(),
      evidencia_url,
    }).eq('id', pedido.id);

    if (error) { toast('Error al marcar como entregado', 'danger'); setSaving(null); return; }

    toast(`Pedido #${pedido.numero_pedido} entregado ✓ · Stock actualizado`, 'success');
    setSaving(null);
    setExpanded(null);
    fetchPedidos();
  };

  const tabStyle = (active) => ({
    padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer',
    border: 'none', background: active ? T : 'transparent', color: active ? '#fff' : '#6B7280',
    transition: 'all 0.15s'
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Pedidos</h2>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>Gestión de entregas y seguimiento</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#F0F1F3', borderRadius: 10, padding: 3 }}>
          <button style={tabStyle(tab === 'pendientes')} onClick={() => { setTab('pendientes'); setExpanded(null); }}>⏳ Pendientes</button>
          <button style={tabStyle(tab === 'entregado')} onClick={() => { setTab('entregado'); setExpanded(null); }}>✅ Entregados</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
      ) : pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9EA3AD' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>{tab === 'pendientes' ? '🎉' : '📋'}</p>
          <p style={{ fontWeight: 500 }}>{tab === 'pendientes' ? '¡Sin pedidos pendientes!' : 'Sin pedidos entregados'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pedidos.map(p => {
            const isOpen = expanded === p.id;
            const d = entregaData[p.id] || {};
            const fecha = new Date(p.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            return (
              <Card key={p.id} padding="0" style={{ overflow: 'hidden' }}>
                <div
                  onClick={() => handleExpand(p.id)}
                  style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ background: TBKG, color: T, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'DM Mono' }}>
                      #{p.numero_pedido}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{p.apartamentos?.nombre || '—'}</p>
                      <p style={{ fontSize: 12, color: '#6B7280' }}>Solicitado por {p.solicitante} · {fecha}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge color={p.estado === 'pendiente' ? 'warning' : 'success'} size="xs">
                      {p.estado === 'pendiente' ? '⏳ Pendiente' : '✅ Entregado'}
                    </Badge>
                    <span style={{ color: '#9EA3AD', fontSize: 18, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px solid #F0F1F3' }}>
                    {/* Tabla de ítems */}
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#9EA3AD', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 10px' }}>Ítems solicitados</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                      {(p.pedido_items || []).map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                          <span style={{ fontSize: 13 }}>{item.productos?.nombre}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {tab === 'pendientes' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                                <span>Entregado:</span>
                                <input
                                  type="number" min={0} max={item.cantidad_solicitada}
                                  value={d.cantidades?.[item.id] ?? item.cantidad_solicitada}
                                  onChange={e => updateEntrega(p.id, 'cantidades', { ...d.cantidades, [item.id]: e.target.value })}
                                  style={{ width: 55, height: 28, border: '1px solid #E4E6EA', borderRadius: 6, textAlign: 'center', fontSize: 13, padding: '0 6px' }}
                                />
                                <span style={{ color: '#9EA3AD' }}>/ {item.cantidad_solicitada}</span>
                              </div>
                            )}
                            {tab === 'entregado' && (
                              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'DM Mono', color: T }}>
                                {item.cantidad_entregada ?? item.cantidad_solicitada} / {item.cantidad_solicitada}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {tab === 'pendientes' && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                          <Select
                            label="Quién lleva el pedido" value={d.repartidor || ''}
                            onChange={e => updateEntrega(p.id, 'repartidor', e.target.value)}
                            options={PERFILES} required
                          />
                          <Input
                            label="Fecha y hora de entrega" type="datetime-local"
                            value={d.fechaHora || ''} onChange={e => updateEntrega(p.id, 'fechaHora', e.target.value)}
                          />
                        </div>

                        {/* Evidencia fotográfica */}
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 8 }}>Evidencia fotográfica</p>
                          <label style={{
                            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                            padding: '10px 14px', border: '1.5px dashed #E4E6EA', borderRadius: 10,
                            background: '#FAFAFA', fontSize: 13, color: '#6B7280'
                          }}>
                            📷 {d.fotoFile ? d.fotoFile.name : 'Toca aquí para adjuntar foto (cámara o galería)'}
                            <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                              onChange={e => handleFoto(p.id, e.target.files[0])} />
                          </label>
                          {d.fotoPreview && (
                            <img src={d.fotoPreview} alt="Evidencia" style={{ marginTop: 10, width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, border: '1px solid #E4E6EA' }} />
                          )}
                        </div>

                        <Btn
                          variant="success" size="lg" style={{ width: '100%', justifyContent: 'center' }}
                          onClick={() => marcarEntregado(p)} loading={saving === p.id}
                        >
                          ✅ Marcar como entregado · Actualizar stock
                        </Btn>
                      </>
                    )}

                    {tab === 'entregado' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 14px' }}>
                          <p style={{ fontSize: 12, color: '#9EA3AD', marginBottom: 4 }}>Repartidor</p>
                          <p style={{ fontSize: 14, fontWeight: 500 }}>{p.repartidor || '—'}</p>
                        </div>
                        <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 14px' }}>
                          <p style={{ fontSize: 12, color: '#9EA3AD', marginBottom: 4 }}>Fecha entrega</p>
                          <p style={{ fontSize: 14, fontWeight: 500 }}>
                            {p.fecha_entrega ? new Date(p.fecha_entrega).toLocaleString('es-ES') : '—'}
                          </p>
                        </div>
                        {p.evidencia_url && (
                          <div style={{ gridColumn: '1/-1' }}>
                            <p style={{ fontSize: 12, color: '#9EA3AD', marginBottom: 6 }}>Evidencia fotográfica</p>
                            <img src={p.evidencia_url} alt="Evidencia entrega" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, border: '1px solid #E4E6EA' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email === 'logistica@nubagestion.es' && pass === 'Nuba2026') {
        onLogin();
      } else {
        setError('Credenciales incorrectas. Contacta con administración.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #F5F6F8 0%, #E6F7F9 100%)'
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: T,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', boxShadow: `0 8px 24px ${T}44`
          }}>
            <span style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>N</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.5px' }}>NUBA</h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: 4 }}>Logística & Distribución de Stock</p>
        </div>

        <Card>
          <form onSubmit={submit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="logistica@nubagestion.es" required />
              <Input label="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" required />
              {error && (
                <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: '#DC3545' }}>
                  {error}
                </div>
              )}
              <Btn type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
                Iniciar sesión
              </Btn>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── SELECTOR DE PERFIL ───────────────────────────────────────────────────────
function SelectorPerfil({ onSelect }) {
  const colores = ['#1A8FA0', '#F59E0B', '#10B981', '#8B5CF6'];
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #F5F6F8 0%, #E6F7F9 100%)'
    }}>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 480, padding: '0 24px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: T,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px', boxShadow: `0 8px 24px ${T}44`
        }}>
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>N</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>¿Quién eres hoy?</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 32 }}>Selecciona tu perfil para continuar</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {PERFILES.map((p, i) => (
            <button key={p} onClick={() => onSelect(p)}
              style={{
                padding: '22px 16px', borderRadius: 14, cursor: 'pointer',
                border: '1.5px solid #E4E6EA', background: '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                transition: 'all 0.18s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${T}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E4E6EA'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: colores[i],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 18, fontWeight: 700
              }}>
                {PERFILES_INICIALES[p]}
              </div>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{p}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState('login'); // 'login' | 'perfil' | 'app'
  const [perfilActivo, setPerfilActivo] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
  }, []);
  const removeToast = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);

  const TABS = [
    { label: 'Stock General', icon: '📦' },
    { label: 'Por Apartamento', icon: '🏠' },
    { label: 'Crear Pedido', icon: '➕' },
    { label: 'Pedidos', icon: '🚚' },
  ];

  const colores = ['#1A8FA0', '#F59E0B', '#10B981', '#8B5CF6'];
  const perfilColor = perfilActivo ? colores[PERFILES.indexOf(perfilActivo)] : T;

  if (step === 'login') return (
    <>
      <style>{css}</style>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideUp { from { opacity:0; transform: translate(-50%, 12px); } to { opacity:1; transform: translate(-50%, 0); } }`}</style>
      <Login onLogin={() => setStep('perfil')} />
    </>
  );

  if (step === 'perfil') return (
    <>
      <style>{css}</style>
      <SelectorPerfil onSelect={p => { setPerfilActivo(p); setStep('app'); }} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideUp { from { opacity:0; transform: translate(-50%, 12px); } to { opacity:1; transform: translate(-50%, 0); } }`}</style>

      {/* NAVBAR */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 200, background: '#fff',
        borderBottom: '1px solid #E4E6EA', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>N</span>
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>NUBA</span>
              <span style={{ fontSize: 12, color: '#9EA3AD', marginLeft: 8 }}>Logística</span>
            </div>
          </div>

          <nav style={{ display: 'flex', gap: 2 }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none',
                  background: activeTab === i ? TBKG : 'transparent',
                  color: activeTab === i ? T : '#6B7280', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5
                }}
              >
                <span>{t.icon}</span>
                <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>{t.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: perfilColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff'
            }}>
              {PERFILES_INICIALES[perfilActivo]}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{perfilActivo}</span>
            <button onClick={() => { setStep('perfil'); setPerfilActivo(null); }}
              style={{ marginLeft: 4, background: 'none', border: '1px solid #E4E6EA', borderRadius: 7, padding: '4px 10px', fontSize: 12, color: '#6B7280', cursor: 'pointer' }}>
              Cambiar
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ maxWidth: 1140, margin: '0 auto', padding: '28px 20px' }}>
        {activeTab === 0 && <StockGeneral toast={toast} />}
        {activeTab === 1 && <StockApartamento toast={toast} />}
        {activeTab === 2 && <CrearPedido perfilActivo={perfilActivo} toast={toast} />}
        {activeTab === 3 && <PedidosPendientes perfilActivo={perfilActivo} toast={toast} />}
      </main>

      {/* TOASTS */}
      {toasts.map(t => <Toast key={t.id} msg={t.msg} type={t.type} onClose={() => removeToast(t.id)} />)}
    </>
  );
}
