@echo off
echo 🚀 Iniciando Sistema de Grabación de Clases
echo.

REM Verificar si existe .env en backend
if not exist backend\.env (
    echo ⚠️  No existe backend\.env
    echo Copiando backend\.env.example a backend\.env
    copy backend\.env.example backend\.env
    echo ❗ IMPORTANTE: Edita backend\.env y añade tu OPENAI_API_KEY
    echo.
)

REM Verificar si existe .env en frontend
if not exist .env (
    echo ⚠️  No existe .env
    echo Copiando .env.example a .env
    copy .env.example .env
    echo ✅ Archivo .env creado
    echo.
)

REM Instalar dependencias del backend si no existen
if not exist backend\node_modules (
    echo 📦 Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
    echo ✅ Dependencias del backend instaladas
    echo.
)

REM Instalar dependencias del frontend si no existen
if not exist node_modules (
    echo 📦 Instalando dependencias del frontend...
    call npm install
    echo ✅ Dependencias del frontend instaladas
    echo.
)

echo 🔥 Iniciando servicios...
echo.

REM Iniciar backend
echo 🖥️  Iniciando backend en http://localhost:3000
start "Backend" cmd /k "cd backend && npm run dev"

REM Esperar un poco
timeout /t 3 /nobreak > nul

REM Iniciar frontend
echo 🌐 Iniciando frontend en http://localhost:5173
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Servicios iniciados en ventanas separadas!
echo.
echo Para detener, cierra las ventanas del backend y frontend
echo.
pause
