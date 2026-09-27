// js/temporalizacion.js
// FASE 6, 7, 8 — Motor de generación y reorganización, por asignatura,
// basado en una COLA de páginas pendientes por asignatura.
//
// Idea central: cada asignatura tiene su propia cola de páginas (ver
// contenidos.js). Al generar, cada sesión de esa asignatura toma del FRENTE
// de la cola tantas páginas como "paginasPorSesion" indique. Si una sesión
// se marca NO REALIZADA o POR TERMINAR, las páginas no completadas se
// devuelven al FRENTE de la cola y se regeneran automáticamente todas las
// sesiones futuras de ESA MISMA asignatura a partir de ahí — así nunca hace
// falta desplazar nada a mano y las demás asignaturas no se ven afectadas.

let PLANIFICACION_ORIGINAL = []; // snapshot inmutable tras la primera generación
let TEMPORALIZACION_ACTUAL = []; // todas las sesiones de las 3 asignaturas, mezcladas y ordenadas

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

function formatoRangoPaginas(paginas) {
  if (!paginas || !paginas.length) return null;
  if (paginas.length === 1) return "Página " + paginas[0];
  return "Páginas " + paginas[0] + "-" + paginas[paginas.length - 1];
}

// --- Generación completa desde cero (Fase 6) ---
// Crea el "esqueleto" de sesiones (fecha+periodo+asignatura) para todo el
// rango y luego rellena cada asignatura consumiendo su cola en orden.
function generarTemporalizacion(fechaDesde, fechaHasta) {
  if (fechaDesde < FECHA_INICIO_CURSO) fechaDesde = FECHA_INICIO_CURSO;

  const sesiones = [];
  let fecha = fechaDesde;
  while (fecha <= fechaHasta) {
    if (esDiaLectivo(fecha)) {
      const dia = nombreDia(fecha);
      const periodosDelDia = HORARIO_SEMANAL[dia] || [];
      periodosDelDia.forEach(p => {
        sesiones.push({
          id: "S-" + fecha + "-" + p.periodo,
          fecha,
          dia,
          periodo: p.periodo,
          hora: horaDePeriodo(fecha, p.periodo),
          asignatura: p.asignatura,
          libroPaginas: [], // array de nº de página asignados a esta sesión
          actividad: null, // 'lectura' | 'caligrafia' | ... o null
          estado: "pendiente",
          bloqueada: false,
          motivoBloqueo: null
        });
      });
    }
    fecha = sumarDias(fecha, 1);
  }

  TEMPORALIZACION_ACTUAL = sesiones;
  rellenarDesdeInicio();
  PLANIFICACION_ORIGINAL = JSON.parse(JSON.stringify(TEMPORALIZACION_ACTUAL));

  if (typeof renderTemporalizacion === "function") renderTemporalizacion();
}

// Rellena TODAS las sesiones de todas las asignaturas desde el principio,
// consumiendo las colas originales de contenidos.js. Se usa solo la primera
// vez (generarTemporalizacion); después, las reorganizaciones parciales usan
// regenerarAsignaturaDesde(), que es más quirúrgico.
function rellenarDesdeInicio() {
  ORDEN_ASIGNATURAS.forEach(asigId => {
    const cola = ASIGNATURAS[asigId].colaLibro.slice(); // copia: no tocar el original
    let contador = 0;
    TEMPORALIZACION_ACTUAL
      .filter(s => s.asignatura === asigId)
      .sort((a, b) => (a.fecha + "-" + a.periodo).localeCompare(b.fecha + "-" + b.periodo))
      .forEach(s => {
        const n = ASIGNATURAS[asigId].paginasPorSesion;
        s.libroPaginas = cola.splice(0, n);
        s.actividad = siguienteActividad(asigId, contador);
        contador++;
      });
  });
}

// --- Reorganización quirúrgica (Fase 8-9) ---
// Recoge las páginas "sueltas" indicadas (páginasARecuperar) y las vuelve a
// meter al FRENTE de lo que queda pendiente de esa asignatura a partir de
// (sin incluir) la sesión de referencia, y regenera en cascada.
function regenerarAsignaturaDesde(asigId, fechaDesdeSesion, periodoDesdeSesion, paginasARecuperar) {
  const cfg = ASIGNATURAS[asigId];
  const clave = s => s.fecha + "-" + String(s.periodo).padStart(2, "0");
  const claveRef = fechaDesdeSesion + "-" + String(periodoDesdeSesion).padStart(2, "0");

  const futuras = TEMPORALIZACION_ACTUAL
    .filter(s => s.asignatura === asigId && clave(s) > claveRef)
    .sort((a, b) => clave(a).localeCompare(clave(b)));

  // Reconstruye la cola pendiente: las páginas recuperadas van primero,
  // seguidas de las páginas que ya estaban asignadas a las sesiones futuras
  // NO bloqueadas (se "desmontan" para volver a repartirlas en orden).
  let cola = paginasARecuperar.slice();
  futuras.forEach(s => {
    if (!s.bloqueada) cola = cola.concat(s.libroPaginas);
  });

  let contadorActividad = TEMPORALIZACION_ACTUAL
    .filter(s => s.asignatura === asigId && clave(s) <= claveRef)
    .length;

  futuras.forEach(s => {
    if (s.bloqueada) return; // una sesión bloqueada nunca se toca (Sección 29)
    const n = cfg.paginasPorSesion;
    s.libroPaginas = cola.splice(0, n);
    s.actividad = siguienteActividad(asigId, contadorActividad);
    contadorActividad++;
    // Si una sesión futura ya estaba marcada con un estado, al recalcular su
    // contenido se deja como "pendiente" de nuevo para que el profesor la revise.
    if (s.estado !== "pendiente") s.estado = "pendiente";
  });

  // Si sobran páginas y no hay más sesiones futuras generadas, se quedan sin
  // sitio: haría falta ampliar el rango ("Generar temporalización" con una
  // fecha "Hasta" mayor).
  return cola; // páginas que no han cabido (vacío si todo encajó)
}

function indiceSesion(sesionId) {
  return TEMPORALIZACION_ACTUAL.findIndex(s => s.id === sesionId);
}

// --- Fase 7: marcar estados (independiente por asignatura) ---

function marcarRealizado(sesionId) {
  const idx = indiceSesion(sesionId);
  if (idx === -1) return;
  const s = TEMPORALIZACION_ACTUAL[idx];
  if (s.bloqueada) return;
  guardarSnapshotParaDeshacer();
  s.estado = "realizado";
  registrarHistorial(`🟢 ${ASIGNATURAS[s.asignatura].nombre}: sesión del ${s.fecha} (${s.periodo}ª) marcada como REALIZADA.`);
  renderTemporalizacion();
  guardarEstadoLocal();
}

function marcarNoRealizado(sesionId) {
  const idx = indiceSesion(sesionId);
  if (idx === -1) return;
  const s = TEMPORALIZACION_ACTUAL[idx];
  if (s.bloqueada) return;
  guardarSnapshotParaDeshacer();
  const paginasPerdidas = s.libroPaginas;
  s.estado = "no_realizado";
  s.libroPaginas = [];
  s.actividad = null;
  const sinSitio = regenerarAsignaturaDesde(s.asignatura, s.fecha, s.periodo, paginasPerdidas);
  if (sinSitio.length) {
    alert(`No queda sitio en el rango generado para reubicar ${sinSitio.length} página(s) de ${ASIGNATURAS[s.asignatura].nombre}. Amplía la fecha "Hasta" y vuelve a generar.`);
  }
  registrarHistorial(`🔴 ${ASIGNATURAS[s.asignatura].nombre}: sesión del ${s.fecha} (${s.periodo}ª) NO REALIZADA. Reorganizado automáticamente (solo esa asignatura).`);
  renderTemporalizacion();
  guardarEstadoLocal();
}

// paginasCompletadas: cuántas de las páginas asignadas a esta sesión se completaron (0..N)
function marcarPorTerminar(sesionId, paginasCompletadas) {
  const idx = indiceSesion(sesionId);
  if (idx === -1) return;
  const s = TEMPORALIZACION_ACTUAL[idx];
  if (s.bloqueada) return;
  guardarSnapshotParaDeshacer();
  const pendientes = s.libroPaginas.slice(paginasCompletadas);
  s.libroPaginas = s.libroPaginas.slice(0, paginasCompletadas);
  s.estado = "por_terminar";
  let sinSitio = [];
  if (pendientes.length) {
    sinSitio = regenerarAsignaturaDesde(s.asignatura, s.fecha, s.periodo, pendientes);
  }
  if (sinSitio.length) {
    alert(`No queda sitio para reubicar ${sinSitio.length} página(s) pendiente(s). Amplía el rango generado.`);
  }
  registrarHistorial(`🟠 ${ASIGNATURAS[s.asignatura].nombre}: sesión del ${s.fecha} (${s.periodo}ª) POR TERMINAR${pendientes.length ? ` (${pendientes.length} página(s) reorganizada(s))` : ""}.`);
  renderTemporalizacion();
  guardarEstadoLocal();
}

// --- Fase "hacer más/menos páginas" (Sección 21) ---
// nuevaCantidad = cuántas páginas quieres que tenga ESTA sesión en total.
function ajustarPaginasSesion(sesionId, nuevaCantidad) {
  const idx = indiceSesion(sesionId);
  if (idx === -1) return;
  const s = TEMPORALIZACION_ACTUAL[idx];
  if (s.bloqueada) return;
  const cfg = ASIGNATURAS[s.asignatura];
  if (!cfg.colaLibro.length && !s.libroPaginas.length) return; // asignatura sin libro (p.ej. Conocimiento todavía)
  guardarSnapshotParaDeshacer();

  const clave = x => x.fecha + "-" + String(x.periodo).padStart(2, "0");
  const claveRef = clave(s);
  const futuras = TEMPORALIZACION_ACTUAL
    .filter(x => x.asignatura === s.asignatura && clave(x) > claveRef)
    .sort((a, b) => clave(a).localeCompare(clave(b)));

  let pool = s.libroPaginas.slice();
  futuras.forEach(x => { if (!x.bloqueada) pool = pool.concat(x.libroPaginas); });

  s.libroPaginas = pool.splice(0, nuevaCantidad);
  if (s.estado !== "pendiente") s.estado = "pendiente";
  futuras.forEach(x => {
    if (x.bloqueada) return;
    x.libroPaginas = pool.splice(0, cfg.paginasPorSesion);
    if (x.estado !== "pendiente") x.estado = "pendiente";
  });

  registrarHistorial(`✏️ ${cfg.nombre}: ajustadas las páginas de la sesión del ${s.fecha} (${s.periodo}ª) a ${nuevaCantidad}, reorganizando las siguientes.`);
  renderTemporalizacion();
  guardarEstadoLocal();
  return pool; // páginas sobrantes sin sitio (vacío si todo encajó)
}

// --- Fase "acelerar temporalización" (Sección 22) ---
// Cambia cuántas páginas por sesión se dan a partir de fechaDesde (incluida).
function acelerarAsignatura(asigId, nuevaCantidadPorSesion, fechaDesde) {
  const cfg = ASIGNATURAS[asigId];
  guardarSnapshotParaDeshacer();
  cfg.paginasPorSesion = nuevaCantidadPorSesion; // afecta también a generaciones futuras

  const clave = x => x.fecha + "-" + String(x.periodo).padStart(2, "0");
  const futuras = TEMPORALIZACION_ACTUAL
    .filter(x => x.asignatura === asigId && x.fecha >= fechaDesde)
    .sort((a, b) => clave(a).localeCompare(clave(b)));

  let pool = [];
  futuras.forEach(x => { if (!x.bloqueada) pool = pool.concat(x.libroPaginas); });
  futuras.forEach(x => {
    if (x.bloqueada) return;
    x.libroPaginas = pool.splice(0, nuevaCantidadPorSesion);
    if (x.estado !== "pendiente") x.estado = "pendiente";
  });

  registrarHistorial(`⚡ ${cfg.nombre}: temporalización ajustada a ${nuevaCantidadPorSesion} página(s)/sesión desde el ${fechaDesde}.`);
  renderTemporalizacion();
  guardarEstadoLocal();
}

// --- Retraso (Sección 23) ---
// Métrica simple y honesta: sesiones ya pasadas que siguen sin marcar, y
// cuántas páginas representan. No es un cálculo de "ritmo ideal", solo lo
// que se ha quedado sin marcar hasta hoy.
function calcularRetraso(asigId) {
  const hoyISO = new Date().toISOString().slice(0, 10);
  const pasadasSinMarcar = TEMPORALIZACION_ACTUAL.filter(
    s => s.asignatura === asigId && s.fecha < hoyISO && s.estado === "pendiente"
  );
  const paginas = pasadasSinMarcar.reduce((acc, s) => acc + s.libroPaginas.length, 0);
  return { sesiones: pasadasSinMarcar.length, paginas };
}
