const {render,term,T,SH,PTY,er,tbl}=require('./figlib');const {spawnSync}=require('child_process');
const P=(db,args)=>spawnSync('psql',['-h','/tmp','-p','5433','-U','postgres','-d',db,'-X','-q',...args],{encoding:'utf8'});
const ex=P('postgres',['-At','-c',"SELECT datname FROM pg_database WHERE datname NOT IN ('postgres','template0','template1')"]).stdout.trim().split('\n').filter(Boolean);ex.forEach(d=>P('postgres',['-c','DROP DATABASE IF EXISTS '+d]));
['ensayo','tienda','crm'].forEach(d=>P('postgres',['-c','CREATE DATABASE '+d]));
const {pgcsv}=require('./figlib');
const cat=(db)=>{const q=(s)=>pgcsv(db,s).rows;const cols=q("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position");
 const kc=t=>new Set(q(`SELECT kcu.table_name||'.'||kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema) WHERE tc.constraint_type='${t}' AND tc.table_schema='public'`).map(r=>r[0]));
 const pk=kc('PRIMARY KEY'),fk=kc('FOREIGN KEY');const by={};cols.forEach(([t,c])=>{const k=t+'.'+c;(by[t]=by[t]||[]).push((pk.has(k)&&fk.has(k)?'+':pk.has(k)?'*':fk.has(k)?'>':'')+c)});return by;};
const F={};
/* 2.1 idea -> SQL (libros prestados a amigos) */
F['r2-1']=T('r2-1','ensayo',[`CREATE TABLE amigos (
  id       integer PRIMARY KEY,
  nombre   text NOT NULL,
  telefono text
);`,`CREATE TABLE libros (
  id     integer PRIMARY KEY,
  titulo text NOT NULL,
  autor  text
);`,`CREATE TABLE prestamos (
  id               integer PRIMARY KEY,
  amigo_id         integer NOT NULL REFERENCES amigos (id),
  libro_id         integer NOT NULL REFERENCES libros (id),
  fecha_salida     date NOT NULL,
  fecha_devolucion date
);`],{w:900,fs:12.5});
F['r2-1b']=T('r2-1b','ensayo',[`INSERT INTO amigos VALUES (1, 'Marta', '600333444'), (2, 'Pablo', NULL);
INSERT INTO libros  VALUES (1, 'Cien años de soledad', 'García Márquez'), (2, 'Rayuela', 'Cortázar');
INSERT INTO prestamos VALUES
  (1, 1, 1, '2026-03-01', NULL),
  (2, 2, 2, '2026-02-10', '2026-02-25');`,`SELECT a.nombre AS amigo, l.titulo
FROM prestamos p
JOIN amigos a ON a.id = p.amigo_id
JOIN libros l ON l.id = p.libro_id
WHERE p.fecha_devolucion IS NULL;`],{w:900,fs:12.5});
/* 2.2 clasificación -> SQL (tienda) */
F['r2-2']=T('r2-2','tienda',[`-- Entidades -> tablas; atributos -> columnas
CREATE TABLE clientes (
  id       integer PRIMARY KEY,
  nombre   text NOT NULL,
  email    text NOT NULL UNIQUE,      -- regla: obligatorio y único
  telefono text                       -- regla: opcional
);`,`CREATE TABLE productos (
  id     integer PRIMARY KEY,
  nombre text NOT NULL,
  precio numeric(10, 2) NOT NULL CHECK (precio >= 0)   -- regla: no negativo
);`,`-- Relaciones: el cliente HACE pedidos; el pedido INCLUYE productos
CREATE TABLE pedidos (
  id         integer PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id)
);`,`CREATE TABLE lineas_pedido (
  pedido_id   integer REFERENCES pedidos (id),
  producto_id integer REFERENCES productos (id),
  cantidad    integer NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (pedido_id, producto_id)
);`],{w:960,fs:12});
F['r2-2b']=T('r2-2b','tienda',[`\\dt`],{w:760,fs:13});
const C22=cat('tienda');
F['r2-2c']=er([{id:'c',x:20,y:20,title:'clientes',attrs:C22.clientes},{id:'p',x:380,y:20,title:'pedidos',attrs:C22.pedidos,color:'#0e9bd8'},{id:'l',x:740,y:20,title:'lineas_pedido',attrs:C22.lineas_pedido,color:'#ff7a1a'},{id:'r',x:740,y:220,title:'productos',attrs:C22.productos,color:'#7a3fe0'}],[{a:'c',b:'p',label:'hace'},{a:'p',b:'l',label:'incluye'},{a:'r',b:'l',label:'aparece en'}],980,380);
/* 2.3 obligatorio / opcional */
F['r2-3']=T('r2-3','ensayo',[`CREATE TABLE clientes_form (
  id       integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre   text NOT NULL,                     -- obligatorio
  email    text NOT NULL UNIQUE,              -- obligatorio y único
  telefono text,                              -- opcional
  alta     date NOT NULL DEFAULT current_date -- obligatorio, con valor por defecto
);`,`INSERT INTO clientes_form (nombre, email) VALUES ('Luis Pérez', 'luis@ejemplo.com');`,`SELECT * FROM clientes_form;`],{w:1000,fs:12});
F['r2-3b']=T('r2-3b','ensayo',[`INSERT INTO clientes_form (nombre) VALUES ('Sin Email');`,`INSERT INTO clientes_form (nombre, email) VALUES ('Otro Luis', 'luis@ejemplo.com');`],{w:1000,fs:12});
/* 2.4 CRM */
F['r2-4a']=T('r2-4a','crm',[`CREATE TABLE usuarios (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  email  text NOT NULL UNIQUE,
  rol    text NOT NULL DEFAULT 'vendedor'
);`,`CREATE TABLE estados (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  orden  integer NOT NULL
);`,`CREATE TABLE empresas (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  sector text,
  web    text,
  ciudad text
);`,`CREATE TABLE contactos (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id integer NOT NULL REFERENCES empresas (id),
  nombre     text NOT NULL,
  email      text,
  telefono   text,
  cargo      text
);`],{w:960,fs:12});
F['r2-4b']=T('r2-4b','crm',[`CREATE TABLE oportunidades (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id      integer NOT NULL REFERENCES empresas (id),
  usuario_id      integer NOT NULL REFERENCES usuarios (id),
  estado_id       integer NOT NULL REFERENCES estados (id),
  titulo          text NOT NULL,
  importe         numeric(12, 2) CHECK (importe >= 0),
  cierre_previsto date
);`,`CREATE TABLE tareas (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidad_id integer NOT NULL REFERENCES oportunidades (id),
  usuario_id     integer NOT NULL REFERENCES usuarios (id),
  titulo         text NOT NULL,
  vence          date,
  completada     boolean NOT NULL DEFAULT false
);`,`CREATE TABLE notas (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidad_id integer NOT NULL REFERENCES oportunidades (id),
  usuario_id     integer NOT NULL REFERENCES usuarios (id),
  texto          text NOT NULL,
  creada_en      timestamptz NOT NULL DEFAULT now()
);`,`CREATE TABLE llamadas (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidad_id integer NOT NULL REFERENCES oportunidades (id),
  contacto_id    integer REFERENCES contactos (id),
  fecha          timestamptz NOT NULL,
  minutos        integer CHECK (minutos >= 0),
  resumen        text
);`,`CREATE TABLE emails (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  oportunidad_id integer NOT NULL REFERENCES oportunidades (id),
  contacto_id    integer REFERENCES contactos (id),
  asunto         text NOT NULL,
  enviado        boolean NOT NULL,   -- true = enviado; false = recibido
  fecha          timestamptz NOT NULL
);`],{w:960,fs:12});
F['r2-4c']=T('r2-4c','crm',[`\\dt`],{w:760,fs:13});
const C=cat('crm');
F['r2-4d']=er([
 {id:'u',x:20,y:20,title:'usuarios',attrs:C.usuarios,color:'#7a3fe0'},
 {id:'e',x:440,y:20,title:'empresas',attrs:C.empresas},
 {id:'c',x:860,y:20,title:'contactos',attrs:C.contactos},
 {id:'t',x:20,y:280,title:'tareas',attrs:C.tareas},
 {id:'o',x:440,y:280,title:'oportunidades',attrs:C.oportunidades},
 {id:'s',x:860,y:330,title:'estados',attrs:C.estados,color:'#7a3fe0'},
 {id:'n',x:200,y:590,title:'notas',attrs:C.notas,color:'#ff7a1a'},
 {id:'l',x:470,y:590,title:'llamadas',attrs:C.llamadas,color:'#ff7a1a'},
 {id:'m',x:740,y:590,title:'emails',attrs:C.emails,color:'#ff7a1a'}],
 [{a:'e',b:'c'},{a:'e',b:'o'},{a:'u',b:'o'},{a:'s',b:'o'},{a:'u',b:'t'},{a:'o',b:'t'},{a:'o',b:'n'},{a:'o',b:'l'},{a:'o',b:'m'}],1100,810);
F['r2-4e']=T('r2-4e','crm',[`INSERT INTO usuarios (nombre, email) VALUES ('Sara Vidal', 'sara@crm.com'), ('Tomás Gil', 'tomas@crm.com');
INSERT INTO estados (nombre, orden) VALUES ('Nuevo', 1), ('En negociación', 2), ('Ganado', 3), ('Perdido', 4);
INSERT INTO empresas (nombre, sector) VALUES ('Acme S.L.', 'Industria'), ('Norte Digital', 'Software'), ('Verde Sur', 'Agricultura');
INSERT INTO contactos (empresa_id, nombre, cargo) VALUES (1, 'Lucía Mora', 'Compras'), (1, 'Pablo Ríos', 'Dirección'), (2, 'Irene Costa', 'Marketing');`,`INSERT INTO oportunidades (empresa_id, usuario_id, estado_id, titulo, importe, cierre_previsto) VALUES
  (1, 1, 2, 'Contrato anual', 12000, '2026-06-30'),
  (2, 2, 1, 'Rediseño web',    4500, '2026-05-15'),
  (1, 1, 3, 'Ampliación',      3000, '2026-04-01');`,`INSERT INTO tareas (oportunidad_id, usuario_id, titulo, vence) VALUES
  (1, 1, 'Enviar propuesta', '2026-04-10'),
  (2, 2, 'Llamar para concretar', '2026-04-12');
INSERT INTO llamadas (oportunidad_id, contacto_id, fecha, minutos, resumen) VALUES
  (1, 1, '2026-03-20 10:30+01', 25, 'Interesados en el contrato anual');`],{w:1000,fs:12});
F['r2-4f']=T('r2-4f','crm',[`SELECT o.titulo,
       e.nombre AS empresa,
       s.nombre AS estado,
       u.nombre AS vendedor,
       o.importe
FROM oportunidades o
JOIN empresas e ON e.id = o.empresa_id
JOIN estados  s ON s.id = o.estado_id
JOIN usuarios u ON u.id = o.usuario_id
ORDER BY o.id;`,`SELECT titulo, vence FROM tareas WHERE completada = false ORDER BY vence;`],{w:1000,fs:12});
/* 2.5 casos */
F['r2-5a']=T('r2-5a','ensayo',[`CREATE TABLE contactos (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);`,`CREATE TABLE telefonos (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  contacto_id integer NOT NULL REFERENCES contactos (id),
  numero      text NOT NULL,
  tipo        text NOT NULL CHECK (tipo IN ('móvil', 'casa', 'trabajo'))
);`,`INSERT INTO contactos (nombre) VALUES ('Ana García');
INSERT INTO telefonos (contacto_id, numero, tipo) VALUES (1, '600111222', 'móvil'), (1, '910000000', 'trabajo');`,`SELECT c.nombre, t.tipo, t.numero
FROM contactos c
JOIN telefonos t ON t.contacto_id = c.id;`],{w:1000,fs:12});
F['r2-5b']=T('r2-5b','ensayo',[`CREATE TABLE socios (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);`,`CREATE TABLE pistas (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL
);`,`CREATE TABLE reservas (
  id       integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  socio_id integer NOT NULL REFERENCES socios (id),
  pista_id integer NOT NULL REFERENCES pistas (id),
  fecha    date NOT NULL,
  hora     time NOT NULL,
  UNIQUE (pista_id, fecha, hora)   -- regla: una pista no se reserva dos veces a la misma hora
);`,`INSERT INTO socios (nombre) VALUES ('Marta'), ('Luis');
INSERT INTO pistas (nombre) VALUES ('Pista 1');
INSERT INTO reservas (socio_id, pista_id, fecha, hora) VALUES (1, 1, '2026-04-05', '18:00');`,`INSERT INTO reservas (socio_id, pista_id, fecha, hora) VALUES (2, 1, '2026-04-05', '18:00');`],{w:1000,fs:12});
/* 2.6 ficha de entidad a partir del catálogo */
F['r2-6']=T('r2-6','crm',[`SELECT column_name  AS columna,
       data_type    AS tipo,
       is_nullable  AS "¿admite vacío?",
       column_default AS por_defecto
FROM information_schema.columns
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;`],{w:1100,fs:12});
render(F,'parte 2 (real)');
