# Parte 4. Normalización

## Antes de empezar

En la Parte 3 aprendiste a construir tablas, relacionarlas y protegerlas. La normalización responde a una pregunta que viene antes: **¿están bien repartidos los datos entre las tablas?** Es el conjunto de reglas con el que se evita que los mismos datos se repitan y se contradigan.

La palabra asusta, pero la idea es muy sencilla: **cada dato debe vivir en un solo sitio**. Las «formas normales» son tres comprobaciones, de la más básica a la más fina, para saber si lo cumples.

Como en el resto del manual, cada punto tiene dos mitades: **primero sin código** (tablas dibujadas a mano, con datos de ejemplo) y **después con código** (el mismo razonamiento ejecutado en PostgreSQL, con capturas reales).

Al terminar serás capaz de:

- explicar qué problema resuelve la normalización y reconocer sus tres anomalías;
- aplicar la primera, segunda y tercera forma normal paso a paso;
- detectar dependencias entre columnas con consultas, y comprobar que no pierdes información al separar tablas;
- decidir cuándo conviene desnormalizar a propósito y cómo hacerlo sin riesgo;
- reconocer los errores de diseño más habituales.

### Cómo se organiza cada punto

**¿Qué es?**, **¿para qué sirve?**, **¿por qué lo necesito?**, **¿cómo funciona?**, **primero sin código**, **paso a paso con código**, **código y resultado** (con captura real), ejemplos, **profundizando**, ejercicio, solución, error habitual, buena práctica y comprobación.

### El caso que usaremos en toda la parte

Partimos de una «hoja» de ventas de nuestra tienda, con **todos los datos en una sola tabla**. Cada fila es un producto de un pedido. A lo largo de la parte la iremos repartiendo en tablas bien diseñadas.

## 4.1 El problema: redundancia y anomalías

### ¿Qué es?

**Redundancia** es guardar el mismo dato en más de un sitio. Parece inofensivo («copio el nombre y así lo tengo a mano»), pero provoca tres problemas, llamados **anomalías**:

- **Anomalía de modificación**: cambias un dato en un sitio y olvidas los demás; los datos se contradicen.
- **Anomalía de inserción**: no puedes guardar un dato porque falta otro que aún no existe.
- **Anomalía de borrado**: al borrar una cosa pierdes sin querer datos de otra.

### ¿Para qué sirve conocerlas?

Para reconocer, al ver una tabla, si está mal repartida. Si puedes provocar alguna de las tres anomalías, la tabla necesita rediseño.

### ¿Por qué lo necesito?

Las anomalías no se notan al principio, con pocos datos y una sola persona. Aparecen con el uso: cuando hay cientos de filas y alguien cambia un email en un sitio y no en otro. Entonces ya hay datos corruptos, y corregirlos a mano es muy caro.

### ¿Cómo funciona?

Una tabla «plana» (con todo mezclado) repite en cada fila los datos del cliente, del producto y del pedido. Esa repetición es la fuente de las tres anomalías:

| Anomalía | Causa | Ejemplo |
| --- | --- | --- |
| Modificación | El mismo dato está en varias filas | Ana tiene dos emails distintos |
| Inserción | Una fila exige datos de varias cosas a la vez | No se puede guardar un producto sin un pedido |
| Borrado | Una fila guarda datos de varias cosas a la vez | Al borrar el pedido de Luis desaparece Luis |

### Primero, sin código: las tres anomalías a mano

@fig h4-1 | Figura 4.1-a. Sin código: la tabla plana y sus tres anomalías.

**Qué ves en la imagen.** Paso 1: la tabla con todos los datos mezclados; en amarillo, lo que se repite de Ana. Paso 2: cambias el email de Ana en una sola fila (rojo) y queda con dos emails. Paso 3: intentas dar de alta un producto nuevo sin pedido y la tabla lo impide. Paso 4: al borrar el único pedido de Luis, Luis desaparece. **Compruébalo con tu dedo** sobre la figura antes de seguir.

### Paso a paso: ahora con código

1. **Crea la tabla plana** con clave primaria `(pedido, producto)`: cada pareja pedido-producto es una fila.
2. **Inserta cinco filas** de ejemplo.
3. **Lee la tabla** y busca a ojo lo que se repite.
4. **Provoca la anomalía de modificación**: cambia el email de Ana en una sola fila.
5. **Provoca la de inserción**: intenta guardar un producto sin pedido.
6. **Provoca la de borrado**: borra el pedido de Luis y mira si Luis sigue existiendo.

### Código y resultado

@demo r4-1a | Figura 4.1-b. Captura real: la tabla plana con sus datos.

**Qué ves en la imagen.** `PRIMARY KEY (pedido, producto)` es una clave compuesta: una fila por cada producto de cada pedido. El `SELECT` muestra cinco filas. Fíjate en cuántas veces se repite «Ana García», su email, su ciudad y su provincia (tres veces cada uno), y en que «Camiseta» y «Gorra» repiten también su precio.

@demo r4-1b | Figura 4.1-c. Captura real: la anomalía de modificación. Ana acaba con dos emails.

**Qué ves en la imagen.** El `UPDATE` cambia el email solo en la fila del pedido 101 con la camiseta (`UPDATE 1`: una fila). La consulta con `DISTINCT` (sin repetidos) devuelve **dos** combinaciones para Ana García: el email nuevo y el antiguo. Los datos se contradicen, y la tabla no sabe cuál es el correcto.

@demo r4-1c | Figura 4.1-d. Captura real: la anomalía de inserción. No se puede guardar un producto que nadie ha pedido.

**Qué ves en la imagen.** Intentamos guardar el producto «Taza» con su precio. La clave `(pedido, producto)` exige un pedido, y como no hay, el gestor responde `null value in column "pedido" ... violates not-null constraint`. El producto no puede existir en la base de datos hasta que alguien lo compre.

@demo r4-1d | Figura 4.1-e. Captura real: la anomalía de borrado. Al borrar un pedido se pierde un cliente.

**Qué ves en la imagen.** `DELETE ... WHERE pedido = 104` borra una fila (`DELETE 1`). La consulta de clientes distintos devuelve solo Ana y Marta: **Luis ha desaparecido** de la base de datos, aunque era un cliente real, solo porque su único pedido se borró.

### Ejemplo sencillo

Una agenda donde cada fila repite la dirección de la empresa. Si la empresa se muda, hay que cambiar muchas filas; si olvidas una, la empresa tiene dos direcciones.

### Ejemplo real

Una academia guardaba en una sola tabla alumno, curso y profesor. Al cambiar el teléfono de un profesor, quedaron tres teléfonos distintos para la misma persona, y nadie sabía cuál era el vigente.

### Profundizando

**La redundancia no siempre es un error.** A veces se repite un dato a propósito (punto 4.6). Lo grave es la redundancia **que nadie controla**.

**Por qué el gestor no te avisa.** Para PostgreSQL, «Ana García» con dos emails son filas válidas: él no sabe que describen a la misma persona. Las reglas de la normalización las pones tú con el diseño.

**Las anomalías crecen con el tamaño.** Con 5 filas son un fastidio; con 5 millones, un problema que requiere proyectos de limpieza de datos.

### Ejercicio

1. En la tabla plana, ¿cuántas veces aparece el email de Ana antes de modificar nada? ¿Cuántas filas habría que tocar para cambiarlo bien?
2. Explica con tus palabras la anomalía de inserción de la figura 4.1-d.
3. ¿Cómo evitarías la anomalía de borrado con tablas separadas?

### Solución

1. Aparece en 3 filas (pedido 101 dos veces y pedido 103). Habría que modificar las 3.
2. No se puede registrar un producto nuevo (con su precio) hasta que exista un pedido que lo contenga, porque la tabla mezcla productos y pedidos y exige datos de ambos.
3. Con una tabla `clientes` separada: un pedido borrado ya no arrastra al cliente, porque el cliente es una fila propia.

### Error habitual

Pensar que repetir datos «hace las consultas más fáciles». Hace las lecturas algo más cómodas y las escrituras peligrosas.

```sql
-- Mal: el email del cliente repetido en cada fila de venta
UPDATE ventas_plano SET email = 'nuevo@ejemplo.com' WHERE pedido = 101 AND producto = 'Camiseta';
```

### Buena práctica

Antes de crear una tabla, pregúntate para cada columna: «¿este dato describe lo mismo que la fila, o describe otra cosa?». Si describe otra cosa, probablemente pertenece a otra tabla.

### Comprobación

Para cualquier tabla tuya, intenta provocar las tres anomalías a mano: ¿puedo cambiar un dato en un sitio y olvidar otro? ¿Puedo guardar una cosa sin otra? ¿Puedo perder una cosa al borrar otra? Si respondes «sí» a alguna, hay que normalizar.

## 4.2 Primera forma normal (1FN)

### ¿Qué es?

Una tabla cumple la **primera forma normal (1FN)** cuando **cada celda contiene un solo valor** (un valor «atómico», que no se puede dividir con sentido) y **no hay grupos de columnas repetidas**.

### ¿Para qué sirve?

Para que cada dato se pueda buscar, contar, ordenar y enlazar por separado. Es la base de todas las demás formas normales.

### ¿Por qué lo necesito?

Con una lista dentro de una celda no puedes contar cuántas veces se vendió un producto, comprobar que el producto existe ni cambiar uno solo de los valores. Y con columnas repetidas (`producto1`, `producto2`...) la tabla se queda pequeña o llena de huecos.

### ¿Cómo funciona?

Hay dos señales de que no se cumple la 1FN:

1. **Listas en una celda**: «Camiseta, Gorra».
2. **Columnas repetidas**: `telefono1`, `telefono2`, `telefono3`.

La solución es siempre la misma: **una fila por cada valor** (en la misma tabla, o en otra tabla enlazada si el valor es una cosa con vida propia).

### Primero, sin código: de una lista a filas

@fig h4-2 | Figura 4.2-a. Sin código: pasar una tabla con listas a primera forma normal.

**Qué ves en la imagen.** Paso 1: la regla. Paso 2: la tabla `pedidos_lista`, con dos celdas que contienen listas (en rojo). Paso 3: la solución, una fila por cada producto de cada pedido (en amarillo, las filas nuevas). Ahora cada celda tiene un único dato.

### Paso a paso: ahora con código

1. **Crea la tabla con la lista** y comprueba que no puedes contar bien.
2. **Descompón la lista en filas** con `string_to_array` (convierte el texto en una lista) y `unnest` (convierte una lista en filas).
3. **Guarda el resultado** en una tabla nueva con `CREATE TABLE ... AS SELECT`.
4. **Comprueba** que ahora sí se puede contar por producto.

### Código y resultado

@demo r4-2a | Figura 4.2-b. Captura real: una tabla con listas en una celda, y la pregunta que no se puede responder bien.

**Qué ves en la imagen.** `productos text` guarda «Camiseta, Gorra» como un único texto. La consulta `LIKE '%Camiseta%'` cuenta los pedidos cuyo texto contiene esa palabra (2), pero no distingue «Camiseta» de «Camiseta térmica», ni cuenta unidades, ni garantiza que el producto exista.

@demo r4-2b | Figura 4.2-c. Captura real: la lista descompuesta en filas.

**Qué ves en la imagen.** `string_to_array(productos, ', ')` parte el texto por cada coma y espacio; `unnest(...)` convierte esa lista en filas. El resultado son cinco filas, una por cada producto de cada pedido. Los valores ya son atómicos.

@demo r4-2c | Figura 4.2-d. Captura real: guardar el resultado y contar por producto.

**Qué ves en la imagen.** `CREATE TABLE ... AS SELECT` crea una tabla nueva con el resultado de la consulta (`SELECT 5` indica que tiene cinco filas). Ahora `GROUP BY producto` agrupa y cuenta: Camiseta aparece en 2 pedidos, Gorra en 1 y Mochila en 2. Antes era imposible hacer esto con precisión.

### Ejemplo sencillo

`telefonos = '600111, 910222'` pasa a ser dos filas en una tabla de teléfonos, una por número.

### Ejemplo real

Un formulario guardaba las «aficiones» como texto separado por comas. Al querer enviar una oferta a los aficionados al senderismo, la búsqueda devolvía también «senderismo urbano» y «no senderismo». Pasar a una fila por afición lo resolvió.

### Profundizando

**¿Qué es «atómico»?** Depende de lo que vayas a hacer con el dato. Un nombre completo en una columna es atómico si nunca vas a buscar por apellido; si vas a hacerlo, mejor separar nombre y apellidos. Una fecha es atómica aunque tenga día, mes y año, porque el gestor tiene tipos y funciones para trabajar con ella.

**Arreglos y JSON.** PostgreSQL permite guardar listas (*arrays*) y JSON dentro de una columna (Parte 6). Es útil en casos concretos, pero **rompe la 1FN a propósito**: solo conviene cuando no necesitas buscar ni enlazar los elementos por separado.

**La 1FN no resuelve la redundancia.** Tras la figura 4.2-d, Ana sigue repetida en cada fila. Eso lo resuelven las dos formas siguientes.

### Ejercicio

1. ¿Cumple la 1FN esta fila: `(1, 'Ana', 'Madrid, Alcalá')`? ¿Y esta tabla: `(id, nombre, hijo1, hijo2, hijo3)`?
2. Convierte a 1FN la tabla `contactos(id, nombre, telefonos)` donde `telefonos` es una lista separada por comas.
3. Escribe el SQL para obtener una fila por teléfono a partir de `contactos` (usa `string_to_array` y `unnest`).

### Solución

1. No cumple ninguna: la primera tiene una lista en la celda de ciudades; la segunda tiene columnas repetidas (`hijo1`, `hijo2`, `hijo3`).
2. Una tabla `telefonos(contacto_id, numero)` con una fila por cada teléfono de cada contacto.
3. Por ejemplo:

```sql
SELECT id AS contacto_id,
       unnest(string_to_array(telefonos, ', ')) AS numero
FROM contactos;
```

### Error habitual

Resolver las columnas repetidas añadiendo más columnas («hijo4», «hijo5»...), o las listas con separadores raros (`;`, `|`).

```sql
-- Mal: columnas repetidas
CREATE TABLE personas_mal (id integer PRIMARY KEY, nombre text, hijo1 text, hijo2 text, hijo3 text);
-- Bien: una fila por hijo
CREATE TABLE hijos (persona_id integer, nombre text);
```

### Buena práctica

Si ves un número en el nombre de una columna (`telefono1`, `producto2`), o un separador dentro de los datos, para: falta una fila o una tabla.

### Comprobación

Para cada tabla pregúntate: ¿cada celda tiene un solo dato? ¿Hay columnas que se repiten con un número? Si la respuesta a la segunda es «sí», hay que pasar a filas.

## 4.3 Segunda forma normal (2FN)

### ¿Qué es?

Una tabla está en **segunda forma normal (2FN)** cuando cumple la 1FN y **cada dato depende de la clave completa**, no solo de una parte de ella. Solo tiene sentido cuando la clave primaria está formada por **varias columnas** (clave compuesta).

Una **dependencia** significa «el valor de A determina el valor de B»: si sé el producto, sé su precio. Se escribe `producto → precio`.

### ¿Para qué sirve?

Para que los datos que pertenecen a una sola parte de la clave (el precio es del producto, no de la pareja pedido-producto) vivan en su propia tabla y no se repitan en cada fila.

### ¿Por qué lo necesito?

En nuestra tabla plana, el precio de la camiseta se repite en cada pedido donde aparece. Si cambia su precio, hay que cambiarlo en muchas filas. Y la fecha del pedido se repite en cada línea del pedido.

### ¿Cómo funciona?

1. **Identifica la clave**: aquí `(pedido, producto)`.
2. **Para cada columna que no es clave, pregunta**: ¿depende de la clave entera, o solo de una parte?
3. **Las que dependen de una sola parte** se mueven a una tabla propia, con esa parte como clave.
4. **Las que dependen de la clave completa** se quedan.

En nuestro caso:

| Columna | Depende de | ¿Cumple 2FN? |
| --- | --- | --- |
| fecha, cliente, email, ciudad, provincia | Solo del pedido | No |
| precio | Solo del producto | No |
| cantidad | De la pareja (pedido, producto) | Sí |

### Primero, sin código: separar por dependencias

@fig h4-3 | Figura 4.3-a. Sin código: de qué depende cada columna y cómo se separa.

**Qué ves en la imagen.** Paso 2: cada columna coloreada según de qué depende (azul: solo del pedido; naranja: solo del producto; verde: de la pareja). Paso 3: el resultado: `productos` con el precio, `pedidos` con los datos del pedido y `lineas` con la cantidad, que es lo único que depende de la pareja.

### Paso a paso: ahora con código

1. **Comprueba la dependencia** `producto → precio` con una consulta: si ningún producto tiene dos precios distintos, la dependencia se cumple.
2. **Observa la repetición**: cuántas veces se repite cada precio.
3. **Crea la tabla `productos`** con los productos y precios distintos.
4. **Crea `pedidos_2fn`** con los datos que dependen del pedido.
5. **Crea `lineas_2fn`** con la pareja pedido-producto y la cantidad, enlazando con el `id` del producto.

### Código y resultado

@demo r4-3a | Figura 4.3-b. Captura real: comprobar que `producto → precio` y ver cuánto se repite.

**Qué ves en la imagen.** La primera consulta busca productos que tengan más de un precio distinto (`HAVING count(DISTINCT precio) > 1`): devuelve **0 filas**, es decir, cada producto tiene un único precio: la dependencia se cumple. La segunda muestra cuántas veces se repite cada precio: la camiseta y la gorra, dos veces cada una. Eso es redundancia: el mismo precio escrito varias veces.

@demo r4-3b | Figura 4.3-c. Captura real: la tabla `productos`, con cada precio una sola vez.

**Qué ves en la imagen.** `INSERT ... SELECT DISTINCT producto, precio FROM ventas_plano` copia a la tabla nueva los productos distintos con su precio (`INSERT 0 3`: tres filas). El `id` lo genera la identidad automática. Ahora el precio de cada producto está en un solo sitio.

@demo r4-3c | Figura 4.3-d. Captura real: los datos del pedido y las líneas, separados.

**Qué ves en la imagen.** `pedidos_2fn` tiene una fila por pedido (cuatro, sin repetir fecha ni cliente por línea). `lineas_2fn` tiene una fila por cada producto de cada pedido (cinco), con la cantidad y el `producto_id` que apunta a `productos`. La unión con `JOIN ... ON p.nombre = v.producto` convierte el nombre del producto en su número.

### Ejemplo sencillo

En una tabla de matrículas con clave `(alumno, curso)`, el nombre del curso depende solo del curso: va a la tabla de cursos.

### Ejemplo real

Una tienda tenía la tabla `lineas(pedido, producto, nombre_producto, precio, cantidad)`. Al subir el precio de un producto hubo que actualizar miles de filas y se dejaron algunas sin actualizar. Separar `productos` lo resolvió.

### Profundizando

**La 2FN solo existe con claves compuestas.** Si la clave primaria es una sola columna (por ejemplo, un `id`), la 2FN se cumple automáticamente.

**Precio actual frente a precio vendido.** Aquí hemos quitado `precio` de las líneas, pero en una tienda real conviene **guardar también el precio al que se vendió** (punto 4.6): no es redundancia accidental, es un dato histórico.

**Aún queda trabajo.** `pedidos_2fn` todavía repite los datos del cliente y de la ciudad. Es la tercera forma normal.

### Ejercicio

1. En una tabla `notas(alumno, asignatura, nombre_asignatura, nota)` con clave `(alumno, asignatura)`, ¿qué columna viola la 2FN y por qué?
2. Escribe las dos tablas resultantes.
3. Comprueba con una consulta que `producto → precio` se cumple en `ventas_plano`.

### Solución

1. `nombre_asignatura`: depende solo de `asignatura`, que es una parte de la clave.
2. `asignaturas(id, nombre)` y `notas(alumno, asignatura_id, nota)`.
3. `SELECT producto FROM ventas_plano GROUP BY producto HAVING count(DISTINCT precio) > 1;` devuelve 0 filas.

### Error habitual

Aplicar la 2FN sobre una tabla con una clave de una sola columna (no hay nada que comprobar), o dejar en la tabla de líneas datos del producto «por comodidad».

```sql
-- Mal: el nombre del producto repetido en cada línea
CREATE TABLE lineas_mal (pedido_id integer, producto_id integer, nombre_producto text, cantidad integer);
```

### Buena práctica

Cuando una tabla tenga clave compuesta, revisa **cada columna no clave** con la pregunta: «¿cambiaría si cambiara solo una parte de la clave?».

### Comprobación

Elige una tabla con clave compuesta. Para cada columna no clave, escribe de qué parte de la clave depende. Las que dependan de una sola parte se mueven a su tabla.

## 4.4 Tercera forma normal (3FN)

### ¿Qué es?

Una tabla está en **tercera forma normal (3FN)** cuando cumple la 2FN y **ningún dato depende de otro dato que no sea la clave**. Dicho de otro modo: todo dato depende de la clave, de **toda** la clave y de **nada más que** la clave.

Cuando A determina B y B determina C (A → B → C) se dice que C depende de A «a través de B»: una **dependencia transitiva**. La 3FN la elimina.

### ¿Para qué sirve?

Para que los datos que describen **otra cosa** (el cliente, la ciudad) no se mezclen con la tabla de la cosa principal (el pedido).

### ¿Por qué lo necesito?

En `pedidos_2fn`, cada pedido de Ana repite su email, su ciudad y su provincia. Si Ana se muda, hay que cambiar todos sus pedidos. La provincia, además, depende de la ciudad: «Alcalá → Madrid» se repite para todos los clientes de Alcalá.

### ¿Cómo funciona?

1. **Para cada columna no clave**, pregunta: ¿depende directamente de la clave o de otra columna no clave?
2. **Si depende de otra columna**, esa pareja de columnas forma una tabla propia, con la columna determinante como clave.
3. **Deja en la tabla original una clave extranjera** que apunte a la nueva.

En nuestro caso: `pedido → cliente → email, ciudad` y `ciudad → provincia`. Hay que crear `clientes` y `ciudades`.

### Primero, sin código: separar las cadenas

@fig h4-4 | Figura 4.4-a. Sin código: encontrar las cadenas de dependencia y separarlas en tablas.

**Qué ves en la imagen.** Paso 2: las cadenas pedido → cliente → email/ciudad y ciudad → provincia. Paso 3: se crean `ciudades` y `clientes`, y `pedidos` guarda solo el número de cliente (en amarillo, los números de enlace). Paso 4: la comprobación de que la tabla original se puede reconstruir sin perder ni inventar filas.

### Paso a paso: ahora con código

1. **Comprueba las dependencias**: ¿cada cliente tiene un solo email y ciudad? ¿cada ciudad una sola provincia?
2. **Crea las tablas definitivas**: `ciudades`, `clientes`, `pedidos` y `lineas_pedido`, con claves y relaciones.
3. **Rellénalas desde los datos existentes** con `INSERT ... SELECT`, en el orden correcto (primero las que no dependen de otras).
4. **Reconstruye la tabla original con una vista** y compara con la original usando `EXCEPT`: si no sobra ni falta ninguna fila, no has perdido información.
5. **Repite las tres anomalías** y comprueba que ya no ocurren.

### Código y resultado

@demo r4-4a | Figura 4.4-b. Captura real: comprobar las dependencias de cliente y ciudad.

**Qué ves en la imagen.** Las dos primeras consultas devuelven 0 filas: cada cliente tiene un solo email y ciudad, y cada ciudad una sola provincia (las dependencias se cumplen). La tercera muestra la repetición: los datos de Ana (email, ciudad, provincia) están escritos tantas veces como pedidos tiene.

@demo r4-4b | Figura 4.4-c. Captura real: las tablas definitivas, con claves y relaciones.

**Qué ves en la imagen.** `ciudades` guarda cada ciudad con su provincia una sola vez. `clientes` apunta a su ciudad con `ciudad_id`. `pedidos` apunta a su cliente con `cliente_id`. `lineas_pedido` apunta a pedidos y productos, con clave compuesta. Cada dato tiene su sitio.

@demo r4-4c | Figura 4.4-d. Captura real: rellenar las tablas definitivas a partir de la tabla original.

**Qué ves en la imagen.** Cada `INSERT ... SELECT` copia los datos que correspondan: `INSERT 0 3` (tres ciudades), `INSERT 0 3` (tres clientes), `INSERT 0 4` (cuatro pedidos) e `INSERT 0 5` (cinco líneas). Los `JOIN` convierten nombres en números de enlace (por ejemplo, el nombre de la ciudad en su `ciudad_id`). Los dos `SELECT` muestran las ciudades y clientes: cada uno aparece una sola vez.

@demo r4-4d | Figura 4.4-e. Captura real: la prueba de que no se ha perdido información.

**Qué ves en la imagen.** La vista `ventas_reconstruida` vuelve a unir las cinco tablas para obtener la hoja original. `EXCEPT` devuelve las filas del primer resultado que **no** están en el segundo. Las dos comparaciones (original menos reconstruida y reconstruida menos original) devuelven **0 filas**: las dos tablas contienen exactamente los mismos datos. La normalización ha reorganizado la información sin perder ni inventar nada.

@fig r4-4e | Figura 4.4-f. Diagrama del diseño final, generado desde PostgreSQL.

**Qué ves en la imagen.** Cinco tablas bien repartidas: `ciudades`, `clientes`, `pedidos`, `lineas_pedido` y `productos`, enlazadas con claves extranjeras.

@demo r4-4f | Figura 4.4-g. Captura real: las tres anomalías, resueltas.

**Qué ves en la imagen.**

1. **Modificación**: el email de Ana se cambia en **una sola fila** de `clientes` (`UPDATE 1`); la vista muestra un único email para Ana en todos sus pedidos.
2. **Borrado**: se borran el pedido 104 y su línea. La lista de clientes sigue teniendo a **Luis Pérez**: ya no desaparece, porque el cliente es una fila propia.
3. **Inserción**: se da de alta el producto «Taza» sin ningún pedido (`INSERT 0 1`) y aparece en `productos`.

### Ejemplo sencillo

La provincia depende de la ciudad, no del cliente. Si la guardas en la tabla de clientes, repites «Madrid» para cada cliente de Alcalá. En una tabla `ciudades`, está una vez.

### Ejemplo real

Una empresa guardaba en cada factura el nombre y la dirección del cliente. Cuando un cliente cambió de dirección fiscal, las facturas antiguas quedaron con la dirección vieja (que, en este caso, sí era correcto conservar, punto 4.6) pero las nuevas tenían direcciones distintas entre sí. Separar el cliente permitió decidir qué se conserva y qué se actualiza.

### Profundizando

**Otras formas normales.** Existen formas más estrictas: la forma normal de Boyce-Codd (BCNF), la cuarta y la quinta. En la práctica, casi todos los diseños profesionales se detienen en la 3FN (o BCNF), que elimina la mayoría de los problemas reales.

**Orden de rellenado.** Al migrar datos, se llenan primero las tablas de las que otras dependen (ciudades, productos), después las que apuntan a ellas (clientes, pedidos) y al final las tablas intermedias.

**Tablas temporales de migración.** Las tablas `pedidos_2fn` y `lineas_2fn` eran solo un paso intermedio: una vez migrados los datos, se pueden borrar (`DROP TABLE`).

**Las vistas reconstruyen la «hoja».** Una vista como `ventas_reconstruida` permite que las aplicaciones o informes sigan viendo los datos como una tabla plana sin duplicarlos.

### Ejercicio

1. En `empleados(id, nombre, departamento_id, nombre_departamento)`, ¿qué columna viola la 3FN y por qué?
2. Escribe las dos tablas resultantes con sus claves.
3. Comprueba con una consulta que, en `pedidos_2fn`, cada cliente tiene un solo email.

### Solución

1. `nombre_departamento`: depende de `departamento_id`, que no es la clave de la tabla (la clave es `id`).
2. Por ejemplo:

```sql
CREATE TABLE departamentos (
  id     integer PRIMARY KEY,
  nombre text NOT NULL
);
CREATE TABLE empleados (
  id              integer PRIMARY KEY,
  nombre          text NOT NULL,
  departamento_id integer NOT NULL REFERENCES departamentos (id)
);
```

3. `SELECT cliente FROM pedidos_2fn GROUP BY cliente HAVING count(DISTINCT email) > 1;` devuelve 0 filas.

### Error habitual

Separar tablas y olvidar enlazarlas con claves extranjeras, o rellenarlas en orden incorrecto y fallar por claves que no existen.

```sql
-- Mal: se separa la ciudad pero no se enlaza
CREATE TABLE clientes_mal (id integer PRIMARY KEY, nombre text, ciudad_nombre text);
-- Bien: se enlaza con una clave extranjera
CREATE TABLE clientes_bien (id integer PRIMARY KEY, nombre text, ciudad_id integer REFERENCES ciudades (id));
```

### Buena práctica

Después de normalizar, **demuestra que no has perdido información** reconstruyendo la tabla original y comparándola con `EXCEPT`.

### Comprobación

Para cada tabla pregunta: ¿cada dato depende de la clave, de toda la clave y de nada más que la clave? Si alguno depende de otra columna, hay una tabla escondida.

## 4.5 Cómo reconocer el problema en una tabla real

### ¿Qué es?

Es el método para mirar una tabla que no has diseñado tú (o que has diseñado hace tiempo) y averiguar si necesita normalizarse, y cómo.

### ¿Para qué sirve?

En la vida real casi nunca partes de cero: heredas hojas de cálculo, tablas de otros proyectos y bases de datos antiguas. Saber diagnosticarlas es una habilidad de todos los días.

### ¿Por qué lo necesito?

Porque los problemas de diseño no avisan. Hay que ir a buscarlos con preguntas concretas y comprobarlos con datos reales.

### ¿Cómo funciona?

Primero, **señales de alerta** en el diseño:

- Columnas con números en el nombre (`telefono1`, `producto2`).
- Listas o separadores dentro de una celda.
- Los mismos valores repetidos en muchas filas (nombres, emails, ciudades).
- Columnas casi siempre vacías.
- Nombres del tipo «datos del cliente» dentro de una tabla de pedidos.
- Cambiar un dato exige modificar muchas filas.

Después, **comprobar dependencias con consultas**. Para saber si «A determina B»: agrupa por A y comprueba si B toma más de un valor.

```sql
SELECT A FROM tabla GROUP BY A HAVING count(DISTINCT B) > 1;
```

Si la consulta devuelve **0 filas**, cada valor de A tiene un único valor de B en los datos actuales: la dependencia `A → B` se cumple. Si devuelve filas, esas filas son las excepciones: no hay dependencia.

### Primero, sin código: comprobar una dependencia a mano

@fig h4-5 | Figura 4.5-a. Sin código: cómo comprobar una dependencia ordenando la tabla.

**Qué ves en la imagen.** Paso 1: ordenando por producto, el precio es siempre el mismo dentro de cada producto (producto determina precio). Ordenando por provincia, Madrid tiene dos clientes distintos (provincia no determina cliente). Paso 2: la advertencia más importante: **una dependencia es una regla del negocio, no una coincidencia de los datos**. Si en tu muestra solo hay un cliente por ciudad, «ciudad determina cliente» parece cumplirse, pero nada en el negocio lo garantiza.

### Paso a paso: ahora con código

1. **Elige una pareja de columnas** que sospechas dependientes (A, B).
2. **Ejecuta la consulta** de comprobación `GROUP BY A HAVING count(DISTINCT B) > 1`.
3. **Interpreta**: 0 filas significa que se cumple en tus datos; filas significan que no.
4. **Contrasta con el negocio**: ¿tiene sentido que A determine B siempre? Si solo se cumple por casualidad, no la uses para normalizar.
5. **Repite** con otras parejas.

### Código y resultado

@demo r4-5a | Figura 4.5-b. Captura real: cuatro comprobaciones de dependencia, tres que se cumplen y una que solo coincide por casualidad.

**Qué ves en la imagen.**

1. `producto → precio`: 0 filas. Se cumple, y tiene sentido de negocio: un producto tiene un precio.
2. `pedido → fecha`: 0 filas. Se cumple: un pedido tiene una fecha.
3. `provincia → cliente`: devuelve filas. **No hay dependencia**: Madrid tiene dos clientes distintos, así que no se puede determinar el cliente a partir de la provincia.
4. `ciudad → cliente`: devuelve 0 filas. Los datos *parecen* cumplirla, pero **es pura casualidad de la muestra**: en la tienda real, dos clientes pueden vivir en Alcalá. Por eso la última consulta lleva el aviso: una dependencia se decide con el negocio, y los datos solo la confirman o la refutan.

### Ejemplo sencillo

En una hoja de cálculo de alumnos, detectas que el nombre del curso aparece repetido para cada alumno. La pregunta `curso → nombre_curso` da 0 filas: hay que sacar una tabla `cursos`.

### Ejemplo real

Antes de migrar una base de datos heredada, un equipo ejecuta decenas de comprobaciones de dependencias sobre las tablas principales para decidir qué tablas nuevas crear. Es el primer paso de cualquier proyecto de rediseño.

### Profundizando

**Falsos positivos y falsos negativos.** Con pocos datos, una dependencia falsa puede parecer cierta (como `ciudad → cliente`). Con datos sucios, una dependencia verdadera puede parecer falsa (por ejemplo, «Madrid» y «madrid» cuentan como valores distintos).

**Datos sucios.** Si una comprobación devuelve excepciones inesperadas (el mismo producto con dos precios), puede ser un error de datos que conviene investigar antes de normalizar.

**Herramientas.** Algunos programas de análisis de datos detectan dependencias automáticamente, pero la decisión final sigue siendo tuya y del negocio.

### Ejercicio

1. Escribe la consulta que comprueba si «cada cliente tiene una sola ciudad» en `ventas_plano`.
2. En una tabla de empleados, sospechas que `departamento → jefe`. ¿Cómo lo comprobarías y cómo lo contrastarías con el negocio?
3. Si la consulta de comprobación devuelve 2 filas, ¿qué significa?

### Solución

1. `SELECT cliente FROM ventas_plano GROUP BY cliente HAVING count(DISTINCT ciudad) > 1;`
2. Con `SELECT departamento FROM empleados GROUP BY departamento HAVING count(DISTINCT jefe) > 1;`. Con el negocio: ¿un departamento puede tener dos jefes a la vez? Si sí, no hay dependencia.
3. Que hay 2 valores de A con más de un valor de B: esas son las excepciones, y la dependencia no se cumple (o hay datos erróneos).

### Error habitual

Fiarse solo de los datos: normalizar basándose en una dependencia que solo se cumple por casualidad en una muestra pequeña.

```sql
-- Parece que ciudad determina cliente... pero es casualidad de la muestra
SELECT ciudad FROM ventas_plano GROUP BY ciudad HAVING count(DISTINCT cliente) > 1;
```

### Buena práctica

Documenta cada dependencia que uses para normalizar, con su justificación de negocio, no solo «los datos lo cumplen».

### Comprobación

Para una tabla tuya, escribe tres dependencias, comprueba cada una con la consulta y justifícala con una frase de negocio.

## 4.6 Cuándo normalizar y cuándo desnormalizar

### ¿Qué es?

**Normalizar** es repartir los datos para que cada uno viva en un solo sitio. **Desnormalizar** es repetir un dato **a propósito**, sabiendo por qué y cómo se protege.

### ¿Para qué sirve?

Para saber elegir. La regla general es normalizar siempre; las excepciones son pocas y deben estar justificadas.

### ¿Por qué lo necesito?

Un diseño totalmente normalizado necesita muchos `JOIN` para leer cosas simples, y a veces hay consultas críticas que tardan demasiado. Pero desnormalizar sin criterio vuelve a traer las anomalías del punto 4.1.

### ¿Cómo funciona?

Hay dos preguntas que justifican repetir un dato:

1. **¿Es un dato histórico?** (el precio al que se vendió, el nombre en una factura emitida): se repite porque debe conservar lo que era cierto en ese momento.
2. **¿Es un dato calculado para leer más rápido?** (el total de un pedido): se repite por rendimiento, y entonces hay que **mantenerlo coherente**.

Si ninguna es cierta, **no desnormalices**.

### Primero, sin código: casos habituales

@fig h4-6 | Figura 4.6-a. Casos en los que puede tener sentido desnormalizar, su riesgo y cómo protegerte.

**Qué ves en la imagen.** Cuatro casos reales: el precio de venta en la línea (histórico, sin riesgo), el total en el pedido (riesgo: que no coincida con las líneas), una tabla de resumen para informes (riesgo: datos desactualizados) y la copia del nombre en una factura (histórico, correcto). Cada uno con la forma de protegerlo.

### Paso a paso: ahora con código

1. **Añade una columna `total`** a `pedidos` (dato calculado, redundante a propósito).
2. **Rellénala** calculando la suma de las líneas.
3. **Lee el total** sin hacer ningún `JOIN`: es el beneficio.
4. **Provoca el riesgo**: cambia una línea y observa que el total guardado queda desactualizado.
5. **Detéctalo con una consulta** que compare el total guardado con el recalculado.
6. **Decide cómo mantenerlo coherente** (recalcular al cambiar una línea; Parte 5 y 6: triggers y vistas materializadas).

### Código y resultado

@demo r4-6a | Figura 4.6-b. Captura real: guardar el total del pedido como dato calculado.

**Qué ves en la imagen.** `ALTER TABLE ... ADD COLUMN total` añade la columna. El `UPDATE` rellena cada pedido con la suma de `cantidad × precio` de sus líneas, usando una subconsulta. `UPDATE 3` indica que se actualizaron tres pedidos. Ahora `SELECT id, total FROM pedidos` da el total sin ninguna unión. (El pedido 101: 2 × 19,95 + 1 × 9,90 = 49,80.)

@demo r4-6b | Figura 4.6-c. Captura real: el riesgo. El total guardado ya no coincide con las líneas.

**Qué ves en la imagen.** Se cambia la cantidad de camisetas del pedido 101 de 2 a 5. La consulta compara el `total_guardado` con el `total_real` (recalculado sumando las líneas): el pedido 101 tiene guardado 49,80 pero el total real es 109,65. Los otros dos pedidos siguen coincidiendo. Esta consulta de control es la forma de **detectar** que la redundancia se ha desincronizado.

### Ejemplo sencillo

Guardar `precio_venta` en la línea de pedido: es un dato histórico, no un error.

### Ejemplo real

Una tienda con 50 millones de pedidos guarda el total en cada uno porque calcularlo sumando las líneas, cada vez que se muestra un listado, era demasiado lento. Un proceso recalcula el total cada vez que cambia una línea y otro lo verifica cada noche.

### Profundizando

**Mide antes de desnormalizar.** Con los índices adecuados (Parte 18), muchas consultas con `JOIN` son muy rápidas. Desnormaliza solo después de medir un problema real de rendimiento.

**Mantener la coherencia.** Hay tres mecanismos principales: **triggers** (código que se ejecuta automáticamente al cambiar una línea), **vistas materializadas** (resultados guardados que se refrescan) y **la propia aplicación** (que recalcula). Cada uno tiene ventajas y riesgos; se ven en las Partes 5 y 6.

**Columnas generadas.** PostgreSQL permite columnas que se calculan automáticamente a partir de otras columnas **de la misma fila** (por ejemplo, un importe con IVA). No sirven para totales de varias filas.

**Desnormalizar para análisis.** En almacenes de datos para informes (*data warehouses*), la desnormalización es la norma por diseño: se lee mucho y se escribe poco.

### Ejercicio

1. Clasifica estos datos como «histórico», «calculado» o «error»: el precio de venta en cada línea, el total del pedido, el nombre del cliente copiado en cada pedido sin motivo.
2. ¿Cómo detectarías pedidos cuyo total guardado no coincide con sus líneas?
3. ¿Qué mecanismo usarías para actualizar el total automáticamente al cambiar una línea?

### Solución

1. Precio de venta: histórico. Total del pedido: calculado. Nombre del cliente copiado sin motivo: error (redundancia accidental).
2. Con una consulta que compare `total` con `sum(cantidad * precio)` agrupada por pedido (como la figura 4.6-c).
3. Un trigger sobre `lineas_pedido` que recalcule el total del pedido afectado, o un recálculo desde la aplicación dentro de la misma transacción (Partes 5 y 6).

### Error habitual

Desnormalizar sin ningún mecanismo de control: nadie comprueba ni recalcula, y los datos se desincronizan en silencio.

```sql
-- Mal: dato calculado sin nada que lo mantenga ni lo compruebe
ALTER TABLE pedidos ADD COLUMN total numeric(10, 2);
```

### Buena práctica

Todo dato repetido a propósito debe tener: (1) una razón escrita, (2) una forma de mantenerlo coherente y (3) una consulta que compruebe que lo es.

### Comprobación

Para cada dato duplicado de tu diseño, responde: ¿es histórico o calculado? ¿Cómo lo mantengo? ¿Cómo lo compruebo? Si no tienes respuesta a las tres, quítalo.

## 4.7 Errores habituales de diseño

### ¿Qué es?

Son los errores de diseño que más se repiten en proyectos reales. Reconocerlos ahorra mucho trabajo.

### ¿Para qué sirve?

Para detectar los problemas cuando todavía es barato corregirlos: en el papel, no con millones de filas.

### ¿Por qué lo necesito?

Casi todos los problemas que verás en bases de datos heredadas son variantes de los mismos cinco o seis errores.

### ¿Cómo funciona?

Los errores principales:

| Error | Síntoma | Solución |
| --- | --- | --- |
| Columnas repetidas | `producto1`, `producto2`... | Tabla aparte con una fila por elemento |
| Listas dentro de una celda | «Camiseta, Gorra» | Una fila por valor (1FN) |
| Mezclar entidades | Cliente, producto y pedido en una tabla | Una tabla por entidad |
| Tabla «clave-valor» para todo (EAV) | `(entidad, atributo, valor)` | Columnas reales con tipos y reglas |
| Datos calculados sin control | Totales desactualizados | Mecanismo de actualización y comprobación (4.6) |
| Normalizar de más | Decenas de tablas de una columna | Mantener juntos los datos que siempre se usan juntos y no se repiten |

### Primero, sin código: reconocerlos

@fig h4-7 | Figura 4.7-a. Sin código: cuatro anti-patrones habituales.

**Qué ves en la imagen.** Cuatro tarjetas con un ejemplo y su problema: la tabla clave-valor (sin tipos ni reglas), las columnas repetidas, la mezcla de entidades y la lista en una celda.

### Paso a paso: ahora con código

1. **Crea una tabla clave-valor** (el anti-patrón EAV) y guarda en ella los datos de dos personas.
2. **Intenta obtener una fila por persona**: observa lo complicada que es la consulta.
3. **Comprueba que no hay reglas**: guarda una edad como texto («treinta») y mira que se acepta.
4. **Compara con una tabla normal** con columnas, tipos y restricciones.

### Código y resultado

@demo r4-7a | Figura 4.7-b. Captura real: el anti-patrón clave-valor (EAV). Todo cabe, pero nada se protege.

**Qué ves en la imagen.** La tabla `datos` guarda cada atributo de cada entidad como una fila `(entidad_id, atributo, valor)`. Parece flexible, pero: para ver el nombre y el email en una sola fila hay que usar `max(...) FILTER (WHERE ...)` y `GROUP BY` (una consulta complicada que crece con cada atributo); `valor` es siempre texto, así que la edad «treinta» se acepta sin problema; no hay `NOT NULL`, ni `UNIQUE`, ni claves extranjeras; y el gestor no puede ayudarte a validar nada. Una tabla normal con las columnas `nombre`, `email` y `edad integer` resuelve todo esto.

### Ejemplo sencillo

Una tabla `pedidos` con columnas `producto1`, `producto2` y `producto3`: ¿qué pasa con el cuarto producto?

### Ejemplo real

Un sistema de «formularios configurables» se montó con una tabla clave-valor para todo. Un año después, los informes más sencillos tardaban minutos y había edades como «n/a», «treinta» y «-1» en la misma columna.

### Profundizando

**Normalizar de más.** Separar cada columna en su propia tabla (una tabla de nombres, otra de apellidos...) complica las consultas sin eliminar ninguna redundancia real. La regla: separa cuando **hay datos repetidos o una cosa con vida propia**, no por sistema.

**Cuando el esquema es realmente variable.** Para datos que cambian mucho de forma y no se consultan por campo (configuraciones, formularios), PostgreSQL ofrece la columna `jsonb` (Parte 6), que da flexibilidad **con** soporte de consulta e índices. Es mejor que EAV, pero sigue sin darte tipos ni restricciones por campo, así que úsala con criterio.

**Detectar el problema pronto.** La señal más fiable es que las consultas sencillas se vuelven complicadas. Si leer algo obvio exige un `max(...) FILTER`, algo va mal en el diseño.

### Ejercicio

1. Corrige este diseño: `facturas(id, cliente, direccion_cliente, producto1, precio1, producto2, precio2)`.
2. ¿Qué dos errores de la tabla anterior son de 1FN y cuál de 3FN?
3. Escribe una tabla normal para guardar nombre, email y edad (entera) con las restricciones adecuadas.

### Solución

1. Cuatro tablas: `clientes(id, nombre, direccion)`, `productos(id, nombre, precio)`, `facturas(id, cliente_id)` y `lineas_factura(factura_id, producto_id, cantidad, precio_venta)`.
2. De 1FN: las columnas repetidas `producto1`, `precio1`, `producto2`, `precio2`. De 3FN: `direccion_cliente`, que depende del cliente y no de la factura.
3. Por ejemplo:

```sql
CREATE TABLE personas (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  email  text NOT NULL UNIQUE,
  edad   integer CHECK (edad BETWEEN 0 AND 130)
);
```

### Error habitual

Usar la flexibilidad como excusa para no diseñar («guardo todo como clave-valor y así no tengo que cambiar nunca la estructura»). Se paga después, en consultas, rendimiento y calidad de datos.

```sql
-- Mal: nada impide guardar disparates
INSERT INTO datos VALUES (1, 'edad', 'treinta');
```

### Buena práctica

Diseña columnas reales, con tipos y restricciones. Cambiar la estructura (añadir una columna) es fácil y está soportado; recuperar la calidad de datos perdida no.

### Comprobación

Revisa tu diseño con la tabla de errores: ¿hay columnas repetidas, listas en celdas, entidades mezcladas, tablas clave-valor o datos calculados sin control?

## Resumen de la Parte 4

- Redundancia es repetir datos; provoca anomalías de modificación, de inserción y de borrado.
- **1FN**: cada celda un solo valor y sin columnas repetidas; una fila por cada valor.
- **2FN**: con clave compuesta, cada dato depende de la clave completa; lo que depende de una parte va a su tabla.
- **3FN**: ningún dato depende de otro dato que no sea la clave; las cadenas A → B → C se separan.
- La normalización no pierde información: se demuestra reconstruyendo la tabla original y comparando con `EXCEPT`.
- Las dependencias se comprueban con `GROUP BY ... HAVING count(DISTINCT ...) > 1`, pero se deciden con el negocio.
- Se normaliza por defecto; se desnormaliza solo con una razón (histórico o calculado) y con un mecanismo de control.
- Errores habituales: columnas repetidas, listas en celdas, entidades mezcladas, clave-valor para todo y normalizar de más.

## Glosario de la Parte 4

| Término | Significado |
| --- | --- |
| Redundancia | Guardar el mismo dato en más de un sitio |
| Anomalía | Problema que causa la redundancia (de modificación, de inserción o de borrado) |
| Normalización | Repartir los datos en tablas para eliminar la redundancia |
| Forma normal (1FN, 2FN, 3FN) | Cada una de las tres comprobaciones de un buen reparto |
| Dependencia | A determina B: sabiendo A, se sabe B |
| Dependencia transitiva | A determina B y B determina C: C depende de A «a través de» B |
| Valor atómico | Valor que no se puede dividir con sentido |
| Clave compuesta | Clave formada por varias columnas |
| Desnormalizar | Repetir un dato a propósito, con razón y control |
| EAV | Anti-patrón de tabla clave-valor (entidad, atributo, valor) |
| `EXCEPT` | Operación SQL que devuelve las filas de un resultado que no están en otro |
| `CREATE TABLE ... AS SELECT` | Crea una tabla a partir del resultado de una consulta |

## Mini examen de la Parte 4

1. ¿Qué es una anomalía de modificación? Pon un ejemplo.
2. ¿Qué dos señales indican que una tabla no cumple la 1FN?
3. ¿Cuándo tiene sentido hablar de 2FN?
4. ¿Qué es una dependencia transitiva? Pon un ejemplo.
5. ¿Cómo se comprueba con SQL que «A determina B»?
6. ¿Por qué una dependencia no debe decidirse solo con los datos?
7. ¿Cómo demuestras que no has perdido información al normalizar?
8. Da dos razones válidas para desnormalizar.
9. ¿Qué riesgo tiene guardar el total de un pedido y cómo lo detectas?
10. ¿Por qué la tabla clave-valor (EAV) suele ser un mal diseño?

### Respuestas

1. Cambiar un dato repetido en un sitio y olvidar los demás, de modo que se contradicen (Ana con dos emails distintos).
2. Listas dentro de una celda, y columnas repetidas con un número (`telefono1`, `telefono2`).
3. Cuando la clave primaria está formada por varias columnas.
4. Cuando A determina B y B determina C: C depende de A a través de B. Ejemplo: pedido → cliente → ciudad.
5. Con `SELECT A FROM t GROUP BY A HAVING count(DISTINCT B) > 1`: 0 filas significa que se cumple en los datos.
6. Porque con pocos datos puede cumplirse por casualidad; es una regla del negocio.
7. Reconstruyendo la tabla original con una vista y comparando con `EXCEPT` en los dos sentidos: 0 filas en ambos.
8. Que el dato sea histórico (precio de venta) o calculado para leer más rápido (total del pedido), siempre con control.
9. Que el total guardado deje de coincidir con las líneas; se detecta comparándolo con el total recalculado.
10. Porque no hay tipos ni restricciones, las consultas se complican y la calidad de los datos se pierde.

Si has acertado 8 o más, estás listo para la Parte 5. Si no, repasa los puntos de las preguntas falladas.
