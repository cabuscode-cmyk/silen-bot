-- Mi primer script: crea una tabla, guarda una fila y la lee
CREATE TABLE saludos (
  id      integer PRIMARY KEY,
  mensaje text NOT NULL
);

INSERT INTO saludos VALUES (1, 'Hola, PostgreSQL');

SELECT * FROM saludos;
