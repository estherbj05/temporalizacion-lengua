// js/sesiones.js
// FASE 9 y 10 — Bloqueo de sesiones, historial y deshacer/restaurar.
// (Las Fases 7 y 8 -marcar estado y reorganización- viven en temporalizacion.js)

const HISTORIAL = []; // { fecha, descripcion }
const PILA_DESHACER = []; // snapshots { temporalizacion, historial }

const CLAVE_LOCAL = "temporalizacion-lengua-v1";

function registrarHistorial(descripcion) {
  HISTORIAL.unshift({ fecha: new Date().toISOString(), descripcion });
  if (typeof renderHistorial === "function") renderHistorial();
}

function guardarSnapshotParaDeshacer() {
  PILA_DESHACER.push({
    temporalizacion: JSON.parse(JSON.stringify(TEMPORALIZACION_ACTUAL)),
    historial: JSON.parse(JSON.stringify(HISTORIAL))
  });
}

function deshacerUltimoCambio() {
  if (PILA_DESHACER.length === 0) return;
  const snap = PILA_DESHACER.pop();
  TEMPORALIZACION_ACTUAL = snap.temporalizacion;
  HISTORIAL.length = 0;
  HISTORIAL.push(...snap.historial);
  registrarHistorial("↩️ Deshecho el último cambio.");
  renderTemporalizacion();
  guardarEstadoLocal();
}

function restaurarPlanificacionOriginal() {
  guardarSnapshotParaDeshacer();
  TEMPORALIZACION_ACTUAL = JSON.parse(JSON.stringify(PLANIFICACION_ORIGINAL));
  registrarHistorial("↩️ Restaurada la planificación original (se han deshecho todas las reorganizaciones).");
  renderTemporalizacion();
  guardarEstadoLocal();
}

function bloquearSesion(sesionId, motivo) {
  const s = TEMPORALIZACION_ACTUAL.find(x => x.id === sesionId);
  if (!s) return;
  guardarSnapshotParaDeshacer();
  s.bloqueada = true;
  s.motivoBloqueo = motivo || "Bloqueada manualmente";
  registrarHistorial(`🔒 Sesión del ${s.fecha} bloqueada (${s.motivoBloqueo}). No se modificará en reorganizaciones automáticas.`);
  renderTemporalizacion();
  guardarEstadoLocal();
}

function desbloquearSesion(sesionId) {
  const s = TEMPORALIZACION_ACTUAL.find(x => x.id === sesionId);
  if (!s) return;
  guardarSnapshotParaDeshacer();
  s.bloqueada = false;
  s.motivoBloqueo = null;
  registrarHistorial(`🔓 Sesión del ${s.fecha} desbloqueada.`);
  renderTemporalizacion();
  guardarEstadoLocal();
}

// --- Persistencia ---
// Guarda siempre en este navegador (localStorage, funciona sin conexión) y,
// si hay una sesión de Supabase iniciada, sincroniza también en la nube.
function guardarEstadoLocal() {
  const estado = {
    temporalizacion: TEMPORALIZACION_ACTUAL,
    original: PLANIFICACION_ORIGINAL,
    historial: HISTORIAL
  };
  try {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(estado));
  } catch (e) {
    console.warn("No se pudo guardar en localStorage:", e);
  }
  if (typeof USUARIO_ACTUAL !== "undefined" && USUARIO_ACTUAL && typeof guardarEstadoNube === "function") {
    guardarEstadoNube(estado)
      .then(ok => { if (typeof actualizarEstadoConexion === "function") actualizarEstadoConexion(ok); })
      .catch(e => console.warn("No se pudo sincronizar con Supabase:", e));
  }
}

function cargarEstadoLocal() {
  try {
    const raw = localStorage.getItem(CLAVE_LOCAL);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.temporalizacion || !data.temporalizacion.length) return false;
    TEMPORALIZACION_ACTUAL = data.temporalizacion;
    PLANIFICACION_ORIGINAL = data.original || data.temporalizacion;
    HISTORIAL.length = 0;
    HISTORIAL.push(...(data.historial || []));
    return true;
  } catch (e) {
    console.warn("No se pudo cargar de localStorage:", e);
    return false;
  }
}
