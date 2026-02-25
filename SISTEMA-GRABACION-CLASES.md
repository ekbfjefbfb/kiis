# Sistema de Grabación de Clases con IA

## 🎯 Funcionalidad

Este sistema permite a los estudiantes grabar clases usando voz (STT - Speech to Text) y automáticamente organizar la información en categorías usando IA.

## 📱 Flujo de Usuario

### 1. Lista de Clases (`ClassList.tsx`)
- Muestra todas las clases grabadas
- Botón para crear nueva grabación
- Vista previa de temas y resumen

### 2. Grabar Clase (`RecordClass.tsx`)
- Botón de micrófono para iniciar/detener grabación
- Transcripción en tiempo real usando STT
- Botón "Procesar y Guardar" que envía el texto a la IA

### 3. Detalle de Clase (`ClassDetail.tsx`)
- Navegación por pestañas entre categorías
- 6 secciones diferentes:

#### 📄 Resumen (`ClassSummary.tsx`)
- Resumen general de 2-3 párrafos
- Fecha de la clase

#### 💡 Puntos Clave (`KeyPoints.tsx`)
- Lista numerada de puntos importantes
- Destacados visualmente

#### ✅ Tareas (`Tasks.tsx`)
- Lista de tareas con checkbox
- Fechas de entrega si fueron mencionadas
- Marcar como completadas

#### 📅 Fechas Importantes (`ImportantDates.tsx`)
- Exámenes, entregas, eventos
- Ordenadas cronológicamente
- Destacadas si son futuras

#### 🏷️ Temas (`Topics.tsx`)
- Tags con los temas principales discutidos
- Vista de etiquetas coloridas

#### 📖 Apuntes (`ClassNotes.tsx`)
- Apuntes adicionales extraídos
- Transcripción original completa

## 🤖 Procesamiento con IA

El servicio `ClassRecordingService` envía el texto a la IA con este prompt:

```
Analiza el siguiente texto de una clase y extrae:
1. Resumen general (2-3 párrafos)
2. Puntos importantes (lista)
3. Tareas mencionadas con fechas si las hay
4. Fechas importantes (exámenes, entregas, etc)
5. Apuntes adicionales relevantes
6. Temas principales discutidos
```

La IA responde en JSON y el sistema automáticamente:
- Guarda todo en localStorage
- Organiza por categorías
- Crea IDs únicos para tareas y fechas

## 🔧 Integración

Para integrar en tu app existente:

```tsx
import { ClassRecordingApp } from './app/ClassRecordingApp';

// En tu componente principal o router
<ClassRecordingApp />
```

## 📦 Estructura de Datos

```typescript
interface ClassRecording {
  id: string;
  date: Date;
  rawTranscript: string;      // Texto original del STT
  processed: boolean;          // Si ya fue procesado por IA
  summary?: string;            // Resumen
  keyPoints?: string[];        // Puntos importantes
  tasks?: Task[];              // Tareas con fechas
  dates?: ImportantDate[];     // Fechas importantes
  notes?: string;              // Apuntes adicionales
  topics?: string[];           // Temas discutidos
}
```

## 🎨 Características UI

- Diseño responsive y mobile-first
- Colores distintivos por categoría
- Animaciones suaves
- Iconos de Lucide React
- Tailwind CSS para estilos

## 🚀 Próximos Pasos

1. Integrar con tu sistema de autenticación existente
2. Conectar con tu backend si quieres sincronización
3. Añadir edición manual de campos
4. Exportar a PDF o compartir
5. Búsqueda entre clases
6. Calendario integrado
