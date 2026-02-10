const express = require('express');
const router = express.Router();
const Vehiculo = require('../models/Vehiculo');
const RegistroCombustible = require('../models/RegistroCombustible');
const Mantenimiento = require('../models/Mantenimiento');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/resumen', async (req, res) => {
  try {
    const vehiculos = await Vehiculo.obtenerTodos({ activo: true });
    const alertas = await Mantenimiento.verificarAlertas();
    const proximos = await Mantenimiento.obtenerProximos(5);
    
    res.json({
      success: true,
      data: {
        total_vehiculos: vehiculos.length,
        alertas_pendientes: alertas.length,
        proximos_mantenimientos: proximos.length,
        vehiculos,
        alertas,
        proximos
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
