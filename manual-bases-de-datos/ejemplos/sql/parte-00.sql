-- ============================================================
-- Manual completo de bases de datos — Parte 00
-- Todo el código de los ejemplos, en el orden en que aparece.
--
-- Cómo usarlo:  psql -U postgres -f parte-00.sql
--           (o, dentro de psql:  \i parte-00.sql )
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
CREATE DATABASE ensayo;

-- ------------------------------------------------------------
-- Figura r0-1 (comandos de terminal)
-- ------------------------------------------------------------
-- $ psql --version
-- $ pg_isready -h /tmp -p 5433 -U postgres

-- ------------------------------------------------------------
-- Figura r0-2 (base de datos: postgres)
-- ------------------------------------------------------------
\c postgres
SELECT 2 + 3 AS suma;
SELECT 'Hola, PostgreSQL' AS saludo;
SELECT current_database() AS base_actual, current_user AS usuario;

-- ------------------------------------------------------------
-- Figura r0-3 (base de datos: postgres)
-- ------------------------------------------------------------
\c postgres
SELECT 2 + 3 AS suma

;
SELEC 2 + 3;
SELECT * FROM tabla_que_no_existe;

-- ------------------------------------------------------------
-- Figura r0-4 (base de datos: postgres)
-- ------------------------------------------------------------
\c postgres
CREATE DATABASE ensayo;

CREATE DATABASE tienda;

\l ensayo

\l tienda

-- ------------------------------------------------------------
-- Figura r0-9 (base de datos: postgres)
-- ------------------------------------------------------------
\c postgres
\l
\c ensayo
\dt
\d

-- ------------------------------------------------------------
-- Figura r0-5 (comandos de terminal)
-- ------------------------------------------------------------
-- $ cat primer_script.sql
-- $ psql -h /tmp -p 5433 -U postgres -d ensayo -f primer_script.sql

-- ------------------------------------------------------------
-- Figura r0-6 (comandos de terminal)
-- ------------------------------------------------------------
-- $ psql -h /tmp -p 5433 -U postgres -d ensayo -c "\i primer_script.sql"
-- $ psql -h /tmp -p 5433 -U postgres -d ensayo -c "DROP TABLE saludos;"
-- $ psql -h /tmp -p 5433 -U postgres -d ensayo -c "\i primer_script.sql"

-- ------------------------------------------------------------
-- Figura r0-8 (base de datos: ensayo)
-- ------------------------------------------------------------
\c ensayo
DROP TABLE saludos;

\dt

-- ------------------------------------------------------------
-- Figura r0-7 (comandos de terminal)
-- ------------------------------------------------------------
-- $ psqll --version
-- $ psql -h localhost -p 5999 -U postgres -c "SELECT 1"
-- $ psql -h /tmp -p 5433 -U postgres -d nada -c "SELECT 1"

