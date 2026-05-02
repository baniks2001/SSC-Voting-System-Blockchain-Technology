import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// SECURITY DISABLED FOR DEVELOPMENT
console.log('[DEV] All security features disabled - Developer tools allowed');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
