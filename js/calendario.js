// js/calendario.js
// FASE 5 — Calendario escolar.
// Datos del cartel oficial "Calendario Escolar 2026/2027" de
// educacion.castillalamancha.es. Cubre hasta diciembre de 2026 (se puede
// ampliar más adelante con el resto del curso).
//
// La temporalización NUNCA debe generar sesiones antes de esta fecha,
// aunque se pida un rango "Desde" anterior:
const FECHA_INICIO_CURSO = "2026-09-28";

const CALENDARIO_ESCOLAR = [
  { fecha: "2026-10-12", tipo: "festivo", observaciones: "Fiesta Nacional de España" },
  { fecha: "2026-11-02", tipo: "festivo", observaciones: "En sustitución al Día de Todos los Santos" },
  { fecha: "2026-11-20", tipo: "no_lectivo", observaciones: "Día de la Enseñanza" },
  { fecha: "2026-12-07", tipo: "no_lectivo", observaciones: "Día sin actividad lectiva" },
  { fecha: "2026-12-08", tipo: "festivo", observaciones: "Inmaculada Concepción" }
  // Vacaciones de Navidad (23/12/2026 - 08/01/2027) se comprueban aparte, ver esDiaLectivo().
];

// Pendiente de dato real: días de libre disposición del centro / fiestas locales de
// Cedillo del Condado (el cartel regional no los fija). No se inventan.
const FIESTAS_LOCALES = [];

function esFinDeSemana(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const dia = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dia === 0 || dia === 6;
}

function esDiaLectivo(fechaISO) {
  if (fechaISO < FECHA_INICIO_CURSO) return false;
  if (esFinDeSemana(fechaISO)) return false;
  const marcado = CALENDARIO_ESCOLAR.find(d => d.fecha === fechaISO);
  if (marcado && ["festivo", "no_lectivo", "vacaciones"].includes(marcado.tipo)) return false;
  if (FIESTAS_LOCALES.includes(fechaISO)) return false;
  // Vacaciones de Navidad: 23/12/2026 - 08/01/2027 (inclusive)
  if (fechaISO >= "2026-12-23" && fechaISO <= "2027-01-08") return false;
  return true;
}
