# Cómo usar este manual

## A quién va dirigido y qué conseguirás

Este manual enseña bases de datos **de cero absoluto a nivel profesional**. Está pensado para alguien que no sabe qué es una tabla, una API o un servidor, y que quiere acabar siendo capaz de diseñar, crear, consultar, proteger, conectar, desplegar, mantener y escalar bases de datos para aplicaciones reales.

Quien lo termine podrá recibir una idea como «quiero crear un CRM SaaS para varias empresas» y saber analizar qué datos necesita, qué tablas y relaciones, qué tecnología elegir, cómo escribir el SQL, cómo crear la API, cómo conectar React, React Native y n8n, cómo gestionar usuarios y permisos, cómo proteger los datos, cómo hacer copias, cómo desplegar PostgreSQL en un VPS, cómo mantenerlo y cómo escalarlo.

El tronco del manual es **PostgreSQL** y el lenguaje **SQL**, y se completa con Supabase, Firebase, Airtable y otras tecnologías, para aprender a **elegir** según las necesidades de cada proyecto, no a seguir una moda.

## Cómo está organizado

El manual se organiza en bloques y partes. Cada parte se apoya en las anteriores, así que conviene seguirlas en orden.

| Bloque | Partes | Qué se consigue |
| --- | --- | --- |
| 0. Preparación | 0 | Tener tu entorno de prácticas: PostgreSQL, `psql`, un editor y tus primeros scripts |
| A. Fundamentos y diseño | 1 a 4 | Entender los datos y diseñar un modelo, primero en papel y luego en SQL |
| B. SQL, PostgreSQL y herramientas | 5 a 7 | Crear y consultar bases de datos reales en PostgreSQL |
| C. Despliegue | 8 y 9 | Tener PostgreSQL propio en un VPS o gestionado en la nube |
| D. Plataformas y tecnologías | 10 a 13 | Usar Supabase, Firebase y Airtable, y conocer el resto |
| E. Elegir, conectar y autenticar | 14 a 16 | Elegir tecnología, conectar aplicaciones y gestionar usuarios |
| F. Seguridad, rendimiento y recuperación | 17 a 19 | Proteger, optimizar y recuperar |
| G. Proyectos | 20 y proyecto final | Construir sistemas completos de principio a fin |

Las partes que aún no están escritas aparecen en el índice general marcadas como **«en preparación»**.

## Cómo se estudia cada punto

Cada punto del manual sigue los mismos pasos, siempre en el mismo orden, para que sepas dónde buscar lo que necesitas:

1. **¿Qué es?**: la definición, con palabras sencillas.
2. **¿Para qué sirve?**: qué problema resuelve.
3. **¿Por qué lo necesito?**: qué pasa si no lo conoces.
4. **¿Cómo funciona?**: lo que ocurre por dentro.
5. **Primero, sin código**: el razonamiento y las tablas hechas a mano, con datos de ejemplo.
6. **Paso a paso, con código**: lo que debes hacer, en orden, y lo que deberías ver en cada paso.
7. **Código y resultado**: el código completo, escrito en texto para que lo copies, seguido de la captura real de su ejecución y de una explicación línea a línea.
8. **Ejemplo sencillo** y 9. **ejemplo real**.
10. **Profundizando**: variantes, casos límite y detalles de nivel profesional.
11. **Ejercicio** y 12. **solución**.
13. **Error habitual**: lo que casi todo el mundo se equivoca al principio.
14. **Buena práctica**: el hábito que usan los profesionales.
15. **Comprobación**: cómo saber que lo has entendido.

Al final de cada parte hay un **resumen**, un **glosario** y un **mini examen** con sus respuestas.

## Las imágenes y el código

Cada ejemplo lleva su código escrito **y** una imagen del resultado en la interfaz. Hay tres tipos de imagen, que siempre se identifican en su pie de figura:

- **Captura real de `psql` o de la terminal** (fondo oscuro): la salida exacta de ejecutar el código en PostgreSQL 16.14 y en Node.js. Se ha generado ejecutando el código, no dibujándolo.
- **Diagrama generado desde la base de datos real**: los diagramas de tablas con sus claves se construyen leyendo la estructura de la base de datos.
- **Ilustración**: un dibujo hecho para explicar una idea (por ejemplo, las tablas «a mano»). El pie lo dice siempre.

No se presenta ninguna ilustración como si fuera una captura real. Cuando una herramienta no ha podido ejecutarse en el entorno donde se creó el manual (por ejemplo, el instalador de Windows o las herramientas gráficas), el texto lo indica y no incluye capturas inventadas.

## Cómo practicar

1. **Empieza por la Parte 0**, que te explica, paso a paso, dónde y cómo escribir el código.
2. **Practica cada punto**: lee, predice el resultado, ejecuta, compara con la captura, rómpelo a propósito y haz el ejercicio.
3. **Usa los scripts**: cada parte tiene un archivo `.sql` (por ejemplo, `parte-01.sql`) con todo el código de sus ejemplos, en orden.
4. **Primero a mano, después con código**: en los puntos de tablas y relaciones, haz siempre primero el ejercicio sin código, con papel y lápiz o una hoja de cálculo.

## Qué está verificado

Todo el SQL del manual se ha ejecutado en PostgreSQL 16.14, y las capturas de resultados son de esas ejecuciones. Las instrucciones de instalación en Windows, macOS y Docker siguen la documentación oficial, pero no se han podido ejecutar en el entorno donde se generó el manual. Cuando algo difiera en tu sistema, la documentación oficial de PostgreSQL (`postgresql.org/docs`) manda.

**Estado de esta edición:** incluye las partes {{partes_disponibles}}. Las demás aparecen como «en preparación» en el índice.
