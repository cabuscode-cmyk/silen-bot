const http = require('http');
const { Pool } = require('pg');

// La API se conecta a la base de datos con la URL que le pasamos desde fuera
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

http.createServer(async (req, res) => {
  if (req.url === '/clientes') {
    // La API pregunta a la base de datos y devuelve el resultado como JSON
    const resultado = await pool.query('SELECT id, nombre, email FROM clientes ORDER BY id');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resultado.rows));
  } else {
    res.statusCode = 404;
    res.end('No encontrado');
  }
}).listen(3000);
