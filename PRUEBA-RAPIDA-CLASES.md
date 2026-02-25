# 🚀 Prueba Rápida - Sistema de Grabación de Clases

## ⚡ Inicio Rápido (5 minutos)

### Opción 1: Script Automático

**Linux/Mac:**
```bash
./start-all.sh
```

**Windows:**
```bash
start-all.bat
```

### Opción 2: Manual

**Terminal 1 - Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edita .env y añade tu OPENAI_API_KEY
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
cp .env.example .env
npm run dev
```

## 🧪 Prueba del Sistema

### 1. Verificar Backend

Abre en tu navegador o usa curl:
```bash
curl http://localhost:3000/health
```

Deberías ver: `{"status":"ok"}`

### 2. Abrir la App

Abre: `http://localhost:5173`

### 3. Probar Grabación

1. **Iniciar sesión** (si tu app lo requiere)

2. **Ir a Grabación de Clases**
   - Busca el componente ClassRecordingApp en tu app
   - O intégralo temporalmente en tu ruta principal

3. **Grabar una clase de prueba**
   - Toca "Nueva Clase"
   - Toca el botón del micrófono (se pone rojo)
   - Di algo como:

   ```
   "Hoy vimos ecuaciones cuadráticas. 
   La fórmula general es menos b más menos raíz de b cuadrado menos 4ac, todo sobre 2a.
   Los puntos importantes son: primero, identificar los coeficientes a, b y c.
   Segundo, calcular el discriminante.
   Tercero, aplicar la fórmula.
   La tarea es hacer los ejercicios del 1 al 10 de la página 45 para el viernes.
   El examen será el próximo martes 5 de marzo.
   Los temas que cubriremos son: ecuaciones cuadráticas, factorización y gráficas de parábolas."
   ```

4. **Detener grabación**
   - Toca el botón de nuevo

5. **Procesar**
   - Toca "Procesar y Guardar"
   - Espera 5-10 segundos

6. **Ver resultado**
   - Deberías ver las pestañas:
     - Resumen
     - Puntos Clave
     - Tareas
     - Fechas
     - Temas
     - Apuntes

### 4. Verificar Categorización

La IA debería haber extraído:

- **Resumen**: Descripción de la clase sobre ecuaciones cuadráticas
- **Puntos Clave**: 
  - Identificar coeficientes
  - Calcular discriminante
  - Aplicar fórmula
- **Tareas**: Ejercicios 1-10 página 45 (fecha: viernes)
- **Fechas**: Examen (martes 5 de marzo)
- **Temas**: Ecuaciones cuadráticas, Factorización, Gráficas de parábolas
- **Apuntes**: Fórmula general y detalles

## 🔍 Verificar Funcionalidades

### Wake Lock (Segundo Plano)
1. Inicia una grabación
2. Bloquea la pantalla del teléfono
3. Desbloquea después de 10 segundos
4. La grabación debería seguir activa

### Grabación Continua
1. Inicia una grabación
2. Habla por 10 segundos
3. Haz una pausa de 5 segundos
4. Habla otros 10 segundos
5. La transcripción debería incluir todo

### Sincronización
1. Graba y procesa una clase
2. Abre DevTools → Application → Local Storage
3. Verifica que existe `classRecordings`
4. Verifica en `backend/data/` que existe un archivo JSON

### Actualización de Tareas
1. Ve a una clase procesada
2. Abre la pestaña "Tareas"
3. Marca una tarea como completada
4. Recarga la página
5. La tarea debería seguir marcada

## 🐛 Problemas Comunes

### "No se puede conectar al backend"
```bash
# Verifica que el backend esté corriendo
curl http://localhost:3000/health

# Verifica el .env del frontend
cat .env | grep VITE_API_URL
# Debería ser: VITE_API_URL=http://localhost:3000
```

### "Error de OpenAI"
```bash
# Verifica tu API key
cd backend
cat .env | grep OPENAI_API_KEY

# Prueba la API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer tu-api-key"
```

### "El micrófono no funciona"
- Verifica permisos del navegador
- Usa Chrome o Edge (mejor soporte)
- Asegúrate de estar en localhost o HTTPS

### "La grabación se detiene"
- Verifica la consola del navegador
- Asegúrate de que Wake Lock esté soportado
- Mantén la app en primer plano durante la prueba

## 📊 Logs Útiles

### Backend
```bash
cd backend
npm run dev
# Verás logs de cada request
```

### Frontend
Abre DevTools → Console para ver:
- Errores de grabación
- Respuestas del backend
- Estado de Wake Lock

## ✅ Checklist de Prueba

- [ ] Backend responde en /health
- [ ] Frontend carga correctamente
- [ ] Puedo iniciar una grabación
- [ ] El STT transcribe mi voz
- [ ] Puedo detener la grabación
- [ ] El procesamiento funciona
- [ ] Veo las 6 pestañas
- [ ] La IA categorizó correctamente
- [ ] Puedo marcar tareas como completadas
- [ ] Las clases se guardan en la lista
- [ ] Puedo ver clases anteriores

## 🎉 Siguiente Paso

Si todo funciona, ¡estás listo para usar el sistema!

Ahora puedes:
1. Integrar en tu app principal
2. Personalizar estilos
3. Añadir más funcionalidades
4. Desplegar a producción

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs del backend
2. Revisa la consola del navegador
3. Verifica las variables de entorno
4. Asegúrate de tener créditos en OpenAI
