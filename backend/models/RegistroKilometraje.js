const { query } = require('../config/database');

class RegistroKilometraje {
  // Crear nuevo registro
  static async crear(datos) {
    const {
      vehiculo_id,
      usuario_id,
      kilometraje,
      foto_odometro,
      observaciones,
      ubicacion,
      fecha_registro
    } = datos;

    const sql = `
      INSERT INTO registros_kilometraje (
        vehiculo_id, usuario_id, kilometraje, foto_odometro,
        observaciones, ubicacion, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      vehiculo_id,
      usuario_id,
      kilometraje,
      foto_odometro,
      observaciones || null,
      ubicacion || null,
      fecha_registro || new Date()
    ]);

    return result.insertId;
  }

  // Obtener registros por vehículo
  static async obtenerPorVehiculo(vehiculoId, limite = 50, offset = 0) {
    const sql = `
      SELECT 
        rk.*,
        u.nombre as usuario_nombre,
        v.placa,
        v.marca,
        v.modelo
      FROM registros_kilometraje rk
      JOIN usuarios u ON rk.usuario_id = u.id
      JOIN vehiculos v ON rk.vehiculo_id = v.id
      WHERE rk.vehiculo_id = ?
      ORDER BY rk.fecha_registro DESC
      LIMIT ? OFFSET ?
    `;

    return await query(sql, [vehiculoId, limite, offset]);
  }

  // Obtener todos los registros con filtros
  static async obtenerTodos(filtros = {}) {
    let sql = `
      SELECT 
        rk.*,
        u.nombre as usuario_nombre,
        v.placa,
        v.marca,
        v.modelo
      FROM registros_kilometraje rk
      JOIN usuarios u ON rk.usuario_id = u.id
      JOIN vehiculos v ON rk.vehiculo_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (filtros.vehiculo_id) {
      sql += ' AND rk.vehiculo_id = ?';
      params.push(filtros.vehiculo_id);
    }

    if (filtros.usuario_id) {
      sql += ' AND rk.usuario_id = ?';
      params.push(filtros.usuario_id);
    }

    if (filtros.fecha_desde) {
      sql += ' AND rk.fecha_registro >= ?';
      params.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      sql += ' AND rk.fecha_registro <= ?';
      params.push(filtros.fecha_hasta);
    }

    sql += ' ORDER BY rk.fecha_registro DESC';

    if (filtros.limite) {
      sql += ' LIMIT ?';
      params.push(parseInt(filtros.limite));
    }

    return await query(sql, params);
  }

  // Obtener registro por ID
  static async obtenerPorId(id) {
    const sql = `
      SELECT 
        rk.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        v.placa,
        v.marca,
        v.modelo
      FROM registros_kilometraje rk
      JOIN usuarios u ON rk.usuario_id = u.id
      JOIN vehiculos v ON rk.vehiculo_id = v.id
      WHERE rk.id = ?
    `;

    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Obtener último registro de un vehículo
  static async obtenerUltimoPorVehiculo(vehiculoId) {
    const sql = `
      SELECT 
        rk.*,
        u.nombre as usuario_nombre,
        v.placa
      FROM registros_kilometraje rk
      JOIN usuarios u ON rk.usuario_id = u.id
      JOIN vehiculos v ON rk.vehiculo_id = v.id
      WHERE rk.vehiculo_id = ?
      ORDER BY rk.fecha_registro DESC
      LIMIT 1
    `;

    const results = await query(sql, [vehiculoId]);
    return results[0] || null;
  }

  // Actualizar registro
  static async actualizar(id, datos) {
    const campos = [];
    const valores = [];

    const camposPermitidos = ['kilometraje', 'foto_odometro', 'observaciones', 'ubicacion', 'fecha_registro'];

    for (const campo of camposPermitidos) {
      if (datos[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        valores.push(datos[campo]);
      }
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    const sql = `UPDATE registros_kilometraje SET ${campos.join(', ')} WHERE id = ?`;
    const result = await query(sql, valores);

    return result.affectedRows > 0;
  }

  // Eliminar registro
  static async eliminar(id) {
    const sql = 'DELETE FROM registros_kilometraje WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Obtener registros del día
  static async obtenerRegistrosHoy() {
    const sql = `
      SELECT 
        rk.*,
        u.nombre as usuario_nombre,
        v.placa,
        v.marca,
        v.modelo
      FROM registros_kilometraje rk
      JOIN usuarios u ON rk.usuario_id = u.id
      JOIN vehiculos v ON rk.vehiculo_id = v.id
      WHERE DATE(rk.fecha_registro) = CURDATE()
      ORDER BY rk.fecha_registro DESC
    `;

    return await query(sql);
  }

  // Verificar si ya hay registro hoy para un vehículo
  static async existeRegistroHoy(vehiculoId) {
    const sql = `
      SELECT COUNT(*) as count
      FROM registros_kilometraje
      WHERE vehiculo_id = ? AND DATE(fecha_registro) = CURDATE()
    `;

    const results = await query(sql, [vehiculoId]);
    return results[0].count > 0;
  }

  // Obtener estadísticas de kilometraje
  static async obtenerEstadisticas(vehiculoId, fechaInicio = null, fechaFin = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_registros,
        MAX(kilometraje) as km_maximo,
        MIN(kilometraje) as km_minimo,
        MAX(kilometraje) - MIN(kilometraje) as km_recorridos,
        MIN(fecha_registro) as primer_registro,
        MAX(fecha_registro) as ultimo_registro
      FROM registros_kilometraje
      WHERE vehiculo_id = ?
    `;
    const params = [vehiculoId];

    if (fechaInicio) {
      sql += ' AND fecha_registro >= ?';
      params.push(fechaInicio);
    }

    if (fechaFin) {
      sql += ' AND fecha_registro <= ?';
      params.push(fechaFin);
    }

    const results = await query(sql, params);
    return results[0] || null;
  }
}

module.exports = RegistroKilometraje;
