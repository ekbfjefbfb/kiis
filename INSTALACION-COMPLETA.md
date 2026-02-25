# 📱 Instalación Completa - Sistema de Grabación de Clases

## 🎯 Resumen

Sistema completo con:
- ✅ Frontend React + TypeScript
- ✅ Backend Node.js + Express
- ✅ Procesamiento con OpenAI
- ✅ Grabación continua con STT
- ✅ Funciona en segundo plano (Wake Lock API)
- ✅ Sincronización con backend
- ✅ Fallback a localStorage

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de OpenAI (para API key)
- Navegador moderno (Chrome, Edge, Safari)

## 🚀 Instalación

### 1. Backend

```bash
# Ir a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env y añadir tu OPENAI_API_KEY
nano .env  # o usa tu editor favorito
```

En `.env`:
```
PORT=3000
OPENAI_API_KEY=sk-tu-api-key-de-openai
NODE_ENV=development
```

```bash
# Iniciar el servidor
npm run dev
```

El backend estará en `http://localhost:3000`

### 2. Frontend

```bash
# Volver a la raíz del proyecto
cd ..

# Instalar dependencias (si no lo has hecho)
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env
nano .env
```

En `.env`:
```
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_firebase_app_id
```

```bash
# Iniciar el frontend
npm run dev
```

La app estará en `http://localhost:5173`

## 🔧 Integración en tu App

Para integrar el sistema de grabación de clases en tu app existente:

```typescript
// En tu componente principal o router
import { ClassRecordingApp } from './app/ClassRecordingApp';
import { AuthService } from './auth';
import { AudioService } from './audio';

function App() {
  const authService = new AuthService();
  const audioService = new AudioService();

  return (
    <ClassRecordingApp 
      authService={authService}
      audioService={audioService}
    />
  );
}
```

## 📱 Uso

### 1. Grabar una Clase

1. Abre la app
2. Toca "Nueva Clase"
3. Toca el botón del micrófono (rojo)
4. Habla normalmente - el sistema transcribe en tiempo real
5. La grabación continúa aunque bloquees el teléfono (Wake Lock)
6. Toca el botón de nuevo para detener
7. Toca "Procesar y Guardar"

### 2. Ver Clases Procesadas

La IA automáticamente organiza todo en:
- **Resumen**: Vista general de la clase
- **Puntos Clave**: Conceptos importantes
- **Tareas**: Con fechas de entrega
- **Fechas**: Exámenes y eventos
- **Temas**: Tags de los temas discutidos
- **Apuntes**: Transcripción completa

## 🔥 Características Especiales

### Grabación Continua
- El reconocimiento de voz se reinicia automáticamente
- No se detiene si hay pausas
- Funciona en segundo plano

### Wake Lock
- Mantiene la pantalla activa durante la grabación
- Evita que el teléfono se suspenda
- Se libera automáticamente al terminar

### Sincronización
- Guarda en el backend
- Fallback a localStorage si no hay conexión
- Sincroniza cuando vuelve la conexión

## 🐛 Solución de Problemas

### El micrófono no funciona
- Verifica permisos del navegador
- Usa HTTPS (o localhost)
- Prueba en Chrome/Edge (mejor soporte)

### La IA no procesa bien
- Verifica que el OPENAI_API_KEY sea válido
- Revisa los logs del backend
- Asegúrate de tener créditos en OpenAI

### No se guarda en el backend
- Verifica que el backend esté corriendo
- Revisa la URL en `.env` (VITE_API_URL)
- Mira la consola del navegador para errores

### La grabación se detiene
- Verifica que Wake Lock esté soportado
- Mantén la app en primer plano
- Revisa la consola para errores

## 📦 Producción

### Backend

1. **Heroku**:
```bash
cd backend
heroku create tu-app-backend
heroku config:set OPENAI_API_KEY=tu-key
git subtree push --prefix backend heroku main
```

2. **Railway**:
- Conecta el repo
- Selecciona carpeta `backend`
- Añade variable `OPENAI_API_KEY`

### Frontend

1. **Vercel/Netlify**:
```bash
npm run build
# Sube la carpeta dist/
```

2. Actualiza `.env` con la URL del backend en producción:
```
VITE_API_URL=https://tu-backend.herokuapp.com
```

## 🔐 Seguridad

⚠️ **Para producción, añade**:
- Autenticación JWT o Firebase
- Rate limiting
- Validación de inputs
- CORS configurado
- HTTPS obligatorio

## 📊 Estructura de Archivos

```
.
├── backend/
│   ├── services/
│   │   ├── aiProcessor.js      # Procesamiento con OpenAI
│   │   └── database.js         # Almacenamiento
│   ├── server.js               # API Express
│   └── package.json
│
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── ClassList.tsx   # Lista de clases
│   │   │   ├── RecordClass.tsx # Grabar clase
│   │   │   ├── ClassDetail.tsx # Navegación
│   │   │   ├── ClassSummary.tsx
│   │   │   ├── KeyPoints.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── ImportantDates.tsx
│   │   │   ├── Topics.tsx
│   │   │   └── ClassNotes.tsx
│   │   └── ClassRecordingApp.tsx
│   │
│   ├── services/
│   │   └── classRecording.ts   # Servicio principal
│   │
│   └── audio.ts                # STT + Wake Lock
│
└── package.json
```

## 🎓 Próximos Pasos

1. Prueba grabando una clase corta
2. Verifica que la IA procese correctamente
3. Personaliza los estilos si quieres
4. Añade más funcionalidades:
   - Edición manual de campos
   - Exportar a PDF
   - Compartir con compañeros
   - Calendario integrado
   - Búsqueda entre clases

¡Listo! 🎉
