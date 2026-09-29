import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register PWA Service Worker for home screen install & offline caching
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('⚡ Unavukadai PWA ServiceWorker active [Scope:', reg.scope, ']');
      })
      .catch((err) => {
        console.warn('PWA ServiceWorker notice:', err.message);
      });
  });
}

