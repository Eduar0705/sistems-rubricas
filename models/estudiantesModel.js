const conexion = require('./conetion');
let mensaje;

function obtenerInfo(){
    return new Promise((resolve,reject)=>{
        // Check if table exists first
        conexion.query('SHOW TABLES LIKE "estudiante"', (err, tables) => {
            if(err){
                console.log('Error checking table existence: ', err)
                reject(err)
                return;
            }

            if(tables.length === 0) {
                // Table doesn't exist, try with singular form
                conexion.query('SELECT * FROM estudiante',(err, resul)=>{
                    if(err){
                        console.log('Error en extraer la informacion de la base de datos: ', err)
                        mensaje = 'Error al obtener la informacion'
                        reject(err)
                    }else{
                        resolve(resul)
                    }
                })
            } else {
                // Table exists with plural name
                conexion.query('SELECT * FROM estudiantes',(err, resul)=>{
                    if(err){
                        console.log('Error en extraer la informacion de la base de datos: ', err)
                        mensaje = 'Error al obtener la informacion'
                        reject(err)
                    }else{
                        resolve(resul)
                    }
                })
            }
        })
    })
}

function obtenerSeccion(){
    return new Promise((resolve,reject)=>{
        conexion.query('SELECT * FROM seccion',(err, resul)=>{
            if(err){
                console.log('Error en extraer la informacion de la base de datos: ', err)
                mensaje = 'Error al obtener la informacion'
                reject(err)
            }else{
                resolve(resul)
            }
        })
    })
}

module.exports = {
    obtenerInfo,
    obtenerSeccion
};