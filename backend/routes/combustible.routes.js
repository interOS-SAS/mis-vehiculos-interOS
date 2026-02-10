const express = require('express');
const router = express.Router();
const RegistroCombustible = require('../models/RegistroCombustible');
const { verificarToken } = require('../middleware/auth');
const { subirUnaImagen, subirImagen } = require('../services/cloudinary.service');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const registros = await RegistroCombustible.obtenerTodos(req.query);
    res.json({ success: true, data: registros });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', subirUnaImagen('foto_factura'), async (req, res) => {
  try {
    let foto_factura = null;
    if (req.file) {
      const resultado = await subirImagen(req.file.buffer, 'combustible');
      foto_factura = resultado.url;
    }
    
    const id = await RegistroCombustible.crear({
      ...req.body,
      foto_factura,
      usuario_id: req.usuario.id
    });
    
    await RegistroCombustible.calcularRendimiento(req.body.vehiculo_id);
    const registro = await RegistroCombustible.obtenerPorId(id);
    res.status(201).json({ success: true, message: 'Registro creado', data: registro });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
