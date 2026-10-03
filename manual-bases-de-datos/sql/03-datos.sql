INSERT INTO clientes (nombre, email, telefono) VALUES
  ('Ana García', 'ana@ejemplo.com', '600111222'),
  ('Luis Pérez', 'luis@ejemplo.com', NULL),
  ('Marta Ruiz', 'marta@ejemplo.com', '600333444');

INSERT INTO productos (nombre, precio_eur, stock) VALUES
  ('Camiseta', 19.95, 12),
  ('Gorra', 9.90, 0),
  ('Mochila', 34.50, 5);

INSERT INTO pedidos (cliente_id, fecha, estado) VALUES
  (1, '2026-03-02', 'entregado'),
  (3, '2026-03-05', 'enviado'),
  (1, '2026-03-09', 'pendiente');

INSERT INTO lineas_pedido (pedido_id, producto_id, cantidad, precio_venta) VALUES
  (101, 1, 2, 19.95),
  (101, 2, 1, 9.90),
  (102, 3, 1, 34.50),
  (103, 1, 1, 19.95),
  (103, 3, 1, 34.50);
