#!/bin/bash

echo "================================================="
echo "🚗 INTEROS - Sistema de Control de Vehículos"
echo "================================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Verificar Node.js
echo "Verificando requisitos..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi
print_success "Node.js $(node --version)"

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    print_error "MySQL no está instalado"
    exit 1
fi
print_success "MySQL instalado"

echo ""
echo "================================================="
echo "📦 Instalando dependencias del Backend"
echo "================================================="
cd backend
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies instaladas"
else
    print_error "Error instalando backend"
    exit 1
fi

echo ""
echo "================================================="
echo "📦 Instalando dependencias del Frontend"
echo "================================================="
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies instaladas"
else
    print_error "Error instalando frontend"
    exit 1
fi

cd ..

echo ""
echo "================================================="
echo "⚙️  Configuración"
echo "================================================="

# Crear .env del backend si no existe
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    print_info "Archivo backend/.env creado - DEBES EDITARLO"
fi

# Crear .env del frontend si no existe
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    print_success "Archivo frontend/.env creado"
fi

echo ""
echo "================================================="
echo "🎉 Instalación Completada"
echo "================================================="
echo ""
print_info "PRÓXIMOS PASOS:"
echo ""
echo "1. Configurar base de datos:"
echo "   mysql -u root -p < database/schema.sql"
echo ""
echo "2. Editar backend/.env con tus credenciales:"
echo "   - DB_PASSWORD"
echo "   - CLOUDINARY_*"
echo "   - EMAIL_*"
echo ""
echo "3. Iniciar backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4. Iniciar frontend (en otra terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Abrir navegador en:"
echo "   http://localhost:5173"
echo ""
echo "Login inicial:"
echo "   Email: admin@interos.com.co"
echo "   Password: Admin123!"
echo ""
echo "================================================="
