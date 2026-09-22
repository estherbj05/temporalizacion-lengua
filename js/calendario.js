// js/calendario.js
// FASE 5 — Calendario escolar.
//
// Datos confirmados a partir de "CALENDARIO ESCOLAR CLM · CURSO 2026-2027"
// (Orden 79/2026) para el tramo 01/09/2026 - 31/12/2026.
// Pendiente: las 2 fiestas locales de Cedillo del Condado (aún "se fijan más
// adelante" en el calendario regional) — NO se han inventado, hay que
// añadirlas aquí en cuanto el Ayuntamiento las confirme.

const CALENDARIO_ESCOLAR = [
  { fecha: "2026-09-08", tipo: "inicio_curso", observaciones: "Inicio de curso (2º ciclo Infantil, Primaria)" },
  { fecha: "2026-10-12", tipo: "festivo", observaciones: "Fiesta Nacional" },
  { fecha: "2026-11-02", tipo: "festivo", observaciones: "Todos los Santos (trasladado)" },
  { fecha: "2026-11-20", tipo: "no_lectivo", observaciones: "Día de la Enseñanza" },
  { fecha: "2026-12-06", tipo: "festivo", observaciones: "Día de la Constitución" },
  { fecha: "2026-12-07", tipo: "no_lectivo", observaciones: "Día sin actividad lectiva nº1" },
  { fecha: "2026-12-08", tipo: "festivo", observaciones: "Inmaculada Concepción" },
  { fecha: "2026-12-23", tipo: "vacaciones", observaciones: "Inicio vacaciones de Navidad (hasta 10/01/2027)" }
  // Del 24/12/2026 al 31/12/2026 -> vacaciones de Navidad (se expanden en runtime, ver expandirVacaciones()).
];

// TODO (pendiente de dato real): 2 fiestas locales de Cedillo del Condado.
const FIESTAS_LOCALES = [];

function esFinDeSemana(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const dia = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=domingo, 6=sábado
  return dia === 0 || dia === 6;
}

function esDiaLectivo(fechaISO) {
  if (esFinDeSemana(fechaISO)) return false;
  const marcado = CALENDARIO_ESCOLAR.find(d => d.fecha === fechaISO);
  if (marcado && ["festivo", "no_lectivo", "vacaciones"].includes(marcado.tipo)) return false;
  if (FIESTAS_LOCALES.includes(fechaISO)) return false;
  // Vacaciones de Navidad: 23/12/2026 - 10/01/2027 (inclusive)
  if (fechaISO >= "2026-12-23" && fechaISO <= "2027-01-10") return false;
  return true;
}

// Se completará en la Fase 5 con la interfaz para editar/añadir días manualmente.
