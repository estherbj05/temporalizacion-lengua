// js/contenidos.js
// FASE 3 — Carga de contenidos.
//
// Aquí se guardarán, en el orden exacto indicado, los 4 tipos de contenido:
// LIBRO, CALIGRAFÍA, LECTURA, COPIA. Por ahora están vacíos a propósito:
// según el prompt maestro, estos datos los debe aportar el profesor
// (no deben inventarse ni deducirse automáticamente del libro escaneado).

const CONTENIDOS = {
  // Confirmado: páginas 10-27, 30-47 y 50-69 (56 páginas), una por sesión.
  libro: [
  { id: "L001", orden: 1, descripcion: "Página 10", estado: "pendiente", fechaPrevista: null },
  { id: "L002", orden: 2, descripcion: "Página 11", estado: "pendiente", fechaPrevista: null },
  { id: "L003", orden: 3, descripcion: "Página 12", estado: "pendiente", fechaPrevista: null },
  { id: "L004", orden: 4, descripcion: "Página 13", estado: "pendiente", fechaPrevista: null },
  { id: "L005", orden: 5, descripcion: "Página 14", estado: "pendiente", fechaPrevista: null },
  { id: "L006", orden: 6, descripcion: "Página 15", estado: "pendiente", fechaPrevista: null },
  { id: "L007", orden: 7, descripcion: "Página 16", estado: "pendiente", fechaPrevista: null },
  { id: "L008", orden: 8, descripcion: "Página 17", estado: "pendiente", fechaPrevista: null },
  { id: "L009", orden: 9, descripcion: "Página 18", estado: "pendiente", fechaPrevista: null },
  { id: "L010", orden: 10, descripcion: "Página 19", estado: "pendiente", fechaPrevista: null },
  { id: "L011", orden: 11, descripcion: "Página 20", estado: "pendiente", fechaPrevista: null },
  { id: "L012", orden: 12, descripcion: "Página 21", estado: "pendiente", fechaPrevista: null },
  { id: "L013", orden: 13, descripcion: "Página 22", estado: "pendiente", fechaPrevista: null },
  { id: "L014", orden: 14, descripcion: "Página 23", estado: "pendiente", fechaPrevista: null },
  { id: "L015", orden: 15, descripcion: "Página 24", estado: "pendiente", fechaPrevista: null },
  { id: "L016", orden: 16, descripcion: "Página 25", estado: "pendiente", fechaPrevista: null },
  { id: "L017", orden: 17, descripcion: "Página 26", estado: "pendiente", fechaPrevista: null },
  { id: "L018", orden: 18, descripcion: "Página 27", estado: "pendiente", fechaPrevista: null },
  { id: "L019", orden: 19, descripcion: "Página 30", estado: "pendiente", fechaPrevista: null },
  { id: "L020", orden: 20, descripcion: "Página 31", estado: "pendiente", fechaPrevista: null },
  { id: "L021", orden: 21, descripcion: "Página 32", estado: "pendiente", fechaPrevista: null },
  { id: "L022", orden: 22, descripcion: "Página 33", estado: "pendiente", fechaPrevista: null },
  { id: "L023", orden: 23, descripcion: "Página 34", estado: "pendiente", fechaPrevista: null },
  { id: "L024", orden: 24, descripcion: "Página 35", estado: "pendiente", fechaPrevista: null },
  { id: "L025", orden: 25, descripcion: "Página 36", estado: "pendiente", fechaPrevista: null },
  { id: "L026", orden: 26, descripcion: "Página 37", estado: "pendiente", fechaPrevista: null },
  { id: "L027", orden: 27, descripcion: "Página 38", estado: "pendiente", fechaPrevista: null },
  { id: "L028", orden: 28, descripcion: "Página 39", estado: "pendiente", fechaPrevista: null },
  { id: "L029", orden: 29, descripcion: "Página 40", estado: "pendiente", fechaPrevista: null },
  { id: "L030", orden: 30, descripcion: "Página 41", estado: "pendiente", fechaPrevista: null },
  { id: "L031", orden: 31, descripcion: "Página 42", estado: "pendiente", fechaPrevista: null },
  { id: "L032", orden: 32, descripcion: "Página 43", estado: "pendiente", fechaPrevista: null },
  { id: "L033", orden: 33, descripcion: "Página 44", estado: "pendiente", fechaPrevista: null },
  { id: "L034", orden: 34, descripcion: "Página 45", estado: "pendiente", fechaPrevista: null },
  { id: "L035", orden: 35, descripcion: "Página 46", estado: "pendiente", fechaPrevista: null },
  { id: "L036", orden: 36, descripcion: "Página 47", estado: "pendiente", fechaPrevista: null },
  { id: "L037", orden: 37, descripcion: "Página 50", estado: "pendiente", fechaPrevista: null },
  { id: "L038", orden: 38, descripcion: "Página 51", estado: "pendiente", fechaPrevista: null },
  { id: "L039", orden: 39, descripcion: "Página 52", estado: "pendiente", fechaPrevista: null },
  { id: "L040", orden: 40, descripcion: "Página 53", estado: "pendiente", fechaPrevista: null },
  { id: "L041", orden: 41, descripcion: "Página 54", estado: "pendiente", fechaPrevista: null },
  { id: "L042", orden: 42, descripcion: "Página 55", estado: "pendiente", fechaPrevista: null },
  { id: "L043", orden: 43, descripcion: "Página 56", estado: "pendiente", fechaPrevista: null },
  { id: "L044", orden: 44, descripcion: "Página 57", estado: "pendiente", fechaPrevista: null },
  { id: "L045", orden: 45, descripcion: "Página 58", estado: "pendiente", fechaPrevista: null },
  { id: "L046", orden: 46, descripcion: "Página 59", estado: "pendiente", fechaPrevista: null },
  { id: "L047", orden: 47, descripcion: "Página 60", estado: "pendiente", fechaPrevista: null },
  { id: "L048", orden: 48, descripcion: "Página 61", estado: "pendiente", fechaPrevista: null },
  { id: "L049", orden: 49, descripcion: "Página 62", estado: "pendiente", fechaPrevista: null },
  { id: "L050", orden: 50, descripcion: "Página 63", estado: "pendiente", fechaPrevista: null },
  { id: "L051", orden: 51, descripcion: "Página 64", estado: "pendiente", fechaPrevista: null },
  { id: "L052", orden: 52, descripcion: "Página 65", estado: "pendiente", fechaPrevista: null },
  { id: "L053", orden: 53, descripcion: "Página 66", estado: "pendiente", fechaPrevista: null },
  { id: "L054", orden: 54, descripcion: "Página 67", estado: "pendiente", fechaPrevista: null },
  { id: "L055", orden: 55, descripcion: "Página 68", estado: "pendiente", fechaPrevista: null },
  { id: "L056", orden: 56, descripcion: "Página 69", estado: "pendiente", fechaPrevista: null }
  ],
  caligrafia: [],  // no se usa como lista: solo se avisa "toca caligrafía" según FRECUENCIAS
  lectura: [],     // no se usa como lista: solo se avisa "toca lectura" según FRECUENCIAS
  copia: []        // no se usa como lista: solo se avisa "toca copia" según FRECUENCIAS
};

// Frecuencia semanal por tipo de contenido. Caligrafía, lectura y copia NO se
// planifican con identificadores concretos (el profesor las improvisa sobre
// la marcha); la app solo indica, según esta frecuencia, en qué sesiones tocan.
// Puedes cambiar los días aquí mismo cuando quieras ajustar la frecuencia.
const FRECUENCIAS = {
  libro: ["lunes", "martes", "miercoles", "jueves", "viernes"],
  caligrafia: ["lunes", "miercoles", "viernes"],
  lectura: ["martes", "jueves"],
  copia: ["lunes", "miercoles", "viernes"]
};

function siguienteContenidoPendiente(tipo) {
  return CONTENIDOS[tipo].find(item => item.estado !== "realizado");
}

function eliminarContenido(tipo, id) {
  // Elimina un elemento y renumera el resto sin perder el orden relativo (Sección 17 del prompt).
  const lista = CONTENIDOS[tipo];
  const index = lista.findIndex(item => item.id === id);
  if (index === -1) return;
  lista.splice(index, 1);
  lista.forEach((item, i) => (item.orden = i + 1));
}

// El resto de funciones (añadir, editar, importar en bloque) se completan
// en cuanto el profesor entregue las listas reales de páginas/fichas/lecturas/copias.
