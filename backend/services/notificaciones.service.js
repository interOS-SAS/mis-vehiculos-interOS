const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Configurar Nodemailer para emails
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Configurar Twilio para WhatsApp
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Enviar email
 * @param {Object} opciones - Opciones del email
 * @returns {Promise<Object>} - Resultado del envío
 */
const enviarEmail = async (opciones) => {
  const { destinatario, asunto, contenidoHtml, contenidoTexto } = opciones;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'INTEROS Control de Vehículos <notificaciones@interos.com.co>',
      to: destinatario,
      subject: asunto,
      text: contenidoTexto || '',
      html: contenidoHtml || contenidoTexto
    });

    console.log('✅ Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Enviar WhatsApp
 * @param {Object} opciones - Opciones del mensaje
 * @returns {Promise<Object>} - Resultado del envío
 */
const enviarWhatsApp = async (opciones) => {
  const { destinatario, mensaje } = opciones;

  if (!twilioClient) {
    console.error('❌ Twilio no está configurado');
    return { success: false, error: 'Twilio no configurado' };
  }

  try {
    // Formatear número (debe incluir código de país)
    const numeroFormateado = destinatario.startsWith('+') ? destinatario : `+57${destinatario}`;

    const message = await twilioClient.messages.create({
      body: mensaje,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${numeroFormateado}`
    });

    console.log('✅ WhatsApp enviado:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generar HTML para email de alerta de cambio de aceite
 */
const generarHtmlCambioAceite = (datos) => {
  const { vehiculo, kmActual, kmUltimoCambio, kmParaCambio, estado } = datos;
  
  const colorEstado = estado === 'URGENTE' ? '#dc2626' : estado === 'PROXIMO' ? '#ea580c' : '#16a34a';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .alert-box { background: white; border-left: 4px solid ${colorEstado}; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .vehicle-info { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { font-weight: bold; color: #6b7280; }
    .info-value { color: #111827; }
    .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; color: white; background: ${colorEstado}; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 INTEROS - Control de Vehículos</h1>
      <p>Notificación de Mantenimiento</p>
    </div>
    <div class="content">
      <div class="alert-box">
        <h2 style="margin-top: 0; color: ${colorEstado};">⚠️ Alerta de Cambio de Aceite</h2>
        <p>El vehículo <strong>${vehiculo}</strong> requiere atención:</p>
        <p style="text-align: center; margin: 20px 0;">
          <span class="status-badge">${estado}</span>
        </p>
      </div>
      
      <div class="vehicle-info">
        <h3>Información del Vehículo</h3>
        <div class="info-row">
          <span class="info-label">Vehículo:</span>
          <span class="info-value">${vehiculo}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Kilometraje Actual:</span>
          <span class="info-value">${kmActual.toLocaleString()} km</span>
        </div>
        <div class="info-row">
          <span class="info-label">Último Cambio:</span>
          <span class="info-value">${kmUltimoCambio.toLocaleString()} km</span>
        </div>
        <div class="info-row">
          <span class="info-label">Km recorridos:</span>
          <span class="info-value">${(kmActual - kmUltimoCambio).toLocaleString()} km</span>
        </div>
        <div class="info-row">
          <span class="info-label">Próximo cambio en:</span>
          <span class="info-value">${kmParaCambio} km</span>
        </div>
      </div>
      
      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Ver en el Sistema</a>
      </p>
      
      <p><strong>Recomendación:</strong> ${estado === 'URGENTE' ? 'Realizar el cambio de aceite lo antes posible.' : 'Programar el cambio de aceite próximamente.'}</p>
    </div>
    <div class="footer">
      <p>Este es un mensaje automático del Sistema de Control de Vehículos INTEROS</p>
      <p>© ${new Date().getFullYear()} INTEROS - INTERNET SERVICE SAS</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generar mensaje de WhatsApp para cambio de aceite
 */
const generarMensajeWhatsAppCambioAceite = (datos) => {
  const { vehiculo, kmActual, kmUltimoCambio, kmParaCambio, estado } = datos;
  
  const emoji = estado === 'URGENTE' ? '🚨' : '⚠️';
  
  return `
${emoji} *INTEROS - Alerta de Mantenimiento*

*Vehículo:* ${vehiculo}
*Estado:* ${estado}

*Kilometraje actual:* ${kmActual.toLocaleString()} km
*Último cambio:* ${kmUltimoCambio.toLocaleString()} km
*Km recorridos:* ${(kmActual - kmUltimoCambio).toLocaleString()} km
*Próximo cambio en:* ${kmParaCambio} km

${estado === 'URGENTE' ? '⚠️ *ACCIÓN REQUERIDA:* Realizar cambio de aceite lo antes posible' : '📋 Programar cambio de aceite próximamente'}

_Mensaje automático del Sistema de Control de Vehículos_
  `.trim();
};

/**
 * Enviar notificación de cambio de aceite
 */
const enviarNotificacionCambioAceite = async (vehiculo, destinatarios, metodo = 'ambos') => {
  const datos = {
    vehiculo: `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`,
    kmActual: vehiculo.kilometraje_actual,
    kmUltimoCambio: vehiculo.ultimo_cambio_aceite,
    kmParaCambio: vehiculo.km_cambio_aceite - (vehiculo.kilometraje_actual - vehiculo.ultimo_cambio_aceite),
    estado: vehiculo.estado_aceite || (
      (vehiculo.kilometraje_actual - vehiculo.ultimo_cambio_aceite) >= vehiculo.km_cambio_aceite ? 'URGENTE' :
      (vehiculo.kilometraje_actual - vehiculo.ultimo_cambio_aceite) >= (vehiculo.km_cambio_aceite * 0.9) ? 'PROXIMO' : 'OK'
    )
  };

  const resultados = {
    email: [],
    whatsapp: []
  };

  // Enviar emails
  if (metodo === 'email' || metodo === 'ambos') {
    for (const destinatario of destinatarios) {
      if (destinatario.email) {
        const resultado = await enviarEmail({
          destinatario: destinatario.email,
          asunto: `⚠️ Alerta de Cambio de Aceite - ${vehiculo.placa}`,
          contenidoHtml: generarHtmlCambioAceite(datos)
        });
        resultados.email.push({ destinatario: destinatario.email, ...resultado });
      }
    }
  }

  // Enviar WhatsApp
  if ((metodo === 'whatsapp' || metodo === 'ambos') && twilioClient) {
    for (const destinatario of destinatarios) {
      if (destinatario.telefono) {
        const resultado = await enviarWhatsApp({
          destinatario: destinatario.telefono,
          mensaje: generarMensajeWhatsAppCambioAceite(datos)
        });
        resultados.whatsapp.push({ destinatario: destinatario.telefono, ...resultado });
      }
    }
  }

  return resultados;
};

/**
 * Verificar configuración de notificaciones
 */
const verificarConfiguracion = async () => {
  const config = {
    email: false,
    whatsapp: false
  };

  // Verificar email
  try {
    await transporter.verify();
    config.email = true;
    console.log('✅ Configuración de email verificada');
  } catch (error) {
    console.error('❌ Error en configuración de email:', error.message);
  }

  // Verificar WhatsApp/Twilio
  if (twilioClient) {
    config.whatsapp = true;
    console.log('✅ Configuración de WhatsApp verificada');
  } else {
    console.error('❌ Twilio/WhatsApp no configurado');
  }

  return config;
};

module.exports = {
  enviarEmail,
  enviarWhatsApp,
  enviarNotificacionCambioAceite,
  generarHtmlCambioAceite,
  generarMensajeWhatsAppCambioAceite,
  verificarConfiguracion
};
