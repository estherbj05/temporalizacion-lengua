// js/horario.js
// FASE 4 — Horario. Solo se incluyen los periodos de Lengua, Matemáticas y
// Conocimiento del Medio (Educación Física y los huecos "Libre" no son
// gestionados por esta app). Confirmado a partir del horario personal
// (Tutor 2ºC: Lengua, Mate y Cono + E. Física de otros grupos).

const HORARIO_SEMANAL = {
  lunes: [
    { periodo: 1, asignatura: "lengua" },
    { periodo: 2, asignatura: "lengua" },
    { periodo: 3, asignatura: "matematicas" },
    { periodo: 4, asignatura: "conocimiento" }
  ],
  martes: [
    { periodo: 1, asignatura: "lengua" }
  ],
  miercoles: [
    { periodo: 2, asignatura: "matematicas" },
    { periodo: 3, asignatura: "lengua" },
    { periodo: 5, asignatura: "conocimiento" }
  ],
  jueves: [
    { periodo: 1, asignatura: "lengua" },
    { periodo: 2, asignatura: "matematicas" },
    { periodo: 3, asignatura: "matematicas" },
    { periodo: 4, asignatura: "conocimiento" }
  ],
  viernes: [
    { periodo: 1, asignatura: "lengua" },
    { periodo: 3, asignatura: "matematicas" },
    { periodo: 4, asignatura: "matematicas" },
    { periodo: 5, asignatura: "conocimiento" }
  ]
};

// Solo para mostrar la hora junto a cada sesión (cosmético). Cambia
// automáticamente el 1 de octubre de 2026, como en tu horario en papel.
const HORAS_SEPT_JUNIO = { 1: "9:00-9:35", 2: "9:35-10:10", 3: "10:10-10:45", 4: "10:45-11:20", 5: "11:50-12:25", 6: "12:25-13:00" };
const HORAS_OCT_MAYO = { 1: "9:00-9:45", 2: "9:45-10:30", 3: "10:30-11:15", 4: "11:15-12:00", 5: "12:30-13:15", 6: "13:15-14:00" };

function horaDePeriodo(fechaISO, periodo) {
  const tabla = fechaISO >= "2026-10-01" ? HORAS_OCT_MAYO : HORAS_SEPT_JUNIO;
  return tabla[periodo] || "";
}

// Recuento semanal derivado del horario (no se introduce a mano, Sección 6).
function calcularSesionesSemanales() {
  const totales = { lengua: 0, matematicas: 0, conocimiento: 0 };
  Object.values(HORARIO_SEMANAL).forEach(dia => {
    dia.forEach(p => { totales[p.asignatura] = (totales[p.asignatura] || 0) + 1; });
  });
  return totales;
}
