import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import './styles/index.css'
import './styles/theme.css'
import { registerSW } from 'virtual:pwa-register'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

registerSW({
  immediate: true,
  onNeedRefresh() {
    // Aplicar update sin preguntar (evita caché viejo y pantallas rotas)
    window.location.reload()
  },
  onOfflineReady() {
    // no-op
  },
})
