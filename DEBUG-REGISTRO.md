# 🐛 Debug del Botón Crear Cuenta

## Pasos para Verificar

### 1. Recarga la página
Abre en tu teléfono: `http://192.168.1.31:5173`

### 2. Abre la Consola del Navegador (en PC)
Si estás probando en PC:
1. Presiona `F12`
2. Ve a la pestaña "Console"

Si estás en el teléfono:
1. Conecta el teléfono por USB
2. En Chrome PC: `chrome://inspect`
3. Selecciona tu dispositivo

### 3. Completa el Formulario
- Nombre: `Juan`
- Email: `test@test.com`
- Password: `123`
- Confirmar: `123`

### 4. Haz Clic en "Crear Cuenta"

### 5. Verifica los Logs en la Consola
Deberías ver:
```
Signup clicked: {name: "Juan", email: "test@test.com", password: "123", confirmPassword: "123"}
Register called: {email: "test@test.com", displayName: "Juan", DEMO_MODE: true}
Saving demo user: {email: "test@test.com", displayName: "Juan"}
User saved, returning true
Register result: true
```

## ❌ Si No Funciona

### Problema 1: No aparece nada en la consola
**Causa**: El botón no está conectado
**Solución**: Verifica que el ID sea `signup-btn`

### Problema 2: Aparece "Completa todos los campos"
**Causa**: Algún campo está vacío
**Solución**: Asegúrate de llenar todos los campos

### Problema 3: Aparece "Las contraseñas no coinciden"
**Causa**: Password y Confirmar son diferentes
**Solución**: Escribe la misma contraseña en ambos campos

### Problema 4: Aparece "Error al crear la cuenta"
**Causa**: `register()` retornó `false`
**Solución**: Verifica que `DEMO_MODE = true` en `src/auth.ts`

## ✅ Si Funciona
Deberías entrar directamente a la pantalla del chat.

## 🔧 Prueba Alternativa

Si el botón no funciona, prueba:

1. **Botón Google**: Haz clic en "Registrarse con Google"
   - Debería entrar directo

2. **Ir a Login**: Haz clic en "¿Ya tienes cuenta? Inicia sesión"
   - Completa cualquier dato
   - Haz clic en "Iniciar Sesión"
   - Debería entrar directo

## 📱 Prueba Rápida en Consola

Abre la consola (F12) y ejecuta:
```javascript
document.getElementById('signup-btn').click()
```

Si no pasa nada, el problema es que los campos están vacíos.

Prueba llenar los campos desde la consola:
```javascript
document.getElementById('signup-name').value = 'Juan';
document.getElementById('signup-email').value = 'test@test.com';
document.getElementById('signup-password').value = '123';
document.getElementById('signup-confirm-password').value = '123';
document.getElementById('signup-btn').click();
```

Esto debería funcionar y entrar a la app.
