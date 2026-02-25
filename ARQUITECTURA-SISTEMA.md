# 🏗️ Arquitectura del Sistema de Grabación de Clases

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (React + TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  ClassList   │  │ RecordClass  │  │ ClassDetail  │     │
│  │              │  │              │  │              │     │
│  │ - Lista de   │  │ - Botón mic  │  │ - 6 pestañas │     │
│  │   clases     │  │ - STT real   │  │ - Navegación │     │
│  │ - Preview    │  │ - Transcript │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │ ClassRecording  │                        │
│                  │    Service      │                        │
│                  │                 │                        │
│                  │ - API calls     │                        │
│                  │ - localStorage  │                        │
│                  │ - Sync logic    │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   HTTP/HTTPS   │
                    │   REST API     │
                    └───────┬────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                        BACKEND                               │
│                   (Node.js + Express)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │              API Endpoints                        │      │
│  │                                                   │      │
│  │  POST   /api/recordings/process                  │      │
│  │  GET    /api/recordings/:userId                  │      │
│  │  GET    /api/recordings/:userId/:recordingId     │      │
│  │  PATCH  /api/recordings/:userId/:recordingId     │      │
│  │  GET    /health                                  │      │
│  └──────────────────┬───────────────────────────────┘      │
│                     │                                       │
│         ┌───────────┴───────────┐                          │
│         │                       │                          │
│  ┌──────▼──────┐        ┌──────▼──────┐                   │
│  │ AI Processor│        │  Database   │                   │
│  │             │        │             │                   │
│  │ - OpenAI    │        │ - JSON      │                   │
│  │ - GPT-4     │        │ - Files     │                   │
│  │ - Prompts   │        │ - CRUD      │                   │
│  └──────┬──────┘        └─────────────┘                   │
│         │                                                  │
└─────────┼──────────────────────────────────────────────────┘
          │
    ┌─────▼─────┐
    │  OpenAI   │
    │    API    │
    └───────────┘
```

## 🔄 Flujo de Datos

### 1. Grabación de Clase

```
Usuario toca micrófono
         ↓
AudioService.startRecording()
         ↓
Web Speech API (STT)
         ↓
Transcripción en tiempo real
         ↓
RecordClass actualiza UI
         ↓
Usuario detiene grabación
         ↓
AudioService.stopRecording()
         ↓
Obtiene transcripción completa
```

### 2. Procesamiento con IA

```
Usuario toca "Procesar y Guardar"
         ↓
ClassRecordingService.processTranscript()
         ↓
POST /api/recordings/process
         ↓
Backend recibe transcript + userId
         ↓
AIProcessor.processClassRecording()
         ↓
Envía prompt a OpenAI GPT-4
         ↓
OpenAI analiza y categoriza
         ↓
Backend recibe JSON estructurado
         ↓
Database.saveRecording()
         ↓
Guarda en archivo JSON
         ↓
Responde al frontend
         ↓
Frontend guarda en localStorage (backup)
         ↓
Navega a ClassDetail
```

### 3. Visualización

```
Usuario selecciona clase
         ↓
ClassDetail carga
         ↓
ClassRecordingService.getRecordingById()
         ↓
GET /api/recordings/:userId/:recordingId
         ↓
Backend lee de database
         ↓
Responde con datos completos
         ↓
Frontend renderiza 6 pestañas:
  - ClassSummary
  - KeyPoints
  - Tasks
  - ImportantDates
  - Topics
  - ClassNotes
```

### 4. Actualización (ej: marcar tarea)

```
Usuario marca checkbox
         ↓
Tasks.toggleTask()
         ↓
ClassRecordingService.updateRecording()
         ↓
PATCH /api/recordings/:userId/:recordingId
         ↓
Backend actualiza database
         ↓
Responde con datos actualizados
         ↓
Frontend actualiza localStorage
         ↓
UI se actualiza
```

## 🧩 Componentes Principales

### Frontend

#### ClassRecordingApp
- **Responsabilidad**: Coordinador principal
- **Estado**: currentView, selectedRecordingId
- **Navegación**: Entre List, Record, Detail

#### RecordClass
- **Responsabilidad**: Grabación con STT
- **Estado**: isRecording, transcript, isProcessing
- **Servicios**: AudioService, ClassRecordingService

#### ClassDetail
- **Responsabilidad**: Navegación por pestañas
- **Estado**: activeTab
- **Hijos**: 6 componentes de visualización

#### ClassRecordingService
- **Responsabilidad**: Comunicación con backend
- **Métodos**:
  - processTranscript()
  - getRecordings()
  - getRecordingById()
  - updateRecording()
- **Fallback**: localStorage si backend falla

#### AudioService
- **Responsabilidad**: STT + Wake Lock
- **Características**:
  - Grabación continua
  - Auto-reinicio
  - Wake Lock API
  - Transcripción acumulativa

### Backend

#### server.js
- **Responsabilidad**: API REST
- **Endpoints**: 5 rutas principales
- **Middleware**: CORS, JSON parser

#### aiProcessor.js
- **Responsabilidad**: Procesamiento con IA
- **Función**: processClassRecording()
- **Prompt**: Estructurado para categorización
- **Output**: JSON validado

#### database.js
- **Responsabilidad**: Persistencia
- **Funciones**:
  - saveRecording()
  - getRecordings()
  - getRecordingById()
  - updateRecording()
- **Storage**: Archivos JSON por usuario

## 🔐 Seguridad

### Frontend
```
┌─────────────────┐
│   AuthService   │
│                 │
│ - getCurrentUser│
│ - isAuth()      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ClassRecording  │
│    Service      │
│                 │
│ - getUserId()   │
└─────────────────┘
```

### Backend
```
Request
   ↓
CORS Check
   ↓
JSON Parser
   ↓
Route Handler
   ↓
[TODO: Auth Middleware]
   ↓
Business Logic
   ↓
Response
```

## 💾 Almacenamiento

### Frontend (localStorage)
```javascript
{
  "classRecordings": [
    {
      "id": "rec-123",
      "date": "2024-01-15",
      "rawTranscript": "...",
      "processed": true,
      "summary": "...",
      "keyPoints": [...],
      "tasks": [...],
      "dates": [...],
      "notes": "...",
      "topics": [...]
    }
  ]
}
```

### Backend (JSON files)
```
backend/data/
├── user-123.json
├── user-456.json
└── user-789.json

Cada archivo:
{
  "recordings": [
    { /* recording data */ }
  ]
}
```

## 🌐 APIs Externas

### OpenAI API
```
Backend → OpenAI
         ↓
POST https://api.openai.com/v1/chat/completions
         ↓
Headers:
  Authorization: Bearer sk-...
  Content-Type: application/json
         ↓
Body:
  model: "gpt-4o-mini"
  messages: [...]
  temperature: 0.7
         ↓
Response:
  choices[0].message.content (JSON)
```

## 🔄 Sincronización

```
┌──────────────┐
│   Frontend   │
│              │
│ localStorage │
└──────┬───────┘
       │
       │ Sync on:
       │ - App load
       │ - After save
       │ - Manual refresh
       │
       ▼
┌──────────────┐
│   Backend    │
│              │
│ JSON files   │
└──────────────┘
```

## 🚀 Escalabilidad

### Actual (MVP)
- Frontend: Vite dev server
- Backend: Node.js single process
- Storage: JSON files
- IA: OpenAI API

### Producción Sugerida
- Frontend: CDN (Vercel/Netlify)
- Backend: Load balancer + múltiples instancias
- Storage: PostgreSQL/MongoDB
- IA: OpenAI API + cache
- Queue: Redis para procesamiento async
- CDN: Para archivos estáticos

## 📊 Métricas

### Performance
- Grabación: Tiempo real (0ms delay)
- Procesamiento IA: 5-10 segundos
- Carga de lista: <100ms (local), <500ms (backend)
- Navegación: Instantánea

### Límites
- Transcripción: Ilimitada (continua)
- Procesamiento: Limitado por OpenAI tokens
- Storage: Ilimitado (JSON files)

## 🔧 Configuración

### Variables de Entorno

```
Frontend (.env)
├── VITE_API_URL
└── VITE_FIREBASE_* (opcional)

Backend (.env)
├── PORT
├── OPENAI_API_KEY
└── NODE_ENV
```

### Dependencias Clave

```
Frontend
├── react
├── typescript
├── tailwindcss
├── @radix-ui/*
└── lucide-react

Backend
├── express
├── openai
├── cors
└── dotenv
```

## 🎯 Puntos de Extensión

1. **Storage**: Cambiar JSON por DB real
2. **Auth**: Añadir JWT/Firebase
3. **IA**: Cambiar modelo o provider
4. **UI**: Personalizar componentes
5. **Features**: Añadir exportación, compartir, etc.

---

Esta arquitectura es modular y fácil de extender. Cada componente tiene una responsabilidad clara y puede ser reemplazado independientemente.
