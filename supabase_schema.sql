-- ============================================================
--  NUBA APARTAMENTOS — Script SQL completo para Supabase
--  Pega este código en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. TABLA: perfiles
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  avatar_iniciales TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO perfiles (nombre, avatar_iniciales) VALUES
  ('Joaquín', 'JO'),
  ('Nanda',   'NA'),
  ('Cari',    'CA'),
  ('Vanessa', 'VA')
ON CONFLICT (nombre) DO NOTHING;


-- 2. TABLA: productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  stock_general INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO productos (nombre, stock_general) VALUES
  ('Limpiacristales', 0),
  ('Gel WC', 0),
  ('Lejía azul baños', 0),
  ('Papel Higiénico paq', 0),
  ('Gel Ducha', 0),
  ('Champú', 0),
  ('Rec. fregona ud', 0),
  ('Bolsa blanca', 0),
  ('Palo fregona', 0),
  ('Escobilla baño rec', 0),
  ('Papel Cocina G', 0),
  ('Jabón vajillas', 0),
  ('Pastillas lavavajillas', 0),
  ('Quitagrasas', 0),
  ('Café molido', 0),
  ('Cápsulas Nespresso', 0),
  ('Cápsulas DG Classic', 0),
  ('Filtro café', 0),
  ('Té', 0),
  ('Sal', 0),
  ('Azúcar', 0),
  ('Aceitera', 0),
  ('Vinagrera', 0),
  ('Estropajo azul ud', 0),
  ('Bayetas Cocina', 0),
  ('Abrillantador lav', 0),
  ('Bolsa gris', 0),
  ('Friegasuelos', 0),
  ('Detergente Ropa', 0),
  ('Suavizante', 0),
  ('Lejía Ropa', 0),
  ('Bayetas Microfibra ud', 0),
  ('Blanqueador perborato', 0),
  ('Estropajos Acero', 0),
  ('Plumeros caja', 0),
  ('Bolsa asp Bosh ud', 0),
  ('Bolsa asp (Moreria)', 0),
  ('Bolsa asp (Fomento)', 0),
  ('Guantes T/M', 0),
  ('Quitapelusa ud', 0),
  ('Vinagre limp', 0),
  ('Spray mopa', 0),
  ('Jabón lagarto ud', 0),
  ('Sal lavavajillas', 0),
  ('Escobilla baño set', 0),
  ('Friegas. madera', 0),
  ('Trampa cuca ud', 0),
  ('Spray cucaracha', 0),
  ('Ajax polvo', 0),
  ('Pilas AAA ud', 0),
  ('Pilas AA ud', 0),
  ('Plumero clasico', 0),
  ('Recambo cepillo', 0),
  ('Bicarbonato', 0)
ON CONFLICT (nombre) DO NOTHING;


-- 3. TABLA: apartamentos
CREATE TABLE IF NOT EXISTS apartamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  frecuencia TEXT NOT NULL DEFAULT 'frecuente', -- 'frecuente' | 'menos_frecuente'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO apartamentos (nombre, frecuencia) VALUES
  ('ALMADEN',            'frecuente'),
  ('CARRETAS',           'frecuente'),
  ('CAVA ALTA',          'frecuente'),
  ('CONCEPCION',         'frecuente'),
  ('COSTANILLA',         'frecuente'),
  ('FOMENTO',            'frecuente'),
  ('IMPERIAL',           'frecuente'),
  ('MAYOR',              'frecuente'),
  ('MONTERA',            'frecuente'),
  ('MORATIN',            'frecuente'),
  ('MORERIA',            'frecuente'),
  ('NAVAS',              'frecuente'),
  ('SAN MIGUEL',         'frecuente'),
  ('TETUAN',             'frecuente'),
  ('TORRECILLA',         'frecuente'),
  ('VIRGEN DE LA PALOMA','frecuente'),
  ('SAN BARTOLOME',      'frecuente'),
  ('VALENCIA',           'menos_frecuente'),
  ('OLIVAR',             'menos_frecuente'),
  ('INFANTE',            'menos_frecuente'),
  ('ZURBANO',            'menos_frecuente'),
  ('ROBLEDO',            'menos_frecuente'),
  ('MOSTENSES',          'menos_frecuente'),
  ('ANTONIO LOPES',      'menos_frecuente'),
  ('MORENO NIETO',       'menos_frecuente')
ON CONFLICT (nombre) DO NOTHING;


-- 4. TABLA: stock_apartamento (stock por apartamento y producto)
CREATE TABLE IF NOT EXISTS stock_apartamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartamento_id UUID REFERENCES apartamentos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(apartamento_id, producto_id)
);


-- 5. TABLA: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido SERIAL,
  solicitante TEXT NOT NULL,
  apartamento_id UUID REFERENCES apartamentos(id),
  estado TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente' | 'entregado'
  repartidor TEXT,
  fecha_entrega TIMESTAMPTZ,
  evidencia_url TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 6. TABLA: pedido_items (líneas de cada pedido)
CREATE TABLE IF NOT EXISTS pedido_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  cantidad_solicitada INTEGER NOT NULL DEFAULT 0,
  cantidad_entregada INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
--  TRIGGER: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_stock_updated_at
  BEFORE UPDATE ON stock_apartamento
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
--  ROW LEVEL SECURITY (RLS) - Habilitar para producción
--  (Con anon key pública, estas políticas permiten todo desde el frontend)
-- ============================================================
ALTER TABLE perfiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartamentos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_apartamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_items     ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para anon (ajustar en producción con auth real)
CREATE POLICY "allow_all_perfiles"          ON perfiles          FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_productos"         ON productos         FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_apartamentos"      ON apartamentos      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_stock_apartamento" ON stock_apartamento FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_pedidos"           ON pedidos           FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_pedido_items"      ON pedido_items      FOR ALL TO anon USING (true) WITH CHECK (true);


-- ============================================================
--  STORAGE: Bucket para evidencias fotográficas
--  Ejecutar en SQL Editor o crear manualmente en Storage
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidencias-pedidos', 'evidencias-pedidos', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: permitir subir y leer a todos (anon)
CREATE POLICY "allow_upload_evidencias"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'evidencias-pedidos');

CREATE POLICY "allow_read_evidencias"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'evidencias-pedidos');

-- ============================================================
--  Habilitar Realtime para todas las tablas relevantes
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE productos;
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE pedido_items;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_apartamento;
