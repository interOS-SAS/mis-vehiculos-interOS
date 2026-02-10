# 🚗 Sistema de Control de Vehículos INTEROS

Sistema completo y profesional para el control de flota de vehículos con registro de kilometraje, combustible, mantenimientos y notificaciones automáticas.

## 📋 Características

### ✅ Funcionalidades Principales

- **Control de Kilometraje**: Registro diario con foto obligatoria del odómetro
- **Gestión de Combustible**: Control de cargas, costos y cálculo automático de rendimiento
- **Mantenimientos**: Alertas automáticas de cambios de aceite y servicios
- **Notificaciones**: Envío automático por Email y WhatsApp
- **Dashboard**: Panel completo con estadísticas y gráficas en tiempo real
- **Reportes**: Exportación de datos y análisis detallados
- **Multi-usuario**: Roles de Admin, Conductor y Mecánico
- **Almacenamiento en la nube**: Fotos en Cloudinary, datos en MySQL

### 🛠️ Tecnologías Utilizadas

**Backend:**
- Node.js + Express
- MySQL 8.0+
- JWT para autenticación
- Cloudinary para almacenamiento de imágenes
- Nodemailer para emails
- Twilio para WhatsApp
- Node-cron para tareas programadas

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Recharts para gráficas
- Axios para HTTP
- React Router para navegación

## 🚀 Instalación

### Requisitos Previos

- Node.js 18+ 
- MySQL 8.0+
- Cuenta de Cloudinary (gratuita)
- Cuenta de Gmail para envío de emails
- Cuenta de Twilio para WhatsApp (opcional)

### 1. Clonar/Descargar el Proyecto

```bash
# Si tienes el código en un repositorio
git clone <tu-repositorio>
cd vehicle-control

# O simplemente extrae los archivos descargados
```

### 2. Configurar Base de Datos MySQL

#### Opción A: MySQL Local

```bash
# Iniciar MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE interos_vehiculos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Importar esquema
mysql -u root -p interos_vehiculos < database/schema.sql
```

#### Opción B: PlanetScale (Recomendado - Gratuito)

1. Crear cuenta en https://planetscale.com
2. Crear nueva base de datos
3. Obtener credenciales de conexión
4. Importar schema desde su dashboard

#### Opción C: Railway (También Gratuito)

1. Crear cuenta en https://railway.app
2. Crear servicio MySQL
3. Obtener credenciales
4. Conectar y ejecutar schema.sql

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales
nano .env  # o usar tu editor favorito
```

#### Configuración del archivo `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=interos_vehiculos
DB_PORT=3306

# JWT
JWT_SECRET=cambiar_por_algo_muy_seguro_y_largo
JWT_EXPIRES_IN=7d

# Cloudinary (Crear cuenta en cloudinary.com)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=notificaciones@interos.com.co
EMAIL_PASSWORD=tu_app_password_de_gmail

# Twilio para WhatsApp (opcional)
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Notificaciones
NOTIFICATIONS_ENABLED=true
ADMIN_EMAILS=admin@interos.com.co,oscar@interos.com.co
ADMIN_PHONES=+573001234567

# Frontend
FRONTEND_URL=http://localhost:5173
```

#### Configurar Gmail para envío de emails:

1. Ir a tu cuenta de Google
2. Habilitar verificación en 2 pasos
3. Ir a: https://myaccount.google.com/apppasswords
4. Crear contraseña de aplicación
5. Usar esa contraseña en `EMAIL_PASSWORD`

#### Configurar Cloudinary:

1. Crear cuenta gratuita en https://cloudinary.com
2. Ir al Dashboard
3. Copiar: Cloud Name, API Key, API Secret
4. Pegar en el archivo .env

### 4. Iniciar Backend

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

El servidor estará corriendo en: http://localhost:5000

### 5. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env
nano .env
```

#### Configuración del frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Iniciar Frontend

```bash
# Modo desarrollo
npm run dev

# Construir para producción
npm run build
```

El frontend estará en: http://localhost:5173

## 👤 Usuarios por Defecto

Al importar el schema.sql se crea un usuario administrador:

```
Email: admin@interos.com.co
Password: Admin123!
```

**⚠️ IMPORTANTE**: Cambia este password inmediatamente después del primer login.

## 📱 Uso del Sistema

### Para Conductores:

1. Login con credenciales
2. Registrar kilometraje diario con foto del odómetro
3. Registrar cargas de combustible con factura
4. Ver historial de su vehículo

### Para Administradores:

1. Gestionar vehículos y usuarios
2. Ver dashboard completo de toda la flota
3. Programar mantenimientos
4. Recibir alertas automáticas
5. Generar reportes

## 🔔 Sistema de Notificaciones

### Alertas Automáticas:

- **Cambio de Aceite**: Se envía cuando faltan 500 km para el cambio
- **Mantenimientos Programados**: 7 días antes de la fecha
- **Documentos por Vencer**: SOAT, Tecnicomecanica, etc.

### Configuración de Notificaciones:

Las notificaciones se revisan cada 30 minutos automáticamente.

Editar en `server.js` el cron:
```javascript
cron.schedule('*/30 * * * *', async () => {
  // Lógica de alertas
});
```

## 📊 Estructura de la Base de Datos

- **usuarios**: Conductores, mecánicos, administradores
- **vehiculos**: Información de cada vehículo
- **registros_kilometraje**: Kilometraje diario con fotos
- **registros_combustible**: Cargas de combustible y rendimiento
- **mantenimientos**: Historial de mantenimientos
- **notificaciones**: Log de notificaciones enviadas
- **documentos_vehiculo**: SOAT, tecnicomecanica, etc.

## 🔒 Seguridad

- Autenticación con JWT
- Passwords hasheados con bcrypt
- Rate limiting en API
- Validación de datos en todas las rutas
- CORS configurado
- Helmet para headers de seguridad

## 📦 Despliegue en Producción

### Backend

Recomendaciones:
- **Railway**: https://railway.app (Fácil y gratuito)
- **Render**: https://render.com (También gratuito)
- **AWS EC2** o **DigitalOcean** para mayor control

### Frontend

Recomendaciones:
- **Vercel**: https://vercel.com (Gratis, ideal para React)
- **Netlify**: https://netlify.com (También gratis)
- **Cloudflare Pages**: https://pages.cloudflare.com

### Base de Datos

- **PlanetScale**: MySQL serverless (Recomendado)
- **Railway**: MySQL en contenedor
- **AWS RDS**: Para producción empresarial

## 🐛 Solución de Problemas

### Error al conectar a MySQL:

```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Verificar credenciales en .env
# Verificar que la base de datos exista
```

### Error con Cloudinary:

```bash
# Verificar credenciales en .env
# Verificar que la cuenta esté activa
# Revisar cuota de almacenamiento
```

### Notificaciones no se envían:

```bash
# Verificar configuración de Gmail
# Verificar que NOTIFICATIONS_ENABLED=true
# Revisar logs del servidor
```

## 📞 Soporte

Para soporte o preguntas:
- Email: admin@interos.com.co
- Revisar logs en `backend/logs/`
- Verificar health endpoint: http://localhost:5000/health

## 📄 Licencia

Uso exclusivo para INTEROS - INTERNET SERVICE SAS

## 🔄 Actualizaciones

### Versión 1.0.0 (Febrero 2026)
- ✅ Sistema completo operativo
- ✅ 5 vehículos configurados
- ✅ Notificaciones Email y WhatsApp
- ✅ Dashboard con estadísticas
- ✅ Almacenamiento en la nube

---

## 📝 Próximos Pasos Después de la Instalación

1. ✅ Cambiar password del administrador
2. ✅ Registrar los 5 vehículos
3. ✅ Crear usuarios para cada conductor
4. ✅ Configurar kilometraje inicial de cada vehículo
5. ✅ Probar notificaciones de prueba
6. ✅ Capacitar a los conductores
7. ✅ Establecer rutina diaria de registro

---

**Desarrollado para INTEROS por Claude - Anthropic**
**Febrero 2026**
