-- Crear base de datos
CREATE DATABASE IF NOT EXISTS `tableropresiondelgasto`;
USE `tableropresiondelgasto`;

-- Tabla año
CREATE TABLE IF NOT EXISTS `año` (
  `id_años` INT NOT NULL AUTO_INCREMENT,
  `a_numero_año` INT NOT NULL,
  PRIMARY KEY (`id_años`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla años_datos
CREATE TABLE IF NOT EXISTS `años_datos` (
  `id_años_datos` INT NOT NULL AUTO_INCREMENT,
  `id_escenario` INT NOT NULL,
  `id_año` INT NOT NULL,
  `ad_presion_gastos` DECIMAL(15,2) NOT NULL,
  `ad_num_proy_pre` INT NOT NULL,
  `ad_costo_x_proyecto` DECIMAL(15,2) NOT NULL,
  `ad_2025_ppto_x_comp` DECIMAL(15,2) NOT NULL,
  PRIMARY KEY (`id_años_datos`),
  KEY `id_escenario` (`id_escenario`),
  KEY `fk_años_datos_año` (`id_año`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla convocatorias
CREATE TABLE IF NOT EXISTS `convocatorias` (
  `id_convocatoria` INT NOT NULL AUTO_INCREMENT,
  `c_nombre` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_convocatoria`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla datos_convocatoria
CREATE TABLE IF NOT EXISTS `datos_convocatoria` (
  `id_datos_conv` INT NOT NULL AUTO_INCREMENT,
  `id_convocatoria` INT NOT NULL,
  `id_esenario` INT NOT NULL,
  `id_año` INT NOT NULL,
  `dc_nuevos_proyectos` INT NOT NULL,
  `dc_costo_x_proyecto` DECIMAL(15,2) NOT NULL,
  `dc_subtotal` DECIMAL(15,2) NOT NULL,
  `dc_porcentaje_x_año` DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (`id_datos_conv`),
  KEY `id_convocatoria` (`id_convocatoria`),
  KEY `id_esenario` (`id_esenario`),
  KEY `id_año` (`id_año`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla escenarios
CREATE TABLE IF NOT EXISTS `escenarios` (
  `id_escenario` INT NOT NULL AUTO_INCREMENT,
  `e_nombre` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_escenario`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla incremento_presupuesto
CREATE TABLE IF NOT EXISTS `incremento_presupuesto` (
  `id_presupuesto` INT NOT NULL AUTO_INCREMENT,
  `id_esenario` INT NOT NULL,
  `id_año` INT DEFAULT NULL,
  `ip_total_bruto` DECIMAL(15,2) NOT NULL,
  `ip_total_pre` DECIMAL(15,2) NOT NULL,
  `ip_porcentaje` DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (`id_presupuesto`),
  UNIQUE KEY `idx_unique_escenario_año` (`id_esenario`,`id_año`),
  KEY `fk_incremento_presupuesto_año` (`id_año`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla resumen1
CREATE TABLE IF NOT EXISTS `resumen1` (
  `id_r1` INT NOT NULL AUTO_INCREMENT,
  `id_presupuesto` INT NOT NULL,
  `r1_presupuestio_bruto` DECIMAL(15,2) NOT NULL,
  `r1_presion_gasto_realv` DECIMAL(15,2) NOT NULL,
  `r1_presupuesto_comprometer` DECIMAL(15,2) NOT NULL,
  `r1_presion_gasto_proyectada` DECIMAL(15,2) NOT NULL,
  `r1_monto_total_comprometido` DECIMAL(15,2) NOT NULL,
  `r1_deficit` DECIMAL(15,2) NOT NULL,
  PRIMARY KEY (`id_r1`),
  KEY `id_presupuesto` (`id_presupuesto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla resumen2
CREATE TABLE IF NOT EXISTS `resumen2` (
  `id_r2` INT NOT NULL AUTO_INCREMENT,
  `id_presupuesto` INT NOT NULL,
  `r2_proyectos_presion` INT NOT NULL,
  `r2_proyectos_comprometer` INT NOT NULL,
  `r2_total_proyectos` INT NOT NULL,
  PRIMARY KEY (`id_r2`),
  KEY `id_presupuesto` (`id_presupuesto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla table_1
CREATE TABLE IF NOT EXISTS `table_1` (
  `id_t1` INT NOT NULL AUTO_INCREMENT,
  `t1_AÑOS` INT NOT NULL,
  `t1_PRESUPUESTO_F003` DECIMAL(15,2) NOT NULL,
  `t1_DAIHC_VS_F003` DECIMAL(5,2) NOT NULL,
  `t1_MONTO_MINIST_DAIHC` DECIMAL(15,2) NOT NULL,
  `t1_INCREMENTO_X_AÑO` DECIMAL(5,2) NOT NULL,
  `t1_PROMEDIO_INCREMENTO` DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (`id_t1`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla table_2
CREATE TABLE IF NOT EXISTS `table_2` (
  `id_t2` INT NOT NULL AUTO_INCREMENT,
  `t2_AÑOS` INT NOT NULL,
  `t2_IMPORTE_MINISTRADO_DAIHC` VARCHAR(50) NOT NULL,
  `t2_DINERO_MINISTRADO` DECIMAL(15,2) NOT NULL,
  `t2_NUMERO_DE_PROYECTOS` INT NOT NULL,
  `t2_COSTO_APROX_PROY` DECIMAL(15,2) NOT NULL,
  `t2_COSTO_PROMEDIO_X_PROY` DECIMAL(15,2) NOT NULL,
  PRIMARY KEY (`id_t2`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla total
CREATE TABLE IF NOT EXISTS `total` (
  `id_total` INT NOT NULL AUTO_INCREMENT,
  `id_escenario` INT NOT NULL,
  `t_total_costo_x_proyecto` DECIMAL(15,2) NOT NULL,
  `t_total_subtotal` DECIMAL(15,2) NOT NULL,
  `t_total_porcentaje` DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (`id_total`),
  KEY `id_escenario` (`id_escenario`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Vistas
CREATE OR REPLACE VIEW `v_años_datos` AS
SELECT 
  `id_años_datos`,
  `id_escenario`,
  `id_año`,
  CONCAT('$', FORMAT(`ad_presion_gastos`, 2)) AS `ad_presion_gastos`,
  `ad_num_proy_pre`,
  CONCAT('$', FORMAT(`ad_costo_x_proyecto`, 2)) AS `ad_costo_x_proyecto`,
  CONCAT('$', FORMAT(`ad_2025_ppto_x_comp`, 2)) AS `ad_2025_ppto_x_comp`
FROM 
  `años_datos`;

CREATE OR REPLACE VIEW `v_datos_convocatoria` AS
SELECT 
  `id_datos_conv`,
  `id_convocatoria`,
  `id_esenario`,
  `id_año`,
  `dc_nuevos_proyectos`,
  CONCAT('$', FORMAT(`dc_costo_x_proyecto`, 2)) AS `dc_costo_x_proyecto`,
  CONCAT('$', FORMAT(`dc_subtotal`, 2)) AS `dc_subtotal`,
  CONCAT(FORMAT(`dc_porcentaje_x_año`, 2), '%') AS `dc_porcentaje_x_año`
FROM 
  `datos_convocatoria`;

CREATE OR REPLACE VIEW `v_incremento_presupuesto` AS
SELECT 
  `id_presupuesto`,
  `id_esenario`,
  CONCAT('$', FORMAT(`ip_total_bruto`, 2)) AS `ip_total_bruto`,
  CONCAT('$', FORMAT(`ip_total_pre`, 2)) AS `ip_total_pre`,
  CONCAT(FORMAT(`ip_porcentaje`, 2), '%') AS `ip_porcentaje`
FROM 
  `incremento_presupuesto`;

CREATE OR REPLACE VIEW `v_resumen1` AS
SELECT 
  `id_r1`,
  `id_presupuesto`,
  CONCAT('$', FORMAT(`r1_presupuestio_bruto`, 2)) AS `r1_presupuestio_bruto`,
  CONCAT('$', FORMAT(`r1_presion_gasto_realv`, 2)) AS `r1_presion_gasto_realv`,
  CONCAT('$', FORMAT(`r1_presupuesto_comprometer`, 2)) AS `r1_presupuesto_comprometer`,
  CONCAT('$', FORMAT(`r1_presion_gasto_proyectada`, 2)) AS `r1_presion_gasto_proyectada`,
  CONCAT('$', FORMAT(`r1_monto_total_comprometido`, 2)) AS `r1_monto_total_comprometido`,
  CONCAT('$', FORMAT(`r1_deficit`, 2)) AS `r1_deficit`
FROM 
  `resumen1`;

CREATE OR REPLACE VIEW `v_table_1` AS
SELECT 
  `id_t1`,
  `t1_AÑOS`,
  CONCAT('$', FORMAT(`t1_PRESUPUESTO_F003`, 2)) AS `t1_PRESUPUESTO_F003`,
  CONCAT(FORMAT(`t1_DAIHC_VS_F003`, 2), '%') AS `t1_DAIHC_VS_F003`,
  CONCAT('$', FORMAT(`t1_MONTO_MINIST_DAIHC`, 2)) AS `t1_MONTO_MINIST_DAIHC`,
  CONCAT(FORMAT(`t1_INCREMENTO_X_AÑO`, 2), '%') AS `t1_INCREMENTO_X_AÑO`,
  CONCAT(FORMAT(`t1_PROMEDIO_INCREMENTO`, 2), '%') AS `t1_PROMEDIO_INCREMENTO`
FROM 
  `table_1`;

CREATE OR REPLACE VIEW `v_table_2` AS
SELECT 
  `id_t2`,
  `t2_AÑOS`,
  `t2_IMPORTE_MINISTRADO_DAIHC`,
  CONCAT('$', FORMAT(`t2_DINERO_MINISTRADO`, 2)) AS `t2_DINERO_MINISTRADO`,
  `t2_NUMERO_DE_PROYECTOS`,
  CONCAT('$', FORMAT(`t2_COSTO_APROX_PROY`, 2)) AS `t2_COSTO_APROX_PROY`,
  CONCAT('$', FORMAT(`t2_COSTO_PROMEDIO_X_PROY`, 2)) AS `t2_COSTO_PROMEDIO_X_PROY`
FROM 
  `table_2`;

CREATE OR REPLACE VIEW `v_total` AS
SELECT 
  `id_total`,
  `id_escenario`,
  CONCAT('$', FORMAT(`t_total_costo_x_proyecto`, 2)) AS `t_total_costo_x_proyecto`,
  CONCAT('$', FORMAT(`t_total_subtotal`, 2)) AS `t_total_subtotal`,
  CONCAT(FORMAT(`t_total_porcentaje`, 2), '%') AS `t_total_porcentaje`
FROM 
  `total`;