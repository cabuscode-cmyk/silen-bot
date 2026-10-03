CREATE TABLE socios (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  email  text NOT NULL UNIQUE
);

CREATE TABLE libros (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo text NOT NULL,
  autor  text NOT NULL
);

CREATE TABLE prestamos (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  socio_id         integer NOT NULL REFERENCES socios (id),
  libro_id         integer NOT NULL REFERENCES libros (id),
  fecha_salida     date NOT NULL DEFAULT current_date,
  fecha_devolucion date,
  CHECK (fecha_devolucion IS NULL OR fecha_devolucion >= fecha_salida)
);

-- Un libro no puede tener dos préstamos sin devolver a la vez
CREATE UNIQUE INDEX un_prestamo_abierto_por_libro
  ON prestamos (libro_id) WHERE fecha_devolucion IS NULL;
