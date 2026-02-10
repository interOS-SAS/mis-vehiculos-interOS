const { query } = require('../config/database');

class Mantenimiento {
  // Crear nuevo mantenimiento
  static async crear(datos) {
    const {
      vehiculo_id,
      tipo_mantenimiento,
      descripcion,
      kilometraje_realizado,
      costo,
      mecanico,
      taller,
      proximo_mantenimiento_km,
      proximo_mantenimiento_fecha,
      fotos,
      facturas,
      usuario_registro_id,
      fecha_mantenimiento
    } = datos;

    const sql = `
      INSERT INTO mantenimientos (
        vehiculo_id, tipo_mantenimiento, descripcion, kilometraje_realizado,
        costo, mecanico, taller, proximo_mantenimiento_km,
        proximo_mantenimiento_fecha, fotos, facturas,
        usuario_registro_id, fecha_mantenimiento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      vehiculo_id,
      tipo_mantenimiento,
      descripcion,
      kilometraje_realizado,
      costo || 0,
      mecanico || null,
      taller || null,
      proximo_mantenimiento_km || null,
      proximo_mantenimiento_fecha || null,
      fotos ? JSON.stringify(fotos) : null,
      facturas ? JSON.stringify(facturas) : null,
      usuario_registro_id,
      fecha_mantenimiento || new Date()
    ]);

    return result.insertId;
  }

  // Obtener mantenimientos por vehículo
  static async obtenerPorVehiculo(vehiculoId, limite = 20, offset = 0) {
    const sql = `
      SELECT 
        m.*,
        u.nombre as usuario_nombre,
        v.placa,
        v.marca,
        v.modelo
      FROM mantenimientos m
      JOIN usuarios u ON m.usuario_registro_id = u.id
      JOIN vehiculos v ON m.vehiculo_id = v.id
      WHERE m.vehiculo_id = ?
      ORDER BY m.fecha_mantenimiento DESC
      LIMIT ? OFFSET ?
    `;

    const results = await query(sql, [vehiculoId, limite, offset]);
    
    // Parsear JSON de fotos y facturas
    return results.map(m => ({
      ...m,
      fotos: m.fotos ? JSON.parse(m.fotos) : [],
      facturas: m.facturas ? JSON.parse(m.facturas) : []
    }));
  }

  // Obtener todos los mantenimientos con filtros
  static async obtenerTodos(filtros = {}) {
    let sql = `
      SELECT 
        m.*,
        u.nombre as usuario_nombre,
        v.placa,
        v.marca,
        v.modelo
      FROM mantenimientos m
      JOIN usuarios u ON m.usuario_registro_id = u.id
      JOIN vehiculos v ON m.vehiculo_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (filtros.vehiculo_id) {
      sql += ' AND m.vehiculo_id = ?';
      params.push(filtros.vehiculo_id);
    }

    if (filtros.tipo_mantenimiento) {
      sql += ' AND m.tipo_mantenimiento = ?';
      params.push(filtros.tipo_mantenimiento);
    }

    if (filtros.fecha_desde) {
      sql += ' AND m.fecha_mantenimiento >= ?';
      params.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      sql += ' AND m.fecha_mantenimiento <= ?';
      params.push(filtros.fecha_hasta);
    }

    sql += ' ORDER BY m.fecha_mantenimiento DESC';

    if (filtros.limite) {
      sql += ' LIMIT ?';
      params.push(parseInt(filtros.limite));
    }

    const results = await query(sql, params);
    
    return results.map(m => ({
      ...m,
      fotos: m.fotos ? JSON.parse(m.fotos) : [],
      facturas: m.facturas ? JSON.parse(m.facturas) : []
    }));
  }

  // Obtener mantenimiento por ID
  static async obtenerPorId(id) {
    const sql = `
      SELECT 
        m.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        v.placa,
        v.marca,
        v.modelo,
        v.kilometraje_actual
      FROM mantenimientos m
      JOIN usuarios u ON m.usuario_registro_id = u.id
      JOIN vehiculos v ON m.vehiculo_id = v.id
      WHERE m.id = ?
    `;

    const results = await query(sql, [id]);
    
    if (results.length === 0) return null;
    
    const mantenimiento = results[0];
    return {
      ...mantenimiento,
      fotos: mantenimiento.fotos ? JSON.parse(mantenimiento.fotos) : [],
      facturas: mantenimiento.facturas ? JSON.parse(mantenimiento.facturas) : []
    };
  }

  // Obtener próximos mantenimientos
  static async obtenerProximos(limite = 10) {
    const sql = `
      SELECT 
        v.id as vehiculo_id,
        v.placa,
        v.marca,
        v.modelo,
        v.kilometraje_actual,
        m.id as mantenimiento_id,
        m.tipo_mantenimiento,
        m.proximo_mantenimiento_km,
        m.proximo_mantenimiento_fecha,
        (m.proximo_mantenimiento_km - v.kilometraje_actual) as km_restantes,
        DATEDIFF(m.proximo_mantenimiento_fecha, CURDATE()) as dias_restantes,
        CASE 
          WHEN m.proximo_mantenimiento_km <= v.kilometraje_actual THEN 'VENCIDO'
          WHEN (m.proximo_mantenimiento_km - v.kilometraje_actual) <= 500 THEN 'URGENTE'
          WHEN (m.proximo_mantenimiento_km - v.kilometraje_actual) <= 1000 THEN 'PROXIMO'
          ELSE 'PROGRAMADO'
        END as estado,
        u.nombre as conductor_nombre,
        u.telefono as conductor_telefono,
        u.email as conductor_email
      FROM vehiculos v
      INNER JOIN mantenimientos m ON v.id = m.vehiculo_id
      LEFT JOIN usuarios u ON v.conductor_asignado_id = u.id
      WHERE v.activo = TRUE 
        AND m.proximo_mantenimiento_km IS NOT NULL
        AND m.id = (
          SELECT m2.id 
          FROM mantenimientos m2 
          WHERE m2.vehiculo_id = v.id 
            AND m2.tipo_mantenimiento = m.tipo_mantenimiento
            AND m2.proximo_mantenimiento_km IS NOT NULL
          ORDER BY m2.fecha_mantenimiento DESC 
          LIMIT 1
        )
      ORDER BY km_restantes ASC
      LIMIT ?
    `;

    return await query(sql, [limite]);
  }

  // Obtener mantenimientos vencidos
  static async obtenerVencidos() {
    const sql = `
      SELECT 
        v.id as vehiculo_id,
        v.placa,
        v.marca,
        v.modelo,
        v.kilometraje_actual,
        m.tipo_mantenimiento,
        m.proximo_mantenimiento_km,
        m.proximo_mantenimiento_fecha,
        (v.kilometraje_actual - m.proximo_mantenimiento_km) as km_excedidos,
        DATEDIFF(CURDATE(), m.proximo_mantenimiento_fecha) as dias_vencidos,
        u.nombre as conductor_nombre,
        u.telefono as conductor_telefono,
        u.email as conductor_email
      FROM vehiculos v
      INNER JOIN mantenimientos m ON v.id = m.vehiculo_id
      LEFT JOIN usuarios u ON v.conductor_asignado_id = u.id
      WHERE v.activo = TRUE 
        AND (
          m.proximo_mantenimiento_km <= v.kilometraje_actual
          OR m.proximo_mantenimiento_fecha <= CURDATE()
        )
      ORDER BY km_excedidos DESC, dias_vencidos DESC
    `;

    return await query(sql);
  }

  // Actualizar mantenimiento
  static async actualizar(id, datos) {
    const campos = [];
    const valores = [];

    const camposPermitidos = [
      'tipo_mantenimiento', 'descripcion', 'kilometraje_realizado',
      'costo', 'mecanico', 'taller', 'proximo_mantenimiento_km',
      'proximo_mantenimiento_fecha', 'fecha_mantenimiento'
    ];

    for (const campo of camposPermitidos) {
      if (datos[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        valores.push(datos[campo]);
      }
    }

    if (datos.fotos !== undefined) {
      campos.push('fotos = ?');
      valores.push(JSON.stringify(datos.fotos));
    }

    if (datos.facturas !== undefined) {
      campos.push('facturas = ?');
      valores.push(JSON.stringify(datos.facturas));
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    const sql = `UPDATE mantenimientos SET ${campos.join(', ')} WHERE id = ?`;
    const result = await query(sql, valores);

    return result.affectedRows > 0;
  }

  // Eliminar mantenimiento
  static async eliminar(id) {
    const sql = 'DELETE FROM mantenimientos WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Obtener estadísticas de mantenimientos
  static async obtenerEstadisticas(vehiculoId, fechaInicio = null, fechaFin = null) {
    let sql = `
      SELECT 
        tipo_mantenimiento,
        COUNT(*) as cantidad,
        SUM(costo) as costo_total,
        AVG(costo) as costo_promedio,
        MAX(fecha_mantenimiento) as ultimo_mantenimiento
      FROM mantenimientos
      WHERE vehiculo_id = ?
    `;
    const params = [vehiculoId];

    if (fechaInicio) {
      sql += ' AND fecha_mantenimiento >= ?';
      params.push(fechaInicio);
    }

    if (fechaFin) {
      sql += ' AND fecha_mantenimiento <= ?';
      params.push(fechaFin);
    }

    sql += ' GROUP BY tipo_mantenimiento';

    return await query(sql, params);
  }

  // Obtener costos totales por vehículo
  static async obtenerCostosTotalesPorVehiculo(fechaInicio, fechaFin) {
    const sql = `
      SELECT 
        v.id,
        v.placa,
        v.marca,
        v.modelo,
        COUNT(m.id) as total_mantenimientos,
        SUM(m.costo) as costo_total,
        AVG(m.costo) as costo_promedio
      FROM vehiculos v
      LEFT JOIN mantenimientos m ON v.id = m.vehiculo_id
        AND m.fecha_mantenimiento >= ?
        AND m.fecha_mantenimiento <= ?
      WHERE v.activo = TRUE
      GROUP BY v.id, v.placa, v.marca, v.modelo
      ORDER BY costo_total DESC
    `;

    return await query(sql, [fechaInicio, fechaFin]);
  }

  // Obtener historial de cambios de aceite
  static async obtenerHistorialCambiosAceite(vehiculoId) {
    const sql = `
      SELECT 
        fecha_mantenimiento,
        kilometraje_realizado,
        costo,
        mecanico,
        taller,
        descripcion
      FROM mantenimientos
      WHERE vehiculo_id = ?
        AND tipo_mantenimiento = 'cambio_aceite'
      ORDER BY fecha_mantenimiento DESC
    `;

    return await query(sql, [vehiculoId]);
  }

  // Verificar alertas de mantenimiento pendientes
  static async verificarAlertas() {
    const sql = `
      SELECT 
        v.id as vehiculo_id,
        v.placa,
        v.marca,
        v.modelo,
        v.kilometraje_actual,
        v.ultimo_cambio_aceite,
        v.km_cambio_aceite,
        (v.kilometraje_actual - v.ultimo_cambio_aceite) as km_desde_ultimo_aceite,
        u.nombre as conductor_nombre,
        u.email as conductor_email,
        u.telefono as conductor_telefono
      FROM vehiculos v
      LEFT JOIN usuarios u ON v.conductor_asignado_id = u.id
      WHERE v.activo = TRUE
        AND (v.kilometraje_actual - v.ultimo_cambio_aceite) >= (v.km_cambio_aceite - 500)
    `;

    return await query(sql);
  }
}

module.exports = Mantenimiento;
