# 🚀 Instalación Rápida - 10 Minutos

## Paso 1: Requisitos (2 minutos)

Instalar si no los tienes:
```bash
# Verificar Node.js
node --version  # Debe ser v18 o superior

# Verificar MySQL
mysql --version  # Debe ser 8.0 o superior
```

## Paso 2: Base de Datos (3 minutos)

```bash
# 1. Crear base de datos
mysql -u root -p << SQL
CREATE DATABASE interos_vehiculos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SQL

# 2. Importar esquema
mysql -u root -p interos_vehiculos < database/schema.sql
```

## Paso 3: Configurar Cloudinary (2 minutos)

1. Ir a: https://cloudinary.com/users/register_free
2. Crear cuenta gratuita
3. Copiar del Dashboard:
   - Cloud Name
   - API Key  
   - API Secret

## Paso 4: Backend (2 minutos)

```bash
cd backend

# Instalar
npm install

# Configurar
cp .env.example .env

# Editar .env (MÍNIMO REQUERIDO):
nano .env
```

**Edita solo estas líneas:**
```env
DB_PASSWORD=tu_password_mysql
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key  
CLOUDINARY_API_SECRET=tu_api_secret
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
```

```bash
# Iniciar
npm run dev
```

## Paso 5: Frontend (1 minuto)

```bash
# En otra terminal
cd frontend

# Instalar
npm install

# Iniciar
npm run dev
```

## ✅ Listo!

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

**Login:**
- Email: `admin@interos.com.co`
- Password: `Admin123!`

---

## ⚙️ Configuración Opcional

### Gmail App Password (para notificaciones email):

1. Google Account → Security
2. Enable 2-Step Verification
3. App Passwords → Create
4. Copy password to `EMAIL_PASSWORD`

### WhatsApp (Opcional):

1. Crear cuenta en https://www.twilio.com
2. Get WhatsApp Sandbox
3. Copiar credenciales a .env

---

## 🐛 Problemas Comunes

**Error: Cannot connect to MySQL**
```bash
sudo systemctl start mysql
# o
sudo service mysql start
```

**Error: Module not found**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error: Port already in use**
```bash
# Cambiar PORT en .env
PORT=5001
```

---

## 📞 ¿Necesitas Ayuda?

Ver README.md completo para más detalles.
