const connection = require('./models/conetion');

const alterTableQuery = `
    ALTER TABLE notificaciones 
    ADD COLUMN IF NOT EXISTS rubrica_id INT,
    ADD FOREIGN KEY (rubrica_id) REFERENCES rubrica_evaluacion(id) ON DELETE CASCADE
`;

connection.query(alterTableQuery, (err, results) => {
    if (err) {
        // Si el error es porque la columna ya existe, no es problema
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('✓ Column rubrica_id already exists.');
            process.exit(0);
        } else {
            console.error('Error altering table:', err);
            process.exit(1);
        }
    } else {
        console.log('✓ Column rubrica_id added successfully.');
        process.exit(0);
    }
});
