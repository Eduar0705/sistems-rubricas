
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `sistems_rubricas`
--
CREATE DATABASE IF NOT EXISTS `sistems_rubricas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `sistems_rubricas`;

-- --------------------------------------------------------

--
-- Table structure for table `carrera`
--

DROP TABLE IF EXISTS `carrera`;
CREATE TABLE `carrera` (
  `codigo` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `duracion_semestres` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carrera`
--

INSERT INTO `carrera` (`codigo`, `nombre`, `descripcion`, `duracion_semestres`, `activo`, `fecha_creacion`) VALUES
('ADM', 'Administración de Empresas', 'Carrera de Administración de Empresas', 6, 1, '2025-11-12 14:43:39'),
('CON', 'Contaduría', 'Carrera de Contaduría Pública', 6, 1, '2025-11-12 14:43:39'),
('EDU', 'Educacion Inicial', 'Carrera de Educación', 6, 1, '2025-11-12 14:43:39'),
('ELE', 'Electrotecnia', 'Carrera de Electrotecnia', 6, 1, '2025-11-12 14:43:39'),
('ELN', 'Electronica', 'Carrera de Electrónica', 6, 1, '2025-11-12 14:43:39'),
('INF', 'Informática', 'Carrera de Informática', 6, 1, '2025-11-12 14:43:39'),
('MEC', 'Mecánica', 'Carrera de Mecánica', 6, 1, '2025-11-12 14:43:39');

-- --------------------------------------------------------

--
-- Table structure for table `criterio_evaluacion`
--

DROP TABLE IF EXISTS `criterio_evaluacion`;
CREATE TABLE `criterio_evaluacion` (
  `id` int(11) NOT NULL,
  `rubrica_id` int(11) NOT NULL,
  `descripcion` text NOT NULL,
  `puntaje_maximo` decimal(5,2) NOT NULL,
  `orden` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `criterio_evaluacion`
--

INSERT INTO `criterio_evaluacion` (`id`, `rubrica_id`, `descripcion`, `puntaje_maximo`, `orden`) VALUES
(23, 4, 'Analisis', 3.00, 1),
(24, 4, 'desarrollo', 3.00, 2),
(25, 4, 'procedimiento', 3.00, 3),
(26, 4, 'nose que poner', 3.00, 4),
(27, 4, 'nfslkdanfk;nfan', 3.00, 5),
(30, 7, 'vlkdlksfvfmmdsklf', 5.00, 1),
(34, 8, 'Desarrolo Grafico', 6.66, 1),
(35, 8, 'Desarrolo backent', 6.66, 2),
(36, 8, 'Como cae', 6.66, 3),
(38, 10, 'fjdnsflk', 10.00, 1),
(39, 11, 'fjkdnkf', 10.00, 1),
(41, 12, 'kldsnfkl', 10.00, 1),
(42, 13, 'Presenta la teoría  relacionada con el  tema  (2ptos)', 2.00, 1),
(43, 13, 'Presenta  elementos  interactivos  valiosos en su  presentación   ( 2 ptos)', 2.00, 2),
(44, 13, 'Uso de la  Creatividad  (1ptos)', 1.00, 3),
(45, 14, 'Reconoce y realiza  los cálculos  correspondientes  los coeficientes e  correlación  (4 ptos)', 3.33, 1),
(46, 14, 'Realiza análisis de  los resultados  obtenidos  (4 ptos)', 3.33, 2),
(47, 14, 'Responde a  preguntas  realizadas de  manera teórica  acerca del tema  que se está  evaluando   ( 2 ptos)', 2.00, 3),
(48, 15, 'Realiza Diagrama de  árbol  (3 ptos)', 2.50, 1),
(49, 15, 'Extrae elementos  del espacio muestral  perteneciente a  un  diagrama de árbol  realizado  ( 3 pto)', 2.50, 2),
(50, 15, 'Realiza  interacciones  matemáticas con  eventos  a partir  de  un diagrama de  Venn (análisis  gráfico) ( 2ptos)', 2.50, 3),
(51, 15, 'Realiza  interacciones  matemáticas con  eventos a partir de  un Espacio muestral  ( análisis escrito) (2  ptos)', 2.50, 4),
(52, 16, 'Dominio del Tema', 4.00, 1),
(53, 16, 'Fluidez y Expresión Oral (Sin Lectura)', 2.00, 2),
(54, 16, 'Ejemplos Acordes y Entendibles', 1.00, 3),
(55, 16, 'Material de Apoyo y Uso del Tiempo', 2.00, 4),
(56, 16, 'Atención del público.', 1.00, 5);

-- --------------------------------------------------------

--
-- Table structure for table `detalle_evaluacion`
--

DROP TABLE IF EXISTS `detalle_evaluacion`;
CREATE TABLE `detalle_evaluacion` (
  `id` int(11) NOT NULL,
  `evaluacion_id` int(11) NOT NULL,
  `criterio_id` int(11) NOT NULL,
  `nivel_seleccionado` int(11) NOT NULL,
  `puntaje_obtenido` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detalle_evaluacion`
--

INSERT INTO `detalle_evaluacion` (`id`, `evaluacion_id`, `criterio_id`, `nivel_seleccionado`, `puntaje_obtenido`) VALUES
(14, 29, 23, 89, 3.00),
(15, 29, 24, 94, 2.25),
(16, 29, 25, 97, 3.00),
(17, 29, 26, 103, 1.50),
(18, 29, 27, 105, 3.00),
(19, 51, 30, 117, 5.00),
(20, 58, 34, 133, 6.66),
(21, 58, 35, 138, 5.00),
(22, 58, 36, 142, 5.00),
(23, 65, 34, 134, 5.00),
(24, 65, 35, 139, 3.33),
(25, 65, 36, 141, 6.66),
(26, 59, 34, 133, 6.66),
(27, 59, 35, 140, 1.67),
(28, 59, 36, 144, 1.67),
(29, 61, 34, 134, 5.00),
(30, 61, 35, 138, 5.00),
(31, 61, 36, 142, 5.00),
(32, 64, 34, 133, 6.66),
(33, 64, 35, 139, 3.33),
(34, 64, 36, 141, 6.66),
(35, 57, 34, 133, 6.66),
(36, 57, 35, 138, 5.00),
(37, 57, 36, 144, 1.67),
(38, 56, 34, 135, 3.33),
(39, 56, 35, 139, 3.33),
(40, 56, 36, 144, 1.67),
(41, 63, 34, 136, 1.67),
(42, 63, 35, 139, 3.33),
(43, 63, 36, 144, 1.67),
(44, 60, 34, 136, 1.67),
(45, 60, 35, 140, 1.67),
(46, 60, 36, 144, 1.67),
(47, 62, 34, 133, 6.66),
(48, 62, 35, 137, 6.66),
(49, 62, 36, 141, 6.66),
(50, 67, 45, 178, 2.50),
(51, 67, 46, 182, 2.50),
(52, 67, 47, 185, 2.00),
(53, 86, 42, 165, 2.00),
(54, 86, 43, 169, 2.00),
(55, 86, 44, 176, 0.25),
(56, 53, 30, 117, 5.00),
(57, 48, 30, 118, 3.75),
(58, 66, 34, 134, 5.00),
(59, 66, 35, 138, 5.00),
(60, 66, 36, 142, 5.00),
(61, 98, 39, 154, 7.50);

-- --------------------------------------------------------

--
-- Table structure for table `docente`
--

DROP TABLE IF EXISTS `docente`;
CREATE TABLE `docente` (
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `especializacion` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telf` varchar(20) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `docente`
--

INSERT INTO `docente` (`cedula`, `nombre`, `apellido`, `especializacion`, `email`, `telf`, `descripcion`, `activo`) VALUES
('11223344', 'Carlos', 'González', 'Física Teórica', 'carlos.gonzalez@universidad.edu', '0424-5556677', 'Especialista en mecánica cuántica', 1),
('12345678', 'Juan', 'Pérez', 'matematicas', 'juan.perez@universidad.edu', '04121234545', 'Docente especializado en estadística aplicada', 1),
('123456789', 'Eduardo', 'Venegas', 'informatico', 'eduardovenegas@iujo.edu.ve', '04163598425', 'Redes de Computadoras\r\nMatematicas\r\nArquitectura del computador\r\noperaciones financieras\r\nestadisticas\r\nTIC\r\nIntriductorio', 1),
('27739757', 'Katerine', 'Suarez', 'informatica', 'katerine@gmail.comm', '04140457750', '', 1),
('30068297', 'Lorraine', 'Amaro', 'informatico', 'lorraineamaro@gmail.com', '04140445566', '', 1),
('30916457', 'Greymar', 'Medina', 'informatico', 'grey@gmail.com', '04145001111', 'CRACK, IDOLA, MAQUINA DE PROGRAMAR', 1),
('30987788', 'Franchesca', 'Izquierdo', 'quimica', 'franchesca@gmail.com', '04145007777', 'Franchesca es seda profesora paguen bien que ella da clases de lo que sea tambien raspa a todos hajajajaja', 1),
('31466704', 'Eduar', 'Suarez', 'informatico', 'suarezeduar420@gmail.com', '04140547750', 'Sendo coco idolo, crack, bestia', 1),
('31544532', 'Jesus', 'Camacho', 'informatico', 'jesuscamacho@gmail.com', '04220445566', '', 1),
('31987430', 'Heracles', 'Sanchez', 'informatico', 'heraclesenmanuel@gmail.com', '04245354900', 'Un duro pagen bien que da clases de lo que sea jajaja', 1),
('32366214', 'Ezequiel', 'Angulo', 'informatico', 'ezequielangulo@gmail.com', '04145000000', 'El mejor profe de Css', 1),
('33445566', 'Laura', 'Fernández', 'Redes de Computadoras', 'laura.fernandez@universidad.edu', '0426-3334445', 'Especialista en seguridad de redes', 1),
('55667788', 'Ana', 'Martínez', 'Programación', 'ana.martinez@universidad.edu', '0412-4445566', 'Desarrolladora senior con 10 años de experiencia', 1),
('87654321', 'María', 'Rodríguez', 'Matemáticas Avanzadas', 'maria.rodriguez@universidad.edu', '0416-9876543', 'Doctora en Matemáticas Aplicadas', 1),
('99887766', 'Roberto', 'Silva', 'Base de Datos', 'roberto.silva@universidad.edu', '0416-7778889', 'Administrador de bases de datos Oracle', 1),
('V-12345678', 'Carlos', 'Martínez', 'Matemáticas Aplicadas', 'carlos.martinez@instituto.edu', '0412-1111111', NULL, 1),
('V-12345679', 'Ana', 'González', 'Física y Ciencias', 'ana.gonzalez@instituto.edu', '0412-1111112', NULL, 1),
('V-12345680', 'Roberto', 'Pérez', 'Estadística', 'roberto.perez@instituto.edu', '0412-1111113', NULL, 1),
('V-12345681', 'María', 'Rodríguez', 'Matemáticas Financieras', 'maria.rodriguez@instituto.edu', '0412-1111114', NULL, 1),
('V-12345682', 'Luis', 'Hernández', 'Administración General', 'luis.hernandez@instituto.edu', '0412-1111115', NULL, 1),
('V-12345683', 'Carmen', 'López', 'Contabilidad', 'carmen.lopez@instituto.edu', '0412-1111116', NULL, 1),
('V-12345684', 'Jorge', 'Díaz', 'Finanzas y Auditoría', 'jorge.diaz@instituto.edu', '0412-1111117', NULL, 1),
('V-12345685', 'Elena', 'Morales', 'Legislación Comercial', 'elena.morales@instituto.edu', '0412-1111118', NULL, 1),
('V-12345686', 'Isabel', 'Rojas', 'Pedagogía', 'isabel.rojas@instituto.edu', '0412-1111119', NULL, 1),
('V-12345687', 'Pedro', 'Castillo', 'Psicología Educativa', 'pedro.castillo@instituto.edu', '0412-1111120', NULL, 1),
('V-12345688', 'Laura', 'Fernández', 'Didáctica General', 'laura.fernandez@instituto.edu', '0412-1111121', NULL, 1),
('V-12345689', 'Ricardo', 'Silva', 'Planificación Educativa', 'ricardo.silva@instituto.edu', '0412-1111122', NULL, 1),
('V-12345690', 'Andrés', 'Mendoza', 'Circuitos Eléctricos', 'andres.mendoza@instituto.edu', '0412-1111123', NULL, 1),
('V-12345691', 'Patricia', 'Castro', 'Electrónica', 'patricia.castro@instituto.edu', '0412-1111124', NULL, 1),
('V-12345692', 'Fernando', 'Ortega', 'Sistemas Digitales', 'fernando.ortega@instituto.edu', '0412-1111125', NULL, 1),
('V-12345693', 'Diana', 'Vargas', 'Instrumentación Electrónica', 'diana.vargas@instituto.edu', '0412-1111126', NULL, 1),
('V-12345694', 'Gabriel', 'Reyes', 'Máquinas y Herramientas', 'gabriel.reyes@instituto.edu', '0412-1111127', NULL, 1),
('V-12345695', 'Sandra', 'Navarro', 'Dibujo Industrial', 'sandra.navarro@instituto.edu', '0412-1111128', NULL, 1),
('V-12345696', 'Raúl', 'Jiménez', 'Control Numérico', 'raul.jimenez@instituto.edu', '0412-1111129', NULL, 1),
('V-12345697', 'Verónica', 'Molina', 'Automatismos', 'veronica.molina@instituto.edu', '0412-1111130', NULL, 1),
('V-12345698', 'Miguel', 'Romero', 'Programación', 'miguel.romero@instituto.edu', '0412-1111131', NULL, 1),
('V-12345699', 'Natalia', 'Suárez', 'Base de Datos', 'natalia.suarez@instituto.edu', '0412-1111132', NULL, 1),
('V-12345700', 'Diego', 'Paredes', 'Redes de Computadoras', 'diego.paredes@instituto.edu', '0412-1111133', NULL, 1),
('V-12345701', 'Carolina', 'Ríos', 'Sistemas Operativos', 'carolina.rios@instituto.edu', '0412-1111134', NULL, 1),
('V-12345702', 'Oscar', 'Miranda', 'Lenguaje y Comunicación', 'oscar.miranda@instituto.edu', '0412-1111135', NULL, 1),
('V-12345703', 'Teresa', 'Guerrero', 'Inglés Técnico', 'teresa.guerrero@instituto.edu', '0412-1111136', NULL, 1),
('V-12345704', 'Héctor', 'Rivas', 'Realidad Nacional', 'hector.rivas@instituto.edu', '0412-1111137', NULL, 1),
('V-12345705', 'Lucía', 'Campos', 'Ética Profesional', 'lucia.campos@instituto.edu', '0412-1111138', NULL, 1),
('V-12345706', 'Francisco', 'Acosta', 'Metodología de Investigación', 'francisco.acosta@instituto.edu', '0412-1111139', NULL, 1),
('V-12345707', 'Rosa', 'Medina', 'Formación Humana', 'rosa.medina@instituto.edu', '0412-1111140', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `estudiante`
--

DROP TABLE IF EXISTS `estudiante`;
CREATE TABLE `estudiante` (
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `carrera_codigo` varchar(10) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estudiante`
--

INSERT INTO `estudiante` (`cedula`, `nombre`, `apellido`, `email`, `telefono`, `fecha_nacimiento`, `carrera_codigo`, `activo`, `password`) VALUES
('10000001', 'Héctor', 'Campos', 'hector.campos@est.edu', '04121234653', '2001-03-10', 'ELE', 1, '4545'),
('10000002', 'Valeria', 'Santos', 'valeria.santos@est.edu', '04141234654', '2000-07-17', 'ELE', 1, '4545'),
('10000003', 'Felipe', 'Cortés', 'felipe.cortes@est.edu', '04161234655', '2002-01-06', 'ELE', 1, '4545'),
('10000004', 'Clara', 'Mora', 'clara.mora@est.edu', '04121234656', '2001-09-01', 'ELE', 1, '4545'),
('10000005', 'Álvaro', 'Guerrero', 'alvaro.guerrero@est.edu', '04141234657', '2000-12-13', 'ELE', 1, '4545'),
('10000006', 'Blanca', 'León', 'blanca.leon@est.edu', '04161234658', '2002-04-20', 'ELE', 1, '4545'),
('10000007', 'Diego', 'Peña', 'diego.pena@est.edu', '04121234659', '2001-08-26', 'ELE', 1, '4545'),
('10000008', 'Miriam', 'Iglesias', 'miriam.iglesias@est.edu', '04141234660', '2000-11-08', 'ELE', 1, '4545'),
('10000009', 'Óscar', 'Caballero', 'oscar.caballero@est.edu', '04161234661', '2002-02-23', 'ELE', 1, '4545'),
('10000010', 'Rebeca', 'Pascual', 'rebeca.pascual@est.edu', '04121234662', '2001-06-10', 'ELE', 1, '4545'),
('10000011', 'Gabriel', 'Soto', 'gabriel.soto@est.edu', '04141234663', '2000-10-04', 'ELE', 1, '4545'),
('10000012', 'Esther', 'Fuentes', 'esther.fuentes@est.edu', '04161234664', '2002-05-16', 'ELE', 1, '4545'),
('10000013', 'Nicolás', 'Parra', 'nicolas.parra@est.edu', '04121234665', '2001-01-12', 'ELE', 1, '4545'),
('10000014', 'Aurora', 'Montero', 'aurora.montero@est.edu', '04141234666', '2000-09-18', 'ELE', 1, '4545'),
('10000015', 'Simón', 'Vázquez', 'simon.vazquez@est.edu', '04161234667', '2002-03-07', 'ELE', 1, '4545'),
('10000016', 'Noelia', 'Herrera', 'noelia.herrera@est.edu', '04121234668', '2001-07-22', 'ELE', 1, '4545'),
('10000017', 'Jaime', 'Cano', 'jaime.cano@est.edu', '04141234669', '2000-11-26', 'ELE', 1, '4545'),
('10000018', 'Olivia', 'Prieto', 'olivia.prieto@est.edu', '04161234670', '2002-04-11', 'ELE', 1, '4545'),
('10000019', 'Martín', 'Márquez', 'martin.marquez@est.edu', '04121234671', '2001-08-15', 'ELE', 1, '4545'),
('10000020', 'Emma', 'Carrasco', 'emma.carrasco@est.edu', '04141234672', '2000-12-21', 'ELE', 1, '4545'),
('10000021', 'Sebastián', 'Lara', 'sebastian.lara@est.edu', '04161234673', '2002-01-26', 'ELE', 1, '4545'),
('10000022', 'Victoria', 'Bravo', 'victoria.bravo@est.edu', '04121234674', '2001-05-04', 'ELE', 1, '4545'),
('10000023', 'Leonardo', 'Núñez', 'leonardo.nunez@est.edu', '04141234675', '2000-09-10', 'ELE', 1, '4545'),
('10000024', 'Jimena', 'Cabrera', 'jimena.cabrera@est.edu', '04161234676', '2002-02-16', 'ELE', 1, '4545'),
('10000025', 'Matías', 'Rojas', 'matias.rojas@est.edu', '04121234677', '2001-06-24', 'ELE', 1, '4545'),
('10000026', 'Alma', 'Gallego', 'alma.gallego@est.edu', '04141234678', '2000-10-12', 'ELE', 1, '4545'),
('10000027', 'Thiago', 'Domínguez', 'thiago.dominguez@est.edu', '04161234679', '2002-03-18', 'ELE', 1, '4545'),
('10000028', 'Carla', 'Rubio', 'carla.rubio@est.edu', '04121234680', '2001-07-06', 'ELE', 1, '4545'),
('10000029', 'Benjamín', 'Ibáñez', 'benjamin.ibanez@est.edu', '04141234681', '2000-11-01', 'ELE', 1, '4545'),
('10000030', 'Abril', 'Méndez', 'abril.mendez@est.edu', '04161234682', '2002-04-14', 'ELE', 1, '4545'),
('10000031', 'Santiago', 'Suárez', 'santiago.suarez@est.edu', '04121234683', '2001-08-20', 'ELE', 1, '4545'),
('10000032', 'Valentina', 'Ferrer', 'valentina.ferrer@est.edu', '04141234684', '2000-12-08', 'ELE', 1, '4545'),
('10000033', 'Maximiliano', 'Carmona', 'maximiliano.carmona@est.edu', '04161234685', '2002-05-23', 'ELE', 1, '4545'),
('10000034', 'Isabella', 'Soler', 'isabella.soler@est.edu', '04121234686', '2001-01-10', 'ELE', 1, '4545'),
('10000035', 'Emiliano', 'Marín', 'emiliano.marin@est.edu', '04141234687', '2000-09-04', 'ELE', 1, '4545'),
('10000036', 'Camila', 'Giménez', 'camila.gimenez@est.edu', '04161234688', '2002-02-12', 'ELE', 1, '4545'),
('10000037', 'Joaquín', 'Muñoz', 'joaquin.munoz@est.edu', '04121234689', '2001-06-18', 'ELE', 1, '4545'),
('10000038', 'Martina', 'Sanz', 'martina.sanz@est.edu', '04141234690', '2000-10-25', 'ELE', 1, '4545'),
('10000039', 'Agustín', 'Flores', 'agustin.flores@est.edu', '04161234691', '2002-03-01', 'ELE', 1, '4545'),
('10000040', 'Renata', 'Cruz', 'renata.cruz@est.edu', '04121234692', '2001-07-14', 'ELE', 1, '4545'),
('10000041', 'Lorenzo', 'Rivas', 'lorenzo.rivas@est.edu', '04141234693', '2000-11-19', 'ELE', 1, '4545'),
('10000042', 'Lola', 'Molina', 'lola.molina@est.edu', '04161234694', '2002-04-26', 'ELE', 1, '4545'),
('10000043', 'Gael', 'Ortega', 'gael.ortega@est.edu', '04121234695', '2001-08-03', 'ELE', 1, '4545'),
('11000001', 'Ian', 'Vidal', 'ian.vidal@est.edu', '04121234696', '2001-03-08', 'ELN', 1, '4545'),
('11000002', 'Miranda', 'Santana', 'miranda.santana@est.edu', '04141234697', '2000-07-15', 'ELN', 1, '4545'),
('11000003', 'Damián', 'Román', 'damian.roman@est.edu', '04161234698', '2002-01-04', 'ELN', 1, '4545'),
('11000004', 'Daniela', 'Benítez', 'daniela.benitez@est.edu', '04121234699', '2001-08-30', 'ELN', 1, '4545'),
('11000005', 'Adrián', 'Pastor', 'adrian.pastor@est.edu', '04141234700', '2000-12-11', 'ELN', 1, '4545'),
('11000006', 'Regina', 'Sáez', 'regina.saez@est.edu', '04161234701', '2002-04-18', 'ELN', 1, '4545'),
('11000007', 'Tobías', 'Lorenzo', 'tobias.lorenzo@est.edu', '04121234702', '2001-08-24', 'ELN', 1, '4545'),
('11000008', 'Aitana', 'Hidalgo', 'aitana.hidalgo@est.edu', '04141234703', '2000-11-06', 'ELN', 1, '4545'),
('11000009', 'Dylan', 'Nieto', 'dylan.nieto@est.edu', '04161234704', '2002-02-21', 'ELN', 1, '4545'),
('11000010', 'Zoe', 'Méndez', 'zoe.mendez@est.edu', '04121234705', '2001-06-08', 'ELN', 1, '4545'),
('11000011', 'Oliver', 'Garrido', 'oliver.garrido@est.edu', '04141234706', '2000-10-02', 'ELN', 1, '4545'),
('11000012', 'Luna', 'Campos', 'luna.campos@est.edu', '04161234707', '2002-05-14', 'ELN', 1, '4545'),
('11000013', 'Ethan', 'Santos', 'ethan.santos@est.edu', '04121234708', '2001-01-10', 'ELN', 1, '4545'),
('11000014', 'Ariana', 'Cortés', 'ariana.cortes@est.edu', '04141234709', '2000-09-16', 'ELN', 1, '4545'),
('11000015', 'Noah', 'Mora', 'noah.mora@est.edu', '04161234710', '2002-03-05', 'ELN', 1, '4545'),
('11000016', 'Bianca', 'Guerrero', 'bianca.guerrero@est.edu', '04121234711', '2001-07-20', 'ELN', 1, '4545'),
('11000017', 'Liam', 'León', 'liam.leon@est.edu', '04141234712', '2000-11-24', 'ELN', 1, '4545'),
('11000018', 'Mía', 'Peña', 'mia.pena@est.edu', '04161234713', '2002-04-09', 'ELN', 1, '4545'),
('11000019', 'Leo', 'Iglesias', 'leo.iglesias@est.edu', '04121234714', '2001-08-13', 'ELN', 1, '4545'),
('11000020', 'Laia', 'Caballero', 'laia.caballero@est.edu', '04141234715', '2000-12-19', 'ELN', 1, '4545'),
('11000021', 'Axel', 'Pascual', 'axel.pascual@est.edu', '04161234716', '2002-01-24', 'ELN', 1, '4545'),
('11000022', 'Noa', 'Soto', 'noa.soto@est.edu', '04121234717', '2001-05-02', 'ELN', 1, '4545'),
('11000023', 'Lucas', 'Fuentes', 'lucas.fuentes2@est.edu', '04141234718', '2000-09-08', 'ELN', 1, '4545'),
('11000024', 'Emma', 'Parra', 'emma.parra@est.edu', '04161234719', '2002-02-14', 'ELN', 1, '4545'),
('11000025', 'Mateo', 'Montero', 'mateo.montero@est.edu', '04121234720', '2001-06-22', 'ELN', 1, '4545'),
('11000026', 'Olivia', 'Vázquez', 'olivia.vazquez@est.edu', '04141234721', '2000-10-10', 'ELN', 1, '4545'),
('11000027', 'Hugo', 'Herrera', 'hugo.herrera2@est.edu', '04161234722', '2002-03-16', 'ELN', 1, '4545'),
('11000028', 'Alma', 'Cano', 'alma.cano@est.edu', '04121234723', '2001-07-04', 'ELN', 1, '4545'),
('11000029', 'Martín', 'Prieto', 'martin.prieto@est.edu', '04141234724', '2000-10-30', 'ELN', 1, '4545'),
('11000030', 'Vera', 'Márquez', 'vera.marquez@est.edu', '04161234725', '2002-04-12', 'ELN', 1, '4545'),
('11000031', 'Thiago', 'Carrasco', 'thiago.carrasco@est.edu', '04121234726', '2001-08-18', 'ELN', 1, '4545'),
('11000032', 'Candela', 'Lara', 'candela.lara@est.edu', '04141234727', '2000-12-06', 'ELN', 1, '4545'),
('11000033', 'Gael', 'Bravo', 'gael.bravo@est.edu', '04161234728', '2002-05-21', 'ELN', 1, '4545'),
('11000034', 'Vega', 'Núñez', 'vega.nunez@est.edu', '04121234729', '2001-01-08', 'ELN', 1, '4545'),
('11000035', 'Bruno', 'Cabrera', 'bruno.cabrera@est.edu', '04141234730', '2000-09-02', 'ELN', 1, '4545'),
('11000036', 'India', 'Rojas', 'india.rojas@est.edu', '04161234731', '2002-02-10', 'ELN', 1, '4545'),
('11000037', 'Eric', 'Gallego', 'eric.gallego@est.edu', '04121234732', '2001-06-16', 'ELN', 1, '4545'),
('11000038', 'África', 'Domínguez', 'africa.dominguez@est.edu', '04141234733', '2000-10-23', 'ELN', 1, '4545'),
('11000039', 'Iker', 'Rubio', 'iker.rubio@est.edu', '04161234734', '2002-02-28', 'ELN', 1, '4545'),
('11000040', 'Triana', 'Ibáñez', 'triana.ibanez@est.edu', '04121234735', '2001-07-12', 'ELN', 1, '4545'),
('11000041', 'Unai', 'Méndez', 'unai.mendez@est.edu', '04141234736', '2000-11-17', 'ELN', 1, '4545'),
('11000042', 'Cloe', 'Suárez', 'cloe.suarez@est.edu', '04161234737', '2002-04-24', 'ELN', 1, '4545'),
('11000043', 'Marc', 'Ferrer', 'marc.ferrer@est.edu', '04121234738', '2001-08-01', 'ELN', 1, '4545'),
('12000001', 'Pol', 'Carmona', 'pol.carmona@est.edu', '04121234739', '2001-03-06', 'MEC', 1, '4545'),
('12000002', 'Jana', 'Soler', 'jana.soler@est.edu', '04141234740', '2000-07-13', 'MEC', 1, '4545'),
('12000003', 'Adam', 'Marín', 'adam.marin@est.edu', '04161234741', '2002-01-02', 'MEC', 1, '4545'),
('12000004', 'Gala', 'Giménez', 'gala.gimenez@est.edu', '04121234742', '2001-08-28', 'MEC', 1, '4545'),
('12000005', 'Biel', 'Muñoz', 'biel.munoz@est.edu', '04141234743', '2000-12-09', 'MEC', 1, '4545'),
('12000006', 'Lara', 'Sanz', 'lara.sanz@est.edu', '04161234744', '2002-04-16', 'MEC', 1, '4545'),
('12000007', 'Pau', 'Flores', 'pau.flores@est.edu', '04121234745', '2001-08-22', 'MEC', 1, '4545'),
('12000008', 'Ainoa', 'Cruz', 'ainoa.cruz@est.edu', '04141234746', '2000-11-04', 'MEC', 1, '4545'),
('12000009', 'Joel', 'Rivas', 'joel.rivas@est.edu', '04161234747', '2002-02-19', 'MEC', 1, '4545'),
('12000010', 'Nerea', 'Molina', 'nerea.molina@est.edu', '04121234748', '2001-06-06', 'MEC', 1, '4545'),
('12000011', 'Aleix', 'Ortega', 'aleix.ortega@est.edu', '04141234749', '2000-09-30', 'MEC', 1, '4545'),
('12000012', 'Carla', 'Vidal', 'carla.vidal@est.edu', '04161234750', '2002-05-12', 'MEC', 1, '4545'),
('12000013', 'Nil', 'Santana', 'nil.santana@est.edu', '04121234751', '2001-01-08', 'MEC', 1, '4545'),
('12000014', 'Aina', 'Román', 'aina.roman@est.edu', '04141234752', '2000-09-14', 'MEC', 1, '4545'),
('12000015', 'Oriol', 'Benítez', 'oriol.benitez@est.edu', '04161234753', '2002-03-03', 'MEC', 1, '4545'),
('12000016', 'Ariadna', 'Pastor', 'ariadna.pastor@est.edu', '04121234754', '2001-07-18', 'MEC', 1, '4545'),
('12000017', 'Jan', 'Sáez', 'jan.saez@est.edu', '04141234755', '2000-11-22', 'MEC', 1, '4545'),
('12000018', 'Elsa', 'Lorenzo', 'elsa.lorenzo@est.edu', '04161234756', '2002-04-07', 'MEC', 1, '4545'),
('12000019', 'Arnau', 'Hidalgo', 'arnau.hidalgo@est.edu', '04121234757', '2001-08-11', 'MEC', 1, '4545'),
('12000020', 'Chloe', 'Nieto', 'chloe.nieto@est.edu', '04141234758', '2000-12-17', 'MEC', 1, '4545'),
('12000021', 'Gerard', 'Méndez', 'gerard.mendez@est.edu', '04161234759', '2002-01-22', 'MEC', 1, '4545'),
('12000022', 'Abril', 'Garrido', 'abril.garrido2@est.edu', '04121234760', '2001-04-30', 'MEC', 1, '4545'),
('12000023', 'Aniol', 'Campos', 'aniol.campos@est.edu', '04141234761', '2000-09-06', 'MEC', 1, '4545'),
('12000024', 'Valentina', 'Santos', 'valentina.santos@est.edu', '04161234762', '2002-02-12', 'MEC', 1, '4545'),
('12000025', 'Guillem', 'Cortés', 'guillem.cortes@est.edu', '04121234763', '2001-06-20', 'MEC', 1, '4545'),
('12000026', 'Martina', 'Mora', 'martina.mora@est.edu', '04141234764', '2000-10-08', 'MEC', 1, '4545'),
('12000027', 'Roger', 'Guerrero', 'roger.guerrero@est.edu', '04161234765', '2002-03-14', 'MEC', 1, '4545'),
('12000028', 'Claudia', 'León', 'claudia.leon@est.edu', '04121234766', '2001-07-02', 'MEC', 1, '4545'),
('12000029', 'Èric', 'Peña', 'eric.pena@est.edu', '04141234767', '2000-10-28', 'MEC', 1, '4545'),
('12000030', 'Helena', 'Iglesias', 'helena.iglesias@est.edu', '04161234768', '2002-04-10', 'MEC', 1, '4545'),
('12000031', 'Sergi', 'Caballero', 'sergi.caballero@est.edu', '04121234769', '2001-08-16', 'MEC', 1, '4545'),
('12000032', 'Valeria', 'Pascual', 'valeria.pascual@est.edu', '04141234770', '2000-12-04', 'MEC', 1, '4545'),
('12000033', 'Marti', 'Soto', 'marti.soto@est.edu', '04161234771', '2002-05-19', 'MEC', 1, '4545'),
('12000034', 'Irene', 'Fuentes', 'irene.fuentes@est.edu', '04121234772', '2001-01-06', 'MEC', 1, '4545'),
('12000035', 'Albert', 'Parra', 'albert.parra@est.edu', '04141234773', '2000-08-31', 'MEC', 1, '4545'),
('12000036', 'Nuria', 'Montero', 'nuria.montero@est.edu', '04161234774', '2002-02-08', 'MEC', 1, '4545'),
('12000037', 'Isaac', 'Vázquez', 'isaac.vazquez@est.edu', '04121234775', '2001-06-14', 'MEC', 1, '4545'),
('12000038', 'Claudia', 'Herrera', 'claudia.herrera2@est.edu', '04141234776', '2000-10-21', 'MEC', 1, '4545'),
('12000039', 'Àlex', 'Cano', 'alex.cano@est.edu', '04161234777', '2002-02-26', 'MEC', 1, '4545'),
('12000040', 'Naiara', 'Prieto', 'naiara.prieto@est.edu', '04121234778', '2001-07-10', 'MEC', 1, '4545'),
('12000041', 'Jordi', 'Márquez', 'jordi.marquez@est.edu', '04141234779', '2000-11-15', 'MEC', 1, '4545'),
('12000042', 'Leire', 'Carrasco', 'leire.carrasco@est.edu', '04161234780', '2002-04-22', 'MEC', 1, '4545'),
('12000043', 'Roc', 'Lara', 'roc.lara@est.edu', '04121234781', '2001-07-30', 'MEC', 1, '4545'),
('13000001', 'Aitor', 'Bravo', 'aitor.bravo@est.edu', '04121234782', '2001-03-04', 'CON', 1, '4545'),
('13000002', 'June', 'Núñez', 'june.nunez@est.edu', '04141234783', '2000-07-11', 'CON', 1, '4545'),
('13000003', 'Izan', 'Cabrera', 'izan.cabrera@est.edu', '04161234784', '2001-12-31', 'CON', 1, '4545'),
('13000004', 'Laia', 'Rojas', 'laia.rojas@est.edu', '04121234785', '2001-08-26', 'CON', 1, '4545'),
('13000005', 'Oier', 'Gallego', 'oier.gallego@est.edu', '04141234786', '2000-12-07', 'CON', 1, '4545'),
('13000006', 'Nahia', 'Domínguez', 'nahia.dominguez@est.edu', '04161234787', '2002-04-14', 'CON', 1, '4545'),
('13000007', 'Asier', 'Rubio', 'asier.rubio@est.edu', '04121234788', '2001-08-20', 'CON', 1, '4545'),
('13000008', 'Ane', 'Ibáñez', 'ane.ibanez@est.edu', '04141234789', '2000-11-02', 'CON', 1, '4545'),
('13000009', 'Mikel', 'Méndez', 'mikel.mendez@est.edu', '04161234790', '2002-02-17', 'CON', 1, '4545'),
('13000010', 'Amaia', 'Suárez', 'amaia.suarez@est.edu', '04121234791', '2001-06-04', 'CON', 1, '4545'),
('13000011', 'Beñat', 'Ferrer', 'benat.ferrer@est.edu', '04141234792', '2000-09-28', 'CON', 1, '4545'),
('13000012', 'Naia', 'Carmona', 'naia.carmona@est.edu', '04161234793', '2002-05-10', 'CON', 1, '4545'),
('13000013', 'Ander', 'Soler', 'ander.soler@est.edu', '04121234794', '2001-01-06', 'CON', 1, '4545'),
('13000014', 'Haizea', 'Marín', 'haizea.marin@est.edu', '04141234795', '2000-09-12', 'CON', 1, '4545'),
('13000015', 'Jon', 'Giménez', 'jon.gimenez@est.edu', '04161234796', '2002-03-01', 'CON', 1, '4545'),
('13000016', 'Maialen', 'Muñoz', 'maialen.munoz@est.edu', '04121234797', '2001-07-16', 'CON', 1, '4545'),
('13000017', 'Iker', 'Sanz', 'iker.sanz@est.edu', '04141234798', '2000-11-20', 'CON', 1, '4545'),
('13000018', 'Irati', 'Flores', 'irati.flores@est.edu', '04161234799', '2002-04-05', 'CON', 1, '4545'),
('13000019', 'Markel', 'Cruz', 'markel.cruz@est.edu', '04121234800', '2001-08-09', 'CON', 1, '4545'),
('13000020', 'Uxue', 'Rivas', 'uxue.rivas@est.edu', '04141234801', '2000-12-15', 'CON', 1, '4545'),
('13000021', 'Gorka', 'Molina', 'gorka.molina@est.edu', '04161234802', '2002-01-20', 'CON', 1, '4545'),
('13000022', 'Leire', 'Ortega', 'leire.ortega@est.edu', '04121234803', '2001-04-28', 'CON', 1, '4545'),
('13000023', 'Eneko', 'Vidal', 'eneko.vidal@est.edu', '04141234804', '2000-09-04', 'CON', 1, '4545'),
('13000024', 'Ane', 'Santana', 'ane.santana@est.edu', '04161234805', '2002-02-10', 'CON', 1, '4545'),
('13000025', 'Aritz', 'Román', 'aritz.roman@est.edu', '04121234806', '2001-06-18', 'CON', 1, '4545'),
('13000026', 'Maider', 'Benítez', 'maider.benitez@est.edu', '04141234807', '2000-10-06', 'CON', 1, '4545'),
('13000027', 'Unai', 'Pastor', 'unai.pastor@est.edu', '04161234808', '2002-03-12', 'CON', 1, '4545'),
('13000028', 'Aitana', 'Sáez', 'aitana.saez@est.edu', '04121234809', '2001-06-30', 'CON', 1, '4545'),
('13000029', 'Ibai', 'Lorenzo', 'ibai.lorenzo@est.edu', '04141234810', '2000-10-26', 'CON', 1, '4545'),
('13000030', 'Izaro', 'Hidalgo', 'izaro.hidalgo@est.edu', '04161234811', '2002-04-08', 'CON', 1, '4545'),
('13000031', 'Julen', 'Nieto', 'julen.nieto@est.edu', '04121234812', '2001-08-14', 'CON', 1, '4545'),
('13000032', 'Irati', 'Méndez', 'irati.mendez@est.edu', '04141234813', '2000-12-02', 'CON', 1, '4545'),
('13000033', 'Jokin', 'Garrido', 'jokin.garrido@est.edu', '04161234814', '2002-05-17', 'CON', 1, '4545'),
('13000034', 'Nahia', 'Campos', 'nahia.campos@est.edu', '04121234815', '2001-01-04', 'CON', 1, '4545'),
('13000035', 'Koldo', 'Santos', 'koldo.santos@est.edu', '04141234816', '2000-08-29', 'CON', 1, '4545'),
('13000036', 'Garazi', 'Cortés', 'garazi.cortes@est.edu', '04161234817', '2002-02-06', 'CON', 1, '4545'),
('13000037', 'Andoni', 'Mora', 'andoni.mora@est.edu', '04121234818', '2001-06-12', 'CON', 1, '4545'),
('13000038', 'Nerea', 'Guerrero', 'nerea.guerrero@est.edu', '04141234819', '2000-10-19', 'CON', 1, '4545'),
('13000039', 'Iñaki', 'León', 'inaki.leon@est.edu', '04161234820', '2002-02-24', 'CON', 1, '4545'),
('13000040', 'Alazne', 'Peña', 'alazne.pena@est.edu', '04121234821', '2001-07-08', 'CON', 1, '4545'),
('13000041', 'Xabier', 'Iglesias', 'xabier.iglesias@est.edu', '04141234822', '2000-11-13', 'CON', 1, '4545'),
('13000042', 'Maddi', 'Caballero', 'maddi.caballero@est.edu', '04161234823', '2002-04-20', 'CON', 1, '4545'),
('13000043', 'Ekaitz', 'Pascual', 'ekaitz.pascual@est.edu', '04121234824', '2001-07-28', 'CON', 1, '4545'),
('14000001', 'Oihan', 'Soto', 'oihan.soto@est.edu', '04121234825', '2001-03-02', 'EDU', 1, '4545'),
('14000002', 'Ainhoa', 'Fuentes', 'ainhoa.fuentes@est.edu', '04141234826', '2000-07-09', 'EDU', 1, '4545'),
('14000003', 'Aimar', 'Parra', 'aimar.parra@est.edu', '04161234827', '2001-12-29', 'EDU', 1, '4545'),
('14000004', 'Lorena', 'Montero', 'lorena.montero@est.edu', '04121234828', '2001-08-24', 'EDU', 1, '4545'),
('14000005', 'Kepa', 'Vázquez', 'kepa.vazquez@est.edu', '04141234829', '2000-12-05', 'EDU', 1, '4545'),
('14000006', 'Uxue', 'Herrera', 'uxue.herrera@est.edu', '04161234830', '2002-04-12', 'EDU', 1, '4545'),
('14000007', 'Ekain', 'Cano', 'ekain.cano@est.edu', '04121234831', '2001-08-18', 'EDU', 1, '4545'),
('14000008', 'Nora', 'Prieto', 'nora.prieto@est.edu', '04141234832', '2000-10-31', 'EDU', 1, '4545'),
('14000009', 'Gaizka', 'Márquez', 'gaizka.marquez@est.edu', '04161234833', '2002-02-15', 'EDU', 1, '4545'),
('14000010', 'Elene', 'Carrasco', 'elene.carrasco@est.edu', '04121234834', '2001-06-02', 'EDU', 1, '4545'),
('14000011', 'Ibon', 'Lara', 'ibon.lara@est.edu', '04141234835', '2000-09-26', 'EDU', 1, '4545'),
('14000012', 'Itxaso', 'Bravo', 'itxaso.bravo@est.edu', '04161234836', '2002-05-08', 'EDU', 1, '4545'),
('14000013', 'Markel', 'Núñez', 'markel.nunez@est.edu', '04121234837', '2001-01-04', 'EDU', 1, '4545'),
('14000014', 'Naiara', 'Cabrera', 'naiara.cabrera@est.edu', '04141234838', '2000-09-10', 'EDU', 1, '4545'),
('14000015', 'Imanol', 'Rojas', 'imanol.rojas@est.edu', '04161234839', '2002-02-27', 'EDU', 1, '4545'),
('14000016', 'Idoia', 'Gallego', 'idoia.gallego@est.edu', '04121234840', '2001-07-14', 'EDU', 1, '4545'),
('14000017', 'Josu', 'Domínguez', 'josu.dominguez@est.edu', '04141234841', '2000-11-18', 'EDU', 1, '4545'),
('14000018', 'Leyre', 'Rubio', 'leyre.rubio@est.edu', '04161234842', '2002-04-03', 'EDU', 1, '4545'),
('14000019', 'Eneko', 'Ibáñez', 'eneko.ibanez@est.edu', '04121234843', '2001-08-07', 'EDU', 1, '4545'),
('14000020', 'Ainara', 'Méndez', 'ainara.mendez@est.edu', '04141234844', '2000-12-13', 'EDU', 1, '4545'),
('14000021', 'Joseba', 'Suárez', 'joseba.suarez@est.edu', '04161234845', '2002-01-18', 'EDU', 1, '4545'),
('14000022', 'Amaia', 'Ferrer', 'amaia.ferrer@est.edu', '04121234846', '2001-04-26', 'EDU', 1, '4545'),
('14000023', 'Igor', 'Carmona', 'igor.carmona@est.edu', '04141234847', '2000-09-02', 'EDU', 1, '4545'),
('14000024', 'Oihana', 'Soler', 'oihana.soler@est.edu', '04161234848', '2002-02-08', 'EDU', 1, '4545'),
('14000025', 'Aitor', 'Marín', 'aitor.marin@est.edu', '04121234849', '2001-06-16', 'EDU', 1, '4545'),
('14000026', 'Izaro', 'Giménez', 'izaro.gimenez@est.edu', '04141234850', '2000-10-04', 'EDU', 1, '4545'),
('14000027', 'Gorka', 'Muñoz', 'gorka.munoz@est.edu', '04161234851', '2002-03-10', 'EDU', 1, '4545'),
('14000028', 'Ane', 'Sanz', 'ane.sanz@est.edu', '04121234852', '2001-06-28', 'EDU', 1, '4545'),
('14000029', 'Aiert', 'Flores', 'aiert.flores@est.edu', '04141234853', '2000-10-24', 'EDU', 1, '4545'),
('14000030', 'Nekane', 'Cruz', 'nekane.cruz@est.edu', '04161234854', '2002-04-06', 'EDU', 1, '4545'),
('14000031', 'Julen', 'Rivas', 'julen.rivas@est.edu', '04121234855', '2001-08-12', 'EDU', 1, '4545'),
('14000032', 'Eider', 'Molina', 'eider.molina@est.edu', '04141234856', '2000-11-30', 'EDU', 1, '4545'),
('14000033', 'Unai', 'Ortega', 'unai.ortega@est.edu', '04161234857', '2002-05-15', 'EDU', 1, '4545'),
('14000034', 'Malen', 'Vidal', 'malen.vidal@est.edu', '04121234858', '2001-01-02', 'EDU', 1, '4545'),
('14000035', 'Urko', 'Santana', 'urko.santana@est.edu', '04141234859', '2000-08-27', 'EDU', 1, '4545'),
('14000036', 'Amaiur', 'Román', 'amaiur.roman@est.edu', '04161234860', '2002-02-04', 'EDU', 1, '4545'),
('14000037', 'Asier', 'Benítez', 'asier.benitez@est.edu', '04121234861', '2001-06-10', 'EDU', 1, '4545'),
('14000038', 'Garazi', 'Pastor', 'garazi.pastor@est.edu', '04141234862', '2000-10-17', 'EDU', 1, '4545'),
('14000039', 'Andoni', 'Sáez', 'andoni.saez@est.edu', '04161234863', '2002-02-22', 'EDU', 1, '4545'),
('14000040', 'Lur', 'Lorenzo', 'lur.lorenzo@est.edu', '04121234864', '2001-07-06', 'EDU', 1, '4545'),
('14000041', 'Hodei', 'Hidalgo', 'hodei.hidalgo@est.edu', '04141234865', '2000-11-11', 'EDU', 1, '4545'),
('14000042', 'June', 'Nieto', 'june.nieto@est.edu', '04161234866', '2002-04-18', 'EDU', 1, '4545'),
('8000001', 'Carlos', 'Pérez', 'carlos.perez@est.edu', '04121234567', '2001-03-15', 'ADM', 1, '4545'),
('8000002', 'María', 'González', 'maria.gonzalez@est.edu', '04141234568', '2000-07-22', 'ADM', 1, '4545'),
('8000003', 'José', 'Rodríguez', 'jose.rodriguez@est.edu', '04161234569', '2002-01-10', 'ADM', 1, '4545'),
('8000004', 'Ana', 'Martínez', 'ana.martinez@est.edu', '04121234570', '2001-09-05', 'ADM', 1, '4545'),
('8000005', 'Luis', 'Fernández', 'luis.fernandez@est.edu', '04141234571', '2000-12-18', 'ADM', 1, '4545'),
('8000006', 'Carmen', 'López', 'carmen.lopez@est.edu', '04161234572', '2002-04-25', 'ADM', 1, '4545'),
('8000007', 'Pedro', 'García', 'pedro.garcia@est.edu', '04121234573', '2001-08-30', 'ADM', 1, '4545'),
('8000008', 'Laura', 'Sánchez', 'laura.sanchez@est.edu', '04141234574', '2000-11-12', 'ADM', 1, '4545'),
('8000009', 'Miguel', 'Ramírez', 'miguel.ramirez@est.edu', '04161234575', '2002-02-28', 'ADM', 1, '4545'),
('8000010', 'Isabel', 'Torres', 'isabel.torres@est.edu', '04121234576', '2001-06-14', 'ADM', 1, '4545'),
('8000011', 'Antonio', 'Díaz', 'antonio.diaz@est.edu', '04141234577', '2000-10-08', 'ADM', 1, '4545'),
('8000012', 'Rosa', 'Moreno', 'rosa.moreno@est.edu', '04161234578', '2002-05-20', 'ADM', 1, '4545'),
('8000013', 'Francisco', 'Jiménez', 'francisco.jimenez@est.edu', '04121234579', '2001-01-16', 'ADM', 1, '4545'),
('8000014', 'Teresa', 'Ruiz', 'teresa.ruiz@est.edu', '04141234580', '2000-09-22', 'ADM', 1, '4545'),
('8000015', 'Javier', 'Hernández', 'javier.hernandez@est.edu', '04161234581', '2002-03-11', 'ADM', 1, '4545'),
('8000016', 'Elena', 'Álvarez', 'elena.alvarez@est.edu', '04121234582', '2001-07-26', 'ADM', 1, '4545'),
('8000017', 'Manuel', 'Romero', 'manuel.romero@est.edu', '04141234583', '2000-11-30', 'ADM', 1, '4545'),
('8000018', 'Pilar', 'Navarro', 'pilar.navarro@est.edu', '04161234584', '2002-04-15', 'ADM', 1, '4545'),
('8000019', 'David', 'Gil', 'david.gil@est.edu', '04121234585', '2001-08-19', 'ADM', 1, '4545'),
('8000020', 'Dolores', 'Blanco', 'dolores.blanco@est.edu', '04141234586', '2000-12-25', 'ADM', 1, '4545'),
('8000021', 'Raúl', 'Castro', 'raul.castro@est.edu', '04161234587', '2002-01-30', 'ADM', 1, '4545'),
('8000022', 'Cristina', 'Vargas', 'cristina.vargas@est.edu', '04121234588', '2001-05-08', 'ADM', 1, '4545'),
('8000023', 'Alberto', 'Ortiz', 'alberto.ortiz@est.edu', '04141234589', '2000-09-14', 'ADM', 1, '4545'),
('8000024', 'Mercedes', 'Reyes', 'mercedes.reyes@est.edu', '04161234590', '2002-02-20', 'ADM', 1, '4545'),
('8000025', 'Roberto', 'Serrano', 'roberto.serrano@est.edu', '04121234591', '2001-06-28', 'ADM', 1, '4545'),
('8000026', 'Lucía', 'Vega', 'lucia.vega@est.edu', '04141234592', '2000-10-16', 'ADM', 1, '4545'),
('8000027', 'Enrique', 'Mendoza', 'enrique.mendoza@est.edu', '04161234593', '2002-03-22', 'ADM', 1, '4545'),
('8000028', 'Beatriz', 'Silva', 'beatriz.silva@est.edu', '04121234594', '2001-07-10', 'ADM', 1, '4545'),
('8000029', 'Fernando', 'Ramos', 'fernando.ramos@est.edu', '04141234595', '2000-11-05', 'ADM', 1, '4545'),
('8000030', 'Gloria', 'Delgado', 'gloria.delgado@est.edu', '04161234596', '2002-04-18', 'ADM', 1, '4545'),
('8000031', 'Sergio', 'Medina', 'sergio.medina@est.edu', '04121234597', '2001-08-24', 'ADM', 1, '4545'),
('8000032', 'Patricia', 'Aguilar', 'patricia.aguilar@est.edu', '04141234598', '2000-12-12', 'ADM', 1, '4545'),
('8000033', 'Jorge', 'Campos', 'jorge.campos@est.edu', '04161234599', '2002-05-27', 'ADM', 1, '4545'),
('8000034', 'Mónica', 'Santos', 'monica.santos@est.edu', '04121234600', '2001-01-14', 'ADM', 1, '4545'),
('8000035', 'Rafael', 'Cortés', 'rafael.cortes@est.edu', '04141234601', '2000-09-08', 'ADM', 1, '4545'),
('8000036', 'Silvia', 'Mora', 'silvia.mora@est.edu', '04161234602', '2002-02-16', 'ADM', 1, '4545'),
('8000037', 'Pablo', 'Guerrero', 'pablo.guerrero@est.edu', '04121234603', '2001-06-22', 'ADM', 1, '4545'),
('8000038', 'Alicia', 'León', 'alicia.leon@est.edu', '04141234604', '2000-10-29', 'ADM', 1, '4545'),
('8000039', 'Andrés', 'Peña', 'andres.pena@est.edu', '04161234605', '2002-03-05', 'ADM', 1, '4545'),
('8000040', 'Susana', 'Iglesias', 'susana.iglesias@est.edu', '04121234606', '2001-07-18', 'ADM', 1, '4545'),
('8000041', 'Marcos', 'Caballero', 'marcos.caballero@est.edu', '04141234607', '2000-11-23', 'ADM', 1, '4545'),
('8000042', 'Natalia', 'Pascual', 'natalia.pascual@est.edu', '04161234608', '2002-04-30', 'ADM', 1, '4545'),
('8000043', 'Tomás', 'Soto', 'tomas.soto@est.edu', '04121234609', '2001-08-07', 'ADM', 1, '4545'),
('9000001', 'Ricardo', 'Fuentes', 'ricardo.fuentes@est.edu', '04121234610', '2001-03-12', 'INF', 1, '4545'),
('9000002', 'Diana', 'Parra', 'diana.parra@est.edu', '04141234611', '2000-07-19', 'INF', 1, '4545'),
('9000003', 'Oscar', 'Montero', 'oscar.montero@est.edu', '04161234612', '2002-01-08', 'INF', 1, '4545'),
('9000004', 'Gabriela', 'Vázquez', 'gabriela.vazquez@est.edu', '04121234613', '2001-09-03', 'INF', 1, '4545'),
('9000005', 'Julio', 'Herrera', 'julio.herrera@est.edu', '04141234614', '2000-12-15', 'INF', 1, '4545'),
('9000006', 'Andrea', 'Cano', 'andrea.cano@est.edu', '04161234615', '2002-04-22', 'INF', 1, '4545'),
('9000007', 'Víctor', 'Prieto', 'victor.prieto@est.edu', '04121234616', '2001-08-28', 'INF', 1, '4545'),
('9000008', 'Claudia', 'Márquez', 'claudia.marquez@est.edu', '04141234617', '2000-11-10', 'INF', 1, '4545'),
('9000009', 'Guillermo', 'Carrasco', 'guillermo.carrasco@est.edu', '04161234618', '2002-02-25', 'INF', 1, '4545'),
('9000010', 'Verónica', 'Lara', 'veronica.lara@est.edu', '04121234619', '2001-06-12', 'INF', 1, '4545'),
('9000011', 'Ignacio', 'Bravo', 'ignacio.bravo@est.edu', '04141234620', '2000-10-06', 'INF', 1, '4545'),
('9000012', 'Marta', 'Núñez', 'marta.nunez@est.edu', '04161234621', '2002-05-18', 'INF', 1, '4545'),
('9000013', 'Adrián', 'Cabrera', 'adrian.cabrera@est.edu', '04121234622', '2001-01-14', 'INF', 1, '4545'),
('9000014', 'Julia', 'Rojas', 'julia.rojas@est.edu', '04141234623', '2000-09-20', 'INF', 1, '4545'),
('9000015', 'Hugo', 'Gallego', 'hugo.gallego@est.edu', '04161234624', '2002-03-09', 'INF', 1, '4545'),
('9000016', 'Irene', 'Domínguez', 'irene.dominguez@est.edu', '04121234625', '2001-07-24', 'INF', 1, '4545'),
('9000017', 'Rodrigo', 'Rubio', 'rodrigo.rubio@est.edu', '04141234626', '2000-11-28', 'INF', 1, '4545'),
('9000018', 'Sara', 'Ibáñez', 'sara.ibanez@est.edu', '04161234627', '2002-04-13', 'INF', 1, '4545'),
('9000019', 'Daniel', 'Mendez', 'daniel.mendez@est.edu', '04121234628', '2001-08-17', 'INF', 1, '4545'),
('9000020', 'Lorena', 'Suárez', 'lorena.suarez@est.edu', '04141234629', '2000-12-23', 'INF', 1, '4545'),
('9000021', 'Raquel', 'Ferrer', 'raquel.ferrer@est.edu', '04161234630', '2002-01-28', 'INF', 1, '4545'),
('9000022', 'Alejandro', 'Carmona', 'alejandro.carmona@est.edu', '04121234631', '2001-05-06', 'INF', 1, '4545'),
('9000023', 'Rocío', 'Soler', 'rocio.soler@est.edu', '04141234632', '2000-09-12', 'INF', 1, '4545'),
('9000024', 'Gonzalo', 'Marín', 'gonzalo.marin@est.edu', '04161234633', '2002-02-18', 'INF', 1, '4545'),
('9000025', 'Eva', 'Giménez', 'eva.gimenez@est.edu', '04121234634', '2001-06-26', 'INF', 1, '4545'),
('9000026', 'Ángel', 'Muñoz', 'angel.munoz@est.edu', '04141234635', '2000-10-14', 'INF', 1, '4545'),
('9000027', 'Amparo', 'Sanz', 'amparo.sanz@est.edu', '04161234636', '2002-03-20', 'INF', 1, '4545'),
('9000028', 'Rubén', 'Flores', 'ruben.flores@est.edu', '04121234637', '2001-07-08', 'INF', 1, '4545'),
('9000029', 'Inés', 'Cruz', 'ines.cruz@est.edu', '04141234638', '2000-11-03', 'INF', 1, '4545'),
('9000030', 'Samuel', 'Rivas', 'samuel.rivas@est.edu', '04161234639', '2002-04-16', 'INF', 1, '4545'),
('9000031', 'Nuria', 'Molina', 'nuria.molina@est.edu', '04121234640', '2001-08-22', 'INF', 1, '4545'),
('9000032', 'Emilio', 'Ortega', 'emilio.ortega@est.edu', '04141234641', '2000-12-10', 'INF', 1, '4545'),
('9000033', 'Lidia', 'Vidal', 'lidia.vidal@est.edu', '04161234642', '2002-05-25', 'INF', 1, '4545'),
('9000034', 'Mateo', 'Santana', 'mateo.santana@est.edu', '04121234643', '2001-01-12', 'INF', 1, '4545'),
('9000035', 'Sofía', 'Román', 'sofia.roman@est.edu', '04141234644', '2000-09-06', 'INF', 1, '4545'),
('9000036', 'Lucas', 'Benítez', 'lucas.benitez@est.edu', '04161234645', '2002-02-14', 'INF', 1, '4545'),
('9000037', 'Marina', 'Pastor', 'marina.pastor@est.edu', '04121234646', '2001-06-20', 'INF', 1, '4545'),
('9000038', 'Iván', 'Sáez', 'ivan.saez@est.edu', '04141234647', '2000-10-27', 'INF', 1, '4545'),
('9000039', 'Elisa', 'Lorenzo', 'elisa.lorenzo@est.edu', '04161234648', '2002-03-03', 'INF', 1, '4545'),
('9000040', 'Bruno', 'Hidalgo', 'bruno.hidalgo@est.edu', '04121234649', '2001-07-16', 'INF', 1, '4545'),
('9000041', 'Celia', 'Nieto', 'celia.nieto@est.edu', '04141234650', '2000-11-21', 'INF', 1, '4545'),
('9000042', 'Marco', 'Méndez', 'marco.mendez@est.edu', '04161234651', '2002-04-28', 'INF', 1, '4545'),
('9000043', 'Paula', 'Garrido', 'paula.garrido@est.edu', '04121234652', '2001-08-05', 'INF', 1, '4545');

-- --------------------------------------------------------

--
-- Table structure for table `evaluacion_estudiante`
--

DROP TABLE IF EXISTS `evaluacion_estudiante`;
CREATE TABLE `evaluacion_estudiante` (
  `id` int(11) NOT NULL,
  `rubrica_id` int(11) NOT NULL,
  `estudiante_cedula` varchar(20) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `puntaje_total` decimal(5,2) DEFAULT NULL,
  `fecha_evaluacion` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluacion_estudiante`
--

INSERT INTO `evaluacion_estudiante` (`id`, `rubrica_id`, `estudiante_cedula`, `observaciones`, `puntaje_total`, `fecha_evaluacion`) VALUES
(23, 4, '8000011', 'Listo', NULL, '2025-11-17 22:26:58'),
(24, 4, '8000005', 'Listo', NULL, '2025-11-17 22:26:58'),
(25, 4, '8000007', 'Listo', NULL, '2025-11-17 22:26:58'),
(26, 4, '8000002', 'Listo', NULL, '2025-11-17 22:26:58'),
(27, 4, '8000006', 'Listo', NULL, '2025-11-17 22:26:58'),
(28, 4, '8000004', 'Listo', NULL, '2025-11-17 22:26:58'),
(29, 4, '8000001', 'Listo bien echo', 85.00, '2025-11-17 22:26:58'),
(30, 4, '8000009', 'Listo', NULL, '2025-11-17 22:26:58'),
(31, 4, '8000003', 'Listo', NULL, '2025-11-17 22:26:58'),
(32, 4, '8000008', 'Listo', NULL, '2025-11-17 22:26:58'),
(33, 4, '8000010', 'Listo', NULL, '2025-11-17 22:26:58'),
(45, 7, '8000011', NULL, NULL, '2025-11-19 16:23:58'),
(46, 7, '8000005', NULL, NULL, '2025-11-19 16:23:58'),
(47, 7, '8000007', NULL, NULL, '2025-11-19 16:23:58'),
(48, 7, '8000002', '', 75.00, '2025-11-19 16:23:58'),
(49, 7, '8000006', NULL, NULL, '2025-11-19 16:23:58'),
(50, 7, '8000004', NULL, NULL, '2025-11-19 16:23:58'),
(51, 7, '8000001', 'bien', 100.00, '2025-11-19 16:23:58'),
(52, 7, '8000009', NULL, NULL, '2025-11-19 16:23:58'),
(53, 7, '8000003', '', 100.00, '2025-11-19 16:23:58'),
(54, 7, '8000008', NULL, NULL, '2025-11-19 16:23:58'),
(55, 7, '8000010', NULL, NULL, '2025-11-19 16:23:58'),
(56, 8, '9000029', '', 41.69, '2025-11-19 21:18:05'),
(57, 8, '9000028', '', 66.72, '2025-11-19 21:18:05'),
(58, 8, '9000025', '', 83.38, '2025-11-19 21:18:05'),
(59, 8, '9000024', 'jjajajaj', 50.05, '2025-11-19 21:18:05'),
(60, 8, '9000031', '', 25.08, '2025-11-19 21:18:05'),
(61, 8, '9000026', '', 75.08, '2025-11-19 21:18:05'),
(62, 8, '9000032', '', 100.00, '2025-11-19 21:18:05'),
(63, 8, '9000030', '', 33.38, '2025-11-19 21:18:05'),
(64, 8, '9000027', '', 83.33, '2025-11-19 21:18:05'),
(65, 8, '9000023', '', 75.03, '2025-11-19 21:18:05'),
(66, 8, '9000033', 'bien ajjajaja', 75.08, '2025-11-19 21:18:05'),
(67, 14, '9000011', '', 80.83, '2025-11-20 11:57:45'),
(68, 14, '9000006', NULL, NULL, '2025-11-20 11:57:45'),
(69, 14, '9000009', NULL, NULL, '2025-11-20 11:57:45'),
(70, 14, '9000001', NULL, NULL, '2025-11-20 11:57:45'),
(71, 14, '9000005', NULL, NULL, '2025-11-20 11:57:45'),
(72, 14, '9000010', NULL, NULL, '2025-11-20 11:57:45'),
(73, 14, '9000008', NULL, NULL, '2025-11-20 11:57:45'),
(74, 14, '9000003', NULL, NULL, '2025-11-20 11:57:45'),
(75, 14, '9000002', NULL, NULL, '2025-11-20 11:57:45'),
(76, 14, '9000007', NULL, NULL, '2025-11-20 11:57:45'),
(77, 14, '9000004', NULL, NULL, '2025-11-20 11:57:45'),
(78, 13, '9000011', NULL, NULL, '2025-11-20 11:58:53'),
(79, 13, '9000006', NULL, NULL, '2025-11-20 11:58:53'),
(80, 13, '9000009', NULL, NULL, '2025-11-20 11:58:53'),
(81, 13, '9000001', NULL, NULL, '2025-11-20 11:58:53'),
(82, 13, '9000005', NULL, NULL, '2025-11-20 11:58:53'),
(83, 13, '9000010', NULL, NULL, '2025-11-20 11:58:53'),
(84, 13, '9000008', NULL, NULL, '2025-11-20 11:58:53'),
(85, 13, '9000003', NULL, NULL, '2025-11-20 11:58:53'),
(86, 13, '9000002', '', 85.00, '2025-11-20 11:58:53'),
(87, 13, '9000007', NULL, NULL, '2025-11-20 11:58:53'),
(88, 13, '9000004', NULL, NULL, '2025-11-20 11:58:53'),
(89, 11, '9000029', NULL, NULL, '2025-11-20 18:52:37'),
(90, 11, '9000028', NULL, NULL, '2025-11-20 18:52:37'),
(91, 11, '9000025', NULL, NULL, '2025-11-20 18:52:37'),
(92, 11, '9000024', NULL, NULL, '2025-11-20 18:52:37'),
(93, 11, '9000031', NULL, NULL, '2025-11-20 18:52:37'),
(94, 11, '9000026', NULL, NULL, '2025-11-20 18:52:37'),
(95, 11, '9000032', NULL, NULL, '2025-11-20 18:52:37'),
(96, 11, '9000030', NULL, NULL, '2025-11-20 18:52:37'),
(97, 11, '9000027', NULL, NULL, '2025-11-20 18:52:37'),
(98, 11, '9000023', 'ffrf', 75.00, '2025-11-20 18:52:37'),
(99, 11, '9000033', NULL, NULL, '2025-11-20 18:52:37');

-- --------------------------------------------------------

--
-- Table structure for table `id_rol`
--

DROP TABLE IF EXISTS `id_rol`;
CREATE TABLE `id_rol` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `id_rol`
--

INSERT INTO `id_rol` (`id`, `nombre`, `descripcion`, `activo`) VALUES
(1, 'Administrador', 'Acceso completo al sistema', 1),
(2, 'Docente', 'Gestiona materias y evaluaciones', 1),
(3, 'Estudiante', 'Consulta notas y materias', 1);

-- --------------------------------------------------------

--
-- Table structure for table `inscripcion_seccion`
--

DROP TABLE IF EXISTS `inscripcion_seccion`;
CREATE TABLE `inscripcion_seccion` (
  `id` int(11) NOT NULL,
  `estudiante_cedula` varchar(20) NOT NULL,
  `seccion_id` int(11) NOT NULL,
  `fecha_inscripcion` timestamp NULL DEFAULT current_timestamp(),
  `estado` enum('Inscrito','Retirado','Aprobado','Reprobado') DEFAULT 'Inscrito',
  `nota_final` decimal(4,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inscripcion_seccion`
--

INSERT INTO `inscripcion_seccion` (`id`, `estudiante_cedula`, `seccion_id`, `fecha_inscripcion`, `estado`, `nota_final`, `observaciones`) VALUES
(1, '8000001', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(2, '8000002', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(3, '8000003', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(4, '8000004', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(5, '8000005', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(6, '8000006', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(7, '8000007', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(8, '8000008', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(9, '8000009', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(10, '8000010', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(11, '8000011', 1, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(12, '8000012', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(13, '8000013', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(14, '8000014', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(15, '8000015', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(16, '8000016', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(17, '8000017', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(18, '8000018', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(19, '8000019', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(20, '8000020', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(21, '8000021', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(22, '8000022', 2, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(23, '8000023', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(24, '8000024', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(25, '8000025', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(26, '8000026', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(27, '8000027', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(28, '8000028', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(29, '8000029', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(30, '8000030', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(31, '8000031', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(32, '8000032', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(33, '8000033', 3, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(34, '8000034', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(35, '8000035', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(36, '8000036', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(37, '8000037', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(38, '8000038', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(39, '8000039', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(40, '8000040', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(41, '8000041', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(42, '8000042', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(43, '8000043', 4, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(44, '9000001', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(45, '9000002', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(46, '9000003', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(47, '9000004', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(48, '9000005', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(49, '9000006', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(50, '9000007', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(51, '9000008', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(52, '9000009', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(53, '9000010', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(54, '9000011', 5, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(55, '9000012', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(56, '9000013', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(57, '9000014', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(58, '9000015', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(59, '9000016', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(60, '9000017', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(61, '9000018', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(62, '9000019', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(63, '9000020', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(64, '9000021', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(65, '9000022', 6, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(66, '9000023', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(67, '9000024', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(68, '9000025', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(69, '9000026', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(70, '9000027', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(71, '9000028', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(72, '9000029', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(73, '9000030', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(74, '9000031', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(75, '9000032', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(76, '9000033', 7, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(77, '9000034', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(78, '9000035', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(79, '9000036', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(80, '9000037', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(81, '9000038', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(82, '9000039', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(83, '9000040', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(84, '9000041', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(85, '9000042', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(86, '9000043', 8, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(87, '10000001', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(88, '10000002', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(89, '10000003', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(90, '10000004', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(91, '10000005', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(92, '10000006', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(93, '10000007', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(94, '10000008', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(95, '10000009', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(96, '10000010', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(97, '10000011', 9, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(98, '10000012', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(99, '10000013', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(100, '10000014', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(101, '10000015', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(102, '10000016', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(103, '10000017', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(104, '10000018', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(105, '10000019', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(106, '10000020', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(107, '10000021', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(108, '10000022', 10, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(109, '10000023', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(110, '10000024', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(111, '10000025', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(112, '10000026', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(113, '10000027', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(114, '10000028', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(115, '10000029', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(116, '10000030', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(117, '10000031', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(118, '10000032', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(119, '10000033', 11, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(120, '10000034', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(121, '10000035', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(122, '10000036', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(123, '10000037', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(124, '10000038', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(125, '10000039', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(126, '10000040', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(127, '10000041', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(128, '10000042', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(129, '10000043', 12, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(130, '11000001', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(131, '11000002', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(132, '11000003', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(133, '11000004', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(134, '11000005', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(135, '11000006', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(136, '11000007', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(137, '11000008', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(138, '11000009', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(139, '11000010', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(140, '11000011', 13, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(141, '11000012', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(142, '11000013', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(143, '11000014', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(144, '11000015', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(145, '11000016', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(146, '11000017', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(147, '11000018', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(148, '11000019', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(149, '11000020', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(150, '11000021', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(151, '11000022', 14, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(152, '11000023', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(153, '11000024', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(154, '11000025', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(155, '11000026', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(156, '11000027', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(157, '11000028', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(158, '11000029', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(159, '11000030', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(160, '11000031', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(161, '11000032', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(162, '11000033', 15, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(163, '11000034', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(164, '11000035', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(165, '11000036', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(166, '11000037', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(167, '11000038', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(168, '11000039', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(169, '11000040', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(170, '11000041', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(171, '11000042', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(172, '11000043', 16, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(173, '12000001', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(174, '12000002', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(175, '12000003', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(176, '12000004', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(177, '12000005', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(178, '12000006', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(179, '12000007', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(180, '12000008', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(181, '12000009', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(182, '12000010', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(183, '12000011', 17, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(184, '12000012', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(185, '12000013', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(186, '12000014', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(187, '12000015', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(188, '12000016', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(189, '12000017', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(190, '12000018', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(191, '12000019', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(192, '12000020', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(193, '12000021', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(194, '12000022', 18, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(195, '12000023', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(196, '12000024', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(197, '12000025', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(198, '12000026', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(199, '12000027', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(200, '12000028', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(201, '12000029', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(202, '12000030', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(203, '12000031', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(204, '12000032', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(205, '12000033', 19, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(206, '12000034', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(207, '12000035', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(208, '12000036', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(209, '12000037', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(210, '12000038', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(211, '12000039', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(212, '12000040', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(213, '12000041', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(214, '12000042', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(215, '12000043', 20, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(216, '13000001', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(217, '13000002', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(218, '13000003', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(219, '13000004', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(220, '13000005', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(221, '13000006', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(222, '13000007', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(223, '13000008', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(224, '13000009', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(225, '13000010', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(226, '13000011', 21, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(227, '13000012', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(228, '13000013', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(229, '13000014', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(230, '13000015', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(231, '13000016', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(232, '13000017', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(233, '13000018', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(234, '13000019', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(235, '13000020', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(236, '13000021', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(237, '13000022', 22, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(238, '13000023', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(239, '13000024', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(240, '13000025', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(241, '13000026', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(242, '13000027', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(243, '13000028', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(244, '13000029', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(245, '13000030', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(246, '13000031', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(247, '13000032', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(248, '13000033', 23, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(249, '13000034', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(250, '13000035', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(251, '13000036', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(252, '13000037', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(253, '13000038', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(254, '13000039', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(255, '13000040', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(256, '13000041', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(257, '13000042', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(258, '13000043', 24, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(259, '14000001', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(260, '14000002', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(261, '14000003', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(262, '14000004', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(263, '14000005', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(264, '14000006', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(265, '14000007', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(266, '14000008', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(267, '14000009', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(268, '14000010', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(269, '14000011', 25, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(270, '14000012', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(271, '14000013', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(272, '14000014', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(273, '14000015', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(274, '14000016', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(275, '14000017', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(276, '14000018', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(277, '14000019', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(278, '14000020', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(279, '14000021', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(280, '14000022', 26, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(281, '14000023', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(282, '14000024', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(283, '14000025', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(284, '14000026', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(285, '14000027', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(286, '14000028', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(287, '14000029', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(288, '14000030', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(289, '14000031', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(290, '14000032', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(291, '14000033', 27, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(292, '14000034', 28, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(293, '14000035', 28, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(294, '14000036', 28, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(295, '14000037', 28, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(296, '14000038', 28, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(297, '14000039', 28, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(298, '14000040', 28, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(299, '14000041', 28, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL),
(300, '14000042', 28, '2025-11-12 14:43:39', 'Inscrito', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `materia`
--

DROP TABLE IF EXISTS `materia`;
CREATE TABLE `materia` (
  `codigo` varchar(10) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `creditos` int(11) NOT NULL,
  `semestre` int(11) DEFAULT NULL,
  `horas_teoricas` int(11) DEFAULT NULL,
  `horas_practicas` int(11) DEFAULT NULL,
  `carrera_codigo` varchar(10) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materia`
--

INSERT INTO `materia` (`codigo`, `nombre`, `descripcion`, `creditos`, `semestre`, `horas_teoricas`, `horas_practicas`, `carrera_codigo`, `activo`, `fecha_creacion`) VALUES
('ACC-220', 'ACTIVIDADES COMPLEMENTARIAS (Ed. Física)', NULL, 0, 2, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ACC-220', 'ACTIVIDADES COMPLEMENTARIAS I(Ed. Física)', NULL, 0, 2, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('ACC-320', 'ACTIVIDADES COMPLEMENTARIAS (Ed Física)', NULL, 0, 3, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ACC-531', 'ACTIVIDADES COMPLEMENTARIAS II(Proyectos Productivos)', NULL, 1, 5, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('ADE-333', 'ADMINISTRACION DE EMPRESAS', NULL, 3, 3, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ADE-433', 'ADMINISTRACION DE EMPRESAS', NULL, 3, 4, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ADE-533', 'ADMINISTRACIÓN DE EMPRESAS', NULL, 3, 5, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('ADG-143', 'ADMINISTRACIÓN GENERAL', NULL, 3, 1, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('ADG-143', 'ADMINISTRACIÓN GENERAL', NULL, 3, 1, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('ADG-143', 'ADMINISTRACIÓN GENERAL', NULL, 3, 1, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('ADM101', 'Principios de Administración', 'Fundamentos de la administración de empresas', 4, 1, NULL, NULL, 'ADM', 1, '2025-11-12 14:43:39'),
('ADM102', 'Contabilidad I', 'Contabilidad básica empresarial', 4, 2, NULL, NULL, 'ADM', 1, '2025-11-12 14:43:39'),
('ADM201', 'Marketing', 'Estrategias de marketing empresarial', 3, 3, NULL, NULL, 'ADM', 1, '2025-11-12 14:43:39'),
('ADM202', 'Gestión de Recursos Humanos', 'Administración del talento humano', 3, 4, NULL, NULL, 'ADM', 1, '2025-11-12 14:43:39'),
('ADP-443', 'ADMINISTRACIÓN DE LA PRODUCCIÓN', NULL, 3, 4, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('ADP-443', 'ADMINISTRACIÓN DE LA PRODUCCIÓN', NULL, 3, 4, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('ADS-433', 'ANALISIS Y DISEÑO DE SISTEMAS', NULL, 3, 4, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ADS-643', 'ANALISIS Y DISEÑO DE SISTEMAS DIGITALES', NULL, 3, 6, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ALP-265', 'ALGORITMO Y PROGRAMACION I', NULL, 5, 2, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ALP-365', 'ALGORITMO Y PROGRAMACION II', NULL, 5, 3, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ANF-222', 'ANTROPOLOGIA FILOSOFICA', NULL, 2, 2, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ANF-233', 'ANTROPOLOGIA FILOSOFICA', NULL, 3, 2, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ANF-433', 'ANTROPOLOGÍA FILOSÓFICA', NULL, 3, 4, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('ANF-443', 'ANÁLISIS FINANCIERO I', NULL, 3, 4, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('ANF-443', 'ANÁLISIS FINANCIERO I', NULL, 3, 4, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('ANF-443', 'ANÁLISIS FINANCIERO I', NULL, 3, 4, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('ANF-543', 'ANÁLISIS FINANCIERO II', NULL, 3, 5, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('ANF-543', 'ANÁLISIS FINANCIERO II', NULL, 3, 5, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('ANF-543', 'ANÁLISIS FINANCIERO II', NULL, 3, 5, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('APL-543', 'APRENDIZAJE DE LA LECTURA Y ESCRITURA', NULL, 3, 5, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('ARC-265', 'ARQUITECTURA Y ESTRUCTURA DEL COMPUTADOR', NULL, 5, 2, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ARC-454', 'ARQUITECTURA DE REDES DE COMPUTADORES', NULL, 4, 4, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ART-243', 'ARTES PLÁSTICAS', NULL, 3, 2, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('ATH-443', 'ADMINISTRACIÓN DE TALENTO HUMANO', NULL, 3, 4, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('ATH-443', 'ADMINISTRACIÓN DE TALENTO HUMANO', NULL, 3, 4, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('AUA-543', 'AUDITORÍA ADMINISTRATIVA', NULL, 3, 5, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('AUA-543', 'AUDITORÍA ADMINISTRATIVA', NULL, 3, 5, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('AUD-443', 'AUDITORÍA I', NULL, 3, 4, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('AUD-532', 'AUDITORÍA II', NULL, 2, 5, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('AUT-443', 'AUTOMATISMOS', NULL, 3, 4, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('CAL-265', 'CALCULO I', NULL, 5, 2, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('CAL-365', 'CALCULO II', NULL, 5, 3, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('CCA-532', 'CONTABILIDAD DE COSTOS APLICADO', NULL, 2, 5, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('CIE-243', 'CIRCUITOS ELECTRICOS I', NULL, 3, 2, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('CIE-343', 'CIRCUITOS ELECTRICOS II', NULL, 3, 3, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('CIE-432', 'CREATIVIDAD INNOVACIÓN Y EMPRENDIMIENTO', NULL, 2, 4, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('CIE-432', 'CREATIVIDAD INNOVACIÓN Y EMPRENDIMIENTO', NULL, 2, 4, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('CIN-343', 'CIENCIAS DE LA NATURALEZA', NULL, 3, 3, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('COC-443', 'CONTABILIDAD DE COSTOS', NULL, 3, 4, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('COC-443', 'CONTABILIDAD DE COSTOS', NULL, 3, 4, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('COC-464', 'CONTABILIDAD DE COSTOS', NULL, 4, 4, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('COC-532', 'CONTROL DE CALIDAD', NULL, 2, 5, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('COE-543', 'CONTABILIDAD ESPECIALIZADA', NULL, 3, 5, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('COG-164', 'CONTABILIDAD GENERAL', NULL, 4, 1, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('COG-164', 'CONTABILIDAD GENERAL', NULL, 4, 1, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('COG-164', 'CONTABILIDAD GENERAL', NULL, 4, 1, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('COG-432', 'CONTABILIDAD GERENCIAL', NULL, 2, 4, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('COG-532', 'CONTABILIDAD GUBERNAMENTAL', NULL, 2, 5, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('COI-243', 'CONTABILIDAD INTERMEDIA', NULL, 3, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('COI-243', 'CONTABILIDAD INTERMEDIA', NULL, 3, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('COI-243', 'CONTABILIDAD INTERMEDIA', NULL, 3, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('CON-464', 'CONTROL NUMÉRICO I', NULL, 4, 4, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('CON-544', 'CONTABILIDAD COMPUTARIZADA', NULL, 4, 5, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('CON-564', 'CONTROL NUMÉRICO II', NULL, 4, 5, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('CON101', 'Contabilidad Básica', 'Fundamentos de contabilidad', 4, 1, NULL, NULL, 'CON', 1, '2025-11-12 14:43:39'),
('CON102', 'Matemáticas Financieras', 'Cálculos financieros', 4, 2, NULL, NULL, 'CON', 1, '2025-11-12 14:43:39'),
('CON201', 'Auditoría', 'Principios de auditoría', 3, 3, NULL, NULL, 'CON', 1, '2025-11-12 14:43:39'),
('CON202', 'Costos', 'Contabilidad de costos', 3, 4, NULL, NULL, 'CON', 1, '2025-11-12 14:43:39'),
('COS-364', 'CONTABILIDAD SUPERIOR', NULL, 4, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('COS-364', 'CONTABILIDAD SUPERIOR', NULL, 4, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('COS-364', 'CONTABILIDAD SUPERIOR', NULL, 4, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('CRE-543', 'CREATIVIDAD LITERARIA', NULL, 3, 5, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('CSC-343', 'CIENCIAS SOCIALES Y CULTURA', NULL, 3, 3, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('DEE-364', 'DISEÑO DE EQUIPOS ELECTRONICOS I', NULL, 4, 3, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('DEE-443', 'DISEÑO DE EQUIPOS ELECTRONICOS II', NULL, 3, 4, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('DEE-543', 'DISEÑO DE EQUIPOS ELECTRONICOS III', NULL, 3, 5, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('DEE-643', 'DISEÑO DE EQUIPOS ELECTRONICOS IV', NULL, 3, 6, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('DIC-543', 'DIDÁCTICA DE LAS CIENCIAS NATURALES', NULL, 3, 5, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('DIG-243', 'DIDÁCTICA GENERAL', NULL, 3, 2, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('DII-132', 'DIBUJO INDUSTRIAL I', NULL, 2, 1, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('DII-242', 'DIBUJO INDUSTRIAL II', NULL, 2, 2, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('DII-343', 'DIBUJO INDUSTRIAL III', NULL, 3, 3, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('DPC-443', 'DIDÁCTICA DE LOS PROCESOS COGNITIVOS', NULL, 3, 4, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('DPS-432', 'DIDÁCTICA DE LOS PROCESOS PSICOMOTOROS', NULL, 2, 4, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('DPS-543', 'DIDÁCTICA DE LOS PROCESOS SOCIOEMOCIONALES', NULL, 3, 5, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('DVE-343', 'DERECHOS HUMANOS VALORES Y ÉTICA PROFESIONAL', NULL, 3, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('DVE-343', 'DERECHOS HUMANOS VALORES Y ÉTICA PROFESIONAL', NULL, 3, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('DVE-343', 'DERECHOS HUMANOS VALORES Y ÉTICA PROFESIONAL', NULL, 3, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('DVH-232', 'DERECHOS HUMANOS, VALORES Y ÉTICA', NULL, 2, 2, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('EAS-432', 'ECOLOGÍA, AMBIENTE Y SUSTENTABILIDAD', NULL, 2, 4, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('EAS-432', 'ECOLOGÍA, AMBIENTE Y SUSTENTABILIDAD', NULL, 2, 4, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('EDA-422', 'EDUCACION AMBIENTAL', NULL, 2, 4, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('EDI-443', 'EVALUACIÓN Y DESARROLLO INFANTIL', NULL, 3, 4, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('EDU101', 'Pedagogía General', 'Fundamentos de pedagogía', 3, 1, NULL, NULL, 'EDU', 1, '2025-11-12 14:43:39'),
('EDU102', 'Psicología Educativa', 'Psicología aplicada a la educación', 3, 2, NULL, NULL, 'EDU', 1, '2025-11-12 14:43:39'),
('EDU201', 'Didáctica', 'Metodologías de enseñanza', 4, 3, NULL, NULL, 'EDU', 1, '2025-11-12 14:43:39'),
('EDU202', 'Evaluación Educativa', 'Técnicas de evaluación', 3, 4, NULL, NULL, 'EDU', 1, '2025-11-12 14:43:39'),
('EFD-132', 'EDUCACIÓN FÍSICA Y DEPORTE', NULL, 2, 1, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('EFD-132', 'EDUCACIÓN FÍSICA Y DEPORTE', NULL, 2, 1, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('EFD-132', 'EDUCACIÓN FÍSICA Y DEPORTE', NULL, 2, 1, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('EFL-132', 'EDUCACIÓN FÍSICA Y LÚDICA', NULL, 2, 1, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('ELE-343', 'ELECTRONICA I', NULL, 3, 3, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ELE-354', 'ELECTRICIDAD', NULL, 4, 3, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('ELE-432', 'ELECTROTECNIA', NULL, 2, 4, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ELE-443', 'ELECTRONICA II', NULL, 3, 4, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ELE-543', 'ELECTRONICA III', NULL, 3, 5, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ELE-543', 'ELECTIVA', NULL, 3, 5, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('ELE101', 'Circuitos Eléctricos I', 'Análisis de circuitos básicos', 5, 1, NULL, NULL, 'ELE', 1, '2025-11-12 14:43:39'),
('ELE102', 'Circuitos Eléctricos II', 'Análisis de circuitos avanzados', 5, 2, NULL, NULL, 'ELE', 1, '2025-11-12 14:43:39'),
('ELE201', 'Máquinas Eléctricas', 'Estudio de máquinas eléctricas', 4, 3, NULL, NULL, 'ELE', 1, '2025-11-12 14:43:39'),
('ELE202', 'Sistemas de Potencia', 'Análisis de sistemas de potencia', 4, 4, NULL, NULL, 'ELE', 1, '2025-11-12 14:43:39'),
('ELN101', 'Electrónica Analógica', 'Fundamentos de electrónica analógica', 5, 1, NULL, NULL, 'ELN', 1, '2025-11-12 14:43:39'),
('ELN102', 'Electrónica Digital', 'Sistemas digitales básicos', 5, 2, NULL, NULL, 'ELN', 1, '2025-11-12 14:43:39'),
('ELN201', 'Microprocesadores', 'Arquitectura de microprocesadores', 4, 3, NULL, NULL, 'ELN', 1, '2025-11-12 14:43:39'),
('ELN202', 'Sistemas Embebidos', 'Diseño de sistemas embebidos', 4, 4, NULL, NULL, 'ELN', 1, '2025-11-12 14:43:39'),
('ELT-622', 'ELECTIVA', NULL, 2, 6, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('EMU-532', 'EXPRESIÓN MUSICAL', NULL, 2, 5, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('EPS-432', 'EDUCACIÓN, PEDAGOGÍA Y SOCIEDAD', NULL, 2, 4, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('ESA-343', 'ESTADISTICA I', NULL, 3, 3, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ESA-444', 'ESTADISTICA APLICADA', NULL, 4, 4, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ETF-522', 'ETICA FUNDAMENTAL', NULL, 2, 5, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ETI-343', 'ESTADÍSTICA INFERENCIAL', NULL, 3, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('ETI-343', 'ESTADÍSTICA INFERENCIAL', NULL, 3, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('ETI-343', 'ESTADÍSTICA INFERENCIAL', NULL, 3, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('ETM-232', 'ESTADÍSTICA METODOLÓGICA', NULL, 2, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('ETM-232', 'ESTADÍSTICA METODOLÓGICA', NULL, 2, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('ETM-232', 'ESTADÍSTICA METODOLÓGICA', NULL, 2, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('ETP-422', 'ÉTICA PROFESIONAL', NULL, 2, 4, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('ETP-522', 'ETICA PROFESIONAL', NULL, 2, 5, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('EVP-532', 'EVALUACIÓN DE PROYECTOS', NULL, 2, 5, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('EVP-532', 'EVALUACIÓN DE PROYECTOS', NULL, 2, 5, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('FIS-143', 'FISICA', NULL, 3, 1, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('FIS-143', 'FÍSICA', NULL, 3, 1, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('FOC-100', 'FORMACIÓN COMPLEMENTARIA I', NULL, 0, 1, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('FOC-100', 'FORMACIÓN COMPLEMENTARIA I', NULL, 0, 1, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('FOC-100', 'FORMACIÓN COMPLEMENTARIA', NULL, 0, 1, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('FOC-100', 'FORMACION COMPLEMENTARIA I', NULL, 0, 1, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('FOC-100', 'FORMACIÓN COMPLEMENTARIA I', NULL, 0, 1, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('FOC-100', 'FORMACION COMPLEMENTARIA I', NULL, 0, 1, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('FOC-100', 'FORMACIÓN COMPLEMENTARIA I', NULL, 0, 1, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('FOC-200', 'FORMACIÓN COMPLEMENTARIA II', NULL, 0, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('FOC-200', 'FORMACIÓN COMPLEMENTARIA II', NULL, 0, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('FOC-200', 'FORMACIÓN COMPLEMENTARIA II', NULL, 0, 2, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('FOC-200', 'FORMACION COMPLEMENTARIA II', NULL, 0, 2, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('FOC-200', 'FORMACIÓN COMPLEMENTARIA II', NULL, 0, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('FOC-200', 'FORMACION COMPLEMENTARIA II', NULL, 0, 2, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('FOC-200', 'FORMACIÓN COMPLEMENTARIA II', NULL, 0, 2, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('FOC-300', 'FORMACIÓN COMPLEMENTARIA III', NULL, 0, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('FOC-300', 'FORMACIÓN COMPLEMENTARIA III', NULL, 0, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('FOC-300', 'FORMACIÓN COMPLEMENTARIA III', NULL, 0, 3, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('FOC-300', 'FORMACION COMPLEMENTARIA III', NULL, 0, 3, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('FOC-300', 'FORMACIÓN COMPLEMENTARIA III', NULL, 0, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('FOC-300', 'FORMACION COMPLEMENTARIA III', NULL, 0, 3, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('FOC-300', 'FORMACIÓN COMPLEMENTARIA III', NULL, 0, 3, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('FOC-400', 'FORMACIÓN COMPLEMENTARIA IV', NULL, 0, 4, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('FOC-400', 'FORMACIÓN COMPLEMENTARIA IV', NULL, 0, 4, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('FOC-400', 'FORMACIÓN COMPLEMENTARIA IV', NULL, 0, 4, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('FOC-400', 'FORMACION COMPLEMENTARIA IV', NULL, 0, 4, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('FOC-400', 'FORMACIÓN COMPLEMENTARIA IV', NULL, 0, 4, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('FOC-400', 'FORMACION COMPLEMENTARIA IV', NULL, 0, 4, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('FOC-400', 'FORMACIÓN COMPLEMENTARIA IV', NULL, 0, 4, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('FOC-500', 'FORMACIÓN COMPLEMENTARIA V', NULL, 0, 5, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('FOC-500', 'FORMACIÓN COMPLEMENTARIA V', NULL, 0, 5, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('FOC-500', 'FORMACIÓN COMPLEMENTARIA V', NULL, 0, 5, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('FOC-500', 'FORMACION COMPLEMENTARIA V', NULL, 0, 5, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('FOC-500', 'FORMACIÓN COMPLEMENTARIA V', NULL, 0, 5, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('FOC-500', 'FORMACION COMPLEMENTARIA V', NULL, 0, 5, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('FOC-500', 'FORMACIÓN COMPLEMENTARIA V', NULL, 0, 5, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('FOC-600', 'FORMACIÓN COMPLEMENTARIA VI', NULL, 0, 6, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('FOC-600', 'FORMACIÓN COMPLEMENTARIA VI', NULL, 0, 6, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('FOC-600', 'FORMACIÓN COMPLEMENTARIA VI', NULL, 0, 6, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('FOC-600', 'FORMACION COMPLEMENTARIA VI', NULL, 0, 6, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('FOC-600', 'FORMACIÓN COMPLEMENTARIA VI', NULL, 0, 6, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('FOC-600', 'FORMACION COMPLEMENTARIA VI', NULL, 0, 6, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('FOC-600', 'FORMACIÓN COMPLEMENTARIA VI', NULL, 0, 6, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('FOH-132', 'FORMACIÓN HUMANA', NULL, 2, 1, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('FOH-132', 'FORMACIÓN HUMANA', NULL, 2, 1, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('FOH-132', 'FORMACIÓN HUMANA', NULL, 2, 1, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('FOH-143', 'FORMACIÓN HUMANA', NULL, 3, 1, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('GAM-432', 'GESTIÓN AMBIENTAL', NULL, 2, 4, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('GDD-133', 'GEOMETRIA DESCRIPTIVA Y DIBUJO I', NULL, 3, 1, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('GDD-233', 'GEOMETRIA DESCRIPTIVA Y DIBUJO II', NULL, 3, 2, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('GEA-432', 'GESTIÓN ADUANERA', NULL, 2, 4, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('GET-443', 'GESTIÓN TRIBUTARIA', NULL, 3, 4, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('HSI-432', 'HIGIENE Y SEGURIDAD INDUSTRIAL', NULL, 2, 4, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('HSI-432', 'HIGIENE Y SEGURIDAD INDUSTRIAL', NULL, 2, 4, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('IFE-243', 'INFORMÁTICA EDUCATIVA', NULL, 3, 2, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('IGL-332', 'INGLES III', NULL, 2, 3, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('IMI-222', 'INTROD. A LA METODOLOGIA DE LA INVESTIGACION', NULL, 2, 2, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('INA-232', 'INFORMÁTICA APLICADA', NULL, 2, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('INA-232', 'INFORMÁTICA APLICADA', NULL, 2, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('INA-232', 'INFORMÁTICA APLICADA', NULL, 2, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('INC-353', 'INTRODUCCIÓN A LA COMPUTACIÓN', NULL, 3, 3, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('INC-533', 'INTRODUCCION A LAS COMUNICACIONES', NULL, 3, 5, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('INE-243', 'INTRODUCCION A LA ELECTRONICA', NULL, 3, 2, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('INE-543', 'INSTRUMENTACION ELECTRONICA', NULL, 3, 5, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('INF-432', 'INFORMATICA', NULL, 2, 4, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('INF101', 'Programación I', 'Introducción a la programación', 5, 1, NULL, NULL, 'INF', 1, '2025-11-12 14:43:39'),
('INF102', 'Estructuras de Datos', 'Estructuras de datos fundamentales', 5, 2, NULL, NULL, 'INF', 1, '2025-11-12 14:43:39'),
('INF201', 'Base de Datos I', 'Fundamentos de bases de datos', 4, 3, NULL, NULL, 'INF', 1, '2025-11-12 14:43:39'),
('INF202', 'Redes de Computadoras', 'Fundamentos de redes', 4, 4, NULL, NULL, 'INF', 1, '2025-11-12 14:43:39'),
('ING-122', 'INGLES I', NULL, 2, 1, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('ING-132', 'INGLÉS I', NULL, 2, 1, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('ING-132', 'INGLÉS I', NULL, 2, 1, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('ING-132', 'INGLÉS I', NULL, 2, 1, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('ING-143', 'INGLES I', NULL, 3, 1, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ING-143', 'INGLES I', NULL, 3, 1, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('ING-222', 'INGLÉS II', NULL, 2, 2, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('ING-232', 'INGLÉS II', NULL, 2, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('ING-232', 'INGLÉS II', NULL, 2, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('ING-232', 'INGLÉS II', NULL, 2, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('ING-233', 'INGLES II', NULL, 3, 2, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('ING-243', 'INGLES II', NULL, 3, 2, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('INI-154', 'INTRODUCCION A LA INFORMATICA', NULL, 4, 1, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('INM-532', 'INVESTIGACIÓN DE MERCADO', NULL, 2, 5, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('INM-532', 'INVESTIGACIÓN DE MERCADO', NULL, 2, 5, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('INO-544', 'INVESTIGACION DE OPERACIONES', NULL, 4, 5, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('INS-354', 'INGENIERIA DEL SOFTWARE', NULL, 4, 3, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('INU-554', 'INTERFACES WEB CON EL USUARIO', NULL, 4, 5, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('IVE-543', 'INVESTIGACIÓN EDUCATIVA', NULL, 3, 5, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('LEC-143', 'LENGUAJE Y COMUNICACIÓN I', NULL, 3, 1, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('LEC-143', 'LENGUAJE Y COMUNICACIÓN I', NULL, 3, 1, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('LEC-143', 'LENGUAJE Y COMUNICACIÓN I', NULL, 3, 1, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('LEC-143', 'LENGUAJE Y COMUNICACION I', NULL, 3, 1, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('LEC-143', 'LENGUAJE Y COMUNICACIÓN I', NULL, 3, 1, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('LEC-143', 'LENGUAJE Y COMUNICACION I', NULL, 3, 1, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('LEC-143', 'LENGUAJE Y COMUNICACIÓN', NULL, 3, 1, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('LEC-243', 'LENGUAJE Y COMUNICACIÓN II', NULL, 3, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('LEC-243', 'LENGUAJE Y COMUNICACIÓN II', NULL, 3, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('LEC-243', 'LENGUAJE Y COMUNICACIÓN II', NULL, 3, 2, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('LEC-243', 'LENGUAJE Y COMUNICACIÓN II', NULL, 3, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('LEL-232', 'LEGISLACIÓN LABORAL', NULL, 2, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('LEL-232', 'LEGISLACIÓN LABORAL', NULL, 2, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('LEL-232', 'LEGISLACIÓN LABORAL', NULL, 2, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('LEM-232', 'LEGISLACIÓN MERCANTIL', NULL, 2, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('LEM-232', 'LEGISLACIÓN MERCANTIL', NULL, 2, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('LEM-232', 'LEGISLACIÓN MERCANTIL', NULL, 2, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('LET-343', 'LEGISLACIÓN TRIBUTARIA', NULL, 3, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('LET-343', 'LEGISLACIÓN TRIBUTARIA', NULL, 3, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('LET-343', 'LEGISLACIÓN TRIBUTARIA', NULL, 3, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('LIM-253', 'LABORATORIO DE INSTRUMENTACION Y MEDICIONES', NULL, 3, 2, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('LOC-154', 'LOGICA COMPUTACIONAL', NULL, 4, 1, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('MAA-243', 'MATEMÁTICA APLICADA', NULL, 3, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('MAA-243', 'MATEMÁTICA APLICADA', NULL, 3, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('MAA-243', 'MATEMÁTICA APLICADA', NULL, 3, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('MAE-332', 'MACROECONOMÍA', NULL, 2, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('MAE-332', 'MACROECONOMÍA', NULL, 2, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('MAE-332', 'MACROECONOMÍA', NULL, 2, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('MAF-343', 'MATEMÁTICA FINANCIERA', NULL, 3, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('MAF-343', 'MATEMÁTICA FINANCIERA', NULL, 3, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('MAF-343', 'MATEMÁTICA FINANCIERA', NULL, 3, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('MAG-143', 'MATEMÁTICAS GENERAL', NULL, 3, 1, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('MAG-143', 'MATEMÁTICAS GENERAL', NULL, 3, 1, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('MAG-143', 'MATEMÁTICAS GENERAL', NULL, 3, 1, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('MAG-364', 'MATEMÁTICA GENERAL', NULL, 4, 3, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('MAH-175', 'MAQUINAS Y HERRAMIENTAS I', NULL, 5, 1, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('MAH-264', 'MÁQUINAS Y HERRAMIENTAS II', NULL, 4, 2, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('MAH-364', 'MAQUINAS Y HERRAMIENTAS III', NULL, 4, 3, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('MAH-464', 'MÁQUINAS Y HERRAMIENTAS IV', NULL, 4, 4, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('MAI-543', 'MANTENIMIENTO INDUSTRIAL', NULL, 3, 5, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('MAT-165', 'MATEMATICA I', NULL, 5, 1, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('MAT-165', 'MATEMATICA I', NULL, 5, 1, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('MAT-165', 'MATEMATICA I', NULL, 5, 1, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('MAT-265', 'MATEMATICA II', NULL, 5, 2, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('MAT-265', 'MATEMÁTICA II', NULL, 5, 2, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('MAT-365', 'MATEMATICA III', NULL, 5, 3, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('MAT-365', 'MATEMÁTICA III', NULL, 5, 3, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('MAT-432', 'MATEMATICAS IV', NULL, 2, 4, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('MEC101', 'Termodinámica', 'Principios de termodinámica', 4, 1, NULL, NULL, 'MEC', 1, '2025-11-12 14:43:39'),
('MEC102', 'Mecánica de Fluidos', 'Estudio de fluidos', 4, 2, NULL, NULL, 'MEC', 1, '2025-11-12 14:43:39'),
('MEC201', 'Diseño Mecánico', 'Fundamentos de diseño mecánico', 5, 3, NULL, NULL, 'MEC', 1, '2025-11-12 14:43:39'),
('MEC202', 'Manufactura', 'Procesos de manufactura', 4, 4, NULL, NULL, 'MEC', 1, '2025-11-12 14:43:39'),
('MEI-132', 'METODOLOGÍA DE LA INVESTIGACIÓN', NULL, 2, 1, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('MEI-522', 'METODOLOGIA DE LA INVESTIGACION', NULL, 2, 5, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('MEI-532', 'METODOLOGÍA DE LA INVESTIGACIÓN', NULL, 2, 5, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('MEI-533', 'METODOLOGÍA DE LA INVESTIGACIÓN', NULL, 3, 5, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('MET-332', 'MERCADOTÉCNIA', NULL, 2, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('MET-332', 'MERCADOTÉCNIA', NULL, 2, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('MET-332', 'MERCADOTÉCNIA', NULL, 2, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('MIC-232', 'MICROECONOMÍA', NULL, 2, 2, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('MIC-232', 'MICROECONOMÍA', NULL, 2, 2, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('MIC-232', 'MICROECONOMÍA', NULL, 2, 2, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('MIC-543', 'MICROPROCESADORES', NULL, 3, 5, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('MIE-532', 'METODOLOGÍA DE LA INVESTIGACIÓN', NULL, 2, 5, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('MIE-532', 'METODOLOGÍA DE LA INVESTIGACIÓN', NULL, 2, 5, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('OEE-332', 'ORGANIZACIÓN DE LA ENTIDAD ECONÓMICA', NULL, 2, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('OEE-332', 'ORGANIZACIÓN DE LA ENTIDAD ECONÓMICA', NULL, 2, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('OEE-332', 'ORGANIZACIÓN DE LA ENTIDAD ECONÓMICA', NULL, 2, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('OFE-332', 'ORIENTACIÓN FAMILIAR Y EDUCATIVA', NULL, 2, 3, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PAP-604', 'PASANTIA PROFESIONAL', NULL, 4, 6, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('PAP-604', 'PASANTIA PROFESIONAL', NULL, 4, 6, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('PAP-604', 'PASANTÍA PROFESIONAL', NULL, 4, 6, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('PDE-443', 'PLANIFICACIÓN DE LA ENSEÑANZA', NULL, 3, 4, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PEE-343', 'PLANIFICACIÓN Y EVALUACIÓN EDUCATIVA', NULL, 3, 3, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PEL-443', 'PENSAMIENTO Y LENGUAJE', NULL, 3, 4, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PPP-443', 'PRESUPUESTO PÚBLICO Y PRIVADO', NULL, 3, 4, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('PRA-145', 'PRÁCTICA I', NULL, 5, 1, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PRA-245', 'PRÁCTICA II', NULL, 5, 2, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PRA-345', 'PRÁCTICA III', NULL, 5, 3, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PRA-445', 'PRÁCTICA IV', NULL, 5, 4, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PRA-545', 'PRÁCTICA V', NULL, 5, 5, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PRA-647', 'PRÁCTICA VI', NULL, 7, 6, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PSA-254', 'PSICOLOGÍA DEL APRENDIZAJE', NULL, 4, 2, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('PSD-154', 'PSICOLOGÍA DEL DESARROLLO', NULL, 4, 1, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('RSP-132', 'REALIDAD SOCIAL ECONÓMICA Y POLÍTICA DE VZLA', NULL, 2, 1, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('RSP-132', 'REALIDAD SOCIAL ECONÓMICA Y POLÍTICA DE VZLA', NULL, 2, 1, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('RSP-132', 'REALIDAD SOCIAL, ECONÓMICA Y POLÍTICA DE VENEZUELA', NULL, 2, 1, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('RSP-132', 'REALIDAD SOCIAL ECONÓMICA Y POLÍTICA DE VZLA', NULL, 2, 1, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('RSP-133', 'REALIDAD SOCIAL Y POLITICA DE VENEZUELA', NULL, 3, 1, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('RSP-133', 'REALIDAD SOCIAL Y POLITICA DE VENEZUELA', NULL, 3, 1, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('RSP-233', 'REALIDAD SOCIAL Y POLÍTICA DE VENEZUELA', NULL, 3, 2, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('SAM-343', 'SALUD Y AMBIENTE', NULL, 3, 3, NULL, NULL, 'EDU', 1, '2025-11-21 00:24:25'),
('SBD-454', 'SISTEMA DE BASE DE DATOS', NULL, 4, 4, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('SDI-554', 'SISTEMAS DE INFORMACION GERENCIAL', NULL, 4, 5, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('SHI-222', 'SEGURIDAD E HIGIENE INDUSTRIAL', NULL, 2, 2, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('SHI-422', 'SEGURIDAD E HIGIENE INDUSTRIAL', NULL, 2, 4, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('SIC-543', 'SISTEMAS DE INFORMACIÓN CONTABLE', NULL, 3, 5, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('SIC-643', 'SISTEMAS DE COMUNICACIONES', NULL, 3, 6, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('SIF-332', 'SISTEMAS FINANCIEROS', NULL, 2, 3, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('SIF-332', 'SISTEMAS FINANCIEROS', NULL, 2, 3, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('SIF-332', 'SISTEMAS FINANCIEROS', NULL, 2, 3, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('SIO-454', 'SISTEMA DE OPERACION I', NULL, 4, 4, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('SIO-554', 'SISTEMAS OPERATIVOS II', NULL, 4, 5, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('SPA-443', 'SISTEMAS Y PROCEDIMIENTOS ADMINISTRATIVOS', NULL, 3, 4, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('SPA-443', 'SISTEMAS Y PROCEDIMIENTOS ADMINISTRATIVOS', NULL, 3, 4, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('SPP-605', 'PASANTÍA PROFESIONAL (SISTEMATIZACIÓN)', NULL, 5, 6, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('SPP-605', 'PASANTÍA PROFESIONAL (SISTEMATIZACIÓN)', NULL, 5, 6, NULL, NULL, 'CON', 1, '2025-11-21 00:17:58'),
('SPP-605', 'PASANTÍA PROFESIONAL (SISTEMATIZACIÓN)', NULL, 5, 6, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('TDP-532', 'TÉCNICAS DE PLANIFICACIÓN', NULL, 2, 5, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('TDP-532', 'TÉCNICAS DE PLANIFICACIÓN', NULL, 2, 5, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('TEC-144', 'TECNOLOGIA I', NULL, 4, 1, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('TEC-154', 'TECNOLOGIA', NULL, 4, 1, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('TEC-244', 'TECNOLOGÍA II', NULL, 4, 2, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('TEC-344', 'TECNOLOGÍA III', NULL, 4, 3, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('TEC-444', 'TECNOLOGÍA IV', NULL, 4, 4, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('TED-343', 'TECNICAS DIGITALES I', NULL, 3, 3, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('TED-443', 'TECNICAS DIGITALES II', NULL, 3, 4, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('TEG-606', 'TRABAJO ESPECIAL DE GRADO', NULL, 6, 6, NULL, NULL, 'ELE', 1, '2025-11-21 00:31:37'),
('TEG-606', 'TRABAJO ESPECIAL DE GRADO', NULL, 6, 6, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31'),
('TEG-606', 'TRABAJO ESPECIAL DE GRADO', NULL, 6, 6, NULL, NULL, 'MEC', 1, '2025-11-21 00:33:39'),
('TEP-543', 'TÉCNICAS PRESUPUESTARIAS', NULL, 3, 5, NULL, NULL, 'ADM', 1, '2025-11-21 00:13:22'),
('TEP-543', 'TÉCNICAS PRESUPUESTARIAS', NULL, 3, 5, NULL, NULL, 'ELN', 1, '2025-11-21 00:30:01'),
('TID-122', 'TECNICAS DE INVESTIGACION DOCUMENTAL', NULL, 2, 1, NULL, NULL, 'INF', 1, '2025-11-21 00:35:31');

-- --------------------------------------------------------

--
-- Table structure for table `nivel_desempeno`
--

DROP TABLE IF EXISTS `nivel_desempeno`;
CREATE TABLE `nivel_desempeno` (
  `id` int(11) NOT NULL,
  `criterio_id` int(11) NOT NULL,
  `nombre_nivel` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `puntaje` decimal(5,2) NOT NULL,
  `orden` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nivel_desempeno`
--

INSERT INTO `nivel_desempeno` (`id`, `criterio_id`, `nombre_nivel`, `descripcion`, `puntaje`, `orden`) VALUES
(89, 23, 'Sobresaliente', 'analiso bien', 3.00, 1),
(90, 23, 'Notable', 'analizo notablemente', 2.25, 2),
(91, 23, 'Aprobado', 'analiso por lo menos', 1.50, 3),
(92, 23, 'Insuficiente', 'no sirves para nada', 0.75, 4),
(93, 24, 'Sobresaliente', 'desarrollo bien', 3.00, 1),
(94, 24, 'Notable', 'desarrolo notablemente', 2.25, 2),
(95, 24, 'Aprobado', 'desarrollo por los menos para aprovar', 1.50, 3),
(96, 24, 'Insuficiente', 'no sirves', 0.75, 4),
(97, 25, 'Sobresaliente', 'perfecto', 3.00, 1),
(98, 25, 'Notable', 'bello falto poco', 2.25, 2),
(99, 25, 'Aprobado', 'por lo menos pasaste', 1.50, 3),
(100, 25, 'Insuficiente', 'brutooooooooo', 0.75, 4),
(101, 26, 'Sobresaliente', 'hola asistio', 3.00, 1),
(102, 26, 'Notable', 'bellos casi', 2.25, 2),
(103, 26, 'Aprobado', 'por lo menos', 1.50, 3),
(104, 26, 'Insuficiente', 'deja de jugar y para bolas a clases', 0.75, 4),
(105, 27, 'Sobresaliente', 'fnisdfnksdnflksdnlfjk', 3.00, 1),
(106, 27, 'Notable', 'nfdksnfjkerjsjdf', 2.25, 2),
(107, 27, 'Aprobado', 'f njkdsnfkjnerkjfn', 1.50, 3),
(108, 27, 'Insuficiente', 'fdnskalfnlka;dnfklnfrjndf', 0.75, 4),
(117, 30, 'Sobresaliente', 'fmdlkfmlksdnokdnfkd', 5.00, 1),
(118, 30, 'Notable', 'fmdlmslkfmdflksdm', 3.75, 2),
(119, 30, 'Aprobado', 'fmk dslkfmlksdmf', 2.50, 3),
(120, 30, 'Insuficiente', 'fkldsmlkfmlksdf', 1.25, 4),
(133, 34, 'Sobresaliente', 'Bien echo exelente', 6.66, 1),
(134, 34, 'Notable', 'casi te falto poco', 5.00, 2),
(135, 34, 'Aprobado', 'bien por lo menos lo pasaste', 3.33, 3),
(136, 34, 'Insuficiente', 'no vale eres un bruto', 1.67, 4),
(137, 35, 'Sobresaliente', 'Funciones correspodientes y bien echas Felicidades', 6.66, 1),
(138, 35, 'Notable', 'esta bien pero te falto mejora un poco', 5.00, 2),
(139, 35, 'Aprobado', 'bueno por lo menos funciona pero te falto mucho', 3.33, 3),
(140, 35, 'Insuficiente', 'Eres un bruto', 1.67, 4),
(141, 36, 'Sobresaliente', 'caes bien eres chevere jajaja', 6.66, 1),
(142, 36, 'Notable', 'buena persona', 5.00, 2),
(143, 36, 'Aprobado', 'mano se mas sociable', 3.33, 3),
(144, 36, 'Insuficiente', 'eres un repunante jajajaj', 1.67, 4),
(149, 38, 'Sobresaliente', 'dlknflksdnflk', 10.00, 1),
(150, 38, 'Notable', 'lkdnslkfnsd', 7.50, 2),
(151, 38, 'Aprobado', 'fklflkmnsdklmflksd', 5.00, 3),
(152, 38, 'Insuficiente', 'fkldsnflknsd', 2.50, 4),
(153, 39, 'Sobresaliente', 'fjkdnfklsd', 10.00, 1),
(154, 39, 'Notable', 'fklmdlmf', 7.50, 2),
(155, 39, 'Aprobado', 'fjkdnfk', 5.00, 3),
(156, 39, 'Insuficiente', 'fkdnflknsd', 2.50, 4),
(161, 41, 'Sobresaliente', 'dsnflkndlkfsd', 9.97, 1),
(162, 41, 'Notable', 'kdjnlfknsd', 9.00, 2),
(163, 41, 'Aprobado', 'fkdnsflknsld', 9.50, 3),
(164, 41, 'Insuficiente', 'flkdnslkfn', 2.50, 4),
(165, 42, 'Sobresaliente', 'Presenta la teoría \nrelacionada con el \ntema \n(2ptos)', 2.00, 1),
(166, 42, 'Notable', 'Presenta \ncorrectamente, en \nla mayoría de  los \ncasos, los \nelementos teóricos \nrelacionados con el \ntema de la \nregresión y la \ncorrelación lineal \n(1,5 ptos)', 1.50, 2),
(167, 42, 'Aprobado', 'Presenta de \nmanera básica los \nelementos teóricos \nrelacionados con el \ntema de la \nregresión y la \ncorrelación lineal \n(1 ptos)', 1.00, 3),
(168, 42, 'Insuficiente', 'Presenta de forma \ninsuficiente  los \nelementos teóricos \nrelacionados con el \ntema de la \nregresión y la \ncorrelación lineal \n(0 ptos)', 0.25, 4),
(169, 43, 'Sobresaliente', 'Presenta \ncorrectamente \nelementos \ninteractivos \nsuficientes y \nvaliosos en su \npresentación del \ncontenido  (2 ptos)', 2.00, 1),
(170, 43, 'Notable', 'Presenta \ncorrectamente en \nla mayoría de los \ncasos elementos \ninteractivos \nsuficientes y \nvaliosos en su \npresentación del \ncontenido  (1,5 \nptos)', 1.50, 2),
(171, 43, 'Aprobado', 'Presenta de \nmanera básica \nelementos \ninteractivos \nsuficientes y \nvaliosos en su \npresentación del \ncontenido  (1 ptos)', 1.00, 3),
(172, 43, 'Insuficiente', 'Presenta de \nmanera \ninsuficiente \nelementos \ninteractivos \nsuficientes y \nvaliosos en su \npresentación del \ncontenido  (0 ptos)', 0.25, 4),
(173, 44, 'Sobresaliente', '2d', 1.00, 1),
(174, 44, 'Notable', 'faef', 0.75, 2),
(175, 44, 'Aprobado', 'ewad', 0.50, 3),
(176, 44, 'Insuficiente', 'fwe', 0.25, 4),
(177, 45, 'Sobresaliente', 'Presenta \ncorrectamente los \ncálculos necesarios \npara determinar el \nvalor de los \ncoeficientes de \ncorrelación para \nun caso en \nparticular \npresentado \n(4 ptos)', 3.33, 1),
(178, 45, 'Notable', 'Presenta \ncorrectamente en \nla mayoría de los \ncasos los cálculos \nnecesarios para \ndeterminar el valor \nde los coeficientes \nde correlación \npara un caso en \nparticular \npresentado \n(3 ptos)', 2.50, 2),
(179, 45, 'Aprobado', 'Presenta de \nmanera básica  los \ncálculos necesarios \npara determinar el \nvalor de los \ncoeficientes de \ncorrelación para \nun caso en \nparticular \npresentado \n(2 ptos)', 1.67, 3),
(180, 45, 'Insuficiente', 'Presenta \nincorrecta o no \npresenta los \ncálculos necesarios \npara determinar el \nvalor de los \ncoeficientes de \ncorrelación para \nun caso en \nparticular \npresentado \n(0 ptos)', 0.83, 4),
(181, 46, 'Sobresaliente', 'Realiza y presenta \nde manera \ncorrecta  el análisis \no interpretación de \nlos resultados \nobtenidos en el \ncálculo de los \ncoeficientes de \ncorrelación  \n( 4 ptos)', 3.33, 1),
(182, 46, 'Notable', 'Realiza y presenta \nde manera \ncorrecta  el análisis \no interpretación de \nlos resultados \nobtenidos en el \ncálculo de los \ncoeficientes de \ncorrelación  \n( 3 ptos)', 2.50, 2),
(183, 46, 'Aprobado', 'Realiza y presenta \nde manera \ncorrecta  el análisis \no interpretación de \nlos resultados \nobtenidos en el \ncálculo de los \ncoeficientes de \ncorrelación  \n( 2 ptos)', 1.67, 3),
(184, 46, 'Insuficiente', 'Realiza y presenta \nde manera \ncorrecta  el análisis \no interpretación de \nlos resultados \nobtenidos en el \ncálculo de los \ncoeficientes de \ncorrelación  \n( 0 ptos)', 0.83, 4),
(185, 47, 'Sobresaliente', 'Responde \ncorrectamente a \nlas preguntas \nrealizadas sobre \naspectos teóricos \nrelacionados con el \ntema que se está \nevaluando \n(2 ptos)', 2.00, 1),
(186, 47, 'Notable', 'Responde \ncorrectamente en \nla mayoría de los \ncasos a las \npreguntas \nrealizadas sobre \naspectos teóricos \nrelacionados con el \ntema que se está \nevaluando \n(1,5 ptos)', 1.50, 2),
(187, 47, 'Aprobado', 'Responde de \nmanera basica a \nlas preguntas \nrealizadas sobre \naspectos teóricos \nrelacionados con el \ntema que se está \nevaluando \n(1 pto)', 1.00, 3),
(188, 47, 'Insuficiente', 'Responde \nincorrectamente o \nno responde  a las \npreguntas \nrealizadas sobre \naspectos teóricos \nrelacionados con el \ntema que se está \nevaluando \n(0 ptos)', 0.25, 4),
(189, 48, 'Sobresaliente', 'Realiza \ncorrectamente el \ndiagrama de árbol \nsolicitado analizando \ny siguiendo el \nenunciado \npresentado de un \ncaso particular  \n (3 ptos)', 2.50, 1),
(190, 48, 'Notable', 'Realiza \ncorrectamente en la \nmayoría de los casos,  \nel diagrama de árbol \nsolicitado analizando \ny siguiendo el \nenunciado \npresentado de un \ncaso particular  \n (2 ptos)', 1.88, 2),
(191, 48, 'Aprobado', 'Realiza de manera \nbásica  el diagrama \nde árbol solicitado \nanalizando y \nsiguiendo el \nenunciado \npresentado de un \ncaso particular  \n (1,5 ptos)', 1.25, 3),
(192, 48, 'Insuficiente', 'Realiza \nincorrectamente el \ndiagrama de árbol \nsolicitado, sin \nanalizar y sin seguir \nel enunciado \npresentado de un \ncaso particular  \n (0 ptos)', 0.63, 4),
(193, 49, 'Sobresaliente', 'Extrae y representa  \ncorrectamente los \nelementos del \nespacio muestral que \nrepresenta el \ndiagrama de árbol \nrealizado \n(3 ptos)', 2.50, 1),
(194, 49, 'Notable', 'Extrae y representa  \ncorrectamente, en la \nmayoría de los casos,  \nlos elementos del \nespacio muestral que \nrepresenta el \ndiagrama de árbol \nrealizado \n(3 ptos)', 1.88, 2),
(195, 49, 'Aprobado', 'Extrae y representa \nde manera basica  los \nelementos del \nespacio muestral que \nrepresenta el \ndiagrama de árbol \nrealizado \n(3 ptos)', 1.25, 3),
(196, 49, 'Insuficiente', 'Extrae y representa  \nincorrectamente  ( o \nno lo hace) los \nelementos del \nespacio muestral que \nrepresenta el \ndiagrama de árbol \nrealizado \n(0 ptos)', 0.63, 4),
(197, 50, 'Sobresaliente', 'Realiza \ncorrectamente \ninteracciones \nmatemáticas (unión, \nintersección, \ncomplemento) y los \nexpresa como \nelementos de un \nevento a partir de un \ndiagrama de Venn (2 \nptos)', 2.50, 1),
(198, 50, 'Notable', 'ealiza \ncorrectamente, en la \nmayoría de los casos, \ninteracciones \nmatemáticas (unión, \nintersección, \ncomplemento) y los \nexpresa como \nelementos de un \nevento a partir de un \ndiagrama de Venn \n(1,5 ptos)', 1.88, 2),
(199, 50, 'Aprobado', 'Realiza de manera \nbasica interacciones \nmatemáticas (unión, \nintersección, \ncomplemento) y los \nexpresa como \nelementos de un \nevento a partir de un \ndiagrama de Venn (1 \nptos)', 1.25, 3),
(200, 50, 'Insuficiente', 'Realiza \nincorrectamente \ninteracciones \nmatemáticas (unión, \nintersección, \ncomplemento) y los \nexpresa como \nelementos de un \nevento a partir de un \ndiagrama de Venn (0 \nptos)', 0.63, 4),
(201, 51, 'Sobresaliente', 'Realiza \ncorrectamente \ninteracciones \nmatemáticas (unión, \nintersección, \ncomplemento) y los \nexpresa como \nelementos de un \nevento a partir de un \nEspacio muestral \ndado (2 ptos)', 2.50, 1),
(202, 51, 'Notable', 'Realiza \ncorrectamente, en la \nmayoría de los casos, \ninteracciones \nmatemáticas (unión, \nintersección, \ncomplemento) y los \nexpresa como \nelementos de un \nevento a partir de un \ndiagrama de Venn \n(1,5 ptos)', 1.88, 2),
(203, 51, 'Aprobado', 'Realiza de manera \nbásica interacciones \nmatemáticas (unión, \nintersección, \ncomplemento) y los \nexpresa como \nelementos de un \nevento a partir de un \ndiagrama de Venn (1 \nptos)', 1.25, 3),
(204, 51, 'Insuficiente', 'Realiza \nincorrectamente \ninteracciones \nmatemáticas (unión, \nintersección, \ncomplemento) y no \nlos expresa como \nelementos de un \nevento a partir de un \ndiagrama de Venn (2 \nptos)', 0.63, 4),
(205, 52, 'Sobresaliente', 'Demuestra un entendimiento profundo; explica conceptos con seguridad y responde a preguntas complejas con argumentos sólidos.', 4.00, 1),
(206, 52, 'Notable', 'Explica el tema con claridad; demuestra buen conocimiento, aunque con algunas vacilaciones menores en los detalles.', 3.25, 2),
(207, 52, 'Aprobado', 'Conoce los conceptos principales, pero la explicación es superficial y la comprensión de detalles y las respuestas a preguntas es limitada.', 2.50, 3),
(208, 52, 'Insuficiente', 'No demuestra conocimiento del tema; explicación incompleta, incorrecta o no responde a las preguntas.', 0.75, 4),
(209, 53, 'Sobresaliente', 'Exposición totalmente fluida y natural; no lee y mantiene contacto visual constante, usando un lenguaje adecuado.', 2.00, 1),
(210, 53, 'Notable', 'Exposición fluida con mínimas referencias a notas; mantiene contacto visual la mayor parte del tiempo.', 1.50, 2),
(211, 53, 'Aprobado', 'La fluidez se interrumpe por la lectura frecuente de notas, lo que afecta la conexión con la audiencia.', 1.00, 3),
(212, 53, 'Insuficiente', 'Lee gran parte de la información; la exposición es monótona, entrecortada o carece de contacto visual.', 0.50, 4),
(213, 54, 'Sobresaliente', 'Utiliza ejemplos originales, claros y muy acordes al tema, facilitando la comprensión de la audiencia.', 1.00, 1),
(214, 54, 'Notable', 'Utiliza ejemplos pertinentes que ayudan a entender los conceptos principales.', 0.75, 2),
(215, 54, 'Aprobado', 'Los ejemplos son limitados o solo parcialmente relevantes para el tema expuesto.', 0.50, 3),
(216, 54, 'Insuficiente', 'No utiliza ejemplos o los presentados son confusos e irrelevantes.', 0.25, 4),
(217, 55, 'Sobresaliente', 'Material visualmente atractivo, organizado y sintético, complementando perfectamente la exposición (texto mínimo y legible). utiliza el tiempo asignado de forma óptima.', 2.00, 1),
(218, 55, 'Notable', 'Material de apoyo es claro y organizado, con una buena relación entre imágenes y texto. la distribución del tiempo por puntos podría ser mejor.', 1.50, 2),
(219, 55, 'Aprobado', 'Material funcional, pero podría estar desordenado, sobrecargado de texto o ser poco atractivo. Exposición corta o se excede del tiempo asignado,', 1.00, 3),
(220, 55, 'Insuficiente', 'Material desorganizado, confuso o con errores; es una simple repetición de la exposición. El tiempo no se gestiona.', 0.50, 4),
(221, 56, 'Sobresaliente', 'Logra captar y mantener la atención; los oyentes participan activamente en la sesión de preguntas.', 1.00, 1),
(222, 56, 'Notable', 'Mantiene atención parcial; algunos oyentes participan en la sesión final.', 0.75, 2),
(223, 56, 'Aprobado', 'Atención dispersa; participación limitada en la sesión de preguntas.', 0.50, 3),
(224, 56, 'Insuficiente', 'No logra captar atención; nula participación en la sesión de preguntas.', 0.25, 4);

-- --------------------------------------------------------

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp(),
  `leido` tinyint(1) DEFAULT 0,
  `tipo` varchar(50) DEFAULT 'info',
  `usuario_destino` varchar(20) DEFAULT 'admin',
  `rubrica_id` int(11) DEFAULT NULL,
  `docente_nombre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `mensaje`, `fecha`, `leido`, `tipo`, `usuario_destino`, `rubrica_id`, `docente_nombre`) VALUES
(1, 'El docente Un docente ha creado la rúbrica: flkdmflksdmkfl', '2025-11-19 22:14:18', 1, 'info', 'admin', NULL, NULL),
(2, 'El docente Katerine Suarez ha creado una nueva rúbrica', '2025-11-19 22:56:51', 1, 'info', 'admin', 11, NULL),
(3, 'El docente Katerine Suarez ha creado una nueva rúbrica', '2025-11-19 23:03:07', 1, 'info', 'admin', 12, NULL),
(4, 'El docente Heracles Sanchez ha creado una nueva rúbrica', '2025-11-20 01:12:56', 1, 'info', 'admin', 13, NULL),
(5, 'El docente Heracles Sanchez ha creado una nueva rúbrica', '2025-11-20 01:16:58', 1, 'info', 'admin', 14, NULL),
(6, 'El docente Heracles Sanchez ha creado una nueva rúbrica', '2025-11-20 01:28:09', 1, 'info', 'admin', 15, NULL),
(7, 'El docente Andrés Mendoza ha creado una nueva rúbrica', '2025-11-21 03:19:13', 0, 'info', 'admin', 16, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
CREATE TABLE `permisos` (
  `id` int(11) NOT NULL,
  `docente_cedula` varchar(20) NOT NULL,
  `carrera_codigo` varchar(10) NOT NULL,
  `semestre` int(11) NOT NULL,
  `materia_codigo` varchar(10) NOT NULL,
  `seccion_id` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `fecha_modificacion` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permisos`
--

INSERT INTO `permisos` (`id`, `docente_cedula`, `carrera_codigo`, `semestre`, `materia_codigo`, `seccion_id`, `activo`, `fecha_creacion`, `fecha_modificacion`) VALUES
(1, '12345678', 'ADM', 1, 'ADM101', 1, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(2, '12345678', 'ADM', 1, 'ADM101', 2, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(3, '12345678', 'ADM', 1, 'ADM101', 3, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(4, '12345678', 'ADM', 1, 'ADM101', 4, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(5, '12345678', 'EDU', 1, 'EDU101', 25, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(6, '12345678', 'EDU', 1, 'EDU101', 26, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(7, '12345678', 'EDU', 1, 'EDU101', 27, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(8, '12345678', 'EDU', 1, 'EDU101', 28, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(9, '55667788', 'INF', 1, 'INF101', 5, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(10, '55667788', 'INF', 1, 'INF101', 6, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(11, '55667788', 'INF', 1, 'INF101', 7, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(12, '55667788', 'INF', 1, 'INF101', 8, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(13, '11223344', 'ELE', 1, 'ELE101', 9, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(14, '11223344', 'ELE', 1, 'ELE101', 10, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(15, '11223344', 'ELE', 1, 'ELE101', 11, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(16, '11223344', 'ELE', 1, 'ELE101', 12, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(17, '33445566', 'ELN', 1, 'ELN101', 13, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(18, '33445566', 'ELN', 1, 'ELN101', 14, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(19, '33445566', 'ELN', 1, 'ELN101', 15, 0, '2025-11-15 13:36:16', '2025-11-15 20:30:59'),
(20, '33445566', 'ELN', 1, 'ELN101', 16, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(21, '87654321', 'MEC', 1, 'MEC101', 17, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(22, '87654321', 'MEC', 1, 'MEC101', 18, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(23, '87654321', 'MEC', 1, 'MEC101', 19, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(24, '87654321', 'MEC', 1, 'MEC101', 20, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(25, '99887766', 'CON', 1, 'CON101', 21, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(26, '99887766', 'CON', 1, 'CON101', 22, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(27, '99887766', 'CON', 1, 'CON101', 23, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(28, '99887766', 'CON', 1, 'CON101', 24, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(29, '31466704', 'INF', 3, 'INF201', 6, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(30, '31466704', 'CON', 4, 'CON202', 1, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(31, '31466704', 'ADM', 3, 'ADM201', 22, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(32, '31466704', 'MEC', 2, 'MEC102', 20, 1, '2025-11-15 13:36:16', '2025-11-15 13:36:16'),
(33, '27739757', 'CON', 4, 'CON202', 24, 0, '2025-11-15 13:36:16', '2025-11-15 20:37:24'),
(34, '27739757', 'CON', 2, 'CON102', 14, 0, '2025-11-15 13:36:16', '2025-11-15 20:37:28'),
(35, '30068297', 'ADM', 1, 'ADM101', 3, 1, '2025-11-15 20:30:33', '2025-11-15 20:30:33'),
(36, '27739757', 'ADM', 1, 'ADM101', 1, 1, '2025-11-15 20:37:14', '2025-11-15 20:37:14'),
(37, '27739757', 'CON', 1, 'CON101', 21, 1, '2025-11-15 20:37:37', '2025-11-15 20:37:37'),
(38, '31987430', 'INF', 1, 'INF101', 5, 1, '2025-11-15 20:42:50', '2025-11-15 20:42:50'),
(39, '27739757', 'INF', 1, 'INF101', 7, 1, '2025-11-16 02:13:40', '2025-11-16 02:13:40'),
(40, '30987788', 'INF', 1, 'INF101', 6, 1, '2025-11-17 13:58:27', '2025-11-17 13:58:27'),
(41, '30987788', 'ADM', 1, 'ADM101', 1, 1, '2025-11-17 13:58:38', '2025-11-17 13:58:38'),
(42, '32366214', 'INF', 1, 'INF101', 8, 1, '2025-11-17 23:03:42', '2025-11-17 23:03:42'),
(43, '32366214', 'ELN', 1, 'ELN101', 13, 1, '2025-11-17 23:03:52', '2025-11-17 23:03:52'),
(44, '31987430', 'MEC', 1, 'MEC101', 18, 1, '2025-11-17 23:04:16', '2025-11-17 23:04:16'),
(45, '27739757', 'EDU', 1, 'EDU101', 26, 1, '2025-11-20 18:54:08', '2025-11-20 18:54:08'),
(46, 'V-12345690', 'ELE', 1, 'ELE101', 10, 1, '2025-11-21 02:58:12', '2025-11-21 02:58:12'),
(47, '32366214', 'ADM', 2, 'COI-243', 37, 1, '2025-11-21 03:13:02', '2025-11-21 03:13:02'),
(48, 'V-12345690', 'INF', 2, 'ALP-265', 57, 1, '2025-11-21 03:14:13', '2025-11-21 03:14:13'),
(49, 'V-12345690', 'INF', 4, 'SBD-454', 74, 1, '2025-11-21 03:14:36', '2025-11-21 03:14:36');

-- --------------------------------------------------------

--
-- Table structure for table `rubrica_evaluacion`
--

DROP TABLE IF EXISTS `rubrica_evaluacion`;
CREATE TABLE `rubrica_evaluacion` (
  `id` int(11) NOT NULL,
  `nombre_rubrica` varchar(200) NOT NULL,
  `docente_cedula` varchar(20) NOT NULL,
  `materia_codigo` varchar(10) NOT NULL,
  `seccion_id` int(11) NOT NULL,
  `fecha_evaluacion` date NOT NULL,
  `porcentaje_evaluacion` decimal(5,2) NOT NULL,
  `tipo_evaluacion` enum('Individual','Grupal','Oral','Taller','Presentacion','Proyecto') DEFAULT 'Individual',
  `competencias` text DEFAULT NULL,
  `instrucciones` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  `modalidad` enum('Individual','Grupal','Parejas','Equipos') DEFAULT 'Individual',
  `cantidad_personas` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rubrica_evaluacion`
--

INSERT INTO `rubrica_evaluacion` (`id`, `nombre_rubrica`, `docente_cedula`, `materia_codigo`, `seccion_id`, `fecha_evaluacion`, `porcentaje_evaluacion`, `tipo_evaluacion`, `competencias`, `instrucciones`, `activo`, `fecha_creacion`, `modalidad`, `cantidad_personas`) VALUES
(4, 'Examen de Administracion Contable', '27739757', 'ADM101', 1, '2025-11-18', 15.00, 'Individual', 'Hacer todo los calculos correspodienstes fino', 'Seguir instrupciones del profesor', 1, '2025-11-17 21:43:11', 'Individual', 1),
(7, 'fdfsglkdfmglkamd', '27739757', 'ADM101', 1, '2025-11-19', 5.00, 'Individual', 'vposdmflkmsdlkfmsdakl', 'kvnfdkvnlkfnknfad', 1, '2025-11-19 16:23:27', 'Individual', 1),
(8, 'Evaluacion POO', '27739757', 'INF101', 7, '2025-11-20', 20.00, 'Individual', 'Hacer un programa con PHP, CSS y opcional(JS)', 'Hacer un login totalmente funcional con conexion a la base de datos con una tabla de usuario y con un CRUD de los usuarios', 1, '2025-11-19 21:15:53', 'Individual', 1),
(10, 'flkdmflksdmkfl', '27739757', 'CON101', 21, '2025-11-26', 10.00, 'Individual', 'lkfnldsknflkdsnlkfnldsknflk', 'nfkdnflksdnlkfnsdf', 1, '2025-11-19 22:14:17', 'Individual', 1),
(11, 'Prueva notificacion', '27739757', 'INF101', 7, '2025-11-21', 10.00, 'Individual', 'kdmflknds', 'ndjksvnkjsdnvkj', 1, '2025-11-19 22:56:50', 'Individual', 1),
(12, 'Prueva notificacion 2', '27739757', 'INF101', 7, '2025-11-27', 10.00, 'Individual', 'jkdfnijsd fd fji ds', 'j fdjs nfjds nfjk sd', 1, '2025-11-19 23:03:05', 'Individual', 1),
(13, 'RUBRICA DE EVALUACION  TALLER VIRTUAL INDIVIDUAL REGRESION Y CORRELACION LINEAL 5%', '31987430', 'INF101', 5, '2021-11-20', 10.00, 'Individual', 'tacata', 'chachacha', 1, '2025-11-20 01:12:54', 'Individual', 1),
(14, 'RUBRICA DE EVALUACION   INDIVIDUAL COEFICIENTES DE CORRELACION   10%', '31987430', 'INF101', 5, '2021-02-13', 10.00, 'Individual', 'bien', 'arrecho', 1, '2025-11-20 01:16:56', 'Individual', 1),
(15, 'ESPACIO MUESTRAL. EVALUACION GRUPAL 10%', '31987430', 'INF101', 5, '2025-11-26', 10.00, 'Individual', 'El estudiante domina el contenido de las previas 2 clases', 'Apeguese a los criterios expuestos a continuacion:', 1, '2025-11-20 01:28:06', 'Individual', 1),
(16, 'Exposicion', 'V-12345690', 'SBD-454', 74, '2025-11-20', 10.00, 'Individual', 'Manejar y', 'Hacer lo siguiente:', 1, '2025-11-21 03:19:09', 'Individual', 1);

-- --------------------------------------------------------

--
-- Table structure for table `seccion`
--

DROP TABLE IF EXISTS `seccion`;
CREATE TABLE `seccion` (
  `id` int(11) NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `materia_codigo` varchar(10) NOT NULL,
  `docente_cedula` varchar(20) NOT NULL,
  `lapso_academico` varchar(20) NOT NULL,
  `capacidad_maxima` int(11) DEFAULT NULL,
  `horario` text DEFAULT NULL,
  `aula` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seccion`
--

INSERT INTO `seccion` (`id`, `codigo`, `materia_codigo`, `docente_cedula`, `lapso_academico`, `capacidad_maxima`, `horario`, `aula`, `activo`, `fecha_creacion`) VALUES
(1, 'ADM101-A', 'ADM101', '12345678', '2-2025', 15, 'Lun-Mie 08:00-10:00', 'A-101', 1, '2025-11-12 14:43:39'),
(2, 'ADM101-B', 'ADM101', '12345678', '2-2025', 15, 'Mar-Jue 14:00-16:00', 'A-102', 1, '2025-11-12 14:43:39'),
(3, 'ADM101-C', 'ADM101', '12345678', '2-2025', 15, 'Lun-Mie 18:00-20:00', 'A-103', 1, '2025-11-12 14:43:39'),
(4, 'ADM101-D', 'ADM101', '12345678', '2-2025', 15, 'Vie 08:00-12:00', 'A-104', 1, '2025-11-12 14:43:39'),
(5, 'INF101-A', 'INF101', '55667788', '2-2025', 15, 'Lun-Mie 08:00-10:00', 'B-101', 1, '2025-11-12 14:43:39'),
(6, 'INF101-B', 'INF101', '55667788', '2-2025', 15, 'Mar-Jue 14:00-16:00', 'B-102', 1, '2025-11-12 14:43:39'),
(7, 'INF101-C', 'INF101', '55667788', '2-2025', 15, 'Lun-Mie 18:00-20:00', 'B-103', 1, '2025-11-12 14:43:39'),
(8, 'INF101-D', 'INF101', '55667788', '2-2025', 15, 'Vie 08:00-12:00', 'B-104', 1, '2025-11-12 14:43:39'),
(9, 'ELE101-A', 'ELE101', '11223344', '2-2025', 15, 'Lun-Mie 08:00-10:00', 'C-101', 1, '2025-11-12 14:43:39'),
(10, 'ELE101-B', 'ELE101', '11223344', '2-2025', 15, 'Mar-Jue 14:00-16:00', 'C-102', 1, '2025-11-12 14:43:39'),
(11, 'ELE101-C', 'ELE101', '11223344', '2-2025', 15, 'Lun-Mie 18:00-20:00', 'C-103', 1, '2025-11-12 14:43:39'),
(12, 'ELE101-D', 'ELE101', '11223344', '2-2025', 15, 'Vie 08:00-12:00', 'C-104', 1, '2025-11-12 14:43:39'),
(13, 'ELN101-A', 'ELN101', '33445566', '2-2025', 15, 'Lun-Mie 08:00-10:00', 'D-101', 1, '2025-11-12 14:43:39'),
(14, 'ELN101-B', 'ELN101', '33445566', '2-2025', 15, 'Mar-Jue 14:00-16:00', 'D-102', 1, '2025-11-12 14:43:39'),
(15, 'ELN101-C', 'ELN101', '33445566', '2-2025', 15, 'Lun-Mie 18:00-20:00', 'D-103', 1, '2025-11-12 14:43:39'),
(16, 'ELN101-D', 'ELN101', '33445566', '2-2025', 15, 'Vie 08:00-12:00', 'D-104', 1, '2025-11-12 14:43:39'),
(17, 'MEC101-A', 'MEC101', '87654321', '2-2025', 15, 'Lun-Mie 08:00-10:00', 'E-101', 1, '2025-11-12 14:43:39'),
(18, 'MEC101-B', 'MEC101', '87654321', '2-2025', 15, 'Mar-Jue 14:00-16:00', 'E-102', 1, '2025-11-12 14:43:39'),
(19, 'MEC101-C', 'MEC101', '87654321', '2-2025', 15, 'Lun-Mie 18:00-20:00', 'E-103', 1, '2025-11-12 14:43:39'),
(20, 'MEC101-D', 'MEC101', '87654321', '2-2025', 15, 'Vie 08:00-12:00', 'E-104', 1, '2025-11-12 14:43:39'),
(21, 'CON101-A', 'CON101', '99887766', '2-2025', 15, 'Lun-Mie 08:00-10:00', 'F-101', 1, '2025-11-12 14:43:39'),
(22, 'CON101-B', 'CON101', '99887766', '2-2025', 15, 'Mar-Jue 14:00-16:00', 'F-102', 1, '2025-11-12 14:43:39'),
(23, 'CON101-C', 'CON101', '99887766', '2-2025', 15, 'Lun-Mie 18:00-20:00', 'F-103', 1, '2025-11-12 14:43:39'),
(24, 'CON101-D', 'CON101', '99887766', '2-2025', 15, 'Vie 08:00-12:00', 'F-104', 1, '2025-11-12 14:43:39'),
(25, 'EDU101-A', 'EDU101', '12345678', '2-2025', 15, 'Lun-Mie 08:00-10:00', 'G-101', 1, '2025-11-12 14:43:39'),
(26, 'EDU101-B', 'EDU101', '12345678', '2-2025', 15, 'Mar-Jue 14:00-16:00', 'G-102', 1, '2025-11-12 14:43:39'),
(27, 'EDU101-C', 'EDU101', '12345678', '2-2025', 15, 'Lun-Mie 18:00-20:00', 'G-103', 1, '2025-11-12 14:43:39'),
(28, 'EDU101-D', 'EDU101', '12345678', '2-2025', 15, 'Vie 08:00-12:00', 'G-104', 1, '2025-11-12 14:43:39'),
(29, 'ADM-A', 'ADG-143', 'V-12345682', '2024-1', 30, 'Lunes y Miércoles 7:00-9:00 AM', 'A-101', 1, '2025-11-21 02:45:23'),
(30, 'ADM-B', 'COG-164', 'V-12345683', '2024-1', 30, 'Martes y Jueves 7:00-9:00 AM', 'A-102', 1, '2025-11-21 02:45:23'),
(31, 'ADM-C', 'LEC-143', 'V-12345702', '2024-1', 30, 'Lunes y Miércoles 9:00-11:00 AM', 'A-103', 1, '2025-11-21 02:45:23'),
(32, 'ADM-D', 'MAG-143', 'V-12345678', '2024-1', 30, 'Martes y Jueves 9:00-11:00 AM', 'A-104', 1, '2025-11-21 02:45:23'),
(33, 'ADM-E', 'ING-132', 'V-12345703', '2024-1', 25, 'Viernes 7:00-10:00 AM', 'A-105', 1, '2025-11-21 02:45:23'),
(34, 'CON-A', 'COG-164', 'V-12345683', '2024-1', 30, 'Lunes y Miércoles 7:00-9:00 AM', 'B-101', 1, '2025-11-21 02:45:23'),
(35, 'CON-B', 'MAG-143', 'V-12345678', '2024-1', 30, 'Martes y Jueves 7:00-9:00 AM', 'B-102', 1, '2025-11-21 02:45:23'),
(36, 'CON-C', 'LEC-143', 'V-12345702', '2024-1', 30, 'Lunes y Miércoles 9:00-11:00 AM', 'B-103', 1, '2025-11-21 02:45:23'),
(37, 'CON-D', 'COI-243', 'V-12345683', '2024-1', 30, 'Martes y Jueves 9:00-11:00 AM', 'B-104', 1, '2025-11-21 02:45:23'),
(38, 'CON-E', 'LET-343', 'V-12345685', '2024-1', 25, 'Viernes 7:00-10:00 AM', 'B-105', 1, '2025-11-21 02:45:23'),
(39, 'EDU-A', 'LEC-143', 'V-12345702', '2024-1', 25, 'Lunes y Miércoles 7:00-9:00 AM', 'C-101', 1, '2025-11-21 02:45:23'),
(40, 'EDU-B', 'PSD-154', 'V-12345687', '2024-1', 25, 'Martes y Jueves 7:00-9:00 AM', 'C-102', 1, '2025-11-21 02:45:23'),
(41, 'EDU-C', 'FOH-143', 'V-12345707', '2024-1', 25, 'Lunes y Miércoles 9:00-11:00 AM', 'C-103', 1, '2025-11-21 02:45:23'),
(42, 'EDU-D', 'DIG-243', 'V-12345688', '2024-1', 25, 'Martes y Jueves 9:00-11:00 AM', 'C-104', 1, '2025-11-21 02:45:23'),
(43, 'EDU-E', 'PRA-145', 'V-12345686', '2024-1', 20, 'Viernes 7:00-10:00 AM', 'C-105', 1, '2025-11-21 02:45:23'),
(44, 'ELE-A', 'MAT-165', 'V-12345678', '2024-1', 25, 'Lunes y Miércoles 7:00-9:00 AM', 'D-101', 1, '2025-11-21 02:45:23'),
(45, 'ELE-B', 'FIS-143', 'V-12345679', '2024-1', 25, 'Martes y Jueves 7:00-9:00 AM', 'D-102', 1, '2025-11-21 02:45:23'),
(46, 'ELE-C', 'TEC-154', 'V-12345690', '2024-1', 20, 'Lunes y Miércoles 9:00-11:00 AM', 'Lab-1', 1, '2025-11-21 02:45:23'),
(47, 'ELE-D', 'CIE-243', 'V-12345690', '2024-1', 20, 'Martes y Jueves 9:00-11:00 AM', 'Lab-2', 1, '2025-11-21 02:45:23'),
(48, 'ELE-E', 'INE-243', 'V-12345691', '2024-1', 20, 'Viernes 7:00-10:00 AM', 'Lab-3', 1, '2025-11-21 02:45:23'),
(49, 'MEC-A', 'MAT-165', 'V-12345678', '2024-1', 25, 'Lunes y Miércoles 7:00-9:00 AM', 'E-101', 1, '2025-11-21 02:45:23'),
(50, 'MEC-B', 'FIS-143', 'V-12345679', '2024-1', 25, 'Martes y Jueves 7:00-9:00 AM', 'E-102', 1, '2025-11-21 02:45:23'),
(51, 'MEC-C', 'MAH-175', 'V-12345694', '2024-1', 20, 'Lunes y Miércoles 9:00-11:00 AM', 'Taller-1', 1, '2025-11-21 02:45:23'),
(52, 'MEC-D', 'TEC-144', 'V-12345694', '2024-1', 20, 'Martes y Jueves 9:00-11:00 AM', 'Taller-2', 1, '2025-11-21 02:45:23'),
(53, 'MEC-E', 'DII-132', 'V-12345695', '2024-1', 20, 'Viernes 7:00-10:00 AM', 'Dibujo-1', 1, '2025-11-21 02:45:23'),
(54, 'INF-A', 'MAT-165', 'V-12345678', '2024-1', 25, 'Lunes y Miércoles 7:00-9:00 AM', 'F-101', 1, '2025-11-21 02:45:23'),
(55, 'INF-B', 'LOC-154', '123456789', '2024-1', 25, 'Martes y Jueves 7:00-9:00 AM', 'F-102', 1, '2025-11-21 02:45:23'),
(56, 'INF-C', 'INI-154', '123456789', '2024-1', 20, 'Lunes y Miércoles 9:00-11:00 AM', 'Lab-4', 1, '2025-11-21 02:45:23'),
(57, 'INF-D', 'ALP-265', '123456789', '2024-1', 20, 'Martes y Jueves 9:00-11:00 AM', 'Lab-5', 1, '2025-11-21 02:45:23'),
(58, 'INF-E', 'ARC-265', '123456789', '2024-1', 20, 'Viernes 7:00-10:00 AM', 'Lab-6', 1, '2025-11-21 02:45:23'),
(59, 'ADM-F', 'ADG-143', 'V-12345682', '2024-1', 30, 'Lunes y Miércoles 2:00-4:00 PM', 'A-106', 1, '2025-11-21 02:45:23'),
(60, 'CON-F', 'COG-164', 'V-12345683', '2024-1', 30, 'Martes y Jueves 2:00-4:00 PM', 'B-106', 1, '2025-11-21 02:45:23'),
(61, 'ELE-F', 'MAT-165', '87654321', '2024-1', 25, 'Lunes y Miércoles 2:00-4:00 PM', 'D-103', 1, '2025-11-21 02:45:23'),
(62, 'MEC-F', 'MAT-165', '87654321', '2024-1', 25, 'Martes y Jueves 2:00-4:00 PM', 'E-103', 1, '2025-11-21 02:45:23'),
(63, 'INF-F', 'MAT-165', '87654321', '2024-1', 25, 'Lunes y Miércoles 4:00-6:00 PM', 'F-103', 1, '2025-11-21 02:45:23'),
(64, 'ADM-G', 'ANF-443', 'V-12345684', '2024-1', 25, 'Lunes 7:00-10:00 AM', 'A-201', 1, '2025-11-21 02:45:23'),
(65, 'ADM-H', 'AUA-543', 'V-12345684', '2024-1', 25, 'Miércoles 7:00-10:00 AM', 'A-202', 1, '2025-11-21 02:45:23'),
(66, 'CON-G', 'AUD-443', 'V-12345684', '2024-1', 25, 'Martes 7:00-10:00 AM', 'B-201', 1, '2025-11-21 02:45:23'),
(67, 'CON-H', 'COC-464', 'V-12345683', '2024-1', 20, 'Jueves 7:00-10:00 AM', 'B-202', 1, '2025-11-21 02:45:23'),
(68, 'EDU-F', 'IVE-543', 'V-12345686', '2024-1', 20, 'Lunes 2:00-5:00 PM', 'C-201', 1, '2025-11-21 02:45:23'),
(69, 'EDU-G', 'PRA-545', 'V-12345686', '2024-1', 15, 'Miércoles 2:00-5:00 PM', 'C-202', 1, '2025-11-21 02:45:23'),
(70, 'ELE-G', 'ELE-543', 'V-12345691', '2024-1', 20, 'Martes 2:00-5:00 PM', 'Lab-4', 1, '2025-11-21 02:45:23'),
(71, 'ELE-H', 'MIC-543', 'V-12345692', '2024-1', 20, 'Jueves 2:00-5:00 PM', 'Lab-5', 1, '2025-11-21 02:45:23'),
(72, 'MEC-G', 'CON-564', 'V-12345696', '2024-1', 20, 'Lunes 2:00-5:00 PM', 'Taller-3', 1, '2025-11-21 02:45:23'),
(73, 'MEC-H', 'MAI-543', 'V-12345697', '2024-1', 20, 'Miércoles 2:00-5:00 PM', 'Taller-4', 1, '2025-11-21 02:45:23'),
(74, 'INF-G', 'SBD-454', '99887766', '2024-1', 20, 'Martes 2:00-5:00 PM', 'Lab-7', 1, '2025-11-21 02:45:23'),
(75, 'INF-H', 'ADS-433', '123456789', '2024-1', 20, 'Jueves 2:00-5:00 PM', 'Lab-8', 1, '2025-11-21 02:45:23'),
(76, 'INF-I', 'INU-554', '55667788', '2024-1', 20, 'Viernes 2:00-5:00 PM', 'Lab-9', 1, '2025-11-21 02:45:23');

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `cedula` varchar(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`cedula`, `username`, `email`, `password`, `id_rol`, `activo`) VALUES
('27739757', 'Katerine Suarez', 'katerine@gmail.comm', '4545', 2, 1),
('30068297', 'Lorraine Amaro', 'lorraineamaro@gmail.com', '4545', 1, 1),
('30916457', 'Greymar Medina', 'grey@gmail.com', '4545', 1, 1),
('30987788', 'Franchesca Izquierdo', 'franchesca@gmail.com', '123456789', 2, 1),
('31466704', 'Eduar Suarez', 'eduar@gmail.com', '4545', 1, 1),
('31987430', 'Heracles Sanchez', 'heraclesenmanuel@gmail.com', '4545', 2, 1),
('32366214', 'Ezequiel Angulo', 'ezequielangulo@gmail.com', '123456789', 2, 1),
('V-12345690', 'Andrés Mendoza', 'andres.mendoza@instituto.edu', '4545', 2, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carrera`
--
ALTER TABLE `carrera`
  ADD PRIMARY KEY (`codigo`);

--
-- Indexes for table `criterio_evaluacion`
--
ALTER TABLE `criterio_evaluacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rubrica_id` (`rubrica_id`);

--
-- Indexes for table `detalle_evaluacion`
--
ALTER TABLE `detalle_evaluacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `evaluacion_id` (`evaluacion_id`),
  ADD KEY `criterio_id` (`criterio_id`),
  ADD KEY `nivel_seleccionado` (`nivel_seleccionado`);

--
-- Indexes for table `docente`
--
ALTER TABLE `docente`
  ADD PRIMARY KEY (`cedula`);

--
-- Indexes for table `estudiante`
--
ALTER TABLE `estudiante`
  ADD PRIMARY KEY (`cedula`),
  ADD KEY `carrera_codigo` (`carrera_codigo`);

--
-- Indexes for table `evaluacion_estudiante`
--
ALTER TABLE `evaluacion_estudiante`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_evaluacion` (`rubrica_id`,`estudiante_cedula`),
  ADD KEY `estudiante_cedula` (`estudiante_cedula`);

--
-- Indexes for table `id_rol`
--
ALTER TABLE `id_rol`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `inscripcion_seccion`
--
ALTER TABLE `inscripcion_seccion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_inscripcion` (`estudiante_cedula`,`seccion_id`),
  ADD KEY `seccion_id` (`seccion_id`);

--
-- Indexes for table `materia`
--
ALTER TABLE `materia`
  ADD PRIMARY KEY (`codigo`,`carrera_codigo`),
  ADD KEY `carrera_codigo` (`carrera_codigo`);

--
-- Indexes for table `nivel_desempeno`
--
ALTER TABLE `nivel_desempeno`
  ADD PRIMARY KEY (`id`),
  ADD KEY `criterio_id` (`criterio_id`);

--
-- Indexes for table `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rubrica_id` (`rubrica_id`);

--
-- Indexes for table `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_permiso` (`docente_cedula`,`carrera_codigo`,`semestre`,`materia_codigo`,`seccion_id`),
  ADD KEY `idx_docente` (`docente_cedula`),
  ADD KEY `idx_carrera` (`carrera_codigo`),
  ADD KEY `idx_materia` (`materia_codigo`),
  ADD KEY `idx_seccion` (`seccion_id`);

--
-- Indexes for table `rubrica_evaluacion`
--
ALTER TABLE `rubrica_evaluacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `docente_cedula` (`docente_cedula`),
  ADD KEY `materia_codigo` (`materia_codigo`),
  ADD KEY `seccion_id` (`seccion_id`);

--
-- Indexes for table `seccion`
--
ALTER TABLE `seccion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_seccion` (`codigo`,`materia_codigo`,`lapso_academico`),
  ADD KEY `materia_codigo` (`materia_codigo`),
  ADD KEY `docente_cedula` (`docente_cedula`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`cedula`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `id_rol` (`id_rol`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `criterio_evaluacion`
--
ALTER TABLE `criterio_evaluacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `detalle_evaluacion`
--
ALTER TABLE `detalle_evaluacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `evaluacion_estudiante`
--
ALTER TABLE `evaluacion_estudiante`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `id_rol`
--
ALTER TABLE `id_rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `inscripcion_seccion`
--
ALTER TABLE `inscripcion_seccion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=301;

--
-- AUTO_INCREMENT for table `nivel_desempeno`
--
ALTER TABLE `nivel_desempeno`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=225;

--
-- AUTO_INCREMENT for table `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `rubrica_evaluacion`
--
ALTER TABLE `rubrica_evaluacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `seccion`
--
ALTER TABLE `seccion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `criterio_evaluacion`
--
ALTER TABLE `criterio_evaluacion`
  ADD CONSTRAINT `criterio_evaluacion_ibfk_1` FOREIGN KEY (`rubrica_id`) REFERENCES `rubrica_evaluacion` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `detalle_evaluacion`
--
ALTER TABLE `detalle_evaluacion`
  ADD CONSTRAINT `detalle_evaluacion_ibfk_1` FOREIGN KEY (`evaluacion_id`) REFERENCES `evaluacion_estudiante` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_evaluacion_ibfk_2` FOREIGN KEY (`criterio_id`) REFERENCES `criterio_evaluacion` (`id`),
  ADD CONSTRAINT `detalle_evaluacion_ibfk_3` FOREIGN KEY (`nivel_seleccionado`) REFERENCES `nivel_desempeno` (`id`);

--
-- Constraints for table `estudiante`
--
ALTER TABLE `estudiante`
  ADD CONSTRAINT `estudiante_ibfk_1` FOREIGN KEY (`carrera_codigo`) REFERENCES `carrera` (`codigo`);

--
-- Constraints for table `evaluacion_estudiante`
--
ALTER TABLE `evaluacion_estudiante`
  ADD CONSTRAINT `evaluacion_estudiante_ibfk_1` FOREIGN KEY (`rubrica_id`) REFERENCES `rubrica_evaluacion` (`id`),
  ADD CONSTRAINT `evaluacion_estudiante_ibfk_2` FOREIGN KEY (`estudiante_cedula`) REFERENCES `estudiante` (`cedula`);

--
-- Constraints for table `inscripcion_seccion`
--
ALTER TABLE `inscripcion_seccion`
  ADD CONSTRAINT `inscripcion_seccion_ibfk_1` FOREIGN KEY (`estudiante_cedula`) REFERENCES `estudiante` (`cedula`),
  ADD CONSTRAINT `inscripcion_seccion_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `seccion` (`id`);

--
-- Constraints for table `materia`
--
ALTER TABLE `materia`
  ADD CONSTRAINT `materia_ibfk_1` FOREIGN KEY (`carrera_codigo`) REFERENCES `carrera` (`codigo`);

--
-- Constraints for table `nivel_desempeno`
--
ALTER TABLE `nivel_desempeno`
  ADD CONSTRAINT `nivel_desempeno_ibfk_1` FOREIGN KEY (`criterio_id`) REFERENCES `criterio_evaluacion` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`rubrica_id`) REFERENCES `rubrica_evaluacion` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `permisos`
--
ALTER TABLE `permisos`
  ADD CONSTRAINT `fk_permisos_carrera` FOREIGN KEY (`carrera_codigo`) REFERENCES `carrera` (`codigo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_permisos_docente` FOREIGN KEY (`docente_cedula`) REFERENCES `docente` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_permisos_materia` FOREIGN KEY (`materia_codigo`) REFERENCES `materia` (`codigo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_permisos_seccion` FOREIGN KEY (`seccion_id`) REFERENCES `seccion` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rubrica_evaluacion`
--
ALTER TABLE `rubrica_evaluacion`
  ADD CONSTRAINT `rubrica_evaluacion_ibfk_1` FOREIGN KEY (`docente_cedula`) REFERENCES `docente` (`cedula`),
  ADD CONSTRAINT `rubrica_evaluacion_ibfk_2` FOREIGN KEY (`materia_codigo`) REFERENCES `materia` (`codigo`),
  ADD CONSTRAINT `rubrica_evaluacion_ibfk_3` FOREIGN KEY (`seccion_id`) REFERENCES `seccion` (`id`);

--
-- Constraints for table `seccion`
--
ALTER TABLE `seccion`
  ADD CONSTRAINT `seccion_ibfk_1` FOREIGN KEY (`materia_codigo`) REFERENCES `materia` (`codigo`),
  ADD CONSTRAINT `seccion_ibfk_2` FOREIGN KEY (`docente_cedula`) REFERENCES `docente` (`cedula`);

--
-- Constraints for table `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `id_rol` (`id`);
COMMIT;