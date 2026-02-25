# 🔌 Integración con tu App Existente

## 📋 Opciones de Integración

### Opción 1: Como Ruta Separada (Recomendado)

Si usas React Router, añade una nueva ruta:

```typescript
// En tu archivo de rutas principal
import { ClassRecordingApp } from './app/ClassRecordingApp';
import { AuthService } from './auth';
import { AudioService } from './audio';

// Crear instancias globales o usar context
const authService = new AuthService();
const audioService = new AudioService();

// Añadir ruta
<Route 
  path="/clases" 
  element={
    <ClassRecordingApp 
      authService={authService}
      audioService={audioService}
    />
  } 
/>
```

### Opción 2: Como Pestaña en tu UI

```typescript
// En tu componente principal con tabs
import { ClassRecordingApp } from './app/ClassRecordingApp';

function MainApp() {
  const [activeTab, setActiveTab] = useState('chat');
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="clases">Clases</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          {/* Tu chat existente */}
        </TabsContent>
        
        <TabsContent value="notas">
          {/* Tus notas existentes */}
        </TabsContent>
        
        <TabsContent value="clases">
          <ClassRecordingApp 
            authService={authService}
            audioService={audioService}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Opción 3: Botón Flotante

```typescript
// Botón flotante que abre modal
import { useState } from 'react';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import { ClassRecordingApp } from './app/ClassRecordingApp';
import { Mic } from 'lucide-react';

function App() {
  const [showClasses, setShowClasses] = useState(false);
  
  return (
    <>
      {/* Tu app existente */}
      
      {/* Botón flotante */}
      <button
        onClick={() => setShowClasses(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600"
      >
        <Mic size={24} />
      </button>
      
      {/* Modal con el sistema de clases */}
      <Dialog open={showClasses} onOpenChange={setShowClasses}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <ClassRecordingApp 
            authService={authService}
            audioService={audioService}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## 🔧 Configuración de Servicios

### Si ya tienes AuthService y AudioService

Perfecto, solo pásalos como props:

```typescript
<ClassRecordingApp 
  authService={tuAuthServiceExistente}
  audioService={tuAudioServiceExistente}
/>
```

### Si no los tienes

Crea instancias en tu componente principal:

```typescript
import { AuthService } from './auth';
import { AudioService } from './audio';

function App() {
  // Crear una sola vez
  const authService = useMemo(() => new AuthService(), []);
  const audioService = useMemo(() => new AudioService(), []);
  
  return (
    <ClassRecordingApp 
      authService={authService}
      audioService={audioService}
    />
  );
}
```

### Usando Context (Mejor para apps grandes)

```typescript
// contexts/ServicesContext.tsx
import { createContext, useContext, useMemo } from 'react';
import { AuthService } from '../auth';
import { AudioService } from '../audio';

interface ServicesContextType {
  authService: AuthService;
  audioService: AudioService;
}

const ServicesContext = createContext<ServicesContextType | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const authService = useMemo(() => new AuthService(), []);
  const audioService = useMemo(() => new AudioService(), []);
  
  return (
    <ServicesContext.Provider value={{ authService, audioService }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) throw new Error('useServices must be used within ServicesProvider');
  return context;
}

// En tu App.tsx
import { ServicesProvider } from './contexts/ServicesContext';

function App() {
  return (
    <ServicesProvider>
      {/* Tu app */}
    </ServicesProvider>
  );
}

// En ClassRecordingApp
import { useServices } from '../contexts/ServicesContext';

export function ClassRecordingAppWrapper() {
  const { authService, audioService } = useServices();
  
  return (
    <ClassRecordingApp 
      authService={authService}
      audioService={audioService}
    />
  );
}
```

## 🎨 Personalización de Estilos

### Cambiar Colores

Los componentes usan Tailwind. Para cambiar colores:

```typescript
// En ClassDetail.tsx, cambia los colores de las pestañas
const tabs = [
  { id: 'summary', label: 'Resumen', icon: FileText, color: 'purple' }, // era 'blue'
  { id: 'keyPoints', label: 'Puntos Clave', icon: Lightbulb, color: 'orange' }, // era 'yellow'
  // ...
];
```

### Usar tus Componentes UI

Reemplaza los componentes básicos con los tuyos:

```typescript
// Antes
<button className="bg-blue-500...">

// Después (usando tu Button component)
import { Button } from '@/components/ui/button';
<Button variant="primary">
```

## 🔗 Integración con tu Sistema de Navegación

### Con React Router

```typescript
// routes.tsx
import { ClassRecordingApp } from './app/ClassRecordingApp';

export const routes = [
  // Tus rutas existentes
  { path: '/', element: <Home /> },
  { path: '/chat', element: <Chat /> },
  
  // Nueva ruta
  { 
    path: '/clases', 
    element: <ClassRecordingAppWrapper /> 
  },
];
```

### Añadir al Menú/Sidebar

```typescript
// En tu Sidebar component
import { BookOpen } from 'lucide-react';

const menuItems = [
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: FileText, label: 'Notas', path: '/notas' },
  { icon: BookOpen, label: 'Clases', path: '/clases' }, // Nuevo
];
```

## 📱 Consideraciones Móviles

### PWA - Añadir al manifest.json

```json
{
  "shortcuts": [
    {
      "name": "Grabar Clase",
      "short_name": "Grabar",
      "description": "Iniciar grabación de clase",
      "url": "/clases?action=record",
      "icons": [{ "src": "/icons/mic.png", "sizes": "192x192" }]
    }
  ]
}
```

### Permisos del Micrófono

Asegúrate de que tu PWA solicite permisos:

```typescript
// En tu service worker o app principal
if ('permissions' in navigator) {
  navigator.permissions.query({ name: 'microphone' as PermissionName })
    .then(result => {
      if (result.state === 'prompt') {
        // Mostrar explicación antes de solicitar
      }
    });
}
```

## 🔐 Autenticación

El sistema usa tu AuthService existente. Asegúrate de que:

```typescript
// Tu AuthService debe tener estos métodos
interface AuthService {
  getCurrentUser(): { uid: string; email?: string; displayName?: string } | null;
  isAuthenticated(): boolean;
}
```

Si tu AuthService es diferente, adapta `ClassRecordingService`:

```typescript
// En src/services/classRecording.ts
private getUserId(): string {
  const user = this.authService.getCurrentUser();
  // Adapta según tu estructura
  return user?.id || user?.uid || 'anonymous';
}
```

## 🌐 Variables de Entorno

Asegúrate de tener en tu `.env`:

```env
VITE_API_URL=http://localhost:3000
```

En producción:
```env
VITE_API_URL=https://tu-backend.herokuapp.com
```

## 🚀 Despliegue

### Frontend

Si despliegas en Vercel/Netlify, añade la variable de entorno:
- Key: `VITE_API_URL`
- Value: URL de tu backend en producción

### Backend

Despliega el backend primero y obtén su URL.

## 📊 Ejemplo Completo

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ServicesProvider } from './contexts/ServicesContext';
import { ClassRecordingAppWrapper } from './app/ClassRecordingAppWrapper';
import { Sidebar } from './components/Sidebar';

function App() {
  return (
    <ServicesProvider>
      <BrowserRouter>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/notas" element={<Notes />} />
              <Route path="/clases" element={<ClassRecordingAppWrapper />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ServicesProvider>
  );
}

export default App;
```

## ✅ Checklist de Integración

- [ ] Servicios (AuthService, AudioService) configurados
- [ ] Ruta o tab añadido
- [ ] Variables de entorno configuradas
- [ ] Backend corriendo y accesible
- [ ] Permisos de micrófono solicitados
- [ ] Estilos adaptados a tu diseño
- [ ] Navegación funcional
- [ ] Probado en móvil
- [ ] Probado en desktop

¡Listo para integrar! 🎉
