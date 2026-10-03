# Parte 5. SQL desde cero

## Antes de empezar

Hasta ahora has usado SQL «de lectura»: leías sentencias con una explicación al lado. En esta parte aprendes el lenguaje de forma completa y ordenada: crear tablas, guardar datos, consultarlos, resumirlos, unirlos, modificarlos y proteger los cambios con transacciones, hasta llegar a funciones, triggers y consultas avanzadas.

Como en todo el manual, cada punto tiene dos mitades: **primero sin código** (razonar a mano, con las filas delante) y **después con código** (el mismo razonamiento escrito en SQL, ejecutado en PostgreSQL 16.14, con la captura real).

Al terminar serás capaz de:

- crear tablas, claves, secuencias e identidades, y rellenarlas con `INSERT`;
- leer datos con `SELECT`, filtrarlos con `WHERE`, ordenarlos y limitarlos;
- resumir con `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `GROUP BY` y `HAVING`;
- unir tablas con todos los tipos de `JOIN`, y combinar resultados con `UNION`, `INTERSECT` y `EXCEPT`;
- usar subconsultas y CTE, `CASE`, `COALESCE`, `NULLIF` y las funciones de texto, número y fecha;
- usar funciones de ventana y consultas recursivas;
- crear vistas, índices y restricciones, y usar transacciones;
- escribir funciones, procedimientos y triggers, y leer los errores más habituales.

### Cómo se organiza cada punto

Los mismos pasos de siempre: **¿qué es?**, **¿para qué sirve?**, **¿por qué lo necesito?**, **¿cómo funciona?**, **primero sin código**, **paso a paso con código**, **código y resultado** (captura real), ejemplos, **profundizando**, ejercicio, solución, error habitual, buena práctica y comprobación. Además, **cada concepto de SQL de esta parte lleva su código completo, su resultado esperado y la explicación de ese resultado**.

### La base de datos de esta parte

Trabajaremos con la base de datos `tienda`: clientes, productos, pedidos y líneas de pedido. Se construye en los puntos 5.1 y 5.2 y se usa en todos los demás. **Importante:** los resultados de cada captura dependen de lo que se haya ejecutado antes (por ejemplo, en el punto 5.5 subimos el precio de las zapatillas, y en el 5.16 cancelamos el pedido 110), así que conviene seguir los puntos en orden y, si quieres repetirlos, volver a crear la base de datos desde cero con el script de la parte (`parte-05.sql`).

## 5.0 Qué es SQL y cómo se lee una sentencia

### ¿Qué es?

**SQL** (*Structured Query Language*, «lenguaje de consulta estructurado») es el lenguaje con el que se habla con una base de datos relacional. Se pronuncia «ese-cu-ele». Casi todos los gestores (PostgreSQL, MySQL, SQL Server, SQLite) lo entienden, con pequeñas diferencias de dialecto. Es un lenguaje **declarativo**: dices *qué* quieres, no *cómo* conseguirlo; el gestor decide la forma más eficiente.

### ¿Para qué sirve?

Para todo lo que se hace con datos: crear la estructura (tablas), guardar datos, leerlos, modificarlos, borrarlos y controlar quién puede hacer qué. Las sentencias se agrupan por su función:

| Grupo | Para qué | Sentencias |
| --- | --- | --- |
| DDL (definición) | Crear y cambiar la estructura | `CREATE`, `ALTER`, `DROP` |
| DML (manipulación) | Guardar y cambiar datos | `INSERT`, `UPDATE`, `DELETE` |
| DQL (consulta) | Leer datos | `SELECT` |
| TCL (transacciones) | Agrupar cambios | `BEGIN`, `COMMIT`, `ROLLBACK` |
| DCL (permisos) | Dar o quitar permisos | `GRANT`, `REVOKE` |

### ¿Por qué lo necesito?

Porque es el lenguaje común de las bases de datos relacionales: lo que aprendas aquí lo usarás con cualquier gestor, desde una aplicación pequeña hasta un sistema empresarial.

### ¿Cómo funciona?

Una sentencia de lectura se **escribe** en un orden y se **ejecuta** en otro. Entender el orden de ejecución explica casi todos los errores de principiante:

| Orden de escritura | Orden de ejecución | Qué hace |
| --- | --- | --- |
| `SELECT` | 5.º | Elige las columnas del resultado |
| `FROM` | 1.º | Decide de qué tablas parte (y las une) |
| `WHERE` | 2.º | Filtra las filas |
| `GROUP BY` | 3.º | Agrupa filas |
| `HAVING` | 4.º | Filtra los grupos |
| `ORDER BY` | 6.º | Ordena el resultado |
| `LIMIT` | 7.º | Se queda con las primeras filas |

Por eso no puedes usar en `WHERE` un alias definido en el `SELECT` (todavía no existe cuando se filtra) y sí en el `ORDER BY` (ya existe).

### Primero, sin código: leer una sentencia en voz alta

Toma `SELECT nombre, precio_eur FROM productos WHERE precio_eur > 20 ORDER BY precio_eur DESC LIMIT 2;` y léela en el orden de ejecución: «de la tabla `productos` (FROM), quédate con las filas con precio mayor que 20 (WHERE), de ellas toma `nombre` y `precio_eur` (SELECT), ordénalas de mayor a menor precio (ORDER BY) y dame solo las dos primeras (LIMIT)».

### Paso a paso: ahora con código

1. **Conéctate a `tienda`** (`\c tienda`; créala antes si no existe).
2. **Crea las tablas** (punto 5.1) y **carga los datos** (punto 5.2).
3. **Ejecuta sentencias de cada punto** en orden y compara con las capturas.

### Código y resultado

Este punto es conceptual: el código está en los siguientes. Un resumen de las reglas de escritura (punto 0.4): las sentencias terminan en `;`, las palabras clave no distinguen mayúsculas, los textos van entre comillas simples y los comentarios empiezan por `--`.

### Ejemplo sencillo

`SELECT 2 + 3;` es una sentencia completa: pide el resultado de una operación.

### Ejemplo real

Una aplicación web ejecuta cientos de sentencias SQL por segundo: cada pantalla que lees es un `SELECT`; cada formulario que envías, un `INSERT` o un `UPDATE`.

### Profundizando

**Dialectos.** El estándar SQL existe, pero cada gestor añade extensiones. PostgreSQL es de los más fieles al estándar y añade funciones propias (como `ILIKE` o `ON CONFLICT`); las señalaremos cuando aparezcan.

**Declarativo.** Dos consultas distintas que dan el mismo resultado pueden tardar muy distinto; el gestor las traduce en un plan de ejecución (Parte 18).

### Ejercicio

1. Escribe en orden de ejecución: `SELECT categoria, count(*) FROM productos WHERE activo GROUP BY categoria HAVING count(*) > 1 ORDER BY categoria;`
2. ¿Por qué falla `SELECT precio_eur * 2 AS doble FROM productos WHERE doble > 10;`?

### Solución

1. FROM productos; WHERE activo; GROUP BY categoria; HAVING count(*) > 1; SELECT categoria y el recuento; ORDER BY categoria.
2. Porque `WHERE` se ejecuta antes que `SELECT` y el alias `doble` aún no existe. Hay que repetir la expresión: `WHERE precio_eur * 2 > 10`.

### Error habitual

Usar en `WHERE` un alias del `SELECT`, o una función de resumen (`count`, `sum`) en `WHERE`: para filtrar por un resumen se usa `HAVING`.

### Buena práctica

Escribe las consultas en varias líneas, una cláusula por línea, y léelas siempre en orden de ejecución.

### Comprobación

Sin ejecutar, di en qué orden se evalúan las cláusulas de una consulta cualquiera tuya.

## 5.1 Crear: bases de datos, tablas, tipos, claves, secuencias e identidades

### ¿Qué es?

`CREATE` es la sentencia que crea objetos: bases de datos (`CREATE DATABASE`), tablas (`CREATE TABLE`), índices, vistas, secuencias... Una tabla se define con sus **columnas** (nombre y tipo), sus **claves** y sus **restricciones**. Una **secuencia** es un contador que entrega números cada vez que se le piden; una **identidad** es una secuencia asociada a una columna.

### ¿Para qué sirve?

Para definir la estructura sobre la que se guardarán los datos. Es el paso que traduce tu diseño (Partes 2 y 3) a algo que PostgreSQL entiende y protege.

### ¿Por qué lo necesito?

Una tabla bien definida impide datos erróneos desde el principio. Una mal definida (sin tipos, sin claves, sin restricciones) los deja entrar.

### ¿Cómo funciona?

La forma general:

```sql
CREATE TABLE nombre (
  columna tipo [restricciones],
  ...,
  [restricciones de tabla]
);
```

Los tipos más habituales en PostgreSQL: `integer`, `bigint`, `numeric(p, s)`, `text`, `varchar(n)`, `boolean`, `date`, `time`, `timestamptz`, `uuid` y `jsonb`. Las restricciones de columna van junto a ella (`NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK`, `REFERENCES`); las de varias columnas (como la clave compuesta) van al final.

### Primero, sin código: la ficha de cada tabla

Antes del `CREATE TABLE`, escribe la ficha de cada tabla como en el punto 3.1: columnas, tipos, obligatorias, únicas, valores por defecto y enlaces. El SQL es una traducción mecánica de la ficha. Recuerda el orden de creación: primero las tablas independientes (`clientes`, `productos`), después las que apuntan a ellas (`pedidos`) y por último las intermedias (`lineas_pedido`).

### Paso a paso: ahora con código

1. **Crea la base de datos** (`CREATE DATABASE tienda;`, punto 0.5) y conéctate.
2. **Crea `clientes` y `productos`**, que no dependen de ninguna otra tabla.
3. **Crea `pedidos`**, que apunta a `clientes`.
4. **Crea `lineas_pedido`**, que apunta a `pedidos` y `productos`.
5. **Comprueba con `\dt`**.
6. **Prueba una secuencia suelta** y comprueba cómo reparte números.

### Código y resultado

@demo r5-1a | Figura 5.1-a. Captura real: las cuatro tablas de la tienda.

**Qué ves en la imagen.** Cada `CREATE TABLE` responde `CREATE TABLE`, y `\dt` lista las cuatro tablas. Fíjate en las novedades respecto a la Parte 3: `alta date NOT NULL DEFAULT current_date` (fecha de hoy por defecto), `categoria text NOT NULL` en `productos`, y `ON DELETE CASCADE` en las líneas. Las identidades (`GENERATED ALWAYS AS IDENTITY`) generan los números solos; en `pedidos` empiezan en 101.

@demo r5-1b | Figura 5.1-b. Captura real: una secuencia suelta y una tabla que la usa por defecto, en una sesión interactiva.

**Qué ves en la imagen.** `CREATE SEQUENCE numero_factura START 1000` crea un contador. `nextval('numero_factura')` pide el siguiente número: 1000, y la segunda vez, 1001. `currval` devuelve el último número entregado **en esta sesión** (1001). La tabla `facturas` usa `DEFAULT nextval('numero_factura')` en su columna `numero`, y al insertar dos facturas sin indicar el número reciben el 1002 y el 1003. Una identidad es exactamente esto, pero gestionado por PostgreSQL.

@demo r5-1c | Figura 5.1-c. Captura real: los tipos de datos más habituales de PostgreSQL.

**Qué ves en la imagen.** `\d tipos_demo` muestra cómo PostgreSQL nombra cada tipo: `integer`, `bigint`, `numeric(8,3)`, `text`, `character varying(5)` (el `varchar(5)` abreviado), `boolean`, `date`, `time without time zone`, `timestamp with time zone`, `uuid` y `jsonb`. Verás los tipos en detalle en la Parte 6.

### Ejemplo sencillo

`CREATE TABLE etiquetas (id integer PRIMARY KEY, nombre text NOT NULL);` es una tabla mínima con clave y un campo obligatorio.

### Ejemplo real

Los proyectos guardan sus `CREATE TABLE` en archivos numerados (`001_crear_tablas.sql`, `002_...`) para poder reconstruir la base de datos desde cero.

### Profundizando

**Identidad frente a secuencia.** La identidad es una secuencia unida a una columna y protegida (`GENERATED ALWAYS`). Una secuencia suelta sirve para números compartidos entre tablas o con formato especial (facturas).

**Los huecos.** Las secuencias no «devuelven» números: tras un error o un `ROLLBACK`, el número gastado se pierde (punto 3.4).

**`IF NOT EXISTS`.** `CREATE TABLE IF NOT EXISTS ...` no falla si la tabla ya existe, útil en scripts repetibles.

**Modificar y borrar.** `ALTER TABLE` cambia una tabla existente (columnas, restricciones) y `DROP TABLE` la elimina. Úsalas con cuidado: `DROP` es irreversible.

### Ejercicio

1. Crea una tabla `proveedores` con `id` (identidad), `nombre` (obligatorio), `email` (único) y `creado_en` (fecha y hora, por defecto ahora).
2. Crea una secuencia `numero_pedido` que empiece en 5000 y pide dos números.
3. ¿Qué tipo usarías para un precio y por qué no `double precision`?

### Solución

1. La tabla:

```sql
CREATE TABLE proveedores (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre    text NOT NULL,
  email     text UNIQUE,
  creado_en timestamptz NOT NULL DEFAULT now()
);
```

2. `CREATE SEQUENCE numero_pedido START 5000;` y `SELECT nextval('numero_pedido');` dos veces (5000 y 5001).
3. `numeric(10, 2)`: es exacto; `double precision` acumula errores de céntimos (punto 3.1).

### Error habitual

Crear las tablas en orden incorrecto (la dependiente antes que la referenciada) o definir columnas sin tipo adecuado (todo como `text`).

```sql
-- Falla: clientes todavía no existe
CREATE TABLE pedidos_x (id integer PRIMARY KEY, cliente_id integer REFERENCES clientes_inexistente (id));
```

### Buena práctica

Define siempre clave primaria, tipos adecuados y restricciones desde la creación; es mucho más barato que corregir datos después.

### Comprobación

Tras crear una tabla, ejecuta `\d tabla` y comprueba tipo, `Nullable`, valores por defecto, índices y claves.

## 5.2 Insertar: INSERT

### ¿Qué es?

`INSERT` guarda filas nuevas en una tabla. Puede insertar una fila, varias a la vez, o el resultado de una consulta.

### ¿Para qué sirve?

Para llenar la base de datos: cada alta de un cliente, cada pedido nuevo, es un `INSERT`.

### ¿Por qué lo necesito?

Sin datos, las consultas no devuelven nada. Y la forma de insertar determina la seguridad (¿qué pasa si el dato ya existe?).

### ¿Cómo funciona?

```sql
INSERT INTO tabla (col1, col2) VALUES (v1, v2);            -- una fila
INSERT INTO tabla (col1, col2) VALUES (v1, v2), (v3, v4);  -- varias filas
INSERT INTO tabla (col1) SELECT ... ;                      -- desde una consulta
```

Indicar **siempre la lista de columnas** es más seguro: no depende del orden de la tabla. Las columnas que no se mencionan reciben su valor por defecto (o NULL). `RETURNING` devuelve las filas insertadas (útil para conocer el `id` generado). `ON CONFLICT` decide qué hacer si la fila choca con una clave única.

### Primero, sin código: apunta las filas en papel

Antes de insertar, escribe las filas en papel respetando el orden de dependencia: primero los clientes y productos (no dependen de nadie), luego los pedidos (apuntan a clientes) y, por último, las líneas (apuntan a pedidos y productos). Si apuntas una línea antes que su pedido, el enlace estaría roto.

### Paso a paso: ahora con código

1. **Inserta un cliente** indicando las columnas.
2. **Inserta varios clientes** en una sola sentencia.
3. **Inserta productos, pedidos y líneas** en ese orden.
4. **Prueba qué pasa con un duplicado**, y cómo controlarlo con `ON CONFLICT`.
5. **Copia filas entre tablas** con `INSERT ... SELECT`.

### Código y resultado

@demo r5-2a | Figura 5.2-a. Captura real: un cliente, luego siete, y la comprobación del recuento.

**Qué ves en la imagen.** La primera sentencia inserta una fila (`INSERT 0 1`); la segunda, siete (`INSERT 0 7`), separadas por comas. Las columnas no mencionadas (`id`) se rellenan solas. Los clientes sin teléfono o sin ciudad llevan `NULL` explícito. El recuento final da 8.

@demo r5-2b | Figura 5.2-b. Captura real: productos, pedidos y líneas de pedido.

**Qué ves en la imagen.** Se insertan 8 productos, 12 pedidos (`cliente_id` apunta al `id` del cliente) y 22 líneas. Las respuestas `INSERT 0 8`, `INSERT 0 12` e `INSERT 0 22` confirman cuántas filas entraron. Las líneas apuntan a los pedidos 101 a 112, que ya existen. A partir de aquí la base de datos está lista para todos los demás puntos.

@demo r5-2c | Figura 5.2-c. Captura real: un duplicado falla; `ON CONFLICT` permite decidir qué hacer.

**Qué ves en la imagen.**

1. Insertar un email que ya existe produce el error de siempre (`clientes_email_key`).
2. Con `ON CONFLICT (email) DO NOTHING`, el conflicto se ignora: `INSERT 0 0` («cero filas insertadas»).
3. Con `ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre`, si existe se **actualiza** (`EXCLUDED` es la fila que se intentaba insertar): Ana pasa a llamarse «Ana G.». Esto se llama *upsert* (insertar o actualizar). `RETURNING` devuelve la fila resultante.

@demo r5-2d | Figura 5.2-d. Captura real: arreglar el nombre y copiar filas con `INSERT ... SELECT`.

**Qué ves en la imagen.** Se restaura el nombre de Ana (`UPDATE 1`). `CREATE TABLE ... AS SELECT` crea una tabla con el resultado de una consulta (`SELECT 3`: tres clientes de Madrid). `INSERT INTO ... SELECT ...` añade las filas de otra consulta (`INSERT 0 2`: dos de Sevilla). El resultado: cinco clientes de Madrid y Sevilla en la tabla copia.

### Ejemplo sencillo

`INSERT INTO productos (nombre, categoria, precio_eur) VALUES ('Taza', 'hogar', 7.50);` guarda un producto; el stock y el estado toman sus valores por defecto.

### Ejemplo real

Al registrarse un usuario, la aplicación ejecuta un `INSERT ... RETURNING id` para conocer el identificador y usarlo en la sesión.

### Profundizando

**Inserción masiva.** Un solo `INSERT` con muchas filas es mucho más rápido que muchos `INSERT` sueltos. Para cargas enormes existe `COPY`, que lee archivos CSV (Parte 6).

**`DEFAULT VALUES`.** `INSERT INTO tabla DEFAULT VALUES;` inserta una fila con todo por defecto.

**Orden de las columnas.** Sin lista de columnas, los valores se asignan por posición: si luego se añade una columna, las inserciones antiguas se rompen. Indica siempre las columnas.

### Ejercicio

1. Inserta un producto «Taza» de categoría «hogar», precio 7,50.
2. Inserta dos productos a la vez.
3. Escribe un `INSERT` que, si el producto «Taza» ya existiera (nombre único), subiera el precio. (Pista: necesitas una restricción única sobre el nombre; en esta base de datos existe el índice único `lower(nombre)` desde el punto 5.14.)

### Solución

1. `INSERT INTO productos (nombre, categoria, precio_eur) VALUES ('Taza', 'hogar', 7.50);`
2. `INSERT INTO productos (nombre, categoria, precio_eur) VALUES ('Vaso', 'hogar', 3.20), ('Plato', 'hogar', 5.00);`
3. Con una columna `nombre` única: `INSERT INTO productos (nombre, categoria, precio_eur) VALUES ('Taza', 'hogar', 8.00) ON CONFLICT (nombre) DO UPDATE SET precio_eur = EXCLUDED.precio_eur;` (requiere `UNIQUE (nombre)`).

### Error habitual

Insertar sin lista de columnas, o en el orden incorrecto de dependencia (líneas antes que pedidos).

```sql
-- Falla: el pedido 999 no existe todavía
INSERT INTO lineas_pedido VALUES (999, 1, 1, 19.95);
```

### Buena práctica

Indica siempre las columnas, usa `RETURNING` para obtener los `id` generados y decide con `ON CONFLICT` qué pasa si el dato ya existe.

### Comprobación

Tras insertar, cuenta filas con `SELECT count(*)` y comprueba que coincide con lo esperado.

## 5.3 Leer: SELECT, alias, DISTINCT, ORDER BY y LIMIT

### ¿Qué es?

`SELECT` lee datos. Elige **qué columnas** (o expresiones) devolver, de **qué tabla**. `DISTINCT` elimina repetidos; `ORDER BY` ordena; `LIMIT` y `OFFSET` limitan y saltan filas. Un **alias** (`AS`) pone un nombre nuevo a una columna del resultado.

### ¿Para qué sirve?

Para obtener justo la información que necesitas: ni más columnas ni más filas.

### ¿Por qué lo necesito?

Es la sentencia más usada. Dominar sus piezas básicas resuelve la mayoría de las consultas del día a día.

### ¿Cómo funciona?

```sql
SELECT [DISTINCT] columnas_o_expresiones
FROM tabla
[ORDER BY columna [ASC|DESC], ...]
[LIMIT n [OFFSET m]];
```

`*` significa «todas las columnas». Una expresión como `precio_eur * 1.21` se calcula fila a fila. `ORDER BY` por defecto es ascendente (`ASC`); `DESC` es descendente. **Sin `ORDER BY` el orden no está garantizado.**

### Primero, sin código: elegir columnas y filas sobre la tabla

Con la tabla `productos` delante, subraya las **columnas** que necesitas (eso es el `SELECT`) y numera las filas en el orden que quieres (eso es el `ORDER BY`). Si solo quieres las tres primeras, tacha el resto (eso es el `LIMIT`).

### Paso a paso: ahora con código

1. **Lee todo** con `SELECT *` para conocer la tabla.
2. **Elige columnas** concretas.
3. **Calcula una columna** con una expresión y ponle alias.
4. **Elimina repetidos** con `DISTINCT`.
5. **Ordena** por una o varias columnas.
6. **Limita** con `LIMIT` (y salta con `OFFSET`).

### Código y resultado

@demo r5-3a | Figura 5.3-a. Captura real: todas las columnas, solo dos, y una columna calculada con alias.

**Qué ves en la imagen.** `SELECT *` devuelve las 8 filas con todas las columnas; `SELECT nombre, precio_eur` solo dos. La tercera consulta calcula `precio_eur * 1.21` (precio con IVA del 21 %) y lo muestra con el alias `con_iva`; `AS producto` y `AS precio` renombran las otras columnas. Fíjate en que el cálculo da más decimales (24.1395): luego aprenderás a redondear.

@demo r5-3b | Figura 5.3-b. Captura real: `DISTINCT` y `ORDER BY`.

**Qué ves en la imagen.** Sin `DISTINCT`, la columna `categoria` repite el valor por cada producto (8 filas). Con `DISTINCT` y `ORDER BY categoria`, quedan solo las tres categorías distintas, ordenadas. `ORDER BY precio_eur DESC` ordena del más caro al más barato. `ORDER BY categoria, precio_eur DESC` ordena primero por categoría y, dentro de cada una, por precio descendente.

@demo r5-3c | Figura 5.3-c. Captura real: `LIMIT` y `OFFSET`.

**Qué ves en la imagen.** `LIMIT 3` devuelve solo los tres productos más caros. `LIMIT 3 OFFSET 3` salta los tres primeros y devuelve los tres siguientes (cuarto a sexto): así se hace la paginación («página 2»).

### Ejemplo sencillo

`SELECT nombre FROM clientes ORDER BY nombre;` lista los nombres en orden alfabético.

### Ejemplo real

Un listado paginado de una tienda usa `ORDER BY ... LIMIT 20 OFFSET 40` para mostrar la tercera página de 20 productos.

### Profundizando

**Orden estable.** Con `ORDER BY` por una columna con valores repetidos, el orden entre iguales no está garantizado: añade una segunda columna (como el `id`) para un orden determinista.

**`OFFSET` grande es lento.** Para paginar tablas enormes se usa «paginación por clave» (Parte 18).

**`NULLS FIRST/LAST`.** Con `ORDER BY` los NULL van al final en orden ascendente y al principio en descendente; se puede cambiar con `NULLS FIRST` o `NULLS LAST`.

### Ejercicio

1. Muestra el nombre y el precio con IVA (21 %) redondeado a dos decimales de todos los productos, del más caro al más barato.
2. Muestra las ciudades distintas de los clientes, ordenadas.
3. Muestra los dos productos más baratos.

### Solución

1. `SELECT nombre, round(precio_eur * 1.21, 2) AS con_iva FROM productos ORDER BY con_iva DESC;`
2. `SELECT DISTINCT ciudad FROM clientes ORDER BY ciudad;` (el NULL aparece al final.)
3. `SELECT nombre, precio_eur FROM productos ORDER BY precio_eur LIMIT 2;`

### Error habitual

Usar `SELECT *` en aplicaciones (trae columnas innecesarias) y fiarse del orden sin `ORDER BY`.

```sql
-- Mal: el orden no está garantizado
SELECT nombre FROM clientes LIMIT 3;
-- Bien
SELECT nombre FROM clientes ORDER BY id LIMIT 3;
```

### Buena práctica

Pide solo las columnas que necesitas y usa siempre `ORDER BY` cuando el orden importe (y, con `LIMIT`, siempre).

### Comprobación

Antes de ejecutar, di cuántas filas y qué columnas debe devolver tu consulta; comprueba que coincide.

## 5.4 Filtrar: WHERE, AND, OR, NOT, IN, BETWEEN, LIKE e IS NULL

### ¿Qué es?

`WHERE` deja pasar solo las filas que cumplen una **condición**. Las condiciones se construyen con comparaciones (`=`, `<>`, `<`, `>`, `<=`, `>=`), operadores lógicos (`AND`, `OR`, `NOT`) y predicados especiales (`IN`, `BETWEEN`, `LIKE`, `ILIKE`, `IS NULL`).

### ¿Para qué sirve?

Para quedarte solo con lo que te interesa: «productos de más de 20 euros», «clientes de Madrid», «pedidos pendientes».

### ¿Por qué lo necesito?

Sin filtros, cada consulta traería toda la tabla. Con millones de filas, filtrar bien es la diferencia entre milisegundos y minutos.

### ¿Cómo funciona?

Para cada fila, el gestor evalúa la condición: si da verdadero, la fila pasa; si da falso o desconocido (NULL), no pasa. Los predicados:

| Predicado | Significado | Ejemplo |
| --- | --- | --- |
| `=`, `<>`, `<`, `>` | Comparar | `precio_eur > 20` |
| `AND`, `OR`, `NOT` | Combinar | `a AND b` |
| `IN (...)` | Está en una lista | `categoria IN ('ropa', 'calzado')` |
| `BETWEEN a AND b` | Entre a y b, **incluidos** | `precio_eur BETWEEN 10 AND 25` |
| `LIKE` / `ILIKE` | Patrón de texto (`%` = cualquier texto, `_` = un carácter); `ILIKE` ignora mayúsculas | `nombre LIKE 'M%'` |
| `IS NULL` / `IS NOT NULL` | Valor ausente | `telefono IS NULL` |

**`AND` se evalúa antes que `OR`**: usa paréntesis para dejar clara tu intención.

### Primero, sin código: filtrar con el dedo

@fig h5-4 | Figura 5.4-a. Sin código: filtrar filas a mano con una condición.

**Qué ves en la imagen.** Paso 1: la tabla y la pregunta. Paso 2: para cada fila comprobamos la condición y la marcamos en verde (pasa) o rojo (no pasa). Paso 3: el resultado son solo las filas verdes. Es exactamente lo que hace `WHERE`.

### Paso a paso: ahora con código

1. **Escribe la condición** como una frase y tradúcela.
2. **Prueba comparaciones** y combínalas con `AND`, `OR` y `NOT`.
3. **Usa `IN`, `BETWEEN`, `LIKE`, `ILIKE` e `IS NULL`**.
4. **Comprueba la prioridad** de `AND` y `OR` con un ejemplo, y corrígela con paréntesis.

### Código y resultado

@demo r5-4a | Figura 5.4-b. Captura real: comparaciones y operadores lógicos.

**Qué ves en la imagen.** `precio_eur > 20` devuelve 4 productos. `categoria = 'ropa' AND stock > 0` exige las dos cosas (Camiseta y Calcetines). `categoria = 'calzado' OR activo = false` basta con una (Zapatillas y la Sudadera, que está inactiva). `NOT activo` devuelve los productos no activos (Sudadera).

@demo r5-4b | Figura 5.4-c. Captura real: `IN`, `BETWEEN`, `LIKE`, `ILIKE` e `IS NULL`.

**Qué ves en la imagen.** `IN ('calzado', 'accesorios')` devuelve los 4 productos de esas categorías. `BETWEEN 10 AND 25` incluye los extremos (Camiseta 19,95; Botella 12,00; Cartera 24,00). `LIKE 'M%'` encuentra los nombres que empiezan por «M» (Marta Ruiz; distingue mayúsculas). `ILIKE '%GARC%'` encuentra «Ana García» sin importar mayúsculas. `IS NULL` encuentra a los tres clientes sin teléfono.

@demo r5-4c | Figura 5.4-d. Captura real: la prioridad de `AND` sobre `OR`, y cómo corregirla con paréntesis.

**Qué ves en la imagen.** La primera consulta, sin paréntesis, se lee como «ropa **o** (calzado y de más de 50 €)»: devuelve toda la ropa más las zapatillas (5 filas), no lo que se pretendía. Con paréntesis, «(ropa o calzado) y de más de 50 €», solo queda Zapatillas. El mismo texto, otro significado: los paréntesis importan.

### Ejemplo sencillo

`SELECT nombre FROM clientes WHERE ciudad = 'Madrid';` devuelve los clientes de Madrid.

### Ejemplo real

Un buscador de productos construye la consulta con `WHERE` según los filtros que marca el usuario (categoría, rango de precio, solo en stock).

### Profundizando

**NULL y las comparaciones.** `telefono <> '600111222'` **no** devuelve las filas con teléfono NULL (desconocido no es distinto ni igual). Para incluirlas: `telefono IS DISTINCT FROM '600111222'`.

**`LIKE` y los índices.** `LIKE 'M%'` (prefijo) puede usar un índice; `LIKE '%M'` o `'%garc%'` normalmente no (Parte 18).

**`NOT IN` con NULL.** `x NOT IN (SELECT ...)` devuelve vacío si la subconsulta contiene algún NULL. Es una trampa clásica; `NOT EXISTS` no la tiene (punto 5.9).

### Ejercicio

1. Productos activos de la categoría «accesorios» con precio inferior a 30.
2. Clientes cuyo nombre contiene «ar» (sin importar mayúsculas).
3. Pedidos de febrero de 2026 (usa `BETWEEN` con fechas).

### Solución

1. `SELECT nombre, precio_eur FROM productos WHERE categoria = 'accesorios' AND activo AND precio_eur < 30;`
2. `SELECT nombre FROM clientes WHERE nombre ILIKE '%ar%';`
3. `SELECT id, fecha FROM pedidos WHERE fecha BETWEEN '2026-02-01' AND '2026-02-28';`

### Error habitual

Comparar con NULL usando `=`, y mezclar `AND` y `OR` sin paréntesis.

```sql
-- Mal: nunca devuelve filas
SELECT * FROM clientes WHERE telefono = NULL;
-- Bien
SELECT * FROM clientes WHERE telefono IS NULL;
```

### Buena práctica

Pon paréntesis siempre que mezcles `AND` y `OR`, aunque creas que sobran.

### Comprobación

Antes de ejecutar, cuenta a mano cuántas filas debería devolver tu filtro y compara.

## 5.5 Modificar y borrar: UPDATE y DELETE

### ¿Qué es?

`UPDATE` cambia los valores de filas existentes. `DELETE` elimina filas. Ambas actúan sobre **las filas que cumplan el `WHERE`**; sin `WHERE`, actúan sobre **todas**.

### ¿Para qué sirve?

Para mantener los datos al día: cambiar un precio, corregir un teléfono, dar de baja un cliente.

### ¿Por qué lo necesito?

Son las sentencias más peligrosas: un `UPDATE` o `DELETE` sin `WHERE` correcto puede arruinar la tabla entera en un segundo.

### ¿Cómo funciona?

```sql
UPDATE tabla SET columna = valor [, ...] WHERE condicion;
DELETE FROM tabla WHERE condicion;
```

Los valores nuevos pueden ser expresiones que usan los valores actuales (`stock = stock + 20`). `RETURNING` devuelve las filas afectadas. La respuesta (`UPDATE 3`, `DELETE 1`) indica cuántas filas se tocaron: **comprueba siempre ese número**.

### Primero, sin código: la regla de oro

Antes de modificar o borrar, **escribe un `SELECT` con el mismo `WHERE`** y mira qué filas devuelve: son exactamente las que se van a modificar. Si no son las que esperas, corrige el `WHERE` antes de tocar nada.

### Paso a paso: ahora con código

1. **Mira la fila** con un `SELECT`.
2. **Modifícala** con `UPDATE ... WHERE` y comprueba el número de filas.
3. **Vuelve a mirarla**.
4. **Haz un cambio sobre varias filas**, con expresión y `RETURNING`.
5. **Borra**: primero `SELECT`, después `DELETE`.
6. **Intenta un borrado que las claves extranjeras impiden**.

### Código y resultado

@demo r5-5a | Figura 5.5-a. Captura real: `UPDATE` de una fila y de varias, con expresión y `RETURNING`.

**Qué ves en la imagen.** La Gorra tiene stock 0; `UPDATE ... SET stock = stock + 20` responde `UPDATE 1` y el stock pasa a 20. La segunda sentencia modifica **dos columnas a la vez** de todos los productos de calzado: sube el precio un 10 % (59,90 pasa a 65,89) y baja el stock en 1. `RETURNING` muestra el resultado. (Recuerda este cambio: las Zapatillas costarán 65,89 en los puntos siguientes.)

@demo r5-5b | Figura 5.5-b. Captura real: borrar con seguridad, y el borrado que las claves protegen.

**Qué ves en la imagen.** Se crea un cliente de prueba. Primero se hace un `SELECT` con el mismo `WHERE` para ver qué se va a borrar (una fila); después `DELETE ... WHERE email = ...` responde `DELETE 1`. El último intento, borrar al cliente 1 (Ana), falla: sigue referenciado desde `pedidos`; la clave extranjera protege los datos (punto 3.4).

### Ejemplo sencillo

`UPDATE clientes SET ciudad = 'Madrid' WHERE id = 8;` da una ciudad al cliente 8.

### Ejemplo real

Una tienda actualiza el stock con `UPDATE productos SET stock = stock - 1 WHERE id = ...` cada vez que vende una unidad.

### Profundizando

**Borrado de todas las filas.** `DELETE FROM tabla;` sin `WHERE` borra todo, pero deja la tabla. `TRUNCATE tabla;` hace lo mismo mucho más rápido y también reinicia contadores si se pide; es irreversible fuera de una transacción.

**`UPDATE ... FROM`.** PostgreSQL permite actualizar una tabla con datos de otra (`UPDATE a SET ... FROM b WHERE ...`).

**Actualizaciones concurrentes.** `stock = stock - 1` es seguro frente a accesos simultáneos; leer el stock, restar en la aplicación y escribirlo, no (Parte 5.15).

### Ejercicio

1. Sube un 5 % el precio de los productos de la categoría «ropa».
2. Escribe el `SELECT` previo y el `DELETE` que borre los pedidos cancelados que no tengan líneas. (Ayuda: ¿qué pedidos cancelados hay?)
3. ¿Qué hace `UPDATE productos SET stock = 0;`?

### Solución

1. `UPDATE productos SET precio_eur = round(precio_eur * 1.05, 2) WHERE categoria = 'ropa';`
2. `SELECT id FROM pedidos WHERE estado = 'cancelado' AND NOT EXISTS (SELECT 1 FROM lineas_pedido l WHERE l.pedido_id = pedidos.id);` y después el mismo `WHERE` en un `DELETE FROM pedidos ...`.
3. Pone el stock a 0 en **todos** los productos, porque no tiene `WHERE`.

### Error habitual

Olvidar el `WHERE` en un `UPDATE` o `DELETE`.

```sql
-- Desastre: borra TODOS los clientes (que no tengan pedidos)
DELETE FROM clientes;
```

### Buena práctica

Ejecuta primero el `SELECT` con el mismo `WHERE`, y haz los cambios importantes dentro de una transacción (punto 5.15) para poder deshacerlos.

### Comprobación

Comprueba siempre el número de filas de la respuesta (`UPDATE n`, `DELETE n`): si no es el que esperabas, deshaz el cambio.

## 5.6 Resumir: COUNT, SUM, AVG, MIN, MAX, GROUP BY y HAVING

### ¿Qué es?

Las **funciones de agregación** (`count`, `sum`, `avg`, `min`, `max`) resumen muchas filas en un solo valor. `GROUP BY` forma grupos de filas con el mismo valor en unas columnas y calcula el resumen **de cada grupo**. `HAVING` filtra los grupos (como `WHERE` filtra las filas).

### ¿Para qué sirve?

Para responder preguntas de negocio: «¿cuántos productos hay por categoría?», «¿cuánto vendimos en marzo?», «¿qué clientes han gastado más de 100?».

### ¿Por qué lo necesito?

Los informes y paneles de cualquier aplicación se construyen con agregaciones.

### ¿Cómo funciona?

| Función | Qué calcula | Detalle |
| --- | --- | --- |
| `count(*)` | Número de filas | Cuenta todas |
| `count(columna)` | Filas con valor en esa columna | **Ignora los NULL** |
| `sum(columna)` | Suma | Ignora los NULL |
| `avg(columna)` | Media | Ignora los NULL |
| `min`, `max` | Menor y mayor | |

Regla de oro de `GROUP BY`: **toda columna del `SELECT` debe estar en el `GROUP BY` o dentro de una función de agregación**. `WHERE` filtra filas **antes** de agrupar; `HAVING` filtra grupos **después**.

### Primero, sin código: agrupar a mano

@fig h5-6 | Figura 5.6-a. Sin código: agrupar filas con un color por grupo y resumir cada grupo.

**Qué ves en la imagen.** Paso 1: las filas sueltas. Paso 2: se colorean las filas que comparten categoría (un grupo por color). Paso 3: cada grupo se convierte en **una sola fila** del resultado, con su recuento y su media. Eso es `GROUP BY`.

### Paso a paso: ahora con código

1. **Resume toda la tabla** con las cinco funciones, sin agrupar.
2. **Comprueba cómo trata `count` los NULL**.
3. **Agrupa por una columna** y resume cada grupo.
4. **Filtra grupos** con `HAVING`.
5. **Provoca el error clásico** del `GROUP BY` y léelo.

### Código y resultado

@demo r5-6a | Figura 5.6-b. Captura real: las cinco funciones de agregación y el tratamiento de NULL.

**Qué ves en la imagen.** Una sola fila resume los 8 productos: 3 categorías distintas (`count(DISTINCT categoria)`), 189 unidades de stock en total, un precio medio de 26,33, el más barato 4,50 y el más caro 65,89. La segunda consulta muestra que, de 8 clientes, `count(*)` cuenta 8 pero `count(telefono)` solo 5: **ignora los NULL**.

@demo r5-6b | Figura 5.6-c. Captura real: `GROUP BY`, `HAVING` y el error típico.

**Qué ves en la imagen.** Agrupando por categoría salen 3 filas: accesorios (3 productos, media 23,50), calzado (1, 65,89) y ropa (4, 18,56). `HAVING count(*) >= 3` deja solo los grupos con tres o más productos (accesorios y ropa). La tercera consulta falla: `column "productos.nombre" must appear in the GROUP BY clause or be used in an aggregate function`: `nombre` no está agrupada ni resumida, y PostgreSQL no sabe qué nombre mostrar para cada categoría.

### Ejemplo sencillo

`SELECT count(*) FROM pedidos WHERE estado = 'pendiente';` cuenta los pedidos pendientes.

### Ejemplo real

El panel de ventas de una tienda ejecuta `SELECT date_trunc('month', fecha), sum(total) ... GROUP BY 1` para dibujar el gráfico de ventas mensuales.

### Profundizando

**`count(*)` frente a `count(columna)`.** La primera cuenta filas; la segunda, valores no nulos. `count(DISTINCT columna)` cuenta valores distintos.

**Agrupar por varias columnas.** `GROUP BY categoria, activo` crea un grupo por cada combinación.

**Agregaciones condicionales.** `count(*) FILTER (WHERE estado = 'pendiente')` cuenta solo las filas que cumplen una condición dentro del grupo.

**`WHERE` o `HAVING`.** Si el filtro no depende de un resumen, ponlo en `WHERE`: filtra antes y es más eficiente.

### Ejercicio

1. Número de pedidos por estado.
2. Estados con más de 2 pedidos.
3. Precio medio de los productos activos por categoría, redondeado a dos decimales.

### Solución

1. `SELECT estado, count(*) AS pedidos FROM pedidos GROUP BY estado ORDER BY estado;`
2. `SELECT estado, count(*) FROM pedidos GROUP BY estado HAVING count(*) > 2;`
3. `SELECT categoria, round(avg(precio_eur), 2) FROM productos WHERE activo GROUP BY categoria;`

### Error habitual

Poner en el `SELECT` columnas que no están en el `GROUP BY`, y usar `WHERE` con una función de agregación.

```sql
-- Falla: las funciones de agregación no se pueden usar en WHERE
SELECT categoria FROM productos WHERE count(*) > 2 GROUP BY categoria;
```

### Buena práctica

Filtra con `WHERE` todo lo que puedas antes de agrupar, y reserva `HAVING` para condiciones sobre resúmenes.

### Comprobación

Calcula a mano un resumen de pocas filas y comprueba que coincide con el de SQL.

## 5.7 Combinar tablas: JOIN

### ¿Qué es?

Un `JOIN` combina filas de dos tablas **emparejándolas por una condición**, normalmente `clave_extranjera = clave_primaria`. Hay cinco tipos: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN` y `CROSS JOIN`.

### ¿Para qué sirve?

Los datos están repartidos en tablas (Parte 4). El `JOIN` los vuelve a juntar para leer, por ejemplo, el nombre del cliente junto a su pedido.

### ¿Por qué lo necesito?

Sin `JOIN`, una base de datos normalizada sería inútil para leer. Es la operación central de SQL.

### ¿Cómo funciona?

| Tipo | Devuelve |
| --- | --- |
| `INNER JOIN` | Solo las parejas que coinciden |
| `LEFT JOIN` | Todas las filas de la izquierda, con su pareja si la hay (si no, NULL) |
| `RIGHT JOIN` | Todas las de la derecha |
| `FULL JOIN` | Todas las de ambas |
| `CROSS JOIN` | Todas las combinaciones posibles (sin condición) |

La condición va en `ON`. Los **alias** de tabla (`clientes c`) acortan el código y evitan ambigüedad (`c.id`, `p.id`).

### Primero, sin código: emparejar a mano

@fig h5-7 | Figura 5.7-a. Sin código: los cinco tipos de JOIN con dos tablas pequeñas.

**Qué ves en la imagen.** Dos tablas, `a` (uno, dos, tres) y `b` (dos, tres, cuatro). Verde: valores en ambas; naranja: valores en una sola. `INNER` conserva solo dos y tres. `LEFT` añade «uno» con NULL. `RIGHT` añade «cuatro». `FULL` conserva todo. `CROSS` da las 9 combinaciones.

### Paso a paso: ahora con código

1. **Une `clientes` con `pedidos`** por `cliente_id` (INNER).
2. **Busca los clientes sin pedidos** con `LEFT JOIN` y `WHERE ... IS NULL`.
3. **Une cuatro tablas** para ver un pedido completo.
4. **Combina `JOIN` con `GROUP BY`** para sacar ventas por cliente.
5. **Reproduce los cinco tipos** con las tablas `a` y `b`.

### Código y resultado

@demo r5-7a | Figura 5.7-b. Captura real: `INNER JOIN` y el patrón «los que no tienen».

**Qué ves en la imagen.** `INNER JOIN` muestra cada pedido con el nombre de su cliente (las 6 primeras filas). La segunda consulta, `LEFT JOIN ... WHERE p.id IS NULL`, devuelve a **Tomás Cano**: el único cliente sin pedidos. Es el patrón para encontrar «los que no tienen».

@demo r5-7b | Figura 5.7-c. Captura real: un pedido completo con cuatro tablas y las ventas por cliente.

**Qué ves en la imagen.** La primera consulta une pedidos, clientes, líneas y productos para mostrar el pedido 103: tres líneas (camiseta, mochila y dos botellas) con cantidad y precio. La segunda une y agrupa: por cada cliente, cuántos pedidos distintos tiene y cuánto ha gastado (suma de cantidad por precio de venta; incluye los pedidos cancelados). Ana García encabeza la lista.

@demo r5-7c | Figura 5.7-d. Captura real: los cinco tipos de `JOIN` sobre las tablas `a` y `b`.

**Qué ves en la imagen.** `INNER` devuelve 2 filas; `LEFT`, 3 (con «uno» y NULL); `RIGHT`, 3 (con «cuatro»); `FULL`, 4; `CROSS`, 9 (3 × 3). Es el mismo resultado que dibujaste a mano.

### Ejemplo sencillo

`SELECT c.nombre, p.id FROM clientes c JOIN pedidos p ON p.cliente_id = c.id;` muestra cada pedido con el nombre del cliente.

### Ejemplo real

La página «Mi cuenta» de una tienda une clientes, pedidos, líneas y productos para mostrar el historial de compras.

### Profundizando

**`JOIN` es `INNER JOIN`.** Escribir solo `JOIN` equivale a `INNER JOIN`.

**Condición en `ON` o en `WHERE`.** En `INNER JOIN` dan el mismo resultado; en `LEFT JOIN` no: una condición sobre la tabla derecha en `WHERE` elimina las filas con NULL y convierte el `LEFT` en `INNER` sin querer.

**Muchas filas.** Un `JOIN` mal planteado (sin condición, o con una condición que empareja muchas filas) puede multiplicar el número de filas. Comprueba siempre los recuentos.

**Autounión.** Una tabla puede unirse consigo misma (empleado y jefe, punto 3.2), usando dos alias distintos.

### Ejercicio

1. Nombre del cliente y estado de todos sus pedidos pendientes.
2. Productos que nunca se han vendido (usa `LEFT JOIN`).
3. Número de unidades vendidas por producto, con el nombre del producto.

### Solución

1. `SELECT c.nombre, p.id FROM pedidos p JOIN clientes c ON c.id = p.cliente_id WHERE p.estado = 'pendiente';`
2. `SELECT pr.nombre FROM productos pr LEFT JOIN lineas_pedido l ON l.producto_id = pr.id WHERE l.pedido_id IS NULL;`
3. `SELECT pr.nombre, sum(l.cantidad) AS unidades FROM productos pr JOIN lineas_pedido l ON l.producto_id = pr.id GROUP BY pr.nombre ORDER BY unidades DESC;`

### Error habitual

Olvidar la condición `ON` (producto cartesiano) o usar `INNER JOIN` cuando se quería conservar las filas sin pareja.

```sql
-- Mal: cada cliente emparejado con cada pedido (CROSS JOIN encubierto)
SELECT c.nombre, p.id FROM clientes c, pedidos p;
```

### Buena práctica

Escribe siempre `JOIN ... ON` explícito, usa alias cortos y comprueba el recuento de filas tras cada unión.

### Comprobación

Tras un `JOIN`, comprueba que el número de filas es el esperado; si es mucho mayor, falta una condición.

## 5.8 Combinar resultados: UNION, INTERSECT y EXCEPT

### ¿Qué es?

Operaciones entre **conjuntos de filas**: `UNION` junta los resultados de dos consultas (sin repetidos); `UNION ALL` los junta conservando repetidos; `INTERSECT` deja las filas comunes; `EXCEPT` deja las del primero que no están en el segundo.

### ¿Para qué sirve?

Para combinar resultados de varias consultas con la misma forma (mismas columnas y tipos), o comparar conjuntos.

### ¿Por qué lo necesito?

A veces la información está en tablas distintas, o necesitas saber qué está en un conjunto y no en otro (ya lo usaste en el punto 4.4 para demostrar que no se pierde información).

### ¿Cómo funciona?

Las dos consultas deben devolver **el mismo número de columnas, con tipos compatibles**. El nombre de las columnas es el de la primera. `UNION` elimina duplicados (más lento); `UNION ALL` no (más rápido).

### Primero, sin código: conjuntos con listas

Escribe dos listas de nombres. **Unión**: todos los nombres, sin repetir. **Intersección**: los que están en las dos listas. **Diferencia**: los que están en la primera y no en la segunda.

### Paso a paso: ahora con código

1. **Une dos consultas** con `UNION` y comprueba que no hay repetidos.
2. **Repite con `UNION ALL`** y compara el número de filas.
3. **Intersecta** dos conjuntos de productos.
4. **Resta** un conjunto de otro.

### Código y resultado

@demo r5-8a | Figura 5.8-a. Captura real: `UNION`, `UNION ALL`, `INTERSECT` y `EXCEPT`.

**Qué ves en la imagen.** `UNION` devuelve 2 filas (Madrid y Sevilla, sin repetir; el orden no está garantizado). `UNION ALL` devuelve 8: Madrid aparece repetido porque está en las dos consultas. `INTERSECT` devuelve los productos que son de ropa **y** tienen stock (Calcetines, Camiseta y Gorra). `EXCEPT` devuelve los de ropa **que no** tienen stock (Sudadera).

### Ejemplo sencillo

`SELECT 1 UNION SELECT 1;` devuelve una fila; con `UNION ALL`, dos.

### Ejemplo real

Un informe junta ventas de tienda física y online (tablas distintas con la misma forma) con `UNION ALL`.

### Profundizando

**`UNION ALL` por defecto.** Si sabes que no hay duplicados, `UNION ALL` es más rápido; `UNION` obliga a ordenar o comparar para quitarlos.

**Orden.** `ORDER BY` se escribe una sola vez, al final de la última consulta, y se aplica al resultado completo.

**`EXCEPT ALL` e `INTERSECT ALL`** conservan duplicados.

### Ejercicio

1. Ciudades de clientes que no son Madrid ni Sevilla (con `EXCEPT`).
2. Todos los nombres de productos y de clientes en una sola lista, ordenados (con `UNION`).

### Solución

1. `SELECT DISTINCT ciudad FROM clientes EXCEPT SELECT ciudad FROM clientes WHERE ciudad IN ('Madrid', 'Sevilla');`
2. `SELECT nombre FROM productos UNION SELECT nombre FROM clientes ORDER BY nombre;`

### Error habitual

Combinar consultas con distinto número de columnas, o usar `UNION` cuando bastaba `UNION ALL` (más lento sin motivo).

```sql
-- Falla: número de columnas distinto
SELECT nombre, precio_eur FROM productos UNION SELECT nombre FROM clientes;
```

### Buena práctica

Usa `UNION ALL` salvo que necesites eliminar duplicados.

### Comprobación

Comprueba que el número de filas de `UNION ALL` es la suma de las dos consultas.

## 5.9 Subconsultas y CTE

### ¿Qué es?

Una **subconsulta** es una consulta dentro de otra, entre paréntesis. Puede devolver un valor (para compararlo), una lista (para `IN`) o servir con `EXISTS` para comprobar si hay filas. Una **CTE** (*Common Table Expression*, expresión de tabla común) se escribe con `WITH nombre AS (...)` y es una consulta con nombre que usas después como si fuera una tabla, para dividir una consulta compleja en pasos legibles.

### ¿Para qué sirve?

Para resolver preguntas en dos pasos («más caro que la media», «clientes con pedidos pendientes») y para ordenar consultas largas.

### ¿Por qué lo necesito?

Muchas preguntas de negocio necesitan un dato intermedio que no está en la tabla.

### ¿Cómo funciona?

| Forma | Qué hace |
| --- | --- |
| `WHERE x > (SELECT ...)` | La subconsulta devuelve **un** valor |
| `WHERE x IN (SELECT ...)` | La subconsulta devuelve una **lista** |
| `WHERE EXISTS (SELECT 1 ...)` | ¿Hay **alguna** fila? |
| `WITH nombre AS (SELECT ...) SELECT ... FROM nombre` | CTE: consulta con nombre |

### Primero, sin código: resolver en dos pasos

@fig h5-9 | Figura 5.9-a. Sin código: una subconsulta es una pregunta dentro de otra.

**Qué ves en la imagen.** Paso 1: la pregunta «más caros que la media» necesita un dato que no está en la tabla. Paso 2: se calcula primero la media (22,0875): esa es la subconsulta. Paso 3: se compara cada precio con ese valor y quedan Mochila y Cartera.

### Paso a paso: ahora con código

1. **Escribe la pregunta interna** como una consulta independiente y comprueba que funciona.
2. **Colócala entre paréntesis** dentro de la consulta externa.
3. **Prueba `IN` y `NOT EXISTS`**.
4. **Reescribe una consulta larga con CTE**, nombrando cada paso.

### Código y resultado

@demo r5-9a | Figura 5.9-b. Captura real: subconsulta de un valor, de una lista y con `NOT EXISTS`.

**Qué ves en la imagen.** `precio_eur > (SELECT avg(...))` devuelve los productos más caros que la media (26,33): Mochila, Sudadera y Zapatillas. `id IN (SELECT cliente_id FROM pedidos WHERE estado = 'pendiente')` devuelve los clientes con pedidos pendientes (Sara, Raúl, Elena y Ana). `NOT EXISTS` devuelve a los clientes que **no** tienen ningún pedido: Tomás Cano.

@demo r5-9b | Figura 5.9-c. Captura real: una CTE que calcula el gasto por cliente y una consulta que la usa.

**Qué ves en la imagen.** `WITH gasto AS (...)` define un paso con nombre: el gasto total de cada cliente sin contar pedidos cancelados. La consulta principal une ese paso con `clientes` y deja los que han gastado más de 60 euros, ordenados. Leída de arriba abajo es una receta: primero el gasto, luego los nombres.

### Ejemplo sencillo

`SELECT nombre FROM productos WHERE precio_eur = (SELECT max(precio_eur) FROM productos);` devuelve el producto más caro.

### Ejemplo real

Un informe mensual se escribe como una cadena de CTE: ventas del mes, ventas del mes anterior y, al final, la comparación.

### Profundizando

**`EXISTS` frente a `IN`.** `EXISTS` suele ser más eficiente con tablas grandes y no tiene el problema de `NOT IN` con NULL (punto 5.4).

**Subconsultas correlacionadas.** Una subconsulta que usa columnas de la consulta externa (como `p.cliente_id = c.id`) se ejecuta, en principio, una vez por fila: es potente, pero conviene vigilar el rendimiento (Parte 18).

**CTE y rendimiento.** En PostgreSQL moderno, las CTE sencillas se optimizan como subconsultas normales; son sobre todo una herramienta de legibilidad.

**Subconsultas en `FROM`.** `FROM (SELECT ...) AS t` usa el resultado de una consulta como tabla.

### Ejercicio

1. Productos más baratos que el precio medio de su propia categoría (subconsulta correlacionada).
2. Clientes que nunca han hecho un pedido cancelado.
3. Reescribe el ejercicio 1 con una CTE que calcule la media por categoría.

### Solución

1. `SELECT nombre FROM productos p WHERE precio_eur < (SELECT avg(precio_eur) FROM productos WHERE categoria = p.categoria);`
2. `SELECT nombre FROM clientes c WHERE NOT EXISTS (SELECT 1 FROM pedidos WHERE cliente_id = c.id AND estado = 'cancelado');`
3. `WITH medias AS (SELECT categoria, avg(precio_eur) AS media FROM productos GROUP BY categoria) SELECT p.nombre FROM productos p JOIN medias m ON m.categoria = p.categoria WHERE p.precio_eur < m.media;`

### Error habitual

Usar `NOT IN` con una subconsulta que puede contener NULL, o escribir una subconsulta que devuelve varias filas donde se espera un valor.

```sql
-- Falla: la subconsulta devuelve más de una fila
SELECT nombre FROM productos WHERE precio_eur = (SELECT precio_eur FROM productos);
```

### Buena práctica

Divide las consultas largas en CTE con nombres que cuenten lo que hace cada paso, y prefiere `NOT EXISTS` a `NOT IN`.

### Comprobación

Ejecuta la subconsulta sola y comprueba que devuelve lo que crees antes de meterla en la consulta externa.

## 5.10 Condiciones y valores nulos: CASE, COALESCE y NULLIF

### ¿Qué es?

`CASE` es un «si... entonces... si no...» dentro de una consulta: devuelve un valor u otro según condiciones. `COALESCE(a, b, ...)` devuelve el primer valor que **no sea NULL**. `NULLIF(a, b)` devuelve NULL si `a` y `b` son iguales, y `a` en caso contrario.

### ¿Para qué sirve?

`CASE` clasifica y etiqueta datos (barato, medio, caro). `COALESCE` pone un valor de relleno donde falta un dato. `NULLIF` evita divisiones por cero y convierte «valores centinela» en NULL.

### ¿Por qué lo necesito?

Los datos reales tienen huecos y hay que presentarlos de forma legible, y los NULL contagian los cálculos (punto 1.6): estas tres herramientas los controlan.

### ¿Cómo funciona?

```sql
CASE WHEN condicion1 THEN valor1
     WHEN condicion2 THEN valor2
     ELSE valor_por_defecto END
COALESCE(columna, valor_si_es_null)
NULLIF(valor, valor_a_convertir_en_null)
```

El `CASE` evalúa las condiciones **en orden** y se queda con la primera verdadera.

### Primero, sin código: clasificar a mano

Con la lista de productos delante, decide para cada uno su gama: menos de 10 euros, «barato»; menos de 30, «medio»; el resto, «caro». Es lo que haría un `CASE`. Y para los clientes sin teléfono, escribe «sin teléfono»: es lo que hace `COALESCE`.

### Paso a paso: ahora con código

1. **Clasifica** los productos con `CASE`.
2. **Sustituye los NULL** de teléfono y ciudad con `COALESCE`.
3. **Evita una división por cero** con `NULLIF`.

### Código y resultado

@demo r5-10a | Figura 5.10-a. Captura real: `CASE`, `COALESCE` y `NULLIF`.

**Qué ves en la imagen.** `CASE` etiqueta cada producto: Calcetines (4,50) y Gorra (9,90) son «barato», Botella, Camiseta y Cartera «medio», y Mochila, Sudadera y Zapatillas «caro». `COALESCE` muestra «sin teléfono» o «—» donde el dato era NULL (Luis, Sara y Tomás sin teléfono; Tomás sin ciudad). `NULLIF(0, 0)` devuelve NULL, y por eso `10 / NULLIF(0, 0)` da NULL en lugar de un error de división por cero.

### Ejemplo sencillo

`SELECT COALESCE(telefono, 'sin dato') FROM clientes;` rellena los huecos.

### Ejemplo real

Un informe de clientes muestra «Sin ciudad» donde la ciudad es NULL, y clasifica cada cliente en «nuevo» o «antiguo» según su fecha de alta, con un `CASE`.

### Profundizando

**`CASE` en agregaciones.** `sum(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END)` cuenta condicionalmente; PostgreSQL también ofrece `FILTER`.

**`COALESCE` con varios argumentos.** `COALESCE(movil, fijo, 'sin teléfono')` prueba uno tras otro.

**Cuidado con los tipos.** Todos los valores de un `CASE` o `COALESCE` deben tener tipos compatibles.

### Ejercicio

1. Etiqueta los pedidos como «cerrado» (entregado o cancelado) o «abierto».
2. Muestra la ciudad de cada cliente, o «desconocida».
3. Calcula el precio medio por producto vendido evitando la división por cero cuando no haya unidades.

### Solución

1. `SELECT id, CASE WHEN estado IN ('entregado', 'cancelado') THEN 'cerrado' ELSE 'abierto' END AS situacion FROM pedidos;`
2. `SELECT nombre, COALESCE(ciudad, 'desconocida') FROM clientes;`
3. `SELECT producto_id, sum(cantidad * precio_venta) / NULLIF(sum(cantidad), 0) FROM lineas_pedido GROUP BY producto_id;`

### Error habitual

Olvidar el `ELSE` (devuelve NULL silenciosamente) o usar `COALESCE` para ocultar NULL que en realidad indican un problema.

```sql
-- Sin ELSE: los productos de más de 30 euros salen con gama NULL
SELECT nombre, CASE WHEN precio_eur < 30 THEN 'accesible' END FROM productos;
```

### Buena práctica

Incluye siempre un `ELSE` explícito y no uses `COALESCE` para tapar datos que deberían existir.

### Comprobación

Comprueba que ninguna fila del resultado de un `CASE` queda con NULL por olvidar un caso.

## 5.11 Funciones de texto, numéricas y de fecha

### ¿Qué es?

PostgreSQL incluye cientos de **funciones** para transformar valores: de texto (`upper`, `lower`, `length`, `substring`, `replace`, `trim`, `split_part`), numéricas (`round`, `ceil`, `floor`, `abs`, `power`, `%`) y de fecha (`extract`, `to_char`, `date_trunc`, `age`, suma y resta de fechas).

### ¿Para qué sirve?

Para formatear, limpiar y calcular datos en la propia consulta: pasar a mayúsculas, extraer el usuario de un email, calcular el IVA, agrupar por mes.

### ¿Por qué lo necesito?

Casi toda consulta real transforma algún dato. Hacerlo en la base de datos evita traer datos de más a la aplicación.

### ¿Cómo funciona?

Se usan dentro del `SELECT`, `WHERE`, `ORDER BY` o `GROUP BY`. Funciones y operadores habituales:

| Familia | Ejemplos |
| --- | --- |
| Texto | `upper`, `lower`, `length`, `substring(x FROM n FOR m)`, `replace`, `trim`, `split_part`, `position`, el operador de concatenación |
| Números | `round(x, n)`, `ceil`, `floor`, `abs`, `power`, `%` (resto) |
| Fechas | `extract(month FROM f)`, `to_char(f, 'DD/MM/YYYY')`, `date_trunc('month', f)`, `age(f1, f2)`, `f + 30` |

**Atención a la división de enteros**: `7 / 2` da 3 (descarta decimales); `7 / 2.0` da 3.5.

### Primero, sin código: transformar a mano

Coge un email (`marta@ejemplo.com`) y obtén a mano la parte anterior a la arroba («marta»): es lo que hace `split_part(email, '@', 1)`. Coge una fecha (12/01/2026) y escribe el mes (1) y el primer día de ese mes (01/01/2026): `extract` y `date_trunc`.

### Paso a paso: ahora con código

1. **Prueba las funciones de texto** sobre clientes.
2. **Prueba las funciones numéricas**, incluida la división de enteros.
3. **Prueba las de fecha** sobre los pedidos, y agrupa por mes.

### Código y resultado

@demo r5-11a | Figura 5.11-a. Captura real: funciones de texto.

**Qué ves en la imagen.** `upper` y `lower` cambian mayúsculas; `length` cuenta caracteres (10 en «Luis Pérez»); `substring(nombre FROM 1 FOR 3)` toma los tres primeros; `||` concatena un texto compuesto. En la segunda consulta, `replace` cambia el dominio del email, `trim` quita espacios, `split_part(email, '@', 1)` toma la parte anterior a la arroba («marta») y `position('@' IN email)` da la posición de la arroba (6).

@demo r5-11b | Figura 5.11-b. Captura real: funciones numéricas y la división de enteros.

**Qué ves en la imagen.** `round(19.956, 2)` da 19,96; `ceil` y `floor` redondean hacia arriba y hacia abajo (20 y 19); `abs(-5)` da 5; `17 % 5` da 2 (el resto); `power(2, 10)` da 1024. Fíjate: `7 / 2` da **3** (división entera) y `7 / 2.0` da 3,5. La segunda consulta calcula el IVA y el total con IVA de los accesorios, redondeando a dos decimales.

@demo r5-11c | Figura 5.11-c. Captura real: funciones de fecha.

**Qué ves en la imagen.** Del pedido del 12/01/2026: `extract` da el mes (1) y el año (2026); `to_char` lo formatea como `12/01/2026`; `fecha + 30` suma 30 días; `date_trunc('month', fecha)` da el primer día del mes. La segunda consulta agrupa los pedidos por mes (enero 2, febrero 4, marzo 6). La tercera: `age` da la antigüedad entre dos fechas (4 meses y 17 días) y restar dos fechas da el número de días entre ellas (78).

### Ejemplo sencillo

`SELECT upper('hola');` devuelve `HOLA`.

### Ejemplo real

Un panel agrupa las ventas por mes con `date_trunc('month', fecha)`, y un formulario de login compara emails con `lower(email) = lower($1)` para ignorar mayúsculas.

### Profundizando

**Zonas horarias.** Con `timestamptz`, `date_trunc` y `extract` usan la zona horaria de la sesión (punto 3.1).

**Mayúsculas y acentos.** `lower`/`upper` respetan la configuración de idioma; para búsquedas sin acentos existe la extensión `unaccent` (Parte 6).

**Funciones en `WHERE` e índices.** `WHERE lower(email) = ...` no usa un índice normal sobre `email`; hace falta un índice sobre la expresión (`CREATE INDEX ... ON clientes (lower(email))`, punto 5.14).

### Ejercicio

1. Muestra el nombre de los clientes en mayúsculas y la longitud del nombre.
2. Cuenta los pedidos por año y mes.
3. Muestra los pedidos con su fecha formateada `DD-MM-YYYY` y a 15 días vista.

### Solución

1. `SELECT upper(nombre), length(nombre) FROM clientes;`
2. `SELECT extract(year FROM fecha) AS anio, extract(month FROM fecha) AS mes, count(*) FROM pedidos GROUP BY 1, 2 ORDER BY 1, 2;`
3. `SELECT id, to_char(fecha, 'DD-MM-YYYY') AS fecha, fecha + 15 AS dentro_de_15_dias FROM pedidos;`

### Error habitual

Dividir enteros esperando decimales, y usar funciones sobre columnas indexadas esperando que el índice funcione.

```sql
-- Da 0, no 0.5
SELECT 1 / 2;
```

### Buena práctica

Fuerza decimales cuando los necesites (`/ 2.0` o `::numeric`) y redondea al presentar, no al calcular.

### Comprobación

Verifica con calculadora el resultado de una función numérica y de una de fecha.

## 5.12 Funciones de ventana

### ¿Qué es?

Una **función de ventana** calcula un valor para cada fila **mirando a un grupo de filas relacionadas** (su «ventana»), pero **sin colapsar las filas** como hace `GROUP BY`. Se escribe con `OVER (...)`. Con `PARTITION BY` se divide en grupos y con `ORDER BY` se define el orden dentro de cada grupo.

### ¿Para qué sirve?

Para rankings («el producto más caro de cada categoría»), comparaciones con el grupo (diferencia respecto a la media de su categoría), valores anterior y siguiente, y acumulados.

### ¿Por qué lo necesito?

Con `GROUP BY` perdías el detalle (una fila por grupo). Las ventanas permiten ver a la vez el detalle y el resumen.

### ¿Cómo funciona?

| Función | Qué devuelve |
| --- | --- |
| `row_number()` | Número de fila dentro de la partición (1, 2, 3...) |
| `rank()` | Posición con empates (1, 2, 2, 4) |
| `lag(x)` / `lead(x)` | Valor de la fila anterior / siguiente |
| `sum(x) OVER (ORDER BY ...)` | Acumulado hasta la fila actual |
| `avg(x) OVER (PARTITION BY ...)` | Media del grupo, repetida en cada fila |

### Primero, sin código: la «ventana» en papel

Imagina los productos de cada categoría separados por una raya. En cada grupo ordénalos por precio y numera 1, 2, 3... Eso es `row_number() OVER (PARTITION BY categoria ORDER BY precio_eur DESC)`: las filas siguen siendo las mismas, solo has añadido una columna calculada mirando a su grupo.

### Paso a paso: ahora con código

1. **Numera** los productos por categoría con `row_number`.
2. **Compara cada producto con la media de su categoría**.
3. **Mira el valor anterior y siguiente** con `lag` y `lead`.
4. **Calcula un acumulado**.

### Código y resultado

@demo r5-12a | Figura 5.12-a. Captura real: ranking por categoría y comparación con la media del grupo.

**Qué ves en la imagen.** `row_number()` con `PARTITION BY categoria` numera cada producto dentro de su categoría por precio descendente (1 = el más caro de su grupo). `rank() OVER (ORDER BY precio_eur DESC)` da el ranking global. La segunda consulta añade, sin colapsar filas, la media de la categoría y la diferencia de cada producto con ella (por ejemplo, la Botella está 11,50 por debajo de la media de accesorios).

@demo r5-12b | Figura 5.12-b. Captura real: `lag` y `lead`, y un acumulado.

**Qué ves en la imagen.** Para los pedidos de Ana, `lag(fecha)` muestra la fecha del pedido anterior y `lead(fecha)` la del siguiente (el primero no tiene anterior; el último no tiene siguiente: NULL). La segunda consulta suma las ventas de cada día y, con `sum(...) OVER (ORDER BY fecha)`, el **acumulado**: cada fila suma lo de las anteriores hasta llegar a 633,40 euros.

### Ejemplo sencillo

`SELECT nombre, rank() OVER (ORDER BY precio_eur DESC) FROM productos;` da el puesto de cada producto por precio.

### Ejemplo real

Un panel muestra «tus ventas de este mes frente al mes anterior» usando `lag`, y un ranking de vendedores con `rank()`.

### Profundizando

**`row_number` frente a `rank` y `dense_rank`.** `row_number` nunca repite; `rank` repite en empates y salta números; `dense_rank` repite sin saltar.

**Marcos de ventana.** `ROWS BETWEEN ... AND ...` define cuántas filas entran en la ventana (por ejemplo, media móvil de 3 días).

**Los 3 mejores por grupo.** Se resuelve numerando con `row_number()` en una subconsulta o CTE y filtrando `WHERE puesto <= 3` fuera.

**No se pueden usar en `WHERE`.** Las ventanas se calculan después de `WHERE`; para filtrar por ellas, usa una subconsulta o CTE.

### Ejercicio

1. Para cada pedido, el importe total y su posición entre todos los pedidos por importe.
2. El producto más caro de cada categoría (usa `row_number` y una CTE).

### Solución

1. `SELECT pedido_id, sum(cantidad*precio_venta) AS total, rank() OVER (ORDER BY sum(cantidad*precio_venta) DESC) FROM lineas_pedido GROUP BY pedido_id;`
2. `WITH r AS (SELECT nombre, categoria, row_number() OVER (PARTITION BY categoria ORDER BY precio_eur DESC) AS n FROM productos) SELECT nombre, categoria FROM r WHERE n = 1;`

### Error habitual

Intentar filtrar por una ventana en `WHERE`, o confundir `OVER (PARTITION BY ...)` con `GROUP BY` (la ventana no reduce filas).

```sql
-- Falla: las ventanas no se pueden usar en WHERE
SELECT nombre FROM productos WHERE row_number() OVER (ORDER BY precio_eur) = 1;
```

### Buena práctica

Pon un `ORDER BY` completo dentro de `OVER` cuando uses `row_number`, `lag` o acumulados, para que el resultado sea determinista.

### Comprobación

Comprueba a mano que el primer puesto de cada grupo es el que esperas.

## 5.13 Consultas recursivas: CTE recursivas

### ¿Qué es?

Una **CTE recursiva** (`WITH RECURSIVE`) es una consulta que **se llama a sí misma** para recorrer estructuras jerárquicas: categorías con subcategorías, empleados con jefes, carpetas dentro de carpetas.

### ¿Para qué sirve?

Para consultar árboles de profundidad desconocida, donde un `JOIN` fijo no basta («todas las subcategorías, a cualquier nivel»).

### ¿Por qué lo necesito?

Las jerarquías aparecen continuamente (menús, categorías, organigramas, comentarios con respuestas) y no se pueden expresar con un número fijo de uniones.

### ¿Cómo funciona?

Una CTE recursiva tiene dos partes unidas con `UNION ALL`: la **parte base** (los puntos de partida, como la raíz del árbol) y la **parte recursiva**, que se une con lo ya obtenido para dar el siguiente nivel, hasta que no hay más filas nuevas.

### Primero, sin código: recorrer un árbol en papel

Dibuja el árbol: «Tienda» arriba; «Ropa» y «Accesorios» debajo; «Camisetas» y «Sudaderas» bajo «Ropa»... Empieza por la raíz (nivel 1), luego escribe sus hijos (nivel 2), luego los hijos de esos (nivel 3), hasta que no queden más. Es exactamente el proceso de la consulta.

### Paso a paso: ahora con código

1. **Crea una tabla** de categorías con una clave `padre_id` que apunta a la misma tabla.
2. **Inserta un árbol** de varios niveles.
3. **Escribe la parte base**: las categorías sin padre.
4. **Escribe la parte recursiva**: las categorías cuyo padre ya está en el resultado.
5. **Muestra el nivel y la ruta**.

### Código y resultado

@demo r5-13a | Figura 5.13-a. Captura real: el árbol de categorías recorrido con `WITH RECURSIVE`.

**Qué ves en la imagen.** La parte base selecciona la raíz (`WHERE padre_id IS NULL`), con nivel 1 y ruta «Tienda». La parte recursiva une cada categoría con su padre ya encontrado, suma 1 al nivel y añade su nombre a la ruta. El resultado, ordenado por ruta, muestra el árbol completo con siete categorías en cuatro niveles, incluida «Camisetas de manga larga», que está a cuatro niveles de profundidad.

### Ejemplo sencillo

`WITH RECURSIVE n AS (SELECT 1 AS i UNION ALL SELECT i + 1 FROM n WHERE i < 5) SELECT * FROM n;` genera los números del 1 al 5.

### Ejemplo real

Un sistema de comentarios con respuestas anidadas usa una CTE recursiva para recuperar un hilo completo en una sola consulta.

### Profundizando

**Condición de parada.** Si los datos tienen ciclos (A es padre de B y B de A), la consulta no termina: añade una condición de profundidad máxima o una comprobación de ciclos.

**Recorrer hacia arriba.** Se puede partir de un hijo y subir hasta la raíz para obtener todos sus ancestros.

**Alternativas.** Para jerarquías muy grandes existen representaciones alternativas (rutas materializadas, tipo `ltree`); se tratan en la Parte 6.

### Ejercicio

1. Genera los números pares del 2 al 10 con una CTE recursiva.
2. Muestra todos los descendientes de «Ropa» (ayuda: parte base `WHERE nombre = 'Ropa'`).

### Solución

1. `WITH RECURSIVE p AS (SELECT 2 AS n UNION ALL SELECT n + 2 FROM p WHERE n < 10) SELECT n FROM p;`
2. Parte base: `SELECT id, nombre FROM categorias WHERE nombre = 'Ropa'`; parte recursiva: `SELECT c.id, c.nombre FROM categorias c JOIN arbol a ON c.padre_id = a.id`.

### Error habitual

Olvidar la condición de parada (bucle infinito) o unir con la tabla equivocada en la parte recursiva.

```sql
-- Bucle infinito: nunca deja de generar filas
WITH RECURSIVE x AS (SELECT 1 AS i UNION ALL SELECT i + 1 FROM x) SELECT i FROM x LIMIT 5;
```

### Buena práctica

Asegura siempre que la recursión termina (condición explícita o datos sin ciclos) y prueba primero con pocos datos.

### Comprobación

Dibuja el árbol y compara con el resultado de la consulta: mismas filas, mismos niveles.

## 5.14 Vistas, índices y restricciones

### ¿Qué es?

Una **vista** es una consulta guardada con nombre que se usa como una tabla. Un **índice** acelera búsquedas (punto 1.8). Una **restricción** es una regla que la base vigila (punto 3.5). Todos se crean (y se cambian) con `CREATE` y `ALTER`.

### ¿Para qué sirve?

Las vistas simplifican consultas complejas y ocultan columnas; los índices dan velocidad; las restricciones dan seguridad.

### ¿Por qué lo necesito?

Son los tres pilares de una base de datos mantenible: legible (vistas), rápida (índices) y fiable (restricciones).

### ¿Cómo funciona?

```sql
CREATE VIEW nombre AS SELECT ...;
CREATE [UNIQUE] INDEX nombre ON tabla (columna | expresión);
ALTER TABLE tabla ADD CONSTRAINT nombre CHECK (...);
ALTER TABLE tabla ADD COLUMN columna tipo;
```

La vista **no guarda datos**: ejecuta su consulta cada vez que se usa. Un índice sí ocupa espacio y se actualiza con cada cambio.

### Primero, sin código: decide qué necesita cada tabla

Para cada tabla pregúntate: ¿qué consulta compleja repito constantemente? (vista). ¿Por qué columnas busco o uno? (índices). ¿Qué reglas siempre deben cumplirse? (restricciones).

### Paso a paso: ahora con código

1. **Crea una vista** con una consulta de varias tablas y consúltala.
2. **Crea índices** sobre las columnas de búsqueda (y uno único sobre una expresión).
3. **Lista los índices** con `\di`.
4. **Añade restricciones** y una columna con `ALTER TABLE`.

### Código y resultado

@demo r5-14a | Figura 5.14-a. Captura real: una vista que calcula el total de cada pedido.

**Qué ves en la imagen.** `CREATE VIEW ventas_por_pedido AS ...` guarda la consulta que une pedidos, clientes y líneas y calcula el total. A partir de entonces se consulta como una tabla (`SELECT * FROM ventas_por_pedido WHERE estado = 'pendiente'`): los cuatro pedidos pendientes con su total. `\dv` lista las vistas.

@demo r5-14b | Figura 5.14-b. Captura real: índices, un índice único sobre una expresión y restricciones nuevas.

**Qué ves en la imagen.** Se crean dos índices normales (sobre `cliente_id` y `fecha` de `pedidos`) y uno **único sobre `lower(nombre)`**: impide dos productos con el mismo nombre aunque difieran en mayúsculas. `\di` lista todos los índices: los de clave primaria y única que PostgreSQL creó solo y los nuestros. `ALTER TABLE ... ADD CONSTRAINT` añade una regla a una tabla existente, y `ADD COLUMN` añade una columna (`actualizado_en`, que usaremos con un trigger).

### Ejemplo sencillo

`CREATE VIEW clientes_madrid AS SELECT * FROM clientes WHERE ciudad = 'Madrid';`

### Ejemplo real

La aplicación de un negocio consulta una vista `ventas_por_pedido` en lugar de repetir una consulta de cuatro uniones en veinte sitios.

### Profundizando

**Vistas materializadas.** Una vista normal recalcula siempre; una **materializada** guarda el resultado y se refresca bajo demanda (Parte 6): útil para informes pesados.

**Vistas y seguridad.** Una vista puede exponer solo algunas columnas de una tabla y darse permiso solo sobre ella (Parte 17).

**Cuántos índices.** Cada índice acelera lecturas y ralentiza escrituras: crea los necesarios, mide (Parte 18) y elimina los que no se usen.

### Ejercicio

1. Crea una vista de productos activos con stock.
2. Crea un índice para acelerar la búsqueda de pedidos por estado.
3. Añade una restricción que impida precios de venta superiores a 10.000.

### Solución

1. `CREATE VIEW productos_disponibles AS SELECT * FROM productos WHERE activo AND stock > 0;`
2. `CREATE INDEX idx_pedidos_estado ON pedidos (estado);`
3. `ALTER TABLE lineas_pedido ADD CONSTRAINT precio_razonable CHECK (precio_venta <= 10000);`

### Error habitual

Crear índices «por si acaso» en todas las columnas, o añadir una restricción que los datos actuales ya incumplen (falla; punto 3.5).

```sql
-- Falla si ya hay filas que no cumplen
ALTER TABLE productos ADD CONSTRAINT stock_pequeno CHECK (stock < 5);
```

### Buena práctica

Dale nombres claros a vistas, índices y restricciones (`idx_tabla_columna`) y documenta por qué existen.

### Comprobación

Con `\d tabla` verifica que los índices y restricciones creados aparecen.

## 5.15 Transacciones: BEGIN, COMMIT y ROLLBACK

### ¿Qué es?

Una **transacción** es un grupo de sentencias que se ejecutan **como una sola operación: o todas, o ninguna**. Empieza con `BEGIN`, se confirma con `COMMIT` y se deshace con `ROLLBACK`.

### ¿Para qué sirve?

Para que los cambios relacionados no queden a medias. Ejemplo clásico: una transferencia resta dinero de una cuenta y lo suma a otra; si falla la segunda, la primera debe deshacerse.

### ¿Por qué lo necesito?

Sin transacciones, un fallo (un error, un corte de luz) entre dos sentencias deja los datos incoherentes: un pedido sin líneas, un stock descontado sin venta.

### ¿Cómo funciona?

Las transacciones cumplen las propiedades **ACID**:

| Letra | Propiedad | Significado |
| --- | --- | --- |
| A | Atomicidad | Todo o nada |
| C | Consistencia | Los datos siempre cumplen las restricciones |
| I | Aislamiento | Las transacciones simultáneas no se estorban |
| D | Durabilidad | Lo confirmado sobrevive a un fallo |

Dentro de una transacción, **si una sentencia falla, toda la transacción queda «abortada»** y solo se acepta `ROLLBACK` (o `ROLLBACK TO` un punto de guardado). Un **`SAVEPOINT`** marca un punto al que volver sin deshacer todo. Fuera de un bloque `BEGIN`, cada sentencia es su propia transacción (se confirma sola).

### Primero, sin código: la libreta con lápiz

Imagina que apuntas los cambios en una libreta **a lápiz**. Si todo va bien, repasas a bolígrafo (`COMMIT`). Si algo sale mal, borras todo lo hecho a lápiz (`ROLLBACK`) y la libreta queda como estaba.

### Paso a paso: ahora con código

1. **Abre una transacción** con `BEGIN`: el prompt cambia a `tienda=*#`.
2. **Haz un cambio** y compruébalo dentro de la transacción.
3. **Deshazlo con `ROLLBACK`** y comprueba que nada cambió.
4. **Provoca un error dentro de la transacción** y observa que queda abortada.
5. **Usa un `SAVEPOINT`** para deshacer solo una parte y confirmar el resto.

### Código y resultado

@demo r5-15a | Figura 5.15-a. Captura real (sesión interactiva): un cambio dentro de una transacción que se deshace con `ROLLBACK`.

**Qué ves en la imagen.** Tras `BEGIN`, el prompt pasa a `tienda=*#` (el asterisco indica «transacción abierta»). El `UPDATE` baja el stock de la Camiseta a 11, y dentro de la transacción se ve 11. Tras `ROLLBACK`, el stock vuelve a 12: el cambio nunca existió para nadie más.

@demo r5-15b | Figura 5.15-b. Captura real (sesión interactiva): un error aborta la transacción entera.

**Qué ves en la imagen.** Dentro de la transacción se inserta un pedido (recibe el id 113) y después se intenta insertar una línea con cantidad 0, que incumple la restricción. El prompt cambia a `tienda=!#` (`!` significa «transacción abortada»): **cualquier otra sentencia** (como `SELECT 1`) responde `current transaction is aborted, commands ignored until end of transaction block`. Solo cabe `ROLLBACK`. Tras él, el recuento de pedidos sigue siendo 12: el pedido 113 no existe. Eso es la atomicidad: el pedido y su línea fallida se deshacen **juntos**.

@demo r5-15c | Figura 5.15-c. Captura real (sesión interactiva): un `SAVEPOINT` permite deshacer solo la parte errónea.

**Qué ves en la imagen.** Se descuenta stock a la Mochila (de 5 a 3) y se marca un punto de guardado. Un segundo `UPDATE` erróneo (stock −999) incumple la restricción y aborta la transacción. `ROLLBACK TO antes_del_error` vuelve al punto de guardado **sin perder el primer cambio**: el prompt vuelve a `tienda=*#`. `COMMIT` confirma, y la Mochila queda con stock 3.

### Ejemplo sencillo

`BEGIN; UPDATE ...; UPDATE ...; COMMIT;` aplica los dos cambios juntos o ninguno.

### Ejemplo real

Al crear un pedido, la aplicación abre una transacción: inserta el pedido, inserta sus líneas, descuenta el stock y confirma. Si algo falla, nada se guarda.

### Profundizando

**Aislamiento.** Mientras una transacción está abierta, las demás **no ven** sus cambios hasta el `COMMIT` (en el nivel por defecto, *read committed*). Esto evita lecturas de datos a medias; existen niveles más estrictos para casos delicados.

**Bloqueos.** Si dos transacciones modifican la misma fila, la segunda **espera** a que la primera termine. Las transacciones largas retienen bloqueos: mantenlas breves.

**Autocommit.** Fuera de `BEGIN`, cada sentencia se confirma sola: un `UPDATE` suelto es una transacción de una sentencia.

**Aplicaciones.** Los controladores (por ejemplo, el de Node.js) ofrecen `BEGIN`/`COMMIT`/`ROLLBACK` desde el código (Parte 15).

### Ejercicio

1. Abre una transacción, borra todos los productos inactivos, comprueba con un `SELECT` que han desaparecido y deshaz el cambio.
2. ¿Qué pasa si cierras `psql` con una transacción abierta?
3. ¿Qué indica el prompt `tienda=!#`?

### Solución

1. `BEGIN; DELETE FROM productos WHERE NOT activo; SELECT count(*) FROM productos; ROLLBACK;` (el borrado puede fallar si hay líneas que lo referencian; la transacción lo deshace igualmente).
2. La transacción se deshace automáticamente (nada se confirma).
3. Que la transacción está abortada por un error y solo admite `ROLLBACK` (o `ROLLBACK TO`).

### Error habitual

Dejar una transacción abierta durante mucho tiempo (retiene bloqueos), o creer que `ROLLBACK` recupera los números de identidad gastados (no lo hace).

```sql
-- Olvidar COMMIT: los demás nunca verán el cambio
BEGIN;
UPDATE productos SET stock = 0 WHERE id = 1;
-- (olvido de COMMIT)
```

### Buena práctica

Agrupa en una transacción todo lo que debe cumplirse junto, mantenla corta y haz siempre `COMMIT` o `ROLLBACK` explícitos.

### Comprobación

Tras un `ROLLBACK`, comprueba con un `SELECT` que los datos están como antes.

## 5.16 Programar dentro de la base de datos: funciones, procedimientos y triggers

### ¿Qué es?

Una **función** es un fragmento de código guardado en la base de datos que recibe datos y devuelve un resultado. Un **procedimiento** es similar pero se invoca con `CALL` y puede controlar transacciones y no devuelve valor. Un **trigger** (*disparador*) es una función que se ejecuta **automáticamente** cuando ocurre un evento (`INSERT`, `UPDATE`, `DELETE`) sobre una tabla. PostgreSQL usa un lenguaje llamado **PL/pgSQL** para programarlas.

### ¿Para qué sirve?

Para encapsular lógica que debe cumplirse siempre (calcular un total, marcar cuándo se modificó una fila, validar una operación) aunque la modifique cualquier aplicación.

### ¿Por qué lo necesito?

Es la herramienta con la que mantienes coherentes los datos desnormalizados (punto 4.6) y automatizas reglas que no se pueden expresar con una simple restricción.

### ¿Cómo funciona?

- **Función SQL**: `CREATE FUNCTION nombre(parámetros) RETURNS tipo AS $$ ...consulta... $$ LANGUAGE sql;`
- **Función PL/pgSQL**: lo mismo con `LANGUAGE plpgsql` y un cuerpo `BEGIN ... END;` con variables, condiciones y bucles. Los `$$` delimitan el cuerpo.
- **Trigger**: dos piezas. (1) una función que devuelve `trigger` y usa `NEW` (la fila nueva) y `OLD` (la antigua); (2) un `CREATE TRIGGER` que dice cuándo se dispara: `BEFORE`/`AFTER`, sobre `INSERT`/`UPDATE`/`DELETE`, para cada fila.
- **Procedimiento**: `CREATE PROCEDURE ... AS $$ ... $$ LANGUAGE plpgsql;` y se llama con `CALL`.

### Primero, sin código: la regla escrita en español

Antes de programar, escribe la regla: «al modificar un cliente, anotar la fecha y hora del cambio en su columna `actualizado_en`». Identifica el **evento** (modificar un cliente), el **momento** (antes de guardar) y la **acción** (rellenar la columna). Es la plantilla de todo trigger.

### Paso a paso: ahora con código

1. **Crea una función SQL** que calcule el total de un pedido y úsala en consultas.
2. **Crea la función del trigger** (devuelve `trigger`, modifica `NEW`).
3. **Crea el trigger** asociado a la tabla.
4. **Provoca el evento** (un `UPDATE`) y comprueba el efecto.
5. **Crea un procedimiento** con validación y llámalo con `CALL`, incluido un caso de error.

### Código y resultado

@demo r5-16a | Figura 5.16-a. Captura real: una función que calcula el total de un pedido.

**Qué ves en la imagen.** `CREATE FUNCTION total_pedido(p_pedido integer) RETURNS numeric AS $$ ... $$ LANGUAGE sql` guarda una consulta que suma cantidad por precio de las líneas de un pedido. Se usa como cualquier función: `total_pedido(103)` da 78,45, y en la segunda consulta se aplica a cada pedido de Ana (101: 39,75; 103: 78,45; 106: 39,90; 110: 69,00).

@demo r5-16b | Figura 5.16-b. Captura real: un trigger que anota cuándo se modifica un cliente.

**Qué ves en la imagen.** La función `marcar_actualizado()` (PL/pgSQL) asigna `now()` a `NEW.actualizado_en` y devuelve `NEW` (la fila que se guardará). El `CREATE TRIGGER ... BEFORE UPDATE ... FOR EACH ROW EXECUTE FUNCTION` la conecta a `clientes`. Al modificar el teléfono de Luis, el trigger rellena su `actualizado_en` sin que el `UPDATE` lo mencione: la consulta final muestra `tiene_marca = t` para Luis y `f` para Marta, que no se tocó.

@demo r5-16c | Figura 5.16-c. Captura real: un procedimiento con validación, llamado con `CALL`.

**Qué ves en la imagen.** El procedimiento `cancelar_pedido` cancela un pedido solo si está pendiente; si no, lanza un error propio con `RAISE EXCEPTION`. `CALL cancelar_pedido(110)` funciona (`CALL`); `CALL cancelar_pedido(101)` falla con el mensaje «El pedido 101 no existe o no está pendiente» y la línea de la función donde se produjo. El `SELECT` final confirma: el 110 pasó a «cancelado» y el 101 sigue «entregado». (Esto modifica el pedido 110, y se refleja en los resultados de los puntos siguientes.)

### Ejemplo sencillo

`CREATE FUNCTION doble(x integer) RETURNS integer AS $$ SELECT x * 2 $$ LANGUAGE sql;` y `SELECT doble(21);` da 42.

### Ejemplo real

Una base de datos mantiene el total de cada pedido con un trigger sobre las líneas, para que sea imposible que el total quede desactualizado, venga el cambio de donde venga.

### Profundizando

**Cuándo usar triggers.** Son potentes y a la vez «invisibles»: quien lee el código de la aplicación no ve lo que hacen. Úsalos para reglas de integridad y auditoría, y documéntalos.

**`BEFORE` y `AFTER`.** `BEFORE` puede modificar la fila antes de guardarla (como aquí); `AFTER` actúa cuando ya se guardó (típico para auditoría o recalcular totales).

**`CREATE OR REPLACE`.** `CREATE OR REPLACE FUNCTION` modifica una función existente.

**Seguridad.** Las funciones pueden ejecutarse con los permisos de quien las crea (`SECURITY DEFINER`); es una herramienta delicada (Parte 17).

**Funciones frente a lógica en la aplicación.** La regla de oro: lo que **siempre** debe cumplirse, en la base de datos; lo que depende del flujo de la aplicación, en la aplicación.

### Ejercicio

1. Crea una función `con_iva(precio numeric)` que devuelva el precio con un 21 % de IVA redondeado a dos decimales.
2. ¿Qué evento y qué momento usarías para un trigger que impida modificar pedidos ya entregados?
3. Escribe el esqueleto de ese trigger.

### Solución

1. `CREATE FUNCTION con_iva(precio numeric) RETURNS numeric AS $$ SELECT round(precio * 1.21, 2) $$ LANGUAGE sql;`
2. Evento `UPDATE` sobre `pedidos`, momento `BEFORE` (para poder rechazarlo antes de guardar).
3. `CREATE FUNCTION bloquear_entregados() RETURNS trigger AS $$ BEGIN IF OLD.estado = 'entregado' THEN RAISE EXCEPTION 'No se puede modificar un pedido entregado'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;` y un `CREATE TRIGGER ... BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION bloquear_entregados();`

### Error habitual

Olvidar `RETURN NEW` en un trigger `BEFORE` (la fila no se guarda), o escribir triggers que se disparan a sí mismos en bucle.

```sql
-- Mal: un trigger BEFORE que no devuelve la fila impide guardarla
CREATE FUNCTION mal() RETURNS trigger AS $$ BEGIN RETURN NULL; END; $$ LANGUAGE plpgsql;
```

### Buena práctica

Mantén los triggers pequeños y previsibles, documéntalos junto a la tabla y prueba el caso normal y el caso de error.

### Comprobación

Con `\df` (funciones) y `\d tabla` (triggers de la tabla) comprueba que existen y que se disparan al provocar el evento.

## 5.17 Errores frecuentes de SQL y cómo leerlos

### ¿Qué es?

Los mensajes de error de PostgreSQL son precisos y siguen una estructura: `ERROR` (qué pasó), `LINE` y una flecha `^` (dónde), `DETAIL` (detalle) y `HINT` (pista de cómo arreglarlo).

### ¿Para qué sirve?

Aprender a leerlos convierte el 90 % de los errores en un arreglo de un minuto.

### ¿Por qué lo necesito?

Los errores son parte del trabajo diario; quien sabe leerlos avanza el doble de rápido.

### ¿Cómo funciona?

Método: (1) lee la primera línea (`ERROR:`), (2) mira la línea y la flecha, (3) lee `DETAIL` y `HINT` si existen, (4) corrige **una cosa** y repite.

### Primero, sin código: el catálogo de errores del principiante

| Mensaje | Causa más probable |
| --- | --- |
| `column "x" does not exist` | Errata en el nombre, o falta el alias de tabla |
| `column reference "x" is ambiguous` | Dos tablas tienen una columna `x`: usa `alias.x` |
| `must appear in the GROUP BY clause...` | Columna sin agrupar ni resumir |
| `operator does not exist: text = integer` | Comparas tipos distintos: convierte o usa comillas |
| `division by zero` | Divides por 0: usa `NULLIF` |
| `invalid input syntax for type ...` | El valor no encaja con el tipo |

### Paso a paso: ahora con código

1. **Provoca cada error** a propósito.
2. **Lee el mensaje** completo, con su `HINT`.
3. **Corrige** y comprueba que funciona.

### Código y resultado

@demo r5-17a | Figura 5.17-a. Captura real: seis errores típicos de SQL.

**Qué ves en la imagen.**

1. `SELECT nombres FROM clientes` → `column "nombres" does not exist`, con la pista `Perhaps you meant to reference the column "clientes.nombre"` («¿querías decir `clientes.nombre`?»).
2. `SELECT id FROM clientes c JOIN pedidos p ...` → `column reference "id" is ambiguous`: las dos tablas tienen `id`; se corrige con `c.id` o `p.id`.
3. `GROUP BY categoria` seleccionando también `nombre` → `must appear in the GROUP BY clause or be used in an aggregate function`.
4. `telefono = 600111222` → `operator does not exist: text = integer`: el teléfono es texto y se comparó con un número; se corrige con comillas: `'600111222'`.
5. `SELECT 1 / 0` → `division by zero`.
6. `precio_eur > 'caro'` → `invalid input syntax for type numeric: "caro"`.

### Ejemplo sencillo

Un `FROM clientez` produce `relation "clientez" does not exist`.

### Ejemplo real

Un informe falla en producción con `column reference "id" is ambiguous` tras añadir un `JOIN` nuevo: bastaba con prefijar con el alias.

### Profundizando

**Errores de sintaxis.** `syntax error at or near "..."` señala la palabra donde el gestor se perdió; a menudo el fallo está justo antes (una coma de más, un paréntesis sin cerrar).

**Mensajes largos.** Lee siempre de arriba abajo; la causa suele estar en la primera línea y la solución en el `HINT`.

**Depurar una consulta larga.** Ejecuta cada parte por separado (primero `FROM`/`JOIN`, luego `WHERE`...) hasta localizar la que falla.

### Ejercicio

1. Corrige: `SELECT id, nombre, count(*) FROM clientes GROUP BY nombre;`
2. Corrige: `SELECT * FROM pedidos WHERE fecha > 2026-03-01;`
3. ¿Qué error da `SELECT nombre FROM clientes WHERE;`?

### Solución

1. Falta agrupar `id` o resumirlo: `SELECT nombre, count(*) FROM clientes GROUP BY nombre;` (o quitar `id`).
2. La fecha va entre comillas: `WHERE fecha > '2026-03-01'` (sin ellas, `2026-03-01` es una resta de enteros).
3. `syntax error at or near ";"`: falta la condición después de `WHERE`.

### Error habitual

Corregir varias cosas a la vez, sin leer el mensaje.

```sql
-- Sin comillas: se interpreta como una resta (2026 - 03 - 01 = 2022)
SELECT * FROM pedidos WHERE fecha > 2026-03-01;
```

### Buena práctica

Lee el mensaje, cambia una cosa, vuelve a probar.

### Comprobación

Sabes explicar con tus palabras cada uno de los seis errores de la figura 5.17-a y su arreglo.

## 5.18 Práctica integrada: ejercicios de repaso

### ¿Qué es?

Un conjunto de consultas de negocio que juntan los conceptos de toda la parte: filtros, uniones, agrupaciones, subconsultas y ventanas.

### ¿Para qué sirve?

Para comprobar que dominas SQL como herramienta, no solo cada pieza por separado.

### ¿Por qué lo necesito?

En el trabajo real, cada pregunta de negocio mezcla varias piezas.

### ¿Cómo funciona?

Para cada pregunta: (1) escríbela en español, (2) piensa a mano qué tablas y columnas necesitas, (3) escribe la consulta pieza a pieza, (4) comprueba el resultado esperado.

### Primero, sin código: planifica cada consulta

Antes de escribir, responde: ¿qué tablas intervienen? ¿Qué las une? ¿Qué filtro aplica? ¿Hay que agrupar? ¿Cuántas filas espero?

### Paso a paso: ahora con código

1. **Plantea** la pregunta y las tablas.
2. **Escribe** primero el `FROM`/`JOIN`, después `WHERE`, `GROUP BY` y `SELECT`.
3. **Comprueba** con el resultado esperado.

### Código y resultado

@demo r5-18a | Figura 5.18-a. Captura real: tres consultas de repaso.

**Qué ves en la imagen.** (1) Los clientes de Madrid ordenados por fecha de alta: Ana, Marta y Sara. (2) Los productos sin stock: solo la Sudadera (la Gorra tiene 20 desde el punto 5.5). (3) Los tres clientes que más han gastado sin contar pedidos cancelados, uniendo clientes, pedidos y líneas y agrupando.

@demo r5-18b | Figura 5.18-b. Captura real: tres consultas más avanzadas.

**Qué ves en la imagen.** (4) Unidades vendidas por categoría (ropa 26, accesorios 9, calzado 2), sin pedidos cancelados. (5) Un ranking de clientes por gasto con `rank()` sobre una CTE; como en el punto 5.16 se canceló el pedido 110, Ana (118,20) queda segunda, detrás de Raúl (131,85). (6) El cliente que nunca ha hecho un pedido: Tomás Cano.

### Ejemplo sencillo

«¿Cuántos pedidos hay por estado?» es un `GROUP BY` de una tabla.

### Ejemplo real

El panel de un negocio es una colección de consultas como estas, cada una resuelta con filtros, uniones y agrupaciones.

### Profundizando

**Verifica con casos pequeños.** Comprueba cada consulta con pocas filas calculadas a mano.

**Lee el plan.** Cuando una consulta sea lenta, `EXPLAIN ANALYZE` te dice por qué (punto 1.8 y Parte 18).

### Ejercicio

1. Facturación total por mes (sin pedidos cancelados).
2. Los clientes que han comprado Camiseta y Mochila (ambas).
3. El producto más vendido en unidades de cada categoría.
4. Clientes sin ningún pedido entregado.

### Solución

1. `SELECT date_trunc('month', p.fecha)::date AS mes, sum(l.cantidad*l.precio_venta) FROM pedidos p JOIN lineas_pedido l ON l.pedido_id = p.id WHERE p.estado <> 'cancelado' GROUP BY 1 ORDER BY 1;`
2. `SELECT c.nombre FROM clientes c JOIN pedidos p ON p.cliente_id = c.id JOIN lineas_pedido l ON l.pedido_id = p.id JOIN productos pr ON pr.id = l.producto_id WHERE pr.nombre IN ('Camiseta', 'Mochila') GROUP BY c.nombre HAVING count(DISTINCT pr.nombre) = 2;`
3. Con una CTE que sume unidades por producto y `row_number() OVER (PARTITION BY categoria ORDER BY unidades DESC)`, quedándote con el puesto 1.
4. `SELECT nombre FROM clientes c WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id AND p.estado = 'entregado');`

### Error habitual

Escribir la consulta completa de golpe sin comprobar cada pieza, y no verificar el número de filas.

```sql
-- Mal: sin comprobar, un JOIN de más multiplica las filas y la suma sale inflada
SELECT sum(l.cantidad * l.precio_venta) FROM pedidos p JOIN lineas_pedido l ON true;
```

### Buena práctica

Construye las consultas por capas y verifica cada capa con pocas filas.

### Comprobación

Sabes resolver las seis consultas de la práctica y los cuatro ejercicios sin mirar la solución.

## Resumen de la Parte 5

- SQL es declarativo: dices qué quieres. Una sentencia se escribe en un orden y se ejecuta en otro (`FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, `LIMIT`).
- `CREATE TABLE` define la estructura; `INSERT` guarda filas (con `RETURNING` y `ON CONFLICT`); `UPDATE` y `DELETE` modifican y borran: comprueba siempre con un `SELECT` previo con el mismo `WHERE`.
- `SELECT` elige columnas; `WHERE` filtra filas; `ORDER BY`/`LIMIT` ordenan y limitan; `DISTINCT` quita repetidos.
- `count`, `sum`, `avg`, `min`, `max` con `GROUP BY` y `HAVING` resumen; `count(columna)` ignora los NULL.
- `JOIN` une tablas (INNER, LEFT, RIGHT, FULL, CROSS); `UNION`, `INTERSECT` y `EXCEPT` combinan resultados.
- Las subconsultas y las CTE resuelven preguntas en pasos; `CASE`, `COALESCE` y `NULLIF` controlan valores y NULL.
- Hay funciones de texto, número y fecha; las ventanas calculan sin colapsar filas; las CTE recursivas recorren jerarquías.
- Las vistas, índices y restricciones dan legibilidad, velocidad y seguridad.
- Las transacciones (`BEGIN`/`COMMIT`/`ROLLBACK`, `SAVEPOINT`) hacen que los cambios se apliquen enteros o ninguno (ACID).
- Las funciones, procedimientos y triggers programan lógica dentro de la base de datos.
- Los errores de PostgreSQL se leen en cuatro partes: `ERROR`, `LINE`, `DETAIL` y `HINT`.

## Glosario de la Parte 5

| Término | Significado |
| --- | --- |
| SQL | Lenguaje declarativo de las bases de datos relacionales |
| DDL / DML / DQL / TCL / DCL | Grupos de sentencias: estructura, datos, consulta, transacciones y permisos |
| Secuencia | Contador que entrega números |
| Identidad | Secuencia asociada a una columna |
| Alias | Nombre alternativo para una columna o tabla (`AS`) |
| Agregación | Función que resume varias filas en un valor |
| JOIN | Unión de filas de dos tablas por una condición |
| Subconsulta | Consulta dentro de otra |
| CTE | Consulta con nombre definida con `WITH` |
| Función de ventana | Cálculo sobre un grupo de filas sin colapsarlas (`OVER`) |
| Vista | Consulta guardada con nombre |
| Transacción | Grupo de sentencias que se aplican todas o ninguna |
| ACID | Atomicidad, consistencia, aislamiento y durabilidad |
| Savepoint | Punto de guardado dentro de una transacción |
| Trigger | Función que se ejecuta sola ante un evento sobre una tabla |
| PL/pgSQL | Lenguaje de programación de PostgreSQL |

## Mini examen de la Parte 5

1. ¿En qué orden se ejecutan `SELECT`, `FROM`, `WHERE` y `GROUP BY`?
2. ¿Qué precaución tomas antes de un `UPDATE` o `DELETE`?
3. ¿Por qué `WHERE telefono = NULL` no devuelve nada?
4. ¿Qué diferencia hay entre `WHERE` y `HAVING`?
5. ¿Qué devuelve un `LEFT JOIN` que no devuelve un `INNER JOIN`?
6. ¿Qué diferencia hay entre `UNION` y `UNION ALL`?
7. ¿Para qué sirve `COALESCE`?
8. ¿En qué se diferencia una función de ventana de un `GROUP BY`?
9. ¿Qué significa que una transacción esté «abortada» (`!#`)?
10. ¿Cuándo se dispara un trigger `BEFORE UPDATE`?

### Respuestas

1. `FROM`, `WHERE`, `GROUP BY`, y después `SELECT`.
2. Ejecutar antes un `SELECT` con el mismo `WHERE` y comprobar el número de filas; mejor dentro de una transacción.
3. Porque comparar con NULL da «desconocido», no verdadero; hay que usar `IS NULL`.
4. `WHERE` filtra filas antes de agrupar; `HAVING` filtra grupos después.
5. Las filas de la izquierda sin pareja (con NULL en las columnas de la derecha).
6. `UNION` elimina duplicados; `UNION ALL` los conserva y es más rápido.
7. Para sustituir un valor NULL por otro.
8. La ventana calcula sin reducir filas; `GROUP BY` devuelve una fila por grupo.
9. Que un error ha invalidado la transacción y solo admite `ROLLBACK` (o `ROLLBACK TO`).
10. Antes de guardar cada fila modificada, y puede cambiar esa fila.

Si has acertado 8 o más, estás listo para la Parte 6. Si no, repasa los puntos de las preguntas falladas.
