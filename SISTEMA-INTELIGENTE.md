# 🧠 Sistema de Extracción Estructurada Inteligente

## ✅ Implementado

### Descripción General

El sistema de procesamiento inteligente analiza automáticamente las transcripciones de clases y extrae información estructurada, clasificando el contenido en tres categorías:

- **IMPORTANTE**: Conceptos clave, definiciones, tareas, fechas de examen
- **SECUNDARIO**: Ejemplos, aclaraciones, repeticiones
- **IRRELEVANTE**: Bromas, conversaciones fuera del tema

## 🎯 Características Principales

### 1. Chunking Inteligente
```typescript
// Divide transcripciones en fragmentos de ~150 palabras
// Equivalente a 30-60 segundos de habla
chunkTranscript(text: string): string[]
```

### 2. Clasificación Automática
```typescript
// Clasifica cada chunk con IA (Groq Llama 3.3 70B)
// Fallback a palabras clave si no hay API key
classifyChunk(chunk: string): Promise<RelevanceClassification>
```

**Resultado:**
```json
{
  "relevance": "IMPORTANTE",
  "reason": "Menciona fecha de examen",
  "confidence": 0.95
}
```

### 3. Extracción Estructurada
```typescript
// Extrae datos específicos de chunks importantes
extractStructuredData(chunk: string): Promise<ExtractedData>
```

**Extrae:**
- ✅ Conceptos clave
- ✅ Tareas con fechas
- ✅ Fechas importantes (exámenes, entregas)
- ✅ Definiciones
- ✅ Instrucciones del profesor

**Resultado:**
```json
{
  "concepts": ["Derivadas", "Regla de la cadena"],
  "tasks": [{
    "description": "Hacer ejercicios 1-10 página 45",
    "dueDate": "viernes",
    "priority": "high"
  }],
  "dates": [{
    "event": "Examen parcial",
    "date": "10 de abril",
    "type": "exam"
  }],
  "exams": [{
    "topic": "Derivadas",
    "date": "viernes",
    "coverage": ["Derivadas básicas", "Regla de la cadena"]
  }],
  "definitions": ["La derivada mide la tasa de cambio"],
  "instructions": ["Estudiar capítulo 3"]
}
```

### 4. Consolidación de Datos
```typescript
// Elimina duplicados y consolida información
consolidateData(analyses: ChunkAnalysis[])
```

- Elimina tareas duplicadas
- Elimina fechas duplicadas
- Elimina conceptos repetidos
- Mantiene solo información única

### 5. Visualización en Tiempo Real

**Componente:** `IntelligentAnalysis.tsx`

Muestra:
- 📊 Resumen de clasificación (importante/secundario/irrelevante)
- ✏️ Tareas detectadas con prioridad
- 📅 Fechas importantes con tipo
- 📝 Exámenes con temas
- 💡 Conceptos clave
- 📖 Definiciones

## 🚀 Flujo de Uso

### En la Página Home

```
1. Usuario graba clase
   ↓
2. Detiene grabación
   ↓
3. Sistema procesa con IA:
   - Divide en chunks
   - Clasifica cada chunk
   - Extrae datos estructurados
   - Consolida información
   ↓
4. Muestra análisis en tiempo real
   ↓
5. Guarda en backend
   ↓
6. Navega a lista de notas
```

### En Detalle de Nota

```
1. Usuario abre nota
   ↓
2. Toca "Ver Análisis Inteligente"
   ↓
3. Sistema procesa transcripción
   ↓
4. Muestra análisis completo:
   - Clasificación de fragmentos
   - Datos extraídos
   - Fragmentos individuales
```

## 📁 Archivos Creados

### Servicios
- ✅ `src/services/intelligent-processor.ts` - Lógica de procesamiento

### Componentes
- ✅ `src/app/components/IntelligentAnalysis.tsx` - Visualización

### Páginas
- ✅ `src/app/pages/AnalysisDetail.tsx` - Página de análisis detallado
- ✅ `src/app/pages/Home.tsx` - Actualizada con análisis en tiempo real
- ✅ `src/app/pages/NoteDetail.tsx` - Botón de análisis inteligente

### Rutas
- ✅ `/analysis/:id` - Ruta para análisis detallado

## 🔧 Configuración

### Variables de Entorno

```env
VITE_GROQ_API_KEY=gsk_...
```

**Importante:** Si no hay API key, el sistema usa clasificación fallback basada en palabras clave.

### Palabras Clave Fallback

**IMPORTANTE:**
- examen, tarea, importante, deben estudiar
- entra en, definimos, concepto, fecha límite
- entregar, evalúa, parcial, final, proyecto

**IRRELEVANTE:**
- jaja, perdí el bus, ayer, mi perro
- el fin de semana, por cierto, fuera del tema

## 🎨 Diseño Visual

### Colores de Clasificación

- 🟢 **IMPORTANTE**: Verde (`green-500`)
- 🟡 **SECUNDARIO**: Amarillo (`yellow-500`)
- 🔴 **IRRELEVANTE**: Rojo (`red-500`)

### Colores de Tipos

- 🔴 **Examen**: Rojo
- 🟡 **Entrega**: Amarillo
- 🔵 **Evento**: Azul
- 🟣 **Tarea Alta**: Rojo
- 🟡 **Tarea Media**: Amarillo
- 🟢 **Tarea Baja**: Verde

## 📊 Ejemplo Real

### Input (Transcripción)
```
"Hoy vamos a ver derivadas. La derivada mide la tasa de cambio.
Tienen que hacer los ejercicios 1 al 10 de la página 45 para el viernes.
El examen parcial será el 10 de abril y entrará todo lo que vimos de derivadas.
Por cierto, ayer perdí el bus y llegué tarde."
```

### Output (Análisis)

**Clasificación:**
- 3 chunks IMPORTANTES
- 0 chunks SECUNDARIOS
- 1 chunk IRRELEVANTE

**Datos Extraídos:**
- **Conceptos:** Derivadas, Tasa de cambio
- **Tareas:** Hacer ejercicios 1-10 página 45 (viernes)
- **Exámenes:** Parcial sobre derivadas (10 de abril)
- **Definiciones:** La derivada mide la tasa de cambio

**Fragmento Irrelevante Descartado:**
- "Por cierto, ayer perdí el bus y llegué tarde."

## 🔄 Integración con Backend

El sistema funciona en paralelo con el backend:

1. **Frontend:** Procesa y muestra análisis inmediato
2. **Backend:** Guarda transcripción completa
3. **Usuario:** Ve análisis mientras se guarda

No reemplaza el backend, lo complementa con análisis visual instantáneo.

## 🚀 Próximas Mejoras

### Posibles Extensiones

1. **Vector Database**
   - Guardar embeddings de chunks importantes
   - Búsqueda semántica avanzada

2. **Resumen Inteligente**
   - Generar resumen consolidado
   - Eliminar repeticiones automáticamente

3. **Detección de Patrones**
   - Identificar temas recurrentes
   - Sugerir conexiones entre clases

4. **Exportación**
   - Exportar solo contenido importante
   - Generar flashcards automáticas

5. **Configuración**
   - Ajustar sensibilidad de clasificación
   - Personalizar palabras clave

## 💡 Uso Recomendado

### Para Estudiantes

1. Graba la clase completa
2. Revisa el análisis automático
3. Enfócate en lo marcado como IMPORTANTE
4. Ignora lo IRRELEVANTE
5. Usa las tareas y fechas extraídas

### Para Profesores

1. Revisa qué se clasificó como importante
2. Verifica que conceptos clave fueron detectados
3. Ajusta tu forma de hablar si es necesario
4. Repite información importante para mejor detección

## 🎯 Beneficios

✅ **Ahorra tiempo:** No necesitas revisar toda la transcripción  
✅ **Enfoque:** Solo lo importante queda destacado  
✅ **Organización:** Tareas y fechas automáticamente extraídas  
✅ **Precisión:** IA detecta patrones educativos  
✅ **Flexibilidad:** Funciona con o sin API key  

---

**Sistema implementado y listo para usar** 🚀

El análisis inteligente está completamente integrado en la app y funciona automáticamente al grabar clases.
