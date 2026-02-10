const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar multer para almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${allowedTypes.join(', ')}`), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
  },
  fileFilter: fileFilter
});

/**
 * Subir imagen a Cloudinary
 * @param {Buffer} buffer - Buffer del archivo
 * @param {String} folder - Carpeta en Cloudinary
 * @param {String} filename - Nombre del archivo (opcional)
 * @returns {Promise<Object>} - Resultado de Cloudinary
 */
const subirImagen = async (buffer, folder = 'interos-vehiculos', filename = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    };

    if (filename) {
      options.public_id = filename;
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes
        });
      }
    });

    uploadStream.end(buffer);
  });
};

/**
 * Subir múltiples imágenes a Cloudinary
 * @param {Array<Buffer>} buffers - Array de buffers
 * @param {String} folder - Carpeta en Cloudinary
 * @returns {Promise<Array<Object>>} - Array con resultados
 */
const subirMultiplesImagenes = async (buffers, folder = 'interos-vehiculos') => {
  const promises = buffers.map(buffer => subirImagen(buffer, folder));
  return await Promise.all(promises);
};

/**
 * Eliminar imagen de Cloudinary
 * @param {String} publicId - ID público de la imagen
 * @returns {Promise<Object>} - Resultado de la eliminación
 */
const eliminarImagen = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw error;
  }
};

/**
 * Eliminar múltiples imágenes de Cloudinary
 * @param {Array<String>} publicIds - Array de IDs públicos
 * @returns {Promise<Array<Object>>} - Resultados de las eliminaciones
 */
const eliminarMultiplesImagenes = async (publicIds) => {
  const promises = publicIds.map(publicId => eliminarImagen(publicId));
  return await Promise.all(promises);
};

/**
 * Obtener URL de imagen optimizada
 * @param {String} publicId - ID público de la imagen
 * @param {Object} options - Opciones de transformación
 * @returns {String} - URL optimizada
 */
const obtenerUrlOptimizada = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    width: options.width || undefined,
    height: options.height || undefined,
    crop: options.crop || 'limit'
  };

  return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

/**
 * Obtener URL de thumbnail
 * @param {String} publicId - ID público de la imagen
 * @param {Number} size - Tamaño del thumbnail (default: 200)
 * @returns {String} - URL del thumbnail
 */
const obtenerThumbnail = (publicId, size = 200) => {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

// Middleware para subir una sola imagen
const subirUnaImagen = (fieldName) => upload.single(fieldName);

// Middleware para subir múltiples imágenes
const subirVariasImagenes = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);

// Middleware para subir múltiples campos de imágenes
const subirCamposMultiples = (fields) => upload.fields(fields);

module.exports = {
  cloudinary,
  subirImagen,
  subirMultiplesImagenes,
  eliminarImagen,
  eliminarMultiplesImagenes,
  obtenerUrlOptimizada,
  obtenerThumbnail,
  subirUnaImagen,
  subirVariasImagenes,
  subirCamposMultiples
};
