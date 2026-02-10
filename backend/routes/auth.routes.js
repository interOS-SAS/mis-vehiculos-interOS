const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/refresh', authController.refrescarToken);
router.post('/registrar', verificarToken, authController.registrar);
router.get('/perfil', verificarToken, authController.obtenerPerfil);
router.put('/perfil', verificarToken, authController.actualizarPerfil);
router.put('/cambiar-password', verificarToken, authController.cambiarPassword);

module.exports = router;
