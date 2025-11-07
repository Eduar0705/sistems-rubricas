const conexion = require('./conetion');
let mensaje;

function obtenerInfo(){
    return new Promise((resolve,reject)=>{
        conexion.query('SELECT * FROM estudiantes',(err, resul)=>{
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