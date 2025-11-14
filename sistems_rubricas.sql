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
('ADM', 'Administración de Empresas', 'Carrera de Administración de Empresas', 8, 1, '2025-11-12 14:43:39'),
('CON', 'Contaduría', 'Carrera de Contaduría Pública', 8, 1, '2025-11-12 14:43:39'),
('EDU', 'Educación', 'Carrera de Educación', 8, 1, '2025-11-12 14:43:39'),
('ELE', 'Eléctrica', 'Carrera de Ingeniería Eléctrica', 10, 1, '2025-11-12 14:43:39'),
('ELN', 'Electrónica', 'Carrera de Ingeniería Electrónica', 10, 1, '2025-11-12 14:43:39'),
('INF', 'Informática', 'Carrera de Ingeniería en Informática', 10, 1, '2025-11-12 14:43:39'),
('MEC', 'Mecánica', 'Carrera de Ingeniería Mecánica', 10, 1, '2025-11-12 14:43:39');

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
(40, 26, 'SQL Basico', 10.00, 1),
(41, 27, 'COSTOS', 10.00, 1),
(42, 28, 'glknfdksj gkjf gjkdf jkangt', 5.00, 2),
(43, 28, 'fdlkngkglk;adnfiuaenlgksndfkgnajidgbjksd gkjndfmg', 5.00, 3),
(44, 29, 'SOLDADURA INICIAL', 10.00, 1),
(45, 29, 'QUEDO LIMPIO', 10.00, 2),
(46, 30, 'Ndndnsbsnsbb', 10.00, 1),
(47, 31, 'mdlknlkgnflksdnglksdnlkfds', 10.00, 1);

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
('12345678', 'Juanhunuihnunhu', 'Pérezihjnhjinhjm', 'matematicas', 'juan.perez@universidad.edu', '04121234545', 'Docente especializado en estadística aplicada', 1),
('123456789', 'Eduardo', 'Venegas', 'informatico', 'eduardovenegas@iujo.edu.ve', '04163598425', 'Redes de Computadoras\r\nMatematicas\r\nArquitectura del computador\r\noperaciones financieras\r\nestadisticas\r\nTIC\r\nIntriductorio', 1),
('27739757', 'Katerine', 'Suarez', 'historia', 'katerine@gmail.comm', '04140457750', '', 1),
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
('99887766', 'Roberto', 'Silva', 'Base de Datos', 'roberto.silva@universidad.edu', '0416-7778889', 'Administrador de bases de datos Oracle', 1);

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
(11, 26, '9000011', NULL, NULL, '2025-11-12 14:54:39'),
(12, 26, '9000006', NULL, NULL, '2025-11-12 14:54:39'),
(13, 26, '9000009', NULL, NULL, '2025-11-12 14:54:39'),
(14, 26, '9000001', NULL, NULL, '2025-11-12 14:54:39'),
(15, 26, '9000005', NULL, NULL, '2025-11-12 14:54:39'),
(16, 26, '9000010', NULL, NULL, '2025-11-12 14:54:39'),
(17, 26, '9000008', NULL, NULL, '2025-11-12 14:54:39'),
(18, 26, '9000003', NULL, NULL, '2025-11-12 14:54:39'),
(19, 26, '9000002', NULL, NULL, '2025-11-12 14:54:39'),
(20, 26, '9000007', NULL, NULL, '2025-11-12 14:54:39'),
(21, 26, '9000004', NULL, NULL, '2025-11-12 14:54:39'),
(22, 26, '9000036', NULL, NULL, '2025-11-12 14:55:04'),
(23, 26, '9000043', NULL, NULL, '2025-11-12 14:55:04'),
(24, 26, '9000040', NULL, NULL, '2025-11-12 14:55:04'),
(25, 26, '9000039', NULL, NULL, '2025-11-12 14:55:04'),
(26, 26, '9000042', NULL, NULL, '2025-11-12 14:55:04'),
(27, 26, '9000041', NULL, NULL, '2025-11-12 14:55:04'),
(28, 26, '9000037', NULL, NULL, '2025-11-12 14:55:04'),
(29, 26, '9000035', NULL, NULL, '2025-11-12 14:55:04'),
(30, 26, '9000038', NULL, NULL, '2025-11-12 14:55:04'),
(31, 26, '9000034', NULL, NULL, '2025-11-12 14:55:04'),
(32, 26, '8000011', NULL, NULL, '2025-11-12 14:55:29'),
(33, 26, '8000005', NULL, NULL, '2025-11-12 14:55:29'),
(34, 26, '8000007', NULL, NULL, '2025-11-12 14:55:29'),
(35, 26, '8000002', NULL, NULL, '2025-11-12 14:55:29'),
(36, 26, '8000006', NULL, NULL, '2025-11-12 14:55:29'),
(37, 26, '8000004', NULL, NULL, '2025-11-12 14:55:29'),
(38, 26, '8000001', NULL, NULL, '2025-11-12 14:55:29'),
(39, 26, '8000009', NULL, NULL, '2025-11-12 14:55:29'),
(40, 26, '8000003', NULL, NULL, '2025-11-12 14:55:29'),
(41, 26, '8000008', NULL, NULL, '2025-11-12 14:55:29'),
(42, 26, '8000010', NULL, NULL, '2025-11-12 14:55:29'),
(43, 27, '13000001', NULL, NULL, '2025-11-12 15:13:41'),
(44, 27, '13000003', NULL, NULL, '2025-11-12 15:13:41'),
(45, 27, '13000006', NULL, NULL, '2025-11-12 15:13:41'),
(46, 27, '13000011', NULL, NULL, '2025-11-12 15:13:41'),
(47, 27, '13000005', NULL, NULL, '2025-11-12 15:13:41'),
(48, 27, '13000008', NULL, NULL, '2025-11-12 15:13:41'),
(49, 27, '13000009', NULL, NULL, '2025-11-12 15:13:41'),
(50, 27, '13000002', NULL, NULL, '2025-11-12 15:13:41'),
(51, 27, '13000004', NULL, NULL, '2025-11-12 15:13:41'),
(52, 27, '13000007', NULL, NULL, '2025-11-12 15:13:41'),
(53, 27, '13000010', NULL, NULL, '2025-11-12 15:13:41'),
(54, 27, '8000011', NULL, NULL, '2025-11-12 15:15:24'),
(55, 27, '8000005', NULL, NULL, '2025-11-12 15:15:24'),
(56, 27, '8000007', NULL, NULL, '2025-11-12 15:15:24'),
(57, 27, '8000002', NULL, NULL, '2025-11-12 15:15:24'),
(58, 27, '8000006', NULL, NULL, '2025-11-12 15:15:24'),
(59, 27, '8000004', NULL, NULL, '2025-11-12 15:15:24'),
(60, 27, '8000001', NULL, NULL, '2025-11-12 15:15:24'),
(61, 27, '8000009', NULL, NULL, '2025-11-12 15:15:24'),
(62, 27, '8000003', NULL, NULL, '2025-11-12 15:15:24'),
(63, 27, '8000008', NULL, NULL, '2025-11-12 15:15:24'),
(64, 27, '8000010', NULL, NULL, '2025-11-12 15:15:24'),
(65, 27, '14000007', NULL, NULL, '2025-11-12 15:25:47'),
(66, 27, '14000010', NULL, NULL, '2025-11-12 15:25:47'),
(67, 27, '14000002', NULL, NULL, '2025-11-12 15:25:47'),
(68, 27, '14000006', NULL, NULL, '2025-11-12 15:25:47'),
(69, 27, '14000011', NULL, NULL, '2025-11-12 15:25:47'),
(70, 27, '14000009', NULL, NULL, '2025-11-12 15:25:47'),
(71, 27, '14000004', NULL, NULL, '2025-11-12 15:25:47'),
(72, 27, '14000003', NULL, NULL, '2025-11-12 15:25:47'),
(73, 27, '14000008', NULL, NULL, '2025-11-12 15:25:47'),
(74, 27, '14000001', NULL, NULL, '2025-11-12 15:25:47'),
(75, 27, '14000005', NULL, NULL, '2025-11-12 15:25:47'),
(76, 28, '8000011', NULL, NULL, '2025-11-12 15:27:08'),
(77, 28, '8000005', NULL, NULL, '2025-11-12 15:27:08'),
(78, 28, '8000007', NULL, NULL, '2025-11-12 15:27:08'),
(79, 28, '8000002', NULL, NULL, '2025-11-12 15:27:08'),
(80, 28, '8000006', NULL, NULL, '2025-11-12 15:27:08'),
(81, 28, '8000004', NULL, NULL, '2025-11-12 15:27:08'),
(82, 28, '8000001', NULL, NULL, '2025-11-12 15:27:08'),
(83, 28, '8000009', NULL, NULL, '2025-11-12 15:27:08'),
(84, 28, '8000003', NULL, NULL, '2025-11-12 15:27:08'),
(85, 28, '8000008', NULL, NULL, '2025-11-12 15:27:08'),
(86, 28, '8000010', NULL, NULL, '2025-11-12 15:27:08'),
(87, 29, '12000001', NULL, NULL, '2025-11-13 00:12:09'),
(88, 29, '12000008', NULL, NULL, '2025-11-13 00:12:09'),
(89, 29, '12000007', NULL, NULL, '2025-11-13 00:12:09'),
(90, 29, '12000004', NULL, NULL, '2025-11-13 00:12:09'),
(91, 29, '12000003', NULL, NULL, '2025-11-13 00:12:09'),
(92, 29, '12000010', NULL, NULL, '2025-11-13 00:12:09'),
(93, 29, '12000005', NULL, NULL, '2025-11-13 00:12:09'),
(94, 29, '12000011', NULL, NULL, '2025-11-13 00:12:09'),
(95, 29, '12000009', NULL, NULL, '2025-11-13 00:12:09'),
(96, 29, '12000006', NULL, NULL, '2025-11-13 00:12:09'),
(97, 29, '12000002', NULL, NULL, '2025-11-13 00:12:09'),
(98, 29, '12000015', NULL, NULL, '2025-11-13 00:12:48'),
(99, 29, '12000022', NULL, NULL, '2025-11-13 00:12:48'),
(100, 29, '12000019', NULL, NULL, '2025-11-13 00:12:48'),
(101, 29, '12000018', NULL, NULL, '2025-11-13 00:12:48'),
(102, 29, '12000021', NULL, NULL, '2025-11-13 00:12:48'),
(103, 29, '12000020', NULL, NULL, '2025-11-13 00:12:48'),
(104, 29, '12000016', NULL, NULL, '2025-11-13 00:12:48'),
(105, 29, '12000014', NULL, NULL, '2025-11-13 00:12:48'),
(106, 29, '12000017', NULL, NULL, '2025-11-13 00:12:48'),
(107, 29, '12000013', NULL, NULL, '2025-11-13 00:12:48'),
(108, 29, '12000012', NULL, NULL, '2025-11-13 00:12:48'),
(109, 30, '8000011', NULL, NULL, '2025-11-13 14:22:16'),
(110, 30, '8000005', NULL, NULL, '2025-11-13 14:22:16'),
(111, 30, '8000007', NULL, NULL, '2025-11-13 14:22:16'),
(112, 30, '8000002', NULL, NULL, '2025-11-13 14:22:16'),
(113, 30, '8000006', NULL, NULL, '2025-11-13 14:22:16'),
(114, 30, '8000004', NULL, NULL, '2025-11-13 14:22:16'),
(115, 30, '8000001', NULL, NULL, '2025-11-13 14:22:16'),
(116, 30, '8000009', NULL, NULL, '2025-11-13 14:22:16'),
(117, 30, '8000003', NULL, NULL, '2025-11-13 14:22:16'),
(118, 30, '8000008', NULL, NULL, '2025-11-13 14:22:16'),
(119, 30, '8000010', NULL, NULL, '2025-11-13 14:22:16'),
(120, 31, '8000032', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(121, 31, '8000033', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(122, 31, '8000030', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(123, 31, '8000031', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(124, 31, '8000027', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(125, 31, '8000023', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(126, 31, '8000029', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(127, 31, '8000024', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(128, 31, '8000025', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(129, 31, '8000028', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25'),
(130, 31, '8000026', 'cuerda de brutos ya esta lista la evaluacion, no se la pasen con ezequiel', NULL, '2025-11-13 19:06:25');

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
('ADM101', 'Principios de Administración', 'Fundamentos de la administración de empresas', 4, 1, NULL, NULL, 'ADM', 1, '2025-11-12 14:43:39'),
('ADM102', 'Contabilidad I', 'Contabilidad básica empresarial', 4, 2, NULL, NULL, 'ADM', 1, '2025-11-12 14:43:39'),
('ADM201', 'Marketing', 'Estrategias de marketing empresarial', 3, 3, NULL, NULL, 'ADM', 1, '2025-11-12 14:43:39'),
('ADM202', 'Gestión de Recursos Humanos', 'Administración del talento humano', 3, 4, NULL, NULL, 'ADM', 1, '2025-11-12 14:43:39'),
('CON101', 'Contabilidad Básica', 'Fundamentos de contabilidad', 4, 1, NULL, NULL, 'CON', 1, '2025-11-12 14:43:39'),
('CON102', 'Matemáticas Financieras', 'Cálculos financieros', 4, 2, NULL, NULL, 'CON', 1, '2025-11-12 14:43:39'),
('CON201', 'Auditoría', 'Principios de auditoría', 3, 3, NULL, NULL, 'CON', 1, '2025-11-12 14:43:39'),
('CON202', 'Costos', 'Contabilidad de costos', 3, 4, NULL, NULL, 'CON', 1, '2025-11-12 14:43:39'),
('EDU101', 'Pedagogía General', 'Fundamentos de pedagogía', 3, 1, NULL, NULL, 'EDU', 1, '2025-11-12 14:43:39'),
('EDU102', 'Psicología Educativa', 'Psicología aplicada a la educación', 3, 2, NULL, NULL, 'EDU', 1, '2025-11-12 14:43:39'),
('EDU201', 'Didáctica', 'Metodologías de enseñanza', 4, 3, NULL, NULL, 'EDU', 1, '2025-11-12 14:43:39'),
('EDU202', 'Evaluación Educativa', 'Técnicas de evaluación', 3, 4, NULL, NULL, 'EDU', 1, '2025-11-12 14:43:39'),
('ELE101', 'Circuitos Eléctricos I', 'Análisis de circuitos básicos', 5, 1, NULL, NULL, 'ELE', 1, '2025-11-12 14:43:39'),
('ELE102', 'Circuitos Eléctricos II', 'Análisis de circuitos avanzados', 5, 2, NULL, NULL, 'ELE', 1, '2025-11-12 14:43:39'),
('ELE201', 'Máquinas Eléctricas', 'Estudio de máquinas eléctricas', 4, 3, NULL, NULL, 'ELE', 1, '2025-11-12 14:43:39'),
('ELE202', 'Sistemas de Potencia', 'Análisis de sistemas de potencia', 4, 4, NULL, NULL, 'ELE', 1, '2025-11-12 14:43:39'),
('ELN101', 'Electrónica Analógica', 'Fundamentos de electrónica analógica', 5, 1, NULL, NULL, 'ELN', 1, '2025-11-12 14:43:39'),
('ELN102', 'Electrónica Digital', 'Sistemas digitales básicos', 5, 2, NULL, NULL, 'ELN', 1, '2025-11-12 14:43:39'),
('ELN201', 'Microprocesadores', 'Arquitectura de microprocesadores', 4, 3, NULL, NULL, 'ELN', 1, '2025-11-12 14:43:39'),
('ELN202', 'Sistemas Embebidos', 'Diseño de sistemas embebidos', 4, 4, NULL, NULL, 'ELN', 1, '2025-11-12 14:43:39'),
('INF101', 'Programación I', 'Introducción a la programación', 5, 1, NULL, NULL, 'INF', 1, '2025-11-12 14:43:39'),
('INF102', 'Estructuras de Datos', 'Estructuras de datos fundamentales', 5, 2, NULL, NULL, 'INF', 1, '2025-11-12 14:43:39'),
('INF201', 'Base de Datos I', 'Fundamentos de bases de datos', 4, 3, NULL, NULL, 'INF', 1, '2025-11-12 14:43:39'),
('INF202', 'Redes de Computadoras', 'Fundamentos de redes', 4, 4, NULL, NULL, 'INF', 1, '2025-11-12 14:43:39'),
('MEC101', 'Termodinámica', 'Principios de termodinámica', 4, 1, NULL, NULL, 'MEC', 1, '2025-11-12 14:43:39'),
('MEC102', 'Mecánica de Fluidos', 'Estudio de fluidos', 4, 2, NULL, NULL, 'MEC', 1, '2025-11-12 14:43:39'),
('MEC201', 'Diseño Mecánico', 'Fundamentos de diseño mecánico', 5, 3, NULL, NULL, 'MEC', 1, '2025-11-12 14:43:39'),
('MEC202', 'Manufactura', 'Procesos de manufactura', 4, 4, NULL, NULL, 'MEC', 1, '2025-11-12 14:43:39');

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
(141, 40, 'Sobresaliente', 'Manejo correcto de MYSQL, y codigo completo', 10.00, 1),
(142, 40, 'Notable', 'Manejo bien la herramientas pero no termino o faltaron cosas', 8.00, 2),
(143, 40, 'Aprobado', 'hizo lo necesario para aprovar', 6.00, 3),
(144, 40, 'Insuficiente', 'es un gafo', 4.00, 4),
(145, 41, 'Sobresaliente', 'SACO BIEN LOS COSTOS ERES UN DURO', 10.00, 1),
(146, 41, 'Notable', 'MANO TE FALTO POCO YA CASI', 8.00, 2),
(147, 41, 'Aprobado', 'BUENO POR LO MENOS PASASTE PERO ESA EMPRESA VA A QUEBRAR', 6.00, 3),
(148, 41, 'Insuficiente', 'NO MANO TU NO SIRVES PARA ESTO', 4.00, 4),
(149, 42, 'Sobresaliente', 'klgndsflknglkadnflkagnkfnakdjg', 5.00, 1),
(150, 42, 'Notable', 'lmgdlkafnglkasnbgfadg', 4.00, 2),
(151, 42, 'Aprobado', 'fdkjngkj;as;dnfkg flkjrgbf', 3.00, 3),
(152, 42, 'Insuficiente', 'fkdjagkjadf gkjangkjaldgjandfjkg', 1.00, 4),
(153, 43, 'Sobresaliente', 'g;fdglkdnsgfiufnurdg fgjkafngjkz jkfgn;asdlfk vjkfgnadkfnblkjdfangl kfjgnaslkdfn', 5.00, 1),
(154, 43, 'Notable', 'kgjfdkg akjs fbkjf nfkx bjkgnaskgn,gkbaksl vjkfadnglnbkjfnd;okb jcbgnad', 4.00, 2),
(155, 43, 'Aprobado', 'fkdnjkf gdkd nkb skdjfngz,c bjkasdnkl;v lkfgnaskd vm,f glkasd v', 2.50, 3),
(156, 43, 'Insuficiente', 'sjkdfdkjf gjknxcbmk asdjkgnblkx fgk;lsnbk fdkg nkmf gnksa vjk gjksjanvk sfdgk;j', 1.00, 4),
(157, 44, 'Sobresaliente', 'SI SABES SOLDAR QUE PRO JAJAJ', 10.00, 1),
(158, 44, 'Notable', 'ESTUBO BIEN PERO PUEDES MEJORAR', 8.00, 2),
(159, 44, 'Aprobado', 'BUNEO POR LO MENOS SABES MEDIO SOLDAR', 6.00, 3),
(160, 44, 'Insuficiente', 'NO SABES NADA JAJAJA', 4.00, 4),
(161, 45, 'Sobresaliente', 'SOLDASTE LIMPIAMENTE AMIGO FELICIDADES', 10.00, 1),
(162, 45, 'Notable', 'TE FALTARON DETALLES PERO VAS BIEN', 8.00, 2),
(163, 45, 'Aprobado', 'BUENO POR LO MENOS HIZO ALGO', 6.00, 3),
(164, 45, 'Insuficiente', 'CHAMO PON CUIDADO EN CLASES A VER SI PASAS UN EXAMEN', 4.00, 4),
(165, 46, 'Sobresaliente', 'Jwdnsnnsbdna zndn', 10.00, 1),
(166, 46, 'Notable', 'Dnznsnnzdb s zjc snx snzbr sb', 8.00, 2),
(167, 46, 'Aprobado', 'Ejzjsn sjc sjc sjc djx d zjd dhd xj dej', 6.00, 3),
(168, 46, 'Insuficiente', 'Djzns zbd znxbw xjd xhe', 4.00, 4),
(169, 47, 'Sobresaliente', 'fdskngflksdnflknsdklgnfdglksdnf', 10.00, 1),
(170, 47, 'Notable', 'dlksnflksdnglknsdlkfnskdf', 8.00, 2),
(171, 47, 'Aprobado', 'dfklnsdlkfnlksdnflksdnflksd', 6.00, 3),
(172, 47, 'Insuficiente', 'lkdslkfndslkfnklsdnflksdngkdflknsdflkndsfknsdfjoisdjf', 4.00, 4);

-----------------------------------------------------------

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
CREATE TABLE `permisos` (
  `id_permiso` int(100) NOT NULL,
  `codigo_materia` int(100) NOT NULL,
  `codigo_seccion` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(26, 'Evaluacion de Programar', '31466704', 'INF201', 6, '2025-11-17', 10.00, 'Individual', 'HACER UN SQL QUE SIRVA', 'HAZ UNA BASE DE DATOS PARA GUARDAR INFROMACION DE UN LOGIN ', 1, '2025-11-12 14:53:48', 'Individual', 1),
(27, 'Evaluacion de Administracion', '31466704', 'CON202', 1, '2025-11-14', 10.00, 'Grupal', 'Hacer una evaluacion de unos costos fiscales', 'dada los siguientes costos resolver', 1, '2025-11-12 15:12:52', 'Individual', 1),
(28, 'Evaluacion docente', '31466704', 'ADM201', 22, '2025-11-07', 10.00, 'Individual', 'biurbnisdnktdnrig darjignidfngid fkjgnafj gjdalrjgi fduignadkfj brdnglkzx fjb vjkdzflgnkfd vbjkfd bg', 'gfngjfksd gjk rgfjk dfjtngakdf gsdingkjfd ngknadsk fbkjdafgnka fjksnfkg dfjkgnasdgad', 1, '2025-11-12 15:21:45', 'Individual', 1),
(29, 'EVALUACION DE PRUEBA', '31466704', 'MEC102', 20, '2025-11-20', 20.00, 'Presentacion', 'HACER UNAS SOLDADURAS CON EXITO', 'HACER UNAS CILLAS DE HIERRO TOTALMENTE SOLDADAS Y NOSE DE MECANICA JAJAJ', 1, '2025-11-13 00:11:17', 'Individual', 1),
(30, 'NOMBRE', '27739757', 'CON202', 24, '2025-11-18', 10.00, 'Presentacion', 'Jwjwjsbzbsbznjsbsjabdjsbwnsjsb', 'Bsbdbsbsndbsnsbdnwnwn', 1, '2025-11-13 12:56:43', 'Individual', 1),
(31, 'Eduar', '27739757', 'CON102', 14, '2025-11-01', 10.00, 'Individual', 'kfdnsfnknglksdnlkfnsdlk', 'dklnsflknsdlkfnsdgflksdmn', 1, '2025-11-13 19:04:37', 'Individual', 1);

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
(28, 'EDU101-D', 'EDU101', '12345678', '2-2025', 15, 'Vie 08:00-12:00', 'G-104', 1, '2025-11-12 14:43:39');

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
('30987788', 'Franchesca Izquierdo', 'franchesca@gmail.com', '123456789', 1, 1),
('31466704', 'Eduar Suarez', 'eduar@gmail.com', '4545', 1, 1),
('31987430', 'Heracles Sanchez', 'heraclesenmanuel@gmail.com', '4545', 2, 1),
('32366214', 'Ezequiel Angulo', 'ezequielangulo@gmail.com', '123456789', 2, 1);

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
  ADD PRIMARY KEY (`codigo`),
  ADD KEY `carrera_codigo` (`carrera_codigo`);

--
-- Indexes for table `nivel_desempeno`
--
ALTER TABLE `nivel_desempeno`
  ADD PRIMARY KEY (`id`),
  ADD KEY `criterio_id` (`criterio_id`);

--
-- Indexes for table `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id_permiso`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `detalle_evaluacion`
--
ALTER TABLE `detalle_evaluacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluacion_estudiante`
--
ALTER TABLE `evaluacion_estudiante`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=173;

--
-- AUTO_INCREMENT for table `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id_permiso` int(100) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rubrica_evaluacion`
--
ALTER TABLE `rubrica_evaluacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `seccion`
--
ALTER TABLE `seccion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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