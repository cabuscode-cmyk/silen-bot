-- ============================================================
-- Manual completo de bases de datos — Parte 03
-- Todo el código de los ejemplos, en el orden en que aparece.
--
-- Cómo usarlo:  psql -U postgres -f parte-03.sql
--           (o, dentro de psql:  \i parte-03.sql )
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
CREATE DATABASE tienda;
CREATE DATABASE ensayo;
CREATE DATABASE tienda_script;
CREATE DATABASE biblioteca;

-- ------------------------------------------------------------
-- Figura f3-1b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
CREATE TABLE clientes (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre    text NOT NULL,
  email     text NOT NULL UNIQUE,
  telefono  text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

\d clientes

-- ------------------------------------------------------------
-- Figura f3-1c (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
INSERT INTO clientes (nombre, email, telefono) VALUES
  ('Ana García', 'ana@ejemplo.com', '600111222'),
  ('Luis Pérez', 'luis@ejemplo.com', NULL),
  ('Marta Ruiz', 'marta@ejemplo.com', '600333444');

SELECT * FROM clientes ORDER BY id;

-- ------------------------------------------------------------
-- Figura f3-1d (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
SELECT 0.1::double precision + 0.2::double precision AS coma_flotante,
       0.1::numeric + 0.2::numeric AS exacto;

SELECT '2026-03-02 10:00:00+01'::timestamptz AT TIME ZONE 'UTC' AS en_utc,
       '2026-03-02 10:00:00+01'::timestamptz AT TIME ZONE 'Europe/Madrid' AS en_madrid;

-- ------------------------------------------------------------
-- Figura f3-2a (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE usuarios (
  id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE
);

CREATE TABLE perfiles (
  usuario_id integer PRIMARY KEY REFERENCES usuarios (id),
  biografia  text
);

INSERT INTO usuarios (email) VALUES ('ana@ejemplo.com') RETURNING id;

INSERT INTO perfiles (usuario_id, biografia) VALUES (1, 'Me gusta el senderismo');

INSERT INTO perfiles (usuario_id, biografia) VALUES (1, 'Otro perfil para el mismo usuario');

-- ------------------------------------------------------------
-- Figura f3-2c (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE autores (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);

CREATE TABLE libros (
  id       integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  autor_id integer NOT NULL REFERENCES autores (id),
  titulo   text NOT NULL
);

INSERT INTO autores (nombre) VALUES ('Gabriel García Márquez');

INSERT INTO libros (autor_id, titulo) VALUES
  (1, 'Cien años de soledad'),
  (1, 'El amor en los tiempos del cólera');

SELECT a.nombre, l.titulo
FROM autores a
JOIN libros l ON l.autor_id = a.id;

-- ------------------------------------------------------------
-- Figura f3-2f (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
INSERT INTO libros (autor_id, titulo) VALUES (NULL, 'Libro sin autor');

INSERT INTO libros (autor_id, titulo) VALUES (99, 'Libro de un autor que no existe');

CREATE TABLE empleados (
  id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre  text NOT NULL,
  jefe_id integer REFERENCES empleados (id)
);

INSERT INTO empleados (nombre, jefe_id) VALUES ('Clara (directora)', NULL);

INSERT INTO empleados (nombre, jefe_id) VALUES ('Dani', 1), ('Eva', 1);

SELECT e.nombre AS empleado, j.nombre AS jefe
FROM empleados e
LEFT JOIN empleados j ON j.id = e.jefe_id
ORDER BY e.id;

-- ------------------------------------------------------------
-- Figura f3-2g (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE alumnos (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);

CREATE TABLE cursos (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo text NOT NULL
);

CREATE TABLE matriculas (
  alumno_id integer REFERENCES alumnos (id),
  curso_id  integer REFERENCES cursos (id),
  nota      numeric(4, 2),
  PRIMARY KEY (alumno_id, curso_id)
);

INSERT INTO alumnos (nombre) VALUES ('Ana'), ('Luis');

INSERT INTO cursos (titulo) VALUES ('Inglés'), ('Dibujo');

INSERT INTO matriculas (alumno_id, curso_id, nota) VALUES (1, 1, 8.5), (1, 2, 9), (2, 1, 7);

SELECT a.nombre, c.titulo, m.nota
FROM matriculas m
JOIN alumnos a ON a.id = m.alumno_id
JOIN cursos  c ON c.id = m.curso_id
ORDER BY a.nombre, c.titulo;

-- ------------------------------------------------------------
-- Figura f3-3a (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE pedidos_mal (
  id        integer PRIMARY KEY,
  cliente   text,
  productos text
);

INSERT INTO pedidos_mal VALUES
  (101, 'Ana', 'Camiseta, Camiseta, Gorra'),
  (103, 'Ana', 'Camiseta, Mochila');

SELECT count(*) AS pedidos_con_camiseta
FROM pedidos_mal
WHERE productos LIKE '%Camiseta%';

-- ------------------------------------------------------------
-- Figura f3-3b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
CREATE TABLE productos (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre     text NOT NULL,
  precio_eur numeric(10, 2) NOT NULL CHECK (precio_eur >= 0),
  stock      integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  activo     boolean NOT NULL DEFAULT true
);

CREATE TABLE pedidos (
  id         integer GENERATED ALWAYS AS IDENTITY (START WITH 101) PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  fecha      date NOT NULL DEFAULT current_date,
  estado     text NOT NULL DEFAULT 'pendiente'
             CHECK (estado IN ('pendiente', 'enviado', 'entregado', 'cancelado'))
);

CREATE TABLE lineas_pedido (
  pedido_id    integer NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  producto_id  integer NOT NULL REFERENCES productos (id),
  cantidad     integer NOT NULL CHECK (cantidad > 0),
  precio_venta numeric(10, 2) NOT NULL CHECK (precio_venta >= 0),
  PRIMARY KEY (pedido_id, producto_id)
);

-- ------------------------------------------------------------
-- Figura f3-3c (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
INSERT INTO productos (nombre, precio_eur, stock) VALUES
  ('Camiseta', 19.95, 12), ('Gorra', 9.90, 0), ('Mochila', 34.50, 5);

INSERT INTO pedidos (cliente_id, fecha, estado) VALUES
  (1, '2026-03-02', 'entregado'),
  (3, '2026-03-05', 'enviado'),
  (1, '2026-03-09', 'pendiente');

INSERT INTO lineas_pedido (pedido_id, producto_id, cantidad, precio_venta) VALUES
  (101, 1, 2, 19.95), (101, 2, 1, 9.90),
  (102, 3, 1, 34.50),
  (103, 1, 1, 19.95), (103, 3, 1, 34.50);

-- ------------------------------------------------------------
-- Figura f3-3e (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT sum(cantidad) AS camisetas_vendidas
FROM lineas_pedido
WHERE producto_id = 1;

SELECT p.nombre, l.cantidad, l.precio_venta
FROM lineas_pedido l
JOIN productos p ON p.id = l.producto_id
WHERE l.pedido_id = 101;

-- ------------------------------------------------------------
-- Figura f3-3g (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
\d pedidos

CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);

\d pedidos

-- ------------------------------------------------------------
-- Figura f3-4 (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
INSERT INTO clientes (nombre, email)
VALUES ('Pedro Gil', 'pedro@ejemplo.com')
RETURNING id, nombre;

INSERT INTO clientes (nombre, email)
VALUES ('Otra Ana', 'ana@ejemplo.com');

INSERT INTO clientes (nombre, email)
VALUES ('Sara León', 'sara@ejemplo.com')
RETURNING id, nombre;

-- ------------------------------------------------------------
-- Figura f3-4a (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
INSERT INTO clientes (id, nombre, email)
VALUES (50, 'Intruso', 'intruso@ejemplo.com');

-- ------------------------------------------------------------
-- Figura f3-4b (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE sesiones (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inicio timestamptz NOT NULL DEFAULT now()
);

INSERT INTO sesiones DEFAULT VALUES RETURNING id;

INSERT INTO sesiones DEFAULT VALUES RETURNING id;

-- ------------------------------------------------------------
-- Figura f3-4c (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
INSERT INTO pedidos (cliente_id) VALUES (9);

DELETE FROM clientes WHERE id = 1;

-- ------------------------------------------------------------
-- Figura f3-4d (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE padres (id integer PRIMARY KEY);

CREATE TABLE hijos_cascade  (padre_id integer REFERENCES padres (id) ON DELETE CASCADE);

CREATE TABLE hijos_setnull  (padre_id integer REFERENCES padres (id) ON DELETE SET NULL);

CREATE TABLE hijos_restrict (padre_id integer REFERENCES padres (id) ON DELETE RESTRICT);

INSERT INTO padres VALUES (1), (2), (3);
INSERT INTO hijos_cascade VALUES (1);
INSERT INTO hijos_setnull VALUES (2);
INSERT INTO hijos_restrict VALUES (3);

DELETE FROM padres WHERE id = 1;

DELETE FROM padres WHERE id = 2;

DELETE FROM padres WHERE id = 3;

SELECT (SELECT count(*) FROM hijos_cascade) AS filas_en_cascade,
       (SELECT count(*) FROM hijos_setnull WHERE padre_id IS NULL) AS setnull_con_null,
       (SELECT count(*) FROM padres) AS padres_que_quedan;

-- ------------------------------------------------------------
-- Figura f3-5 (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
INSERT INTO clientes (nombre, email)
VALUES (NULL, 'x@ejemplo.com');

INSERT INTO clientes (nombre, email)
VALUES ('Otra Ana', 'ana@ejemplo.com');

INSERT INTO productos (nombre, precio_eur)
VALUES ('Regalo', -5);

INSERT INTO lineas_pedido
VALUES (101, 1, 0, 19.95);

UPDATE pedidos SET estado = 'casi-enviado' WHERE id = 101;

-- ------------------------------------------------------------
-- Figura f3-5a (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE articulos (nombre text, precio numeric);

INSERT INTO articulos VALUES ('Lámpara', 25), ('Pegatina', -3);

ALTER TABLE articulos ADD CONSTRAINT precio_no_negativo CHECK (precio >= 0);

DELETE FROM articulos WHERE precio < 0;

ALTER TABLE articulos ADD CONSTRAINT precio_no_negativo CHECK (precio >= 0);

INSERT INTO articulos VALUES ('Imán', -1);

-- ------------------------------------------------------------
-- Figura f3-5b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
\d productos

-- ------------------------------------------------------------
-- Figura f3-6a (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT conrelid::regclass AS tabla,
       conname           AS restriccion,
       pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace = 'public'::regnamespace
ORDER BY 1, 2;

-- ------------------------------------------------------------
-- Figura f3-7a (comandos de terminal)
-- ------------------------------------------------------------
-- $ head -8 crear_tienda.sql
-- $ psql -h /tmp -p 5433 -U postgres -d tienda_script -f crear_tienda.sql

-- ------------------------------------------------------------
-- Figura f3-7b (base de datos: tienda_script)
-- ------------------------------------------------------------
\c tienda_script
\dt

\d lineas_pedido

-- ------------------------------------------------------------
-- Figura f3-7d (base de datos: biblioteca)
-- ------------------------------------------------------------
\c biblioteca
INSERT INTO socios (nombre, email) VALUES ('Ana García', 'ana@ejemplo.com');

INSERT INTO libros (titulo, autor) VALUES ('Cien años de soledad', 'García Márquez');

INSERT INTO prestamos (socio_id, libro_id) VALUES (1, 1);

INSERT INTO prestamos (socio_id, libro_id) VALUES (1, 1);

UPDATE prestamos SET fecha_devolucion = current_date WHERE id = 1;

INSERT INTO prestamos (socio_id, libro_id) VALUES (1, 1);

-- ------------------------------------------------------------
-- Figura f3-8 (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT id, nombre, creado_en FROM clientes ORDER BY id;

-- ------------------------------------------------------------
-- Figura f3-8b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
ALTER TABLE clientes ADD COLUMN borrado_en timestamptz;

UPDATE clientes SET borrado_en = now() WHERE id = 2;

SELECT id, nombre, borrado_en FROM clientes ORDER BY id;

SELECT id, nombre FROM clientes WHERE borrado_en IS NULL ORDER BY id;

-- ------------------------------------------------------------
-- Figura f3-8c (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
CREATE VIEW clientes_activos AS
SELECT id, nombre, email, telefono
FROM clientes
WHERE borrado_en IS NULL;

SELECT * FROM clientes_activos ORDER BY id;

