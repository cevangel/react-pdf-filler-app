import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register Service Worker for PWA functionality (disabled in development)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    console.log('Main: Attempting to register service worker...');
    
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Main: SW registered successfully:', registration.scope);
        console.log('Main: SW state:', registration.active ? 'active' : 'installing');
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('Main: SW update found');
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Main: New SW installed, reloading page');
              window.location.reload();
            }
          });
        });
      })
      .catch((error) => {
        console.error('Main: SW registration failed:', error);
      });
  });
} else if (import.meta.env.DEV) {
  console.log('Main: Service worker disabled in development mode');
} else {
  console.log('Main: Service workers not supported');
}
