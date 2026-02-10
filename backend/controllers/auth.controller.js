const Usuario = require('../models/Usuario');
const { generarToken, generarRefreshToken, verificarRefreshToken } = require('../middleware/auth');

/**
 * Login de usuario
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son requeridos'
      });
    }

    // Buscar usuario
    const usuario = await Usuario.obtenerPorEmail(email);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const passwordValido = await Usuario.verificarPassword(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar tokens
    const token = generarToken(usuario);
    const refreshToken = generarRefreshToken(usuario);

    // Remover password del objeto usuario
    delete usuario.password;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario,
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
 * Registro de nuevo usuario
 */
const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol, telefono } = req.body;

    // Validar datos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y password son requeridos'
      });
    }

    // Verificar si el email ya existe
    const emailExiste = await Usuario.emailExiste(email);

    if (emailExiste) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Solo admin puede crear otros admins
    if (rol === 'admin' && req.usuario?.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para crear administradores'
      });
    }

    // Crear usuario
    const usuarioId = await Usuario.crear({
      nombre,
      email,
      password,
      rol: rol || 'conductor',
      telefono
    });

    // Obtener usuario creado
    const usuario = await Usuario.obtenerPorId(usuarioId);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

/**
 * Refrescar token
 */
const refrescarToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Verificar refresh token
    const decoded = verificarRefreshToken(refreshToken);

    // Obtener usuario
    const usuario = await Usuario.obtenerPorId(decoded.id);

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido'
      });
    }

    // Generar nuevo token
    const nuevoToken = generarToken(usuario);

    res.json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: {
        token: nuevoToken
      }
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token inválido o expirado'
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.obtenerPorId(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

/**
 * Actualizar perfil del usuario autenticado
 */
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, telefono, password } = req.body;
    const datosActualizar = {};

    if (nombre) datosActualizar.nombre = nombre;
    if (telefono !== undefined) datosActualizar.telefono = telefono;
    if (password) datosActualizar.password = password;

    const actualizado = await Usuario.actualizar(req.usuario.id, datosActualizar);

    if (!actualizado) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el perfil'
      });
    }

    const usuario = await Usuario.obtenerPorId(req.usuario.id);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
};

/**
 * Cambiar password
 */
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;

    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({
        success: false,
        message: 'Password actual y nuevo son requeridos'
      });
    }

    // Obtener usuario con password
    const usuario = await Usuario.obtenerPorEmail(req.usuario.email);

    // Verificar password actual
    const passwordValido = await Usuario.verificarPassword(passwordActual, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Password actual incorrecto'
      });
    }

    // Actualizar password
    await Usuario.actualizar(req.usuario.id, { password: passwordNuevo });

    res.json({
      success: true,
      message: 'Password cambiado exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar password:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar password',
      error: error.message
    });
  }
};

module.exports = {
  login,
  registrar,
  refrescarToken,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword
};
