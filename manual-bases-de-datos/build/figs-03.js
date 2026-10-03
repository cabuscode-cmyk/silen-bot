const {CSS,tbl,er,render,pgrun,pgcsv,term,grid,T,SH}=require('./figlib');const {spawnSync}=require('child_process');
const P=(db,args)=>spawnSync('psql',['-h','/tmp','-p','5433','-U','postgres','-d',db,'-X','-q','-v','ON_ERROR_STOP=1',...args],{encoding:'utf8'});
for(const d of ['tienda','ensayo','tienda_script','biblioteca'])P('postgres',['-c',`DROP DATABASE IF EXISTS ${d}`,'-c',`CREATE DATABASE ${d}`]);
const F={};const card=(t,body,c='#0e9bd8',w=210)=>`<div style="background:#fff;border:3px solid ${c};border-radius:12px;width:${w}px;overflow:hidden"><div style="background:${c};color:#fff;font-weight:700;padding:6px 12px;font-size:16px">${t}</div><div style="padding:8px 12px;font-size:14px;line-height:1.7;color:#1b2440">${body}</div></div>`;
const img=(svg,note)=>`${svg}<div class="lab" style="margin-top:8px;font-size:15px">${note}</div>`;
const cat=(db)=>{const q=(s)=>pgcsv(db,s).rows;const cols=q("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position");
 const kc=t=>new Set(q(`SELECT kcu.table_name||'.'||kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema) WHERE tc.constraint_type='${t}' AND tc.table_schema='public'`).map(r=>r[0]));
 const pk=kc('PRIMARY KEY'),fk=kc('FOREIGN KEY');const by={};cols.forEach(([t,c])=>{const k=t+'.'+c;(by[t]=by[t]||[]).push((pk.has(k)&&fk.has(k)?'+':pk.has(k)?'*':fk.has(k)?'>':'')+c)});return by;};
/* ========== 3.1 ========== */
F['f3-1']=`<div class="row"><div>${card('Entidad: cliente','nombre<br>email<br>teléfono<br>fecha de alta','#7a3fe0',200)}</div><div class="col" style="align-items:center"><div class="arrow">→</div><div class="lab">se convierte en</div></div><div class="col"><div class="title">Tabla «clientes»</div>${tbl({title:'tabla clientes',types:true,cols:[{n:'id',t:'entero'},{n:'nombre',t:'texto'},{n:'email',t:'texto'},{n:'telefono',t:'texto'},{n:'creado_en',t:'fecha y hora'}],rows:[['…','…','…','…','…']]})}</div></div>`;
F['f3-1b']=T('f3-1b','tienda',[`CREATE TABLE clientes (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre    text NOT NULL,
  email     text NOT NULL UNIQUE,
  telefono  text,
  creado_en timestamptz NOT NULL DEFAULT now()
);`,'\\d clientes'],{w:900,fs:13});
F['f3-1c']=T('f3-1c','tienda',[`INSERT INTO clientes (nombre, email, telefono) VALUES
  ('Ana García', 'ana@ejemplo.com', '600111222'),
  ('Luis Pérez', 'luis@ejemplo.com', NULL),
  ('Marta Ruiz', 'marta@ejemplo.com', '600333444');`,`SELECT * FROM clientes ORDER BY id;`],{w:1000,fs:13});
P('ensayo',['-c','SELECT 1']);
F['f3-1d']=T('f3-1d','ensayo',[`SELECT 0.1::double precision + 0.2::double precision AS coma_flotante,
       0.1::numeric + 0.2::numeric AS exacto;`,`SELECT '2026-03-02 10:00:00+01'::timestamptz AT TIME ZONE 'UTC' AS en_utc,
       '2026-03-02 10:00:00+01'::timestamptz AT TIME ZONE 'Europe/Madrid' AS en_madrid;`],{w:900,fs:13});
/* ========== 3.2 ========== */
F['f3-2']=img(er([{id:'u',x:20,y:20,title:'usuarios',attrs:['*id','email']},{id:'p',x:380,y:20,title:'perfiles',attrs:['+usuario_id','foto','biografia'],color:'#ff7a1a'}],[{a:'u',b:'p',label:'tiene',cb:'1'}],620,160),'Uno a uno (1 a 1): un usuario tiene un único perfil, y cada perfil es de un único usuario.');
F['f3-2a']=T('f3-2a','ensayo',[`CREATE TABLE usuarios (
  id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL UNIQUE
);`,`CREATE TABLE perfiles (
  usuario_id integer PRIMARY KEY REFERENCES usuarios (id),
  biografia  text
);`,`INSERT INTO usuarios (email) VALUES ('ana@ejemplo.com') RETURNING id;`,`INSERT INTO perfiles (usuario_id, biografia) VALUES (1, 'Me gusta el senderismo');`,`INSERT INTO perfiles (usuario_id, biografia) VALUES (1, 'Otro perfil para el mismo usuario');`],{w:960,fs:12.5});
F['f3-2b']=img(er([{id:'c',x:20,y:20,title:'autores',attrs:['*id','nombre']},{id:'p',x:380,y:20,title:'libros',attrs:['*id','>autor_id','titulo'],color:'#ff7a1a'}],[{a:'c',b:'p',label:'escribe'}],620,160),'Uno a muchos (1 a N): un autor escribe muchos libros, pero cada libro es de un único autor.');
F['f3-2c']=T('f3-2c','ensayo',[`CREATE TABLE autores (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);`,`CREATE TABLE libros (
  id       integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  autor_id integer NOT NULL REFERENCES autores (id),
  titulo   text NOT NULL
);`,`INSERT INTO autores (nombre) VALUES ('Gabriel García Márquez');`,`INSERT INTO libros (autor_id, titulo) VALUES
  (1, 'Cien años de soledad'),
  (1, 'El amor en los tiempos del cólera');`,`SELECT a.nombre, l.titulo
FROM autores a
JOIN libros l ON l.autor_id = a.id;`],{w:980,fs:12.5});
F['f3-2d']=img(er([{id:'a',x:20,y:20,title:'alumnos',attrs:['*id','nombre']},{id:'c',x:380,y:20,title:'cursos',attrs:['*id','titulo'],color:'#7a3fe0'}],[{a:'a',b:'c',ca:'N',cb:'N',label:'se matricula en'}],620,140),'Muchos a muchos (N a N): un alumno se matricula en muchos cursos, y un curso tiene muchos alumnos.');
F['f3-2e']=`<div style="position:relative">${er([{id:'c',x:20,y:130,title:'autores',attrs:['*id','nombre']},{id:'p',x:420,y:130,title:'libros',attrs:['*id','>autor_id']}],[{a:'c',b:'p'}],660,280)}
<div style="position:absolute;left:20px;top:0;background:#fff;border:2px solid #0e9bd8;border-radius:12px;padding:8px 12px;width:300px;font-size:15px"><b>Leyendo hacia la derecha:</b><br>un autor tiene <b>muchos</b> libros</div>
<div style="position:absolute;left:340px;top:0;background:#fff;border:2px solid #ff7a1a;border-radius:12px;padding:8px 12px;width:300px;font-size:15px"><b>Leyendo hacia la izquierda:</b><br>un libro es de <b>un solo</b> autor</div></div>`;
F['f3-2f']=T('f3-2f','ensayo',[`INSERT INTO libros (autor_id, titulo) VALUES (NULL, 'Libro sin autor');`,`INSERT INTO libros (autor_id, titulo) VALUES (99, 'Libro de un autor que no existe');`,`CREATE TABLE empleados (
  id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre  text NOT NULL,
  jefe_id integer REFERENCES empleados (id)
);`,`INSERT INTO empleados (nombre, jefe_id) VALUES ('Clara (directora)', NULL);`,`INSERT INTO empleados (nombre, jefe_id) VALUES ('Dani', 1), ('Eva', 1);`,`SELECT e.nombre AS empleado, j.nombre AS jefe
FROM empleados e
LEFT JOIN empleados j ON j.id = e.jefe_id
ORDER BY e.id;`],{w:980,fs:12.5});
F['f3-2g']=T('f3-2g','ensayo',[`CREATE TABLE alumnos (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);`,`CREATE TABLE cursos (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo text NOT NULL
);`,`CREATE TABLE matriculas (
  alumno_id integer REFERENCES alumnos (id),
  curso_id  integer REFERENCES cursos (id),
  nota      numeric(4, 2),
  PRIMARY KEY (alumno_id, curso_id)
);`,`INSERT INTO alumnos (nombre) VALUES ('Ana'), ('Luis');`,`INSERT INTO cursos (titulo) VALUES ('Inglés'), ('Dibujo');`,`INSERT INTO matriculas (alumno_id, curso_id, nota) VALUES (1, 1, 8.5), (1, 2, 9), (2, 1, 7);`,`SELECT a.nombre, c.titulo, m.nota
FROM matriculas m
JOIN alumnos a ON a.id = m.alumno_id
JOIN cursos  c ON c.id = m.curso_id
ORDER BY a.nombre, c.titulo;`],{w:980,fs:12.5});
/* ========== 3.3 ========== */
F['f3-3']=`<div class="row" style="align-items:flex-start;gap:30px"><div class="col"><div class="title" style="color:#d1383d">❌ Varios productos en una celda</div>${tbl({title:'pedidos (mal)',cols:['id','cliente','productos'],rows:[[101,'Ana','Camiseta, Camiseta, Gorra'],[102,'Marta','Mochila']]})}</div>
<div class="col"><div class="title" style="color:#d1383d">❌ Columnas repetidas</div>${tbl({title:'pedidos (mal)',cols:['id','producto1','producto2','producto3'],rows:[[101,'Camiseta','Gorra',null],[103,'Camiseta','Mochila',null]]})}</div></div><div class="tag">Ilustración de los dos diseños incorrectos.</div>`;
F['f3-3a']=T('f3-3a','ensayo',[`CREATE TABLE pedidos_mal (
  id        integer PRIMARY KEY,
  cliente   text,
  productos text
);`,`INSERT INTO pedidos_mal VALUES
  (101, 'Ana', 'Camiseta, Camiseta, Gorra'),
  (103, 'Ana', 'Camiseta, Mochila');`,`SELECT count(*) AS pedidos_con_camiseta
FROM pedidos_mal
WHERE productos LIKE '%Camiseta%';`],{w:900,fs:13});
F['f3-3b']=T('f3-3b','tienda',[`CREATE TABLE productos (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre     text NOT NULL,
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
);`],{w:900,fs:12.5});
F['f3-3c']=T('f3-3c','tienda',[`INSERT INTO productos (nombre, precio_eur, stock) VALUES
  ('Camiseta', 19.95, 12), ('Gorra', 9.90, 0), ('Mochila', 34.50, 5);`,`INSERT INTO pedidos (cliente_id, fecha, estado) VALUES
  (1, '2026-03-02', 'entregado'),
  (3, '2026-03-05', 'enviado'),
  (1, '2026-03-09', 'pendiente');`,`INSERT INTO lineas_pedido (pedido_id, producto_id, cantidad, precio_venta) VALUES
  (101, 1, 2, 19.95), (101, 2, 1, 9.90),
  (102, 3, 1, 34.50),
  (103, 1, 1, 19.95), (103, 3, 1, 34.50);`],{w:900,fs:12.5});
F['f3-3d']=`<div class="row" style="align-items:flex-start;gap:26px"><div class="col"><div class="title">pedidos</div>${grid('tienda','SELECT id, cliente_id, fecha, estado FROM pedidos ORDER BY id',{title:'tienda · pedidos'})}</div><div class="col"><div class="title">lineas_pedido (la tabla intermedia)</div>${grid('tienda','SELECT * FROM lineas_pedido ORDER BY pedido_id, producto_id',{title:'tienda · lineas_pedido'})}</div></div><div class="tag">Captura real: SELECT * FROM pedidos; y SELECT * FROM lineas_pedido; (resultado mostrado en forma de tabla).</div>`;
F['f3-3e']=T('f3-3e','tienda',[`SELECT sum(cantidad) AS camisetas_vendidas
FROM lineas_pedido
WHERE producto_id = 1;`,`SELECT p.nombre, l.cantidad, l.precio_venta
FROM lineas_pedido l
JOIN productos p ON p.id = l.producto_id
WHERE l.pedido_id = 101;`],{w:900,fs:13});
const C=cat('tienda');
F['f3-3f']=er([{id:'p',x:20,y:20,title:'pedidos',attrs:C.pedidos},{id:'l',x:380,y:20,title:'lineas_pedido',attrs:C.lineas_pedido,color:'#ff7a1a'},{id:'r',x:740,y:20,title:'productos',attrs:C.productos,color:'#7a3fe0'}],[{a:'p',b:'l',label:'incluye'},{a:'r',b:'l',label:'aparece en'}],980,260);
F['f3-3g']=T('f3-3g','tienda',[`\\d pedidos`,`CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);`,`\\d pedidos`],{w:1000,fs:12});
/* ========== 3.4 ========== */
F['f3-4']=T('f3-4','tienda',[`INSERT INTO clientes (nombre, email)
VALUES ('Pedro Gil', 'pedro@ejemplo.com')
RETURNING id, nombre;`,`INSERT INTO clientes (nombre, email)
VALUES ('Otra Ana', 'ana@ejemplo.com');`,`INSERT INTO clientes (nombre, email)
VALUES ('Sara León', 'sara@ejemplo.com')
RETURNING id, nombre;`],{w:860});
F['f3-4a']=T('f3-4a','tienda',[`INSERT INTO clientes (id, nombre, email)
VALUES (50, 'Intruso', 'intruso@ejemplo.com');`],{w:960,fs:12.5});
F['f3-4b']=T('f3-4b','ensayo',[`CREATE TABLE sesiones (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inicio timestamptz NOT NULL DEFAULT now()
);`,`INSERT INTO sesiones DEFAULT VALUES RETURNING id;`,`INSERT INTO sesiones DEFAULT VALUES RETURNING id;`],{w:860,fs:13});
F['f3-4c']=T('f3-4c','tienda',[`INSERT INTO pedidos (cliente_id) VALUES (9);`,`DELETE FROM clientes WHERE id = 1;`],{w:960,fs:12});
F['f3-4d']=T('f3-4d','ensayo',[`CREATE TABLE padres (id integer PRIMARY KEY);`,`CREATE TABLE hijos_cascade  (padre_id integer REFERENCES padres (id) ON DELETE CASCADE);`,`CREATE TABLE hijos_setnull  (padre_id integer REFERENCES padres (id) ON DELETE SET NULL);`,`CREATE TABLE hijos_restrict (padre_id integer REFERENCES padres (id) ON DELETE RESTRICT);`,`INSERT INTO padres VALUES (1), (2), (3);
INSERT INTO hijos_cascade VALUES (1);
INSERT INTO hijos_setnull VALUES (2);
INSERT INTO hijos_restrict VALUES (3);`,`DELETE FROM padres WHERE id = 1;`,`DELETE FROM padres WHERE id = 2;`,`DELETE FROM padres WHERE id = 3;`,`SELECT (SELECT count(*) FROM hijos_cascade) AS filas_en_cascade,
       (SELECT count(*) FROM hijos_setnull WHERE padre_id IS NULL) AS setnull_con_null,
       (SELECT count(*) FROM padres) AS padres_que_quedan;`],{w:1000,fs:12});
/* ========== 3.5 ========== */
F['f3-5']=T('f3-5','tienda',[`INSERT INTO clientes (nombre, email)
VALUES (NULL, 'x@ejemplo.com');`,`INSERT INTO clientes (nombre, email)
VALUES ('Otra Ana', 'ana@ejemplo.com');`,`INSERT INTO productos (nombre, precio_eur)
VALUES ('Regalo', -5);`,`INSERT INTO lineas_pedido
VALUES (101, 1, 0, 19.95);`,`UPDATE pedidos SET estado = 'casi-enviado' WHERE id = 101;`],{w:1000,fs:12});
F['f3-5a']=T('f3-5a','ensayo',[`CREATE TABLE articulos (nombre text, precio numeric);`,`INSERT INTO articulos VALUES ('Lámpara', 25), ('Pegatina', -3);`,`ALTER TABLE articulos ADD CONSTRAINT precio_no_negativo CHECK (precio >= 0);`,`DELETE FROM articulos WHERE precio < 0;`,`ALTER TABLE articulos ADD CONSTRAINT precio_no_negativo CHECK (precio >= 0);`,`INSERT INTO articulos VALUES ('Imán', -1);`],{w:1000,fs:12});
F['f3-5b']=T('f3-5b','tienda',[`\\d productos`],{w:1000,fs:12});
/* ========== 3.6 ========== */
F['f3-6']=`<div class="row" style="align-items:flex-start;gap:26px">${er([{id:'c',x:20,y:20,title:'clientes',attrs:['*id','nombre','email']},{id:'p',x:340,y:20,title:'pedidos',attrs:['*id','>cliente_id','fecha']}],[{a:'c',b:'p',label:'hace'}],560,170)}
<div style="font-size:15px;line-height:1.8;max-width:330px"><b>1</b> · Cada caja es una tabla<br><b>2</b> · La cabecera de color es su nombre<br><b>3</b> · Cada línea de texto es una columna<br><b>4</b> · <b style="background:#e08a00;color:#fff;padding:0 5px;border-radius:4px">PK</b> clave primaria<br><b>5</b> · <b style="background:#7a3fe0;color:#fff;padding:0 5px;border-radius:4px">FK</b> clave extranjera<br><b>6</b> · La línea es la relación; los números indican cuántos</div></div>`;
F['f3-6a']=T('f3-6a','tienda',[`SELECT conrelid::regclass AS tabla,
       conname           AS restriccion,
       pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace = 'public'::regnamespace
ORDER BY 1, 2;`],{w:1100,fs:12});
F['f3-6b']=er([{id:'c',x:20,y:20,title:'clientes',attrs:C.clientes},{id:'p',x:380,y:20,title:'pedidos',attrs:C.pedidos,color:'#0e9bd8'},{id:'l',x:740,y:20,title:'lineas_pedido',attrs:C.lineas_pedido,color:'#ff7a1a'},{id:'r',x:740,y:250,title:'productos',attrs:C.productos,color:'#7a3fe0'}],[{a:'c',b:'p',label:'hace'},{a:'p',b:'l',label:'incluye'},{a:'r',b:'l',label:'aparece en'}],980,420);
/* ========== 3.7 ========== */
F['f3-7']=`<div class="win" style="width:760px"><table style="font-size:15px"><thead><tr><th>Elemento del diagrama</th><th>Qué se hace al crear las tablas</th></tr></thead><tbody>
<tr><td>Entidad</td><td>Una tabla con una clave primaria</td></tr>
<tr><td>Atributo</td><td>Una columna con su tipo; obligatoria si hace falta</td></tr>
<tr><td>Uno a muchos (1 a N)</td><td>Una clave extranjera en la tabla del lado «muchos»</td></tr>
<tr><td>Uno a uno (1 a 1)</td><td>Una clave extranjera que además es única (o es la clave primaria)</td></tr>
<tr><td>Muchos a muchos (N a N)</td><td>Una tabla intermedia con dos claves extranjeras</td></tr>
<tr><td>Regla</td><td>Una restricción: NOT NULL, UNIQUE, CHECK…</td></tr></tbody></table></div><div class="tag">Ilustración: reglas de conversión.</div>`;
F['f3-7a']=SH('f3-7a',[{cmd:'head -8 crear_tienda.sql'},{cmd:'psql -h /tmp -p 5433 -U postgres -d tienda_script -f crear_tienda.sql'}],{w:900});
F['f3-7b']=T('f3-7b','tienda_script',['\\dt','\\d lineas_pedido'],{w:960,fs:12});
const bib=P('biblioteca',['-f','../sql/03-biblioteca.sql']);
F['f3-7c']=er([{id:'s',x:20,y:20,title:'socios',attrs:cat('biblioteca').socios},{id:'p',x:380,y:20,title:'prestamos',attrs:cat('biblioteca').prestamos,color:'#ff7a1a'},{id:'l',x:740,y:20,title:'libros',attrs:cat('biblioteca').libros,color:'#7a3fe0'}],[{a:'s',b:'p',label:'recibe'},{a:'l',b:'p',label:'se presta en'}],980,250);
F['f3-7d']=T('f3-7d','biblioteca',[`INSERT INTO socios (nombre, email) VALUES ('Ana García', 'ana@ejemplo.com');`,`INSERT INTO libros (titulo, autor) VALUES ('Cien años de soledad', 'García Márquez');`,`INSERT INTO prestamos (socio_id, libro_id) VALUES (1, 1);`,`INSERT INTO prestamos (socio_id, libro_id) VALUES (1, 1);`,`UPDATE prestamos SET fecha_devolucion = current_date WHERE id = 1;`,`INSERT INTO prestamos (socio_id, libro_id) VALUES (1, 1);`],{w:960,fs:12});
/* ========== 3.8 ========== */
F['f3-8']=T('f3-8','tienda',[`SELECT id, nombre, creado_en FROM clientes ORDER BY id;`],{w:900,fs:13});
F['f3-8b']=T('f3-8b','tienda',[`ALTER TABLE clientes ADD COLUMN borrado_en timestamptz;`,`UPDATE clientes SET borrado_en = now() WHERE id = 2;`,`SELECT id, nombre, borrado_en FROM clientes ORDER BY id;`,`SELECT id, nombre FROM clientes WHERE borrado_en IS NULL ORDER BY id;`],{w:900,fs:13});
F['f3-8c']=T('f3-8c','tienda',[`CREATE VIEW clientes_activos AS
SELECT id, nombre, email, telefono
FROM clientes
WHERE borrado_en IS NULL;`,`SELECT * FROM clientes_activos ORDER BY id;`],{w:960,fs:12.5});
render(F,'parte 3');
