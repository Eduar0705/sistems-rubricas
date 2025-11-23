const conexion = require('../models/conetion');

const getNotifications = (req, res) => {
    if (!req.session.login) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    // Obtener notificaciones con información detallada de la rúbrica
    const query = `
        SELECT 
            n.*,
            r.id as rubrica_id,
            r.nombre_rubrica,
            r.fecha_evaluacion,
            r.tipo_evaluacion,
            d.nombre as docente_nombre,
            d.apellido as docente_apellido,
            m.nombre as materia_nombre,
            m.codigo as materia_codigo,
            c.nombre as carrera_nombre,
            s.id as seccion_id
        FROM notificaciones n
        LEFT JOIN rubrica_evaluacion r ON n.rubrica_id = r.id
        LEFT JOIN docente d ON r.docente_cedula = d.cedula
        LEFT JOIN materia m ON r.materia_codigo = m.codigo
        LEFT JOIN carrera c ON m.carrera_codigo = c.codigo
        LEFT JOIN seccion s ON r.seccion_id = s.id
        WHERE n.usuario_destino = 'admin' 
        ORDER BY n.fecha DESC 
        LIMIT 20
    `;

    conexion.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener notificaciones:', err);
            return res.status(500).json({ error: 'Error al obtener notificaciones' });
        }
        
        // Contar no leídas
        const unreadCount = results.filter(n => !n.leido).length;
        
        res.json({
            notifications: results,
            unreadCount: unreadCount
        });
    });
};

const markAsRead = (req, res) => {
    const { id } = req.params;
    const query = "UPDATE notificaciones SET leido = 1 WHERE id = ?";
    
    conexion.query(query, [id], (err) => {
        if (err) {
            console.error('Error al marcar notificación como leída:', err);
            return res.status(500).json({ error: 'Error al actualizar notificación' });
        }
        res.json({ success: true });
    });
};

const markAllAsRead = (req, res) => {
    const query = "UPDATE notificaciones SET leido = 1 WHERE usuario_destino = 'admin'";
    
    conexion.query(query, (err) => {
        if (err) {
            console.error('Error al marcar todas las notificaciones como leídas:', err);
            return res.status(500).json({ error: 'Error al actualizar notificaciones' });
        }
        res.json({ success: true });
    });
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
