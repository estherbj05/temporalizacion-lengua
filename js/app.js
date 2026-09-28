// js/app.js
// Punto de entrada. Inicializa la interfaz y carga la temporalización:
// - Si Supabase está configurado (SUPABASE_URL/KEY rellenos en supabase.js),
//   pide iniciar sesión y guarda/lee de la nube (tabla app_state).
// - Si no, funciona igual que antes con localStorage en este navegador.

function esFormatoValido(temporalizacion) {
  // Comprueba que los datos cargados (nube o local) son del modelo actual
  // (multi-asignatura). Si vinieran de una versión anterior, se ignoran en
  // vez de romper la interfaz, y se genera todo de nuevo.
  return Array.isArray(temporalizacion) && temporalizacion.length > 0 &&
    temporalizacion[0].asignatura !== undefined && Array.isArray(temporalizacion[0].libroPaginas);
}

document.addEventListener("DOMContentLoaded", async () => {
  initNavegacion();
  initFiltrosAsignatura();
  initModales();
  initAccionesHoy();
  initAccionesTabla();
  initExportacion();
  renderHorario();
  renderCalendario();

  document.getElementById("btn-generar").addEventListener("click", () => {
    const desde = document.getElementById("curso-desde")?.value || FECHA_INICIO_CURSO;
    const hasta = document.getElementById("curso-hasta")?.value || "2026-12-22";
    if (TEMPORALIZACION_ACTUAL.length && !confirm("Esto vuelve a generar la temporalización desde cero para el rango indicado y se perderán los cambios manuales actuales. ¿Continuar?")) {
      return;
    }
    generarTemporalizacion(desde, hasta);
    registrarHistorial(`⚙️ Temporalización generada de nuevo (${desde} a ${hasta}).`);
    guardarEstadoLocal();
  });

  document.getElementById("btn-deshacer")?.addEventListener("click", deshacerUltimoCambio);
  document.getElementById("btn-restaurar")?.addEventListener("click", restaurarPlanificacionOriginal);

  if (supabaseConfigurado()) {
    await cargarLibreriaSupabase();
    initAuthUI();
    const usuario = await comprobarSesionSupabase();
    if (usuario) {
      await cargarTrasLogin();
    } else {
      mostrarOverlayAuth();
    }
  } else {
    cargarModoSoloLocal();
  }
});

// Si los contenidos/fecha de inicio han cambiado desde que se guardó el trabajo,
// se ofrece regenerar (el maestro decide; nunca se hace sin preguntar).
function verificarContenidosActualizados() {
  if (FIRMA_GUARDADA === firmaContenidos()) return;
  if (confirm("Los contenidos (páginas o fecha de inicio) han cambiado desde la última vez que se guardó tu trabajo.\n\n¿Regenerar la temporalización con los contenidos actuales?\n\nAceptar = regenerar (se pierden los estados marcados).\nCancelar = mantener lo que tenías.")) {
    generarPorDefecto();
    registrarHistorial("⚙️ Temporalización regenerada automáticamente por cambio de contenidos.");
    guardarEstadoLocal();
  } else {
    FIRMA_GUARDADA = firmaContenidos();
  }
}

function generarPorDefecto() {
  generarTemporalizacion(
    document.getElementById("curso-desde").value,
    document.getElementById("curso-hasta").value
  );
  guardarEstadoLocal();
}

function cargarModoSoloLocal() {
  const hayGuardado = cargarEstadoLocal();
  if (hayGuardado && esFormatoValido(TEMPORALIZACION_ACTUAL)) {
    renderTemporalizacion();
    registrarHistorial("🔄 Cargado el trabajo guardado en este navegador.");
    verificarContenidosActualizados();
  } else {
    generarPorDefecto();
  }
}

async function cargarTrasLogin() {
  ocultarOverlayAuth();
  actualizarEstadoConexion(true);

  const estadoNube = await cargarEstadoNube();
  if (estadoNube && esFormatoValido(estadoNube.temporalizacion)) {
    TEMPORALIZACION_ACTUAL = estadoNube.temporalizacion;
    PLANIFICACION_ORIGINAL = estadoNube.original || estadoNube.temporalizacion;
    HISTORIAL.length = 0;
    HISTORIAL.push(...(estadoNube.historial || []));
    FIRMA_GUARDADA = estadoNube.firma || null;
    renderTemporalizacion();
    registrarHistorial("☁️ Cargado el trabajo guardado en la nube.");
    verificarContenidosActualizados();
  } else if (cargarEstadoLocal() && esFormatoValido(TEMPORALIZACION_ACTUAL)) {
    renderTemporalizacion();
    registrarHistorial("💾 No había nada en la nube todavía: se sube el trabajo que tenías guardado en este navegador.");
    verificarContenidosActualizados();
    guardarEstadoLocal(); // ya hay USUARIO_ACTUAL, así que esto también sube a Supabase
  } else {
    generarPorDefecto();
  }
}

function initAuthUI() {
  document.getElementById("auth-login").addEventListener("click", async () => {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const errorEl = document.getElementById("auth-error");
    errorEl.style.color = "var(--color-red)";
    errorEl.textContent = "";
    try {
      await iniciarSesionSupabase(email, password);
      await cargarTrasLogin();
    } catch (e) {
      errorEl.textContent = "No se pudo entrar: " + (e.message || "revisa el email y la contraseña.");
    }
  });

  document.getElementById("auth-signup").addEventListener("click", async () => {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const errorEl = document.getElementById("auth-error");
    errorEl.textContent = "";
    try {
      await registrarUsuarioSupabase(email, password);
      errorEl.style.color = "var(--color-green)";
      errorEl.textContent = "Cuenta creada. Si Supabase pide confirmar el email, revisa tu correo y vuelve a pulsar Entrar.";
    } catch (e) {
      errorEl.style.color = "var(--color-red)";
      errorEl.textContent = "No se pudo crear la cuenta: " + (e.message || "inténtalo de nuevo.");
    }
  });

  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    await cerrarSesionSupabase();
    actualizarEstadoConexion(false);
    mostrarOverlayAuth();
  });
}

function mostrarOverlayAuth() {
  document.getElementById("auth-overlay").classList.add("open");
  actualizarEstadoConexion(false);
}
function ocultarOverlayAuth() {
  document.getElementById("auth-overlay").classList.remove("open");
}

function actualizarEstadoConexion(conectado) {
  const el = document.getElementById("auth-status");
  const btnLogout = document.getElementById("btn-logout");
  if (el) el.textContent = conectado ? "☁️ Sincronizado con la nube" : "💾 Sin conectar (guardado solo local)";
  if (btnLogout) btnLogout.style.display = conectado ? "inline-block" : "none";
}
