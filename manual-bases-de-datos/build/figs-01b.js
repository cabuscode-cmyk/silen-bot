const {render,term,grid,T,SH,tbl}=require('./figlib');const {spawnSync}=require('child_process');
const P=(db,args)=>spawnSync('psql',['-h','/tmp','-p','5433','-U','postgres','-d',db,'-X','-q',...args],{encoding:'utf8'});
const rows=P('postgres',['-At','-c',"SELECT datname FROM pg_database WHERE datname NOT IN ('postgres','template0','template1')"]).stdout.trim().split('\n').filter(Boolean);
rows.forEach(d=>P('postgres',['-c',`DROP DATABASE IF EXISTS ${d}`]));
['tienda','crm','pruebas','ensayo'].forEach(d=>P('postgres',['-c',`CREATE DATABASE ${d}`]));
const F={};
/* 1.1 */
F['r1-1a']=T('r1-1a','ensayo',[`SELECT 'Ana', 34, 'Madrid';`],{w:760,fs:13});
F['r1-1b']=T('r1-1b','ensayo',[`CREATE TABLE personas (
  nombre text,
  edad   integer,
  ciudad text
);`,`INSERT INTO personas VALUES ('Ana', 34, 'Madrid');`,`SELECT * FROM personas;`,`SELECT nombre || ' tiene ' || edad || ' años y vive en ' || ciudad AS informacion
FROM personas;`],{w:860,fs:13});
/* 1.2 */
F['r1-2a']=T('r1-2a','ensayo',[`CREATE TABLE hoja_pedidos (
  cliente  text,
  telefono text,
  pedido   integer,
  total    numeric
);`,`INSERT INTO hoja_pedidos VALUES
  ('Ana García', '600111222', 101, 45.90),
  ('Ana García', '600111222', 103, 80.50),
  ('Ana Garcia', '600111223', 110, 20.00);`,`SELECT DISTINCT cliente, telefono
FROM hoja_pedidos
ORDER BY cliente;`],{w:900,fs:13});
F['r1-2b']=T('r1-2b','ensayo',[`CREATE TABLE clientes_demo (
  id       integer PRIMARY KEY,
  nombre   text NOT NULL,
  telefono text
);`,`CREATE TABLE pedidos_demo (
  id         integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes_demo (id),
  total      numeric(10, 2)
);`,`INSERT INTO clientes_demo VALUES (1, 'Ana García', '600111222');`,`INSERT INTO pedidos_demo VALUES (101, 1, 45.90), (103, 1, 80.50);`,`UPDATE clientes_demo SET telefono = '600999000' WHERE id = 1;`,`SELECT p.id AS pedido, c.nombre, c.telefono, p.total
FROM pedidos_demo p
JOIN clientes_demo c ON c.id = p.cliente_id
ORDER BY p.id;`],{w:960,fs:12.5});
F['r1-2c']=T('r1-2c','ensayo',[`CREATE TABLE pagos (importe numeric NOT NULL);`,`INSERT INTO pagos VALUES ('barato');`,`INSERT INTO pagos VALUES (NULL);`,`INSERT INTO pagos VALUES (12.50);`],{w:900,fs:12.5});
/* 1.3 */
F['r1-3a']=T('r1-3a','tienda',[`SELECT version();`,`\\l`],{w:1100,fs:11.5});
P('postgres',['-c','DROP ROLE IF EXISTS lector']);
F['r1-3b']=T('r1-3b','crm',[`CREATE TABLE empresas (id integer PRIMARY KEY, nombre text);`,`INSERT INTO empresas VALUES (1, 'Acme S.L.');`,`\\dt`],{w:860,fs:13});
F['r1-3c']=T('r1-3c','pruebas',[`\\dt`],{w:760,fs:13});
F['r1-3d']=SH('r1-3d',[{cmd:'psql -h /tmp -p 5433 -U postgres -d crm -c "CREATE ROLE lector LOGIN;"'},{cmd:'psql -h /tmp -p 5433 -U lector -d crm -c "SELECT * FROM empresas;"'},{cmd:'psql -h /tmp -p 5433 -U postgres -d crm -c "GRANT SELECT ON empresas TO lector;"'},{cmd:'psql -h /tmp -p 5433 -U lector -d crm -c "SELECT * FROM empresas;"'}],{w:1000,fs:12.5,cwd:'.'});
/* 1.4 */
F['r1-4a']=T('r1-4a','tienda',[`CREATE TABLE clientes (
  id       integer PRIMARY KEY,
  nombre   text NOT NULL,
  email    text,
  telefono text
);`,`INSERT INTO clientes VALUES
  (1, 'Ana García', 'ana@ejemplo.com', '600111222'),
  (2, 'Luis Pérez', 'luis@ejemplo.com', NULL),
  (3, 'Marta Ruiz', 'marta@ejemplo.com', '600333444');`,`SELECT * FROM clientes;`],{w:900,fs:13});
F['r1-4b']=T('r1-4b','tienda',[`\\d clientes`],{w:900,fs:13});
F['r1-4c']=T('r1-4c','tienda',[`SELECT email FROM clientes WHERE nombre = 'Marta Ruiz';`,`SELECT count(*) AS filas FROM clientes;`,`SELECT count(*) AS columnas
FROM information_schema.columns
WHERE table_name = 'clientes';`],{w:860,fs:13});
/* 1.5 */
F['r1-5a']=T('r1-5a','tienda',[`CREATE TABLE productos (
  nombre     text,
  stock      integer,
  precio_eur numeric(10, 2),
  alta       date,
  activo     boolean
);`,`INSERT INTO productos VALUES
  ('Camiseta', 12, 19.95, '2026-01-15', true),
  ('Gorra',     0,  9.90, '2026-02-03', false),
  ('Mochila',   5, 34.50, '2026-02-20', true);`,`SELECT * FROM productos;`],{w:900,fs:13});
F['r1-5b']=T('r1-5b','tienda',[`INSERT INTO productos (nombre, stock) VALUES ('Taza', 'muchos');`,`INSERT INTO productos (nombre, alta) VALUES ('Taza', '2026-02-31');`,`SELECT pg_typeof(nombre)     AS nombre,
       pg_typeof(stock)      AS stock,
       pg_typeof(precio_eur) AS precio_eur,
       pg_typeof(alta)       AS alta,
       pg_typeof(activo)     AS activo
FROM productos
LIMIT 1;`],{w:960,fs:12.5});
F['r1-5c']=T('r1-5c','ensayo',[`CREATE TABLE precios_texto (p text);`,`INSERT INTO precios_texto VALUES ('3'), ('20'), ('100');`,`SELECT p FROM precios_texto ORDER BY p;`,`SELECT p FROM precios_texto ORDER BY p::numeric;`],{w:860,fs:13});
/* 1.6 */
F['r1-6a']=T('r1-6a','tienda',[`SELECT id, nombre, telefono, telefono IS NULL AS sin_telefono
FROM clientes
ORDER BY id;`],{w:900,fs:13});
F['r1-6b']=T('r1-6b','tienda',[`SELECT nombre FROM clientes WHERE telefono = NULL;`,`SELECT nombre FROM clientes WHERE telefono IS NULL;`],{w:860,fs:13});
F['r1-6c']=T('r1-6c','tienda',[`SELECT NULL = NULL AS null_igual_null,
       NULL IS NULL AS es_null,
       0 = 0 AS cero_igual_cero,
       '' = '' AS vacio_igual_vacio;`,`SELECT count(*) AS todas_las_filas, count(telefono) AS con_telefono FROM clientes;`,`SELECT 10 + NULL AS suma_con_null;`],{w:960,fs:12.5});
/* 1.7 */
F['r1-7a']=T('r1-7a','tienda',[`CREATE TABLE pedidos (
  id         integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  fecha      date,
  total      numeric(10, 2)
);`,`INSERT INTO pedidos VALUES
  (101, 1, '2026-03-02', 45.90),
  (102, 3, '2026-03-05', 12.00),
  (103, 1, '2026-03-09', 80.50);`,`SELECT * FROM pedidos;`],{w:900,fs:13});
F['r1-7b']=T('r1-7b','tienda',[`INSERT INTO clientes VALUES (1, 'Otro Cliente', 'otro@ejemplo.com', NULL);`,`INSERT INTO pedidos VALUES (104, 9, '2026-03-12', 20.00);`,`DELETE FROM clientes WHERE id = 1;`],{w:1000,fs:12});
F['r1-7c']=T('r1-7c','tienda',[`SELECT p.id AS pedido, p.total, c.nombre AS cliente
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id
ORDER BY p.id;`],{w:860,fs:13});
/* 1.8 */
F['r1-8a']=T('r1-8a','ensayo',[`CREATE TABLE clientes_grandes AS
SELECT g AS id, 'cliente' || g || '@ejemplo.com' AS email
FROM generate_series(1, 300000) AS g;`,`ANALYZE clientes_grandes;`,`EXPLAIN ANALYZE
SELECT * FROM clientes_grandes
WHERE email = 'cliente250000@ejemplo.com';`],{w:1000,fs:12});
F['r1-8b']=T('r1-8b','ensayo',[`CREATE INDEX idx_grandes_email ON clientes_grandes (email);`,`ANALYZE clientes_grandes;`,`EXPLAIN ANALYZE
SELECT * FROM clientes_grandes
WHERE email = 'cliente250000@ejemplo.com';`],{w:1000,fs:12});
/* 1.9 */
F['r1-9a']=T('r1-9a','tienda',[`SELECT * FROM clientes;`,`SELECT nombre, email FROM clientes;`],{w:900,fs:13});
F['r1-9b']=T('r1-9b','tienda',[`SELECT id, cliente_id, total
FROM pedidos
WHERE total > 40;`,`SELECT id, total
FROM pedidos
ORDER BY total DESC;`,`SELECT id, total
FROM pedidos
ORDER BY total DESC
LIMIT 1;`],{w:860,fs:13});
F['r1-9c']=T('r1-9c','tienda',[`SELECT count(*) AS pedidos,
       sum(total) AS facturado,
       round(avg(total), 2) AS media
FROM pedidos;`],{w:860,fs:13});
/* 1.10 */
F['r1-10a']=SH('r1-10a',[{cmd:'pg_isready -h localhost -p 5433'},{cmd:'psql "postgresql://postgres@localhost:5433/tienda" -c "SELECT current_database() AS base, current_user AS usuario, inet_server_port() AS puerto"'}],{w:1000,fs:12.5,cwd:'.'});
F['r1-10b']=SH('r1-10b',[{cmd:'cat server.js'},{cmd:'DATABASE_URL=postgresql://postgres@localhost:5433/tienda nohup node server.js >/dev/null 2>&1 & echo $! > /tmp/api.pid; sleep 1; echo "API arrancada"',show:'DATABASE_URL=postgresql://postgres@localhost:5433/tienda node server.js &'},{cmd:'curl -s http://localhost:3000/clientes; echo',show:'curl http://localhost:3000/clientes'},{cmd:'curl -s -o /dev/null -w "%{http_code}\\n" http://localhost:3000/otra-cosa',show:'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/otra-cosa'},{cmd:'kill $(cat /tmp/api.pid)',show:'kill %1'}],{w:1000,fs:12,cwd:'../ejemplos/api'});
const fs=require('fs');const ex=n=>parseFloat((fs.readFileSync('figs/txt/'+n+'.txt','utf8').match(/Execution Time: ([\d.]+) ms/)||[])[1]);
let vals={};try{vals=JSON.parse(fs.readFileSync('figs/vals.json','utf8'));}catch(e){}
vals.seq_ms=ex('r1-8a');vals.idx_ms=ex('r1-8b');vals.ratio=Math.round(vals.seq_ms/vals.idx_ms);fs.writeFileSync('figs/vals.json',JSON.stringify(vals));
render(F,'parte 1 (real)');
