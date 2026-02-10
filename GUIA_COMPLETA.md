# 📚 GUÍA COMPLETA - Sistema de Control de Vehículos INTEROS

## 🎯 Resumen Ejecutivo

Sistema 100% funcional para control de flota de 5 vehículos con:
- ✅ Registro diario de kilometraje con fotos
- ✅ Control de combustible y rendimiento
- ✅ Alertas automáticas de mantenimiento
- ✅ Notificaciones por Email y WhatsApp
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Almacenamiento en la nube (MySQL + Cloudinary)

---

## 🚀 INSTALACIÓN RÁPIDA (10 minutos)

### Opción A: Script Automático

```bash
chmod +x install.sh
./install.sh
```

### Opción B: Manual

Ver `INSTALACION_RAPIDA.md`

---

## 📁 ESTRUCTURA DEL PROYECTO

```
vehicle-control/
├── database/
│   └── schema.sql              # Base de datos completa
├── backend/
│   ├── config/
│   │   └── database.js         # Conexión MySQL
│   ├── models/                 # Modelos de datos
│   ├── controllers/            # Lógica de negocio
│   ├── routes/                 # Rutas API
│   ├── services/
│   │   ├── cloudinary.service.js
│   │   └── notificaciones.service.js
│   ├── middleware/
│   │   └── auth.js            # JWT
│   ├── server.js              # Servidor principal
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/            # Páginas principales
│   │   ├── services/         # API calls
│   │   ├── contexts/         # Context API
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── README.md
├── INSTALACION_RAPIDA.md
├── GUIA_COMPLETA.md
└── install.sh
```

---

## ⚙️ CONFIGURACIÓN DETALLADA

### 1. Base de Datos MySQL

#### Opción 1: Local

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE interos_vehiculos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

# Importar schema
mysql -u root -p interos_vehiculos < database/schema.sql
```

#### Opción 2: PlanetScale (Gratuito - Recomendado)

1. Ir a https://planetscale.com
2. Crear cuenta
3. New Database → "interos-vehiculos"
4. Get connection string
5. Copiar credenciales a `.env`:

```env
DB_HOST=aws.connect.psdb.cloud
DB_USER=xxxxxxxx
DB_PASSWORD=pscale_pw_xxxxxxxx
DB_NAME=interos-vehiculos
DB_SSL=true
```

6. Desde dashboard de PlanetScale:
   - Console → Copiar contenido de `database/schema.sql`
   - Pegar y ejecutar

### 2. Cloudinary (Almacenamiento de Fotos)

1. Crear cuenta gratuita: https://cloudinary.com/users/register_free
2. Ir al Dashboard
3. Copiar credenciales:

```env
CLOUDINARY_CLOUD_NAME=dxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

**Plan gratuito incluye:**
- 25 GB de almacenamiento
- 25 GB de ancho de banda/mes
- Más que suficiente para 5 vehículos

### 3. Email (Gmail)

#### Configurar Gmail App Password:

1. Ir a cuenta de Google
2. Seguridad → Verificación en 2 pasos (activar)
3. Seguridad → Contraseñas de aplicación
4. Seleccionar "Correo" y "Otro dispositivo"
5. Copiar la contraseña generada (16 caracteres)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=notificaciones@interos.com.co
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=INTEROS Control <notificaciones@interos.com.co>
```

### 4. WhatsApp (Opcional - Twilio)

1. Crear cuenta: https://www.twilio.com/try-twilio
2. Get a Trial Number
3. Configurar WhatsApp Sandbox:
   - Messaging → Try it out → Send a WhatsApp message
   - Enviar mensaje al número que te indican

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Nota:** En modo trial, solo puedes enviar a números verificados.

---

## 🔧 CONFIGURACIÓN DE BACKEND

### Archivo `.env` Completo

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=interos_vehiculos
DB_PORT=3306
DB_SSL=false
DB_CONNECTION_LIMIT=10

# JWT
JWT_SECRET=INTEROS_SUPER_SECRET_KEY_2024_CAMBIAR_ESTO
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=notificaciones@interos.com.co
EMAIL_PASSWORD=tu_app_password_16_digitos
EMAIL_FROM=INTEROS Control <notificaciones@interos.com.co>

# Twilio (Opcional)
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Notificaciones
NOTIFICATIONS_ENABLED=true
NOTIFICATION_CHECK_INTERVAL=*/30 * * * *
ADMIN_EMAILS=admin@interos.com.co,oscar@interos.com.co
ADMIN_PHONES=+573001234567,+573009876543

# Frontend
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Archivos
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Iniciar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Modo desarrollo (recarga automática)
npm run dev

# Modo producción
npm start
```

**El servidor estará en:** http://localhost:5000

**Verificar estado:** http://localhost:5000/health

---

## 🎨 CONFIGURACIÓN DE FRONTEND

### Archivo `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### Iniciar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de build
npm run preview
```

**La aplicación estará en:** http://localhost:5173

---

## 👤 ACCESO INICIAL

**Usuario Administrador por defecto:**
```
Email: admin@interos.com.co
Password: Admin123!
```

**⚠️ IMPORTANTE:** Cambiar el password inmediatamente después del primer login.

---

## 📝 USO DEL SISTEMA

### Para Conductores:

1. **Login** con credenciales
2. **Registrar Kilometraje:**
   - Ir a "Kilometraje" → "Nuevo Registro"
   - Seleccionar vehículo
   - Ingresar kilometraje actual
   - **Foto OBLIGATORIA del odómetro**
   - Guardar

3. **Registrar Combustible:**
   - Ir a "Combustible" → "Nuevo Registro"
   - Seleccionar vehículo
   - Ingresar: litros, precio, estación
   - Subir foto de factura (opcional)
   - El sistema **calcula automáticamente** el rendimiento

### Para Administradores:

1. **Gestionar Vehículos:**
   - Agregar nuevos vehículos
   - Asignar conductores
   - Configurar km de cambio de aceite

2. **Ver Dashboard:**
   - Estadísticas en tiempo real
   - Alertas de mantenimiento
   - Estado de toda la flota

3. **Programar Mantenimientos:**
   - Registrar cambios de aceite
   - Programar próximos servicios
   - Ver historial completo

---

## 🔔 SISTEMA DE NOTIFICACIONES

### Alertas Automáticas

El sistema verifica **cada 30 minutos** y envía alertas cuando:

1. **Cambio de Aceite:**
   - Faltan 500 km o menos
   - Se alcanzó el kilometraje programado

2. **Mantenimientos Programados:**
   - 7 días antes de la fecha programada

### Destinatarios de Alertas:

- Conductor asignado al vehículo (si tiene email/teléfono)
- Administradores (definidos en `ADMIN_EMAILS` y `ADMIN_PHONES`)

### Personalizar Frecuencia:

Editar en `backend/server.js`:

```javascript
// Cada 30 minutos (por defecto)
cron.schedule('*/30 * * * *', ...)

// Cada hora
cron.schedule('0 * * * *', ...)

// Cada día a las 8am
cron.schedule('0 8 * * *', ...)

// Cada lunes a las 9am
cron.schedule('0 9 * * 1', ...)
```

---

## 🗄️ BASE DE DATOS

### Tablas Principales:

- `usuarios`: Conductores, admin, mecánicos
- `vehiculos`: Info de cada vehículo
- `registros_kilometraje`: Kilometraje diario + fotos
- `registros_combustible`: Cargas + rendimiento
- `mantenimientos`: Historial de servicios
- `notificaciones`: Log de alertas enviadas

### Respaldos:

```bash
# Crear respaldo
mysqldump -u root -p interos_vehiculos > backup_$(date +%Y%m%d).sql

# Restaurar respaldo
mysql -u root -p interos_vehiculos < backup_20260209.sql
```

---

## 🚀 DESPLIEGUE EN PRODUCCIÓN

### Backend - Railway (Recomendado)

1. Crear cuenta en https://railway.app
2. New Project → Deploy from GitHub
3. Agregar servicio MySQL
4. Configurar variables de entorno
5. Deploy automático

### Frontend - Vercel (Recomendado)

1. Crear cuenta en https://vercel.com
2. Import Git Repository
3. Framework: Vite
4. Build: `npm run build`
5. Output: `dist`
6. Deploy

### Base de Datos - PlanetScale

Ya configurado en paso anterior.

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Backend no inicia

```bash
# Verificar MySQL
sudo systemctl status mysql
sudo systemctl start mysql

# Verificar credenciales en .env
cat backend/.env

# Verificar logs
cd backend
npm run dev
```

### Frontend no conecta

```bash
# Verificar que backend esté corriendo
curl http://localhost:5000/health

# Verificar VITE_API_URL en frontend/.env
cat frontend/.env
```

### Notificaciones no se envían

```bash
# Verificar configuración
NOTIFICATIONS_ENABLED=true

# Ver logs del servidor
# Buscar líneas con ✅ o ❌

# Probar email manualmente
node -e "require('./backend/services/notificaciones.service').verificarConfiguracion()"
```

### Error al subir fotos

```bash
# Verificar credenciales de Cloudinary
# Verificar tamaño de archivo (max 5MB por defecto)
# Ver MAX_FILE_SIZE en .env
```

---

## 📊 API ENDPOINTS

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/perfil` - Obtener perfil
- `PUT /api/auth/perfil` - Actualizar perfil

### Vehículos
- `GET /api/vehiculos` - Listar vehículos
- `POST /api/vehiculos` - Crear vehículo
- `PUT /api/vehiculos/:id` - Actualizar vehículo
- `DELETE /api/vehiculos/:id` - Eliminar vehículo

### Kilometraje
- `GET /api/kilometraje` - Listar registros
- `POST /api/kilometraje` - Crear registro (con foto)

### Combustible
- `GET /api/combustible` - Listar registros
- `POST /api/combustible` - Crear registro

### Mantenimientos
- `GET /api/mantenimientos` - Listar mantenimientos
- `GET /api/mantenimientos/proximos` - Próximos mantenimientos
- `POST /api/mantenimientos` - Crear mantenimiento

### Dashboard
- `GET /api/dashboard/resumen` - Resumen completo

---

## 🔒 SEGURIDAD

- ✅ JWT para autenticación
- ✅ Passwords hasheados con bcrypt
- ✅ Rate limiting (100 requests/15min)
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Validación de tipos de archivo
- ✅ Límite de tamaño de archivos

---

## 📞 SOPORTE

**Email:** admin@interos.com.co

**Documentación:**
- README.md (general)
- INSTALACION_RAPIDA.md (instalación)
- GUIA_COMPLETA.md (este archivo)

---

## ✅ CHECKLIST POST-INSTALACIÓN

- [ ] Base de datos creada e importada
- [ ] Backend iniciado sin errores
- [ ] Frontend iniciado y accesible
- [ ] Login exitoso con admin
- [ ] Password de admin cambiado
- [ ] 5 vehículos registrados
- [ ] Usuarios creados para conductores
- [ ] Prueba de registro de kilometraje
- [ ] Prueba de registro de combustible
- [ ] Prueba de notificación enviada
- [ ] Cloudinary funcionando (fotos se suben)
- [ ] Emails siendo enviados
- [ ] WhatsApp configurado (opcional)

---

**Sistema desarrollado para INTEROS - INTERNET SERVICE SAS**
**Febrero 2026 - Version 1.0.0**
