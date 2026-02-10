const express = require('express');
const router = express.Router();
const RegistroKilometraje = require('../models/RegistroKilometraje');
const { verificarToken } = require('../middleware/auth');
const { subirUnaImagen, subirImagen } = require('../services/cloudinary.service');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const registros = await RegistroKilometraje.obtenerTodos(req.query);
    res.json({ success: true, data: registros });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', subirUnaImagen('foto_odometro'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Foto del odómetro es requerida' });
    }
    
    const resultado = await subirImagen(req.file.buffer, 'kilometraje');
    const id = await RegistroKilometraje.crear({
      ...req.body,
      foto_odometro: resultado.url,
      usuario_id: req.usuario.id
    });
    
    const registro = await RegistroKilometraje.obtenerPorId(id);
    res.status(201).json({ success: true, message: 'Registro creado', data: registro });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
