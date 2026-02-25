# ✅ Orden de Pantallas Actualizado

## 📱 Flujo de la App

### 1️⃣ Primera Pantalla: REGISTRO (Crear Cuenta)
Al abrir la app por primera vez, verás:
- Título: **Notdeer**
- Subtítulo: **Crear Cuenta**
- Botón: **"Registrarse con Google"** → Entra directo
- Campos:
  - Nombre completo
  - Email
  - Contraseña
  - Confirmar contraseña
- Botón: **"Crear Cuenta"** → Entra directo
- Link: **"¿Ya tienes cuenta? Inicia sesión"** → Va a pantalla 2

### 2️⃣ Segunda Pantalla: INICIO DE SESIÓN
Si haces clic en "Inicia sesión", verás:
- Título: **Notdeer**
- Subtítulo: **Iniciar Sesión**
- Botón: **"Continuar con Google"** → Entra directo
- Campos:
  - Email
  - Contraseña
- Botón: **"Iniciar Sesión"** → Entra directo
- Link: **"¿No tienes cuenta? Regístrate"** → Vuelve a pantalla 1

### 3️⃣ Tercera Pantalla: APP PRINCIPAL
Después de registrarte o iniciar sesión:
- Chat con IA
- Notas
- Audio (STT/TTS)
- Todas las funciones

## ✨ Ambas Pantallas Funcionan

### Registro (Pantalla 1):
- ✅ Acepta cualquier nombre
- ✅ Acepta cualquier email
- ✅ Acepta cualquier contraseña
- ✅ Solo valida que las contraseñas coincidan
- ✅ Entra directo a la app

### Login (Pantalla 2):
- ✅ Acepta cualquier email
- ✅ Acepta cualquier contraseña
- ✅ Entra directo a la app

### Botones Google:
- ✅ Ambos funcionan igual
- ✅ Entran directo como "Usuario Demo"

## 🔄 Navegación

```
REGISTRO (Pantalla 1)
    ↓ (Crear Cuenta o Google)
    ↓
APP PRINCIPAL (Pantalla 3)

    ↕ (Link "Inicia sesión")

LOGIN (Pantalla 2)
    ↓ (Iniciar Sesión o Google)
    ↓
APP PRINCIPAL (Pantalla 3)
```

## 🎯 Prueba Rápida

1. Abre: `http://192.168.1.31:5173`
2. Verás **"Crear Cuenta"** primero
3. Completa cualquier dato y clic en **"Crear Cuenta"**
4. ¡Entras a la app!

O:

1. Clic en **"¿Ya tienes cuenta? Inicia sesión"**
2. Verás **"Iniciar Sesión"**
3. Completa cualquier dato y clic en **"Iniciar Sesión"**
4. ¡Entras a la app!

## 📝 Cambios Realizados

1. ✅ Orden cambiado: Signup primero, Login segundo
2. ✅ Signup sin clase `hidden` (visible por defecto)
3. ✅ Login con clase `hidden` (oculto por defecto)
4. ✅ `checkAuth()` muestra Signup si no hay sesión
5. ✅ Agregados subtítulos h2 para claridad

¡Recarga la página y prueba! 🚀
