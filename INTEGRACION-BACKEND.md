# 🔌 Integración con Backend de Render

## ✅ Implementado

### Backend URL
```
https://estudente.onrender.com
```

## 📡 Servicios Implementados

### 1. Agenda Service (`src/services/agenda.service.ts`)

Servicio completo para interactuar con la Agenda IA del backend.

#### HTTP Endpoints

**Crear Sesión**
```typescript
await agendaService.createSession({
  class_name: "Matemáticas",
  teacher_name: "Prof. García",
  topic_hint: "Derivadas"
});
```

**Obtener Sesión**
```typescript
const session = await agendaService.getSession(sessionId);
// Retorna: sesión + items + transcript
```

**Transcribir Audio (Groq Whisper)**
```typescript
const result = await agendaService.transcribeAudio(audioBlob);
// Retorna: { text, language, duration }
```

**Gestionar Items**
```typescript
// Crear
await agendaService.createItem(sessionId, {
  item_type: 'task',
  content: 'Hacer ejercicios',
  priority: 2
});

// Actualizar
await agendaService.updateItem(sessionId, itemId, {
  status: 'done'
});

// Eliminar
await agendaService.deleteItem(sessionId, itemId);
```

**Finalizar Sesión**
```typescript
await agendaService.finalizeSession(sessionId);
```

#### WebSocket en Tiempo Real

**Conectar**
```typescript
agendaService.connectWebSocket(sessionId, {
  onChunkRelevance: (data) => {
    // Clasificación: IMPORTANTE/SECUNDARIO/IRRELEVANTE
    console.log(data.relevance);
  },
  onAgendaState: (data) => {
    // Estado actualizado: tareas, puntos clave, notas
    console.log(data.state);
  },
  onAssistantAnswer: (data) => {
    // Respuesta del asistente
    console.log(data.answer);
  },
  onConnected: () => console.log('Conectado'),
  onDisconnected: () => console.log('Desconectado'),
  onError: (error) => console.error(error)
});
```

**Enviar Transcript**
```typescript
agendaService.sendTranscriptChunk("El examen será el viernes", {
  t_start_ms: 1000,
  t_end_ms: 3000,
  min_ai_interval_sec: 6
});
```

**Hacer Pregunta**
```typescript
agendaService.askAI("¿Qué entra en el examen?");
```

**Desconectar**
```typescript
agendaService.disconnect();
```

### 2. Página de Grabación en Vivo (`src/app/pages/LiveRecording.tsx`)

Implementa el flujo completo:

1. **Crear sesión** al entrar
2. **Conectar WebSocket** automáticamente
3. **Grabar audio** con MediaRecorder
4. **Preview STT** con Web Speech API (1s)
5. **Upload periódico** cada 10 segundos:
   - Transcribe con Groq
   - Envía al WebSocket
   - Backend clasifica y extrae
6. **Visualización en tiempo real**:
   - Última clasificación de relevancia
   - Tareas detectadas
   - Puntos clave
7. **Finalizar** y navegar a detalle

## 🔄 Flujo Completo

```
Usuario entra a /live
         ↓
Crear sesión (POST /api/agenda/sessions)
         ↓
Conectar WebSocket
         ↓
Usuario toca grabar
         ↓
Iniciar MediaRecorder + Web Speech API
         ↓
Cada 10 segundos:
  - Detener MediaRecorder
  - Subir audio (POST /api/stt/groq/transcribe)
  - Enviar texto al WS (transcript_chunk)
  - Backend clasifica y extrae
  - Recibir chunk_relevance
  - Recibir agenda_state
  - Reiniciar MediaRecorder
         ↓
Usuario detiene grabación
         ↓
Subir último chunk
         ↓
Finalizar sesión (POST /api/agenda/sessions/{id}/finalize)
         ↓
Desconectar WebSocket
         ↓
Navegar a /session/{id}
```

## 🎯 Eventos WebSocket

### Enviados por Frontend

**transcript_chunk**
```json
{
  "event": "transcript_chunk",
  "text": "Mañana tienen que entregar el trabajo",
  "t_start_ms": 12000,
  "t_end_ms": 17000,
  "min_ai_interval_sec": 6
}
```

**ask_ai**
```json
{
  "event": "ask_ai",
  "question": "¿Qué entra en el examen?"
}
```

### Recibidos del Backend

**chunk_relevance**
```json
{
  "event": "chunk_relevance",
  "session_id": "abc123",
  "relevance": {
    "relevance_label": "IMPORTANTE",
    "relevance_reason": "Se mencionó una entrega y fecha",
    "relevance_signals": ["tarea", "fecha", "entrega"],
    "relevance_score": 0.92
  }
}
```

**agenda_state**
```json
{
  "event": "agenda_state",
  "session_id": "abc123",
  "state": {
    "summary": "Clase sobre derivadas...",
    "lecture_notes": "## Derivadas\n\n...",
    "key_points": [
      "La derivada mide la tasa de cambio",
      "Regla de la cadena"
    ],
    "tasks": [
      {
        "text": "Hacer ejercicios 1-10",
        "due_date": "viernes",
        "priority": 2
      }
    ],
    "relevance": {
      "important_signals": ["tarea", "fecha"]
    }
  }
}
```

**assistant_answer**
```json
{
  "event": "assistant_answer",
  "question": "¿Qué entra en el examen?",
  "answer": "Según lo mencionado, entra todo sobre derivadas..."
}
```

## 🔧 Configuración

### Variables de Entorno

Actualiza tu `.env`:

```env
VITE_API_URL=https://estudente.onrender.com
VITE_GROQ_API_KEY=gsk_... (opcional, el backend ya tiene su propia key)
```

### Autenticación

El servicio usa automáticamente el token JWT de `localStorage`:

```typescript
const token = localStorage.getItem('access_token');
```

Todos los endpoints requieren:
```
Authorization: Bearer <JWT>
```

## 📱 Uso en la App

### Opción 1: Grabación Simple (Home.tsx)
- Graba localmente
- Procesa con intelligent-processor local
- Guarda en backend al final

### Opción 2: Grabación IA en Vivo (LiveRecording.tsx)
- Conecta WebSocket
- Análisis en tiempo real
- Clasificación automática
- Extracción estructurada
- Visualización instantánea

## 🚀 Próximos Pasos

### Implementar en Backend (si falta)

**Endpoint "Audio → Agenda"**
```
POST /api/agenda/sessions/{id}/audio
```
- Recibe audio directamente
- Transcribe internamente
- Procesa como chunk
- Retorna estado actualizado

Esto simplificaría el frontend a:
```typescript
// En lugar de:
const result = await agendaService.transcribeAudio(audioBlob);
agendaService.sendTranscriptChunk(result.text);

// Solo:
await agendaService.uploadAudio(sessionId, audioBlob);
```

### Página de Detalle de Sesión

Crear `/session/:id` para mostrar:
- Transcript completo
- Lecture notes (Markdown)
- Tareas extraídas
- Puntos clave
- Timeline de relevancia

### Búsqueda Semántica

Cuando el backend implemente vector DB:
```typescript
const results = await agendaService.searchSemantic("¿Qué dijo sobre derivadas?");
```

## 🎨 Componentes Visuales

### LiveRecording
- Botón de grabación gigante
- Indicador de conexión (Wifi icon)
- Timer en tiempo real
- Preview de transcripción
- Cards de análisis:
  - Última clasificación
  - Tareas detectadas
  - Puntos clave

### Colores de Relevancia
- 🟢 IMPORTANTE: Verde
- 🟡 SECUNDARIO: Amarillo
- 🔴 IRRELEVANTE: Rojo

## 📊 Ventajas vs Procesamiento Local

| Característica | Local (intelligent-processor) | Backend (Agenda IA) |
|----------------|------------------------------|---------------------|
| Clasificación | Palabras clave | IA (Groq Llama 3.3) |
| Extracción | Regex básico | IA estructurada |
| Tiempo real | No | Sí (WebSocket) |
| Persistencia | Manual | Automática |
| Búsqueda | No | Semántica (futuro) |
| Costo | Gratis | Requiere API keys |

## ✅ Estado Actual

- ✅ Servicio de Agenda completo
- ✅ WebSocket con reconexión automática
- ✅ Transcripción con Groq Whisper
- ✅ Página de grabación en vivo
- ✅ Visualización en tiempo real
- ✅ Gestión de items (CRUD)
- ✅ Finalización de sesiones
- ✅ Integración con autenticación

## 🔗 Rutas Agregadas

- `/live` - Grabación con IA en tiempo real
- `/session/:id` - Detalle de sesión (pendiente)

---

**La integración con el backend está completa y lista para usar** 🚀

El frontend ahora puede aprovechar toda la potencia del backend de Render para análisis inteligente en tiempo real.
