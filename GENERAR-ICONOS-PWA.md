# 🎨 Generar Iconos para PWA

## Iconos Necesarios

La PWA necesita los siguientes tamaños de iconos:

### Iconos Estándar
- `icon-16.png` - 16x16px (favicon)
- `icon-32.png` - 32x32px (favicon)
- `icon-57.png` - 57x57px (iOS)
- `icon-60.png` - 60x60px (iOS)
- `icon-72.png` - 72x72px (Android)
- `icon-76.png` - 76x76px (iOS iPad)
- `icon-96.png` - 96x96px (Android)
- `icon-114.png` - 114x114px (iOS Retina)
- `icon-120.png` - 120x120px (iOS)
- `icon-128.png` - 128x128px (Android)
- `icon-144.png` - 144x144px (Android)
- `icon-152.png` - 152x152px (iOS iPad)
- `icon-180.png` - 180x180px (iOS)
- `icon-192.png` - 192x192px (Android)
- `icon-384.png` - 384x384px (Android)
- `icon-512.png` - 512x512px (Android)

### Iconos Maskable (con safe zone)
- `icon-maskable-192.png` - 192x192px
- `icon-maskable-512.png` - 512x512px

### Splash Screens iOS
- `splash-iphone-x.png` - 1125x2436px
- `splash-iphone-13-pro.png` - 1170x2532px
- `splash-iphone-13-pro-max.png` - 1284x2778px
- `splash-iphone-14-pro.png` - 1179x2556px
- `splash-iphone-14-pro-max.png` - 1290x2796px

### Screenshots
- `screenshot-1.png` - 540x720px (narrow)
- `screenshot-2.png` - 540x720px (narrow)

## Opción 1: Usar Herramienta Online

### PWA Asset Generator
```bash
npx @vite-pwa/assets-generator --preset minimal public/icon.svg
```

### Realfavicongenerator
1. Ve a https://realfavicongenerator.net/
2. Sube tu logo (icon.svg o PNG de 512x512)
3. Configura opciones:
   - iOS: Añadir margen, fondo blanco
   - Android: Maskable con safe zone
   - Windows: Color #4f46e5
4. Descarga el paquete
5. Extrae en `/public`

## Opción 2: Usar ImageMagick (CLI)

```bash
# Instalar ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: https://imagemagick.org/script/download.php

# Convertir SVG a PNG base (512x512)
convert icon.svg -resize 512x512 icon-512.png

# Generar todos los tamaños
for size in 16 32 57 60 72 76 96 114 120 128 144 152 180 192 384 512; do
  convert icon-512.png -resize ${size}x${size} icon-${size}.png
done

# Generar maskable (con padding del 20%)
convert icon-512.png -resize 410x410 -gravity center -extent 512x512 -background "#4f46e5" icon-maskable-512.png
convert icon-192.png -resize 154x154 -gravity center -extent 192x192 -background "#4f46e5" icon-maskable-192.png
```

## Opción 3: Usar Figma/Photoshop

1. Abre tu logo en Figma/Photoshop
2. Crea un artboard de 512x512px
3. Centra el logo con margen de 10%
4. Exporta en todos los tamaños necesarios

### Para Maskable Icons:
1. Crea artboard de 512x512px
2. Añade círculo de fondo (#4f46e5)
3. Coloca logo en el centro con safe zone del 20%
4. Exporta como `icon-maskable-512.png`

## Opción 4: Usar Script Node.js

Crea `generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 32, 57, 60, 72, 76, 96, 114, 120, 128, 144, 152, 180, 192, 384, 512];
const inputSvg = 'public/icon.svg';

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(`public/icon-${size}.png`);
    console.log(`✅ Generated icon-${size}.png`);
  }
  
  // Maskable icons (con padding)
  const padding = 0.2; // 20% safe zone
  for (const size of [192, 512]) {
    const innerSize = Math.floor(size * (1 - padding * 2));
    await sharp(inputSvg)
      .resize(innerSize, innerSize)
      .extend({
        top: Math.floor(size * padding),
        bottom: Math.floor(size * padding),
        left: Math.floor(size * padding),
        right: Math.floor(size * padding),
        background: { r: 79, g: 70, b: 229, alpha: 1 }
      })
      .png()
      .toFile(`public/icon-maskable-${size}.png`);
    console.log(`✅ Generated icon-maskable-${size}.png`);
  }
}

generateIcons().then(() => console.log('🎉 All icons generated!'));
```

Ejecutar:
```bash
npm install sharp
node generate-icons.js
```

## Verificar Iconos

### Herramientas de Verificación:
1. **Maskable.app**: https://maskable.app/editor
   - Sube tu icon-maskable-512.png
   - Verifica que se vea bien en todas las formas

2. **PWA Builder**: https://www.pwabuilder.com/
   - Ingresa tu URL
   - Verifica todos los assets

3. **Lighthouse** (Chrome DevTools):
   - Abre DevTools > Lighthouse
   - Run PWA audit
   - Verifica que todos los iconos estén presentes

## Checklist Final

- [ ] Todos los tamaños de iconos generados
- [ ] Iconos maskable con safe zone del 20%
- [ ] Splash screens para iOS
- [ ] Screenshots para app stores
- [ ] Iconos en `/public`
- [ ] manifest.json actualizado con rutas correctas
- [ ] Verificado en Maskable.app
- [ ] Verificado con Lighthouse
- [ ] Probado en Android
- [ ] Probado en iOS

## Notas Importantes

### Maskable Icons
- Deben tener un safe zone del 20% en todos los lados
- El contenido importante debe estar en el círculo central (60% del tamaño)
- Usar fondo sólido (theme_color)

### iOS Splash Screens
- Deben ser específicos para cada tamaño de dispositivo
- Usar fondo blanco o theme_color
- Centrar logo con margen generoso

### Screenshots
- Mínimo 2 screenshots
- Formato narrow (540x720) para móviles
- Mostrar funcionalidades clave de la app

---

Una vez generados todos los iconos, la PWA estará lista para instalarse en Android e iOS. 🚀
