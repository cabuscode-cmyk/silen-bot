# Parte 2. Cómo pensar una base de datos

## Antes de empezar

En la Parte 1 aprendiste qué es una tabla y de qué se compone. Ahora viene lo más importante: **saber qué tablas hacen falta** cuando alguien te cuenta una idea. Nadie empieza una base de datos escribiendo código. Primero se piensa, se describe y se dibuja; el código viene después y es la parte fácil.

Al terminar esta parte serás capaz de:

- convertir una idea escrita («quiero una tienda», «quiero un CRM») en una lista de cosas que hay que guardar;
- distinguir entidades, atributos, relaciones y reglas dentro de una descripción;
- decidir qué datos son obligatorios y cuáles opcionales;
- analizar un CRM completo desde cero, y otros casos habituales (agenda, tienda, reservas);
- rellenar una plantilla de requisitos de datos que puedas reutilizar en cualquier proyecto.

### Palabras nuevas de esta parte

Estas palabras se explican con detalle dentro de cada punto. Aquí tienes un adelanto para que no te sorprendan:

| Palabra | Significado breve |
| --- | --- |
| Entidad | Una «cosa» de la que quieres guardar datos: cliente, pedido, producto. Cada entidad acabará siendo una tabla |
| Atributo | Una característica de una entidad: el nombre de un cliente, el precio de un producto. Cada atributo acabará siendo una columna |
| Relación | La conexión entre dos entidades: un cliente hace pedidos |
| Regla | Una condición que los datos deben cumplir: el precio no puede ser negativo |

> **Cómo se usan las imágenes en esta parte.** Son diagramas e ilustraciones hechos para explicar cada idea. Los ejemplos de esta parte son de análisis (se hacen sobre papel), así que todavía no hay código que ejecutar. En la Parte 3 pasaremos esos análisis a diagramas formales y a tablas reales.

## 2.1 De la idea a los datos

### ¿Qué es?

Es el método que usan los profesionales para empezar cualquier base de datos: **antes de pensar en tablas, hay que entender qué se quiere guardar y para qué**. Se parte de una frase corriente («quiero una tienda online») y se acaba con una lista ordenada de cosas, características, conexiones y reglas.

### ¿Para qué sirve?

Para no empezar a ciegas. Quien crea las tablas «a ojo» suele darse cuenta a mitad del proyecto de que le falta información, de que algo está duplicado o de que no puede responder una pregunta básica (por ejemplo, «¿qué productos compró este cliente?»). Cambiar la estructura con datos ya guardados es mucho más costoso que pensarla bien al principio.

### ¿Por qué lo necesito?

Porque la estructura de la base de datos condiciona todo lo demás: las consultas que podrás hacer, lo rápido que irá la aplicación y lo fácil que será ampliarla. Un diseño pensado con calma ahorra semanas de arreglos. Un diseño improvisado se paga con intereses.

### ¿Cómo funciona?

El método tiene seis pasos. Los repetirás en cada proyecto:

1. **Describe la idea con frases completas.** Cuéntala como si se la explicaras a un amigo, sin palabras técnicas.
2. **Subraya los sustantivos importantes.** Son candidatos a **entidades** (cliente, pedido, producto).
3. **Anota qué se sabe de cada uno.** Son los **atributos** (nombre, email, precio).
4. **Busca los verbos que unen entidades.** Son las **relaciones** («un cliente *hace* pedidos»).
5. **Escribe las reglas.** Lo que siempre debe cumplirse («el email no se repite»).
6. **Revisa con preguntas reales.** Comprueba que con esos datos podrías responder lo que el negocio necesita.

### Ejemplo sencillo

Idea: «Quiero guardar los libros que presto a mis amigos». Siguiendo el método:

1. Frase completa: «Presto libros a amigos. Quiero saber quién tiene cada libro y desde cuándo».
2. Sustantivos importantes: libro, amigo, préstamo.
3. Atributos: libro (título, autor); amigo (nombre, teléfono); préstamo (fecha de salida, fecha de devolución).
4. Verbos: un amigo *recibe* préstamos; un préstamo *es de* un libro.
5. Reglas: un libro no puede estar prestado a dos amigos a la vez.
6. Revisión: ¿puedo saber qué libros tiene Marta ahora? Sí, mirando los préstamos sin fecha de devolución.

### Ejemplo real

Un dueño de gimnasio dice: «Quiero controlar quién está apuntado a cada clase y cuándo paga cada socio». Aplicando el método surgen entidades como socio, clase, inscripción y pago, y preguntas que antes nadie se había planteado: ¿un socio puede apuntarse a varias clases? ¿Una clase tiene aforo máximo? ¿Se guarda el historial de pagos o solo el último? Cada pregunta sin respuesta es una decisión de diseño pendiente.

### Resultado visual

@fig f2-1 | Figura 2.1-a. Los seis pasos del método para pasar de una idea a los datos.

**Qué ves en la imagen.** Es un recorrido de seis estaciones de izquierda a derecha: describir, subrayar entidades, anotar atributos, buscar relaciones, escribir reglas y revisar. Debajo de cada estación aparece lo que se obtiene en ese paso. La flecha de vuelta indica que, si la revisión falla, se regresa a los pasos anteriores: diseñar es iterar.

### Ejercicio

1. Aplica los seis pasos a esta idea: «Quiero una aplicación para apuntar los gastos de mi casa». Escribe las entidades y los atributos que se te ocurran.
2. Escribe una pregunta real que tu diseño del ejercicio 1 debería poder responder.
3. ¿Por qué conviene empezar con frases corrientes y no con nombres de tablas?

### Solución

1. Una posible solución: entidades *gasto* y *categoría*. Atributos de gasto: fecha, importe, descripción. Atributos de categoría: nombre. Relación: cada gasto pertenece a una categoría. Hay más soluciones válidas, por ejemplo añadir una entidad *persona* si varios miembros de la casa apuntan gastos.
2. «¿Cuánto gastamos en comida en marzo?». Para responderla hacen falta la fecha, el importe y la categoría de cada gasto.
3. Porque las frases corrientes obligan a pensar en el negocio y no en la técnica. Si empiezas por las tablas, tiendes a copiar estructuras que no encajan con tu caso.

### Error habitual

Saltarse el análisis y crear tablas directamente («ya iré arreglándolo»). Con datos ya guardados, cada cambio de estructura obliga a migrar información y a modificar la aplicación.

### Buena práctica

Escribe la descripción del proyecto en un documento antes de abrir ninguna herramienta. Enséñasela a la persona que usará el sistema: si no la reconoce, falta algo.

### Comprobación

Para un proyecto tuyo, escribe en tres frases qué quieres guardar y cuáles son las tres preguntas más importantes que debería poder responder. Si no sabes las preguntas, todavía no estás listo para diseñar.

## 2.2 Cómo detectar entidades, atributos, relaciones y reglas

### ¿Qué es?

Es la técnica de **leer una descripción y clasificar sus palabras** en cuatro grupos:

- **Entidades**: las cosas de las que se guardan datos. Suelen ser sustantivos: cliente, pedido, producto.
- **Atributos**: las características de cada entidad. También suelen ser sustantivos, pero «pertenecen» a una entidad: el *nombre* del cliente, el *precio* del producto.
- **Relaciones**: cómo se conectan las entidades. Suelen ser verbos: un cliente *hace* pedidos, un pedido *incluye* productos.
- **Reglas**: condiciones que los datos deben cumplir. Suelen aparecer con palabras como «siempre», «nunca», «como máximo», «no puede», «único».

### ¿Para qué sirve?

Convierte un texto ambiguo en una lista concreta. Es la manera más fiable de no olvidar nada y de que dos personas que lean la misma descripción lleguen a la misma estructura.

### ¿Por qué lo necesito?

Muchos errores de diseño nacen de clasificar mal. Por ejemplo, guardar la *ciudad* como entidad cuando solo es un dato del cliente, o guardar el *pedido* como un atributo del cliente cuando es una entidad con vida propia. Aprender a distinguirlos evita esos fallos.

### ¿Cómo funciona?

Para decidir si un sustantivo es una entidad o un atributo, hazte estas tres preguntas:

1. **¿Quiero guardar varios datos sobre ello?** Si sí, probablemente es una entidad. Si es un único dato suelto, probablemente es un atributo.
2. **¿Puede haber muchos?** Un cliente puede tener muchos pedidos, así que el pedido es una entidad. Un cliente solo tiene un nombre, así que es un atributo.
3. **¿Existe por sí mismo?** Un pedido existe aunque cambie el cliente. El nombre no existe sin el cliente.

Para detectar relaciones, busca verbos entre dos entidades. Para detectar reglas, busca palabras de restricción.

### Ejemplo sencillo

Descripción: «Una tienda vende productos. Cada cliente puede hacer varios pedidos. Un pedido incluye uno o varios productos. De cada cliente guardamos nombre, email y teléfono. El email es obligatorio y no puede repetirse; el teléfono es opcional. Un producto tiene nombre y precio, y el precio no puede ser negativo».

Clasificación:

- **Entidades:** cliente, pedido, producto.
- **Atributos:** de cliente (nombre, email, teléfono); de producto (nombre, precio).
- **Relaciones:** el cliente *hace* pedidos; el pedido *incluye* productos.
- **Reglas:** el email es obligatorio y único; el teléfono es opcional; el precio no es negativo.

### Ejemplo real

En una academia de idiomas, el director explica: «Los alumnos se matriculan en cursos. Cada curso lo imparte un profesor y tiene un máximo de 15 alumnos». Entidades: alumno, curso, profesor, matrícula. Relaciones: el alumno *se matricula* en cursos; el profesor *imparte* cursos. Regla: máximo de 15 alumnos por curso. La regla del aforo no se ve en ninguna tabla: deberá comprobarla la aplicación o la base de datos.

### Resultado visual

@fig f2-2 | Figura 2.2-a. Una descripción con sus palabras clasificadas por colores.

**Qué ves en la imagen.** Es el texto de la tienda con las palabras importantes coloreadas: azul para las entidades, naranja para los atributos, morado para las relaciones y verde para las reglas. Subrayar de esta forma es el primer paso de cualquier análisis.

@fig f2-3 | Figura 2.2-b. El resultado de la clasificación, en cuatro cajas.

**Qué ves en la imagen.** Las mismas palabras, ya ordenadas en cuatro cajas: lo que acabará siendo tablas (entidades), columnas (atributos), enlaces entre tablas (relaciones) y restricciones (reglas). Esta lista es el material de partida del diseño de la Parte 3.

### Ejercicio

1. Clasifica en entidades, atributos, relaciones y reglas: «Una biblioteca presta libros a socios. De cada libro se guarda el título y el autor. Un socio puede tener como máximo 3 libros prestados a la vez».
2. ¿Es «ciudad» una entidad o un atributo en una agenda de contactos sencilla? ¿Y en una empresa de reparto que gestiona rutas por ciudad? Razona la respuesta.
3. Encuentra una regla escondida en esta frase: «Cada habitación del hotel se reserva para unas fechas».

### Solución

1. **Entidades:** libro, socio, préstamo. **Atributos:** título y autor del libro. **Relaciones:** la biblioteca *presta* libros a socios, de modo que un socio *tiene* libros. **Regla:** como máximo 3 libros prestados a la vez por socio.
2. En una agenda sencilla, «ciudad» es un atributo del contacto: solo es un dato suelto. En la empresa de reparto puede ser una entidad, porque se guardan más datos sobre ella (zonas, tarifas, rutas) y muchos pedidos se asocian a ella. Depende de lo que quieras guardar y consultar.
3. Una habitación no puede estar reservada por dos personas en fechas que se solapan. Nadie lo dijo explícitamente, pero es una regla esencial.

### Error habitual

Convertir en entidad algo que es un simple atributo (por ejemplo, una tabla solo para el «color» cuando basta con un campo), o al revés, guardar como atributo algo con vida propia (como meter los pedidos dentro de una celda del cliente).

### Buena práctica

Busca las **reglas escondidas**: casi nunca aparecen escritas. Pregunta siempre: «¿Qué no puede pasar nunca?» y «¿Qué debe ser siempre verdad?».

### Comprobación

Toma una descripción de tres o cuatro frases de cualquier negocio que conozcas. Colorea con cuatro colores sus entidades, atributos, relaciones y reglas. Si alguna palabra no cabe en ninguna categoría, probablemente no es relevante para la base de datos.

## 2.3 Datos obligatorios y datos opcionales

### ¿Qué es?

Un atributo es **obligatorio** cuando la fila no tiene sentido sin él. Es **opcional** cuando puede faltar sin que la fila pierda su utilidad. Esta decisión se toma para cada atributo, uno a uno, durante el análisis.

También se decide, para cada atributo, si debe ser **único** (no puede repetirse entre filas) y si tiene algún **valor por defecto** (el valor que se usa si nadie indica otro).

### ¿Para qué sirve?

Protege la calidad de los datos. Si decides que el email es obligatorio, el sistema impedirá guardar clientes sin email. Si decides que es único, impedirá dos clientes con el mismo correo. Cada regla que dejas en manos de la base de datos es una regla que la aplicación no puede olvidar.

### ¿Por qué lo necesito?

Si todo es opcional, las tablas se llenan de huecos y las consultas dan resultados engañosos (por ejemplo, clientes sin nombre en una lista de correo). Si todo es obligatorio, los usuarios no podrán guardar datos reales, porque a veces simplemente no los tienen. El equilibrio se decide caso por caso.

### ¿Cómo funciona?

Para cada atributo, haz estas cuatro preguntas:

1. **¿Puede existir la fila sin este dato?** Si no, es obligatorio.
2. **¿Se conoce siempre en el momento de crear la fila?** Si no, probablemente sea opcional (o se rellenará después).
3. **¿Puede repetirse entre filas?** Si no, es único.
4. **¿Hay un valor razonable por defecto?** Por ejemplo, el estado de un pedido nuevo puede ser «pendiente».

### Ejemplo sencillo

En CLIENTES:

- `nombre`: obligatorio (sin nombre no sabes quién es).
- `email`: obligatorio y único (identifica al cliente al iniciar sesión).
- `telefono`: opcional (no todos lo darán).
- `alta`: obligatorio, con valor por defecto igual a la fecha de hoy.

### Ejemplo real

En una tienda online, `fecha_envio` en un pedido es opcional: está vacía hasta que el pedido sale del almacén. En cambio, `estado` es obligatorio y siempre tiene valor (por defecto, «pendiente»). Esta combinación permite saber, mirando solo la tabla, qué pedidos están sin enviar.

### Resultado visual

@fig f2-4 | Figura 2.3-a. Un formulario y la tabla que lo guarda: los asteriscos marcan lo obligatorio.

**Qué ves en la imagen.** A la izquierda hay un formulario de alta de cliente con los campos nombre y email marcados con un asterisco (obligatorios) y teléfono marcado como opcional. A la derecha está la tabla CLIENTES con las etiquetas «obligatorio», «único» y «opcional» sobre cada columna. La última fila (Luis) se guardó sin teléfono, y su celda aparece vacía (NULL).

### Ejercicio

1. Para una tabla `productos` con las columnas `nombre`, `precio`, `descripcion` y `codigo_barras`, decide cuáles son obligatorias, cuáles únicas y cuáles opcionales.
2. Una aplicación de reservas guarda `hora_llegada_real`. ¿Es obligatoria u opcional? ¿Por qué?
3. ¿Qué problema aparece si se hace obligatorio el teléfono en el formulario de una tienda online?

### Solución

1. `nombre`: obligatorio. `precio`: obligatorio (un producto sin precio no se puede vender). `descripcion`: opcional. `codigo_barras`: único y, según el caso, opcional (por ejemplo, para productos que no lo tengan), pero si existe no se repite.
2. Opcional. La hora real de llegada solo se conoce cuando el cliente llega, así que al crear la reserva todavía no existe.
3. Algunos clientes no querrán darlo y abandonarán la compra, o inventarán un número para poder continuar, lo que llena la base de datos de teléfonos falsos. Pide solo lo imprescindible.

### Error habitual

Marcar un campo como obligatorio «porque sería ideal tenerlo» en lugar de «porque sin él la fila no tiene sentido». Los usuarios acabarán rellenándolo con basura.

### Buena práctica

Empieza con pocos campos obligatorios (los imprescindibles) y añade más solo si hay una razón clara. Es fácil endurecer una regla más tarde y difícil relajarla cuando ya hay datos incoherentes.

### Comprobación

Elige una tabla que hayas diseñado y escribe, para cada columna, una palabra: «obligatorio», «opcional», «único» o «con valor por defecto». Debe haber una justificación para cada elección.

## 2.4 Caso guiado: «Quiero crear un CRM»

### ¿Qué es?

Un **CRM** (del inglés *Customer Relationship Management*, «gestión de la relación con los clientes») es una aplicación para llevar el seguimiento de las personas y empresas con las que trabajas: quiénes son, qué les has ofrecido, qué has hablado con ellas y qué tareas tienes pendientes.

Este punto aplica el método de 2.1 a un caso real y completo, para que veas todo el proceso de principio a fin.

### ¿Para qué sirve?

Es un ejercicio-modelo. Cuando termines, sabrás pasar de una frase tan vaga como «quiero un CRM» a una lista concreta de entidades, atributos y relaciones, y podrás repetirlo con cualquier otro proyecto.

### ¿Por qué lo necesito?

Un CRM es uno de los proyectos más habituales que te pedirán, y mezcla casi todo lo que hay que saber: varias entidades relacionadas, historiales, estados, usuarios con permisos y tareas. Si sabes analizar un CRM, puedes analizar casi cualquier sistema de gestión.

### ¿Cómo funciona?

Aplicamos los seis pasos.

**Paso 1: describir la idea.** «Mi equipo de ventas trabaja con empresas y con las personas que trabajan en ellas. Queremos apuntar cada oportunidad de venta, saber en qué fase está, qué hemos hablado (llamadas, emails y notas) y qué tareas tenemos pendientes. Cada vendedor entra con su usuario y ve lo suyo».

**Paso 2: subrayar entidades.**

| Entidad | Qué guarda |
| --- | --- |
| Usuario | Las personas del equipo que entran en el CRM |
| Empresa | Las organizaciones con las que se trabaja |
| Contacto (o cliente) | Las personas concretas, normalmente dentro de una empresa |
| Oportunidad | Una posible venta, con su importe y su fase |
| Tarea | Algo que hay que hacer, con fecha límite |
| Nota | Un apunte libre sobre una empresa, un contacto o una oportunidad |
| Llamada | El registro de una llamada con un contacto |
| Email | El registro de un correo enviado o recibido |
| Estado (fase) | Cada paso del proceso de venta: nuevo, en negociación, ganado, perdido |

**Paso 3: atributos de cada entidad.** Por ejemplo: usuario (nombre, email, contraseña cifrada, rol); empresa (nombre, sector, web, ciudad); contacto (nombre, email, teléfono, cargo); oportunidad (título, importe, fecha prevista de cierre); tarea (título, fecha límite, completada); nota (texto, fecha); llamada (fecha, duración, resumen); email (asunto, fecha, dirección: enviado o recibido).

**Paso 4: relaciones.**

- Una empresa tiene muchos contactos; cada contacto pertenece a una empresa.
- Una empresa tiene muchas oportunidades.
- Cada oportunidad la lleva un usuario.
- Cada oportunidad está en un estado.
- Una oportunidad tiene muchas tareas, notas, llamadas y emails.
- Cada tarea se asigna a un usuario.

**Paso 5: reglas.** El email de un usuario es único. Una oportunidad siempre pertenece a una empresa. Una oportunidad tiene un único estado en cada momento. El importe no puede ser negativo. Un vendedor solo ve las oportunidades que tiene asignadas (esta regla se resolverá con permisos, en las Partes 16 y 17).

**Paso 6: revisar con preguntas reales.** ¿Puedo saber qué oportunidades abiertas tiene cada vendedor? ¿Puedo ver todo el historial de una empresa (llamadas, emails, notas)? ¿Puedo listar las tareas que vencen esta semana? Con estas entidades y relaciones, sí.

### Ejemplo sencillo

Si el CRM fuera solo una libreta de empresas y contactos, bastaría con dos entidades: empresa y contacto, con la relación «una empresa tiene muchos contactos». Todo lo demás (oportunidades, tareas, historial) se añade por capas cuando el negocio lo pide.

### Ejemplo real

Una pequeña consultora quiere un CRM. Empieza con empresas, contactos y oportunidades. A los tres meses piden registrar llamadas y emails, y un mes después, tareas con recordatorios. Como las entidades están bien separadas, cada ampliación es una tabla nueva enlazada a las existentes, sin rehacer lo anterior.

### Resultado visual

@fig f2-5 | Figura 2.4-a. De la palabra «CRM» a las cosas que hay que guardar.

**Qué ves en la imagen.** En el centro está la idea («CRM») y a su alrededor las entidades que salen de analizarla. Las entidades principales están en azul, las de actividad (llamadas, emails, notas) en naranja y las de organización (usuarios, estados) en morado.

@fig f2-6 | Figura 2.4-b. Atributos de las entidades principales del CRM.

**Qué ves en la imagen.** Seis tarjetas, una por entidad, con la lista de sus atributos. Cada tarjeta es el borrador de una futura tabla: el título será el nombre de la tabla y cada línea será una columna.

@fig f2-7 | Figura 2.4-c. Atributos de las entidades de actividad (llamadas, emails, notas, tareas) y de los estados.

**Qué ves en la imagen.** Las entidades que registran lo que ocurre: llamadas, emails, notas, tareas y estados. Tienen pocos atributos propios, y su valor está en las relaciones con las demás entidades.

@fig f2-8 | Figura 2.4-d. Relaciones del CRM: qué se conecta con qué y cuántos de cada.

**Qué ves en la imagen.** Cada línea une dos entidades. Los números en los extremos indican cuántas pueden participar: «1» significa uno y «N» significa muchos. Por ejemplo, una empresa (1) tiene muchos contactos (N). Aprenderás a leer esta notación con detalle en la Parte 3.

### Ejercicio

1. A partir de la descripción del paso 1, ¿qué entidad añadirías si el equipo quisiera registrar los productos que vende en cada oportunidad?
2. ¿Cuántas tareas puede tener una oportunidad? ¿Y cuántos usuarios puede tener una tarea asignada, según las reglas del caso?
3. Escribe tres preguntas más que el CRM debería poder responder y di qué entidades necesitarías para responderlas.

### Solución

1. Una entidad *producto*, y una forma de enlazarla con la oportunidad (una oportunidad puede incluir varios productos y un producto aparecer en varias oportunidades; este tipo de enlace se estudia en la Parte 3).
2. Una oportunidad puede tener muchas tareas. Según las reglas, cada tarea se asigna a un único usuario.
3. Por ejemplo: «¿Cuánto hemos vendido este mes?» (oportunidades ganadas e importes); «¿Qué empresas llevan más de 30 días sin contacto?» (empresas, llamadas y emails con sus fechas); «¿Qué vendedor cierra más oportunidades?» (usuarios y oportunidades).

### Error habitual

Querer diseñar el CRM «completo» desde el primer día. Se acaba con 40 tablas que nadie usa. Empieza por el núcleo (empresas, contactos, oportunidades) y amplía cuando haga falta.

### Buena práctica

Verifica el diseño con **preguntas del negocio**. Si no puedes responderlas con las tablas que tienes, falta algo. Si sobran tablas que no ayudan a responder ninguna, quítalas.

### Comprobación

Sin mirar el texto, nombra seis entidades del CRM y una relación entre dos de ellas. Después, escribe una pregunta del negocio y las entidades que se usarían para responderla.

## 2.5 Otros casos de entrenamiento

### ¿Qué es?

Son tres análisis cortos hechos con el mismo método, para que practiques: una **agenda de contactos**, una **tienda online** y un **sistema de reservas**. Cada uno incorpora un reto de diseño distinto.

### ¿Para qué sirve?

El análisis se aprende repitiéndolo. Cada caso te enseña a reconocer una situación que aparecerá en muchos proyectos: una agenda enseña a tratar datos que se repiten (varios teléfonos por persona); la tienda enseña la relación entre pedidos y productos; las reservas enseñan las reglas de solape.

### ¿Por qué lo necesito?

Porque casi cualquier sistema que te pidan se parece a uno de estos tres patrones: guardar personas y sus datos, vender cosas, o reservar recursos en el tiempo.

### ¿Cómo funciona?

Para cada caso verás: la descripción, las entidades, las relaciones y la regla principal. Intenta resolverlo tú antes de leer la solución.

**Caso A. Agenda de contactos.**

- **Descripción:** «Quiero guardar a mis contactos con sus teléfonos y emails. Cada contacto puede tener varios teléfonos (móvil, casa, trabajo) y puedo agruparlos (familia, trabajo)».
- **Entidades:** contacto, teléfono, grupo.
- **Relaciones:** un contacto tiene muchos teléfonos; un contacto puede estar en varios grupos y un grupo tiene varios contactos.
- **Reto:** si pones el teléfono como columna del contacto, ¿cuántos teléfonos caben? Una columna `telefono1`, `telefono2`, `telefono3` limita y desperdicia. La solución es una entidad aparte.

**Caso B. Tienda online.**

- **Descripción:** «Vendemos productos. Los clientes hacen pedidos con varios productos y cantidades. Queremos guardar el precio al que se vendió cada producto».
- **Entidades:** cliente, producto, pedido, línea de pedido (cada producto con su cantidad dentro de un pedido).
- **Relaciones:** un cliente hace muchos pedidos; un pedido tiene muchas líneas; un producto aparece en muchas líneas.
- **Reto:** el precio de un producto cambia con el tiempo, pero el pedido antiguo debe conservar el precio de aquel día. Por eso la línea de pedido guarda su propio precio.

**Caso C. Sistema de reservas.**

- **Descripción:** «Un club alquila pistas de pádel por franjas de una hora. Los socios reservan una pista para una fecha y hora».
- **Entidades:** socio, pista, reserva.
- **Relaciones:** un socio hace muchas reservas; una pista recibe muchas reservas.
- **Reto (regla):** una pista no puede tener dos reservas a la misma hora. Hay que decidir cómo se garantiza (se estudia en la Parte 5, restricciones y transacciones).

### Ejemplo sencillo

En la agenda, Ana García tiene dos teléfonos (móvil y trabajo). En lugar de dos columnas, hay dos filas en la tabla de teléfonos, ambas enlazadas con Ana.

### Ejemplo real

Una tienda de ropa guarda en cada línea de pedido el precio de venta y no solo la referencia al producto. Así, tres años después, puede reproducir la factura de un pedido aunque el producto haya subido de precio.

### Resultado visual

@fig f2-9 | Figura 2.5-a. Caso A: agenda de contactos.

**Qué ves en la imagen.** Tres entidades. Un contacto está enlazado a muchos teléfonos (1 a N). Los contactos y los grupos se enlazan en ambos sentidos (N a N), algo que en la Parte 3 se resolverá con una tabla intermedia.

@fig f2-10 | Figura 2.5-b. Caso B: tienda online.

**Qué ves en la imagen.** Cuatro entidades. La línea de pedido está entre el pedido y el producto: es el puente que permite que un pedido tenga muchos productos y un producto esté en muchos pedidos. Guarda cantidad y precio de venta.

@fig f2-11 | Figura 2.5-c. Caso C: sistema de reservas.

**Qué ves en la imagen.** Tres entidades. La reserva enlaza un socio con una pista en una fecha y hora. La regla del solape no se ve en el dibujo, pero hay que anotarla junto al diseño.

### Ejercicio

1. Añade una entidad al caso C para gestionar que cada pista tenga un precio por hora distinto según el día de la semana. ¿Qué atributos tendría?
2. En el caso B, ¿por qué no basta con guardar el producto y la cantidad en el pedido? ¿Qué se pierde?
3. Haz tu propio análisis de este caso: «Un taller mecánico guarda los coches de sus clientes y las reparaciones que les hace». Escribe entidades, relaciones y una regla.

### Solución

1. Una entidad *tarifa* con atributos como pista, día de la semana y precio por hora. La relación: una pista tiene varias tarifas.
2. Se pierde el precio al que se vendió. Si el precio del producto cambia, el pedido antiguo mostraría un precio que nunca se pagó.
3. Entidades: cliente, coche, reparación. Relaciones: un cliente tiene varios coches; un coche tiene varias reparaciones. Regla: la matrícula de un coche es única.

### Error habitual

Copiar el diseño de un caso a otro sin comprobar que encaja. Una tienda y un sistema de reservas parecen similares (clientes que compran o reservan), pero tienen reglas distintas.

### Buena práctica

Reconoce los **patrones**: «varios datos del mismo tipo por entidad» (teléfonos), «puente entre dos entidades» (líneas de pedido) y «recurso con reglas de tiempo» (reservas). Una vez los identificas, reutilizas la solución.

### Comprobación

Elige un negocio cercano (una peluquería, un colegio, una biblioteca). En diez minutos escribe sus entidades, sus relaciones y una regla importante.

## 2.6 Plantilla reutilizable de análisis de requisitos de datos

### ¿Qué es?

Una **plantilla de requisitos de datos** es un documento sencillo, igual para todos los proyectos, donde recoges todo lo que has decidido en el análisis. Es el puente entre la idea y el diseño de tablas. Se rellena una ficha por entidad y una lista de relaciones y reglas.

### ¿Para qué sirve?

Para dejar el análisis por escrito de forma ordenada. Sirve para revisar con el cliente, para no olvidar decisiones y para que otra persona (o tú dentro de seis meses) entienda el proyecto sin preguntar.

### ¿Por qué lo necesito?

Los análisis hechos «de cabeza» se olvidan o se deforman. Una plantilla obliga a contestar siempre las mismas preguntas, y las preguntas olvidadas suelen ser las que luego causan problemas.

### ¿Cómo funciona?

La plantilla tiene cuatro partes:

1. **Descripción del proyecto**: tres a cinco frases.
2. **Ficha de cada entidad**: una tabla con sus atributos y, para cada uno, tipo, obligatorio, único y notas.
3. **Lista de relaciones**: cada una con su cardinalidad (uno a uno, uno a muchos, muchos a muchos).
4. **Lista de reglas** y **preguntas de negocio** que el diseño debe poder responder.

### Ejemplo sencillo

Ficha de la entidad CLIENTE de la tienda:

| Atributo | Tipo | Obligatorio | Único | Notas |
| --- | --- | --- | --- | --- |
| id | número entero | sí | sí | Identificador automático |
| nombre | texto | sí | no | Nombre completo |
| email | texto | sí | sí | Se usa para iniciar sesión |
| telefono | texto | no | no | Con prefijo internacional si se conoce |
| alta | fecha | sí | no | Por defecto, la fecha de hoy |

### Ejemplo real

Una agencia que desarrolla aplicaciones usa siempre la misma plantilla en sus reuniones con clientes. Rellenarla en directo hace que el cliente descubra, sin tecnicismos, datos en los que no había pensado («¿y las devoluciones?»), y los incorpora antes de escribir una línea de código.

### Resultado visual

@fig f2-12 | Figura 2.6-a. Ficha de entidad rellena para CLIENTE.

**Qué ves en la imagen.** Es la ficha de una entidad tal y como se vería en un documento de análisis: el nombre de la entidad arriba, su descripción, la tabla de atributos y, abajo, sus relaciones y reglas. Se rellena una por cada entidad.

### Ejercicio

1. Rellena una ficha para la entidad PRODUCTO de la tienda (atributos, tipo, obligatorio, único).
2. Escribe las relaciones y las reglas de la tienda en formato de lista.
3. ¿Por qué incluir en la plantilla las «preguntas de negocio»?

### Solución

1. Por ejemplo: `id` (entero, obligatorio, único); `nombre` (texto, obligatorio, no único); `precio_eur` (decimal, obligatorio, no único, no negativo); `stock` (entero, obligatorio, por defecto 0); `activo` (verdadero/falso, obligatorio, por defecto verdadero).
2. Relaciones: cliente–pedido (uno a muchos); pedido–línea de pedido (uno a muchos); producto–línea de pedido (uno a muchos). Reglas: email único; precio no negativo; cantidad mayor que cero.
3. Porque son la prueba de que el diseño sirve. Si una pregunta importante no se puede responder con las fichas, falta información en el diseño.

### Error habitual

Rellenar la plantilla una sola vez, al principio, y no actualizarla. Un análisis desactualizado engaña más que ayuda.

### Buena práctica

Guarda la plantilla junto al código (por ejemplo, en un documento en el mismo repositorio) y actualízala cada vez que cambie el diseño.

### Comprobación

Con la plantilla de un proyecto, otra persona debería poder responder, sin preguntarte, qué datos se guardan, cuáles son obligatorios y qué reglas existen.

## Resumen de la Parte 2

- Antes de crear tablas se piensa: describir, subrayar, anotar, relacionar, escribir reglas y revisar con preguntas reales.
- Las entidades son las cosas que se guardan (futuras tablas); los atributos son sus características (futuras columnas); las relaciones las conectan; las reglas limitan lo que está permitido.
- Cada atributo se decide como obligatorio u opcional, único o repetible, con o sin valor por defecto.
- Un CRM se analiza por capas: núcleo (empresas, contactos, oportunidades) y después historial y tareas.
- Los patrones se repiten: datos múltiples por entidad (teléfonos), puentes (líneas de pedido) y recursos con tiempo (reservas).
- Una plantilla de requisitos deja el análisis por escrito y revisable.

## Glosario de la Parte 2

| Término | Significado |
| --- | --- |
| Entidad | Cosa de la que se guardan datos; acabará siendo una tabla |
| Atributo | Característica de una entidad; acabará siendo una columna |
| Relación | Conexión entre dos entidades |
| Regla | Condición que los datos deben cumplir |
| Obligatorio | Dato sin el cual la fila no tiene sentido |
| Opcional | Dato que puede faltar |
| Único | Dato que no puede repetirse entre filas |
| Valor por defecto | Valor que se usa si nadie indica otro |
| CRM | Aplicación para gestionar la relación con clientes |
| Oportunidad | Una posible venta, con importe y fase |
| Línea de pedido | Un producto con su cantidad y precio dentro de un pedido |
| Requisitos de datos | Descripción escrita de lo que se debe guardar y de sus reglas |

## Mini examen de la Parte 2

1. Nombra los seis pasos del método para pasar de una idea a los datos.
2. ¿Qué diferencia hay entre una entidad y un atributo? Pon un ejemplo.
3. En «un cliente hace varios pedidos», ¿qué palabra indica la relación?
4. ¿Cuándo es obligatorio un atributo?
5. ¿Por qué es mala idea que el teléfono del cliente sea siempre obligatorio en una tienda online?
6. Nombra cinco entidades de un CRM.
7. ¿Por qué la línea de pedido guarda su propio precio?
8. ¿Qué regla importante tiene un sistema de reservas?
9. ¿Qué partes tiene la plantilla de requisitos?
10. ¿Para qué sirven las preguntas de negocio al terminar el análisis?

### Respuestas

1. Describir la idea; subrayar entidades; anotar atributos; buscar relaciones; escribir reglas; revisar con preguntas reales.
2. Una entidad es una cosa de la que se guardan varios datos (cliente); un atributo es una característica de ella (el email del cliente).
3. El verbo «hace».
4. Cuando la fila no tiene sentido sin ese dato.
5. Algunos clientes no querrán darlo y abandonarán la compra o inventarán un número falso.
6. Por ejemplo: usuario, empresa, contacto, oportunidad y tarea.
7. Porque el precio del producto puede cambiar, y el pedido antiguo debe conservar el precio al que se vendió.
8. Que un mismo recurso no puede tener dos reservas que se solapen en el tiempo.
9. Descripción del proyecto, ficha de cada entidad, relaciones, y reglas con preguntas de negocio.
10. Para comprobar que el diseño responde a lo que el negocio necesita.

Si has acertado 8 o más, estás listo para la Parte 3. Si no, repasa los puntos de las preguntas falladas.
