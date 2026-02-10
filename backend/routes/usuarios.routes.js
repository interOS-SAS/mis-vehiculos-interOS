const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const { verificarToken, verificarRol } = require('../middleware/auth');

router.use(verificarToken);
router.use(verificarRol('admin'));

router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerTodos(req.query);
    res.json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
