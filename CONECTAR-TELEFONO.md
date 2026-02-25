# 📱 Cómo Conectar tu Teléfono

## 🚀 Opción 1: Desarrollo Local (Más Rápido)

### Paso 1: Obtener IP de tu computadora

#### En Linux/Mac:
```bash
# Obtener IP local
ip addr show | grep "inet " | grep -v 127.0.0.1

# O más simple:
hostname -I
```

#### En Windows:
```bash
ipconfig
# Buscar "IPv4 Address"
```

Ejemplo de IP: `192.168.1.100`

### Paso 2: Ejecutar servidor en red local

```bash
# Ejecutar Vite en modo host
npm run dev -- --host

# Verás algo como:
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.1.100:5173/
```

### Paso 3: Abrir en tu teléfono

1. **Conecta tu teléfono a la MISMA WiFi** que tu computadora
2. **Abre el navegador** en tu teléfono (Chrome o Safari)
3. **Escribe la URL**: `http://192.168.1.100:5173`
   (Usa la IP que obtuviste en Paso 1)
4. **¡Listo!** Ya puedes probar la app

### Paso 4: Instalar como PWA

#### En Android (Chrome):
1. Menú (⋮) → "Instalar app"
2. Confirmar
3. Icono aparece en pantalla de inicio

#### En iOS (Safari):
1. Compartir (□↑) → "Añadir a inicio"
2. Confirmar
3. Icono aparece en pantalla de inicio

## 🌐 Opción 2: Túnel con Ngrok (Internet)

### Paso 1: Instalar Ngrok

```bash
# Linux/Mac con Homebrew
brew install ngrok

# O descargar de: https://ngrok.com/download
```

### Paso 2: Ejecutar app

```bash
# Terminal 1: Ejecutar app
npm run dev
```

### Paso 3: Crear túnel

```bash
# Terminal 2: Crear túnel
ngrok http 5173

# Verás algo como:
# Forwarding: https://abc123.ngrok.io -> http://localhost:5173
```

### Paso 4: Abrir en teléfono

1. **Copia la URL** de ngrok (ej: `https://abc123.ngrok.io`)
2. **Abre en tu teléfono** (cualquier navegador)
3. **Funciona desde cualquier lugar** (con internet)

## 📱 Opción 3: Deploy en Vercel (Producción)

### Paso 1: Crear cuenta en Vercel

1. Ve a: https://vercel.com
2. Regístrate con GitHub

### Paso 2: Conectar repositorio

```bash
# Si no tienes git:
git init
git add .
git commit -m "Initial commit"

# Crear repo en GitHub y subir
git remote add origin https://github.com/tu-usuario/notdeer.git
git push -u origin main
```

### Paso 3: Deploy

1. En Vercel: "New Project"
2. Importar tu repositorio
3. Click "Deploy"
4. Esperar 2-3 minutos
5. ¡Listo! URL pública: `https://notdeer.vercel.app`

### Paso 4: Abrir en teléfono

1. Abre la URL de Vercel en tu teléfono
2. Instala como PWA
3. Funciona desde cualquier lugar

## � Solución de Problemas

### No puedo conectar desde el teléfono

#### Verificar WiFi
```
✓ Teléfono y computadora en la MISMA red WiFi
✓ No usar VPN
✓ No usar red de invitados
```

#### Verificar Firewall
```bash
# Linux: Permitir puerto 5173
sudo ufw allow 5173

# Mac: System Preferences → Security → Firewall
# Permitir conexiones entrantes

# Windows: Firewall → Permitir app
# Permitir Node.js
```

#### Verificar IP
```bash
# Asegúrate de usar la IP correcta
# Debe empezar con 192.168.x.x o 10.0.x.x
```

### La app no carga

#### Verificar servidor
```bash
# Debe estar corriendo con --host
npm run dev -- --host

# Verás "Network: http://..."
```

#### Verificar URL
```
✓ Usar http:// (no https://)
✓ Usar IP correcta
✓ Usar puerto correcto (:5173)
✓ No olvidar los dos puntos
```

### No puedo instalar PWA

#### Requisitos
```
✓ HTTPS (en producción) o localhost
✓ Service Worker registrado
✓ Manifest.json válido
✓ Iconos (generar PNG)
```

#### En desarrollo local
```
⚠️ PWA solo funciona con:
- localhost (en la misma máquina)
- HTTPS (en producción)

Para probar PWA en teléfono:
- Usar ngrok (tiene HTTPS)
- O hacer deploy en Vercel
```

## 📊 Comparación de Opciones

| Opción | Velocidad | Facilidad | PWA | Público |
|--------|-----------|-----------|-----|---------|
| Local (--host) | ⚡⚡⚡ | ✅ Fácil | ❌ No | ❌ No |
| Ngrok | ⚡⚡ | ✅ Fácil | ✅ Sí | ✅ Sí |
| Vercel | ⚡ | ⚠️ Media | ✅ Sí | ✅ Sí |

### Recomendación

**Para desarrollo rápido**: Opción 1 (Local)
- Más rápido
- Sin configuración extra
- Perfecto para probar

**Para probar PWA**: Opción 2 (Ngrok)
- Tiene HTTPS
- Puedes instalar app
- Fácil de usar

**Para producción**: Opción 3 (Vercel)
- URL permanente
- HTTPS gratis
- Actualizaciones automáticas

## 🎯 Guía Rápida

### Solo quiero probar en mi teléfono (5 min)

```bash
# 1. Obtener IP
hostname -I

# 2. Ejecutar con host
npm run dev -- --host

# 3. Abrir en teléfono
# http://TU_IP:5173
```

### Quiero instalar como PWA (15 min)

```bash
# 1. Instalar ngrok
brew install ngrok

# 2. Ejecutar app
npm run dev

# 3. Crear túnel (en otra terminal)
ngrok http 5173

# 4. Abrir URL de ngrok en teléfono
# 5. Instalar como PWA
```

### Quiero URL pública permanente (30 min)

```bash
# 1. Subir a GitHub
git init
git add .
git commit -m "Initial commit"
git push

# 2. Deploy en Vercel
# - Ir a vercel.com
# - Conectar repo
# - Deploy

# 3. Abrir URL en teléfono
# 4. Instalar como PWA
```

## ✅ Checklist

### Antes de probar en teléfono
- [ ] App funciona en localhost
- [ ] No hay errores en consola
- [ ] Build exitoso (`npm run build`)

### Para desarrollo local
- [ ] Teléfono en misma WiFi
- [ ] Servidor con `--host`
- [ ] IP correcta
- [ ] Firewall permite conexiones

### Para PWA
- [ ] HTTPS (ngrok o Vercel)
- [ ] Iconos PNG generados
- [ ] Service Worker registrado
- [ ] Manifest válido

## 🎉 ¡Listo!

Ahora puedes probar tu app en el teléfono.

**Recomendación**: Empieza con Opción 1 (local) para probar rápido.
Si quieres instalar como PWA, usa Opción 2 (ngrok).
