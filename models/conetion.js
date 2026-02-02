const mysql = require('mysql2');

// Crear pool de conexiones (más robusto que una sola conexión)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistems_rubricas',
    waitForConnections: true,
    connectionLimit: 10, // Máximo 10 conexiones simultáneas
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, // 10 segundos
    connectTimeout: 20000 // 20 segundos para conectar
});

// Configurar conexiones del pool silenciosamente
pool.on('connection', (connection) => {
    // Configurar la conexión sin logs innecesarios
    connection.query('SET SESSION wait_timeout = 28800'); // 8 horas
    connection.query('SET SESSION interactive_timeout = 28800');
});

// Verificar conexión inicial
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar con MySQL:', err.message);
        console.error('Verifica que el servidor MySQL esté accesible');
    } else {
        console.log('✅ Conectado a la base de datos MySQL exitosamente');
        connection.release(); // Liberar la conexión de prueba
    }
});

// Ping periódico para mantener conexiones activas (cada 5 minutos) - silencioso
setInterval(() => {
    pool.query('SELECT 1', (err) => {
        if (err) {
            console.error('❌ Error crítico: Conexión a MySQL perdida -', err.message);
        }
        // Ping exitoso silencioso
    });
}, 300000); // 5 minutos

// Graceful shutdown
process.on('SIGINT', () => {
    pool.end((err) => {
        if (err) {
            console.error('Error al cerrar pool:', err);
        } else {
            console.log('Pool de conexiones cerrado correctamente');
        }
        process.exit(err ? 1 : 0);
    });
});

module.exports = pool;
