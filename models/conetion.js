const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'mysql-sistems.alwaysdata.net',
    user: 'sistems',
    password: '31466704',
    database: 'sistems_rb'
});

conexion.connect((err) => {
    if (err) {
        console.log('Error de conexión a la base de datos:', err);
        return;
    } else {
        console.log('Conexión exitosa a la base de datos en AlwaysData :D....');
    }
});

// Mantener conexión viva
setInterval(() => {
    conexion.query('SELECT 1', (err) => {
        if (err) {
            console.log('Error en ping:', err);
            // Reconectar automáticamente
            conexion.connect((connectErr) => {
                if (!connectErr) console.log('Reconexión automática exitosa');
            });
        }
    });
}, 300000); // Cada 5 minutos

// Manejar errores de conexión
conexion.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
        console.log('Conexión perdida, reconectando...');
        setTimeout(() => {
            conexion.connect();
        }, 2000);
    } else {
        console.log('Error MySQL:', err);
    }
});

module.exports = conexion;