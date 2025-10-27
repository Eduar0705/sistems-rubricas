const myslq = require('mysql');

//Conexion local
const conexion1 = myslq.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistemrubricas'
})

//Conexion en la nuve
const conexion = myslq.createConnection({
    host: 'mysql-sistems.alwaysdata.net',
    user: 'sistems',
    password: '31466704',
    database: 'sistems_rubricas'
})

conexion.connect((err)=>{
    if(err){
        console.log('El error de conexion es: '+ err);
        return;
    }else{
        console.log('Conexion exitosa a la base de datos');
    }
})

module.exports = conexion;