// js/contenidos.js
// FASE 3 y FASE 6 — Contenidos por asignatura.
//
// Cada asignatura tiene una "cola" de páginas de libro pendientes (en el orden
// exacto indicado) y, opcionalmente, una lista de actividades complementarias
// que se reparten por turno (round-robin) entre las sesiones que no llevan
// página de libro asignada ese día, o junto a ella si toca.
//
// Confirmado por el profesor — NO inventar ni modificar sin que él lo pida:
//   Lengua:      16-33, 36-53, 56-79  (60 páginas)
//   Matemáticas: 8-11, 14-31, 34-51, 54-71  (58 páginas)
//   Conocimiento del Medio: sin contenidos todavía (módulo preparado, vacío).

const ASIGNATURAS = {
  lengua: {
    id: "lengua",
    nombre: "Lengua",
    icono: "📖",
    color: "#2f5fce",
    colaLibro: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
    actividades: ["lectura", "caligrafia", "dictado"],
    actividadLabel: { lectura: "Lectura", caligrafia: "Caligrafía", dictado: "Dictado/Copia" },
    actividadIcono: { lectura: "📚", caligrafia: "✍️", dictado: "📝" },
    paginasPorSesion: 1
  },
  matematicas: {
    id: "matematicas",
    nombre: "Matemáticas",
    icono: "🔢",
    color: "#c2540f",
    colaLibro: [8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
    actividades: ["calculo", "cuentas", "problemas"],
    actividadLabel: { calculo: "Cálculo mental", cuentas: "Cuentas", problemas: "Problemas" },
    actividadIcono: { calculo: "🧠", cuentas: "➗", problemas: "🧩" },
    paginasPorSesion: 1
  },
  conocimiento: {
    id: "conocimiento",
    nombre: "Conocimiento del Medio",
    icono: "🌍",
    color: "#2f9e6e",
    // Confirmado: 10-25, 28-43, 46-63 (50 páginas). Sin actividades complementarias
    // propias por ahora (no se han indicado); si en el futuro se añaden fichas u
    // otras actividades, se pondrían aquí igual que en Lengua/Matemáticas.
    colaLibro: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
    actividades: [],
    actividadLabel: {},
    actividadIcono: {},
    paginasPorSesion: 1
  }
};

const ORDEN_ASIGNATURAS = ["lengua", "matematicas", "conocimiento"];

function siguienteActividad(asignaturaId, contadorSesionAsignatura) {
  const cfg = ASIGNATURAS[asignaturaId];
  if (!cfg.actividades.length) return null;
  return cfg.actividades[contadorSesionAsignatura % cfg.actividades.length];
}
