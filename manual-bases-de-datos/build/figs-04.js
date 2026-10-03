const {render,T,er,pgcsv}=require('./figlib');const {spawnSync}=require('child_process');
const P=(db,args)=>spawnSync('psql',['-h','/tmp','-p','5433','-U','postgres','-d',db,'-X','-q',...args],{encoding:'utf8'});
['normal'].forEach(d=>{P('postgres',['-c',`DROP DATABASE IF EXISTS ${d}`]);P('postgres',['-c',`CREATE DATABASE ${d}`]);});
const cat=(db)=>{const q=(s)=>pgcsv(db,s).rows;const cols=q("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position");
 const kc=t=>new Set(q(`SELECT kcu.table_name||'.'||kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema) WHERE tc.constraint_type='${t}' AND tc.table_schema='public'`).map(r=>r[0]));
 const pk=kc('PRIMARY KEY'),fk=kc('FOREIGN KEY');const by={};cols.forEach(([t,c])=>{const k=t+'.'+c;(by[t]=by[t]||[]).push((pk.has(k)&&fk.has(k)?'+':pk.has(k)?'*':fk.has(k)?'>':'')+c)});return by;};
const F={};
const W={w:1100,fs:11.5};
/* 4.1 problema */
F['r4-1a']=T('r4-1a','normal',[`CREATE TABLE ventas_plano (
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
);`,`INSERT INTO ventas_plano VALUES
  (101, '2026-03-02', 'Ana García', 'ana@ejemplo.com',   'Alcalá',  'Madrid', 'Camiseta', 19.95, 2),
  (101, '2026-03-02', 'Ana García', 'ana@ejemplo.com',   'Alcalá',  'Madrid', 'Gorra',     9.90, 1),
  (102, '2026-03-05', 'Marta Ruiz', 'marta@ejemplo.com', 'Getafe',  'Madrid', 'Mochila',  34.50, 1),
  (103, '2026-03-09', 'Ana García', 'ana@ejemplo.com',   'Alcalá',  'Madrid', 'Camiseta', 19.95, 1),
  (104, '2026-03-10', 'Luis Pérez', 'luis@ejemplo.com',  'Sevilla', 'Sevilla','Gorra',     9.90, 3);`,`SELECT * FROM ventas_plano ORDER BY pedido, producto;`],{w:1200,fs:11.5});
F['r4-1b']=T('r4-1b','normal',[`UPDATE ventas_plano
SET email = 'ana.nueva@ejemplo.com'
WHERE pedido = 101 AND producto = 'Camiseta';`,`SELECT DISTINCT cliente, email
FROM ventas_plano
WHERE cliente = 'Ana García';`],{w:1000,fs:12});
F['r4-1c']=T('r4-1c','normal',[`INSERT INTO ventas_plano (producto, precio) VALUES ('Taza', 7.50);`],{w:1000,fs:12});
F['r4-1d']=T('r4-1d','normal',[`DELETE FROM ventas_plano WHERE pedido = 104;`,`SELECT DISTINCT cliente FROM ventas_plano ORDER BY cliente;`],{w:900,fs:12.5});
/* reponer estado limpio para el resto */
P('normal',['-c',"UPDATE ventas_plano SET email='ana@ejemplo.com' WHERE cliente='Ana García'",'-c',"INSERT INTO ventas_plano VALUES (104,'2026-03-10','Luis Pérez','luis@ejemplo.com','Sevilla','Sevilla','Gorra',9.90,3)"]);
/* 4.2 1FN */
F['r4-2a']=T('r4-2a','normal',[`CREATE TABLE pedidos_lista (
  pedido    integer PRIMARY KEY,
  cliente   text,
  productos text      -- ¡varios productos en una celda!
);`,`INSERT INTO pedidos_lista VALUES
  (101, 'Ana García', 'Camiseta, Gorra'),
  (102, 'Marta Ruiz', 'Mochila'),
  (103, 'Ana García', 'Camiseta, Mochila');`,`SELECT count(*) AS pedidos_con_camiseta
FROM pedidos_lista
WHERE productos LIKE '%Camiseta%';`],{w:1000,fs:12});
F['r4-2b']=T('r4-2b','normal',[`SELECT pedido,
       cliente,
       unnest(string_to_array(productos, ', ')) AS producto
FROM pedidos_lista
ORDER BY pedido, producto;`],{w:1000,fs:12.5});
F['r4-2c']=T('r4-2c','normal',[`CREATE TABLE pedidos_1fn AS
SELECT pedido,
       cliente,
       unnest(string_to_array(productos, ', ')) AS producto
FROM pedidos_lista;`,`SELECT producto, count(*) AS pedidos
FROM pedidos_1fn
GROUP BY producto
ORDER BY producto;`],{w:1000,fs:12.5});
/* 4.3 2FN */
F['r4-3a']=T('r4-3a','normal',[`-- ¿Cada producto tiene un único precio? (si sale alguna fila, NO)
SELECT producto
FROM ventas_plano
GROUP BY producto
HAVING count(DISTINCT precio) > 1;`,`-- ¿Cuántas veces se repite cada precio?
SELECT producto, precio, count(*) AS veces_repetido
FROM ventas_plano
GROUP BY producto, precio
ORDER BY producto;`],{w:1000,fs:12});
F['r4-3b']=T('r4-3b','normal',[`CREATE TABLE productos (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  precio numeric(10, 2) NOT NULL
);`,`INSERT INTO productos (nombre, precio)
SELECT DISTINCT producto, precio
FROM ventas_plano
ORDER BY producto;`,`SELECT * FROM productos ORDER BY id;`],{w:1000,fs:12});
F['r4-3c']=T('r4-3c','normal',[`CREATE TABLE pedidos_2fn AS
SELECT DISTINCT pedido, fecha, cliente, email, ciudad, provincia
FROM ventas_plano;`,`CREATE TABLE lineas_2fn AS
SELECT v.pedido, p.id AS producto_id, v.cantidad
FROM ventas_plano v
JOIN productos p ON p.nombre = v.producto;`,`SELECT * FROM pedidos_2fn ORDER BY pedido;`,`SELECT * FROM lineas_2fn ORDER BY pedido, producto_id;`],{w:1100,fs:11.5});
/* 4.4 3FN */
F['r4-4a']=T('r4-4a','normal',[`-- ¿Cada cliente tiene un único email y ciudad? (filas = excepciones)
SELECT cliente
FROM pedidos_2fn
GROUP BY cliente
HAVING count(DISTINCT email) > 1 OR count(DISTINCT ciudad) > 1;`,`-- ¿Cada ciudad tiene una única provincia?
SELECT ciudad
FROM pedidos_2fn
GROUP BY ciudad
HAVING count(DISTINCT provincia) > 1;`,`-- ¿Cuántas veces se repiten los datos del cliente?
SELECT cliente, email, ciudad, provincia, count(*) AS pedidos
FROM pedidos_2fn
GROUP BY cliente, email, ciudad, provincia
ORDER BY cliente;`],{w:1100,fs:11.5});
F['r4-4b']=T('r4-4b','normal',[`CREATE TABLE ciudades (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre    text NOT NULL UNIQUE,
  provincia text NOT NULL
);`,`CREATE TABLE clientes (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre    text NOT NULL,
  email     text NOT NULL UNIQUE,
  ciudad_id integer NOT NULL REFERENCES ciudades (id)
);`,`CREATE TABLE pedidos (
  id         integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  fecha      date NOT NULL
);`,`CREATE TABLE lineas_pedido (
  pedido_id   integer NOT NULL REFERENCES pedidos (id),
  producto_id integer NOT NULL REFERENCES productos (id),
  cantidad    integer NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (pedido_id, producto_id)
);`],{w:1000,fs:12});
F['r4-4c']=T('r4-4c','normal',[`INSERT INTO ciudades (nombre, provincia)
SELECT DISTINCT ciudad, provincia FROM pedidos_2fn;`,`INSERT INTO clientes (nombre, email, ciudad_id)
SELECT DISTINCT p.cliente, p.email, c.id
FROM pedidos_2fn p
JOIN ciudades c ON c.nombre = p.ciudad;`,`INSERT INTO pedidos (id, cliente_id, fecha)
SELECT p.pedido, c.id, p.fecha
FROM pedidos_2fn p
JOIN clientes c ON c.email = p.email;`,`INSERT INTO lineas_pedido (pedido_id, producto_id, cantidad)
SELECT pedido, producto_id, cantidad FROM lineas_2fn;`,`SELECT * FROM ciudades ORDER BY id;`,`SELECT * FROM clientes ORDER BY id;`],{w:1000,fs:12});
F['r4-4d']=T('r4-4d','normal',[`CREATE VIEW ventas_reconstruida AS
SELECT p.id AS pedido, p.fecha, c.nombre AS cliente, c.email,
       ci.nombre AS ciudad, ci.provincia,
       pr.nombre AS producto, pr.precio, l.cantidad
FROM lineas_pedido l
JOIN pedidos   p  ON p.id  = l.pedido_id
JOIN clientes  c  ON c.id  = p.cliente_id
JOIN ciudades  ci ON ci.id = c.ciudad_id
JOIN productos pr ON pr.id = l.producto_id;`,`-- Filas de la tabla original que NO están en la reconstruida (debe salir 0)
SELECT * FROM ventas_plano
EXCEPT
SELECT * FROM ventas_reconstruida;`,`-- Filas de la reconstruida que NO estaban en la original (debe salir 0)
SELECT * FROM ventas_reconstruida
EXCEPT
SELECT * FROM ventas_plano;`],{w:1100,fs:11.5});
const C=cat('normal');
F['r4-4e']=er([{id:'ci',x:20,y:20,title:'ciudades',attrs:C.ciudades,color:'#7a3fe0'},{id:'c',x:340,y:20,title:'clientes',attrs:C.clientes},{id:'p',x:660,y:20,title:'pedidos',attrs:C.pedidos},{id:'l',x:660,y:220,title:'lineas_pedido',attrs:C.lineas_pedido,color:'#ff7a1a'},{id:'r',x:340,y:260,title:'productos',attrs:C.productos,color:'#7a3fe0'}],
 [{a:'ci',b:'c',label:'vive en'},{a:'c',b:'p',label:'hace'},{a:'p',b:'l',label:'incluye'},{a:'r',b:'l',label:'aparece en'}],940,420);
F['r4-4f']=T('r4-4f','normal',[`UPDATE clientes SET email = 'ana.nueva@ejemplo.com' WHERE nombre = 'Ana García';`,`SELECT DISTINCT cliente, email FROM ventas_reconstruida WHERE cliente = 'Ana García';`,`DELETE FROM lineas_pedido WHERE pedido_id = 104;
DELETE FROM pedidos WHERE id = 104;`,`SELECT nombre FROM clientes ORDER BY nombre;`,`INSERT INTO productos (nombre, precio) VALUES ('Taza', 7.50);`,`SELECT nombre, precio FROM productos ORDER BY id;`],{w:1000,fs:12});
/* 4.5 detectar */
F['r4-5a']=T('r4-5a','normal',[`-- ¿Se cumple «producto determina precio»? 0 filas = sí, hay dependencia
SELECT producto, count(DISTINCT precio) AS precios_distintos
FROM ventas_plano
GROUP BY producto
HAVING count(DISTINCT precio) > 1;`,`-- ¿Se cumple «pedido determina fecha»?
SELECT pedido, count(DISTINCT fecha) AS fechas_distintas
FROM ventas_plano
GROUP BY pedido
HAVING count(DISTINCT fecha) > 1;`,`-- ¿Y «provincia determina cliente»? (si salen filas, NO hay dependencia)
SELECT provincia, count(DISTINCT cliente) AS clientes_distintos
FROM ventas_plano
GROUP BY provincia
HAVING count(DISTINCT cliente) > 1;`,`-- Cuidado: «ciudad determina cliente» parece cumplirse... ¡solo por casualidad!
SELECT ciudad, count(DISTINCT cliente) AS clientes_distintos
FROM ventas_plano
GROUP BY ciudad
HAVING count(DISTINCT cliente) > 1;`],{w:1100,fs:11.5});
/* 4.6 desnormalizar */
F['r4-6a']=T('r4-6a','normal',[`ALTER TABLE pedidos ADD COLUMN total numeric(10, 2);`,`UPDATE pedidos p
SET total = (
  SELECT sum(l.cantidad * pr.precio)
  FROM lineas_pedido l
  JOIN productos pr ON pr.id = l.producto_id
  WHERE l.pedido_id = p.id
);`,`SELECT id, total FROM pedidos ORDER BY id;`],{w:1000,fs:12});
F['r4-6b']=T('r4-6b','normal',[`UPDATE lineas_pedido SET cantidad = 5 WHERE pedido_id = 101 AND producto_id = 1;`,`-- Comparamos el total guardado con el total recalculado
SELECT p.id,
       p.total AS total_guardado,
       sum(l.cantidad * pr.precio) AS total_real
FROM pedidos p
JOIN lineas_pedido l ON l.pedido_id = p.id
JOIN productos pr ON pr.id = l.producto_id
GROUP BY p.id, p.total
ORDER BY p.id;`],{w:1000,fs:12});
/* 4.7 errores */
F['r4-7a']=T('r4-7a','normal',[`-- Anti-patrón: tabla «clave-valor» para guardarlo todo
CREATE TABLE datos (
  entidad_id integer,
  atributo   text,
  valor      text
);`,`INSERT INTO datos VALUES
  (1, 'nombre', 'Ana García'), (1, 'email', 'ana@ejemplo.com'), (1, 'edad', 'treinta'),
  (2, 'nombre', 'Luis Pérez'), (2, 'email', 'luis@ejemplo.com');`,`-- Para ver nombre y email en una fila hay que desmontar y volver a montar
SELECT entidad_id,
       max(valor) FILTER (WHERE atributo = 'nombre') AS nombre,
       max(valor) FILTER (WHERE atributo = 'email')  AS email
FROM datos
GROUP BY entidad_id
ORDER BY entidad_id;`,`-- Y nada impide guardar disparates: la edad es texto
SELECT valor FROM datos WHERE atributo = 'edad';`],{w:1100,fs:11.5});
render(F,'parte 4 (real)');
