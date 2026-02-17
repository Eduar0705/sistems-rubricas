const conexion = require('../models/conetion');
const getNotifications = (req, res) => {
    const cedula = req.session.cedula;
    if (!req.session.login) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    // Obtener notificaciones con información detallada de la rúbrica
    const query = `
        SELECT 
            n.*,
            rubrica_id
            nombre_rubrica,
            fecha_evaluacion,
            tipo_evaluacion,
            docente_nombre,
            docente_apellido,
            materia_nombre,
            materia_codigo,
            carrera_nombre,
            seccion_id
        FROM notificacion n
        LEFT JOIN (
                    SELECT
            			id_notif,
                        r.id AS rubrica_id,
                        r.nombre_rubrica,
                        e.fecha_evaluacion,
                        GROUP_CONCAT(DISTINCT eeval.nombre SEPARATOR ', ') AS tipo_evaluacion,
                        u.nombre AS docente_nombre,
                        u.apeliido AS docente_apellido,
                        m.nombre AS materia_nombre,
                        m.codigo AS materia_codigo,
                        c.nombre AS carrera_nombre,
                        s.id AS seccion_id
                    FROM notificacion_rubrica nr
                    INNER JOIN rubrica r ON nr.id_rubrica = r.id
            		INNER JOIN rubrica_uso ru ON r.id = ru.id_rubrica
                    INNER JOIN evaluacion e ON ru.id_eval = e.id
                    INNER JOIN seccion s ON e.id_seccion = s.id
                    INNER JOIN plan_periodo pp ON pp.id = s.id_materia_plan
                    INNER JOIN usuario_docente ud ON r.cedula_docente = ud.cedula_usuario
                    INNER JOIN usuario u ON ud.cedula_usuario = u.cedula
                    INNER JOIN materia m ON pp.codigo_materia = m.codigo
                    INNER JOIN carrera c ON pp.codigo_carrera = c.codigo
                    LEFT JOIN estrategia_empleada eemp ON e.id = eemp.id_eval
                    LEFT JOIN estrategia_eval eeval ON eemp.id_estrategia = eeval.id
            		GROUP BY rubrica_id
                    ) AS datos_adicionales ON n.id = datos_adicionales.id_notif
        WHERE n.usuario_destino = ?
        GROUP BY n.id
        ORDER BY n.fecha DESC 
        LIMIT 20
    `;

    conexion.query(query, [cedula], (err, results) => {
        const cedula = req.session.cedula;
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
    const cedula = req.session.cedula;
    const { id } = req.params;
    const query = "UPDATE notificacion SET leido = 1 WHERE id = ?";
    
    conexion.query(query, [id], (err) => {
        if (err) {
            console.error('Error al marcar notificación como leída:', err);
            return res.status(500).json({ error: 'Error al actualizar notificación' });
        }
        res.json({ success: true });
    });
};

const markAllAsRead = (req, res) => {
    const cedula = req.session.cedula;
    const query = "UPDATE notificacion SET leido = 1 WHERE usuario_destino = ?";
    
    conexion.query(query, [cedula], (err) => {
        if (err) {
            console.error('Error al marcar todas las notificaciones como leídas:', err);
            return res.status(500).json({ error: 'Error al actualizar notificaciones' });
        }
        console.log("Todas las notificaciones han sido marcadas como leidas.")
        res.json({ success: true });
    });
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
