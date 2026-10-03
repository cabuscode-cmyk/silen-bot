CREATE TABLE clientes (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre    text NOT NULL,
  email     text NOT NULL UNIQUE,
  telefono  text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE productos (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre     text NOT NULL,
  precio_eur numeric(10, 2) NOT NULL CHECK (precio_eur >= 0),
  stock      integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  activo     boolean NOT NULL DEFAULT true
);

CREATE TABLE pedidos (
  id         integer GENERATED ALWAYS AS IDENTITY (START WITH 101) PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id),
  fecha      date NOT NULL DEFAULT current_date,
  estado     text NOT NULL DEFAULT 'pendiente'
             CHECK (estado IN ('pendiente', 'enviado', 'entregado', 'cancelado'))
);

CREATE TABLE lineas_pedido (
  pedido_id    integer NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  producto_id  integer NOT NULL REFERENCES productos (id),
  cantidad     integer NOT NULL CHECK (cantidad > 0),
  precio_venta numeric(10, 2) NOT NULL CHECK (precio_venta >= 0),
  PRIMARY KEY (pedido_id, producto_id)
);
