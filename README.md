# Temporalización · 2º Primaria

Aplicación web para planificar y reorganizar dinámicamente la temporalización de
Lengua, Matemáticas y Conocimiento del Medio (cada una de forma independiente)
durante el curso escolar.

Tecnología: HTML5 + CSS3 + JavaScript vanilla + Supabase. Sin frameworks.

## Estado actual del proyecto

- ✅ **Interfaz multi-asignatura:** vistas Hoy / Semana / Mes / Todo el curso /
  Progreso / Contenidos / Horario / Calendario / Historial, con filtro por
  asignatura en las tablas.
- ✅ **Horario real cargado** (`js/horario.js`): Lengua 6 sesiones/semana,
  Matemáticas 6, Conocimiento del Medio 4 — calculado automáticamente del horario,
  no a mano.
- ✅ **Contenidos de Lengua** (16-33, 36-53, 56-79 → 60 páginas) y
  **Matemáticas** (8-11, 14-31, 34-51, 54-71 → 58 páginas) cargados, con
  actividades complementarias repartidas por turno (Lengua: lectura/caligrafía/dictado;
  Matemáticas: cálculo mental/cuentas/problemas).
- ⏳ **Conocimiento del Medio:** módulo preparado pero sin contenidos todavía
  (`ASIGNATURAS.conocimiento.colaLibro` vacío en `js/contenidos.js`) — no se ha inventado nada.
- ✅ **Calendario oficial CLM 2026/2027** cargado hasta diciembre; la
  temporalización nunca genera sesiones antes del **28/09/2026**
  (`FECHA_INICIO_CURSO` en `js/calendario.js`).
- ✅ **Motor por colas independiente por asignatura**: marcar 🟢/🟠🔴 en
  Matemáticas nunca afecta a Lengua ni a Conocimiento, y viceversa.
  🟠 Por terminar pregunta cuántas páginas se completaron y solo reorganiza el resto.
- ✅ **"➕ Más páginas"** (hacer más de lo previsto en una sesión, reorganizando
  las siguientes) y **"⚡ Acelerar"** por asignatura desde una fecha (vista Contenidos).
- ✅ **Progreso** por asignatura (páginas hechas / total) y un indicador simple
  de **retraso** (sesiones pasadas sin marcar).
- ✅ **Bloqueo de sesiones**, **historial**, **deshacer/restaurar planificación original**.
- ✅ **Exportar CSV** (se abre bien en Excel).
- ✅ **Guardado**: local (`localStorage`) siempre, y en la nube (Supabase) si
  conectas tu proyecto (ver más abajo) — accesible entonces desde cualquier dispositivo.
- ⏳ Pendiente: edición manual fina de una sesión suelta (cambiar página exacta
  a mano sin usar "más páginas"), fiestas locales/días de libre disposición del
  centro (no fijados aún en el calendario regional), y los contenidos de
  Conocimiento del Medio cuando los tengas listos.

## 1. Crear el proyecto

```bash
mkdir temporalizacion-2primaria
cd temporalizacion-2primaria
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
la da Row Level Security, ya activado en el esquema.) **Importante:** cambia
solo el contenido entre comillas — no toques la función `supabaseConfigurado()`
más abajo en el mismo archivo.

## 6. Ejecutar la aplicación

Con Live Server: clic derecho sobre `index.html` → "Open with Live Server".
También puedes abrir `index.html` directamente en el navegador para probar la interfaz.

## 7. Crear el repositorio en GitHub

En [github.com](https://github.com), pulsa **New repository**, nómbralo
`temporalizacion-2primaria` (o el que prefieras) y no marques "Initialize with README" (ya tienes uno).

## 8. Hacer commit

```bash
git init
git add .
git commit -m "App multi-asignatura: Lengua, Matemáticas y Conocimiento del Medio"
```

## 9. Hacer push

```bash
git branch -M main
git remote add origin https://github.com/TU_USUARIO/temporalizacion-2primaria.git
git push -u origin main
```

## 10. Publicar la aplicación

Opción más sencilla: **GitHub Pages**.
1. En el repositorio, ve a **Settings → Pages**.
2. En "Source", elige la rama `main` y la carpeta `/ (root)`.
3. Guarda; GitHub te dará una URL pública en 1-2 minutos.

---

## Datos ya confirmados

**Horario real** (`js/horario.js`) — Lengua: Lunes(x2), Martes, Miércoles, Jueves,
Viernes = 6 sesiones/semana. Matemáticas: Lunes, Miércoles, Jueves(x2), Viernes(x2)
= 6 sesiones/semana. Conocimiento del Medio: Lunes, Miércoles, Jueves, Viernes =
4 sesiones/semana.

**Calendario escolar CLM 2026/2027** (cartel oficial de
educacion.castillalamancha.es, hasta diciembre) — ver `js/calendario.js` para
el detalle día a día. Pendiente: días de libre disposición del centro / fiestas
locales de Cedillo del Condado, aún sin fijar.

**Fecha de inicio real de la temporalización: 28/09/2026** — no se generan
sesiones antes de esa fecha aunque se pida un rango anterior.

## Datos pendientes de recibir

- Contenidos de Conocimiento del Medio (unidades, temas, páginas, fichas...).
- Confirmación de los días de libre disposición / fiestas locales.

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

