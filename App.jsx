import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicialización segura de Supabase con las variables de Vercel/Local
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Listados Maestros oficiales de NUBA
const PRODUCTOS_LISTA = [
  "Limpiacristales", "Gel WC", "Lejía azul baños", "Papel Higiénico paq", "Gel Ducha", "Champú", 
  "Rec. fregona ud", "Bolsa blanca", "Palo fregona", "Escobilla baño rec", "Papel Cocina G", "Jabón vajillas", 
  "Pastillas lavavajillas", "Quitagrasas", "Café molido", "Cápsulas Nespresso", "Cápsulas DG Classic", 
  "Filtro café", "Té", "Sal", "Azúcar", "Aceitera", "Vinagrera", "Estropajo azul ud", "Bayetas Cocina", 
  "Abrillantador lav", "Bolsa gris", "Friegasuelos", "Detergente Ropa", "Suavizante", "Lejía Ropa", 
  "Bayetas Microfibra ud", "Blanqueador perborato", "Estropajos Acero", "Plumeros caja", "Bolsa asp Bosh ud", 
  "Bolsa asp (Moreria)", "Bolsa asp (Fomento)", "Guantes T/M", "Quitapelusa ud", "Vinagre limp", 
  "Spray mopa", "Jabón lagarto ud", "Sal lavavajillas", "Escobilla baño set", "Friegas. madera", 
  "Trampa cuca ud", "Spray cucaracha", "Ajax polvo", "Pilas AAA ud", "Pilas AA ud", "Plumero clasico", 
  "Recambo cepillo", "Bicarbonato"
];

const APARTAMENTOS = [
  { nombre: "ALMADEN", tipo: "frecuente" }, { nombre: "CARRETAS", tipo: "frecuente" },
  { nombre: "CAVA ALTA", tipo: "frecuente" }, { nombre: "CONCEPCION", tipo: "frecuente" },
  { nombre: "COSTANILLA", tipo: "frecuente" }, { nombre: "FOMENTO", tipo: "frecuente" },
  { nombre: "IMPERIAL", tipo: "frecuente" }, { nombre: "MAYOR", tipo: "frecuente" },
  { nombre: "MONTERA", tipo: "frecuente" }, { nombre: "MORATIN", tipo: "frecuente" },
  { nombre: "MORERIA", tipo: "frecuente" }, { nombre: "NAVAS", tipo: "frecuente" },
  { nombre: "SAN MIGUEL", tipo: "frecuente" }, { nombre: "TETUAN", tipo: "frecuente" },
  { nombre: "TORRECILLA", tipo: "frecuente" }, { nombre: "VIRGEN DE LA PALOMA", tipo: "frecuente" },
  { nombre: "SAN BARTOLOME", tipo: "frecuente" }, { nombre: "VALENCIA", tipo: "infrecuente" },
  { nombre: "OLIVAR", tipo: "infrecuente" }, { nombre: "INFANTE", tipo: "infrecuente" },
  { nombre: "ZURBANO", tipo: "infrecuente" }, { nombre: "ROBLEDO", tipo: "infrecuente" },
  { nombre: "MOSTENSES", tipo: "infrecuente" }, { nombre: "ANTONIO LOPES", tipo: "infrecuente" },
  { nombre: "MORENO NIETO", tipo: "infrecuente" }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState('');
  const [pestana, setPestana] = useState('general');
  const [errorConfig, setErrorConfig] = useState('');

  // Validar si las claves de Supabase están llegando bien
  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setErrorConfig('Falta configurar las claves secretas de Supabase en el servidor.');
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'logistica@nubagestion.es' && password === 'Nuba2026') {
      setIsLoggedIn(true);
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  };

  // Pantalla de Error de Configuración (Salvavidas)
  if (errorConfig) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#FFF5F5', color: '#C53030' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>⚠️ Error de Conexión Técnica</h2>
        <p style={{ marginTop: '10px' }}>{errorConfig}</p>
        <p style={{ fontSize: '14px', color: '#742A2A', marginTop: '20px' }}>Asegúrate de que REACT_APP_SUPABASE_URL está bien guardado en Vercel.</p>
      </div>
    );
  }

  // Pantalla 1: Login Obligatorio
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0,1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ color: '#00A8B5', fontSize: '28px', fontWeight: 'bold', tracking: 'wide' }}>NUBA</h1>
            <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '4px' }}>Gestión Logística e Interna</p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="logistica@nubagestion.es" />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="••••••••" />
            </div>
            <button type="submit" style={{ width: '100%', backgroundColor: '#00A8B5', color: 'white', padding: '12px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  // Pantalla 2: Selección de Perfil Personal
  if (!perfil) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>¿Quién está ingresando al sistema?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {['Joaquín', 'Nanda', 'Cari', 'Vanessa'].map((nombre) => (
              <button key={nombre} onClick={() => setPerfil(nombre)} style={{ padding: '20px', backgroundColor: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '18px', fontWeight: '600', color: '#374151', cursor: 'pointer', transition: 'all 0.2s' }}>{nombre}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pantalla 3: Panel Principal (Dashboard) con Pestañas
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
      {/* Barra de Navegación */}
      <nav style={{ backgroundColor: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#00A8B5' }}>NUBA LOGÍSTICA</span>
          <span style={{ marginLeft: '12px', fontSize: '14px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '9999px' }}>Perfil: {perfil}</span>
        </div>
        <button onClick={() => { setPerfil(''); setIsLoggedIn(false); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Cerrar Sesión</button>
      </nav>

      {/* Selector de Pestañas */}
      <div style={{ display: 'flex', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
        {[
          { id: 'general', texto: 'Trastero Base' },
          { id: 'apartamentos', texto: 'Stock Apartamentos' },
          { id: 'crear', texto: 'Crear Pedido' },
          { id: 'pendientes', texto: 'Pedidos Pendientes' }
        ].map((p) => (
          <button key={p.id} onClick={() => setPestana(p.id)} style={{ padding: '16px 24px', border: 'none', background: 'none', fontSize: '15px', fontWeight: '600', color: pestana === p.id ? '#00A8B5' : '#6b7280', borderBottom: pestana === p.id ? '3px solid #00A8B5' : '3px solid transparent', cursor: 'pointer' }}>{p.texto}</button>
        ))}
      </div>

      {/* Contenido Dinámico de las Pestañas */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {pestana === 'general' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Inventario General - Trastero Base</h3>
            <p style={{ color: '#6b7280', marginBottom: '12px' }}>Listado de los 54 productos oficiales cargados en el sistema.</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px' }}>Producto</th>
                    <th style={{ padding: '12px' }}>Cantidad Disponible</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTOS_LISTA.map((prod, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{prod}</td>
                      <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>100 ud (Simulado)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pestana === 'apartamentos' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Stock por Apartamentos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {APARTAMENTOS.map((ap, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: ap.tipo === 'frecuente' ? '#f0fdf4' : '#fffbeb' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{ap.nombre}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginTop: '4px' }}>{ap.tipo}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pestana === 'crear' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Formulario de Pedido</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Apartamento Destino</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                {APARTAMENTOS.map((ap, i) => <option key={i}>{ap.nombre}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Añadir Producto</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                {PRODUCTOS_LISTA.map((prod, i) => <option key={i}>{prod}</option>)}
              </select>
            </div>
            <button style={{ backgroundColor: '#00A8B5', color: 'white', padding: '12px 24px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Enviar Pedido a Pendientes</button>
          </div>
        )}

        {pestana === 'pendientes' && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Pedidos Logísticos Pendientes</h3>
            <p style={{ color: '#6b7280' }}>No hay pedidos pendientes de entrega en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
