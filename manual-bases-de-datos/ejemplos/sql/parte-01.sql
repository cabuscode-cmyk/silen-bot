-- ============================================================
-- Manual completo de bases de datos — Parte 01
-- Todo el código de los ejemplos, en el orden en que aparece.
--
-- Cómo usarlo:  psql -U postgres -f parte-01.sql
--           (o, dentro de psql:  \i parte-01.sql )
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
CREATE DATABASE pruebas;

-- ------------------------------------------------------------
-- Figura r1-1a (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
SELECT 'Ana', 34, 'Madrid';

-- ------------------------------------------------------------
-- Figura r1-1b (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE personas (
  nombre text,
  edad   integer,
  ciudad text
);

INSERT INTO personas VALUES ('Ana', 34, 'Madrid');

SELECT * FROM personas;

SELECT nombre || ' tiene ' || edad || ' años y vive en ' || ciudad AS informacion
FROM personas;

-- ------------------------------------------------------------
-- Figura r1-2a (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE hoja_pedidos (
  cliente  text,
  telefono text,
  pedido   integer,
  total    numeric
);

INSERT INTO hoja_pedidos VALUES
  ('Ana García', '600111222', 101, 45.90),
  ('Ana García', '600111222', 103, 80.50),
  ('Ana Garcia', '600111223', 110, 20.00);

SELECT DISTINCT cliente, telefono
FROM hoja_pedidos
ORDER BY cliente;

-- ------------------------------------------------------------
-- Figura r1-2b (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE clientes_demo (
  id       integer PRIMARY KEY,
  nombre   text NOT NULL,
  telefono text
);

CREATE TABLE pedidos_demo (
  id         integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes_demo (id),
  total      numeric(10, 2)
);

INSERT INTO clientes_demo VALUES (1, 'Ana García', '600111222');

INSERT INTO pedidos_demo VALUES (101, 1, 45.90), (103, 1, 80.50);

UPDATE clientes_demo SET telefono = '600999000' WHERE id = 1;

SELECT p.id AS pedido, c.nombre, c.telefono, p.total
FROM pedidos_demo p
JOIN clientes_demo c ON c.id = p.cliente_id
ORDER BY p.id;

-- ------------------------------------------------------------
-- Figura r1-2c (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE pagos (importe numeric NOT NULL);

INSERT INTO pagos VALUES ('barato');

INSERT INTO pagos VALUES (NULL);

INSERT INTO pagos VALUES (12.50);

-- ------------------------------------------------------------
-- Figura r1-3a (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT version();

\l

-- ------------------------------------------------------------
-- Figura r1-3b (base de datos: crm)
-- ------------------------------------------------------------
\c crm
CREATE TABLE empresas (id integer PRIMARY KEY, nombre text);

INSERT INTO empresas VALUES (1, 'Acme S.L.');

\dt

-- ------------------------------------------------------------
-- Figura r1-3c (base de datos: pruebas)
-- ------------------------------------------------------------
\c pruebas
\dt

-- ------------------------------------------------------------
-- Figura r1-3d (comandos de terminal)
-- ------------------------------------------------------------
-- $ psql -h /tmp -p 5433 -U postgres -d crm -c "CREATE ROLE lector LOGIN;"
-- $ psql -h /tmp -p 5433 -U lector -d crm -c "SELECT * FROM empresas;"
-- $ psql -h /tmp -p 5433 -U postgres -d crm -c "GRANT SELECT ON empresas TO lector;"
-- $ psql -h /tmp -p 5433 -U lector -d crm -c "SELECT * FROM empresas;"

-- ------------------------------------------------------------
-- Figura r1-4a (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
CREATE TABLE clientes (
  id       integer PRIMARY KEY,
  nombre   text NOT NULL,
  email    text,
  telefono text
);

INSERT INTO clientes VALUES
  (1, 'Ana García', 'ana@ejemplo.com', '600111222'),
  (2, 'Luis Pérez', 'luis@ejemplo.com', NULL),
  (3, 'Marta Ruiz', 'marta@ejemplo.com', '600333444');

SELECT * FROM clientes;

-- ------------------------------------------------------------
-- Figura r1-4b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
\d clientes

-- ------------------------------------------------------------
-- Figura r1-4c (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT email FROM clientes WHERE nombre = 'Marta Ruiz';

SELECT count(*) AS filas FROM clientes;

SELECT count(*) AS columnas
FROM information_schema.columns
WHERE table_name = 'clientes';

-- ------------------------------------------------------------
-- Figura r1-5a (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
CREATE TABLE productos (
  nombre     text,
  stock      integer,
  precio_eur numeric(10, 2),
  alta       date,
  activo     boolean
);

INSERT INTO productos VALUES
  ('Camiseta', 12, 19.95, '2026-01-15', true),
  ('Gorra',     0,  9.90, '2026-02-03', false),
  ('Mochila',   5, 34.50, '2026-02-20', true);

SELECT * FROM productos;

-- ------------------------------------------------------------
-- Figura r1-5b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
INSERT INTO productos (nombre, stock) VALUES ('Taza', 'muchos');

INSERT INTO productos (nombre, alta) VALUES ('Taza', '2026-02-31');

SELECT pg_typeof(nombre)     AS nombre,
       pg_typeof(stock)      AS stock,
       pg_typeof(precio_eur) AS precio_eur,
       pg_typeof(alta)       AS alta,
       pg_typeof(activo)     AS activo
FROM productos
LIMIT 1;

-- ------------------------------------------------------------
-- Figura r1-5c (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE precios_texto (p text);

INSERT INTO precios_texto VALUES ('3'), ('20'), ('100');

SELECT p FROM precios_texto ORDER BY p;

SELECT p FROM precios_texto ORDER BY p::numeric;

-- ------------------------------------------------------------
-- Figura r1-6a (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT id, nombre, telefono, telefono IS NULL AS sin_telefono
FROM clientes
ORDER BY id;

-- ------------------------------------------------------------
-- Figura r1-6b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT nombre FROM clientes WHERE telefono = NULL;

SELECT nombre FROM clientes WHERE telefono IS NULL;

-- ------------------------------------------------------------
-- Figura r1-6c (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT NULL = NULL AS null_igual_null,
       NULL IS NULL AS es_null,
       0 = 0 AS cero_igual_cero,
       '' = '' AS vacio_igual_vacio;

SELECT count(*) AS todas_las_filas, count(telefono) AS con_telefono FROM clientes;

SELECT 10 + NULL AS suma_con_null;

-- ------------------------------------------------------------
-- Figura r1-7a (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
CREATE TABLE pedidos (
  id         integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  fecha      date,
  total      numeric(10, 2)
);

INSERT INTO pedidos VALUES
  (101, 1, '2026-03-02', 45.90),
  (102, 3, '2026-03-05', 12.00),
  (103, 1, '2026-03-09', 80.50);

SELECT * FROM pedidos;

-- ------------------------------------------------------------
-- Figura r1-7b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
INSERT INTO clientes VALUES (1, 'Otro Cliente', 'otro@ejemplo.com', NULL);

INSERT INTO pedidos VALUES (104, 9, '2026-03-12', 20.00);

DELETE FROM clientes WHERE id = 1;

-- ------------------------------------------------------------
-- Figura r1-7c (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT p.id AS pedido, p.total, c.nombre AS cliente
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
ORDER BY p.id;

-- ------------------------------------------------------------
-- Figura r1-8a (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE TABLE clientes_grandes AS
SELECT g AS id, 'cliente' || g || '@ejemplo.com' AS email
FROM generate_series(1, 300000) AS g;

ANALYZE clientes_grandes;

EXPLAIN ANALYZE
SELECT * FROM clientes_grandes
WHERE email = 'cliente250000@ejemplo.com';

-- ------------------------------------------------------------
-- Figura r1-8b (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
CREATE INDEX idx_grandes_email ON clientes_grandes (email);

ANALYZE clientes_grandes;

EXPLAIN ANALYZE
SELECT * FROM clientes_grandes
WHERE email = 'cliente250000@ejemplo.com';

-- ------------------------------------------------------------
-- Figura r1-9a (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT * FROM clientes;

SELECT nombre, email FROM clientes;

-- ------------------------------------------------------------
-- Figura r1-9b (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT id, cliente_id, total
FROM pedidos
WHERE total > 40;

SELECT id, total
FROM pedidos
ORDER BY total DESC;

SELECT id, total
FROM pedidos
ORDER BY total DESC
LIMIT 1;

-- ------------------------------------------------------------
-- Figura r1-9c (base de datos: tienda)
-- ------------------------------------------------------------
\c tienda
SELECT count(*) AS pedidos,
       sum(total) AS facturado,
       round(avg(total), 2) AS media
FROM pedidos;

-- ------------------------------------------------------------
-- Figura r1-10a (comandos de terminal)
-- ------------------------------------------------------------
-- $ pg_isready -h localhost -p 5433
-- $ psql "postgresql://postgres@localhost:5433/tienda" -c "SELECT current_database() AS base, current_user AS usuario, inet_server_port() AS puerto"

-- ------------------------------------------------------------
-- Figura r1-10b (comandos de terminal)
-- ------------------------------------------------------------
-- $ cat server.js
-- $ DATABASE_URL=postgresql://postgres@localhost:5433/tienda node server.js &
-- $ curl http://localhost:3000/clientes
-- $ curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/otra-cosa
-- $ kill %1

