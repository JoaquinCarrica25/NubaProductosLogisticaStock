# NUBA Logística — Guía de instalación y conexión a Supabase

## Estructura de archivos del proyecto

```
nuba-logistica/
├── src/
│   ├── App.jsx              ← Toda la aplicación React
│   └── supabaseClient.js    ← Configuración del cliente Supabase
├── package.json
├── .env.example             ← Renombrar a .env y rellenar
├── supabase_schema.sql      ← PASO 1: Ejecutar en Supabase SQL Editor
└── supabase_functions.sql   ← PASO 2: Ejecutar en Supabase SQL Editor
```

---

## PASO 1 — Crear el proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta gratuita
2. Haz clic en "New Project"
3. Nombre: `nuba-logistica` (o el que prefieras)
4. Guarda la contraseña de la base de datos (no se puede recuperar)
5. Región: `West EU (Ireland)` — la más cercana a España
6. Espera ~2 minutos a que se cree el proyecto

---

## PASO 2 — Crear las tablas (SQL Schema)

1. En el panel de Supabase, ve a **SQL Editor** (icono de terminal en la barra lateral)
2. Haz clic en **"New query"**
3. Copia y pega **todo el contenido** de `supabase_schema.sql`
4. Haz clic en **"RUN"** (botón verde)
5. Deberías ver: "Success. No rows returned"
6. Repite con el contenido de `supabase_functions.sql`

---

## PASO 3 — Obtener las claves API

1. Ve a **Settings** (icono de engranaje) → **API**
2. Copia dos valores:
   - **Project URL**: algo como `https://abcdefgh.supabase.co`
   - **anon public key**: empieza por `eyJhbGci...`

---

## PASO 4 — Configurar las variables de entorno

1. En la carpeta del proyecto, copia `.env.example` y renómbralo a `.env`
2. Ábrelo con cualquier editor de texto y rellena:
```
REACT_APP_SUPABASE_URL=https://TU_PROYECTO.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...TU_CLAVE...
```

---

## PASO 5 — Instalar y arrancar la aplicación

Necesitas tener Node.js instalado (descárgalo de https://nodejs.org)

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Arrancar en modo desarrollo (en tu ordenador)
npm start
```

La app se abrirá en http://localhost:3000

---

## PASO 6 — Desplegar para acceso desde móviles (IMPORTANTE)

Para que todo el equipo pueda acceder desde sus teléfonos, tienes dos opciones:

### Opción A: Vercel (RECOMENDADO — gratis y muy fácil)
1. Sube el proyecto a GitHub
2. Ve a https://vercel.com → "New Project" → importa el repositorio
3. En "Environment Variables", añade las dos variables del `.env`
4. Haz clic en "Deploy"
5. Vercel te da una URL del tipo `https://nuba-logistica.vercel.app`
6. ¡Comparte esa URL con tu equipo!

### Opción B: Netlify (también gratis)
1. Ve a https://netlify.com → "Add new site" → "Import from Git"
2. Conecta tu repositorio GitHub
3. Build command: `npm run build`
4. Publish directory: `build`
5. En "Site settings" → "Environment variables" añade las dos variables
6. Haz clic en "Deploy site"

---

## PASO 7 — Habilitar Realtime en Supabase

Para que los cambios aparezcan en todos los dispositivos sin recargar:

1. En Supabase Dashboard → **Database** → **Replication**
2. Asegúrate de que las tablas `productos`, `pedidos`, `pedido_items` y `stock_apartamento` tienen el toggle activado
3. (El SQL ya lo hace automáticamente con `ALTER PUBLICATION supabase_realtime ADD TABLE...`)

---

## PASO 8 — Configurar el Storage para fotos

El bucket `evidencias-pedidos` se crea automáticamente con el SQL.
Para verificarlo:
1. Ve a **Storage** en el panel de Supabase
2. Deberías ver el bucket `evidencias-pedidos` como **público**

---

## Credenciales de acceso a la app

- **Email**: logistica@nubagestion.es
- **Contraseña**: Nuba2026

---

## Estructura de tablas creadas

| Tabla | Descripción |
|-------|-------------|
| `perfiles` | Los 4 operarios (Joaquín, Nanda, Cari, Vanessa) |
| `productos` | 54 productos con stock_general |
| `apartamentos` | 25 apartamentos con su frecuencia |
| `stock_apartamento` | Stock actual de cada producto en cada apartamento |
| `pedidos` | Pedidos con estado, repartidor, fecha y URL de foto |
| `pedido_items` | Líneas de cada pedido (producto + cantidades) |

---

## Funciones SQL instaladas

- `decrementar_stock_producto(id, cantidad)` — Descuenta del stock general al entregar
- `incrementar_stock_apartamento(apto_id, prod_id, cantidad)` — Suma al stock del apartamento

---

## Solución de problemas comunes

**"No se pueden cargar los productos"**
→ Verifica que las variables de entorno están correctamente configuradas en `.env`
→ Comprueba que ejecutaste el SQL completo en Supabase

**"Error 401 Unauthorized"**
→ La `anon key` es incorrecta. Cópiala de nuevo desde Supabase Settings → API

**"Los cambios no se sincronizan en tiempo real"**
→ Ve a Supabase → Database → Replication → activa las tablas manualmente

**"No se puede subir la foto"**
→ Verifica en Supabase → Storage que el bucket `evidencias-pedidos` existe y es público
→ Si no existe, créalo manualmente con nombre `evidencias-pedidos` y activa "Public bucket"

---

## Notas de seguridad

- La `anon key` es segura para el frontend (solo permite lo que las políticas RLS permitan)
- Para mayor seguridad en producción, puedes añadir autenticación real con Supabase Auth
- Nunca uses la `service_role key` en el frontend — tiene acceso total sin restricciones
