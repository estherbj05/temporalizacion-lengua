# Temporalización de Lengua · 2º Primaria

Aplicación web para planificar y reorganizar dinámicamente la temporalización de
Lengua Castellana (Libro, Caligrafía, Lectura, Copia) durante el curso escolar.

Tecnología: HTML5 + CSS3 + JavaScript vanilla + Supabase. Sin frameworks.

## Estado actual del proyecto

- ✅ **Fase 1 (Interfaz):** completa y navegable.
- ⏳ **Fase 2 (Supabase):** esquema SQL listo (`sql/schema.sql`); falta conectar
  las claves del proyecto en `js/supabase.js`. Mientras tanto, la app guarda
  el trabajo con `localStorage` **en este mismo navegador** (no se sincroniza
  entre dispositivos ni se ve desde otro ordenador hasta que se conecte Supabase).
- ✅ **Fase 3 (Contenidos):** cargadas las 56 páginas del libro (10-27, 30-47, 50-69).
  Caligrafía/lectura/copia no llevan listado propio: la app solo avisa "Toca
  caligrafía/lectura/copia" según la frecuencia semanal definida en `js/contenidos.js`.
- ✅ **Fases 4-6 (Horario, Calendario, Generación automática):** funcionando.
- ✅ **Fases 7-10 (Estados, reorganización en cadena, bloqueo, historial, deshacer/restaurar):**
  funcionando, tanto desde la vista "Hoy" como con los botones 🟢🟠🔴🔒 de cada fila
  en Semana/Mes/Todo el curso.
- ✅ **Fase 12 (Exportación):** CSV funcional (se abre bien en Excel); "Exportar PDF"
  usa la impresión del navegador; falta un export a .xlsx real si lo prefieres.
- ⏳ **Fase 9 (edición manual fina: cambiar una página concreta, añadir/eliminar
  contenidos desde la interfaz):** pendiente.
- ⏳ Confirmar las 2 fiestas locales de Cedillo del Condado en `js/calendario.js`.

## 1. Crear el proyecto

```bash
mkdir temporalizacion-lengua
cd temporalizacion-lengua
# copia aquí todos los archivos de esta carpeta
```

## 2. Abrirlo en Visual Studio Code

```bash
code .
```
Instala la extensión **Live Server** para previsualizar `index.html` con recarga automática.

## 3. Configurar Supabase

1. Crea una cuenta y un proyecto en [supabase.com](https://supabase.com).
2. Ve a **Project Settings → API** y copia la **URL del proyecto** y la **anon public key**.

## 4. Crear las tablas

1. Abre el **SQL Editor** de Supabase.
2. Pega el contenido completo de `sql/schema.sql` y ejecútalo.

## 5. Conectar Supabase

Edita `js/supabase.js` y sustituye:

```js
const SUPABASE_URL = "TU_SUPABASE_URL_AQUI";
const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY_AQUI";
```

por tus valores reales. (La `anon key` es pública por diseño; la seguridad real
la da Row Level Security, ya activado en el esquema.)

## 6. Ejecutar la aplicación

Con Live Server: clic derecho sobre `index.html` → "Open with Live Server".
También puedes abrir `index.html` directamente en el navegador para probar la interfaz.

## 7. Crear el repositorio en GitHub

En [github.com](https://github.com), pulsa **New repository**, nómbralo
`temporalizacion-lengua` y no marques "Initialize with README" (ya tienes uno).

## 8. Hacer commit

```bash
git init
git add .
git commit -m "Fase 1: interfaz base y esquema Supabase"
```

## 9. Hacer push

```bash
git branch -M main
git remote add origin https://github.com/TU_USUARIO/temporalizacion-lengua.git
git push -u origin main
```

## 10. Publicar la aplicación

Opción más sencilla: **GitHub Pages**.
1. En el repositorio, ve a **Settings → Pages**.
2. En "Source", elige la rama `main` y la carpeta `/ (root)`.
3. Guarda; GitHub te dará una URL pública en 1-2 minutos.

---

## Datos ya confirmados

**Horario de Lengua (Tutoría 2ºC)** — 1 sesión todos los días lectivos:
Lunes, Martes, Miércoles, Jueves, Viernes.

**Calendario escolar CLM 2026/2027** (tramo 01/09/2026-31/12/2026) — ver
`js/calendario.js` para el detalle día a día. Pendiente: las 2 fiestas locales
de Cedillo del Condado, aún sin fijar en el calendario regional.

## Datos pendientes de recibir

- Listado ordenado de páginas del libro.
- Listado ordenado de fichas de caligrafía.
- Listado ordenado de lecturas.
- Listado ordenado de copias.

## Conectar Supabase para acceder desde varios dispositivos

1. En [supabase.com](https://supabase.com), crea un proyecto (gratis).
2. Abre el **SQL Editor** y pega el contenido completo de `sql/schema.sql` (incluye la tabla `app_state`, donde se guarda tu temporalización). Ejecútalo.
3. Ve a **Project Settings → API** y copia la **URL del proyecto** y la **anon public key**.
4. Abre `js/supabase.js` y sustituye:
   ```js
   const SUPABASE_URL = "TU_SUPABASE_URL_AQUI";
   const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY_AQUI";
   ```
   por tus valores reales.
5. Abre la app: te pedirá email y contraseña. Pulsa **Crear cuenta** la primera vez (solo la usas tú). Si Supabase pide confirmar el email, revisa tu correo antes de entrar.
6. A partir de ahí, cada cambio se guarda también en la nube. Desde cualquier otro ordenador o el móvil, abre la misma app y entra con el mismo email/contraseña: verás tu temporalización tal cual la dejaste.

> Nota: la vista previa que se abre dentro de Claude **no puede conectar con Supabase** (por seguridad, ese visor bloquea las llamadas a servidores externos). Para probar Supabase de verdad necesitas la app publicada (GitHub Pages, paso 10 más abajo) o abierta con Live Server/localmente.

## Publicarla como app web (para usarla desde el móvil o cualquier ordenador)

Con GitHub Pages (pasos 7-10 más arriba) tienes una URL pública y gratuita, sirve como "aplicación web": puedes guardarla en la pantalla de inicio del móvil y se abre como una app. Si prefieres otra alternativa a GitHub Pages, Netlify y Vercel también funcionan igual de bien arrastrando la carpeta del proyecto a su web — el código no cambia.
