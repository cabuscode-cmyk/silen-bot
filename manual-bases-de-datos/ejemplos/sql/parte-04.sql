-- ============================================================
-- Manual completo de bases de datos — Parte 04
-- Todo el código de los ejemplos, en el orden en que aparece.
--
-- Cómo usarlo:  psql -U postgres -f parte-04.sql
--           (o, dentro de psql:  \i parte-04.sql )
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
CREATE DATABASE normal;

-- ------------------------------------------------------------
-- Figura r4-1a (base de datos: normal)
-- ------------------------------------------------------------
\c normal
CREATE TABLE ventas_plano (
  pedido    integer,
  fecha     date,
  cliente   text,
  email     text,
  ciudad    text,
  provincia text,
  producto  text,
  precio    numeric(10, 2),
  cantidad  integer,
  PRIMARY KEY (pedido, producto)
);

INSERT INTO ventas_plano VALUES
  (101, '2026-03-02', 'Ana García', 'ana@ejemplo.com',   'Alcalá',  'Madrid', 'Camiseta', 19.95, 2),
  (101, '2026-03-02', 'Ana García', 'ana@ejemplo.com',   'Alcalá',  'Madrid', 'Gorra',     9.90, 1),
  (102, '2026-03-05', 'Marta Ruiz', 'marta@ejemplo.com', 'Getafe',  'Madrid', 'Mochila',  34.50, 1),
  (103, '2026-03-09', 'Ana García', 'ana@ejemplo.com',   'Alcalá',  'Madrid', 'Camiseta', 19.95, 1),
  (104, '2026-03-10', 'Luis Pérez', 'luis@ejemplo.com',  'Sevilla', 'Sevilla','Gorra',     9.90, 3);

SELECT * FROM ventas_plano ORDER BY pedido, producto;

-- ------------------------------------------------------------
-- Figura r4-1b (base de datos: normal)
-- ------------------------------------------------------------
\c normal
UPDATE ventas_plano
SET email = 'ana.nueva@ejemplo.com'
WHERE pedido = 101 AND producto = 'Camiseta';

SELECT DISTINCT cliente, email
FROM ventas_plano
WHERE cliente = 'Ana García';

-- ------------------------------------------------------------
-- Figura r4-1c (base de datos: normal)
-- ------------------------------------------------------------
\c normal
INSERT INTO ventas_plano (producto, precio) VALUES ('Taza', 7.50);

-- ------------------------------------------------------------
-- Figura r4-1d (base de datos: normal)
-- ------------------------------------------------------------
\c normal
DELETE FROM ventas_plano WHERE pedido = 104;

SELECT DISTINCT cliente FROM ventas_plano ORDER BY cliente;

-- ------------------------------------------------------------
-- Figura r4-2a (base de datos: normal)
-- ------------------------------------------------------------
\c normal
CREATE TABLE pedidos_lista (
  pedido    integer PRIMARY KEY,
  cliente   text,
  productos text      -- ¡varios productos en una celda!
);

INSERT INTO pedidos_lista VALUES
  (101, 'Ana García', 'Camiseta, Gorra'),
  (102, 'Marta Ruiz', 'Mochila'),
  (103, 'Ana García', 'Camiseta, Mochila');

SELECT count(*) AS pedidos_con_camiseta
FROM pedidos_lista
WHERE productos LIKE '%Camiseta%';

-- ------------------------------------------------------------
-- Figura r4-2b (base de datos: normal)
-- ------------------------------------------------------------
\c normal
SELECT pedido,
       cliente,
       unnest(string_to_array(productos, ', ')) AS producto
FROM pedidos_lista
ORDER BY pedido, producto;

-- ------------------------------------------------------------
-- Figura r4-2c (base de datos: normal)
-- ------------------------------------------------------------
\c normal
CREATE TABLE pedidos_1fn AS
SELECT pedido,
       cliente,
       unnest(string_to_array(productos, ', ')) AS producto
FROM pedidos_lista;

SELECT producto, count(*) AS pedidos
FROM pedidos_1fn
GROUP BY producto
ORDER BY producto;

-- ------------------------------------------------------------
-- Figura r4-3a (base de datos: normal)
-- ------------------------------------------------------------
\c normal
-- ¿Cada producto tiene un único precio? (si sale alguna fila, NO)
SELECT producto
FROM ventas_plano
GROUP BY producto
HAVING count(DISTINCT precio) > 1;

-- ¿Cuántas veces se repite cada precio?
SELECT producto, precio, count(*) AS veces_repetido
FROM ventas_plano
GROUP BY producto, precio
ORDER BY producto;

-- ------------------------------------------------------------
-- Figura r4-3b (base de datos: normal)
-- ------------------------------------------------------------
\c normal
CREATE TABLE productos (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  precio numeric(10, 2) NOT NULL
);

INSERT INTO productos (nombre, precio)
SELECT DISTINCT producto, precio
FROM ventas_plano
ORDER BY producto;

SELECT * FROM productos ORDER BY id;

-- ------------------------------------------------------------
-- Figura r4-3c (base de datos: normal)
-- ------------------------------------------------------------
\c normal
CREATE TABLE pedidos_2fn AS
SELECT DISTINCT pedido, fecha, cliente, email, ciudad, provincia
FROM ventas_plano;

CREATE TABLE lineas_2fn AS
SELECT v.pedido, p.id AS producto_id, v.cantidad
FROM ventas_plano v
JOIN productos p ON p.nombre = v.producto;

SELECT * FROM pedidos_2fn ORDER BY pedido;

SELECT * FROM lineas_2fn ORDER BY pedido, producto_id;

-- ------------------------------------------------------------
-- Figura r4-4a (base de datos: normal)
-- ------------------------------------------------------------
\c normal
-- ¿Cada cliente tiene un único email y ciudad? (filas = excepciones)
SELECT cliente
FROM pedidos_2fn
GROUP BY cliente
HAVING count(DISTINCT email) > 1 OR count(DISTINCT ciudad) > 1;

-- ¿Cada ciudad tiene una única provincia?
SELECT ciudad
FROM pedidos_2fn
GROUP BY ciudad
HAVING count(DISTINCT provincia) > 1;

-- ¿Cuántas veces se repiten los datos del cliente?
SELECT cliente, email, ciudad, provincia, count(*) AS pedidos
FROM pedidos_2fn
GROUP BY cliente, email, ciudad, provincia
ORDER BY cliente;

-- ------------------------------------------------------------
-- Figura r4-4b (base de datos: normal)
-- ------------------------------------------------------------
\c normal
CREATE TABLE ciudades (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre    text NOT NULL UNIQUE,
  provincia text NOT NULL
);

CREATE TABLE clientes (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre    text NOT NULL,
  email     text NOT NULL UNIQUE,
  ciudad_id integer NOT NULL REFERENCES ciudades (id)
);

CREATE TABLE pedidos (
  id         integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  fecha      date NOT NULL
);

CREATE TABLE lineas_pedido (
  pedido_id   integer NOT NULL REFERENCES pedidos (id),
  producto_id integer NOT NULL REFERENCES productos (id),
  cantidad    integer NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (pedido_id, producto_id)
);

-- ------------------------------------------------------------
-- Figura r4-4c (base de datos: normal)
-- ------------------------------------------------------------
\c normal
INSERT INTO ciudades (nombre, provincia)
SELECT DISTINCT ciudad, provincia FROM pedidos_2fn;

INSERT INTO clientes (nombre, email, ciudad_id)
SELECT DISTINCT p.cliente, p.email, c.id
FROM pedidos_2fn p
JOIN ciudades c ON c.nombre = p.ciudad;

INSERT INTO pedidos (id, cliente_id, fecha)
SELECT p.pedido, c.id, p.fecha
FROM pedidos_2fn p
JOIN clientes c ON c.email = p.email;

INSERT INTO lineas_pedido (pedido_id, producto_id, cantidad)
SELECT pedido, producto_id, cantidad FROM lineas_2fn;

SELECT * FROM ciudades ORDER BY id;

SELECT * FROM clientes ORDER BY id;

-- ------------------------------------------------------------
-- Figura r4-4d (base de datos: normal)
-- ------------------------------------------------------------
\c normal
CREATE VIEW ventas_reconstruida AS
SELECT p.id AS pedido, p.fecha, c.nombre AS cliente, c.email,
       ci.nombre AS ciudad, ci.provincia,
       pr.nombre AS producto, pr.precio, l.cantidad
FROM lineas_pedido l
JOIN pedidos   p  ON p.id  = l.pedido_id
JOIN clientes  c  ON c.id  = p.cliente_id
JOIN ciudades  ci ON ci.id = c.ciudad_id
JOIN productos pr ON pr.id = l.producto_id;

-- Filas de la tabla original que NO están en la reconstruida (debe salir 0)
SELECT * FROM ventas_plano
EXCEPT
SELECT * FROM ventas_reconstruida;

-- Filas de la reconstruida que NO estaban en la original (debe salir 0)
SELECT * FROM ventas_reconstruida
EXCEPT
SELECT * FROM ventas_plano;

-- ------------------------------------------------------------
-- Figura r4-4f (base de datos: normal)
-- ------------------------------------------------------------
\c normal
UPDATE clientes SET email = 'ana.nueva@ejemplo.com' WHERE nombre = 'Ana García';

SELECT DISTINCT cliente, email FROM ventas_reconstruida WHERE cliente = 'Ana García';

DELETE FROM lineas_pedido WHERE pedido_id = 104;
DELETE FROM pedidos WHERE id = 104;

SELECT nombre FROM clientes ORDER BY nombre;

INSERT INTO productos (nombre, precio) VALUES ('Taza', 7.50);

SELECT nombre, precio FROM productos ORDER BY id;

-- ------------------------------------------------------------
-- Figura r4-5a (base de datos: normal)
-- ------------------------------------------------------------
\c normal
-- ¿Se cumple «producto determina precio»? 0 filas = sí, hay dependencia
SELECT producto, count(DISTINCT precio) AS precios_distintos
FROM ventas_plano
GROUP BY producto
HAVING count(DISTINCT precio) > 1;

-- ¿Se cumple «pedido determina fecha»?
SELECT pedido, count(DISTINCT fecha) AS fechas_distintas
FROM ventas_plano
GROUP BY pedido
HAVING count(DISTINCT fecha) > 1;

-- ¿Y «provincia determina cliente»? (si salen filas, NO hay dependencia)
SELECT provincia, count(DISTINCT cliente) AS clientes_distintos
FROM ventas_plano
GROUP BY provincia
HAVING count(DISTINCT cliente) > 1;

-- Cuidado: «ciudad determina cliente» parece cumplirse... ¡solo por casualidad!
SELECT ciudad, count(DISTINCT cliente) AS clientes_distintos
FROM ventas_plano
GROUP BY ciudad
HAVING count(DISTINCT cliente) > 1;

-- ------------------------------------------------------------
-- Figura r4-6a (base de datos: normal)
-- ------------------------------------------------------------
\c normal
ALTER TABLE pedidos ADD COLUMN total numeric(10, 2);

UPDATE pedidos p
SET total = (
  SELECT sum(l.cantidad * pr.precio)
  FROM lineas_pedido l
  JOIN productos pr ON pr.id = l.producto_id
  WHERE l.pedido_id = p.id
);

SELECT id, total FROM pedidos ORDER BY id;

-- ------------------------------------------------------------
-- Figura r4-6b (base de datos: normal)
-- ------------------------------------------------------------
\c normal
UPDATE lineas_pedido SET cantidad = 5 WHERE pedido_id = 101 AND producto_id = 1;

-- Comparamos el total guardado con el total recalculado
SELECT p.id,
       p.total AS total_guardado,
       sum(l.cantidad * pr.precio) AS total_real
FROM pedidos p
JOIN lineas_pedido l ON l.pedido_id = p.id
JOIN productos pr ON pr.id = l.producto_id
GROUP BY p.id, p.total
ORDER BY p.id;

-- ------------------------------------------------------------
-- Figura r4-7a (base de datos: normal)
-- ------------------------------------------------------------
\c normal
-- Anti-patrón: tabla «clave-valor» para guardarlo todo
CREATE TABLE datos (
  entidad_id integer,
  atributo   text,
  valor      text
);

INSERT INTO datos VALUES
  (1, 'nombre', 'Ana García'), (1, 'email', 'ana@ejemplo.com'), (1, 'edad', 'treinta'),
  (2, 'nombre', 'Luis Pérez'), (2, 'email', 'luis@ejemplo.com');

-- Para ver nombre y email en una fila hay que desmontar y volver a montar
SELECT entidad_id,
       max(valor) FILTER (WHERE atributo = 'nombre') AS nombre,
       max(valor) FILTER (WHERE atributo = 'email')  AS email
FROM datos
GROUP BY entidad_id
ORDER BY entidad_id;

-- Y nada impide guardar disparates: la edad es texto
SELECT valor FROM datos WHERE atributo = 'edad';

