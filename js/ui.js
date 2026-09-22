// js/ui.js
// FASE 1 (interfaz), FASE 7-10 (acciones de estado/bloqueo/historial en pantalla) y FASE 12 (exportar CSV).

let SESION_HOY_ID = null;

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

function initTabsContenidos() {
  const tabs = document.querySelectorAll("#contenidos-tabs .tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderTablaContenidos(tab.dataset.tipo);
    });
  });
}

function renderTablaContenidos(tipo) {
  const tbody = document.querySelector("#tabla-contenidos tbody");
  tbody.innerHTML = "";
  (CONTENIDOS[tipo] || []).forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.orden}</td><td>${item.descripcion}</td><td>${item.estado || "pendiente"}</td><td>${item.fechaPrevista || "—"}</td><td>—</td>`;
    tbody.appendChild(tr);
  });
}

const NOMBRES_DIA_LARGO = { lunes: "LUNES", martes: "MARTES", miercoles: "MIÉRCOLES", jueves: "JUEVES", viernes: "VIERNES" };

function formatoFechaLarga(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  const mesTexto = fecha.toLocaleDateString("es-ES", { month: "long", timeZone: "UTC" }).toUpperCase();
  return `${NOMBRES_DIA_LARGO[nombreDia(fechaISO)]} ${d} DE ${mesTexto}`;
}

function celdaAviso(activo, etiqueta) {
  return activo ? `<span class="aviso-toca">✔️ Toca ${etiqueta}</span>` : "—";
}

function estadoIcono(estado) {
  return { realizado: "🟢", por_terminar: "🟠", no_realizado: "🔴", pendiente: "⚪" }[estado] || "⚪";
}

function pintarFilas(tbodyId, sesiones) {
  const tbody = document.querySelector(`#${tbodyId} tbody`);
  if (!tbody) return;
  tbody.innerHTML = sesiones.map(s => `
    <tr data-sesion-id="${s.id}" class="${s.bloqueada ? "fila-bloqueada" : ""}">
      <td>${s.fecha.split("-").reverse().slice(0, 2).join("/")}</td>
      <td>${NOMBRES_DIA_LARGO[s.dia] || s.dia}</td>
      <td>${s.libro || (s.estado === "no_realizado" || s.estado === "por_terminar" ? "❌" : "—")}</td>
      <td>${celdaAviso(s.caligrafia, "caligrafía")}</td>
      <td>${celdaAviso(s.lectura, "lectura")}</td>
      <td>${celdaAviso(s.copia, "copia")}</td>
      <td>${estadoIcono(s.estado)}</td>
      <td class="acciones-fila">
        ${s.bloqueada
          ? `<button class="mini-btn" data-accion="desbloquear" title="Desbloquear">🔓</button>`
          : `<button class="mini-btn" data-accion="realizado" title="Realizado">🟢</button>
             <button class="mini-btn" data-accion="por-terminar" title="Por terminar">🟠</button>
             <button class="mini-btn" data-accion="no-realizado" title="No realizado">🔴</button>
             <button class="mini-btn" data-accion="bloquear" title="Bloquear">🔒</button>`}
      </td>
    </tr>`).join("");
}

function initAccionesTabla() {
  document.querySelectorAll("#tabla-semana tbody, #tabla-mes tbody, #tabla-curso tbody").forEach(tbody => {
    tbody.addEventListener("click", e => {
      const btn = e.target.closest(".mini-btn");
      if (!btn) return;
      const tr = e.target.closest("tr");
      const sesionId = tr.dataset.sesionId;
      ejecutarAccion(btn.dataset.accion, sesionId);
    });
  });
}

function ejecutarAccion(accion, sesionId) {
  if (accion === "realizado") marcarRealizado(sesionId);
  else if (accion === "no-realizado") marcarNoRealizado(sesionId);
  else if (accion === "por-terminar") abrirModalPendiente(sesionId);
  else if (accion === "bloquear") {
    const motivo = window.prompt("Motivo del bloqueo (por ejemplo: EXAMEN):", "");
    if (motivo !== null) bloquearSesion(sesionId, motivo || "Bloqueada manualmente");
  } else if (accion === "desbloquear") desbloquearSesion(sesionId);
}

let SESION_MODAL_PENDIENTE_ID = null;

function abrirModalPendiente(sesionId) {
  SESION_MODAL_PENDIENTE_ID = sesionId;
  abrirModal("modal-pendiente");
}

function renderHoy() {
  const hoyISO = new Date().toISOString().slice(0, 10);
  let sesion = TEMPORALIZACION_ACTUAL.find(s => s.fecha === hoyISO);
  if (!sesion) sesion = TEMPORALIZACION_ACTUAL.find(s => s.fecha >= hoyISO) || TEMPORALIZACION_ACTUAL[0];
  if (!sesion) return;

  SESION_HOY_ID = sesion.id;
  document.getElementById("today-date").textContent = "HOY — " + formatoFechaLarga(sesion.fecha);
  document.getElementById("today-libro").textContent = sesion.libro
    ? sesion.libro
    : (sesion.estado === "no_realizado" ? "❌ (movida a otra sesión)" : "Sin libro (fuera de rango de páginas)");
  document.getElementById("today-caligrafia").textContent = sesion.caligrafia ? "Toca caligrafía" : "No toca";
  document.getElementById("today-lectura").textContent = sesion.lectura ? "Toca lectura" : "No toca";
  document.getElementById("today-copia").textContent = sesion.copia ? "Toca copia" : "No toca";

  document.querySelectorAll(".status-btn").forEach(b => b.disabled = !!sesion.bloqueada);
}

function renderProgreso() {
  const total = CONTENIDOS.libro.length;
  const hechas = TEMPORALIZACION_ACTUAL.filter(s => s.estado === "realizado" && s.libroId).length;
  document.getElementById("progreso-libro").textContent = `${hechas} / ${total}`;
  document.getElementById("progreso-libro-fill").style.width = total ? `${(hechas / total) * 100}%` : "0%";
}

function renderHistorial() {
  const ul = document.getElementById("historial-list");
  if (!ul) return;
  ul.innerHTML = HISTORIAL.map(h => {
    const f = new Date(h.fecha);
    const fechaTexto = f.toLocaleDateString("es-ES") + " " + f.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    return `<li><strong>${fechaTexto}</strong> — ${h.descripcion}</li>`;
  }).join("") || "<li>Todavía no hay cambios registrados.</li>";
}

function renderTemporalizacion() {
  const hoyISO = new Date().toISOString().slice(0, 10);
  const finSemana = sumarDias(hoyISO, 7);
  const finMes = sumarDias(hoyISO, 30);

  pintarFilas("tabla-semana", TEMPORALIZACION_ACTUAL.filter(s => s.fecha >= hoyISO && s.fecha <= finSemana));
  pintarFilas("tabla-mes", TEMPORALIZACION_ACTUAL.filter(s => s.fecha >= hoyISO && s.fecha <= finMes));
  pintarFilas("tabla-curso", TEMPORALIZACION_ACTUAL);
  renderHoy();
  renderProgreso();
  renderHistorial();
}

function abrirModal(id) {
  document.getElementById(id).classList.add("open");
}
function cerrarModal(id) {
  document.getElementById(id).classList.remove("open");
}

function initModales() {
  document.getElementById("modal-pendiente-cancelar").addEventListener("click", () => cerrarModal("modal-pendiente"));
  document.getElementById("modal-pendiente-si").addEventListener("click", () => {
    if (SESION_MODAL_PENDIENTE_ID) marcarPorTerminar(SESION_MODAL_PENDIENTE_ID, true);
    cerrarModal("modal-pendiente");
  });
  document.getElementById("modal-pendiente-no").addEventListener("click", () => {
    if (SESION_MODAL_PENDIENTE_ID) marcarPorTerminar(SESION_MODAL_PENDIENTE_ID, false);
    cerrarModal("modal-pendiente");
  });
}

function initEstadoSesion() {
  document.querySelectorAll(".status-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!SESION_HOY_ID) return;
      if (btn.dataset.status === "realizado") marcarRealizado(SESION_HOY_ID);
      else if (btn.dataset.status === "no-realizado") marcarNoRealizado(SESION_HOY_ID);
      else if (btn.dataset.status === "por-terminar") abrirModalPendiente(SESION_HOY_ID);
    });
  });
}

// --- Exportación CSV (Fase 12) ---
function exportarCSV() {
  const cabecera = ["Fecha", "Dia", "Libro", "Caligrafia", "Lectura", "Copia", "Estado"];
  const filas = TEMPORALIZACION_ACTUAL.map(s => [
    s.fecha,
    s.dia,
    s.libro || "",
    s.caligrafia ? "Toca" : "",
    s.lectura ? "Toca" : "",
    s.copia ? "Toca" : "",
    s.estado
  ]);
  const csv = [cabecera, ...filas].map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "temporalizacion-lengua.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function initExportacion() {
  document.getElementById("export-csv")?.addEventListener("click", exportarCSV);
  document.getElementById("export-pdf")?.addEventListener("click", () => window.print());
  document.getElementById("export-excel")?.addEventListener("click", exportarCSV); // de momento, mismo CSV (se abre bien en Excel)
}
