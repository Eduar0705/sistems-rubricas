const mysql = require('mysql2');

// Configuración para la base de datos en la nube (AlwaysData)
const conexion = mysql.createConnection({
    host: 'mysql-sistems.alwaysdata.net',
    user: 'sistems',
    password: '31466704',
    database: 'sistems_rubricas',
    connectTimeout: 60000, // Solo esta opción es válida
});

// Usar manejo de errores mejorado
conexion.connect((err) => {
    if (err) {
        console.log('Error de conexión a la base de datos:', err);
        
        // Diagnosticar el problema específico
        if (err.code === 'ECONNREFUSED') {
            console.log(' No se puede conectar al servidor MySQL. Verifica:');
            console.log('   - Que el host sea correcto: mysql-sistems.alwaysdata.net');
            console.log('   - Que el servicio esté activo en AlwaysData');
            console.log('   - Que las credenciales sean correctas');
            console.log('   - Que no haya bloqueos de firewall');
        } 
        else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('Error de autenticación. Verifica usuario y contraseña');
        }
        
        return;
    } else {
        console.log('Conexión exitosa a la base de datos en AlwaysData');
    }
});

// Manejar errores durante la conexión
conexion.on('error', (err) => {
    console.log('Error en la conexión MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('La conexión con la base de datos fue cerrada');
    } 
    else if (err.code === 'ER_CON_COUNT_ERROR') {
        console.log('Demasiadas conexiones a la base de datos');
    } 
    else if (err.code === 'ECONNREFUSED') {
        console.log('Conexión rechazada por el servidor');
    }
});

module.exports = conexion;