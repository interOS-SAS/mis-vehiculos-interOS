-- ============================================
-- SISTEMA DE CONTROL DE VEHÍCULOS - INTEROS
-- Base de Datos MySQL
-- ============================================

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'conductor', 'mecanico') DEFAULT 'conductor',
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de vehículos
CREATE TABLE vehiculos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    anio YEAR NOT NULL,
    color VARCHAR(30),
    tipo_vehiculo ENUM('camioneta', 'camion', 'moto', 'automovil', 'van') NOT NULL,
    kilometraje_actual INT DEFAULT 0,
    capacidad_tanque DECIMAL(6,2) DEFAULT 0,
    km_cambio_aceite INT DEFAULT 5000,
    ultimo_cambio_aceite INT DEFAULT 0,
    dias_alerta_aceite INT DEFAULT 7,
    conductor_asignado_id INT,
    foto_vehiculo VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conductor_asignado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_placa (placa),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de registros de kilometraje
CREATE TABLE registros_kilometraje (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    kilometraje INT NOT NULL,
    foto_odometro VARCHAR(500) NOT NULL,
    observaciones TEXT,
    ubicacion VARCHAR(200),
    fecha_registro DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_vehiculo_fecha (vehiculo_id, fecha_registro),
    INDEX idx_fecha (fecha_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de combustible
CREATE TABLE registros_combustible (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    kilometraje_carga INT NOT NULL,
    litros DECIMAL(8,2) NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL,
    precio_litro DECIMAL(8,2) NOT NULL,
    tipo_combustible ENUM('gasolina_corriente', 'gasolina_extra', 'diesel', 'gas') DEFAULT 'gasolina_corriente',
    estacion VARCHAR(100),
    tanque_lleno BOOLEAN DEFAULT FALSE,
    foto_factura VARCHAR(500),
    rendimiento_calculado DECIMAL(6,2),
    observaciones TEXT,
    fecha_carga DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_vehiculo_fecha (vehiculo_id, fecha_carga),
    INDEX idx_fecha (fecha_carga)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de mantenimientos
CREATE TABLE mantenimientos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    tipo_mantenimiento ENUM('cambio_aceite', 'cambio_filtros', 'alineacion', 'frenos', 'llantas', 'revision_general', 'reparacion', 'otro') NOT NULL,
    descripcion TEXT NOT NULL,
    kilometraje_realizado INT NOT NULL,
    costo DECIMAL(10,2) DEFAULT 0,
    mecanico VARCHAR(100),
    taller VARCHAR(100),
    proximo_mantenimiento_km INT,
    proximo_mantenimiento_fecha DATE,
    fotos JSON,
    facturas JSON,
    usuario_registro_id INT NOT NULL,
    fecha_mantenimiento DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_vehiculo_tipo (vehiculo_id, tipo_mantenimiento),
    INDEX idx_vehiculo_fecha (vehiculo_id, fecha_mantenimiento),
    INDEX idx_proximo (proximo_mantenimiento_km, proximo_mantenimiento_fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    tipo ENUM('cambio_aceite', 'mantenimiento_programado', 'alerta_kilometraje', 'otro') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
    enviada BOOLEAN DEFAULT FALSE,
    fecha_envio DATETIME,
    metodo_envio ENUM('email', 'whatsapp', 'ambos') DEFAULT 'ambos',
    destinatarios JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    INDEX idx_vehiculo_enviada (vehiculo_id, enviada),
    INDEX idx_fecha_envio (fecha_envio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de alertas automáticas
CREATE TABLE alertas_configuracion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    tipo_alerta ENUM('cambio_aceite', 'revision_general', 'cambio_llantas', 'soat', 'tecnicomecanica') NOT NULL,
    km_intervalo INT,
    dias_intervalo INT,
    dias_anticipacion INT DEFAULT 7,
    activa BOOLEAN DEFAULT TRUE,
    ultima_alerta_enviada DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vehiculo_tipo (vehiculo_id, tipo_alerta),
    INDEX idx_activa (activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de documentos del vehículo
CREATE TABLE documentos_vehiculo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    tipo_documento ENUM('soat', 'tecnicomecanica', 'tarjeta_propiedad', 'poliza', 'otro') NOT NULL,
    numero_documento VARCHAR(50),
    fecha_expedicion DATE,
    fecha_vencimiento DATE,
    entidad_emisora VARCHAR(100),
    archivo_url VARCHAR(500),
    costo DECIMAL(10,2),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
    INDEX idx_vehiculo_tipo (vehiculo_id, tipo_documento),
    INDEX idx_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de logs del sistema
CREATE TABLE logs_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario_fecha (usuario_id, created_at),
    INDEX idx_tabla_registro (tabla_afectada, registro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Usuario administrador por defecto (password: Admin123!)
INSERT INTO usuarios (nombre, email, password, rol, telefono) VALUES
('Administrador INTEROS', 'admin@interos.com.co', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGQM/L3eIQvZLQ2qYQqKSPm', 'admin', '3001234567');

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de resumen de vehículos
CREATE VIEW vista_resumen_vehiculos AS
SELECT 
    v.id,
    v.placa,
    v.marca,
    v.modelo,
    v.tipo_vehiculo,
    v.kilometraje_actual,
    v.ultimo_cambio_aceite,
    v.km_cambio_aceite,
    (v.kilometraje_actual - v.ultimo_cambio_aceite) as km_desde_ultimo_aceite,
    (v.km_cambio_aceite - (v.kilometraje_actual - v.ultimo_cambio_aceite)) as km_para_proximo_aceite,
    u.nombre as conductor_asignado,
    u.telefono as telefono_conductor,
    CASE 
        WHEN (v.kilometraje_actual - v.ultimo_cambio_aceite) >= v.km_cambio_aceite THEN 'URGENTE'
        WHEN (v.kilometraje_actual - v.ultimo_cambio_aceite) >= (v.km_cambio_aceite * 0.9) THEN 'PROXIMO'
        ELSE 'OK'
    END as estado_aceite
FROM vehiculos v
LEFT JOIN usuarios u ON v.conductor_asignado_id = u.id
WHERE v.activo = TRUE;

-- Vista de consumo de combustible
CREATE VIEW vista_consumo_combustible AS
SELECT 
    v.placa,
    v.marca,
    v.modelo,
    COUNT(rc.id) as total_cargas,
    SUM(rc.litros) as total_litros,
    SUM(rc.costo_total) as total_gastado,
    AVG(rc.rendimiento_calculado) as rendimiento_promedio,
    AVG(rc.precio_litro) as precio_promedio_litro,
    MAX(rc.fecha_carga) as ultima_carga
FROM vehiculos v
LEFT JOIN registros_combustible rc ON v.id = rc.vehiculo_id
WHERE v.activo = TRUE
GROUP BY v.id, v.placa, v.marca, v.modelo;

-- Vista de próximos mantenimientos
CREATE VIEW vista_proximos_mantenimientos AS
SELECT 
    v.placa,
    v.marca,
    v.modelo,
    m.tipo_mantenimiento,
    m.proximo_mantenimiento_km,
    m.proximo_mantenimiento_fecha,
    v.kilometraje_actual,
    (m.proximo_mantenimiento_km - v.kilometraje_actual) as km_restantes,
    DATEDIFF(m.proximo_mantenimiento_fecha, CURDATE()) as dias_restantes,
    CASE 
        WHEN m.proximo_mantenimiento_km <= v.kilometraje_actual THEN 'VENCIDO'
        WHEN (m.proximo_mantenimiento_km - v.kilometraje_actual) <= 500 THEN 'URGENTE'
        WHEN (m.proximo_mantenimiento_km - v.kilometraje_actual) <= 1000 THEN 'PROXIMO'
        ELSE 'PROGRAMADO'
    END as estado
FROM vehiculos v
INNER JOIN mantenimientos m ON v.id = m.vehiculo_id
WHERE v.activo = TRUE 
  AND m.proximo_mantenimiento_km IS NOT NULL
ORDER BY km_restantes ASC;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

DELIMITER //

-- Procedimiento para calcular rendimiento de combustible
CREATE PROCEDURE calcular_rendimiento_combustible(IN p_vehiculo_id INT)
BEGIN
    DECLARE v_ultimo_km INT;
    DECLARE v_penultimo_km INT;
    DECLARE v_litros_carga DECIMAL(8,2);
    DECLARE v_rendimiento DECIMAL(6,2);
    DECLARE v_registro_id INT;
    
    -- Obtener última carga
    SELECT id, kilometraje_carga, litros 
    INTO v_registro_id, v_ultimo_km, v_litros_carga
    FROM registros_combustible 
    WHERE vehiculo_id = p_vehiculo_id 
    ORDER BY fecha_carga DESC 
    LIMIT 1;
    
    -- Obtener penúltima carga
    SELECT kilometraje_carga 
    INTO v_penultimo_km
    FROM registros_combustible 
    WHERE vehiculo_id = p_vehiculo_id 
    ORDER BY fecha_carga DESC 
    LIMIT 1 OFFSET 1;
    
    -- Calcular rendimiento si hay datos
    IF v_penultimo_km IS NOT NULL AND v_litros_carga > 0 THEN
        SET v_rendimiento = (v_ultimo_km - v_penultimo_km) / v_litros_carga;
        
        UPDATE registros_combustible 
        SET rendimiento_calculado = v_rendimiento 
        WHERE id = v_registro_id;
    END IF;
END //

-- Procedimiento para actualizar kilometraje del vehículo
CREATE PROCEDURE actualizar_kilometraje_vehiculo(
    IN p_vehiculo_id INT,
    IN p_nuevo_kilometraje INT
)
BEGIN
    DECLARE v_km_actual INT;
    
    SELECT kilometraje_actual INTO v_km_actual
    FROM vehiculos
    WHERE id = p_vehiculo_id;
    
    IF p_nuevo_kilometraje > v_km_actual THEN
        UPDATE vehiculos 
        SET kilometraje_actual = p_nuevo_kilometraje,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_vehiculo_id;
    END IF;
END //

-- Procedimiento para verificar alertas pendientes
CREATE PROCEDURE verificar_alertas_mantenimiento()
BEGIN
    -- Insertar notificaciones para vehículos que necesitan cambio de aceite
    INSERT INTO notificaciones (vehiculo_id, tipo, titulo, mensaje, prioridad, metodo_envio, destinatarios)
    SELECT 
        v.id,
        'cambio_aceite',
        CONCAT('Cambio de aceite requerido - ', v.placa),
        CONCAT('El vehículo ', v.placa, ' ', v.marca, ' ', v.modelo, 
               ' ha alcanzado ', (v.kilometraje_actual - v.ultimo_cambio_aceite), 
               ' km desde el último cambio de aceite. Se recomienda realizar el mantenimiento.'),
        CASE 
            WHEN (v.kilometraje_actual - v.ultimo_cambio_aceite) >= (v.km_cambio_aceite * 1.1) THEN 'urgente'
            WHEN (v.kilometraje_actual - v.ultimo_cambio_aceite) >= v.km_cambio_aceite THEN 'alta'
            ELSE 'media'
        END,
        'ambos',
        JSON_ARRAY(
            JSON_OBJECT('email', u.email, 'telefono', u.telefono),
            JSON_OBJECT('email', 'admin@interos.com.co', 'telefono', '3001234567')
        )
    FROM vehiculos v
    LEFT JOIN usuarios u ON v.conductor_asignado_id = u.id
    WHERE v.activo = TRUE
      AND (v.kilometraje_actual - v.ultimo_cambio_aceite) >= (v.km_cambio_aceite - 500)
      AND NOT EXISTS (
          SELECT 1 FROM notificaciones n 
          WHERE n.vehiculo_id = v.id 
            AND n.tipo = 'cambio_aceite'
            AND n.enviada = FALSE
            AND n.created_at > DATE_SUB(NOW(), INTERVAL 3 DAY)
      );
END //

DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Trigger para actualizar kilometraje al registrar
CREATE TRIGGER after_registro_kilometraje 
AFTER INSERT ON registros_kilometraje
FOR EACH ROW
BEGIN
    CALL actualizar_kilometraje_vehiculo(NEW.vehiculo_id, NEW.kilometraje);
END //

-- Trigger para calcular rendimiento al registrar combustible
CREATE TRIGGER after_registro_combustible 
AFTER INSERT ON registros_combustible
FOR EACH ROW
BEGIN
    CALL actualizar_kilometraje_vehiculo(NEW.vehiculo_id, NEW.kilometraje_carga);
    CALL calcular_rendimiento_combustible(NEW.vehiculo_id);
END //

-- Trigger para actualizar último cambio de aceite
CREATE TRIGGER after_mantenimiento_aceite 
AFTER INSERT ON mantenimientos
FOR EACH ROW
BEGIN
    IF NEW.tipo_mantenimiento = 'cambio_aceite' THEN
        UPDATE vehiculos 
        SET ultimo_cambio_aceite = NEW.kilometraje_realizado
        WHERE id = NEW.vehiculo_id;
    END IF;
END //

DELIMITER ;
