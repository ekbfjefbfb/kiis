# 🎨 Corrección de UX - Notdeer

## ❌ Problema Identificado

La aplicación actual tiene una UX diferente al diseño original de Figma:

### Diseño Original (Figma):
- 3 pestañas simples: Home, Chat, Profile
- Dashboard minimalista con "Next Up" y "My Classes"
- Chat simple sin acciones rápidas complicadas
- Sin página de Notas separada
- Sin botón flotante de grabación

### Implementación Actual (Incorrecta):
- 4 pestañas: Inicio, Chat, Notas, Perfil
- Dashboard con botones de grabación en tareas
- Chat con 5 acciones rápidas
- Página de Notas compleja con filtros
- Botón flotante de grabación siempre visible

## ✅ Solución

Voy a simplificar la UX para que coincida con el diseño de Figma, pero manteniendo las funcionalidades de notas y audio de forma más integrada:

### Cambios a Realizar:

1. **Navegación**
   - Volver a 3 pestañas: Home, Chat, Profile
   - Eliminar pestaña de Notas

2. **Dashboard**
   - Mantener diseño simple de Figma
   - Agregar notas dentro de cada clase (ClassDetail)
   - Eliminar botones de grabación en tareas

3. **Chat**
   - Simplificar: sin acciones rápidas
   - Mantener funcionalidad de voz (micrófono y altavoz)
   - Chat limpio y minimalista

4. **Notas**
   - Integrar en ClassDetail
   - Cada clase tiene sus propias notas
   - Grabación de audio dentro de cada nota

5. **Eliminar**
   - Botón flotante de grabación rápida
   - Acciones rápidas del chat
   - Página de Notas independiente
   - Filtros complejos

## 📋 Nueva Estructura

```
Login/Register
    ↓
Dashboard (Home)
    ├── Next Up (próximas tareas)
    └── My Classes (lista de clases)
        ↓
        ClassDetail
            ├── Información de la clase
            ├── Tareas
            └── Notas (con audio)
    
Chat
    ├── Mensajes simples
    ├── Micrófono (STT)
    └── Altavoz (TTS)
    
Profile
    └── Información del usuario
```

## 🎯 Funcionalidades Mantenidas

- ✅ Autenticación
- ✅ Chat con IA
- ✅ Reconocimiento de voz (STT)
- ✅ Síntesis de voz (TTS)
- ✅ Sistema de notas (dentro de clases)
- ✅ Grabación de audio (en notas)
- ✅ Almacenamiento offline

## 🎯 Funcionalidades Eliminadas

- ❌ Página de Notas independiente
- ❌ Botón flotante de grabación
- ❌ Acciones rápidas del chat
- ❌ Filtros complejos
- ❌ Botones de grabación en tareas

## 🚀 Resultado

Una UX más limpia y simple que:
- Sigue el diseño de Figma
- Mantiene todas las funcionalidades importantes
- Es más fácil de usar
- Tiene mejor organización
