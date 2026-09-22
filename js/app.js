// js/app.js
// Punto de entrada. Inicializa la interfaz y carga la temporalización:
// - Si Supabase está configurado (SUPABASE_URL/KEY rellenos en supabase.js),
//   pide iniciar sesión y guarda/lee de la nube (tabla app_state).
// - Si no, funciona igual que antes con localStorage en este navegador.

document.addEventListener("DOMContentLoaded", async () => {
  initNavegacion();
  initTabsContenidos();
  initModales();
  initEstadoSesion();
  initAccionesTabla();
  initExportacion();
  renderTablaContenidos("libro");

  document.getElementById("btn-generar").addEventListener("click", () => {
    const desde = document.getElementById("curso-desde")?.value || "2026-09-08";
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

function cargarModoSoloLocal() {
  const hayGuardado = cargarEstadoLocal();
  if (hayGuardado) {
    renderTemporalizacion();
    registrarHistorial("🔄 Cargado el trabajo guardado en este navegador.");
  } else {
    generarTemporalizacion(
      document.getElementById("curso-desde").value,
      document.getElementById("curso-hasta").value
    );
    guardarEstadoLocal();
  }
}

async function cargarTrasLogin() {
  ocultarOverlayAuth();
  actualizarEstadoConexion(true);

  const estadoNube = await cargarEstadoNube();
  if (estadoNube && estadoNube.temporalizacion && estadoNube.temporalizacion.length) {
    TEMPORALIZACION_ACTUAL = estadoNube.temporalizacion;
    PLANIFICACION_ORIGINAL = estadoNube.original || estadoNube.temporalizacion;
    HISTORIAL.length = 0;
    HISTORIAL.push(...(estadoNube.historial || []));
    renderTemporalizacion();
    registrarHistorial("☁️ Cargado el trabajo guardado en la nube.");
  } else if (cargarEstadoLocal()) {
    renderTemporalizacion();
    registrarHistorial("💾 No había nada en la nube todavía: se sube el trabajo que tenías guardado en este navegador.");
    guardarEstadoLocal(); // ya hay USUARIO_ACTUAL, así que esto también sube a Supabase
  } else {
    generarTemporalizacion(
      document.getElementById("curso-desde").value,
      document.getElementById("curso-hasta").value
    );
    guardarEstadoLocal();
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
