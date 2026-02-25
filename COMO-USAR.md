# 📱 Cómo Usar Notdeer

## 🚀 Inicio Rápido

### 1. Instalar y Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en navegador
http://localhost:5173
```

### 2. Primer Uso

1. **Registrarse**
   - Abre la app
   - Haz clic en "Create Account"
   - Ingresa nombre, email y contraseña
   - Haz clic en "Create Account"

2. **Iniciar Sesión**
   - Ingresa email y contraseña
   - Haz clic en "Sign In"

## 🎤 Grabar una Nota

### Paso a Paso

1. **Ir a Home**
   - Toca el tab "Home" (🏠) en la parte inferior
   - Verás un botón gigante en el centro

2. **Empezar a Grabar**
   - Toca el botón grande con el ícono de micrófono
   - El botón se pondrá rojo
   - Verás un contador de tiempo
   - Empieza a hablar sobre tu clase

3. **Parar la Grabación**
   - Toca el botón rojo (ahora con ícono de cuadrado)
   - La app mostrará "Analyzing..."
   - Espera unos segundos

4. **Ver el Resultado**
   - La nota se guarda automáticamente
   - Aparecerá en la lista de "Recent Notes"
   - Toca la nota para ver el análisis completo

## 📝 Ver Notas

### Lista de Notas

1. **Ir a Notes**
   - Toca el tab "Notes" (📝) en la parte inferior

2. **Buscar**
   - Usa la barra de búsqueda en la parte superior
   - Escribe palabras clave

3. **Filtrar**
   - Toca los botones de filtro:
     - **All**: Todas las notas
     - **Important**: Solo importantes
     - **Summary**: Solo resúmenes
     - **Tasks**: Solo tareas

4. **Abrir una Nota**
   - Toca cualquier nota de la lista
   - Verás el análisis completo

### Detalle de Nota

En el detalle verás:

- **⭐ Important**: Avisos urgentes, fechas de exámenes
- **📝 Summary**: Resumen de los puntos principales
- **✏️ Tasks**: Tareas y ejercicios
- **📅 Exams**: Fechas y temas de exámenes
- **💡 Key Points**: Conceptos importantes

También puedes:
- **Reproducir audio**: Toca "Play Recording"
- **Eliminar nota**: Toca el ícono de basura (🗑️)
- **Volver**: Toca la flecha (←)

## 👤 Perfil

1. **Ir a Profile**
   - Toca el tab "Profile" (👤) en la parte inferior

2. **Ver Información**
   - Nombre
   - Email
   - Estadísticas (próximamente)

3. **Cerrar Sesión**
   - Toca "Sign Out"

## 💬 Chat con IA

1. **Ir a Chat**
   - Toca el tab "Chat" (💬) en la parte inferior

2. **Hacer Preguntas**
   - Escribe tu pregunta
   - Toca enviar
   - La IA responderá

3. **Ejemplos de Preguntas**
   - "¿Qué son las derivadas?"
   - "Explícame la fotosíntesis"
   - "¿Cómo resuelvo ecuaciones cuadráticas?"

## 🎯 Consejos

### Para Mejores Resultados

1. **Habla Claro**
   - Pronuncia bien las palabras
   - No hables muy rápido

2. **Menciona la Materia**
   - Di "En matemáticas..." o "En historia..."
   - Ayuda a la IA a categorizar mejor

3. **Menciona Fechas**
   - "Examen el viernes"
   - "Tarea para el lunes"
   - La IA detectará las fechas automáticamente

4. **Sé Específico**
   - "Hacer ejercicios 1 al 10 página 45"
   - "Estudiar capítulo 3 del libro"

### Ejemplos de Grabaciones

#### Ejemplo 1: Clase Completa
```
"Hoy en matemáticas vimos derivadas. 
La derivada mide la tasa de cambio de una función.
Vimos la regla de la cadena y derivadas de funciones compuestas.
El profesor dejó ejercicios del 1 al 10 de la página 45.
El viernes hay examen sobre derivadas."
```

Resultado:
- ⭐ Important: Examen el viernes sobre derivadas
- 📝 Summary: Derivadas, tasa de cambio, regla de la cadena
- ✏️ Tasks: Ejercicios 1-10 página 45
- 📅 Exams: Viernes - Derivadas

#### Ejemplo 2: Nota Rápida
```
"Examen de historia el martes sobre la Segunda Guerra Mundial"
```

Resultado:
- ⭐ Important: Examen el martes
- 📅 Exams: Martes - Segunda Guerra Mundial

#### Ejemplo 3: Tarea
```
"Hacer la lectura del capítulo 5 de biología sobre células 
y responder las preguntas de la página 78"
```

Resultado:
- ✏️ Tasks: Lectura capítulo 5, preguntas página 78
- 💡 Key Points: Células

## 🔧 Solución de Problemas

### No Graba

1. **Permisos**
   - Asegúrate de dar permiso al micrófono
   - El navegador pedirá permiso la primera vez

2. **Navegador**
   - Usa Chrome, Firefox o Safari
   - Actualiza a la última versión

### No Aparecen las Notas

1. **Recargar**
   - Recarga la página (F5)
   - Ve al tab "Notes"

2. **Verificar**
   - Asegúrate de haber parado la grabación
   - Espera a que termine de procesar

### Audio No Reproduce

1. **Verificar**
   - Asegúrate de que la nota tenga audio
   - Busca el ícono de micrófono (🎤)

2. **Navegador**
   - Algunos navegadores bloquean audio automático
   - Toca "Play Recording" manualmente

## 📊 Modo Demo

Actualmente la app está en **modo demo**:

- ✅ Todas las funciones funcionan
- ✅ Puedes grabar y guardar notas
- ⚠️ El análisis de IA es simulado
- ⚠️ La transcripción es simulada

Para conectar el backend real:
1. Configura las variables de entorno en `.env`
2. Cambia `DEMO_MODE = false` en los servicios
3. Reinicia la app

## 🎉 ¡Listo!

Ya sabes cómo usar Notdeer. Ahora solo:

1. **Graba** tus clases
2. **Deja que la IA** organice todo
3. **Revisa** tus notas cuando necesites

¡Así de simple! 🚀
