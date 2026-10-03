-- ============================================================
-- Manual completo de bases de datos — Parte 02
-- Todo el código de los ejemplos, en el orden en que aparece.
--
-- Cómo usarlo:  psql -U postgres -f parte-02.sql
--           (o, dentro de psql:  \i parte-02.sql )
--
-- IMPORTANTE:
--  * Algunas sentencias FALLAN A PROPÓSITO para mostrar un error;
--    el manual lo explica en cada figura.
--  * Los bloques usan \c para cambiar de base de datos.
--  * Los comandos de terminal aparecen como comentarios (-- $ ...) con los
--    parámetros de conexión del entorno donde se generó el manual
--    (-h, -p, -U); en tu instalación usa los tuyos.
--  * Está pensado para una instalación de prácticas, no para datos reales.
-- ============================================================

-- Bases de datos que usa esta parte (si ya existen, el error es inofensivo)
CREATE DATABASE ensayo;
CREATE DATABASE tienda;
CREATE DATABASE crm;

-- ------------------------------------------------------------
-- Figura r2-1 (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE amigos (
  id       integer PRIMARY KEY,
  nombre   text NOT NULL,
  telefono text
);

CREATE TABLE libros (
  id     integer PRIMARY KEY,
  titulo text NOT NULL,
  autor  text
);

CREATE TABLE prestamos (
  id               integer PRIMARY KEY,
  amigo_id         integer NOT NULL REFERENCES amigos (id),
  libro_id         integer NOT NULL REFERENCES libros (id),
  fecha_salida     date NOT NULL,
  fecha_devolucion date
);

-- ------------------------------------------------------------
-- Figura r2-1b (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
INSERT INTO amigos VALUES (1, 'Marta', '600333444'), (2, 'Pablo', NULL);
INSERT INTO libros  VALUES (1, 'Cien años de soledad', 'García Márquez'), (2, 'Rayuela', 'Cortázar');
INSERT INTO prestamos VALUES
  (1, 1, 1, '2026-03-01', NULL),
  (2, 2, 2, '2026-02-10', '2026-02-25');

SELECT a.nombre AS amigo, l.titulo
FROM prestamos p
JOIN amigos a ON a.id = p.amigo_id
JOIN libros l ON l.id = p.libro_id
WHERE p.fecha_devolucion IS NULL;

-- ------------------------------------------------------------
-- Figura r2-2 (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
-- Entidades -> tablas; atributos -> columnas
CREATE TABLE clientes (
  id       integer PRIMARY KEY,
  nombre   text NOT NULL,
  email    text NOT NULL UNIQUE,      -- regla: obligatorio y único
  telefono text                       -- regla: opcional
);

CREATE TABLE productos (
  id     integer PRIMARY KEY,
  nombre text NOT NULL,
  precio numeric(10, 2) NOT NULL CHECK (precio >= 0)   -- regla: no negativo
);

-- Relaciones: el cliente HACE pedidos; el pedido INCLUYE productos
CREATE TABLE pedidos (
  id         integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id)
);

CREATE TABLE lineas_pedido (
  pedido_id   integer REFERENCES pedidos (id),
  producto_id integer REFERENCES productos (id),
  cantidad    integer NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (pedido_id, producto_id)
);

-- ------------------------------------------------------------
-- Figura r2-2b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
\dt

-- ------------------------------------------------------------
-- Figura r2-3 (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE clientes_form (
  id       integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre   text NOT NULL,                     -- obligatorio
  email    text NOT NULL UNIQUE,              -- obligatorio y único
  telefono text,                              -- opcional
  alta     date NOT NULL DEFAULT current_date -- obligatorio, con valor por defecto
);

INSERT INTO clientes_form (nombre, email) VALUES ('Luis Pérez', 'luis@ejemplo.com');

SELECT * FROM clientes_form;

-- ------------------------------------------------------------
-- Figura r2-3b (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
INSERT INTO clientes_form (nombre) VALUES ('Sin Email');

INSERT INTO clientes_form (nombre, email) VALUES ('Otro Luis', 'luis@ejemplo.com');

-- ------------------------------------------------------------
-- Figura r2-4a (base de datos: crm)
-- ------------------------------------------------------------
\c crm
CREATE TABLE usuarios (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  email  text NOT NULL UNIQUE,
  rol    text NOT NULL DEFAULT 'vendedor'
);

CREATE TABLE estados (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  orden  integer NOT NULL
);

CREATE TABLE empresas (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  sector text,
  web    text,
  ciudad text
);

CREATE TABLE contactos (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id integer NOT NULL REFERENCES empresas (id),
  nombre     text NOT NULL,
  email      text,
  telefono   text,
  cargo      text
);

-- ------------------------------------------------------------
-- Figura r2-4b (base de datos: crm)
-- ------------------------------------------------------------
\c crm
CREATE TABLE oportunidades (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id      integer NOT NULL REFERENCES empresas (id),
  usuario_id      integer NOT NULL REFERENCES usuarios (id),
  estado_id       integer NOT NULL REFERENCES estados (id),
  titulo          text NOT NULL,
  importe         numeric(12, 2) CHECK (importe >= 0),
  cierre_previsto date
);

CREATE TABLE tareas (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidad_id integer NOT NULL REFERENCES oportunidades (id),
  usuario_id     integer NOT NULL REFERENCES usuarios (id),
  titulo         text NOT NULL,
  vence          date,
  completada     boolean NOT NULL DEFAULT false
);

CREATE TABLE notas (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidad_id integer NOT NULL REFERENCES oportunidades (id),
  usuario_id     integer NOT NULL REFERENCES usuarios (id),
  texto          text NOT NULL,
  creada_en      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE llamadas (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidad_id integer NOT NULL REFERENCES oportunidades (id),
  contacto_id    integer REFERENCES contactos (id),
  fecha          timestamptz NOT NULL,
  minutos        integer CHECK (minutos >= 0),
  resumen        text
);

CREATE TABLE emails (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidad_id integer NOT NULL REFERENCES oportunidades (id),
  contacto_id    integer REFERENCES contactos (id),
  asunto         text NOT NULL,
  enviado        boolean NOT NULL,   -- true = enviado; false = recibido
  fecha          timestamptz NOT NULL
);

-- ------------------------------------------------------------
-- Figura r2-4c (base de datos: crm)
-- ------------------------------------------------------------
\c crm
\dt

-- ------------------------------------------------------------
-- Figura r2-4e (base de datos: crm)
-- ------------------------------------------------------------
\c crm
INSERT INTO usuarios (nombre, email) VALUES ('Sara Vidal', 'sara@crm.com'), ('Tomás Gil', 'tomas@crm.com');
INSERT INTO estados (nombre, orden) VALUES ('Nuevo', 1), ('En negociación', 2), ('Ganado', 3), ('Perdido', 4);
INSERT INTO empresas (nombre, sector) VALUES ('Acme S.L.', 'Industria'), ('Norte Digital', 'Software'), ('Verde Sur', 'Agricultura');
INSERT INTO contactos (empresa_id, nombre, cargo) VALUES (1, 'Lucía Mora', 'Compras'), (1, 'Pablo Ríos', 'Dirección'), (2, 'Irene Costa', 'Marketing');

INSERT INTO oportunidades (empresa_id, usuario_id, estado_id, titulo, importe, cierre_previsto) VALUES
  (1, 1, 2, 'Contrato anual', 12000, '2026-06-30'),
  (2, 2, 1, 'Rediseño web',    4500, '2026-05-15'),
  (1, 1, 3, 'Ampliación',      3000, '2026-04-01');

INSERT INTO tareas (oportunidad_id, usuario_id, titulo, vence) VALUES
  (1, 1, 'Enviar propuesta', '2026-04-10'),
  (2, 2, 'Llamar para concretar', '2026-04-12');
INSERT INTO llamadas (oportunidad_id, contacto_id, fecha, minutos, resumen) VALUES
  (1, 1, '2026-03-20 10:30+01', 25, 'Interesados en el contrato anual');

-- ------------------------------------------------------------
-- Figura r2-4f (base de datos: crm)
-- ------------------------------------------------------------
\c crm
SELECT o.titulo,
       e.nombre AS empresa,
       s.nombre AS estado,
       u.nombre AS vendedor,
       o.importe
FROM oportunidades o
JOIN empresas e ON e.id = o.empresa_id
JOIN estados  s ON s.id = o.estado_id
JOIN usuarios u ON u.id = o.usuario_id
ORDER BY o.id;

SELECT titulo, vence FROM tareas WHERE completada = false ORDER BY vence;

-- ------------------------------------------------------------
-- Figura r2-5a (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE contactos (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);

CREATE TABLE telefonos (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contacto_id integer NOT NULL REFERENCES contactos (id),
  numero      text NOT NULL,
  tipo        text NOT NULL CHECK (tipo IN ('móvil', 'casa', 'trabajo'))
);

INSERT INTO contactos (nombre) VALUES ('Ana García');
INSERT INTO telefonos (contacto_id, numero, tipo) VALUES (1, '600111222', 'móvil'), (1, '910000000', 'trabajo');

SELECT c.nombre, t.tipo, t.numero
FROM contactos c
JOIN telefonos t ON t.contacto_id = c.id;

-- ------------------------------------------------------------
-- Figura r2-5b (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE socios (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);

CREATE TABLE pistas (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);

CREATE TABLE reservas (
  id       integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  socio_id integer NOT NULL REFERENCES socios (id),
  pista_id integer NOT NULL REFERENCES pistas (id),
  fecha    date NOT NULL,
  hora     time NOT NULL,
  UNIQUE (pista_id, fecha, hora)   -- regla: una pista no se reserva dos veces a la misma hora
);

INSERT INTO socios (nombre) VALUES ('Marta'), ('Luis');
INSERT INTO pistas (nombre) VALUES ('Pista 1');
INSERT INTO reservas (socio_id, pista_id, fecha, hora) VALUES (1, 1, '2026-04-05', '18:00');

INSERT INTO reservas (socio_id, pista_id, fecha, hora) VALUES (2, 1, '2026-04-05', '18:00');

-- ------------------------------------------------------------
-- Figura r2-6 (base de datos: crm)
-- ------------------------------------------------------------
\c crm
SELECT column_name  AS columna,
       data_type    AS tipo,
       is_nullable  AS "¿admite vacío?",
       column_default AS por_defecto
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;

