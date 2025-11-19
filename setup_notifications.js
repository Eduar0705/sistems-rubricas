const connection = require('./models/conetion');

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notificaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mensaje TEXT NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        leido BOOLEAN DEFAULT FALSE,
        tipo VARCHAR(50) DEFAULT 'info',
        usuario_destino VARCHAR(20) DEFAULT 'admin'
    )
`;

connection.query(createTableQuery, (err, results) => {
    if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    } else {
        console.log('✓ Table "notificaciones" created successfully or already exists.');
        process.exit(0);
    }
});
