const express = require('express');
const router = express.Router();
const Mantenimiento = require('../models/Mantenimiento');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const mantenimientos = await Mantenimiento.obtenerTodos(req.query);
    res.json({ success: true, data: mantenimientos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/proximos', async (req, res) => {
  try {
    const proximos = await Mantenimiento.obtenerProximos(20);
    res.json({ success: true, data: proximos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = await Mantenimiento.crear({
      ...req.body,
      usuario_registro_id: req.usuario.id
    });
    const mantenimiento = await Mantenimiento.obtenerPorId(id);
    res.status(201).json({ success: true, message: 'Mantenimiento registrado', data: mantenimiento });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
