// js/temporalizacion.js
// FASE 6 y FASE 8 — Generación automática y reorganización en cadena.
//
// Este archivo concentrará la lógica central descrita en el prompt maestro:
//   Programado → No realizado → Pendiente → Siguiente sesión disponible → Reorganización automática.
// Se implementa en detalle una vez estén cargados horario + calendario + contenidos reales.

let PLANIFICACION_ORIGINAL = []; // snapshot inmutable tras "Generar temporalización"
let TEMPORALIZACION_ACTUAL = []; // versión viva, con reorganizaciones aplicadas

const NOMBRES_DIA = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

function nombreDia(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return NOMBRES_DIA[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

function sumarDias(fechaISO, n) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

// Caligrafía, lectura y copia NO se controlan por listas propias: el profesor
// las improvisa sesión a sesión. La aplicación solo avisa, según la frecuencia
// configurada en FRECUENCIAS (contenidos.js), de qué toca ese día.
function generarTemporalizacion(fechaDesde, fechaHasta) {
  const sesiones = [];
  let cursorLibro = 0; // puntero de avance sobre CONTENIDOS.libro, en orden

  let fecha = fechaDesde;
  while (fecha <= fechaHasta) {
    if (esDiaLectivo(fecha)) {
      const dia = nombreDia(fecha);
      if ((HORARIO_LENGUA[dia] || 0) > 0) {
        const paginaLibro = CONTENIDOS.libro[cursorLibro] || null;
        if (paginaLibro) cursorLibro++;

        sesiones.push({
          id: "S-" + fecha,
          fecha,
          dia,
          libro: paginaLibro ? paginaLibro.descripcion : null,
          libroId: paginaLibro ? paginaLibro.id : null,
          caligrafia: FRECUENCIAS.caligrafia.includes(dia),
          lectura: FRECUENCIAS.lectura.includes(dia),
          copia: FRECUENCIAS.copia.includes(dia),
          estado: "pendiente",
          bloqueada: false
        });
      }
    }
    fecha = sumarDias(fecha, 1);
  }

  TEMPORALIZACION_ACTUAL = sesiones;
  PLANIFICACION_ORIGINAL = JSON.parse(JSON.stringify(sesiones));

  if (typeof renderTemporalizacion === "function") renderTemporalizacion();
}

function indiceSesion(sesionId) {
  return TEMPORALIZACION_ACTUAL.findIndex(s => s.id === sesionId);
}

// Recupera una página de libro que no se ha podido dar y la reinserta en la
// primera sesión disponible (no bloqueada) a partir de desdeIndex, empujando
// en cadena todo lo que hubiera después (Secciones 11-13 del prompt).
function empujarLibroDesde(desdeIndex, pagina, paginaId) {
  const objetivos = [];
  for (let i = desdeIndex; i < TEMPORALIZACION_ACTUAL.length; i++) {
    if (!TEMPORALIZACION_ACTUAL[i].bloqueada) objetivos.push(i);
  }
  let pendPagina = pagina, pendId = paginaId;
  for (const idx of objetivos) {
    const s = TEMPORALIZACION_ACTUAL[idx];
    const guardaPagina = s.libro, guardaId = s.libroId;
    s.libro = pendPagina;
    s.libroId = pendId;
    pendPagina = guardaPagina;
    pendId = guardaId;
    if (pendPagina === null || pendPagina === undefined) break;
  }
  // Si sobra una página tras recorrer todas las sesiones generadas, no hay sitio:
  // habría que ampliar el rango de "Todo el curso" (Generar temporalización con una fecha "Hasta" mayor).
  return pendPagina; // null si se colocó todo; si no, la página que no ha cabido
}

function marcarRealizado(sesionId) {
  const idx = indiceSesion(sesionId);
  if (idx === -1) return;
  const s = TEMPORALIZACION_ACTUAL[idx];
  if (s.bloqueada) return;
  guardarSnapshotParaDeshacer();
  s.estado = "realizado";
  registrarHistorial(`🟢 Sesión del ${s.fecha} marcada como REALIZADA.`);
  renderTemporalizacion();
  guardarEstadoLocal();
}

function marcarNoRealizado(sesionId) {
  // Mueve TODO el contenido de la sesión a la siguiente sesión disponible,
  // desplazando en cadena las sesiones siguientes (Sección 12).
  const idx = indiceSesion(sesionId);
  if (idx === -1) return;
  const s = TEMPORALIZACION_ACTUAL[idx];
  if (s.bloqueada) return;
  guardarSnapshotParaDeshacer();
  s.estado = "no_realizado";
  if (s.libro) {
    const libroGuardado = s.libro, libroIdGuardado = s.libroId;
    s.libro = null;
    s.libroId = null;
    const sinSitio = empujarLibroDesde(idx + 1, libroGuardado, libroIdGuardado);
    if (sinSitio) {
      alert("No queda sitio en el rango generado para reubicar la página pendiente. Amplía la fecha 'Hasta' en Todo el curso y vuelve a generar.");
    }
  }
  registrarHistorial(`🔴 Sesión del ${s.fecha} marcada como NO REALIZADA. Contenido reorganizado a la siguiente sesión disponible.`);
  renderTemporalizacion();
  guardarEstadoLocal();
}

function marcarPorTerminar(sesionId, libroPendiente) {
  // libroPendiente: true si la página de libro de esa sesión no se terminó.
  const idx = indiceSesion(sesionId);
  if (idx === -1) return;
  const s = TEMPORALIZACION_ACTUAL[idx];
  if (s.bloqueada) return;
  guardarSnapshotParaDeshacer();
  s.estado = "por_terminar";
  if (libroPendiente && s.libro) {
    const libroGuardado = s.libro, libroIdGuardado = s.libroId;
    s.libro = null;
    s.libroId = null;
    empujarLibroDesde(idx + 1, libroGuardado, libroIdGuardado);
  }
  registrarHistorial(`🟠 Sesión del ${s.fecha} marcada como POR TERMINAR${libroPendiente ? " (página de libro pendiente, reorganizada)" : ""}.`);
  renderTemporalizacion();
  guardarEstadoLocal();
}

const HORARIO_LENGUA = {
  lunes: 1,
  martes: 1,
  miercoles: 1,
  jueves: 1,
  viernes: 1
}; // Confirmado a partir del horario personal de Tutoría 2ºC (ver README).
