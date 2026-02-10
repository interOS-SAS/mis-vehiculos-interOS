require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const { testConnection } = require('./config/database');
const { verificarConfiguracion } = require('./services/notificaciones.service');
const Mantenimiento = require('./models/Mantenimiento');
const { enviarNotificacionCambioAceite } = require('./services/notificaciones.service');

const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad con Helmet
app.use(helmet());

// Compresión de respuestas
app.use(compression());

// Logging de requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS
const corsOptions = {
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Demasiadas solicitudes, por favor intenta más tarde'
  }
});
app.use('/api/', limiter);

// ============================================
// RUTAS
// ============================================

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Control de Vehículos INTEROS',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    success: true,
    status: 'ok',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const vehiculosRoutes = require('./routes/vehiculos.routes');
const kilometrajeRoutes = require('./routes/kilometraje.routes');
const combustibleRoutes = require('./routes/combustible.routes');
const mantenimientosRoutes = require('./routes/mantenimientos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/kilometraje', kilometrajeRoutes);
app.use('/api/combustible', combustibleRoutes);
app.use('/api/mantenimientos', mantenimientosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Errores de Multer (subida de archivos)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Error al subir archivo',
      error: err.message
    });
  }

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// TAREAS PROGRAMADAS (CRON)
// ============================================

// Verificar alertas de mantenimiento cada 30 minutos
if (process.env.NOTIFICATIONS_ENABLED === 'true') {
  cron.schedule(process.env.NOTIFICATION_CHECK_INTERVAL || '*/30 * * * *', async () => {
    try {
      console.log('🔍 Verificando alertas de mantenimiento...');
      
      const alertas = await Mantenimiento.verificarAlertas();
      
      if (alertas.length > 0) {
        console.log(`📧 Se encontraron ${alertas.length} alertas de mantenimiento`);
        
        for (const alerta of alertas) {
          const destinatarios = [];
          
          // Agregar conductor si existe
          if (alerta.conductor_email || alerta.conductor_telefono) {
            destinatarios.push({
              email: alerta.conductor_email,
              telefono: alerta.conductor_telefono
            });
          }
          
          // Agregar administradores
          const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').filter(e => e);
          const adminPhones = (process.env.ADMIN_PHONES || '').split(',').filter(p => p);
          
          adminEmails.forEach((email, index) => {
            destinatarios.push({
              email: email.trim(),
              telefono: adminPhones[index]?.trim()
            });
          });
          
          // Enviar notificaciones
          if (destinatarios.length > 0) {
            await enviarNotificacionCambioAceite(alerta, destinatarios, 'ambos');
            console.log(`✅ Notificación enviada para vehículo ${alerta.placa}`);
          }
        }
      } else {
        console.log('✅ No hay alertas pendientes');
      }
    } catch (error) {
      console.error('❌ Error al verificar alertas:', error);
    }
  });

  console.log('⏰ Tarea programada de alertas activada');
}

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
  try {
    // Verificar conexión a base de datos
    console.log('\n🔌 Verificando conexión a base de datos...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Verificar configuración de notificaciones
    if (process.env.NOTIFICATIONS_ENABLED === 'true') {
      console.log('\n📧 Verificando configuración de notificaciones...');
      await verificarConfiguracion();
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 SERVIDOR INICIADO EXITOSAMENTE');
      console.log('='.repeat(60));
      console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
iniciarServidor();

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('\n🔴 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🔴 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

module.exports = app;
