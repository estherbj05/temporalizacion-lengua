// js/ui.js
// Interfaz: navegación, vista "Hoy" (una tarjeta por sesión), tablas con
// filtro por asignatura, progreso por asignatura, panel de contenidos/ritmo
// y exportación CSV.

let FILTRO_ASIGNATURA_ACTUAL = "todas";

function initNavegacion() {
  const botones = document.querySelectorAll(".nav-btn");
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      botones.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      document.getElementById("view-" + btn.dataset.view).classList.add("active");
    });
  });
}

function initFiltrosAsignatura() {
  document.querySelectorAll(".filtro-asignatura[data-tabla]").forEach(grupo => {
    const tablaId = grupo.dataset.tabla;
    grupo.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        grupo.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderTabla(tablaId, btn.dataset.asig);
      });
    });
  });
}

const NOMBRES_DIA_LARGO = { lunes: "LUNES", martes: "MARTES", miercoles: "MIÉRCOLES", jueves: "JUEVES", viernes: "VIERNES" };

function formatoFechaLarga(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  const mesTexto = fecha.toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" }).toUpperCase();
  return `${NOMBRES_DIA_LARGO[nombreDia(fechaISO)]} ${d} DE ${mesTexto}`;
}

function textoContenido(s) {
  const partes = [];
  const rango = formatoRangoPaginas(s.libroPaginas);
  if (rango) partes.push("📖 " + rango);
  if (s.actividad) {
    const cfg = ASIGNATURAS[s.asignatura];
    partes.push((cfg.actividadIcono[s.actividad] || "") + " " + cfg.actividadLabel[s.actividad]);
  }
  if (!partes.length) return s.estado === "no_realizado" ? "❌" : "—";
  return partes.join(" · ");
}

function estadoIcono(estado) {
  return { realizado: "🟢", por_terminar: "🟠", no_realizado: "🔴", pendiente: "⚪" }[estado] || "⚪";
}

function estadoTexto(estado) {
  return { realizado: "Realizado", por_terminar: "Por terminar", no_realizado: "No realizado", pendiente: "Pendiente" }[estado] || estado;
}

function badgeAsignatura(asigId) {
  const cfg = ASIGNATURAS[asigId];
  return `<span class="badge-asignatura" style="background:${cfg.color}">${cfg.icono} ${cfg.nombre}</span>`;
}

// --- Vista HOY: una tarjeta por cada sesión del día ---
function renderHoy() {
  const hoyISO = new Date().toISOString().slice(0, 10);
  let sesionesHoy = TEMPORALIZACION_ACTUAL.filter(s => s.fecha === hoyISO);
  let fechaMostrada = hoyISO;

  if (!sesionesHoy.length) {
    const siguienteFecha = TEMPORALIZACION_ACTUAL.map(s => s.fecha).filter(f => f >= hoyISO).sort()[0];
    if (siguienteFecha) {
      sesionesHoy = TEMPORALIZACION_ACTUAL.filter(s => s.fecha === siguienteFecha);
      fechaMostrada = siguienteFecha;
    }
  }

  document.getElementById("hoy-fecha").textContent = sesionesHoy.length
    ? (fechaMostrada === hoyISO ? "HOY — " : "PRÓXIMA SESIÓN — ") + formatoFechaLarga(fechaMostrada)
    : "No hay sesiones generadas para hoy";

  sesionesHoy.sort((a, b) => a.periodo - b.periodo);

  const cont = document.getElementById("hoy-lista");
  cont.innerHTML = sesionesHoy.map(s => {
    const cfg = ASIGNATURAS[s.asignatura];
    return `
    <div class="sesion-card" data-sesion-id="${s.id}" style="border-left-color:${cfg.color}">
      <div class="sesion-card-header">
        <span class="sesion-card-titulo">${cfg.icono} ${s.periodo}ª sesión — ${cfg.nombre}</span>
        <span class="sesion-card-hora">${s.hora || ""} · ${estadoIcono(s.estado)} ${estadoTexto(s.estado)}</span>
      </div>
      <div class="sesion-card-contenido">${textoContenido(s)}</div>
      ${s.bloqueada
        ? `<span class="hint">🔒 Bloqueada (${s.motivoBloqueo || ""}) — no se reorganiza automáticamente</span>`
        : `<div class="status-buttons">
             <button class="status-btn status-green" data-accion="realizado" data-sesion-id="${s.id}">🟢 Realizado</button>
             <button class="status-btn status-orange" data-accion="por-terminar" data-sesion-id="${s.id}">🟠 Por terminar</button>
             <button class="status-btn status-red" data-accion="no-realizado" data-sesion-id="${s.id}">🔴 No realizado</button>
             ${s.libroPaginas.length || ASIGNATURAS[s.asignatura].colaLibro.length ? `<button class="btn btn-secondary" data-accion="mas-paginas" data-sesion-id="${s.id}">➕ Más páginas</button>` : ""}
             <button class="mini-btn" data-accion="bloquear" data-sesion-id="${s.id}" title="Bloquear">🔒</button>
           </div>`}
    </div>`;
  }).join("") || "<p class=\"hint\">Genera la temporalización para ver las sesiones.</p>";
}

function initAccionesHoy() {
  document.getElementById("hoy-lista").addEventListener("click", e => {
    const btn = e.target.closest("[data-accion]");
    if (!btn) return;
    ejecutarAccion(btn.dataset.accion, btn.dataset.sesionId);
  });
}

// --- Tablas Semana/Mes/Curso con filtro por asignatura ---
function pintarFilas(tbodyId, sesiones) {
  const tbody = document.querySelector(`#${tbodyId} tbody`);
  if (!tbody) return;
  tbody.innerHTML = sesiones.map(s => `
    <tr data-sesion-id="${s.id}" class="${s.bloqueada ? "fila-bloqueada" : ""}">
      <td>${s.fecha.split("-").reverse().join("/")}</td>
      <td>${NOMBRES_DIA_LARGO[s.dia] || s.dia}</td>
      <td>${s.periodo}ª ${s.hora ? "(" + s.hora + ")" : ""}</td>
      <td>${badgeAsignatura(s.asignatura)}</td>
      <td>${textoContenido(s)}</td>
      <td>${estadoIcono(s.estado)} ${estadoTexto(s.estado)}</td>
      <td class="acciones-fila">
        ${s.bloqueada
          ? `<button class="mini-btn" data-accion="desbloquear" data-sesion-id="${s.id}" title="Desbloquear">🔓</button>`
          : `<button class="mini-btn" data-accion="realizado" data-sesion-id="${s.id}" title="Realizado">🟢</button>
             <button class="mini-btn" data-accion="por-terminar" data-sesion-id="${s.id}" title="Por terminar">🟠</button>
             <button class="mini-btn" data-accion="no-realizado" data-sesion-id="${s.id}" title="No realizado">🔴</button>
             <button class="mini-btn" data-accion="mas-paginas" data-sesion-id="${s.id}" title="Más páginas">➕</button>
             <button class="mini-btn" data-accion="bloquear" data-sesion-id="${s.id}" title="Bloquear">🔒</button>`}
      </td>
    </tr>`).join("");
}

function renderTabla(tablaId, filtroAsig) {
  const hoyISO = new Date().toISOString().slice(0, 10);
  let desde, hasta;
  if (tablaId === "tabla-semana") { desde = hoyISO; hasta = sumarDias(hoyISO, 7); }
  else if (tablaId === "tabla-mes") { desde = hoyISO; hasta = sumarDias(hoyISO, 30); }
  else { desde = "0000-00-00"; hasta = "9999-99-99"; } // tabla-curso: todo lo generado

  let sesiones = TEMPORALIZACION_ACTUAL.filter(s => s.fecha >= desde && s.fecha <= hasta);
  if (filtroAsig && filtroAsig !== "todas") sesiones = sesiones.filter(s => s.asignatura === filtroAsig);
  sesiones.sort((a, b) => (a.fecha + "-" + a.periodo).localeCompare(b.fecha + "-" + b.periodo));
  pintarFilas(tablaId, sesiones);
}

function initAccionesTabla() {
  ["tabla-semana", "tabla-mes", "tabla-curso"].forEach(id => {
    const tbody = document.querySelector(`#${id} tbody`);
    if (!tbody) return;
    tbody.addEventListener("click", e => {
      const btn = e.target.closest("[data-accion]");
      if (!btn) return;
      ejecutarAccion(btn.dataset.accion, btn.dataset.sesionId);
    });
  });
}

let SESION_MODAL_PENDIENTE_ID = null;

function ejecutarAccion(accion, sesionId) {
  const s = TEMPORALIZACION_ACTUAL.find(x => x.id === sesionId);
  if (!s) return;
  if (accion === "realizado") marcarRealizado(sesionId);
  else if (accion === "no-realizado") marcarNoRealizado(sesionId);
  else if (accion === "por-terminar") abrirModalPendiente(sesionId);
  else if (accion === "mas-paginas") {
    const actuales = s.libroPaginas.length;
    const respuesta = window.prompt(`Esta sesión tiene ${actuales} página(s) asignada(s). ¿Cuántas páginas quieres que tenga en total?`, String(actuales + 1));
    if (respuesta === null) return;
    const n = parseInt(respuesta, 10);
    if (isNaN(n) || n < 0) return;
    const sinSitio = ajustarPaginasSesion(sesionId, n);
    if (sinSitio && sinSitio.length) alert(`${sinSitio.length} página(s) se han quedado sin sitio en el rango generado. Amplía la fecha "Hasta" en Todo el curso.`);
  } else if (accion === "bloquear") {
    const motivo = window.prompt("Motivo del bloqueo (por ejemplo: EXAMEN):", "");
    if (motivo !== null) bloquearSesion(sesionId, motivo || "Bloqueada manualmente");
  } else if (accion === "desbloquear") desbloquearSesion(sesionId);
}

function abrirModalPendiente(sesionId) {
  const s = TEMPORALIZACION_ACTUAL.find(x => x.id === sesionId);
  if (!s) return;
  SESION_MODAL_PENDIENTE_ID = sesionId;
  const total = s.libroPaginas.length;
  document.getElementById("modal-pendiente-info").textContent = total
    ? `Esta sesión tenía asignadas: ${formatoRangoPaginas(s.libroPaginas)} (${total} página(s)).`
    : "Esta sesión no tenía páginas de libro asignadas.";
  const input = document.getElementById("modal-pendiente-cantidad");
  input.max = total;
  input.value = total;
  abrirModal("modal-pendiente");
}

// --- Progreso por asignatura ---
function renderProgreso() {
  const cont = document.getElementById("progreso-grid");
  cont.innerHTML = ORDEN_ASIGNATURAS.map(asigId => {
    const cfg = ASIGNATURAS[asigId];
    const sesionesAsig = TEMPORALIZACION_ACTUAL.filter(s => s.asignatura === asigId);
    const totalPaginas = cfg.colaLibro.length;
    const hechas = sesionesAsig.filter(s => s.estado === "realizado").reduce((acc, s) => acc + s.libroPaginas.length, 0);
    const retraso = calcularRetraso(asigId);
    const pct = totalPaginas ? Math.round((hechas / totalPaginas) * 100) : 0;
    return `
    <div class="progreso-card">
      <h3>${cfg.icono} ${cfg.nombre}</h3>
      ${totalPaginas
        ? `<p class="progreso-num">${hechas} / ${totalPaginas} páginas</p>
           <div class="progreso-bar"><div class="progreso-fill" style="width:${pct}%;background:${cfg.color}"></div></div>`
        : `<p class="hint">Sin contenidos de libro todavía.</p>`}
      <p class="hint" style="margin-top:10px;">${retraso.sesiones ? `⏳ ${retraso.sesiones} sesión(es) pasada(s) sin marcar (${retraso.paginas} página(s))` : "✅ Al día"}</p>
    </div>`;
  }).join("");
}

// --- Historial ---
function renderHistorial() {
  const ul = document.getElementById("historial-list");
  if (!ul) return;
  ul.innerHTML = HISTORIAL.map(h => {
    const f = new Date(h.fecha);
    const fechaTexto = f.toLocaleDateString("es-ES") + " " + f.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    return `<li><strong>${fechaTexto}</strong> — ${h.descripcion}</li>`;
  }).join("") || "<li>Todavía no hay cambios registrados.</li>";
}

// --- Contenidos y ritmo por asignatura (incluye "Acelerar") ---
function renderContenidos() {
  const cont = document.getElementById("contenidos-asignaturas");
  cont.innerHTML = ORDEN_ASIGNATURAS.map(asigId => {
    const cfg = ASIGNATURAS[asigId];
    const sesionesAsig = TEMPORALIZACION_ACTUAL.filter(s => s.asignatura === asigId).sort((a, b) => (a.fecha + a.periodo).localeCompare(b.fecha + b.periodo));
    const pendientesFuturas = sesionesAsig.filter(s => s.estado === "pendiente" || s.estado === "por_terminar");
    const paginasPendientes = pendientesFuturas.reduce((acc, s) => acc + s.libroPaginas.length, 0);

    if (!cfg.colaLibro.length) {
      return `<div class="asignatura-bloque">
        <h3>${cfg.icono} ${cfg.nombre}</h3>
        <p class="hint">Todavía no tiene contenidos de libro (unidades, temas, páginas o fichas). Cuando me los pases, los añado sin tocar Lengua ni Matemáticas.</p>
      </div>`;
    }

    return `<div class="asignatura-bloque">
      <h3>${cfg.icono} ${cfg.nombre}</h3>
      <p class="hint">${cfg.colaLibro.length} páginas en total · ${cfg.paginasPorSesion} página(s)/sesión actualmente · ${paginasPendientes} página(s) todavía por dar.</p>
      <div class="asignatura-controles">
        <label>Acelerar a <input type="number" min="1" value="${cfg.paginasPorSesion}" id="acelerar-cantidad-${asigId}"> pág./sesión</label>
        <label>desde <input type="date" id="acelerar-fecha-${asigId}" value="${new Date().toISOString().slice(0, 10)}"></label>
        <button class="btn btn-secondary" data-acelerar="${asigId}">⚡ Aplicar</button>
      </div>
    </div>`;
  }).join("");

  cont.querySelectorAll("[data-acelerar]").forEach(btn => {
    btn.addEventListener("click", () => {
      const asigId = btn.dataset.acelerar;
      const cantidad = parseInt(document.getElementById(`acelerar-cantidad-${asigId}`).value, 10);
      const fecha = document.getElementById(`acelerar-fecha-${asigId}`).value;
      if (!cantidad || cantidad < 1 || !fecha) return;
      acelerarAsignatura(asigId, cantidad, fecha);
      renderContenidos();
    });
  });
}

// --- Horario (solo lectura) ---
function renderHorario() {
  const dias = ["lunes", "martes", "miercoles", "jueves", "viernes"];
  const tbody = document.querySelector("#tabla-horario tbody");
  tbody.innerHTML = dias.map(dia => {
    const celdas = [1, 2, 3, 4, 5, 6].map(periodo => {
      const entrada = (HORARIO_SEMANAL[dia] || []).find(p => p.periodo === periodo);
      if (!entrada) return "<td>—</td>";
      const cfg = ASIGNATURAS[entrada.asignatura];
      return `<td>${badgeAsignatura(entrada.asignatura)}</td>`;
    }).join("");
    return `<tr><td><strong>${NOMBRES_DIA_LARGO[dia]}</strong></td>${celdas}</tr>`;
  }).join("");
}

// --- Calendario (solo lectura) ---
function renderCalendario() {
  document.getElementById("fecha-inicio-texto").textContent = FECHA_INICIO_CURSO.split("-").reverse().join("/");
  const tbody = document.querySelector("#tabla-calendario tbody");
  const filas = CALENDARIO_ESCOLAR.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
  filas.push({ fecha: "2026-12-23 a 2027-01-08", tipo: "vacaciones", observaciones: "Vacaciones de Navidad" });
  tbody.innerHTML = filas.map(f => `<tr><td>${f.fecha}</td><td>${f.tipo}</td><td>${f.observaciones}</td></tr>`).join("");
}

// --- Orquestador general ---
function renderTemporalizacion() {
  renderHoy();
  renderTabla("tabla-semana", document.querySelector('.filtro-asignatura[data-tabla="tabla-semana"] .tab-btn.active')?.dataset.asig || "todas");
  renderTabla("tabla-mes", document.querySelector('.filtro-asignatura[data-tabla="tabla-mes"] .tab-btn.active')?.dataset.asig || "todas");
  renderTabla("tabla-curso", document.querySelector('.filtro-asignatura[data-tabla="tabla-curso"] .tab-btn.active')?.dataset.asig || "todas");
  renderProgreso();
  renderHistorial();
  renderContenidos();
}

function abrirModal(id) {
  document.getElementById(id).classList.add("open");
}
function cerrarModal(id) {
  document.getElementById(id).classList.remove("open");
}

function initModales() {
  document.getElementById("modal-pendiente-cancelar").addEventListener("click", () => cerrarModal("modal-pendiente"));
  document.getElementById("modal-pendiente-confirmar").addEventListener("click", () => {
    const cantidad = parseInt(document.getElementById("modal-pendiente-cantidad").value, 10) || 0;
    if (SESION_MODAL_PENDIENTE_ID) marcarPorTerminar(SESION_MODAL_PENDIENTE_ID, cantidad);
    cerrarModal("modal-pendiente");
  });
}

// --- Exportación CSV (Fase 12) ---
function exportarCSV() {
  const cabecera = ["Fecha", "Dia", "Periodo", "Hora", "Asignatura", "Contenido", "Estado"];
  const filas = TEMPORALIZACION_ACTUAL
    .sort((a, b) => (a.fecha + a.periodo).localeCompare(b.fecha + b.periodo))
    .map(s => [s.fecha, s.dia, s.periodo, s.hora, ASIGNATURAS[s.asignatura].nombre, textoContenido(s).replace(/·/g, "-"), estadoTexto(s.estado)]);
  const csv = [cabecera, ...filas].map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "temporalizacion.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function initExportacion() {
  document.getElementById("export-csv")?.addEventListener("click", exportarCSV);
  document.getElementById("export-pdf")?.addEventListener("click", () => window.print());
  document.getElementById("export-excel")?.addEventListener("click", exportarCSV);
}
