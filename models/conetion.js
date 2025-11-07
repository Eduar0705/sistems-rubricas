const mysql = require('mysql2');

let conexion;

function crearConexion() {
    conexion = mysql.createConnection({
        host: 'mysql-sistems.alwaysdata.net',
        user: 'sistems',
        password: '31466704',
        database: 'sistems_rubricas',
        connectTimeout: 10000, // 10 segundos
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    });

    conexion.connect((err) => {
        if (err) {
            console.log('Error de conexión:', err.message);
            setTimeout(crearConexion, 2000); // Reintentar en 2 segundos
        } else {
            console.log('Conexión exitosa a la base de datos :D');
        }
    });

    conexion.on('error', (err) => {
        console.log('Error MySQL:', err.code);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || 
            err.code === 'ECONNRESET' || 
            err.code === 'ETIMEDOUT') {
            console.log('Reconectando...');
            crearConexion();
        }
    });
}

// Iniciar conexión
crearConexion();

// Ping cada 4 minutos
setInterval(() => {
    if (conexion && conexion.state !== 'disconnected') {
        conexion.ping((err) => {
            if (err) {
                console.log('Ping falló, reconectando...');
                crearConexion();
            }
        });
    }
}, 240000);

module.exports = conexion;