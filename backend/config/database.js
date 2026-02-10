const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'interos_vehiculos',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '-05:00', // Zona horaria de Colombia
};

// Agregar SSL solo si está habilitado
if (process.env.DB_SSL === 'true') {
  dbConfig.ssl = {
    rejectUnauthorized: true
  };
}

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para verificar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    console.log(`🔌 Host: ${process.env.DB_HOST}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    return false;
  }
};

// Función helper para ejecutar queries con manejo de errores
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error en query:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

// Función helper para transacciones
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Función para obtener una conexión del pool
const getConnection = async () => {
  return await pool.getConnection();
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🔴 Cerrando conexiones de base de datos...');
  await pool.end();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  transaction,
  getConnection,
  testConnection
};
