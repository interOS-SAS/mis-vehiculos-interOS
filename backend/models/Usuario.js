const { query, transaction } = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
  // Crear nuevo usuario
  static async crear(datos) {
    const { nombre, email, password, rol, telefono } = datos;
    
    // Hash del password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO usuarios (nombre, email, password, rol, telefono)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [nombre, email, passwordHash, rol || 'conductor', telefono]);
    return result.insertId;
  }

  // Obtener todos los usuarios
  static async obtenerTodos(filtros = {}) {
    let sql = `
      SELECT id, nombre, email, rol, telefono, activo, created_at, updated_at
      FROM usuarios
      WHERE 1=1
    `;
    const params = [];

    if (filtros.rol) {
      sql += ' AND rol = ?';
      params.push(filtros.rol);
    }

    if (filtros.activo !== undefined) {
      sql += ' AND activo = ?';
      params.push(filtros.activo);
    }

    sql += ' ORDER BY nombre ASC';

    return await query(sql, params);
  }

  // Obtener usuario por ID
  static async obtenerPorId(id) {
    const sql = `
      SELECT id, nombre, email, rol, telefono, activo, created_at, updated_at
      FROM usuarios
      WHERE id = ?
    `;
    
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  // Obtener usuario por email (para login)
  static async obtenerPorEmail(email) {
    const sql = `
      SELECT id, nombre, email, password, rol, telefono, activo
      FROM usuarios
      WHERE email = ? AND activo = TRUE
    `;
    
    const results = await query(sql, [email]);
    return results[0] || null;
  }

  // Actualizar usuario
  static async actualizar(id, datos) {
    const campos = [];
    const valores = [];

    if (datos.nombre) {
      campos.push('nombre = ?');
      valores.push(datos.nombre);
    }
    if (datos.email) {
      campos.push('email = ?');
      valores.push(datos.email);
    }
    if (datos.password) {
      const passwordHash = await bcrypt.hash(datos.password, 10);
      campos.push('password = ?');
      valores.push(passwordHash);
    }
    if (datos.rol) {
      campos.push('rol = ?');
      valores.push(datos.rol);
    }
    if (datos.telefono !== undefined) {
      campos.push('telefono = ?');
      valores.push(datos.telefono);
    }
    if (datos.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(datos.activo);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
    const result = await query(sql, valores);
    
    return result.affectedRows > 0;
  }

  // Eliminar usuario (soft delete)
  static async eliminar(id) {
    const sql = 'UPDATE usuarios SET activo = FALSE WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // Verificar password
  static async verificarPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
  }

  // Obtener conductores disponibles
  static async obtenerConductores() {
    const sql = `
      SELECT id, nombre, email, telefono
      FROM usuarios
      WHERE rol = 'conductor' AND activo = TRUE
      ORDER BY nombre ASC
    `;
    
    return await query(sql);
  }

  // Verificar si email existe
  static async emailExiste(email, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM usuarios WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const results = await query(sql, params);
    return results[0].count > 0;
  }
}

module.exports = Usuario;
