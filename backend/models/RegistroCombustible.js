const { query } = require('../config/database');

class RegistroCombustible {
  // Crear nuevo registro de combustible
  static async crear(datos) {
    const {
      vehiculo_id,
      usuario_id,
      kilometraje_carga,
      litros,
      costo_total,
      precio_litro,
      tipo_combustible,
      estacion,
      tanque_lleno,
      foto_factura,
      observaciones,
      fecha_carga
    } = datos;

    const sql = `
      INSERT INTO registros_combustible (
        vehiculo_id, usuario_id, kilometraje_carga, litros,
        costo_total, precio_litro, tipo_combustible, estacion,
        tanque_lleno, foto_factura, observaciones, fecha_carga
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      vehiculo_id,
      usuario_id,
      kilometraje_carga,
      litros,
      costo_total,
      precio_litro,
      tipo_combustible || 'gasolina_corriente',
      estacion || null,
      tanque_lleno || false,
      foto_factura || null,
      observaciones || null,
      fecha_carga || new Date()
    ]);

    return result.insertId;
  }

  // Obtener registros por vehículo
  static async obtenerPorVehiculo(vehiculoId, limite = 50, offset = 0) {
    const sql = `
      SELECT 
        rc.*,
        u.nombre as usuario_nombre,
        v.placa,
        v.marca,
        v.modelo
      FROM registros_combustible rc
      JOIN usuarios u ON rc.usuario_id = u.id
      JOIN vehiculos v ON rc.vehiculo_id = v.id
      WHERE rc.vehiculo_id = ?
      ORDER BY rc.fecha_carga DESC
      LIMIT ? OFFSET ?
    `;

    return await query(sql, [vehiculoId, limite, offset]);
  }

  // Obtener todos los registros con filtros
  static async obtenerTodos(filtros = {}) {
    let sql = `
      SELECT 
        rc.*,
        u.nombre as usuario_nombre,
        v.placa,
        v.marca,
        v.modelo
      FROM registros_combustible rc
      JOIN usuarios u ON rc.usuario_id = u.id
      JOIN vehiculos v ON rc.vehiculo_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (filtros.vehiculo_id) {
      sql += ' AND rc.vehiculo_id = ?';
      params.push(filtros.vehiculo_id);
    }

    if (filtros.usuario_id) {
      sql += ' AND rc.usuario_id = ?';
      params.push(filtros.usuario_id);
    }

    if (filtros.fecha_desde) {
      sql += ' AND rc.fecha_carga >= ?';
      params.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      sql += ' AND rc.fecha_carga <= ?';
      params.push(filtros.fecha_hasta);
    }

    if (filtros.tipo_combustible) {
      sql += ' AND rc.tipo_combustible = ?';
      params.push(filtros.tipo_combustible);
    }

    sql += ' ORDER BY rc.fecha_carga DESC';

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
        rc.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        v.placa,
        v.marca,
        v.modelo
      FROM registros_combustible rc
      JOIN usuarios u ON rc.usuario_id = u.id
      JOIN vehiculos v ON rc.vehiculo_id = v.id
      WHERE rc.id = ?
    `;

    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Obtener último registro de combustible de un vehículo
  static async obtenerUltimoPorVehiculo(vehiculoId) {
    const sql = `
      SELECT 
        rc.*,
        u.nombre as usuario_nombre
      FROM registros_combustible rc
      JOIN usuarios u ON rc.usuario_id = u.id
      WHERE rc.vehiculo_id = ?
      ORDER BY rc.fecha_carga DESC
      LIMIT 1
    `;

    const results = await query(sql, [vehiculoId]);
    return results[0] || null;
  }

  // Calcular rendimiento de combustible
  static async calcularRendimiento(vehiculoId) {
    // Obtener las dos últimas cargas
    const sql = `
      SELECT kilometraje_carga, litros
      FROM registros_combustible
      WHERE vehiculo_id = ?
      ORDER BY fecha_carga DESC
      LIMIT 2
    `;

    const registros = await query(sql, [vehiculoId]);

    if (registros.length < 2) {
      return null; // No hay suficientes datos
    }

    const [ultima, penultima] = registros;
    const kmRecorridos = ultima.kilometraje_carga - penultima.kilometraje_carga;
    const rendimiento = kmRecorridos / ultima.litros;

    // Actualizar el rendimiento en el último registro
    await query(
      'UPDATE registros_combustible SET rendimiento_calculado = ? WHERE vehiculo_id = ? ORDER BY fecha_carga DESC LIMIT 1',
      [rendimiento, vehiculoId]
    );

    return rendimiento;
  }

  // Actualizar registro
  static async actualizar(id, datos) {
    const campos = [];
    const valores = [];

    const camposPermitidos = [
      'kilometraje_carga', 'litros', 'costo_total', 'precio_litro',
      'tipo_combustible', 'estacion', 'tanque_lleno', 'foto_factura',
      'observaciones', 'fecha_carga'
    ];

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

    const sql = `UPDATE registros_combustible SET ${campos.join(', ')} WHERE id = ?`;
    const result = await query(sql, valores);

    return result.affectedRows > 0;
  }

  // Eliminar registro
  static async eliminar(id) {
    const sql = 'DELETE FROM registros_combustible WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Obtener estadísticas de combustible
  static async obtenerEstadisticas(vehiculoId, fechaInicio = null, fechaFin = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_cargas,
        SUM(litros) as total_litros,
        SUM(costo_total) as total_gastado,
        AVG(rendimiento_calculado) as rendimiento_promedio,
        AVG(precio_litro) as precio_promedio,
        MIN(precio_litro) as precio_minimo,
        MAX(precio_litro) as precio_maximo,
        MAX(fecha_carga) as ultima_carga,
        MIN(fecha_carga) as primera_carga
      FROM registros_combustible
      WHERE vehiculo_id = ?
    `;
    const params = [vehiculoId];

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

  // Obtener gasto mensual
  static async obtenerGastoMensual(vehiculoId, mes, anio) {
    const sql = `
      SELECT 
        SUM(costo_total) as gasto_total,
        SUM(litros) as litros_total,
        COUNT(*) as numero_cargas,
        AVG(precio_litro) as precio_promedio
      FROM registros_combustible
      WHERE vehiculo_id = ?
        AND MONTH(fecha_carga) = ?
        AND YEAR(fecha_carga) = ?
    `;

    const results = await query(sql, [vehiculoId, mes, anio]);
    return results[0] || null;
  }

  // Obtener historial de precios
  static async obtenerHistorialPrecios(vehiculoId, limite = 20) {
    const sql = `
      SELECT 
        DATE(fecha_carga) as fecha,
        AVG(precio_litro) as precio_promedio,
        MIN(precio_litro) as precio_minimo,
        MAX(precio_litro) as precio_maximo,
        tipo_combustible
      FROM registros_combustible
      WHERE vehiculo_id = ?
      GROUP BY DATE(fecha_carga), tipo_combustible
      ORDER BY fecha_carga DESC
      LIMIT ?
    `;

    return await query(sql, [vehiculoId, limite]);
  }

  // Obtener rendimiento por período
  static async obtenerRendimientoPorPeriodo(vehiculoId, fechaInicio, fechaFin) {
    const sql = `
      SELECT 
        DATE(fecha_carga) as fecha,
        AVG(rendimiento_calculado) as rendimiento_promedio,
        COUNT(*) as cargas
      FROM registros_combustible
      WHERE vehiculo_id = ?
        AND fecha_carga >= ?
        AND fecha_carga <= ?
        AND rendimiento_calculado IS NOT NULL
      GROUP BY DATE(fecha_carga)
      ORDER BY fecha_carga ASC
    `;

    return await query(sql, [vehiculoId, fechaInicio, fechaFin]);
  }

  // Comparar gastos entre vehículos
  static async compararGastosVehiculos(fechaInicio, fechaFin) {
    const sql = `
      SELECT 
        v.id,
        v.placa,
        v.marca,
        v.modelo,
        COUNT(rc.id) as total_cargas,
        SUM(rc.litros) as total_litros,
        SUM(rc.costo_total) as total_gastado,
        AVG(rc.rendimiento_calculado) as rendimiento_promedio
      FROM vehiculos v
      LEFT JOIN registros_combustible rc ON v.id = rc.vehiculo_id
        AND rc.fecha_carga >= ?
        AND rc.fecha_carga <= ?
      WHERE v.activo = TRUE
      GROUP BY v.id, v.placa, v.marca, v.modelo
      ORDER BY total_gastado DESC
    `;

    return await query(sql, [fechaInicio, fechaFin]);
  }
}

module.exports = RegistroCombustible;
