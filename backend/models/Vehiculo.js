const { query, transaction } = require('../config/database');

class Vehiculo {
  // Crear nuevo vehículo
  static async crear(datos) {
    const {
      placa,
      marca,
      modelo,
      anio,
      color,
      tipo_vehiculo,
      capacidad_tanque,
      km_cambio_aceite,
      conductor_asignado_id,
      foto_vehiculo
    } = datos;

    const sql = `
      INSERT INTO vehiculos (
        placa, marca, modelo, anio, color, tipo_vehiculo,
        capacidad_tanque, km_cambio_aceite, conductor_asignado_id, foto_vehiculo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      placa.toUpperCase(),
      marca,
      modelo,
      anio,
      color,
      tipo_vehiculo,
      capacidad_tanque || 0,
      km_cambio_aceite || 5000,
      conductor_asignado_id || null,
      foto_vehiculo || null
    ]);

    return result.insertId;
  }

  // Obtener todos los vehículos
  static async obtenerTodos(filtros = {}) {
    let sql = `
      SELECT 
        v.*,
        u.nombre as conductor_nombre,
        u.telefono as conductor_telefono,
        (v.kilometraje_actual - v.ultimo_cambio_aceite) as km_desde_ultimo_aceite,
        (v.km_cambio_aceite - (v.kilometraje_actual - v.ultimo_cambio_aceite)) as km_para_proximo_aceite,
        CASE 
          WHEN (v.kilometraje_actual - v.ultimo_cambio_aceite) >= v.km_cambio_aceite THEN 'URGENTE'
          WHEN (v.kilometraje_actual - v.ultimo_cambio_aceite) >= (v.km_cambio_aceite * 0.9) THEN 'PROXIMO'
          ELSE 'OK'
        END as estado_aceite
      FROM vehiculos v
      LEFT JOIN usuarios u ON v.conductor_asignado_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filtros.activo !== undefined) {
      sql += ' AND v.activo = ?';
      params.push(filtros.activo);
    }

    if (filtros.tipo_vehiculo) {
      sql += ' AND v.tipo_vehiculo = ?';
      params.push(filtros.tipo_vehiculo);
    }

    if (filtros.conductor_asignado_id) {
      sql += ' AND v.conductor_asignado_id = ?';
      params.push(filtros.conductor_asignado_id);
    }

    sql += ' ORDER BY v.placa ASC';

    return await query(sql, params);
  }

  // Obtener vehículo por ID
  static async obtenerPorId(id) {
    const sql = `
      SELECT 
        v.*,
        u.nombre as conductor_nombre,
        u.email as conductor_email,
        u.telefono as conductor_telefono,
        (v.kilometraje_actual - v.ultimo_cambio_aceite) as km_desde_ultimo_aceite,
        (v.km_cambio_aceite - (v.kilometraje_actual - v.ultimo_cambio_aceite)) as km_para_proximo_aceite
      FROM vehiculos v
      LEFT JOIN usuarios u ON v.conductor_asignado_id = u.id
      WHERE v.id = ?
    `;

    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Obtener vehículo por placa
  static async obtenerPorPlaca(placa) {
    const sql = 'SELECT * FROM vehiculos WHERE placa = ?';
    const results = await query(sql, [placa.toUpperCase()]);
    return results[0] || null;
  }

  // Actualizar vehículo
  static async actualizar(id, datos) {
    const campos = [];
    const valores = [];

    const camposPermitidos = [
      'placa', 'marca', 'modelo', 'anio', 'color', 'tipo_vehiculo',
      'capacidad_tanque', 'km_cambio_aceite', 'kilometraje_actual',
      'ultimo_cambio_aceite', 'conductor_asignado_id', 'foto_vehiculo', 'activo'
    ];

    for (const campo of camposPermitidos) {
      if (datos[campo] !== undefined) {
        if (campo === 'placa') {
          campos.push(`${campo} = ?`);
          valores.push(datos[campo].toUpperCase());
        } else {
          campos.push(`${campo} = ?`);
          valores.push(datos[campo]);
        }
      }
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    const sql = `UPDATE vehiculos SET ${campos.join(', ')} WHERE id = ?`;
    const result = await query(sql, valores);

    return result.affectedRows > 0;
  }

  // Actualizar kilometraje
  static async actualizarKilometraje(id, nuevoKilometraje) {
    const sql = `
      UPDATE vehiculos 
      SET kilometraje_actual = ? 
      WHERE id = ? AND ? > kilometraje_actual
    `;

    const result = await query(sql, [nuevoKilometraje, id, nuevoKilometraje]);
    return result.affectedRows > 0;
  }

  // Eliminar vehículo (soft delete)
  static async eliminar(id) {
    const sql = 'UPDATE vehiculos SET activo = FALSE WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Obtener resumen del vehículo
  static async obtenerResumen(id) {
    const sql = `
      SELECT * FROM vista_resumen_vehiculos WHERE id = ?
    `;

    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Obtener estadísticas de combustible del vehículo
  static async obtenerEstadisticasCombustible(id, fechaInicio = null, fechaFin = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_cargas,
        SUM(litros) as total_litros,
        SUM(costo_total) as total_gastado,
        AVG(rendimiento_calculado) as rendimiento_promedio,
        AVG(precio_litro) as precio_promedio_litro,
        MIN(precio_litro) as precio_minimo,
        MAX(precio_litro) as precio_maximo,
        MAX(fecha_carga) as ultima_carga
      FROM registros_combustible
      WHERE vehiculo_id = ?
    `;
    const params = [id];

    if (fechaInicio) {
      sql += ' AND fecha_carga >= ?';
      params.push(fechaInicio);
    }

    if (fechaFin) {
      sql += ' AND fecha_carga <= ?';
      params.push(fechaFin);
    }

    const results = await query(sql, params);
    return results[0] || null;
  }

  // Obtener historial de mantenimientos
  static async obtenerHistorialMantenimientos(id, limite = 10) {
    const sql = `
      SELECT 
        m.*,
        u.nombre as usuario_nombre
      FROM mantenimientos m
      LEFT JOIN usuarios u ON m.usuario_registro_id = u.id
      WHERE m.vehiculo_id = ?
      ORDER BY m.fecha_mantenimiento DESC
      LIMIT ?
    `;

    return await query(sql, [id, limite]);
  }

  // Verificar si placa existe
  static async placaExiste(placa, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM vehiculos WHERE placa = ?';
    const params = [placa.toUpperCase()];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const results = await query(sql, params);
    return results[0].count > 0;
  }

  // Obtener alertas de mantenimiento
  static async obtenerAlertasMantenimiento() {
    const sql = `
      SELECT 
        v.id,
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
      ORDER BY (v.kilometraje_actual - v.ultimo_cambio_aceite) DESC
    `;

    return await query(sql);
  }
}

module.exports = Vehiculo;
