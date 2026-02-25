# 🚀 Inicio Rápido - Notdeer

## Probar la App AHORA (Modo Demo)

### 1. Iniciar el servidor de desarrollo

```bash
npm install
npm run dev
```

### 2. Abrir en el navegador

Abre: `http://localhost:5173`

### 3. Iniciar sesión (Modo Demo)

- Haz clic en **"Iniciar con Google"** o **"Registrarse"**
- Ingresa cualquier email: `demo@test.com`
- Ingresa cualquier contraseña: `123456`
- ¡Listo! Ya estás dentro

## ✨ Qué Puedes Hacer

### Chat con IA
1. Escribe un mensaje en el chat
2. La IA responderá (modo demo con respuestas simuladas)
3. Usa el micrófono 🎤 para hablar (requiere permiso)
4. Usa el altavoz 🔊 para escuchar la respuesta

### Crear Apuntes
1. Ve a la pestaña **"Apuntes"**
2. Haz clic en **"+ Nuevo Apunte"**
3. Completa:
   - Título: "Matemáticas - Derivadas"
   - Clase: "Cálculo I"
   - Profesor: "Dr. García"
   - Teléfono: "555-1234"
   - Email: "garcia@uni.edu"
   - Categoría: Resumen/Tarea/Importante
4. Escribe el contenido
5. Opcionalmente graba audio 🎙️
6. Guarda

### Grabar Audio
- En apuntes: Botón **"Grabar Audio"**
- Permite grabar mientras tomas notas
- El audio se guarda con el apunte

### Subir Archivos
- Haz clic en el clip 📎
- Selecciona PDF, DOC, DOCX o TXT
- El archivo se adjunta al mensaje

## 🔧 Conectar Backend Real

Cuando quieras usar el backend con DeepSeek:

1. Edita `src/auth.ts`:
   ```typescript
   private readonly DEMO_MODE = false; // Cambiar a false
   ```

2. Edita `src/api.ts`:
   ```typescript
   private readonly DEMO_MODE = false; // Cambiar a false
   ```

3. Asegúrate de que tu backend esté corriendo en:
   `https://kiis-backend.onrender.com`

## 📱 Instalar como PWA

### En Android (Chrome)
1. Abre la app en Chrome
2. Menú (⋮) → "Agregar a pantalla de inicio"
3. Confirma

### En iOS (Safari)
1. Abre la app en Safari
2. Botón compartir → "Agregar a pantalla de inicio"
3. Confirma

## 🎯 Características Principales

- ✅ **100% Offline**: Funciona sin internet (después de la primera carga)
- ✅ **Almacenamiento Local**: Todo se guarda en tu dispositivo
- ✅ **Reconocimiento de Voz**: Habla en lugar de escribir
- ✅ **Síntesis de Voz**: Escucha las respuestas
- ✅ **Grabación de Audio**: Graba tus clases
- ✅ **Categorización**: Organiza por tipo de nota
- ✅ **Filtros**: Busca por clase o categoría

## 🐛 Solución de Problemas

### El micrófono no funciona
- Asegúrate de dar permiso cuando el navegador lo solicite
- En Chrome: Configuración → Privacidad → Permisos del sitio → Micrófono

### No se guardan las notas
- Verifica que IndexedDB esté habilitado en tu navegador
- No uses modo incógnito (no persiste datos)

### La app no se instala como PWA
- Usa HTTPS o localhost
- Verifica que el navegador soporte PWA

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12)
2. Los permisos del navegador
3. Que estés usando un navegador compatible

## 🎨 Diseño Minimalista

- Solo colores: Negro, Blanco, Grises
- Sin emojis en la UI (solo iconos SVG)
- Tipografía compacta y legible
- Botones redondeados
- Optimizado para móviles

¡Disfruta usando Notdeer! 📚
