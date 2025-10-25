# Sistema de Rúbricas - IUJO Barquisimeto

## Descripción

Este proyecto es un **Sistema de Gestión de Rúbricas para Evaluación Académica** desarrollado por estudiantes del Instituto Universitario Jesús Obrero (IUJO) en Barquisimeto. El sistema permite la creación, gestión y aplicación de rúbricas para la evaluación de estudiantes en entornos académicos, facilitando un proceso de evaluación más objetivo y estructurado.

El proyecto está construido utilizando **Node.js** con el framework **Express.js**, y utiliza **MySQL** como base de datos para almacenar la información de rúbricas, evaluaciones y usuarios.

## Características Principales

- **Gestión de Rúbricas**: Crear y editar rúbricas personalizadas con criterios y niveles de desempeño.
- **Evaluación de Estudiantes**: Aplicar rúbricas a evaluaciones específicas con calificaciones detalladas.
- **Sistema de Autenticación**: Registro y login de usuarios (profesores y administradores).
- **Interfaz Web**: Interfaz de usuario intuitiva construida con EJS y CSS.
- **Manejo de Errores**: Páginas de error personalizadas para 404 y 500.
- **Sesiones de Usuario**: Gestión segura de sesiones con express-session.

## Tecnologías Utilizadas

- **Backend**:
  - Node.js
  - Express.js (Framework web)
  - MySQL2 (Conexión a base de datos MySQL)
  - Express-session (Gestión de sesiones)

- **Frontend**:
  - EJS (Motor de plantillas)
  - HTML5
  - CSS3
  - JavaScript

- **Herramientas de Desarrollo**:
  - Nodemon (Reinicio automático del servidor en desarrollo)
  - Morgan (Logging de solicitudes HTTP)

## Instalación

### Prerrequisitos

- Node.js (versión 14 o superior)
- MySQL (versión 8.0 o superior)
- Git

### Pasos de Instalación

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/sistem-rubricas.git
   cd sistem-rubricas
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura la base de datos**:
   - Crea una base de datos MySQL llamada `sistem_rubricas`
   - Actualiza las credenciales de conexión en `models/conetion.js`


4. **Ejecuta el servidor**:
   - Para desarrollo: `npm run dev`
   - Para producción: `npm start`

El servidor se ejecutará en `http://localhost:3008`

## Uso

1. **Accede a la aplicación** en tu navegador web en `http://localhost:3008`
2. **Regístrate** como nuevo usuario o **inicia sesión** si ya tienes una cuenta
3. **Crea rúbricas** definiendo criterios y niveles de evaluación
4. **Aplica evaluaciones** utilizando las rúbricas creadas
5. **Revisa resultados** y genera reportes de evaluación

## Contribuidores

- **Eduar Suárez**
- **Heracles Sanchez**
- **Luis Nuñez**
- **Franchesca Izquierdo**

## Licencia

Este proyecto está bajo la Licencia ISC.

## Soporte

Para soporte técnico o preguntas sobre el proyecto, por favor contacta a los contribuidores o abre un issue en el repositorio.

---

**Instituto Universitario Jesús Obrero (IUJO) - Barquisimeto**
