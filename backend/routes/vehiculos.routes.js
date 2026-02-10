const express = require('express');
const router = express.Router();
const Vehiculo = require('../models/Vehiculo');
const { verificarToken, verificarRol } = require('../middleware/auth');
const { subirUnaImagen, subirImagen } = require('../services/cloudinary.service');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const vehiculos = await Vehiculo.obtenerTodos(req.query);
    res.json({ success: true, data: vehiculos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vehiculo = await Vehiculo.obtenerPorId(req.params.id);
    if (!vehiculo) {
      return res.status(404).json({ success: false, message: 'Vehículo no encontrado' });
    }
    res.json({ success: true, data: vehiculo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', verificarRol('admin'), subirUnaImagen('foto_vehiculo'), async (req, res) => {
  try {
    let foto_vehiculo = null;
    if (req.file) {
      const resultado = await subirImagen(req.file.buffer, 'vehiculos');
      foto_vehiculo = resultado.url;
    }
    
    const id = await Vehiculo.crear({ ...req.body, foto_vehiculo });
    const vehiculo = await Vehiculo.obtenerPorId(id);
    res.status(201).json({ success: true, message: 'Vehículo creado', data: vehiculo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', verificarRol('admin'), subirUnaImagen('foto_vehiculo'), async (req, res) => {
  try {
    const datosActualizar = { ...req.body };
    if (req.file) {
      const resultado = await subirImagen(req.file.buffer, 'vehiculos');
      datosActualizar.foto_vehiculo = resultado.url;
    }
    
    await Vehiculo.actualizar(req.params.id, datosActualizar);
    const vehiculo = await Vehiculo.obtenerPorId(req.params.id);
    res.json({ success: true, message: 'Vehículo actualizado', data: vehiculo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', verificarRol('admin'), async (req, res) => {
  try {
    await Vehiculo.eliminar(req.params.id);
    res.json({ success: true, message: 'Vehículo eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
