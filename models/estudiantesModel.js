const express = require('express');
const conexion = require('./conetion');

// MODELO PARA CARRERA
function MostrarCarreras() {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM carrera', (err, results) => {
            if (err) {
                console.log('Error al obtener las carreras:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function ObtenerCarreraPorCodigo(codigo) {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM carrera WHERE codigo = ?', [codigo], (err, results) => {
            if (err) {
                console.log('Error al obtener la carrera:', err);
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

// MODELO PARA ESTUDIANTE
function MostrarEstudiantes() {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM estudiante', (err, results) => {
            if (err) {
                console.log('Error al obtener los estudiantes:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function ObtenerEstudiantePorCedula(cedula) {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM estudiante WHERE cedula = ?', [cedula], (err, results) => {
            if (err) {
                console.log('Error al obtener el estudiante:', err);
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

// MODELO PARA ESTUDIANTE_SEC
function MostrarEstudiantesSec() {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM estudiante_sec', (err, results) => {
            if (err) {
                console.log('Error al obtener estudiantes por sección:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function ObtenerEstudiantesPorSeccion(id_sec) {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM estudiante_sec WHERE id_sec = ?', [id_sec], (err, results) => {
            if (err) {
                console.log('Error al obtener estudiantes de la sección:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// MODELO PARA SECCION
function MostrarSecciones() {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM seccion', (err, results) => {
            if (err) {
                console.log('Error al obtener las secciones:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function ObtenerSeccionPorId(id) {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM seccion WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.log('Error al obtener la sección:', err);
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

// MODELO PARA SEMESTRE
function MostrarSemestres() {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM semestre', (err, results) => {
            if (err) {
                console.log('Error al obtener los semestres:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

function ObtenerSemestrePorPeriodo(periodo) {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM semestre WHERE periodo = ?', [periodo], (err, results) => {
            if (err) {
                console.log('Error al obtener el semestre:', err);
                reject(err);
            } else {
                resolve(results[0]);
            }
        });
    });
}

module.exports = {
    // Carreras
    MostrarCarreras,
    ObtenerCarreraPorCodigo,
    
    // Estudiantes
    MostrarEstudiantes,
    ObtenerEstudiantePorCedula,
    
    // Estudiantes por Sección
    MostrarEstudiantesSec,
    ObtenerEstudiantesPorSeccion,
    
    // Secciones
    MostrarSecciones,
    ObtenerSeccionPorId,
    
    // Semestres
    MostrarSemestres,
    ObtenerSemestrePorPeriodo
};