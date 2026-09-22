-- schema.sql
-- Esquema inicial para Supabase (Fase 2).
-- Cópialo y pégalo directamente en el SQL Editor de Supabase.

-- ============ CURSOS ============
create table if not exists cursos (
  id uuid primary key default gen_random_uuid(),
  curso_escolar text not null,          -- p.ej. '2026/2027'
  fecha_inicio date not null,
  fecha_fin date not null,
  created_at timestamptz default now()
);

-- ============ HORARIO ============
create table if not exists horario (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid references cursos(id) on delete cascade,
  dia text not null check (dia in ('lunes','martes','miercoles','jueves','viernes')),
  sesiones integer not null default 0,
  hora text, -- opcional, p.ej. '09:00-09:45'
  created_at timestamptz default now()
);

-- ============ CALENDARIO ============
create table if not exists calendario (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid references cursos(id) on delete cascade,
  fecha date not null,
  tipo text not null check (tipo in ('lectivo','festivo','no_lectivo','vacaciones','actividad_especial')),
  observaciones text,
  created_at timestamptz default now(),
  unique (curso_id, fecha)
);

-- ============ CONTENIDOS ============
create table if not exists contenidos (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid references cursos(id) on delete cascade,
  tipo text not null check (tipo in ('libro','caligrafia','lectura','copia')),
  identificador text not null,        -- p.ej. 'Página 12', 'Ficha 4', 'Lectura 3'
  descripcion text,
  orden integer not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','realizado','por_terminar','no_realizado')),
  fecha_prevista date,
  fecha_realizada date,
  observaciones text,
  created_at timestamptz default now()
);
create index if not exists idx_contenidos_tipo_orden on contenidos (curso_id, tipo, orden);

-- ============ SESIONES ============
create table if not exists sesiones (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid references cursos(id) on delete cascade,
  fecha date not null,
  contenidos jsonb not null default '{}'::jsonb, -- { libro: [id,...], caligrafia: [...], lectura: [...], copia: [...] }
  estado text not null default 'pendiente' check (estado in ('pendiente','realizado','por_terminar','no_realizado')),
  observaciones text,
  modificacion_manual boolean not null default false,
  reorganizacion_automatica boolean not null default false,
  bloqueada boolean not null default false,
  motivo_bloqueo text,
  created_at timestamptz default now(),
  unique (curso_id, fecha)
);

-- ============ HISTORIAL ============
create table if not exists historial (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid references cursos(id) on delete cascade,
  fecha timestamptz default now(),
  descripcion text not null
);

-- ============ ESTADO DE LA APP (sincronización simple entre dispositivos) ============
-- Guarda de golpe, como un documento JSON por usuario, la temporalización actual,
-- la planificación original y el historial. Es la forma más simple de tener
-- sincronización multi-dispositivo ya mismo; más adelante se puede normalizar
-- usando las tablas "sesiones" y "contenidos" de arriba si hace falta más detalle.
create table if not exists app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table app_state enable row level security;

create policy "Cada usuario ve solo su propio estado"
  on app_state for select using (auth.uid() = user_id);
create policy "Cada usuario inserta solo su propio estado"
  on app_state for insert with check (auth.uid() = user_id);
create policy "Cada usuario actualiza solo su propio estado"
  on app_state for update using (auth.uid() = user_id);

-- ============ ROW LEVEL SECURITY (tablas relacionales, opcional/futuro) ============
-- Ajusta estas políticas según tu modelo de autenticación (Supabase Auth).
-- Ejemplo mínimo: solo el usuario autenticado dueño del curso puede leer/escribir.

alter table cursos enable row level security;
alter table horario enable row level security;
alter table calendario enable row level security;
alter table contenidos enable row level security;
alter table sesiones enable row level security;
alter table historial enable row level security;

-- Si añades una columna user_id a "cursos" referenciando auth.users(id),
-- las políticas de las tablas hijas pueden apoyarse en un join contra cursos.
-- Ejemplo (descomentar y adaptar tras añadir user_id a cursos):
--
-- alter table cursos add column user_id uuid references auth.users(id);
--
-- create policy "Solo el propietario ve sus cursos"
--   on cursos for select using (auth.uid() = user_id);
-- create policy "Solo el propietario modifica sus cursos"
--   on cursos for all using (auth.uid() = user_id);
