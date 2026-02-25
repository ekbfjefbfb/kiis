#!/bin/bash

echo "🚀 Iniciando Sistema de Grabación de Clases"
echo ""

# Verificar si existe .env en backend
if [ ! -f backend/.env ]; then
    echo "⚠️  No existe backend/.env"
    echo "Copiando backend/.env.example a backend/.env"
    cp backend/.env.example backend/.env
    echo "❗ IMPORTANTE: Edita backend/.env y añade tu OPENAI_API_KEY"
    echo ""
fi

# Verificar si existe .env en frontend
if [ ! -f .env ]; then
    echo "⚠️  No existe .env"
    echo "Copiando .env.example a .env"
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo ""
fi

# Instalar dependencias del backend si no existen
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
    echo "✅ Dependencias del backend instaladas"
    echo ""
fi

# Instalar dependencias del frontend si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install
    echo "✅ Dependencias del frontend instaladas"
    echo ""
fi

echo "🔥 Iniciando servicios..."
echo ""

# Iniciar backend en segundo plano
echo "🖥️  Iniciando backend en http://localhost:3000"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Esperar un poco para que el backend inicie
sleep 3

# Iniciar frontend
echo "🌐 Iniciando frontend en http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servicios iniciados!"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Para detener los servicios, presiona Ctrl+C"
echo ""

# Esperar a que el usuario presione Ctrl+C
wait
