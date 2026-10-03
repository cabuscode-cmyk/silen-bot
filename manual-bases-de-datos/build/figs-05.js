const {render,T,SH,PTY,er,pgcsv,term}=require('./figlib');const {spawnSync}=require('child_process');
const P=(db,args)=>spawnSync('psql',['-h','/tmp','-p','5433','-U','postgres','-d',db,'-X','-q',...args],{encoding:'utf8'});
['tienda','ensayo'].forEach(d=>{P('postgres',['-c',`DROP DATABASE IF EXISTS ${d}`]);P('postgres',['-c',`CREATE DATABASE ${d}`]);});
const F={};const W=(w,fs)=>({w:w||1100,fs:fs||12});
/* 5.1 CREATE */
F['r5-1a']=T('r5-1a','tienda',[`CREATE TABLE clientes (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  email  text NOT NULL UNIQUE,
  telefono text,
  ciudad text,
  alta   date NOT NULL DEFAULT current_date
);`,`CREATE TABLE productos (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre     text NOT NULL,
  categoria  text NOT NULL,
  precio_eur numeric(10, 2) NOT NULL CHECK (precio_eur >= 0),
  stock      integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  activo     boolean NOT NULL DEFAULT true
);`,`CREATE TABLE pedidos (
  id         integer GENERATED ALWAYS AS IDENTITY (START WITH 101) PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  fecha      date NOT NULL DEFAULT current_date,
  estado     text NOT NULL DEFAULT 'pendiente'
             CHECK (estado IN ('pendiente', 'enviado', 'entregado', 'cancelado'))
);`,`CREATE TABLE lineas_pedido (
  pedido_id    integer NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  producto_id  integer NOT NULL REFERENCES productos (id),
  cantidad     integer NOT NULL CHECK (cantidad > 0),
  precio_venta numeric(10, 2) NOT NULL CHECK (precio_venta >= 0),
  PRIMARY KEY (pedido_id, producto_id)
);`,`\\dt`],W(1000,12));
F['r5-1b']=PTY('r5-1b','ensayo',[`CREATE SEQUENCE numero_factura START 1000;`,`SELECT nextval('numero_factura');`,`SELECT nextval('numero_factura');`,`SELECT currval('numero_factura');`,`CREATE TABLE facturas (`,`  numero  integer PRIMARY KEY DEFAULT nextval('numero_factura'),`,`  importe numeric(10, 2) NOT NULL`,`);`,`INSERT INTO facturas (importe) VALUES (50), (75.5) RETURNING numero, importe;`],{w:1000,fs:12.5,delay:0.5});
F['r5-1c']=T('r5-1c','ensayo',[`CREATE TABLE tipos_demo (
  entero     integer,
  grande     bigint,
  decimal    numeric(8, 3),
  texto      text,
  limitado   varchar(5),
  verdadero  boolean,
  dia        date,
  hora       time,
  instante   timestamptz,
  identif    uuid,
  datos      jsonb
);`,`\\d tipos_demo`],W(1000,12));
/* 5.2 INSERT: dataset completo */
F['r5-2a']=T('r5-2a','tienda',[`INSERT INTO clientes (nombre, email, telefono, ciudad, alta)
VALUES ('Ana García', 'ana@ejemplo.com', '600111222', 'Madrid', '2025-11-03');`,`INSERT INTO clientes (nombre, email, telefono, ciudad, alta) VALUES
  ('Luis Pérez',  'luis@ejemplo.com',  NULL,        'Sevilla',  '2025-12-15'),
  ('Marta Ruiz',  'marta@ejemplo.com', '600333444', 'Madrid',   '2026-01-08'),
  ('Pedro Gil',   'pedro@ejemplo.com', '600444555', 'Valencia', '2026-01-20'),
  ('Sara León',   'sara@ejemplo.com',  NULL,        'Madrid',   '2026-02-02'),
  ('Raúl Mora',   'raul@ejemplo.com',  '600666777', 'Sevilla',  '2026-02-14'),
  ('Elena Vidal', 'elena@ejemplo.com', '600777888', 'Bilbao',   '2026-02-28'),
  ('Tomás Cano',  'tomas@ejemplo.com', NULL,        NULL,       '2026-03-05');`,`SELECT count(*) AS clientes FROM clientes;`],W(1000,12));
F['r5-2b']=T('r5-2b','tienda',[`INSERT INTO productos (nombre, categoria, precio_eur, stock, activo) VALUES
  ('Camiseta',   'ropa',       19.95,  12, true),
  ('Gorra',      'ropa',        9.90,   0, true),
  ('Mochila',    'accesorios', 34.50,   5, true),
  ('Botella',    'accesorios', 12.00,  30, true),
  ('Zapatillas', 'calzado',    59.90,   8, true),
  ('Sudadera',   'ropa',       39.90,   0, false),
  ('Calcetines', 'ropa',        4.50, 100, true),
  ('Cartera',    'accesorios', 24.00,  15, true);`,`INSERT INTO pedidos (cliente_id, fecha, estado) VALUES
  (1, '2026-01-12', 'entregado'), (3, '2026-01-15', 'entregado'), (1, '2026-02-03', 'entregado'),
  (4, '2026-02-10', 'enviado'),   (2, '2026-02-18', 'entregado'), (1, '2026-02-25', 'cancelado'),
  (6, '2026-03-02', 'entregado'), (3, '2026-03-09', 'enviado'),   (5, '2026-03-12', 'pendiente'),
  (1, '2026-03-15', 'pendiente'), (6, '2026-03-18', 'pendiente'), (7, '2026-03-20', 'pendiente');`,`INSERT INTO lineas_pedido (pedido_id, producto_id, cantidad, precio_venta) VALUES
  (101, 2, 1, 19.95), (101, 1, 2,  9.90),
  (102, 3, 1, 34.50),
  (103, 1, 1, 19.95), (103, 3, 1, 34.50), (103, 4, 2, 12.00),
  (104, 5, 1, 59.90),
  (105, 7, 6,  4.50), (105, 2, 2,  9.90),
  (106, 6, 1, 39.90),
  (107, 1, 3, 19.95), (107, 8, 1, 24.00),
  (108, 4, 1, 12.00), (108, 7, 3,  4.50),
  (109, 5, 1, 59.90), (109, 1, 1, 19.95),
  (110, 3, 2, 34.50),
  (111, 8, 1, 24.00), (111, 4, 2, 12.00),
  (112, 2, 1,  9.90), (112, 7, 4,  4.50), (112, 1, 2, 19.95);`],W(1000,11.5));
F['r5-2c']=T('r5-2c','tienda',[`INSERT INTO clientes (nombre, email) VALUES ('Prueba', 'ana@ejemplo.com');`,`INSERT INTO clientes (nombre, email) VALUES ('Prueba', 'ana@ejemplo.com')
ON CONFLICT (email) DO NOTHING;`,`INSERT INTO clientes (nombre, email) VALUES ('Ana G.', 'ana@ejemplo.com')
ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre
RETURNING id, nombre, email;`],W(1000,12));
F['r5-2d']=T('r5-2d','tienda',[`UPDATE clientes SET nombre = 'Ana García' WHERE email = 'ana@ejemplo.com';`,`CREATE TABLE clientes_copia AS SELECT * FROM clientes WHERE ciudad = 'Madrid';`,`INSERT INTO clientes_copia SELECT * FROM clientes WHERE ciudad = 'Sevilla';`,`SELECT id, nombre, ciudad FROM clientes_copia ORDER BY id;`],W(1000,12));
/* 5.3 SELECT */
F['r5-3a']=T('r5-3a','tienda',[`SELECT * FROM productos;`,`SELECT nombre, precio_eur FROM productos;`,`SELECT nombre AS producto, precio_eur AS precio, precio_eur * 1.21 AS con_iva
FROM productos;`],W(1000,12));
F['r5-3b']=T('r5-3b','tienda',[`SELECT categoria FROM productos;`,`SELECT DISTINCT categoria FROM productos ORDER BY categoria;`,`SELECT nombre, precio_eur FROM productos ORDER BY precio_eur DESC;`,`SELECT nombre, categoria, precio_eur FROM productos ORDER BY categoria, precio_eur DESC;`],W(1000,12));
F['r5-3c']=T('r5-3c','tienda',[`SELECT nombre, precio_eur FROM productos ORDER BY precio_eur DESC LIMIT 3;`,`SELECT nombre, precio_eur FROM productos ORDER BY precio_eur DESC LIMIT 3 OFFSET 3;`],W(1000,12.5));
/* 5.4 WHERE */
F['r5-4a']=T('r5-4a','tienda',[`SELECT nombre, precio_eur FROM productos WHERE precio_eur > 20;`,`SELECT nombre, categoria FROM productos WHERE categoria = 'ropa' AND stock > 0;`,`SELECT nombre, categoria, activo FROM productos WHERE categoria = 'calzado' OR activo = false;`,`SELECT nombre FROM productos WHERE NOT activo;`],W(1000,12));
F['r5-4b']=T('r5-4b','tienda',[`SELECT nombre, categoria FROM productos WHERE categoria IN ('calzado', 'accesorios');`,`SELECT nombre, precio_eur FROM productos WHERE precio_eur BETWEEN 10 AND 25;`,`SELECT nombre FROM clientes WHERE nombre LIKE 'M%';`,`SELECT nombre FROM clientes WHERE nombre ILIKE '%GARC%';`,`SELECT nombre, telefono FROM clientes WHERE telefono IS NULL;`],W(1000,12));
F['r5-4c']=T('r5-4c','tienda',[`-- AND se evalúa antes que OR: cuidado
SELECT nombre, categoria, precio_eur FROM productos
WHERE categoria = 'ropa' OR categoria = 'calzado' AND precio_eur > 50;`,`-- Con paréntesis se obtiene lo que se quiere
SELECT nombre, categoria, precio_eur FROM productos
WHERE (categoria = 'ropa' OR categoria = 'calzado') AND precio_eur > 50;`],W(1000,12));
/* 5.5 UPDATE / DELETE */
F['r5-5a']=T('r5-5a','tienda',[`SELECT id, nombre, stock FROM productos WHERE nombre = 'Gorra';`,`UPDATE productos SET stock = stock + 20 WHERE nombre = 'Gorra';`,`SELECT id, nombre, stock FROM productos WHERE nombre = 'Gorra';`,`UPDATE productos SET precio_eur = precio_eur * 1.10, stock = stock - 1 WHERE categoria = 'calzado' RETURNING nombre, precio_eur, stock;`],W(1000,12));
F['r5-5b']=T('r5-5b','tienda',[`INSERT INTO clientes (nombre, email) VALUES ('Cliente de prueba', 'prueba@ejemplo.com');`,`-- Primero, SELECT con el mismo WHERE: ¿qué filas voy a borrar?
SELECT id, nombre, email FROM clientes WHERE email = 'prueba@ejemplo.com';`,`DELETE FROM clientes WHERE email = 'prueba@ejemplo.com';`,`DELETE FROM clientes WHERE id = 1;`],W(1000,12));
/* 5.6 agregación */
F['r5-6a']=T('r5-6a','tienda',[`SELECT count(*) AS productos,
       count(DISTINCT categoria) AS categorias,
       sum(stock) AS unidades,
       avg(precio_eur) AS precio_medio,
       min(precio_eur) AS mas_barato,
       max(precio_eur) AS mas_caro
FROM productos;`,`SELECT count(*) AS clientes, count(telefono) AS con_telefono FROM clientes;`],W(1000,12));
F['r5-6b']=T('r5-6b','tienda',[`SELECT categoria, count(*) AS productos, round(avg(precio_eur), 2) AS precio_medio
FROM productos
GROUP BY categoria
ORDER BY categoria;`,`SELECT categoria, count(*) AS productos
FROM productos
GROUP BY categoria
HAVING count(*) >= 3;`,`SELECT categoria, nombre, count(*) FROM productos GROUP BY categoria;`],W(1000,12));
/* 5.7 JOIN: tablas pequeñas de apoyo */
F['r5-7a']=T('r5-7a','tienda',[`SELECT c.nombre AS cliente, p.id AS pedido, p.estado
FROM clientes c
INNER JOIN pedidos p ON p.cliente_id = c.id
ORDER BY p.id
LIMIT 6;`,`SELECT c.nombre AS cliente, p.id AS pedido
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id
WHERE p.id IS NULL;`],W(1000,12));
F['r5-7b']=T('r5-7b','tienda',[`-- Un pedido completo: cuatro tablas
SELECT p.id AS pedido, c.nombre AS cliente, pr.nombre AS producto, l.cantidad, l.precio_venta
FROM pedidos p
JOIN clientes c         ON c.id = p.cliente_id
JOIN lineas_pedido l    ON l.pedido_id = p.id
JOIN productos pr       ON pr.id = l.producto_id
WHERE p.id = 103;`,`-- Ventas por cliente (JOIN + GROUP BY)
SELECT c.nombre, count(DISTINCT p.id) AS pedidos, sum(l.cantidad * l.precio_venta) AS gastado
FROM clientes c
JOIN pedidos p       ON p.cliente_id = c.id
JOIN lineas_pedido l ON l.pedido_id = p.id
GROUP BY c.nombre
ORDER BY gastado DESC;`],W(1000,12));
F['r5-7c']=T('r5-7c','ensayo',[`CREATE TABLE a (x text);
CREATE TABLE b (x text);
INSERT INTO a VALUES ('uno'), ('dos'), ('tres');
INSERT INTO b VALUES ('dos'), ('tres'), ('cuatro');`,`SELECT a.x AS a, b.x AS b FROM a INNER JOIN b ON a.x = b.x;`,`SELECT a.x AS a, b.x AS b FROM a LEFT JOIN b ON a.x = b.x;`,`SELECT a.x AS a, b.x AS b FROM a RIGHT JOIN b ON a.x = b.x;`,`SELECT a.x AS a, b.x AS b FROM a FULL JOIN b ON a.x = b.x;`,`SELECT a.x AS a, b.x AS b FROM a CROSS JOIN b;`],W(1000,11.5));
/* 5.8 UNION */
F['r5-8a']=T('r5-8a','tienda',[`SELECT ciudad FROM clientes WHERE ciudad = 'Madrid'
UNION
SELECT ciudad FROM clientes WHERE ciudad IN ('Madrid', 'Sevilla');`,`SELECT ciudad FROM clientes WHERE ciudad = 'Madrid'
UNION ALL
SELECT ciudad FROM clientes WHERE ciudad IN ('Madrid', 'Sevilla');`,`SELECT nombre FROM productos WHERE categoria = 'ropa'
INTERSECT
SELECT nombre FROM productos WHERE stock > 0
ORDER BY nombre;`,`SELECT nombre FROM productos WHERE categoria = 'ropa'
EXCEPT
SELECT nombre FROM productos WHERE stock > 0;`],W(1000,11.5));
/* 5.9 subconsultas y CTE */
F['r5-9a']=T('r5-9a','tienda',[`SELECT nombre, precio_eur FROM productos
WHERE precio_eur > (SELECT avg(precio_eur) FROM productos);`,`SELECT nombre FROM clientes
WHERE id IN (SELECT cliente_id FROM pedidos WHERE estado = 'pendiente');`,`SELECT nombre FROM clientes c
WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id);`],W(1000,12));
F['r5-9b']=T('r5-9b','tienda',[`WITH gasto AS (
  SELECT p.cliente_id, sum(l.cantidad * l.precio_venta) AS total
  FROM pedidos p
  JOIN lineas_pedido l ON l.pedido_id = p.id
  WHERE p.estado <> 'cancelado'
  GROUP BY p.cliente_id
)
SELECT c.nombre, g.total
FROM gasto g
JOIN clientes c ON c.id = g.cliente_id
WHERE g.total > 60
ORDER BY g.total DESC;`],W(1000,12));
/* 5.10 CASE COALESCE NULLIF */
F['r5-10a']=T('r5-10a','tienda',[`SELECT nombre, precio_eur,
       CASE WHEN precio_eur < 10 THEN 'barato'
            WHEN precio_eur < 30 THEN 'medio'
            ELSE 'caro' END AS gama
FROM productos
ORDER BY precio_eur;`,`SELECT nombre, COALESCE(telefono, 'sin teléfono') AS telefono, COALESCE(ciudad, '—') AS ciudad
FROM clientes ORDER BY id;`,`SELECT NULLIF(0, 0) AS cero_a_null, 10 / NULLIF(0, 0) AS division_segura;`],W(1000,12));
/* 5.11 funciones */
F['r5-11a']=T('r5-11a','tienda',[`SELECT upper(nombre) AS mayus, lower(email) AS minus, length(nombre) AS largo,
       substring(nombre FROM 1 FOR 3) AS tres, nombre || ' <' || email || '>' AS completo
FROM clientes WHERE id <= 3;`,`SELECT replace(email, '@ejemplo.com', '@empresa.com') AS nuevo, trim('  hola  ') AS sin_espacios,
       split_part(email, '@', 1) AS usuario, position('@' IN email) AS pos_arroba
FROM clientes WHERE id = 3;`],W(1000,12));
F['r5-11b']=T('r5-11b','tienda',[`SELECT round(19.956, 2) AS redondeo, ceil(19.1) AS techo, floor(19.9) AS suelo,
       abs(-5) AS absoluto, 17 % 5 AS resto, power(2, 10) AS potencia, 7 / 2 AS entera, 7 / 2.0 AS decimal;`,`SELECT nombre, precio_eur, round(precio_eur * 0.21, 2) AS iva, round(precio_eur * 1.21, 2) AS total
FROM productos WHERE categoria = 'accesorios';`],W(1000,12));
F['r5-11c']=T('r5-11c','tienda',[`SELECT fecha,
       extract(month FROM fecha) AS mes, extract(year FROM fecha) AS anio,
       to_char(fecha, 'DD/MM/YYYY') AS formateada,
       fecha + 30 AS mas_30_dias, date_trunc('month', fecha)::date AS primer_dia_mes
FROM pedidos WHERE id IN (101, 112);`,`SELECT date_trunc('month', fecha)::date AS mes, count(*) AS pedidos
FROM pedidos GROUP BY 1 ORDER BY 1;`,`SELECT age(date '2026-03-20', date '2025-11-03') AS antiguedad, date '2026-03-20' - date '2026-01-01' AS dias_entre_fechas;`],W(1000,11.5));
/* 5.12 ventanas */
F['r5-12a']=T('r5-12a','tienda',[`SELECT nombre, categoria, precio_eur,
       row_number() OVER (PARTITION BY categoria ORDER BY precio_eur DESC) AS puesto,
       rank()       OVER (ORDER BY precio_eur DESC) AS ranking_global
FROM productos
ORDER BY categoria, puesto;`,`SELECT categoria, nombre, precio_eur,
       round(avg(precio_eur) OVER (PARTITION BY categoria), 2) AS media_categoria,
       precio_eur - round(avg(precio_eur) OVER (PARTITION BY categoria), 2) AS diferencia
FROM productos ORDER BY categoria, nombre;`],W(1100,11.5));
F['r5-12b']=T('r5-12b','tienda',[`SELECT id, fecha, estado,
       lag(fecha)  OVER (ORDER BY fecha) AS pedido_anterior,
       lead(fecha) OVER (ORDER BY fecha) AS pedido_siguiente
FROM pedidos WHERE cliente_id = 1 ORDER BY fecha;`,`SELECT p.fecha, sum(l.cantidad * l.precio_venta) AS venta_dia,
       sum(sum(l.cantidad * l.precio_venta)) OVER (ORDER BY p.fecha) AS acumulado
FROM pedidos p JOIN lineas_pedido l ON l.pedido_id = p.id
WHERE p.estado <> 'cancelado'
GROUP BY p.fecha ORDER BY p.fecha;`],W(1100,11.5));
/* 5.13 recursivas */
F['r5-13a']=T('r5-13a','ensayo',[`CREATE TABLE categorias (
  id     integer PRIMARY KEY,
  nombre text NOT NULL,
  padre_id integer REFERENCES categorias (id)
);`,`INSERT INTO categorias VALUES
  (1, 'Tienda', NULL), (2, 'Ropa', 1), (3, 'Accesorios', 1),
  (4, 'Camisetas', 2), (5, 'Sudaderas', 2), (6, 'Mochilas', 3), (7, 'Camisetas de manga larga', 4);`,`WITH RECURSIVE arbol AS (
  SELECT id, nombre, padre_id, 1 AS nivel, nombre::text AS ruta
  FROM categorias WHERE padre_id IS NULL
  UNION ALL
  SELECT c.id, c.nombre, c.padre_id, a.nivel + 1, a.ruta || ' > ' || c.nombre
  FROM categorias c JOIN arbol a ON c.padre_id = a.id
)
SELECT nivel, ruta FROM arbol ORDER BY ruta;`],W(1000,12));
/* 5.14 vistas e índices */
F['r5-14a']=T('r5-14a','tienda',[`CREATE VIEW ventas_por_pedido AS
SELECT p.id AS pedido, c.nombre AS cliente, p.fecha, p.estado,
       sum(l.cantidad * l.precio_venta) AS total
FROM pedidos p
JOIN clientes c      ON c.id = p.cliente_id
JOIN lineas_pedido l ON l.pedido_id = p.id
GROUP BY p.id, c.nombre, p.fecha, p.estado;`,`SELECT * FROM ventas_por_pedido WHERE estado = 'pendiente' ORDER BY pedido;`,`\\dv`],W(1000,12));
F['r5-14b']=T('r5-14b','tienda',[`CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);`,`CREATE INDEX idx_pedidos_fecha ON pedidos (fecha);`,`CREATE UNIQUE INDEX uq_productos_nombre ON productos (lower(nombre));`,`\\di`,`ALTER TABLE productos ADD CONSTRAINT stock_razonable CHECK (stock <= 10000);`,`ALTER TABLE clientes ADD COLUMN actualizado_en timestamptz;`],W(1000,12));
/* 5.15 transacciones (sesión interactiva real) */
F['r5-15a']=PTY('r5-15a','tienda',[`BEGIN;`,`UPDATE productos SET stock = stock - 1 WHERE nombre = 'Camiseta';`,`SELECT nombre, stock FROM productos WHERE nombre = 'Camiseta';`,`ROLLBACK;`,`SELECT nombre, stock FROM productos WHERE nombre = 'Camiseta';`],{w:1000,fs:12.5,delay:0.5});
F['r5-15b']=PTY('r5-15b','tienda',[`BEGIN;`,`INSERT INTO pedidos (cliente_id) VALUES (2) RETURNING id;`,`INSERT INTO lineas_pedido VALUES (113, 1, 0, 19.95);`,`SELECT 1;`,`ROLLBACK;`,`SELECT count(*) AS pedidos FROM pedidos;`],{w:1000,fs:12,delay:0.5});
F['r5-15c']=PTY('r5-15c','tienda',[`BEGIN;`,`UPDATE productos SET stock = stock - 2 WHERE nombre = 'Mochila';`,`SAVEPOINT antes_del_error;`,`UPDATE productos SET stock = -999 WHERE nombre = 'Mochila';`,`ROLLBACK TO antes_del_error;`,`COMMIT;`,`SELECT nombre, stock FROM productos WHERE nombre = 'Mochila';`],{w:1000,fs:12,delay:0.5});
/* 5.16 funciones, procedimientos, triggers */
F['r5-16a']=T('r5-16a','tienda',[`CREATE FUNCTION total_pedido(p_pedido integer) RETURNS numeric AS $$
  SELECT sum(cantidad * precio_venta) FROM lineas_pedido WHERE pedido_id = p_pedido;
$$ LANGUAGE sql;`,`SELECT total_pedido(103) AS total_103;`,`SELECT id, total_pedido(id) AS total FROM pedidos WHERE cliente_id = 1 ORDER BY id;`],W(1000,12));
F['r5-16b']=T('r5-16b','tienda',[`CREATE FUNCTION marcar_actualizado() RETURNS trigger AS $$
BEGIN
  NEW.actualizado_en := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`,`CREATE TRIGGER trg_clientes_actualizado
BEFORE UPDATE ON clientes
FOR EACH ROW EXECUTE FUNCTION marcar_actualizado();`,`UPDATE clientes SET telefono = '699000111' WHERE email = 'luis@ejemplo.com';`,`SELECT nombre, telefono, actualizado_en IS NOT NULL AS tiene_marca FROM clientes WHERE id IN (2, 3) ORDER BY id;`],W(1000,12));
F['r5-16c']=T('r5-16c','tienda',[`CREATE PROCEDURE cancelar_pedido(p_pedido integer) AS $$
BEGIN
  UPDATE pedidos SET estado = 'cancelado' WHERE id = p_pedido AND estado = 'pendiente';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El pedido % no existe o no está pendiente', p_pedido;
  END IF;
END;
$$ LANGUAGE plpgsql;`,`CALL cancelar_pedido(110);`,`CALL cancelar_pedido(101);`,`SELECT id, estado FROM pedidos WHERE id IN (101, 110) ORDER BY id;`],W(1000,12));
/* 5.17 errores */
F['r5-17a']=T('r5-17a','tienda',[`SELECT nombres FROM clientes;`,`SELECT id FROM clientes c JOIN pedidos p ON p.cliente_id = c.id;`,`SELECT categoria, nombre, count(*) FROM productos GROUP BY categoria;`,`SELECT * FROM clientes WHERE telefono = 600111222;`,`SELECT 1 / 0;`,`SELECT * FROM productos WHERE precio_eur > 'caro';`],W(1000,12));
/* 5.18 práctica integrada */
F['r5-18a']=T('r5-18a','tienda',[`-- 1. Clientes de Madrid, del más antiguo al más reciente
SELECT nombre, alta FROM clientes WHERE ciudad = 'Madrid' ORDER BY alta;`,`-- 2. Productos sin stock
SELECT nombre, categoria FROM productos WHERE stock = 0;`,`-- 3. Los 3 clientes que más han gastado (sin contar pedidos cancelados)
SELECT c.nombre, sum(l.cantidad * l.precio_venta) AS gastado
FROM clientes c
JOIN pedidos p       ON p.cliente_id = c.id AND p.estado <> 'cancelado'
JOIN lineas_pedido l ON l.pedido_id = p.id
GROUP BY c.nombre
ORDER BY gastado DESC
LIMIT 3;`],W(1000,12));
F['r5-18b']=T('r5-18b','tienda',[`-- 4. Unidades vendidas por categoría
SELECT pr.categoria, sum(l.cantidad) AS unidades
FROM lineas_pedido l
JOIN productos pr ON pr.id = l.producto_id
JOIN pedidos p    ON p.id = l.pedido_id AND p.estado <> 'cancelado'
GROUP BY pr.categoria
ORDER BY unidades DESC;`,`-- 5. Ranking de clientes por gasto, con posición
WITH gasto AS (
  SELECT c.nombre, sum(l.cantidad * l.precio_venta) AS total
  FROM clientes c
  JOIN pedidos p ON p.cliente_id = c.id AND p.estado <> 'cancelado'
  JOIN lineas_pedido l ON l.pedido_id = p.id
  GROUP BY c.nombre
)
SELECT rank() OVER (ORDER BY total DESC) AS puesto, nombre, total FROM gasto ORDER BY puesto;`,`-- 6. Clientes que nunca han hecho un pedido
SELECT c.nombre FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL;`],W(1000,12));
render(F,'parte 5');
