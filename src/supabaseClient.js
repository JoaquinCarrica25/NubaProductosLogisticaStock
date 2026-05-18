import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'ERROR: Faltan las variables de entorno de Supabase.\n' +
    'Crea un archivo .env en la raíz del proyecto con:\n' +
    'REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co\n' +
    'REACT_APP_SUPABASE_ANON_KEY=tu-anon-key'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
