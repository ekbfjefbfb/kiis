# 📚 Sistema de Grabación de Clases con IA

Sistema completo para grabar clases usando voz (STT), procesarlas con IA y organizarlas automáticamente en categorías.

## ✨ Características

- 🎤 **Grabación continua con STT** - Transcripción en tiempo real
- 🔒 **Wake Lock** - Funciona aunque bloquees el teléfono
- 🤖 **Procesamiento con IA** - OpenAI GPT-4 organiza todo automáticamente
- 📱 **PWA Ready** - Funciona como app nativa
- 💾 **Sincronización** - Backend + fallback a localStorage
- 🎨 **UI Moderna** - React + Tailwind CSS + Radix UI

## 📦 Estructura

```
.
├── backend/                    # API Node.js + Express
│   ├── services/
│   │   ├── aiProcessor.js     # Procesamiento con OpenAI
│   │   └── database.js        # Almacenamiento
│   └── server.js              # API REST
│
├── src/
│   ├── app/
│   │   ├── pages/             # 7 páginas React
│   │   │   ├── ClassList.tsx
│   │   │   ├── RecordClass.tsx
│   │   │   ├── ClassDetail.tsx
│   │   │   ├── ClassSummary.tsx
│   │   │   ├── KeyPoints.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── ImportantDates.tsx
│   │   │   ├── Topics.tsx
│   │   │   └── ClassNotes.tsx
│   │   └── ClassRecordingApp.tsx
│   │
│   ├── services/
│   │   └── classRecording.ts  # Servicio principal
│   │
│   └── audio.ts               # STT + Wake Lock
│
└── docs/                      # Documentación
```

## 🚀 Inicio Rápido

### 1. Instalación Automática

**Linux/Mac:**
```bash
./start-all.sh
```

**Windows:**
```bash
start-all.bat
```

### 2. Instalación Manual

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edita .env y añade tu OPENAI_API_KEY
npm run dev
```

**Frontend:**
```bash
npm install
cp .env.example .env
npm run dev
```

## 📖 Documentación

- 📘 [**INSTALACION-COMPLETA.md**](INSTALACION-COMPLETA.md) - Guía detallada de instalación
- 🧪 [**PRUEBA-RAPIDA-CLASES.md**](PRUEBA-RAPIDA-CLASES.md) - Cómo probar el sistema
- 🔌 [**INTEGRACION-APP-EXISTENTE.md**](INTEGRACION-APP-EXISTENTE.md) - Integrar en tu app
- 📊 [**RESUMEN-SISTEMA-CLASES.md**](RESUMEN-SISTEMA-CLASES.md) - Resumen técnico completo
- 🎯 [**SISTEMA-GRABACION-CLASES.md**](SISTEMA-GRABACION-CLASES.md) - Funcionalidad y flujo

## 🎯 Cómo Funciona

```
Usuario graba clase con voz
         ↓
STT transcribe en tiempo real
         ↓
Usuario detiene y procesa
         ↓
Backend envía a OpenAI
         ↓
IA categoriza automáticamente:
  • Resumen
  • Puntos importantes
  • Tareas con fechas
  • Fechas importantes
  • Temas discutidos
  • Apuntes adicionales
         ↓
Frontend muestra todo organizado
```

## 🛠️ Tecnologías

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Lucide Icons
- Web Speech API
- Wake Lock API

### Backend
- Node.js + Express
- OpenAI API (GPT-4)
- JSON Storage (fácil migrar a DB)

## 📱 Capturas

### Lista de Clases
Muestra todas las clases grabadas con preview de temas y resumen.

### Grabación
Botón de micrófono grande, transcripción en tiempo real, indicador de grabación activa.

### Vista de Clase
6 pestañas con toda la información organizada:
- Resumen general
- Puntos clave numerados
- Tareas con checkboxes
- Fechas importantes destacadas
- Temas como tags
- Apuntes completos + transcripción

## 🔧 Configuración

### Variables de Entorno

**Backend (.env):**
```env
PORT=3000
OPENAI_API_KEY=sk-tu-api-key
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
```

## 🎨 Integración

```typescript
import { ClassRecordingApp } from './app/ClassRecordingApp';

<ClassRecordingApp 
  authService={authService}
  audioService={audioService}
/>
```

Ver [INTEGRACION-APP-EXISTENTE.md](INTEGRACION-APP-EXISTENTE.md) para más opciones.

## 🧪 Testing

```bash
# Test backend
curl http://localhost:3000/health

# Test procesamiento
curl -X POST http://localhost:3000/api/recordings/process \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Hoy vimos ecuaciones. Tarea: ejercicios 1-10 para el viernes.","userId":"test"}'
```

## 🚀 Despliegue

### Backend
- Heroku
- Railway
- Render
- DigitalOcean

### Frontend
- Vercel
- Netlify
- GitHub Pages

Ver [INSTALACION-COMPLETA.md](INSTALACION-COMPLETA.md) para instrucciones detalladas.

## 🔐 Seguridad

⚠️ **Este es un MVP**. Para producción añade:
- Autenticación (JWT/Firebase)
- Rate limiting
- Validación de inputs
- CORS configurado
- HTTPS obligatorio
- Sanitización de datos

## 📈 Roadmap

- [ ] Edición manual de campos
- [ ] Exportar a PDF
- [ ] Compartir con compañeros
- [ ] Calendario integrado
- [ ] Búsqueda entre clases
- [ ] Notificaciones de tareas
- [ ] Grabación de audio además de STT
- [ ] Múltiples idiomas
- [ ] Organización por materias
- [ ] Estadísticas de estudio

## 🐛 Problemas Comunes

### El micrófono no funciona
- Verifica permisos del navegador
- Usa HTTPS o localhost
- Prueba en Chrome/Edge

### La IA no procesa
- Verifica OPENAI_API_KEY
- Revisa créditos en OpenAI
- Mira logs del backend

### No se guarda
- Verifica que el backend esté corriendo
- Revisa VITE_API_URL en .env
- Mira consola del navegador

Ver [PRUEBA-RAPIDA-CLASES.md](PRUEBA-RAPIDA-CLASES.md) para más soluciones.

## 📄 Licencia

MIT

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📞 Soporte

- 📖 Lee la documentación en `/docs`
- 🐛 Reporta bugs en Issues
- 💬 Preguntas en Discussions

## ✅ Estado del Proyecto

- ✅ Backend completo y funcional
- ✅ Frontend con todas las páginas
- ✅ Grabación continua con STT
- ✅ Wake Lock implementado
- ✅ Procesamiento con IA
- ✅ Sincronización backend/frontend
- ✅ UI responsive
- ✅ Documentación completa

**¡100% funcional y listo para usar!** 🎉

---

Hecho con ❤️ para estudiantes
