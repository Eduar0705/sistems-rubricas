const express = require('express');
const routers = express.Router();
const conexion = require('../models/conetion');

routers.post('/verifLogin', (req, res)=>{
    const { cedula, password} = req.body;

    const query = 'SELECT * FROM usuario WHERE cedula = ? AND password = ?';
    conexion.query(query, [cedula, password], (err, results)=>{
        let mensaje;
        if(err){
            console.log('Error en la consulta: ' + err);
            mensaje = 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.';
            return res.render('auth/login', { mensaje });
        }

        if(results.length <= 0){
            mensaje = 'Cédula o contraseña incorrecta. Por favor, inténtalo de nuevo.';
            return  res.render('auth/login', { mensaje });
        }

        const user = results[0];

        if(!password === user.password){
            mensaje = 'Contraseña incorrecta. Por favor, inténtalo de nuevo.';
            return res.render('auth/login', { mensaje });
        }

        //Almacenamos el usuario en la sesión
        req.session.login = true;
        req.session.id = user.id;
        req.session.username = user.username;
        req.session.email = user.email;
        req.session.id_rol = user.id_rol;
        console.log(req.session);

        if(user.id_rol === 1){
            res.redirect('/home');
        }else if(user.id_rol === 2){
            res.redirect('/teacher');
        }else if(user.id_rol === 3){
            res.redirect('/student');
        }else{
            mensaje = 'Rol de usuario no reconocido.';
            return res.render('auth/login', { mensaje });
        }
    });
})

module.exports = routers;