// js/supabase.js
// FASE 2 — Conexión con Supabase: autenticación por email/contraseña y
// sincronización de la temporalización en la nube (tabla app_state, sql/schema.sql).
//
// IMPORTANTE: la URL del proyecto y la "anon key" pública de Supabase NO son
// secretas (están pensadas para usarse en el navegador junto con Row Level
// Security), pero aun así se cargan aquí como constantes editables en vez de
// dejarlas repartidas por el código. Nunca pongas aquí la "service_role key".

const SUPABASE_URL = "https://qxvloqrtmcxjpayqdsov.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FJgDHhyO4JiYQuEgiXbMaQ_adaHRS76";

let supabaseClient = null;
let USUARIO_ACTUAL = null; // objeto user de Supabase Auth, o null si no hay sesión

function supabaseConfigurado() {
  return SUPABASE_URL.startsWith("https://") && SUPABASE_URL.endsWith(".supabase.co") && SUPABASE_ANON_KEY.length > 20;
}

async function cargarLibreriaSupabase() {
  if (!supabaseConfigurado()) return false;
  if (window.supabase) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("No se pudo cargar la librería de Supabase (¿sin conexión a internet?).");
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

function initSupabase() {
  if (!supabaseConfigurado()) return null;
  if (!window.supabase) {
    console.warn("Librería de Supabase no cargada todavía.");
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

async function comprobarSesionSupabase() {
  const client = initSupabase();
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) return null;
  USUARIO_ACTUAL = data.session.user;
  return USUARIO_ACTUAL;
}

async function iniciarSesionSupabase(email, password) {
  const client = initSupabase();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  USUARIO_ACTUAL = data.user;
  return data.user;
}

async function registrarUsuarioSupabase(email, password) {
  const client = initSupabase();
  if (!client) throw new Error("Supabase no está configurado todavía.");
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  USUARIO_ACTUAL = data.user;
  return data.user;
}

async function cerrarSesionSupabase() {
  const client = initSupabase();
  if (client) await client.auth.signOut();
  USUARIO_ACTUAL = null;
}

// Se guarda todo el estado (temporalización + planificación original + historial)
// como un único documento JSON por usuario en la tabla app_state.
// Es más sencillo que replicar la tabla "sesiones" fila a fila y es suficiente
// para el uso actual; se puede normalizar más adelante si hace falta.
async function cargarEstadoNube() {
  const client = initSupabase();
  if (!client || !USUARIO_ACTUAL) return null;
  const { data, error } = await client
    .from("app_state")
    .select("data")
    .eq("user_id", USUARIO_ACTUAL.id)
    .maybeSingle();
  if (error) {
    console.warn("Error cargando de Supabase:", error);
    return null;
  }
  return data ? data.data : null;
}

async function guardarEstadoNube(estado) {
  const client = initSupabase();
  if (!client || !USUARIO_ACTUAL) return false;
  const { error } = await client
    .from("app_state")
    .upsert({ user_id: USUARIO_ACTUAL.id, data: estado, updated_at: new Date().toISOString() });
  if (error) {
    console.warn("Error guardando en Supabase:", error);
    return false;
  }
  return true;
}
